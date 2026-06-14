import { SignJWT, jwtVerify } from 'jose';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cache } from 'react';
import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { normalizeEmail } from '@/lib/auth/email';

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'tinyplan-dev-secret-change-in-production'
);

function shouldSecureCookie(): boolean {
  if (process.env.COOKIE_SECURE !== undefined) {
    return process.env.COOKIE_SECURE === 'true';
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  return appUrl.startsWith('https://');
}

export function sessionCookieOptions(maxAge: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: shouldSecureCookie(),
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  };
}

export interface AuthUser {
  id: string;
  email: string;
  subscriptionStatus: 'free' | 'trial' | 'active' | 'cancelled';
}

const DEV_USER: AuthUser = {
  id: 'dev-user-00000000-0000-0000-0000-000000000000',
  email: 'dev@tinyplan.local',
  subscriptionStatus: 'active',
};

/**
 * Local development bypass. Honored ONLY outside production so a stray
 * DEV_BYPASS_AUTH=true can never disable real auth in a production deploy.
 */
const DEV_BYPASS =
  process.env.DEV_BYPASS_AUTH === 'true' &&
  process.env.NODE_ENV !== 'production';

/**
 * Whether real (Clerk) authentication is configured. When false (local dev or a
 * key-less build) the app runs without Clerk and relies on the dev bypass.
 */
export const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Generate a magic link token (JWT signed, 15 min expiry).
 */
export async function createMagicLinkToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .setSubject(email)
    .sign(SECRET);
}

/**
 * Verify a magic link token, return the email it was issued for.
 */
export async function verifyMagicLinkToken(
  token: string
): Promise<{ email: string }> {
  const { payload } = await jwtVerify(token, SECRET);
  const email = payload.sub ?? (payload.email as string | undefined);
  if (!email) {
    throw new Error('Invalid magic link token: no email found');
  }
  return { email };
}

/**
 * Create a session token (JWT, 30 day expiry) for an authenticated user.
 */
export async function createSessionToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    subscriptionStatus: user.subscriptionStatus,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .setSubject(user.id)
    .sign(SECRET);
}

/**
 * Verify a session token and return the AuthUser payload, or null if invalid.
 */
export async function verifySessionToken(
  token: string
): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const id = payload.sub ?? (payload.id as string | undefined);
    const email = payload.email as string | undefined;
    const subscriptionStatus = payload.subscriptionStatus as
      | AuthUser['subscriptionStatus']
      | undefined;

    if (!id || !email) return null;

    return {
      id,
      email,
      subscriptionStatus: subscriptionStatus ?? 'free',
    };
  } catch {
    return null;
  }
}

/**
 * Resolve the current authenticated user for Server Components, Route Handlers,
 * and Server Actions. Memoized per-request with React `cache`.
 *
 * Production derives identity from Clerk: the Clerk session yields an email,
 * which is mapped onto our local `users` row (creating one on first sign-in).
 * That row owns the UUID every other table references, so the rest of the app
 * is unchanged. In local development, the dev bypass returns a fixed user.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  // Local development bypass (never active in production).
  if (DEV_BYPASS) return DEV_USER;

  // No production auth source configured.
  if (!clerkEnabled) return null;

  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  const email = normalizeEmail(
    clerkUser?.primaryEmailAddress?.emailAddress ??
      clerkUser?.emailAddresses?.[0]?.emailAddress
  );
  if (!email) return null;

  const db = getDb();
  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      subscriptionStatus:
        (existing.subscription_status as AuthUser['subscriptionStatus']) ||
        'free',
    };
  }

  // First sign-in: provision the local user record keyed by the Clerk email.
  const id = uuid();
  const now = Math.floor(Date.now() / 1000);
  db.insert(users)
    .values({
      id,
      email,
      name: clerkUser?.fullName ?? null,
      subscription_status: 'free',
      created_at: now,
      updated_at: now,
    })
    .run();

  return { id, email, subscriptionStatus: 'free' };
});
