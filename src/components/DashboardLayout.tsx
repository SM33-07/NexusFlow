'use client';
import React, { useEffect, useState } from 'react';
import { Network, Activity, ShieldAlert, UserCircle, LogOut, Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/lib/types';
import AccessDeniedToast from './AccessDeniedToast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setProfile(data?.profile ?? null))
      .finally(() => setProfileLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const denied = params.get('accessDenied');
    if (!denied) return;

    setAccessDeniedMessage(denied === 'admin'
      ? 'Access denied. Admin / HR is only available to admin users.'
      : 'Access denied. Manager Hub is only available to managers and admins.'
    );
    params.delete('accessDenied');
    const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', cleanUrl);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-slate-300 flex font-sans transition-colors duration-500">
      
      <aside className="w-20 lg:w-64 border-r border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col justify-between py-6 transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20">
        <div>
          <div className="flex items-center justify-center lg:justify-start lg:px-6 mb-10 gap-3">
            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg border border-emerald-500/30 dark:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] dark:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Network className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
            <span className="hidden lg:block font-bold text-xl tracking-widest text-slate-900 dark:text-slate-100 uppercase">
              Nexus
            </span>
          </div>

          <nav className="flex flex-col gap-2 px-2 lg:px-4">
            <NavItem icon={<Activity />} label="Goal Canvas" href="/" active={pathname === '/'} />
            <NavItem icon={<ShieldAlert />} label="Manager Hub" href="/manager" active={pathname === '/manager'} allowedRoles={['manager', 'admin']} profile={profile} onAccessDenied={setAccessDeniedMessage} />
            <NavItem icon={<Settings />} label="Admin / HR" href="/admin" active={pathname === '/admin'} allowedRoles={['admin']} profile={profile} onAccessDenied={setAccessDeniedMessage} />
          </nav>
        </div>

        <div className="px-2 lg:px-4 space-y-4">
          <ThemeToggle />
          
          {/* UPDATED: Profile Block is now a Link */}
          <Link href="/profile" className="w-full p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col items-center lg:flex-row gap-3 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left">
            <UserCircle className="text-slate-500 dark:text-slate-400 min-w-[32px]" size={32} />
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">
                {profile?.full_name ?? (profileLoading ? 'Loading profile' : 'Not signed in')}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                {profile ? `${profile.role} · ${profile.job_title}` : profileLoading ? 'checking session' : 'login required'}
              </p>
            </div>
          </Link>
          
          <button onClick={handleLogout} className="w-full flex justify-center lg:justify-start items-center gap-2 p-2 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">
            <LogOut size={20} />
            <span className="hidden lg:block text-sm font-medium">Disconnect</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto relative overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] dark:blur-[128px] opacity-70 animate-blob pointer-events-none" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] dark:blur-[128px] opacity-70 animate-blob [animation-delay:2s] pointer-events-none" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] dark:blur-[128px] opacity-70 animate-blob [animation-delay:4s] pointer-events-none" />
        
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-5 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
        
        <div className="relative z-10 h-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <AccessDeniedToast message={accessDeniedMessage} onClose={() => setAccessDeniedMessage('')} />
    </div>
  );
}

function NavItem({
  icon,
  label,
  href,
  active = false,
  allowedRoles,
  profile,
  onAccessDenied,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  allowedRoles?: Profile['role'][];
  profile?: Profile | null;
  onAccessDenied?: (message: string) => void;
}) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!allowedRoles || !profile || allowedRoles.includes(profile.role)) return;
    event.preventDefault();
    onAccessDenied?.(`${label} is not available for your current role.`);
  };

  return (
    <Link href={href} onClick={handleClick} className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${active ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-emerald-500/30 shadow-sm dark:shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-300'}`}>
      {icon}
      <span className="hidden lg:block font-medium tracking-wide">{label}</span>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-10" />;

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full p-2.5 rounded-lg bg-slate-200 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300 dark:border-slate-700/50 transition-colors flex items-center justify-center gap-2">
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      <span className="hidden lg:block text-sm font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
