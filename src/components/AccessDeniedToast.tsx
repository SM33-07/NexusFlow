'use client';
import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

export default function AccessDeniedToast({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;

  return (
    <div className="fixed right-5 top-5 z-[100] w-[min(92vw,360px)] animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="relative overflow-hidden rounded-xl border border-amber-300 bg-white p-4 shadow-2xl shadow-amber-500/20 dark:border-amber-500/40 dark:bg-slate-950">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 animate-scan" />
        <div className="flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <ShieldAlert size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Access denied</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-100" aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
