
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import SystemHealth from '@/models/SystemHealth';

export async function GET(req: Request) {
    // @ts-ignore
    const { user, error } = await verifyAdmin(req);
    if (error) return error;

    await dbConnect();

    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Get memory usage of the NodeJS process
    const memory = process.memoryUsage();

    // Latest stored health record
    const latest = await SystemHealth.findOne().sort({ lastChecked: -1 }).lean();

    // Determine overall status: unhealthy if any critical subsystem is down, degraded if warnings present
    let overallStatus = 'healthy';
    if (latest) {
        const criticalDown = [latest.telegramBotStatus, latest.cdnStatus, latest.dbStatus].some((s) => s === 'down');
        const hasWarning = [latest.telegramBotStatus, latest.cdnStatus, latest.dbStatus, latest.cacheStatus].some((s) => s === 'warning');
        if (criticalDown) overallStatus = 'unhealthy';
        else if (hasWarning) overallStatus = 'degraded';
    } else {
        // If no stored health, mark degraded if DB disconnected
        if (dbStatus !== 'connected') overallStatus = 'degraded';
    }

    return NextResponse.json({
        status: overallStatus,
        timestamp: latest?.lastChecked || new Date(),
        database: dbStatus,
        system: {
            uptime: process.uptime(),
            memory: {
                rss: Math.round(memory.rss / 1024 / 1024) + ' MB',
                heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + ' MB',
                heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + ' MB',
            },
            version: process.version
        },
        // expose latest detailed statuses if available
        healthDetails: latest || null
    });
}
