import { Handle, Position } from 'reactflow';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { Target, AlertCircle, CheckCircle2, Trash2, Lock, ClipboardCheck } from 'lucide-react';
import clsx from 'clsx';
import { useCanvasStore } from '@/store/useCanvasStore';

type GoalNodeData = {
  isHub?: boolean;
  status?: 'completed' | 'onTrack' | 'atRisk';
  weightage?: number;
  title?: string;
  targetValue?: string | number;
  uom?: string;
  progress?: number;
  rawStatus?: string;
  locked?: boolean;
  description?: string;
  isShared?: boolean;
  latestUpdate?: {
    actual_value: string;
    achievement_status: string;
    computed_score: number;
    quarter: string;
    comment?: string | null;
  } | null;
};

export default function GoalNode({ id, data }: { id: string; data: GoalNodeData }) {
  const isHub = data.isHub;
  const deleteNode = useCanvasStore((state) => state.deleteNode);
  const updateGoalProgress = useCanvasStore((state) => state.updateGoalProgress);
  const [isLogging, setIsLogging] = useState(false);
  const [actualValue, setActualValue] = useState('');
  const [achievementStatus, setAchievementStatus] = useState('On Track');
  const [comment, setComment] = useState('');

  const openActuals = (event: MouseEvent) => {
    event.stopPropagation();
    setActualValue(data.latestUpdate?.actual_value ?? '');
    setAchievementStatus(data.latestUpdate?.achievement_status ?? 'On Track');
    setComment(data.latestUpdate?.comment ?? '');
    setIsLogging(true);
  };

  const handleLogActuals = async (event: MouseEvent) => {
    event.stopPropagation();
    if (!actualValue) return;

    const response = await fetch('/api/quarterly-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal_id: id, actual_value: actualValue, achievement_status: achievementStatus, comment, quarter: 'Q2 2026' }),
    });
    if (!response.ok) return;
    const { goal } = await response.json();
    updateGoalProgress(id, goal.progress, goal.status);
    setIsLogging(false);
  };

  const statusColors = {
    completed: 'border-emerald-400/80 bg-white dark:bg-emerald-950/40 shadow-[0_0_20px_rgba(52,211,153,0.15)] text-emerald-600 dark:text-emerald-400',
    onTrack: 'border-blue-400/80 bg-white dark:bg-blue-950/40 shadow-[0_0_20px_rgba(96,165,250,0.15)] text-blue-600 dark:text-blue-400',
    atRisk: 'border-rose-400/80 bg-white dark:bg-rose-950/40 shadow-[0_0_20px_rgba(251,113,133,0.2)] text-rose-600 dark:text-rose-400',
    hub: 'border-purple-400/80 bg-purple-50 dark:bg-purple-950/40 shadow-[0_0_25px_rgba(192,132,252,0.25)] text-purple-700 dark:text-purple-400',
  };

  const currentStyle = isHub ? statusColors.hub : statusColors[data.status || 'onTrack'];
  const weight = data.weightage ?? 0;
  const scaleClass = weight > 30 ? 'scale-110' : weight < 15 ? 'scale-95' : 'scale-100';

  return (
    <div className={clsx(
      "group relative flex flex-col min-w-[240px] backdrop-blur-xl rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
      currentStyle,
      data.locked && "border-emerald-500 ring-2 ring-emerald-400/40",
      scaleClass
    )}>
      <div className={clsx(
        "pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        isHub ? "bg-purple-400/10" : data.status === 'atRisk' ? "bg-rose-400/10" : "bg-emerald-400/10"
      )} />
      {/* TARGET HANDLE (TOP) - FIXED HITBOX */}
      {!isHub && (
        <Handle 
          id="target"
          type="target" 
          position={Position.Top} 
          className="!w-5 !h-5 !bg-emerald-500 !border-2 !border-white dark:!border-[#0f172a] z-50 cursor-crosshair hover:scale-125 transition-transform" 
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          {isHub ? <Target size={18} /> : data.locked ? <Lock size={18} /> : data.status === 'completed' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {isHub ? 'Dept KPI' : 'Key Goal'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            {data.weightage}%
          </div>
          {!isHub && !data.locked && (
            <button 
              onClick={(e) => { e.stopPropagation(); deleteNode(id); }}
              className="text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 p-1 rounded transition-colors z-20 relative"
              title="Delete Node"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
          {data.title}
        </h3>
        {data.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">
            {data.description}
          </p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
          Target: {data.targetValue} {data.uom}
        </p>
        {!isHub && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            {data.isShared ? 'shared KPI · ' : ''}{data.rawStatus ?? 'draft'} · Score {data.progress || 0}%
          </p>
        )}
        {data.latestUpdate && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Actual: {data.latestUpdate.actual_value} · {data.latestUpdate.achievement_status}
          </p>
        )}
      </div>

      {!isHub && (
        <button
          onClick={openActuals}
          className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
        >
          <ClipboardCheck size={14} />
          Log Actuals
        </button>
      )}

      {isLogging && (
        <div onClick={(event) => event.stopPropagation()} className="absolute left-3 right-3 top-3 z-[60] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Q2 Actuals</p>
            <button onClick={() => setIsLogging(false)} className="text-slate-400 hover:text-rose-500">x</button>
          </div>
          <input value={actualValue} onChange={(event) => setActualValue(event.target.value)} placeholder="Actual value or completion date" className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500" />
          <select value={achievementStatus} onChange={(event) => setAchievementStatus(event.target.value)} className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500">
            <option>Not Started</option>
            <option>On Track</option>
            <option>Completed</option>
          </select>
          <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Employee update comment" rows={3} className="w-full resize-none rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500" />
          <button onClick={handleLogActuals} className="w-full rounded bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500">Save Quarterly Update</button>
        </div>
      )}

      {/* Bottom Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-auto">
        <div 
          className={clsx("h-full transition-all duration-1000 bg-[length:200%_100%] animate-shimmer", isHub ? "bg-purple-500" : data.status === 'atRisk' ? "bg-rose-500" : data.status === 'completed' ? "bg-emerald-500" : "bg-blue-500")} 
          style={{ width: `${data.progress || 0}%` }}
        />
      </div>

      {/* SOURCE HANDLE (BOTTOM) - FIXED HITBOX */}
      <Handle 
        id="source"
        type="source" 
        position={Position.Bottom} 
        className="!w-5 !h-5 !bg-purple-500 !border-2 !border-white dark:!border-[#0f172a] z-50 cursor-crosshair hover:scale-125 transition-transform" 
      />
    </div>
  );
}
