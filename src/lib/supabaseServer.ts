import { NextRequest } from 'next/server';
import { verifyPassword, verifySessionToken } from './auth';
import { demoProfiles } from './demoData';
import type { Profile } from './types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseEnv = Boolean(url && serviceKey);

export function jsonHeaders(prefer?: string) {
  return {
    apikey: serviceKey || anonKey || '',
    Authorization: `Bearer ${serviceKey || anonKey || ''}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function encodeFilterValue(value: string) {
  return encodeURIComponent(value).replace(/\./g, '%2E');
}

export async function supabaseRest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!hasSupabaseEnv) throw new Error('Supabase environment variables are not configured.');
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { ...jsonHeaders(init.method === 'POST' ? 'return=representation' : undefined), ...(init.headers || {}) },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function signInWithPassword(email: string, password: string) {
  const rows = await supabaseRest<Profile[]>(`profiles?email=eq.${encodeFilterValue(email.toLowerCase().trim())}&select=*`);
  const profile = rows[0];
  if (!profile || !verifyPassword(password, profile.password_hash)) {
    throw new Error('Invalid email or password.');
  }
  const { password_hash: _passwordHash, ...publicProfile } = profile;
  return publicProfile;
}

export async function getProfileById(id: string) {
  const rows = await supabaseRest<Profile[]>(
    `profiles?id=eq.${encodeFilterValue(id)}&select=id,full_name,email,role,job_title,department,manager_id,session_version`
  );
  return rows[0] ?? null;
}

export async function getCurrentProfile(request: NextRequest): Promise<Profile | null> {
  const demoRole = request.cookies.get('nexus-demo-role')?.value;
  if (!hasSupabaseEnv && demoRole) {
    return demoProfiles.find((profile) => profile.role === demoRole) ?? demoProfiles[0];
  }

  if (!hasSupabaseEnv) return null;
  const session = verifySessionToken(request.cookies.get('nexus-session')?.value);
  if (!session) return null;

  const profile = await getProfileById(session.userId);
  if (!profile || profile.session_version !== session.sessionVersion) return null;
  return profile;
}
