# Rate Limiting Configuration

## Overview

Rate limiting is implemented to prevent abuse, protect against attacks, and ensure fair usage of the TradeMaster API.

## Implementation

- **Type**: In-memory rate limiting (upgrade to Redis for production multi-instance)
- **File**: `src/lib/rate-limiter.ts`
- **Middleware**: `src/middleware.ts`
- **Client Feedback**: All auth forms and API consumers

## Limits by Endpoint

| Endpoint | Method | Limit | Window | Purpose |
|----------|--------|-------|--------|---------|
| `/api/auth/register` | POST | 3 | 1 hour | Prevent spam accounts |
| `/api/auth/login` | POST | 5 | 15 min | Prevent brute force |
| `/api/auth/forgot-password` | POST | 3 | 1 hour | Prevent abuse |
| `/api/accounts` | POST | 10 | 1 hour | Prevent account spam |
| `/api/accounts` | GET | 100 | 1 min | Normal usage |
| `/api/trades` | POST | 50 | 1 min | Normal trading activity |
| `/api/playbooks` | GET/POST | 20 | 1 min | Strategy creation |
| `/api/journal` | POST | 30 | 1 min | Journal entries |
| `/api/risk-profiles` | POST | 10 | 1 min | Risk management |
| `/api/psychology` | POST | 30 | 1 min | Psychology logs |
| `/api/ai-analysis` | POST | 20 | 1 min | AI analysis |
| `/api/*` | ALL | 1000 | 1 hour | General API protection |

## Rate Limit Keys

Rate limits are tracked by:

1. **Authenticated Users**: `userId` from session
2. **Anonymous Requests**: IP address (`x-forwarded-for` or `x-real-ip`)

```
Key Format: {action}:{identifier}
Example: login:192.168.1.1
Example: create_account:user_abc123
```

## Response Headers

Every API response includes rate limit headers:

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Limit` | Maximum requests allowed | `100` |
| `X-RateLimit-Remaining` | Requests remaining in window | `95` |
| `X-RateLimit-Reset` | When the limit resets (ISO 8601) | `2024-04-15T12:00:00.000Z` |

## HTTP 429 Response

When rate limit is exceeded:

```json
{
  "error": "Too many requests",
  "retryAfter": 120,
  "message": "تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً"
}
```

### Response Headers on 429

```
HTTP/1.1 429 Too Many Requests
Retry-After: 120
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1713182400000
```

## Client-Side Handling

### Example (React/Next.js)

```typescript
const handleSubmit = async (data: FormData) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.status === 429) {
      const error = await response.json();
      // Display user-friendly message
      setError(`Too many attempts. Please wait ${error.retryAfter} seconds.`);
      return;
    }

    // ... normal processing
  } catch (error) {
    // Handle network errors
  }
};
```

### Using Headers

```typescript
// Check remaining requests
const remaining = response.headers.get('X-RateLimit-Remaining');
const resetAt = response.headers.get('X-RateLimit-Reset');

if (parseInt(remaining) < 10) {
  console.warn('Approaching rate limit');
}
```

## Security Considerations

### Why Rate Limit?

1. **Prevent Brute Force**: Login attempts are limited
2. **Prevent Account Spam**: Registration limited per IP
3. **Prevent API Abuse**: General endpoints protected
4. **Fair Usage**: Ensure all users get equal access
5. **Cost Control**: Limit expensive operations (AI analysis)

### Email Verification Bypass

Since email verification is currently disabled, rate limiting serves as the primary protection against:
- Fake account creation
- Automated bot attacks
- Resource exhaustion

## Production Recommendations

### Upgrade to Redis

For multi-instance deployments, upgrade to Redis-based rate limiting:

```typescript
// Example Redis implementation
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function rateLimit(key: string, limit: number, window: number) {
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  return {
    success: current <= limit,
    remaining: Math.max(0, limit - current),
    resetAt: Date.now() + (window * 1000),
  };
}
```

### Environment Variables

```env
# Redis (for production)
REDIS_URL=redis://localhost:6379

# Rate limit settings
RATE_LIMIT_STRICT=true  # Enable strict mode
RATE_LIMIT_WHITELIST=127.0.0.1  # Whitelisted IPs
```

## Monitoring

### Log Format

Rate limit events are logged:

```
[API_ERR] POST /api/auth/login - Rate limited: IP=192.168.1.1
```

### Metrics to Track

- Requests per endpoint
- 429 responses per hour
- Top blocked IPs
- Average requests per user

## Testing Rate Limits

### Manual Testing

```bash
# Test login rate limit (5 attempts / 15 min)
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

### Expected Behavior

```
# Requests 1-5: 401 Unauthorized (invalid credentials)
# Request 6+: 429 Too Many Requests
```

## Troubleshooting

### Issue: Legitimate users getting blocked

**Solution**: 
- Increase limit for authenticated users
- Implement IP whitelist for known users
- Add captcha for unauthenticated requests

### Issue: Rate limits not working

**Check**:
1. Middleware is loaded (check `src/middleware.ts`)
2. Rate limiter imports are correct
3. Store is initialized (check console for errors)

### Issue: Memory leak with rate limiter

**Solution**:
- Store cleanup runs every hour automatically
- For high traffic, consider Redis instead

## Changelog

| Date | Change |
|------|--------|
| 2024-04-15 | Initial implementation |
| 2024-04-15 | Added middleware for global protection |
| 2024-04-15 | Added client-side feedback |
| 2024-04-15 | Added documentation |

---

**Questions?** Contact the development team or check the source code at:
- `src/lib/rate-limiter.ts`
- `src/middleware.ts`
