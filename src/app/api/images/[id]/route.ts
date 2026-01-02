import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/apiAuth";
import { checkRateLimit } from "@/lib/rateLimiter";
import dbConnect from "@/lib/mongodb";
import Image from "@/models/Image";
import User from "@/models/User";
import { deleteMessage } from "@/lib/telegram/bot";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check rate limit
        const rateLimit = checkRateLimit(auth.userId, auth.plan);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: "Too Many Requests",
                    message: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.`
                },
                { status: 429 }
            );
        }

        await dbConnect();
        const { id } = await params;

        // Find the image
        const image = await Image.findById(id);
        if (!image) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        // Check if user owns this image
        if (image.userId.toString() !== auth.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete from Telegram first
        if (image.telegramChatId && image.telegramMessageId) {
            try {
                // This will try to delete via the Bot Manager, which handles multi-bot scenarios
                const deletedFromTelegram = await deleteMessage(image.telegramChatId, image.telegramMessageId);
                if (deletedFromTelegram) {
                    console.log(`✅ Deleted Telegram message ${image.telegramMessageId} from chat ${image.telegramChatId}`);
                } else {
                    console.warn(`⚠️ Failed to delete Telegram message ${image.telegramMessageId}`);
                }
            } catch (tgError) {
                console.error("Failed to delete from Telegram:", tgError);
                // We proceed with DB deletion even if Telegram fails, to keep UI consistent
            }
        }

        // Delete the image from DB
        await Image.findByIdAndDelete(id);

        // Update user's usage stats
        await User.findByIdAndUpdate(auth.userId, {
            $inc: {
                'usage.totalImages': -1,
                'usage.storageUsed': -image.size
            }
        });

        return NextResponse.json({
            success: true,
            message: "Image deleted successfully"
        });

    } catch (error) {
        console.error("Delete Image API Error:", error);
        return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check rate limit
        const rateLimit = checkRateLimit(auth.userId, auth.plan);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: "Too Many Requests",
                    message: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.`
                },
                { status: 429 }
            );
        }

        await dbConnect();
        const { id } = await params;

        // Find the image
        const image = await Image.findById(id);
        if (!image) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        // Check if user owns this image
        if (image.userId.toString() !== auth.userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            image: {
                _id: image._id,
                filename: image.originalName,
                size: image.size,
                url: `${req.nextUrl.origin}/cdn/${image._id}`,
                views: image.accessCount,
                createdAt: image.createdAt,
                privacy: image.privacy
            }
        });

    } catch (error) {
        console.error("Get Image API Error:", error);
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }
}
