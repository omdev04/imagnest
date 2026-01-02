/**
 * In-memory rate limiter for API requests
 * Tracks requests per API key/user with time-based windows
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// Store rate limit data in memory (for production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limits per plan (requests per hour)
const RATE_LIMITS = {
    free: 100,
    pro: 1000,
    enterprise: Infinity
};

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (API key or user ID)
 * @param plan - User's plan (free, pro, enterprise)
 * @returns { allowed: boolean, limit: number, remaining: number, resetTime: number }
 */
export function checkRateLimit(identifier: string, plan: 'free' | 'pro' | 'enterprise' = 'free') {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour in milliseconds
    const limit = RATE_LIMITS[plan];

    // Get or create entry
    let entry = rateLimitStore.get(identifier);

    // If no entry or window expired, create new entry
    if (!entry || now > entry.resetTime) {
        entry = {
            count: 0,
            resetTime: now + windowMs
        };
        rateLimitStore.set(identifier, entry);
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    const allowed = entry.count <= limit;
    const remaining = Math.max(0, limit - entry.count);

    return {
        allowed,
        limit,
        remaining,
        resetTime: entry.resetTime,
        resetIn: Math.ceil((entry.resetTime - now) / 1000) // seconds
    };
}

/**
 * Clean up expired entries (run periodically)
 */
export function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

// Cleanup every 10 minutes
setInterval(cleanupExpiredEntries, 10 * 60 * 1000);
