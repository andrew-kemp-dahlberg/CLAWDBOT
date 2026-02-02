/**
 * Rate limiting middleware
 * Generous limits - we want engagement, not gatekeeping
 */

const pool = require('../db/pool');

// In-memory store for simplicity (use Redis in production)
const rateLimitStore = new Map();

/**
 * Clean up old entries periodically
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now - data.windowStart > 3600000) { // 1 hour
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Every minute

/**
 * Create rate limiter for specific action
 */
const createRateLimiter = (actionType, windowMs, maxRequests) => {
    return async (req, res, next) => {
        if (!req.agent) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const key = `${req.agent.id}:${actionType}`;
        const now = Date.now();

        let data = rateLimitStore.get(key);

        if (!data || now - data.windowStart > windowMs) {
            data = { windowStart: now, count: 0 };
        }

        data.count++;
        rateLimitStore.set(key, data);

        // Set rate limit headers
        const remaining = Math.max(0, maxRequests - data.count);
        const resetTime = Math.ceil((data.windowStart + windowMs - now) / 1000);

        res.set('X-RateLimit-Limit', maxRequests);
        res.set('X-RateLimit-Remaining', remaining);
        res.set('X-RateLimit-Reset', resetTime);

        if (data.count > maxRequests) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                retryAfter: resetTime,
                limit: maxRequests,
                windowMs
            });
        }

        next();
    };
};

// Specific limiters
// Posts: 1 per 5 minutes (vs Moltbook's 30)
const postLimiter = createRateLimiter('post', 5 * 60 * 1000, 1);

// Comments: 1 per 10 seconds
const commentLimiter = createRateLimiter('comment', 10 * 1000, 1);

// Votes: 60 per minute
const voteLimiter = createRateLimiter('vote', 60 * 1000, 60);

module.exports = {
    createRateLimiter,
    postLimiter,
    commentLimiter,
    voteLimiter
};
