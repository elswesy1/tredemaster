/**
 * Rate Limiting Middleware for TradeMaster
 * حماية API من الاستخدام المفرط
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (for production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string; // Custom error message
}

// Default rate limit configurations
const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
};

// Strict rate limit for authentication endpoints
const authConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
};

// Get client IP from request
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Check rate limit
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
): { success: boolean; remaining: number; resetTime: number } {
  const ip = getClientIP(request);
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  
  // Clean up expired entries
  for (const [storeKey, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(storeKey);
    }
  }
  
  // Get or create entry
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  // Increment count
  entry.count++;
  
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  return {
    success: entry.count <= config.maxRequests,
    remaining,
    resetTime: entry.resetTime,
  };
}

// Rate limit middleware
export function rateLimit(config: RateLimitConfig = defaultConfig) {
  return async function rateLimitMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    const result = checkRateLimit(request, config);
    
    // Set rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.resetTime.toString());
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: config.message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        { status: 429, headers }
      );
    }
    
    return null; // Continue to next middleware
  };
}

// Export pre-configured rate limiters
export const generalRateLimit = rateLimit(defaultConfig);
export const authRateLimit = rateLimit(authConfig);

// Higher-order function to wrap API handlers with rate limiting
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = defaultConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const middleware = rateLimit(config);
    const rateLimitResponse = await middleware(request);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    return handler(request);
  };
}
