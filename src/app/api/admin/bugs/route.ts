import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import BugReport from "@/models/BugReport";
import User from "@/models/User";

// GET: Fetch all bug reports
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const reports = await BugReport.find({})
            .populate('userId', 'name email username')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, reports });
    } catch (error) {
        console.error("Fetch Bugs Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Update bug status
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { reportId, status, priority } = body;

        await dbConnect();

        const updateData: any = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;

        const report = await BugReport.findByIdAndUpdate(
            reportId,
            updateData,
            { new: true }
        );

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error("Update Bug Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
