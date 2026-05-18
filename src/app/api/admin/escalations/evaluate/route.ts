import { NextRequest, NextResponse } from 'next/server';
import { demoEscalationLogs, demoEscalationRules } from '@/lib/demoData';
import { getCurrentProfile, hasSupabaseEnv, supabaseRest } from '@/lib/supabaseServer';
import type { EscalationLog, EscalationRule, GoalRecord, Profile } from '@/lib/types';

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile(request);
  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    return NextResponse.json({ error: 'Admin or manager access required.' }, { status: 403 });
  }

  if (!hasSupabaseEnv) {
    return NextResponse.json({ evaluated: true, created: demoEscalationLogs, rules: demoEscalationRules });
  }

  const [rules, goals, profiles] = await Promise.all([
    supabaseRest<EscalationRule[]>('escalation_rules?active=eq.true&select=*'),
    supabaseRest<GoalRecord[]>('goals?select=*'),
    supabaseRest<Profile[]>('profiles?select=id,full_name,email,role,job_title,department,manager_id,session_version'),
  ]);

  const approvalRule = rules.find((rule) => rule.trigger_type === 'manager_approval_overdue');
  const created: EscalationLog[] = [];

  if (approvalRule) {
    const submittedGoals = goals.filter((goal) => goal.status === 'submitted');
    const rows = submittedGoals.map((goal) => {
      const employee = profiles.find((item) => item.id === goal.owner_id);
      return {
        rule_id: approvalRule.id,
        employee_id: goal.owner_id,
        manager_id: employee?.manager_id ?? null,
        level: 1,
        message: `${goal.title} is waiting for manager approval beyond ${approvalRule.threshold_days} configured days.`,
        status: 'open',
      };
    });

    if (rows.length) {
      const inserted = await supabaseRest<EscalationLog[]>('escalation_logs', {
        method: 'POST',
        body: JSON.stringify(rows),
      });
      created.push(...inserted);
    }
  }

  return NextResponse.json({ evaluated: true, created, rules });
}
