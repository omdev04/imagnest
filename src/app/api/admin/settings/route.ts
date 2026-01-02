import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, logAdminAction, isSuperAdmin } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
import Setting from '@/models/Setting';

const DEFAULT_SETTINGS: any = {
    uploadsEnabled: true,
    signupsEnabled: true,
    maintenanceMode: false,
    maxFileSize: 10 * 1024 * 1024
};

export async function GET(req: NextRequest) {
    const { user, error } = await verifyAdmin(req);
    if (error) return error;

    try {
        await dbConnect();
        const settings = await Setting.find({});

        // Merge DB settings with defaults
        const currentSettings = { ...DEFAULT_SETTINGS };
        settings.forEach(doc => {
            if (doc.key in currentSettings) {
                currentSettings[doc.key] = doc.value;
            }
        });

        return NextResponse.json({ settings: currentSettings });
    } catch (error) {
        console.error('Fetch settings error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { user, error } = await verifyAdmin(req);
    if (error || !user) {
        return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only superadmin can change settings
    if (!isSuperAdmin(user.role)) {
        return NextResponse.json({ error: 'Superadmin access required' }, { status: 403 });
    }

    try {
        await dbConnect();
        const body = await req.json();
        const { setting, value } = body;

        if (setting in DEFAULT_SETTINGS) {
            await Setting.findOneAndUpdate(
                { key: setting },
                {
                    key: setting,
                    value: value,
                    updatedBy: user.id,
                    updatedAt: new Date()
                },
                { upsert: true, new: true }
            );

            // Log action
            await logAdminAction(
                user.id,
                'change_setting',
                'system',
                `Changed ${setting} to ${value}`
            );

            // Return full settings again to sync state
            const settings = await Setting.find({});
            const currentSettings = { ...DEFAULT_SETTINGS };
            settings.forEach(doc => {
                if (doc.key in currentSettings) {
                    currentSettings[doc.key] = doc.value;
                }
            });

            return NextResponse.json({
                success: true,
                settings: currentSettings
            });
        }

        return NextResponse.json({ error: 'Invalid setting' }, { status: 400 });
    } catch (error) {
        console.error('Admin settings update error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
