import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getBotStats } from "@/lib/telegram/bot-manager";

/**
 * GET /api/admin/telegram-bots
 * Get health status and statistics for all Telegram bots
 */
export async function GET() {
    try {
        await dbConnect();

        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;
        const user = await User.findById(userId);

        if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        // Get bot statistics
        const stats = getBotStats();

        return NextResponse.json({
            success: true,
            stats,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error("Error fetching bot stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch bot statistics" },
            { status: 500 }
        );
    }
}
