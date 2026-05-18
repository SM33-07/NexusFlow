'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { UserCircle, Mail, Briefcase, Shield } from 'lucide-react';
import type { Profile } from '@/lib/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetch('/api/me').then((response) => response.ok ? response.json() : null).then((data) => setProfile(data?.profile ?? null));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 tracking-tight">Operative Profile</h1>
        
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col md:flex-row items-start gap-8 shadow-xl relative z-10">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full border-4 border-emerald-500/20">
            <UserCircle className="w-32 h-32 text-slate-400 dark:text-slate-500" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{profile?.full_name ?? 'Alex Mercer'}</h2>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono">{profile?.role ?? 'employee'} · {profile?.job_title ?? 'Frontend Engineer'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <ProfileStat icon={<Mail />} label="Email" value={profile?.email ?? 'employee@nexus.demo'} />
              <ProfileStat icon={<Briefcase />} label="Department" value={profile?.department ?? 'Product Engineering'} />
              <ProfileStat icon={<Shield />} label="Clearance" value={profile?.role ?? 'employee'} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProfileStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-slate-400 dark:text-slate-500">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}
