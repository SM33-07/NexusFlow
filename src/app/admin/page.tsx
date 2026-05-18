'use client';
import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BarChart3, BellRing, Building2, CheckCircle2, Clock3, Flame, GitBranch, LockOpen, Mail, MessageSquare, Share2, ShieldCheck, Users } from 'lucide-react';
import type { AuditLog, CheckIn, EscalationLog, EscalationRule, GoalRecord, NotificationLog, Profile, QuarterlyUpdate } from '@/lib/types';

type Overview = {
  profiles: Profile[];
  goals: GoalRecord[];
  checkIns: CheckIn[];
  updates: QuarterlyUpdate[];
  auditLogs: AuditLog[];
  notificationLogs: NotificationLog[];
  escalationRules: EscalationRule[];
  escalationLogs: EscalationLog[];
  integrations: {
    entra: {
      enabled: boolean;
      tenantId: string;
      hierarchyAttribute: string;
      groupRoleMap: Record<string, string>;
    };
    teams: {
      enabled: boolean;
      adaptiveCards: boolean;
      deepLinks: boolean;
    };
    email: {
      enabled: boolean;
      provider: string;
    };
  } | null;
};

const emptyOverview: Overview = {
  profiles: [],
  goals: [],
  checkIns: [],
  updates: [],
  auditLogs: [],
  notificationLogs: [],
  escalationRules: [],
  escalationLogs: [],
  integrations: null,
};

const cycleWindows = [
  ['Phase 1 - Goal Setting', '1st May', 'Goal Creation, Submission & Approval'],
  ['Q1 Check-in', 'July', 'Progress Update - Planned vs Actual'],
  ['Q2 Check-in', 'October', 'Progress Update - Planned vs Actual'],
  ['Q3 Check-in', 'January', 'Progress Update - Planned vs Actual'],
  ['Q4 / Annual', 'March / April', 'Final Achievement Capture'],
];

export default function AdminPage() {
  const [overview, setOverview] = useState<Overview>(emptyOverview);
  const [sharedTitle, setSharedTitle] = useState('Improve Departmental NPS');
  const [sharedTarget, setSharedTarget] = useState('80');
  const [syncSummary, setSyncSummary] = useState('');

  const fetchOverview = async () => {
    const response = await fetch('/api/admin/overview', { cache: 'no-store' });
    if (!response.ok) return;
    setOverview(await response.json());
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const employees = overview.profiles.filter((profile) => profile.role === 'employee');
  const stats = useMemo(() => {
    const approved = overview.goals.filter((goal) => goal.status === 'approved' || goal.status === 'completed').length;
    const pending = overview.goals.filter((goal) => goal.status === 'submitted').length;
    const score = overview.goals.length ? Math.round(overview.goals.reduce((sum, goal) => sum + goal.progress, 0) / overview.goals.length) : 0;
    const checkedInEmployees = new Set(overview.checkIns.map((item) => item.employee_id)).size;
    return {
      total: overview.goals.length,
      approved,
      pending,
      score,
      completion: employees.length ? Math.round((checkedInEmployees / employees.length) * 100) : 0,
    };
  }, [overview, employees.length]);

  const analytics = useMemo(() => {
    const quarterScores = overview.updates.reduce<Record<string, { total: number; count: number }>>((acc, update) => {
      acc[update.quarter] = acc[update.quarter] ?? { total: 0, count: 0 };
      acc[update.quarter].total += update.computed_score;
      acc[update.quarter].count += 1;
      return acc;
    }, {});

    const byCategory = overview.goals.reduce<Record<string, number>>((acc, goal) => {
      acc[goal.category] = (acc[goal.category] ?? 0) + 1;
      return acc;
    }, {});

    const byStatus = overview.goals.reduce<Record<string, number>>((acc, goal) => {
      acc[goal.status] = (acc[goal.status] ?? 0) + 1;
      return acc;
    }, {});

    const byUom = overview.goals.reduce<Record<string, number>>((acc, goal) => {
      acc[goal.uom_type] = (acc[goal.uom_type] ?? 0) + 1;
      return acc;
    }, {});

    const managers = overview.profiles.filter((item) => item.role === 'manager');
    const managerEffectiveness = managers.map((manager) => {
      const reports = overview.profiles.filter((item) => item.manager_id === manager.id);
      const checked = new Set(overview.checkIns.filter((item) => reports.some((report) => report.id === item.employee_id)).map((item) => item.employee_id)).size;
      return {
        name: manager.full_name,
        completion: reports.length ? Math.round((checked / reports.length) * 100) : 0,
      };
    });

    return {
      quarterScores: Object.entries(quarterScores).map(([quarter, value]) => ({ quarter, score: Math.round(value.total / value.count) })),
      byCategory,
      byStatus,
      byUom,
      managerEffectiveness,
    };
  }, [overview]);

  const unlockGoal = async (goalId: string) => {
    await fetch('/api/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: goalId, locked: false, status: 'returned' }),
    });
    fetchOverview();
  };

  const pushSharedGoal = async () => {
    await fetch('/api/admin/shared-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: sharedTitle,
        description: 'Departmental KPI pushed by HR/Admin. Recipients may adjust weightage only; title and target stay fixed.',
        target_value: sharedTarget,
        uom_type: 'Min (Higher is better)',
        weightage: 10,
      }),
    });
    fetchOverview();
  };

  const runEscalationEvaluation = async () => {
    await fetch('/api/admin/escalations/evaluate', { method: 'POST' });
    fetchOverview();
  };

  const runEntraSyncPreview = async () => {
    const response = await fetch('/api/admin/integrations/sync', { method: 'POST' });
    if (!response.ok) return;
    const data = await response.json();
    setSyncSummary(`${data.mode} sync mapped ${data.mappedUsers.length} users from tenant ${data.tenantId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Admin / HR Governance</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Cycle control, completion visibility, shared KPIs, and audit trail.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          <Stat icon={<Users />} label="Goals" value={stats.total} />
          <Stat icon={<ShieldCheck />} label="Approved" value={stats.approved} />
          <Stat icon={<Clock3 />} label="Pending" value={stats.pending} />
          <Stat icon={<BarChart3 />} label="Avg Score" value={`${stats.score}%`} />
          <Stat icon={<CheckCircle2 />} label="Check-ins" value={`${stats.completion}%`} />
        </div>

        <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-lg p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Building2 size={18} /> Microsoft Entra ID Readiness</h2>
              <button onClick={runEntraSyncPreview} className="rounded bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 dark:bg-slate-700">Sync Preview</button>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <IntegrationCard label="SSO" value={overview.integrations?.entra.enabled ? 'Configured' : 'Demo-ready'} />
              <IntegrationCard label="Hierarchy" value={overview.integrations?.entra.hierarchyAttribute ?? 'manager'} />
              <IntegrationCard label="Role Groups" value={String(Object.keys(overview.integrations?.entra.groupRoleMap ?? {}).length)} />
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              {Object.entries(overview.integrations?.entra.groupRoleMap ?? {}).map(([group, role]) => (
                <p key={group} className="text-xs text-slate-600 dark:text-slate-300 py-1">{group} maps to <span className="font-bold text-emerald-600 dark:text-emerald-400">{role}</span></p>
              ))}
              {syncSummary && <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{syncSummary}</p>}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><BellRing size={18} /> Email & Teams Notifications</h2>
              <div className="flex gap-2 text-xs">
                <span className="rounded bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">Teams cards {overview.integrations?.teams.adaptiveCards ? 'on' : 'off'}</span>
                <span className="rounded bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Deep links {overview.integrations?.teams.deepLinks ? 'on' : 'off'}</span>
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {overview.notificationLogs.slice(0, 4).map((item) => (
                <div key={item.id} className="p-4 grid grid-cols-[32px_1fr_auto] gap-3 items-start">
                  <div className="text-emerald-600 dark:text-emerald-400">{item.channel === 'teams' ? <MessageSquare size={18} /> : <Mail size={18} />}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Deep link: {item.deep_link}</p>
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Quarterly Windows</h2>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {cycleWindows.map(([period, window, action]) => (
                <div key={period} className="grid md:grid-cols-[180px_110px_1fr] gap-3 p-4 text-sm">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{period}</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-mono">{window}</p>
                  <p className="text-slate-600 dark:text-slate-400">{action}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-lg p-5 space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Share2 size={18} /> Shared Department KPI</h2>
            <input value={sharedTitle} onChange={(event) => setSharedTitle(event.target.value)} className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500" />
            <input value={sharedTarget} onChange={(event) => setSharedTarget(event.target.value)} className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500" />
            <button onClick={pushSharedGoal} className="w-full rounded bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-500">Push to Employees</button>
          </section>
        </div>

        <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><GitBranch size={18} /> Escalation Rules</h2>
              <button onClick={runEscalationEvaluation} className="rounded bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500">Evaluate Now</button>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {overview.escalationRules.map((rule) => (
                <div key={rule.id} className="p-4">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rule.name}</p>
                  <p className="text-xs text-slate-500">{rule.threshold_days} days · {rule.first_notify_role} to {rule.second_notify_role} to {rule.final_notify_role}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><Flame size={18} /> Escalation Log</h2>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {overview.escalationLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-4 grid grid-cols-[80px_1fr_auto] gap-3">
                  <span className="text-xs font-bold text-rose-500">Level {log.level}</span>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{log.message}</p>
                  <span className="rounded bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{log.status}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-lg p-5 space-y-5">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"><BarChart3 size={18} /> Analytics Module</h2>
          <div className="grid xl:grid-cols-4 gap-5">
            <AnalyticsPanel title="QoQ Achievement Trend">
              {analytics.quarterScores.map((item) => <MiniBar key={item.quarter} label={item.quarter} value={item.score} />)}
            </AnalyticsPanel>
            <AnalyticsPanel title="Completion Heatmap">
              {employees.map((employee) => {
                const hasCheckIn = overview.checkIns.some((item) => item.employee_id === employee.id);
                return <HeatCell key={employee.id} label={employee.full_name} value={hasCheckIn ? 'Complete' : 'Pending'} active={hasCheckIn} />;
              })}
            </AnalyticsPanel>
            <AnalyticsPanel title="Goal Distribution">
              {Object.entries(analytics.byCategory).map(([label, value]) => <MiniCount key={label} label={label} value={value} />)}
              {Object.entries(analytics.byUom).map(([label, value]) => <MiniCount key={label} label={label} value={value} />)}
              {Object.entries(analytics.byStatus).map(([label, value]) => <MiniCount key={label} label={label} value={value} />)}
            </AnalyticsPanel>
            <AnalyticsPanel title="Manager Effectiveness">
              {analytics.managerEffectiveness.map((item) => <MiniBar key={item.name} label={item.name} value={item.completion} />)}
            </AnalyticsPanel>
          </div>
        </section>

        <div className="grid xl:grid-cols-2 gap-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Exception Handling / Unlock</h2>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {overview.goals.filter((goal) => goal.locked).slice(0, 5).map((goal) => (
                <div key={goal.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{goal.title}</p>
                    <p className="text-xs text-slate-500">{goal.status} · {goal.weightage}% · {goal.target_value}</p>
                  </div>
                  <button onClick={() => unlockGoal(goal.id)} className="flex items-center gap-2 rounded bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-400">
                    <LockOpen size={14} />
                    Unlock
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Audit Trail</h2>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {overview.auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-4">
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.entity_type} · {log.entity_id ?? 'n/a'} · {new Date(log.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 shadow-lg">
      <div className="text-emerald-600 dark:text-emerald-400">{icon}</div>
      <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

function IntegrationCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function AnalyticsPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3 min-h-[190px]">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      {children}
    </div>
  );
}

function MiniBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
      </div>
    </div>
  );
}

function MiniCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-xs dark:bg-slate-900">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <span className="font-bold text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}

function HeatCell({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className={`rounded px-3 py-2 text-xs ${active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'}`}>
      <p className="font-bold">{label}</p>
      <p>{value}</p>
    </div>
  );
}
