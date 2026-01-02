import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/apiAuth";
import { checkRateLimit } from "@/lib/rateLimiter";
import dbConnect from "@/lib/mongodb";
import Image from "@/models/Image";

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticateRequest(req);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check rate limit
        const rateLimit = checkRateLimit(auth.userId, auth.plan);

        // Always include rate limit headers
        const headers = {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        };

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: "Too Many Requests",
                    message: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.`,
                    limit: rateLimit.limit,
                    resetIn: rateLimit.resetIn
                },
                {
                    status: 429,
                    headers
                }
            );
        }

        const { searchParams } = req.nextUrl;
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
        const skip = (page - 1) * limit;

        await dbConnect();

        // Fetch images
        const images = await Image.find({ userId: auth.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Image.countDocuments({ userId: auth.userId });

        return NextResponse.json({
            success: true,
            images: images.map(img => ({
                id: img._id.toString(),
                name: img.originalName,
                filename: img.originalName, // Keep for backwards compatibility
                size: img.size,
                url: `/api/cdn/${img._id}`,
                views: img.accessCount,
                createdAt: img.createdAt,
                privacy: img.privacy,
                accessToken: img.accessToken
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, { headers });

    } catch (error) {
        console.error("List Images Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

