import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import crypto from 'crypto';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id).select('apiKeys');

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ keys: user.apiKeys || [] });
    } catch (error) {
        console.error("API Keys Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Generate a new key (32 bytes = 64 hex chars of entropy)
        const key = 'fg_live_' + crypto.randomBytes(32).toString('hex');

        // Add to user
        await User.findByIdAndUpdate(session.user.id, {
            $push: { apiKeys: key }
        });

        return NextResponse.json({ key });
    } catch (error) {
        console.error("Create API Key Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { key } = await req.json();

        if (!key) {
            return NextResponse.json({ error: "Key is required" }, { status: 400 });
        }

        await dbConnect();

        // Remove the key
        await User.findByIdAndUpdate(session.user.id, {
            $pull: { apiKeys: key }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete API Key Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
