import { NextRequest, NextResponse } from 'next/server';
import { getCurrentProfile } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  return NextResponse.json({ profile });
}
