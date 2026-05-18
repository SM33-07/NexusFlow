import { NextResponse } from 'next/server';
import { createSessionToken, sessionCookieOptions } from '@/lib/auth';
import { demoCredentials, demoProfiles } from '@/lib/demoData';
import { hasSupabaseEnv, signInWithPassword } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    if (!hasSupabaseEnv) {
      const credential = demoCredentials.find((item) => item.email === email);
      if (!credential || credential.password !== password) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }

      const profile = demoProfiles.find((item) => item.email === email) ?? demoProfiles[0];
      const response = NextResponse.json({ profile, demo: true });
      response.cookies.set('nexus-demo-role', profile.role, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
      response.cookies.set('nexus-user-id', profile.id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
      return response;
    }

    const profile = await signInWithPassword(email, password);

    const response = NextResponse.json({ profile });
    response.cookies.set('nexus-session', createSessionToken(profile), sessionCookieOptions);
    response.cookies.set('nexus-user-id', profile.id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set('nexus-role', profile.role, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Login failed.' }, { status: 401 });
  }
}
