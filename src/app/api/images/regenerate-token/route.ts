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

        const { imageId } = await req.json();

        if (!imageId) {
            return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
        }

        await dbConnect();

        // Get user to check plan
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user has access to private links
        if (user.plan === 'free') {
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

        // Image must be private to regenerate token
        if (image.privacy !== 'private') {
            return NextResponse.json({
                error: 'Can only regenerate token for private images'
            }, { status: 400 });
        }

        // Generate new access token
        const accessToken = crypto.randomBytes(32).toString('hex');
        const updatedImage = await Image.findByIdAndUpdate(
            imageId,
            {
                accessToken: accessToken,
                tokenGeneratedAt: new Date()
            },
            { new: true }
        );

        if (!updatedImage) {
            return NextResponse.json({ error: 'Failed to update image' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            accessToken: updatedImage.accessToken,
            tokenGeneratedAt: updatedImage.tokenGeneratedAt
        });
    } catch (error) {
        console.error('Error regenerating token:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
