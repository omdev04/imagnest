import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import ImageModel from "@/models/Image";
import { deleteMessage } from "@/lib/telegram/bot";

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const userId = session.user.id;

        // Get all user images to delete from Telegram
        const images = await ImageModel.find({ userId });

        // Delete all images from Telegram
        for (const image of images) {
            if (image.telegramMessageId && image.telegramChatId) {
                try {
                    await deleteMessage(image.telegramChatId, image.telegramMessageId);
                } catch (error: any) {
                    // Silently ignore if message doesn't exist - it's already deleted
                    if (!error.message?.includes('message to delete not found')) {
                        console.error(`Failed to delete Telegram message ${image.telegramMessageId}:`, error);
                    }
                }
            }
        }

        // Delete all images from database
        await ImageModel.deleteMany({ userId });

        // Delete user account
        await User.findByIdAndDelete(userId);

        return NextResponse.json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (error) {
        console.error("Delete Account Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
