import { NextRequest, NextResponse } from 'next/server';
import { demoGoals } from '@/lib/demoData';
import { computeQuarterScore } from '@/lib/scoring';
import { getCurrentProfile, getProfileById, hasSupabaseEnv, supabaseRest } from '@/lib/supabaseServer';
import type { GoalRecord, QuarterlyUpdate } from '@/lib/types';

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const body = await request.json();

  if (!hasSupabaseEnv) {
    const goal = demoGoals.find((item) => item.id === body.goal_id) ?? demoGoals[1];
    const computedScore = computeQuarterScore({
      uomType: goal.uom_type,
      targetValue: goal.target_value,
      actualValue: body.actual_value,
      baselineValue: goal.baseline_value,
    });
    return NextResponse.json({
      update: { computed_score: computedScore, achievement_status: body.achievement_status ?? 'On Track', ...body },
      goal: { id: body.goal_id, progress: computedScore, status: computedScore >= 100 ? 'completed' : computedScore < 50 ? 'at_risk' : goal.status },
    });
  }

  const [goal] = await supabaseRest<GoalRecord[]>(`goals?id=eq.${body.goal_id}&select=*`);
  if (!goal) return NextResponse.json({ error: 'Goal not found.' }, { status: 404 });
  const owner = await getProfileById(goal.owner_id);
  const canUpdate = goal.owner_id === profile.id || profile.role === 'admin' || (profile.role === 'manager' && owner?.manager_id === profile.id);
  if (!canUpdate) return NextResponse.json({ error: 'You do not have permission to update this goal.' }, { status: 403 });

  const computedScore = computeQuarterScore({
    uomType: goal.uom_type,
    targetValue: goal.target_value,
    actualValue: body.actual_value,
    baselineValue: goal.baseline_value,
  });

  const updates = await supabaseRest<QuarterlyUpdate[]>('quarterly_updates', {
    method: 'POST',
    body: JSON.stringify({
      goal_id: goal.id,
      quarter: body.quarter ?? 'Q2 2026',
      actual_value: body.actual_value,
      achievement_status: body.achievement_status ?? 'On Track',
      computed_score: computedScore,
      comment: body.comment ?? null,
    }),
  });

  const [updatedGoal] = await supabaseRest<GoalRecord[]>(`goals?id=eq.${goal.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      progress: computedScore,
      status: computedScore >= 100 ? 'completed' : computedScore < 50 ? 'at_risk' : goal.status,
      updated_at: new Date().toISOString(),
    }),
  });

  return NextResponse.json({ update: updates[0], goal: updatedGoal });
}
