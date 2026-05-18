import { NextRequest, NextResponse } from 'next/server';
import { demoGoals, demoQuarterlyUpdates } from '@/lib/demoData';
import { getCurrentProfile, hasSupabaseEnv, supabaseRest } from '@/lib/supabaseServer';
import type { GoalRecord, QuarterlyUpdate } from '@/lib/types';

function attachLatestUpdates(goals: GoalRecord[], updates: QuarterlyUpdate[]) {
  return goals.map((goal) => {
    const latest = updates
      .filter((update) => update.goal_id === goal.id)
      .sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')))[0] ?? null;
    return { ...goal, latest_update: latest };
  });
}

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  if (!hasSupabaseEnv) return NextResponse.json({ goals: attachLatestUpdates(demoGoals, demoQuarterlyUpdates) });

  const params = new URL(request.url).searchParams;
  const scope = params.get('scope') ?? 'mine';
  let ownerFilter = `owner_id=eq.${profile.id}`;

  if (scope === 'team' && profile.role === 'manager') {
    const reports = await supabaseRest<{ id: string }[]>(`profiles?manager_id=eq.${profile.id}&select=id`);
    const ids = reports.map((item) => item.id).join(',');
    ownerFilter = ids ? `owner_id=in.(${ids})` : `owner_id=eq.${profile.id}`;
  }

  if (scope === 'team' && profile.role === 'admin') {
    ownerFilter = 'owner_id=not.is.null';
  }

  const goals = await supabaseRest<GoalRecord[]>(
    `goals?${ownerFilter}&select=*&order=is_hub.desc,created_at.asc`
  );
  const ids = goals.map((goal) => goal.id).join(',');
  const updates = ids
    ? await supabaseRest<QuarterlyUpdate[]>(`quarterly_updates?goal_id=in.(${ids})&select=*&order=created_at.desc`)
    : [];
  return NextResponse.json({ goals: attachLatestUpdates(goals, updates) });
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const body = await request.json();
  if (!hasSupabaseEnv) {
    return NextResponse.json({
      goal: {
        id: crypto.randomUUID(),
        owner_id: profile.id,
        parent_goal_id: body.parent_goal_id ?? null,
        shared_goal_id: body.shared_goal_id ?? null,
        primary_owner_id: body.primary_owner_id ?? null,
        title: body.title,
        description: body.description ?? '',
        category: body.category ?? 'Product Innovation',
        uom_type: body.uom_type,
        target_value: body.target_value,
        baseline_value: body.baseline_value ?? null,
        weightage: body.weightage,
        status: 'draft',
        progress: body.progress ?? 0,
        position_x: body.position_x,
        position_y: body.position_y,
        is_hub: false,
        is_shared: Boolean(body.shared_goal_id),
        locked: false,
      },
    });
  }

  const rows = await supabaseRest<GoalRecord[]>('goals', {
    method: 'POST',
    body: JSON.stringify({
      owner_id: profile.id,
      parent_goal_id: body.parent_goal_id ?? null,
      shared_goal_id: body.shared_goal_id ?? null,
      primary_owner_id: body.primary_owner_id ?? null,
      title: body.title,
      description: body.description ?? '',
      category: body.category ?? 'Product Innovation',
      uom_type: body.uom_type,
      target_value: body.target_value,
      baseline_value: body.baseline_value ?? null,
      weightage: body.weightage,
      status: 'draft',
      progress: body.progress ?? 0,
      position_x: body.position_x,
      position_y: body.position_y,
      is_hub: false,
      is_shared: Boolean(body.shared_goal_id),
      locked: false,
    }),
  });
  return NextResponse.json({ goal: rows[0] });
}

export async function PATCH(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Goal id is required.' }, { status: 400 });
  if (!hasSupabaseEnv) return NextResponse.json({ goal: body });

  const [before] = await supabaseRest<GoalRecord[]>(`goals?id=eq.${body.id}&select=*`);

  const patch = {
    ...(body.status ? { status: body.status, locked: body.status === 'approved' } : {}),
    ...(typeof body.locked === 'boolean' ? { locked: body.locked } : {}),
    ...(body.title ? { title: body.title } : {}),
    ...(typeof body.description === 'string' ? { description: body.description } : {}),
    ...(body.target_value ? { target_value: body.target_value } : {}),
    ...(body.uom_type ? { uom_type: body.uom_type } : {}),
    ...(typeof body.weightage === 'number' ? { weightage: body.weightage } : {}),
    ...(typeof body.baseline_value === 'number' ? { baseline_value: body.baseline_value } : {}),
    ...(typeof body.progress === 'number' ? { progress: body.progress } : {}),
    ...(typeof body.position_x === 'number' ? { position_x: body.position_x } : {}),
    ...(typeof body.position_y === 'number' ? { position_y: body.position_y } : {}),
    updated_at: new Date().toISOString(),
  };

  const rows = await supabaseRest<GoalRecord[]>(`goals?id=eq.${body.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  });

  if (rows[0]) {
    await supabaseRest('audit_logs', {
      method: 'POST',
      body: JSON.stringify({
        actor_id: profile.id,
        action: body.status === 'approved' ? 'APPROVE_GOAL' : body.status === 'returned' ? 'RETURN_GOAL' : body.locked === false ? 'UNLOCK_GOAL' : 'UPDATE_GOAL',
        entity_type: 'goal',
        entity_id: body.id,
        metadata: { before, after: rows[0] },
      }),
    }).catch(() => undefined);

    if (body.status === 'approved' || body.status === 'returned') {
      await supabaseRest('notification_logs', {
        method: 'POST',
        body: JSON.stringify({
          recipient_id: rows[0].owner_id,
          channel: 'email',
          event_type: body.status === 'approved' ? 'goal_approved' : 'goal_returned',
          title: body.status === 'approved' ? 'Goal approved' : 'Goal returned for rework',
          message: `${rows[0].title} was ${body.status === 'approved' ? 'approved and locked' : 'returned by your manager'}.`,
          deep_link: '/',
          status: process.env.SMTP_HOST || process.env.RESEND_API_KEY ? 'sent' : 'queued',
        }),
      }).catch(() => undefined);
    }
  }

  return NextResponse.json({ goal: rows[0] });
}

export async function DELETE(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Goal id is required.' }, { status: 400 });
  if (!hasSupabaseEnv) return NextResponse.json({ ok: true });

  await supabaseRest(`goals?id=eq.${id}`, { method: 'DELETE' });
  return NextResponse.json({ ok: true });
}
