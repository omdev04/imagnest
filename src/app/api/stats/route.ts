import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Image from "@/models/Image";
import { PLANS } from "@/config/plans";

export async function GET(req: NextRequest) {
    try {
        // Authenticate user
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;

        // Connect to database
        await dbConnect();

        // Fetch user data
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get plan limits
        const planConfig = PLANS[user.plan as keyof typeof PLANS];
        const maxImages = planConfig.limits.maxImages;

        // Get actual image count from database
        const actualImageCount = await Image.countDocuments({ userId });

        // Fetch recent 5 images
        const recentImages = await Image.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('originalName size mimeType createdAt');

        // Format recent images
        const formattedImages = recentImages.map(img => ({
            id: img._id.toString(),
            name: img.originalName,
            size: formatFileSize(img.size),
            time: formatTimeAgo(img.createdAt),
            type: img.mimeType
        }));

        // Return stats
        return NextResponse.json({
            totalFiles: actualImageCount,
            plan: user.plan,
            maxImages: maxImages,
            recentImages: formattedImages
        });

    } catch (error) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return "Just now";
}
