import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Image from '@/models/Image';
import AbuseReport from '@/models/AbuseReport';
import SystemHealth from '@/models/SystemHealth';

// Helper to check system health
async function checkSystemHealth(latestHealth: any) {
    const isStale = !latestHealth || (Date.now() - new Date(latestHealth.lastChecked).getTime() > 5 * 60 * 1000);

    if (!isStale) {
        return latestHealth;
    }

    // Perform Checks
    const status = {
        telegramBotStatus: 'down',
        telegramChannelStatus: 'down',
        cdnStatus: 'up', // Self is up
        dbStatus: 'down',
        cacheStatus: 'up', // In-memory
        uptime: process.uptime(),
        lastChecked: new Date(),
        errorMessages: [] as string[]
    };

    // 1. DB Check
    if (mongoose.connection.readyState === 1) {
        status.dbStatus = 'up';
    } else {
        status.errorMessages.push(`DB State: ${mongoose.connection.readyState}`);
    }

    // 2. Telegram Bot Check
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) throw new Error("No Bot Token");

        const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
        const data = await res.json();

        if (data.ok) {
            status.telegramBotStatus = 'up';
            // Assuming channel is OK if bot is OK for now, unless we do a specific check
            status.telegramChannelStatus = 'up';
        } else {
            status.errorMessages.push(`Telegram Bot: ${data.description}`);
        }
    } catch (error: any) {
        status.errorMessages.push(`Telegram Bot Error: ${error.message}`);
    }

    // Create new health record
    return await SystemHealth.create(status);
}

export async function GET(req: NextRequest) {
    const { user, error } = await verifyAdmin(req);
    if (error) return error;

    try {
        await dbConnect();

        const [
            totalUsers,
            activeUsers,
            bannedUsers,
            suspendedUsers,
            totalImages,
            todayImages,
            pendingReports,
            deletedImages,
            latestHealth
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: 'active' }),
            User.countDocuments({ status: 'banned' }),
            User.countDocuments({ status: 'suspended' }),
            Image.countDocuments(),
            Image.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            AbuseReport.countDocuments({ status: 'pending' }),
            Image.countDocuments({ moderationStatus: 'removed' }),
            SystemHealth.findOne().sort({ lastChecked: -1 })
        ]);

        // Check Health (refresh if needed)
        const systemHealth = await checkSystemHealth(latestHealth);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const uploadsByDay = await Image.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return NextResponse.json({
            stats: {
                totalUsers,
                activeUsers,
                bannedUsers,
                suspendedUsers,
                totalImages,
                todayImages,
                pendingReports,
                deletedImages
            },
            charts: {
                uploadsByDay
            },
            systemHealth
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
