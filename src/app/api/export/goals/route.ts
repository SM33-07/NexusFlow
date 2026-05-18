import { NextRequest } from 'next/server';
import { demoGoals, demoProfiles, demoQuarterlyUpdates } from '@/lib/demoData';
import { getCurrentProfile, hasSupabaseEnv, supabaseRest } from '@/lib/supabaseServer';
import type { GoalRecord, Profile, QuarterlyUpdate } from '@/lib/types';

function csvEscape(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile) return new Response('Not authenticated.', { status: 401 });

  let goals = demoGoals;
  let profiles = demoProfiles;
  let updates = demoQuarterlyUpdates;

  if (hasSupabaseEnv) {
    if (profile.role === 'employee') {
      goals = await supabaseRest<GoalRecord[]>(`goals?owner_id=eq.${profile.id}&select=*`);
      const goalIds = goals.map((goal) => goal.id).join(',');
      updates = goalIds ? await supabaseRest<QuarterlyUpdate[]>(`quarterly_updates?goal_id=in.(${goalIds})&select=*&order=created_at.desc`) : [];
      profiles = [profile];
    } else {
      profiles = profile.role === 'admin'
        ? await supabaseRest<Profile[]>('profiles?select=id,full_name,email,role,job_title,department,manager_id,session_version')
        : await supabaseRest<Profile[]>(`profiles?manager_id=eq.${profile.id}&select=id,full_name,email,role,job_title,department,manager_id,session_version`);
      const ids = profiles.map((item) => item.id).join(',');
      goals = ids ? await supabaseRest<GoalRecord[]>(`goals?owner_id=in.(${ids})&select=*`) : [];
      const goalIds = goals.map((goal) => goal.id).join(',');
      updates = goalIds ? await supabaseRest<QuarterlyUpdate[]>(`quarterly_updates?goal_id=in.(${goalIds})&select=*&order=created_at.desc`) : [];
    }
  }

  const rows = [
    ['Employee', 'Role', 'Goal', 'Description', 'Category', 'Weightage', 'Goal Status', 'Quarter Status', 'Planned Target', 'Actual Achievement', 'Computed Score', 'UoM'],
    ...goals.map((goal) => {
      const owner = profiles.find((item) => item.id === goal.owner_id);
      const latest = updates
        .filter((update) => update.goal_id === goal.id)
        .sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')))[0];
      return [
        owner?.full_name ?? goal.owner_id,
        owner?.job_title ?? '',
        goal.title,
        goal.description,
        goal.category,
        goal.weightage,
        goal.status,
        latest?.achievement_status ?? '',
        goal.target_value,
        latest?.actual_value ?? '',
        latest?.computed_score ?? goal.progress,
        goal.uom_type,
      ];
    }),
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv;charset=utf-8',
      'Content-Disposition': 'attachment; filename="nexus-goals-export.csv"',
    },
  });
}
