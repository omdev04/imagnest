import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Image from "@/models/Image";
import { getTelegramFileLink, getFileLinkFromBot } from "@/lib/telegram/bot";
import { existsInCache, getReadStream, writeToCache } from "@/lib/cache/disk";
import sharp from "sharp";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { searchParams } = req.nextUrl;
        const size = searchParams.get("size") || "original"; // small, medium, original

        console.log(`[CDN] Request for image: ${id}, size: ${size}`);

        // 1. DB Lookup
        await dbConnect();
        const image = await Image.findById(id);

        if (!image) {
            console.log(`[CDN] Image not found in DB: ${id}`);
            return new NextResponse("Image not found", { status: 404 });
        }

        console.log(`[CDN] Found image: ${image.originalName}, fileId: ${image.telegramFileId}, bot: ${image.uploadedByBot || 'not-set'}`);

        // 2. Security Check - If private, check auth or token
        const session = await getServerSession(authOptions);
        // @ts-ignore
        const currentUserId = session?.user?.id;
        const isOwner = currentUserId && image.userId.toString() === currentUserId;

        if (image.privacy === 'private') {
            const token = searchParams.get("token");

            // Check if valid access token is provided
            if (token && token === image.accessToken) {
                // Valid token - allow access
            } else {
                // No token or invalid token - check session
                if (!isOwner) {
                    console.log(`[CDN] Access denied to private image: ${id}`);
                    return new NextResponse("Forbidden - Invalid or missing access token", { status: 403 });
                }
            }
        }

        // 2.5. Track Views (increment only if not the owner and only for original size to avoid counting thumbnails multiple times)
        if (!isOwner && size === 'original') {
            try {
                await Image.findByIdAndUpdate(id, { $inc: { views: 1, accessCount: 1 } });
                console.log(`[CDN] View tracked for image: ${id}`);
            } catch (error) {
                console.error(`[CDN] Failed to track view:`, error);
                // Don't fail the request if view tracking fails
            }
        }

        // 3. Cache Check
        if (existsInCache(id, size)) {
            console.log(`[CDN] Cache HIT for ${id}`);
            const stream = getReadStream(id, size);
            const headers = new Headers();
            headers.set("Content-Type", image.mimeType);
            headers.set("Cache-Control", "public, max-age=31536000, immutable");
            headers.set("X-Cache", "HIT");

            // @ts-ignore
            return new NextResponse(stream, { headers });
        }

        console.log(`[CDN] Cache MISS, fetching from Telegram...`);

        // 4. Fetch from Telegram (Optimized)
        let fileLink: string | null = null;

        if (image.uploadedByBot) {
            // Optimization: We know exactly which bot has the file
            console.log(`[CDN] Trying specific bot: ${image.uploadedByBot}`);
            fileLink = await getFileLinkFromBot(image.uploadedByBot, image.telegramFileId);
        } else {
            // Legacy/Fallback: Search all bots
            console.log(`[CDN] No bot specified, searching all bots...`);
            fileLink = await getTelegramFileLink(image.telegramFileId);
        }

        if (!fileLink) {
            console.log(`[CDN] Failed to get file link from Telegram for fileId: ${image.telegramFileId}`);
            return new NextResponse("Upstream Error", { status: 502 });
        }

        console.log(`[CDN] Got file link from Telegram, downloading...`);

        const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
        console.log(`[CDN] Downloaded ${response.data.byteLength} bytes from Telegram`);

        const buffer = Buffer.from(response.data);

        let outputBuffer = buffer;

        // 5. Processing (Resize)
        if (size === 'small' || size === 'medium') {
            const width = size === 'small' ? 400 : 800;
            console.log(`[CDN] Resizing image to width: ${width}`);
            outputBuffer = await sharp(buffer)
                .resize(width)
                .toBuffer();
            console.log(`[CDN] Resized to ${outputBuffer.byteLength} bytes`);
        }

        // 6. Write to Cache
        console.log(`[CDN] Writing to cache...`);
        await writeToCache(id, outputBuffer, size);
        console.log(`[CDN] Cache write complete`);

        // 7. Serve
        const headers = new Headers();
        // If resized, mime might change? usually sharp keeps format or defaults jpeg/png. 
        // We assume same mime for now or detect.
        headers.set("Content-Type", image.mimeType);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        headers.set("X-Cache", "MISS");

        console.log(`[CDN] Serving image, size: ${outputBuffer.byteLength} bytes`);
        return new NextResponse(outputBuffer, { headers });

    } catch (error) {
        console.error("[CDN] Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
