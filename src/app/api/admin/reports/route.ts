import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, logAdminAction } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import AbuseReport from '@/models/AbuseReport';
import Image from '@/models/Image';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    const { user, error } = await verifyAdmin(req);
    if (error || !user) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status') || 'pending';

        const query: any = { status };

        const [reports, total] = await Promise.all([
            AbuseReport.find(query)
                .populate('imageId', 'originalName')
                .populate('reportedBy', 'username email')
                .populate('resolvedBy', 'username')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            AbuseReport.countDocuments(query)
        ]);

        return NextResponse.json({
            reports,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin reports fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { user, error } = await verifyAdmin(req);
    if (error || !user) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();

        const body = await req.json();
        const { reportId, action, userAction } = body;

        const report = await AbuseReport.findById(reportId).populate('imageId');
        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        let logDetails = '';

        if (action === 'approve') {
            // Delete the image
            await Image.findByIdAndUpdate(report.imageId, {
                moderationStatus: 'removed',
                moderatedBy: user.id,
                moderatedAt: new Date()
            });

            // Handle user action
            if (userAction === 'warn') {
                await User.findByIdAndUpdate((report.imageId as any).userId, {
                    $inc: { warnings: 1 }
                });
                logDetails = 'Approved report, deleted image, warned user';
            } else if (userAction === 'suspend') {
                await User.findByIdAndUpdate((report.imageId as any).userId, {
                    status: 'suspended',
                    $inc: { strikes: 1 }
                });
                logDetails = 'Approved report, deleted image, suspended user';
            } else if (userAction === 'ban') {
                await User.findByIdAndUpdate((report.imageId as any).userId, {
                    status: 'banned',
                    banReason: `Abuse report: ${report.reason}`,
                    bannedAt: new Date(),
                    bannedBy: user.id
                });
                logDetails = 'Approved report, deleted image, banned user';
            }

            await AbuseReport.findByIdAndUpdate(reportId, {
                status: 'approved',
                resolvedBy: user.id,
                resolution: logDetails,
                resolvedAt: new Date()
            });
        } else if (action === 'ignore') {
            await AbuseReport.findByIdAndUpdate(reportId, {
                status: 'ignored',
                resolvedBy: user.id,
                resolution: 'Report ignored by admin',
                resolvedAt: new Date()
            });
            logDetails = 'Ignored abuse report';
        }

        // Log action
        await logAdminAction(
            user.id,
            `resolve_report_${action}`,
            'report',
            logDetails,
            reportId
        );

        return NextResponse.json({ success: true, message: 'Report resolved successfully' });
    } catch (error) {
        console.error('Admin report resolve error:', error);
        return NextResponse.json({ error: 'Failed to resolve report' }, { status: 500 });
    }
}
