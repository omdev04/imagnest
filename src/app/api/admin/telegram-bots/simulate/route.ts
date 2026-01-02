import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import { telegramBotManager } from "@/lib/telegram/bot";

export async function POST(req: NextRequest) {
    // 1. Verify Admin Access
    const { user, error } = await verifyAdmin(req);
    if (error) return error;

    try {
        const body = await req.json();
        const { botName, active } = body;

        if (!botName || typeof active !== 'boolean') {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        // 2. Perform Simulation Action
        // Use the singleton instance
        telegramBotManager.simulateFailure(botName, active);

        return NextResponse.json({
            success: true,
            message: `Simulation ${active ? 'activated' : 'deactivated'} for ${botName}`,
            botName,
            isActive: active
        });

    } catch (error) {
        console.error("Simulation API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
