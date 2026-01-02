import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, logAdminAction } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    const { user, error } = await verifyAdmin(req);
    if (error) return error;

    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const query: any = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-apiKeys')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            User.countDocuments(query)
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin users fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const { user, error } = await verifyAdmin(req);
    if (error || !user) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();

        const body = await req.json();
        const { userId, action, reason, plan } = body;

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let updateData: any = {};
        let logDetails = '';

        switch (action) {
            case 'warn':
                const currentWarnings = targetUser.warnings || 0;
                const newWarnings = currentWarnings + 1;

                if (newWarnings >= 3) {
                    updateData = {
                        warnings: newWarnings,
                        status: 'banned',
                        banReason: 'Automatic ban: Exceeded 3 warning limit',
                        bannedAt: new Date(),
                        bannedBy: user.id
                    };
                    logDetails = `Warned user: ${targetUser.username} (Total: ${newWarnings}). Auto-banned for exceeding limits.`;
                } else {
                    updateData = { $inc: { warnings: 1 } };
                    logDetails = `Warned user: ${targetUser.username} (Total: ${newWarnings})`;
                }
                break;

            case 'suspend':
                const suspendedUntil = new Date();
                suspendedUntil.setDate(suspendedUntil.getDate() + 7);
                updateData = {
                    status: 'suspended',
                    suspendedUntil,
                    $inc: { strikes: 1 }
                };
                logDetails = `Suspended user: ${targetUser.username}`;
                break;

            case 'ban':
                updateData = {
                    status: 'banned',
                    banReason: reason,
                    bannedAt: new Date(),
                    bannedBy: user.id
                };
                logDetails = `Banned user: ${targetUser.username}. Reason: ${reason}`;
                break;

            case 'unban':
                updateData = {
                    status: 'active',
                    banReason: null,
                    bannedAt: null,
                    bannedBy: null,
                    warnings: 0 // Reset warnings so they don't get auto-banned again immediately on next warning
                };
                logDetails = `Unbanned user: ${targetUser.username}`;
                break;

            case 'changePlan':
                updateData = { plan };
                logDetails = `Changed plan for ${targetUser.username} to ${plan}`;
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await User.findByIdAndUpdate(userId, updateData);

        await logAdminAction(user.id, action, 'user', logDetails, userId);

        return NextResponse.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Admin user update error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
