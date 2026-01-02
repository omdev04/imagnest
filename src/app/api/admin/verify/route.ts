import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
    const { user, error } = await verifyAdmin(req);

    if (error) return error;

    return NextResponse.json({
        isAdmin: true,
        user
    });
}
