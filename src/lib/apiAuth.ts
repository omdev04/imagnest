import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

export interface AuthResult {
    userId: string;
    plan: 'free' | 'pro' | 'enterprise';
}

/**
 * Authenticates the API request using either:
 * 1. API Key (x-api-key header)
 * 2. Session (NextAuth session)
 * 
 * Also checks if user is banned/suspended
 * 
 * @returns AuthResult with userId and plan if authenticated, null otherwise
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthResult | null> {
    // 1. Check for API Key first (for external tools/developers)
    const apiKey = req.headers.get('x-api-key');
    if (apiKey) {
        await dbConnect();
        const user = await User.findOne({ apiKeys: apiKey }).select('_id plan status');
        if (user) {
            // Block banned or suspended users
            if (user.status === 'banned' || user.status === 'suspended') {
                return null; // Banned/suspended users cannot use API
            }

            return {
                userId: user._id.toString(),
                plan: user.plan || 'free'
            };
        }
        return null; // Invalid API key
    }

    // 2. Fall back to session authentication (for web UI)
    const session = await getServerSession(authOptions);
    if (session?.user) {
        await dbConnect();
        // @ts-ignore
        const userId = session.user.id;
        const user = await User.findById(userId).select('plan status');

        if (user) {
            // Block banned or suspended users
            if (user.status === 'banned' || user.status === 'suspended') {
                return null; // Banned/suspended users cannot use API
            }

            return {
                userId,
                plan: user?.plan || 'free'
            };
        }
    }

    return null; // No authentication provided
}
