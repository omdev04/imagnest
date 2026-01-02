import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { plan } = body;

        // Verify valid plan
        if (!['free', 'pro', 'enterprise'].includes(plan)) {
            return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
        }

        await dbConnect();

        // @ts-ignore
        const userId = session.user.id;

        // Mock Payment / Upgrade Logic
        // In a real app, you would integrate Stripe/LemonSqueezy here

        await User.findByIdAndUpdate(userId, {
            plan: plan,
            updatedAt: new Date()
        });

        return NextResponse.json({
            success: true,
            message: `Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`,
            plan
        });

    } catch (error) {
        console.error("Plan Change Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
