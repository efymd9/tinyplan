import { NextRequest, NextResponse } from 'next/server';

type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitOptions = {
  /** Max accepted requests in the rolling window. */
  limit: number;
  /** Window size in seconds. */
  windowSeconds: number;
  /** Namespace so unrelated endpoints do not share a bucket. */
  namespace: string;
  /** Optional user/session key from the request body/cookie when available. */
  key?: string | null;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function clientAddress(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';

  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('fly-client-ip') ||
    'unknown'
  );
}

function cleanup(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  const now = Date.now();
  cleanup(now);

  const identity = options.key?.trim() || clientAddress(req);
  const bucketKey = `${options.namespace}:${identity}`;
  const windowMs = options.windowSeconds * 1000;

  const current = buckets.get(bucketKey);
  const bucket = current && current.resetAt > now
    ? current
    : { count: 0, resetAt: now + windowMs };

  bucket.count += 1;
  buckets.set(bucketKey, bucket);

  if (bucket.count <= options.limit) return null;

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(options.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(bucket.resetAt / 1000)),
      },
    }
  );
}
