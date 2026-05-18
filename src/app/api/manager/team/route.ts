import { NextRequest, NextResponse } from 'next/server';
import { demoCheckIns, demoGoals, demoProfiles, demoQuarterlyUpdates } from '@/lib/demoData';
import { getCurrentProfile, hasSupabaseEnv, supabaseRest } from '@/lib/supabaseServer';
import type { CheckIn, GoalRecord, Profile, QuarterlyUpdate } from '@/lib/types';

function attachLatest(goals: GoalRecord[], updates: QuarterlyUpdate[]) {
  return goals.map((goal) => ({
    ...goal,
    latest_update: updates
      .filter((update) => update.goal_id === goal.id)
      .sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')))[0] ?? null,
  }));
}

function summarize(profile: Profile, goals: GoalRecord[], checkIns: CheckIn[]) {
  const ownedGoals = goals.filter((goal) => goal.owner_id === profile.id);
  const visibleGoals = ownedGoals.filter((goal) => !goal.is_hub);
  const totalProgress = visibleGoals.length
    ? Math.round(visibleGoals.reduce((sum, goal) => sum + goal.progress, 0) / visibleGoals.length)
    : 0;
  const pending = ownedGoals.some((goal) => goal.status === 'submitted');
  const returned = ownedGoals.some((goal) => goal.status === 'returned' || goal.status === 'at_risk');

  return {
    id: profile.id,
    name: profile.full_name,
    role: profile.job_title,
    email: profile.email,
    totalProgress,
    status: returned ? 'At Risk' : pending ? 'Pending Approval' : totalProgress >= 100 ? 'Completed' : 'On Track',
    goals: ownedGoals,
    checkIns: checkIns.filter((item) => item.employee_id === profile.id),
  };
}

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile || profile.role === 'employee') return NextResponse.json({ error: 'Manager access required.' }, { status: 403 });

  if (!hasSupabaseEnv) {
    return NextResponse.json({ members: [summarize(demoProfiles[0], attachLatest(demoGoals, demoQuarterlyUpdates), demoCheckIns)] });
  }

  const directReports = await supabaseRest<Profile[]>(
    `profiles?manager_id=eq.${profile.id}&select=id,full_name,email,role,job_title,department,manager_id,session_version`
  );
  const ids = directReports.map((report) => report.id).join(',');
  if (!ids) return NextResponse.json({ members: [] });

  const goals = await supabaseRest<GoalRecord[]>(`goals?owner_id=in.(${ids})&select=*&order=created_at.asc`);
  const goalIds = goals.map((goal) => goal.id).join(',');
  const updates = goalIds
    ? await supabaseRest<QuarterlyUpdate[]>(`quarterly_updates?goal_id=in.(${goalIds})&select=*&order=created_at.desc`)
    : [];
  const checkIns = await supabaseRest<CheckIn[]>(`check_ins?employee_id=in.(${ids})&select=*&order=created_at.desc`);
  return NextResponse.json({ members: directReports.map((report) => summarize(report, attachLatest(goals, updates), checkIns)) });
}
