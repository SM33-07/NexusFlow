'use client';
import React from 'react';
import { Activity, BellRing, GitBranch, ShieldCheck, Sparkles, Users } from 'lucide-react';

const moments = [
  { icon: <Sparkles size={16} />, label: 'AI SMART goal draft', tone: 'text-violet-600 dark:text-violet-300' },
  { icon: <GitBranch size={16} />, label: 'Visual KPI cascade', tone: 'text-blue-600 dark:text-blue-300' },
  { icon: <ShieldCheck size={16} />, label: 'Manager approval lock', tone: 'text-emerald-600 dark:text-emerald-300' },
  { icon: <BellRing size={16} />, label: 'Teams/email notification log', tone: 'text-amber-600 dark:text-amber-300' },
];

export default function JudgeSpotlight({ totalWeightage }: { totalWeightage: number }) {
  const readiness = Math.max(0, Math.min(totalWeightage, 100));

  return (
    <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
      <div className="relative grid gap-4 p-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan" />
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Activity size={14} className="animate-pulse" />
              Live judge demo mode
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Employee to Manager to HR, in one persisted workflow</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            {moments.map((item, index) => (
              <div
                key={item.label}
                className="group rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-emerald-500/50 dark:hover:bg-slate-900"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className={`mb-2 ${item.tone}`}>{item.icon}</div>
                <p className="text-xs font-semibold leading-snug text-slate-700 dark:text-slate-200">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[88px_1fr] items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70">
          <div
            className="grid h-20 w-20 place-items-center rounded-full"
            style={{ background: `conic-gradient(#10b981 ${readiness * 3.6}deg, rgba(148,163,184,.25) 0deg)` }}
          >
            <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-lg font-black text-slate-900 dark:bg-slate-950 dark:text-slate-100">
              {readiness}%
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Users size={16} className="text-emerald-500" />
              Submission readiness
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Weightage validation, approval locks, audit trail, role views, and export are all wired into the demo path.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 transition-all duration-700" style={{ width: `${readiness}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
