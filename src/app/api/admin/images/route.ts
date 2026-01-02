import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, logAdminAction } from '@/lib/adminAuth';
import dbConnect from '@/lib/mongodb';
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
        const status = searchParams.get('status');

        const query: any = {};
        if (status) query.moderationStatus = status;

        const [images, total] = await Promise.all([
            Image.find(query)
                .populate('userId', 'username email')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Image.countDocuments(query)
        ]);

        return NextResponse.json({
            images,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin images fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { user, error } = await verifyAdmin(req);
    if (error || !user) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const imageId = searchParams.get('imageId');

        if (!imageId) {
            return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
        }

        const image = await Image.findById(imageId);
        if (!image) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        // 1. Delete from Telegram
        if (image.telegramChatId && image.telegramMessageId) {
            const { deleteMessage } = await import('@/lib/telegram/bot');
            await deleteMessage(image.telegramChatId, image.telegramMessageId);
        }

        // 2. Update User (Add Warning & Check Ban)
        const targetUser = await User.findById(image.userId);
        if (targetUser) {
            const currentWarnings = targetUser.warnings || 0;
            const newWarnings = currentWarnings + 1;

            let updateData: any = {
                $inc: {
                    'usage.totalImages': -1
                },
                warnings: newWarnings
            };

            // Auto-ban logic
            if (newWarnings >= 3 && targetUser.status !== 'banned') {
                updateData.status = 'banned';
                updateData.banReason = 'Account Suspended: Multiple images removed due to content violation.';
                updateData.bannedAt = new Date();
                updateData.bannedBy = user.id;
            }

            await User.findByIdAndUpdate(image.userId, updateData);
        }

        // 3. Delete from Database
        await Image.findByIdAndDelete(imageId);

        await logAdminAction(
            user.id,
            'delete_image',
            'image',
            `Deleted image: ${image.originalName}`,
            imageId
        );

        return NextResponse.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Admin image delete error:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}


