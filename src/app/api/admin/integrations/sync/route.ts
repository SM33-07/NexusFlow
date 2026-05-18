import { NextRequest, NextResponse } from 'next/server';
import { demoProfiles } from '@/lib/demoData';
import { getCurrentProfile, hasSupabaseEnv, supabaseRest } from '@/lib/supabaseServer';
import type { Profile } from '@/lib/types';

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });

  const profiles = hasSupabaseEnv
    ? await supabaseRest<Profile[]>('profiles?select=id,full_name,email,role,job_title,department,manager_id,session_version')
    : demoProfiles;

  const mappedUsers = profiles.map((item) => ({
    email: item.email,
    displayName: item.full_name,
    entraManagerAttribute: item.manager_id ?? 'none',
    group: item.role === 'admin' ? 'Nexus-HR-Admins' : item.role === 'manager' ? 'Nexus-Managers' : 'Nexus-Employees',
    mappedRole: item.role,
  }));

  return NextResponse.json({
    provider: 'Microsoft Entra ID',
    mode: process.env.MICROSOFT_ENTRA_CLIENT_ID ? 'graph-ready' : 'demo-preview',
    tenantId: process.env.MICROSOFT_ENTRA_TENANT_ID ?? 'demo-tenant',
    syncedAt: new Date().toISOString(),
    mappedUsers,
  });
}
