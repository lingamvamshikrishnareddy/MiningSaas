import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Global rate limiter - applies to all API routes
 */
export const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests, please try again later.' },
  },
  skip: (req: Request) => req.method === 'OPTIONS',
});

/**
 * Strict rate limiter for auth endpoints (20 attempts per 15 min)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many authentication attempts, please try again in 15 minutes.' },
  },
});

/**
 * Rate limiter for password reset (5 per hour)
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many password reset requests, please try again in 1 hour.' },
  },
});

/**
 * Rate limiter for telemetry ingestion (500 per minute)
 */
export const telemetryRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Telemetry rate limit exceeded.' },
  },
});
