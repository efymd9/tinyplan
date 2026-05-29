import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'tinyplan-dev-secret-change-in-production'
);

const SESSION_COOKIE = 'tinyplan-session';

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
 * Helper to get current user from cookies (for server components).
 * Uses Next.js 16 async cookies() API.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (process.env.DEV_BYPASS_AUTH === 'true') return DEV_USER;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie?.value) return null;

  return verifySessionToken(sessionCookie.value);
}
