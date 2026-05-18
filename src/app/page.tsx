'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import NexusCanvas from '@/components/NexusCanvas';
import GoalSidePanel from '@/components/GoalSidePanel';
import JudgeSpotlight from '@/components/JudgeSpotlight';
import { Plus, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';

export default function GoalCanvasPage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showToast, setShowToast] = useState(false); // NEW: Toast state
  const [submitError, setSubmitError] = useState('');
  
  const totalWeightage = useCanvasStore((state) => state.totalWeightage);
  const fetchGoalsFromDB = useCanvasStore((state) => state.fetchGoalsFromDB);
  const submitGoalsToManager = useCanvasStore((state) => state.submitGoalsToManager);
  const isSubmissionValid = totalWeightage === 100;

  useEffect(() => {
    fetchGoalsFromDB();
  }, [fetchGoalsFromDB]);

  const handleSubmit = async () => {
    setSubmitError('');
    if (isSubmissionValid) {
      try {
        await submitGoalsToManager();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      } catch {
        setSubmitError('Could not submit goals. Check Supabase env variables and try again.');
      }
    }
  };

  return (
    <DashboardLayout>
      
      {/* Feature 3: Premium Toast Notification Overlay */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/50 p-4 rounded-lg shadow-[0_10px_40px_rgba(16,185,129,0.2)] flex items-center gap-3 backdrop-blur-md">
            <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-full">
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
            <div>
              <h3 className="text-emerald-900 dark:text-emerald-100 font-bold text-sm">System Locked & Synced</h3>
              <p className="text-emerald-700 dark:text-emerald-300 text-xs mt-0.5">L1 Manager notified via Microsoft Teams.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Nexus Canvas</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Map your objectives. Total weightage across all goals must equal 100%.
          </p>
          {submitError && <p className="text-rose-500 text-sm mt-2">{submitError}</p>}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 px-5 py-2.5 rounded-lg font-bold transition-all border border-slate-300 dark:border-slate-600"
          >
            <Plus size={20} />
            Initialize Node
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isSubmissionValid}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${
              isSubmissionValid
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:-translate-y-0.5'
                : 'bg-slate-100 dark:bg-[#020617] text-slate-400 dark:text-slate-600 border border-slate-300 dark:border-slate-800 cursor-not-allowed'
            }`}
          >
            {isSubmissionValid ? (
              <>
                <ShieldCheck size={20} className="animate-pulse" />
                Submit to Manager
              </>
            ) : (
              <>
                <Lock size={20} />
                Weightage Must Be 100%
              </>
            )}
          </button>
        </div>
      </div>

      <JudgeSpotlight totalWeightage={totalWeightage} />

      <div className="relative z-0">
        <NexusCanvas onOpenNodeEditor={() => setIsPanelOpen(true)} />
      </div>

      <div className="relative z-50">
        <GoalSidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
      </div>
    </DashboardLayout>
  );
}
