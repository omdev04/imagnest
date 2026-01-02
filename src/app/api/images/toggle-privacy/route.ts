import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Image from '@/models/Image';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { imageId, isPrivate } = await req.json();

        if (!imageId || typeof isPrivate !== 'boolean') {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        await dbConnect();

        // Get user to check plan
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user has access to private links (Pro or Enterprise only)
        if (isPrivate && user.plan === 'free') {
            return NextResponse.json({
                error: 'Private links are only available for Pro and Enterprise users',
                requiresUpgrade: true
            }, { status: 403 });
        }

        // Find the image and verify ownership
        const image = await Image.findById(imageId);
        if (!image) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        if (image.userId.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update privacy status
        const privacy = isPrivate ? 'private' : 'public';
        const updateData: any = { privacy };

        // Generate access token if making private
        if (isPrivate) {
            const accessToken = crypto.randomBytes(32).toString('hex');
            updateData.accessToken = accessToken;
            updateData.tokenGeneratedAt = new Date();
        } else {
            // Remove token if making public
            updateData.accessToken = null;
            updateData.tokenGeneratedAt = null;
        }

        const updatedImage = await Image.findByIdAndUpdate(
            imageId,
            updateData,
            { new: true }
        );

        if (!updatedImage) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            image: {
                id: updatedImage._id,
                privacy: updatedImage.privacy,
                accessToken: updatedImage.accessToken,
                tokenGeneratedAt: updatedImage.tokenGeneratedAt
            }
        });
    } catch (error) {
        console.error('Error toggling privacy:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
