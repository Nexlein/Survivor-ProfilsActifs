import rateLimit from 'express-rate-limit';

// Throttles credential-guessing / registration-spam attempts. Keyed by IP
// (express-rate-limit's default), which is enough here since these routes
// are unauthenticated and have no other stable identity to key on.
//
// login and register each get their own instance (own counter) rather than
// sharing one: express-rate-limit's in-memory store is keyed by IP alone,
// so reusing a single middleware across two routes would let a burst on one
// endpoint exhaust the shared quota and lock a client out of the other.
const authRateLimitOptions = {
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again later.' },
} as const;

export const loginRateLimiter = rateLimit(authRateLimitOptions);
export const registerRateLimiter = rateLimit(authRateLimitOptions);
