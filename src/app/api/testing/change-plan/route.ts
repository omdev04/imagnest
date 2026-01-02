import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { plan } = await req.json();

        if (!['free', 'pro', 'enterprise'].includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { plan: plan },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            plan: user.plan,
            message: `Plan changed to ${plan}`
        });
    } catch (error) {
        console.error('Error changing plan:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
