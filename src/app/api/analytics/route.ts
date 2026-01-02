import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/apiAuth";
import dbConnect from "@/lib/mongodb";
import Image from "@/models/Image";

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user has Pro or Enterprise plan
        if (auth.plan !== 'pro' && auth.plan !== 'enterprise') {
            return NextResponse.json({
                error: "Analytics is only available for Pro and Enterprise users",
                requiresUpgrade: true
            }, { status: 403 });
        }

        await dbConnect();

        // Get time range from query params (default: last 30 days)
        const { searchParams } = req.nextUrl;
        const days = parseInt(searchParams.get('days') || '30');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Fetch user's images
        const images = await Image.find({
            userId: auth.userId,
            createdAt: { $gte: startDate }
        }).select('createdAt views size mimeType');

        const allImages = await Image.find({ userId: auth.userId })
            .select('views size mimeType createdAt');

        // Calculate metrics
        const totalImages = allImages.length;
        const totalViews = allImages.reduce((sum, img) => sum + (img.views || 0), 0);
        const totalSize = allImages.reduce((sum, img) => sum + (img.size || 0), 0);
        const recentImages = images.length;

        // Group images by date for timeline
        const imagesByDate: { [key: string]: number } = {};
        const viewsByDate: { [key: string]: number } = {};

        images.forEach(img => {
            const date = img.createdAt.toISOString().split('T')[0];
            imagesByDate[date] = (imagesByDate[date] || 0) + 1;
            viewsByDate[date] = (viewsByDate[date] || 0) + (img.views || 0);
        });

        // Group by mime type
        const imagesByType: { [key: string]: number } = {};
        allImages.forEach(img => {
            const type = img.mimeType?.split('/')[0] || 'unknown';
            imagesByType[type] = (imagesByType[type] || 0) + 1;
        });

        // Calculate daily averages
        const avgUploadsPerDay = recentImages / days;
        const avgViewsPerImage = totalImages > 0 ? totalViews / totalImages : 0;

        // Top performing images
        const topImages = allImages
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 10)
            .map(img => ({
                id: img._id,
                views: img.views || 0,
                createdAt: img.createdAt,
                size: img.size
            }));

        // Generate timeline data (fill missing dates with 0)
        const timeline = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            timeline.push({
                date: dateStr,
                uploads: imagesByDate[dateStr] || 0,
                views: viewsByDate[dateStr] || 0
            });
        }

        return NextResponse.json({
            success: true,
            analytics: {
                overview: {
                    totalImages,
                    totalViews,
                    totalSize,
                    avgUploadsPerDay: Math.round(avgUploadsPerDay * 100) / 100,
                    avgViewsPerImage: Math.round(avgViewsPerImage * 100) / 100,
                },
                timeline,
                imagesByType,
                topImages,
                dateRange: {
                    start: startDate.toISOString(),
                    end: new Date().toISOString(),
                    days
                }
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
