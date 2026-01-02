
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, isSuperAdmin, logAdminAction } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import AdminLog from '@/models/AdminLog';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    const { error } = await verifyAdmin(req);
    if (error) return error;

    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const exportType = searchParams.get('export');

        // Export all logs as CSV
        if (exportType === 'csv') {
            const logsAll = await AdminLog.find()
                .populate('adminId', 'username email')
                .sort({ timestamp: -1 })
                .lean();

            const escape = (v: any) => {
                if (v === null || v === undefined) return '';
                const s = String(v);
                if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                    return '"' + s.replace(/"/g, '""') + '"';
                }
                return s;
            };

            const header = ['timestamp', 'admin', 'action', 'targetType', 'targetId', 'details', 'ip'];
            const rows = logsAll.map((l: any) => {
                const admin = l.adminId ? `${l.adminId.username} <${l.adminId.email || ''}>` : 'system';
                return [new Date(l.timestamp).toISOString(), admin, l.action, l.targetType || '', l.targetId || '', l.details || '', l.ip || ''].map(escape).join(',');
            });

            const csv = [header.join(','), ...rows].join('\n');

            return new NextResponse(csv, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="admin-logs-${new Date().toISOString().slice(0,10)}.csv"`
                }
            });
        }

        const [logs, total] = await Promise.all([
            AdminLog.find()
                .populate('adminId', 'username email')
                .sort({ timestamp: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            AdminLog.countDocuments()
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { user, error } = await verifyAdmin(req);
    if (error || !user) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only superadmin can delete all logs
    if (!isSuperAdmin(user.role)) {
        return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 });
    }

    try {
        await dbConnect();
        await AdminLog.deleteMany({});

        await logAdminAction(user.id, 'delete_all_logs', 'system', 'Deleted all admin logs');

        return NextResponse.json({ success: true, message: 'All logs deleted' });
    } catch (err) {
        console.error('Failed to delete logs', err);
        return NextResponse.json({ error: 'Failed to delete logs' }, { status: 500 });
    }
}
