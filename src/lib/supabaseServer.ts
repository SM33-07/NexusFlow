import { NextRequest } from 'next/server';
import { demoProfiles } from './demoData';
import type { Profile } from './types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseEnv = Boolean(url && anonKey && serviceKey);

export function jsonHeaders(prefer?: string) {
  return {
    apikey: serviceKey || anonKey || '',
    Authorization: `Bearer ${serviceKey || anonKey || ''}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
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
  if (!url || !anonKey) throw new Error('Supabase Auth env vars are missing.');
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Invalid login.');
  }

  return response.json() as Promise<{ access_token: string; refresh_token: string; user: { id: string; email?: string } }>;
}

export async function getProfileById(id: string) {
  const rows = await supabaseRest<Profile[]>(`profiles?id=eq.${id}&select=*`);
  return rows[0] ?? null;
}

export async function getCurrentProfile(request: NextRequest): Promise<Profile | null> {
  const demoRole = request.cookies.get('nexus-demo-role')?.value;
  if (!hasSupabaseEnv && demoRole) {
    return demoProfiles.find((profile) => profile.role === demoRole) ?? demoProfiles[0];
  }

  const userId = request.cookies.get('nexus-user-id')?.value;
  if (!userId || !hasSupabaseEnv) return null;
  return getProfileById(userId);
}
