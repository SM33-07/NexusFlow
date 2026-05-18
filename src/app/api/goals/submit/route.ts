import { NextRequest, NextResponse } from 'next/server';
import { getCurrentProfile, hasSupabaseEnv, supabaseRest } from '@/lib/supabaseServer';
import type { GoalRecord } from '@/lib/types';

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  if (!hasSupabaseEnv) return NextResponse.json({ ok: true });

  const { ids } = await request.json();
  const idList = Array.isArray(ids) ? ids.join(',') : '';
  if (!idList) return NextResponse.json({ error: 'No goal ids provided.' }, { status: 400 });

  const goals = await supabaseRest<GoalRecord[]>(`goals?id=in.(${idList})&owner_id=eq.${profile.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ status: 'submitted', updated_at: new Date().toISOString() }),
  });

  if (profile.manager_id) {
    await supabaseRest('notification_logs', {
      method: 'POST',
      body: JSON.stringify({
        recipient_id: profile.manager_id,
        channel: 'teams',
        event_type: 'goal_submitted',
        title: 'Goal sheet submitted',
        message: `${profile.full_name} submitted goals for approval.`,
        deep_link: `/manager?employee=${profile.id}`,
        status: process.env.TEAMS_WEBHOOK_URL ? 'sent' : 'queued',
      }),
    }).catch(() => undefined);
  }

  return NextResponse.json({ goals });
}
