'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Users, AlertTriangle, Download, MessageSquare, X, CheckCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import type { CheckIn, GoalRecord } from '@/lib/types';

type TeamMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  totalProgress: number;
  status: string;
  goals: GoalRecord[];
  checkIns: CheckIn[];
};

export default function ManagerHub() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedOperative, setSelectedOperative] = useState<TeamMember | null>(null);
  const [comment, setComment] = useState('');
  const [draftEdits, setDraftEdits] = useState<Record<string, { target_value: string; weightage: number }>>({});

  const fetchTeam = async () => {
    const response = await fetch('/api/manager/team', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    setMembers(data.members ?? []);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  useEffect(() => {
    if (!selectedOperative) return;
    setDraftEdits(Object.fromEntries(
      selectedOperative.goals.map((goal) => [goal.id, { target_value: goal.target_value, weightage: goal.weightage }]),
    ));
  }, [selectedOperative]);

  const pendingApprovals = useMemo(
    () => members.reduce((sum, member) => sum + member.goals.filter((goal) => goal.status === 'submitted').length, 0),
    [members],
  );

  const updateGoalStatus = async (goalId: string, status: 'approved' | 'returned') => {
    await fetch('/api/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: goalId, status, ...(draftEdits[goalId] ?? {}) }),
    });
    await fetchTeam();
  };

  const saveInlineEdit = async (goalId: string) => {
    await fetch('/api/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: goalId, ...(draftEdits[goalId] ?? {}) }),
    });
    await fetchTeam();
  };

  const handleExportCSV = () => {
    window.location.href = '/api/export/goals';
  };

  const handleLogCheckIn = async () => {
    if (!selectedOperative || !comment.trim()) return;
    await fetch('/api/manager/check-ins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: selectedOperative.id, comment }),
    });
    setComment('');
    setSelectedOperative(null);
    fetchTeam();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Command Center</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Q2 Achievement Tracking & Check-ins</p>
          </div>
          <div className="flex gap-4">
            <StatCard icon={<Users />} value={String(members.length)} label="Direct Reports" />
            <StatCard icon={<AlertTriangle className="text-rose-500 dark:text-rose-400" />} value={String(pendingApprovals)} label="Pending Approvals" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl z-10 relative transition-colors">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Squad Progress Status</h2>
            <button onClick={handleExportCSV} className="flex items-center gap-2 text-sm bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded hover:bg-emerald-200 dark:hover:bg-emerald-500/20 font-medium transition-colors border border-emerald-200 dark:border-emerald-500/30">
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#020617]/50 text-xs uppercase tracking-wider text-slate-600 dark:text-slate-500 font-semibold">
                  <th className="p-4">Operative</th>
                  <th className="p-4">Current Cycle</th>
                  <th className="p-4">Overall Progress</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-200">{member.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{member.role}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">Q2 Active</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full max-w-[150px] bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className={`h-full ${member.totalProgress === 100 ? 'bg-blue-500' : member.totalProgress > 80 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${member.totalProgress}%` }} />
                        </div>
                        <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{member.totalProgress}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-semibold ${member.status === 'At Risk' ? 'text-rose-500' : member.status === 'Pending Approval' ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>{member.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => setSelectedOperative(member)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-sm font-medium transition-colors border border-slate-300 dark:border-slate-700">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedOperative && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/20 dark:bg-[#020617]/60 backdrop-blur-sm transition-opacity">
            <div className="h-full w-full max-w-lg bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <MessageSquare size={20} className="text-emerald-600 dark:text-emerald-400" />
                    Quarterly Review
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-mono">{selectedOperative.name} · {selectedOperative.role}</p>
                </div>
                <button type="button" onClick={() => setSelectedOperative(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" aria-label="Close check-in modal">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div className="space-y-3">
                  {selectedOperative.goals.filter((goal) => !goal.is_hub).map((goal) => (
                    <div key={goal.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{goal.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{goal.description}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            Planned: {goal.target_value} {goal.uom_type} · Actual: {goal.latest_update?.actual_value ?? 'Not logged'} · {goal.latest_update?.achievement_status ?? 'Not Started'} · Score {goal.latest_update?.computed_score ?? goal.progress}%
                          </p>
                        </div>
                        {goal.status === 'submitted' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateGoalStatus(goal.id, 'approved')} className="p-2 rounded bg-emerald-600 text-white hover:bg-emerald-500" title="Approve">
                              <ShieldCheck size={16} />
                            </button>
                            <button onClick={() => updateGoalStatus(goal.id, 'returned')} className="p-2 rounded bg-amber-500 text-white hover:bg-amber-400" title="Return">
                              <RotateCcw size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      {goal.status === 'submitted' && (
                        <div className="mt-4 grid grid-cols-[1fr_100px_auto] gap-2">
                          <input
                            value={draftEdits[goal.id]?.target_value ?? goal.target_value}
                            onChange={(event) => setDraftEdits((edits) => ({ ...edits, [goal.id]: { target_value: event.target.value, weightage: edits[goal.id]?.weightage ?? goal.weightage } }))}
                            className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                            aria-label="Edit planned target"
                          />
                          <input
                            type="number"
                            min={10}
                            max={100}
                            value={draftEdits[goal.id]?.weightage ?? goal.weightage}
                            onChange={(event) => setDraftEdits((edits) => ({ ...edits, [goal.id]: { target_value: edits[goal.id]?.target_value ?? goal.target_value, weightage: Number(event.target.value) } }))}
                            className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                            aria-label="Edit weightage"
                          />
                          <button onClick={() => saveInlineEdit(goal.id)} className="rounded bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600">Save</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Structured Manager Feedback</label>
                  <textarea rows={5} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Document performance discussion, roadblocks, and next steps..." className="w-full bg-white dark:bg-[#020617] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 p-3 rounded-lg focus:outline-none focus:border-emerald-500 resize-none" />
                </div>

                {selectedOperative.checkIns.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Previous Comments</p>
                    {selectedOperative.checkIns.slice(0, 3).map((item) => (
                      <p key={item.id} className="text-sm text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-800 p-3">{item.comment}</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button onClick={handleLogCheckIn} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-lg font-bold tracking-wide transition-colors">
                  <CheckCircle size={18} />
                  Log Check-in & Notify Employee
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 shadow-lg z-10 relative transition-colors">
      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}
