import { NextResponse } from 'next/server';
import { demoProfiles } from '@/lib/demoData';
import { getProfileById, hasSupabaseEnv, signInWithPassword } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    if (!hasSupabaseEnv) {
      const profile = demoProfiles.find((item) => item.email === email) ?? demoProfiles[0];
      const response = NextResponse.json({ profile, demo: true });
      response.cookies.set('nexus-demo-role', profile.role, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
      response.cookies.set('nexus-user-id', profile.id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
      return response;
    }

    const session = await signInWithPassword(email, password);
    const profile = await getProfileById(session.user.id);
    if (!profile) return NextResponse.json({ error: 'Profile row missing for this auth user.' }, { status: 403 });

    const response = NextResponse.json({ profile });
    response.cookies.set('nexus-access-token', session.access_token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 });
    response.cookies.set('nexus-refresh-token', session.refresh_token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set('nexus-user-id', profile.id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set('nexus-role', profile.role, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Login failed.' }, { status: 401 });
  }
}
