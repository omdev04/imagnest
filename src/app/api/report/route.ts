import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import AbuseReport from "@/models/AbuseReport";
import Image from "@/models/Image";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        // Authentication is optional for reports now

        await dbConnect();
        const body = await req.json();
        const { imageId, reason, description } = body;

        if (!imageId || !reason) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify image exists
        const image = await Image.findById(imageId);
        if (!image) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        // Create Report
        const reportData: any = {
            imageId,
            reason,
            description,
            status: 'pending'
        };

        if (session?.user) {
            // @ts-ignore
            reportData.reportedBy = session.user.id;
        }

        await AbuseReport.create(reportData);

        return NextResponse.json({ success: true, message: "Report submitted successfully" });
    } catch (error) {
        console.error("Submit report error:", error);
        return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
    }
}
