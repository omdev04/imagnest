import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import AdminLog from '@/models/AdminLog';

export interface AdminUser {
    id: string;
    email?: string;
    username: string;
    role: 'admin' | 'superadmin';
}

/**
 * Verify admin access and return admin user
 */
export async function verifyAdmin(req: NextRequest): Promise<{ user: AdminUser | null; error: NextResponse | null }> {
    try {
        const session = await getServerSession(authOptions);
        console.log('Verify Admin: Session:', session?.user?.email);

        if (!session?.user?.email && !(session?.user as any)?.id) {
            console.log('Verify Admin: No session user found');
            return {
                user: null,
                error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            };
        }

        await dbConnect();

        let user;
        const userId = (session?.user as any)?.id;

        if (userId) {
            user = await User.findById(userId);
        }

        if (!user && session?.user?.email) {
            user = await User.findOne({ email: session.user.email });
        }

        console.log('Verify Admin: DB User Found:', !!user, 'Role:', user?.role);

        if (!user) {
            return {
                user: null,
                error: NextResponse.json({ error: 'User not found' }, { status: 404 })
            };
        }

        // Check if user has admin role
        if (user.role !== 'admin' && user.role !== 'superadmin') {
            console.log('Verify Admin: Role mismatch');
            return {
                user: null,
                error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
            };
        }

        // Check if admin account is active
        if (user.status !== 'active') {
            return {
                user: null,
                error: NextResponse.json({ error: 'Admin account is not active' }, { status: 403 })
            };
        }

        return {
            user: {
                id: user._id.toString(),
                email: user.email,
                username: user.username,
                role: user.role
            },
            error: null
        };
    } catch (error) {
        console.error('Admin verification error:', error);
        return {
            user: null,
            error: NextResponse.json({ error: 'Internal server error' }, { status: 500 })
        };
    }
}

/**
 * Log admin action
 */
export async function logAdminAction(
    adminId: string,
    action: string,
    targetType: 'user' | 'image' | 'report' | 'system',
    details: string,
    targetId?: string,
    ip?: string
) {
    try {
        await dbConnect();

        await AdminLog.create({
            adminId,
            action,
            targetType,
            targetId,
            details,
            ip,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
}

/**
 * Check if user is superadmin
 */
export function isSuperAdmin(role: string): boolean {
    return role === 'superadmin';
}
