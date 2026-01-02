type RateLimitConfig = {
    limit: number;      // Max requests
    windowMs: number;   // Time window in milliseconds
};

interface RateLimitStore {
    tokens: number;
    lastRefill: number;
}

// In-memory store (Note: In a multi-server setup, use Redis instead)
const storage = new Map<string, RateLimitStore>();

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
    free: { limit: 10, windowMs: 60 * 1000 },       // 10 req/min
    pro: { limit: 60, windowMs: 60 * 1000 },        // 60 req/min
    enterprise: { limit: 120, windowMs: 60 * 1000 }, // 120 req/min
    default: { limit: 20, windowMs: 60 * 1000 }      // Fallback
};

/**
 * Checks if a user has exceeded their rate limit.
 * Uses a Token Bucket algorithm for smooth rate limiting.
 */
export function checkRateLimit(identifier: string, plan: string = 'free'): { allowed: boolean; retryAfter?: number } {
    const config = RATE_LIMITS[plan] || RATE_LIMITS.default;
    const now = Date.now();

    // Get or initialize storage
    let record = storage.get(identifier);
    if (!record) {
        record = { tokens: config.limit, lastRefill: now };
        storage.set(identifier, record);
    }

    // Refill tokens based on time passed
    const timePassed = now - record.lastRefill;
    const tokensToAdd = Math.floor(timePassed * (config.limit / config.windowMs));

    if (tokensToAdd > 0) {
        record.tokens = Math.min(config.limit, record.tokens + tokensToAdd);
        record.lastRefill = now;
    }

    // Check if enough tokens
    if (record.tokens >= 1) {
        record.tokens -= 1;
        return { allowed: true };
    } else {
        // Calculate time until next token
        const msPerToken = config.windowMs / config.limit;
        const retryAfter = Math.ceil((msPerToken - (timePassed % msPerToken)) / 1000);
        return { allowed: false, retryAfter };
    }
}
