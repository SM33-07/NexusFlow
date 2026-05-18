import { NextRequest, NextResponse } from 'next/server';
import { demoProfiles } from '@/lib/demoData';
import { getCurrentProfile, hasSupabaseEnv, supabaseRest } from '@/lib/supabaseServer';
import type { GoalRecord, Profile } from '@/lib/types';

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    return NextResponse.json({ error: 'Admin or manager access required.' }, { status: 403 });
  }

  const body = await request.json();
  const sharedGoalId = crypto.randomUUID();

  if (!hasSupabaseEnv) {
    return NextResponse.json({
      goals: demoProfiles
        .filter((item) => item.role === 'employee')
        .map((employee) => ({ ...body, id: crypto.randomUUID(), owner_id: employee.id, shared_goal_id: sharedGoalId, primary_owner_id: profile.id })),
    });
  }

  const recipients = profile.role === 'admin'
    ? await supabaseRest<Profile[]>("profiles?role=eq.employee&select=*")
    : await supabaseRest<Profile[]>(`profiles?manager_id=eq.${profile.id}&select=*`);

  const rows = recipients.map((employee, index) => ({
    owner_id: employee.id,
    parent_goal_id: null,
    shared_goal_id: sharedGoalId,
    primary_owner_id: profile.id,
    title: body.title,
    description: body.description ?? 'Departmental KPI pushed by manager/admin. Recipient may adjust weightage only.',
    category: body.category ?? 'Shared Department KPI',
    uom_type: body.uom_type ?? 'Min (Higher is better)',
    target_value: body.target_value,
    baseline_value: body.baseline_value ?? null,
    weightage: body.weightage ?? 10,
    status: 'draft',
    progress: 0,
    position_x: 220 + index * 80,
    position_y: 220 + index * 40,
    is_hub: false,
    is_shared: true,
    locked: false,
  }));

  const goals = rows.length
    ? await supabaseRest<GoalRecord[]>('goals', { method: 'POST', body: JSON.stringify(rows) })
    : [];

  return NextResponse.json({ goals });
}
