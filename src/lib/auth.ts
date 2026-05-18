import { createHmac, pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import type { Profile } from './types';

type SessionPayload = {
  userId: string;
  role: Profile['role'];
  sessionVersion: number;
  exp: number;
};

const SESSION_TTL_SECONDS = 60 * 60 * 8;

function secret() {
  return process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'nexus-local-dev-secret';
}

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionToken(profile: Profile & { session_version?: number }) {
  const payload: SessionPayload = {
    userId: profile.id,
    role: profile.role,
    sessionVersion: profile.session_version ?? 1,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = base64Url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.userId || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyPassword(password: string, storedHash?: string | null) {
  if (!storedHash) return false;
  const [scheme, iterationsRaw, salt, hash] = storedHash.split(':');
  if (scheme !== 'pbkdf2' || !iterationsRaw || !salt || !hash) return false;

  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations < 10000) return false;

  const computed = pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex');
  const expectedBuffer = Buffer.from(hash, 'hex');
  const actualBuffer = Buffer.from(computed, 'hex');
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
