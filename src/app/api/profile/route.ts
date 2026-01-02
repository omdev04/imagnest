import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id).select('username email avatar plan status warnings');

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get image count from Image model
        const Image = (await import('@/models/Image')).default;
        const totalImages = await Image.countDocuments({ userId: session.user.id });

        return NextResponse.json({
            username: user.username,
            email: user.email || '',
            avatar: user.avatar || '',
            plan: user.plan || 'free',
            status: user.status || 'active',
            warnings: user.warnings || 0,
            usage: {
                totalImages: totalImages,
                storageUsed: 0 // You can calculate this if needed
            }
        });
    } catch (error) {
        console.error("Profile GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { username, email } = await req.json();

        if (!username || username.trim().length < 2) {
            return NextResponse.json({ error: "Username must be at least 2 characters" }, { status: 400 });
        }

        await dbConnect();

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            {
                username: username.trim(),
                email: email?.trim() || undefined
            },
            { new: true, runValidators: true }
        ).select('username email avatar');

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                username: updatedUser.username,
                email: updatedUser.email || '',
                avatar: updatedUser.avatar || ''
            }
        });
    } catch (error: any) {
        console.error("Profile Update Error:", error);

        if (error.code === 11000) {
            return NextResponse.json({ error: "Username or email already exists" }, { status: 400 });
        }

        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
