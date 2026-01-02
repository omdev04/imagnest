
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Image from "@/models/Image";
import User from "@/models/User";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        // Find Image and populate uploader
        const image = await Image.findById(id).populate('userId', 'username avatar');

        if (!image) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        const session = await getServerSession(authOptions);
        // @ts-ignore
        const currentUserId = session?.user?.id;
        const isOwner = currentUserId && image.userId._id.toString() === currentUserId;

        // Privacy Check
        if (image.privacy === 'private') {
            const isValidToken = token && token === image.accessToken;
            if (!isOwner && !isValidToken) {
                return NextResponse.json({ error: "Private image" }, { status: 403 });
            }
        }

        // Increment Views (only if not owner? usually counts all views or unique views. Simple increment for now)
        if (!isOwner) {
            await Image.findByIdAndUpdate(id, { $inc: { views: 1, accessCount: 1 } });
        }

        // prepare response
        // Using /cdn/[id] for the image URL. Pass token if needed.
        let imageUrl = `/api/cdn/${image._id}`;
        // If private and we have a token (or are owner?), append token to CDN url so the <img> tag can load it?
        // CDN route checks token from query param.
        if (image.privacy === 'private') {
            // If accessing via token, append it.
            if (token) {
                imageUrl += `?token=${token}`;
            } else if (isOwner && image.accessToken) {
                // If owner, maybe append token to share? Or rely on session cookie for CDN?
                // CDN route checks session cookie too. So owner doesn't need token in URL.
            }
        }

        const responseData = {
            id: image._id,
            url: imageUrl,
            name: image.originalName,
            mimeType: image.mimeType,
            size: image.size,
            views: image.views || image.accessCount || 0, // Fallback
            createdAt: image.createdAt,
            isOwner: !!isOwner,
            uploader: {
                username: (image.userId as any).username,
                avatar: (image.userId as any).avatar
            }
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error("View API Error:", error);
        return NextResponse.json({ error: "Failed to fetch image data" }, { status: 500 });
    }
}
