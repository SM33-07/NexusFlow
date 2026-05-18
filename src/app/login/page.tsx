'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, Network } from 'lucide-react';

const demos = [
  { label: 'Employee', email: 'employee@nexus.demo', password: 'Nexus@12345' },
  { label: 'Manager', email: 'manager@nexus.demo', password: 'Nexus@12345' },
  { label: 'Admin', email: 'admin@nexus.demo', password: 'Nexus@12345' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(demos[0].email);
  const [password, setPassword] = useState(demos[0].password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'Login failed.');
      return;
    }

    const next = new URLSearchParams(window.location.search).get('next');
    router.push(next ?? '/');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center p-6">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <Network className="text-emerald-400" size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nexus Login</h1>
            <p className="text-sm text-slate-400">Email/password database auth</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {demos.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => { setEmail(demo.email); setPassword(demo.password); }}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:border-emerald-500"
            >
              {demo.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-emerald-500" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-slate-100 outline-none focus:border-emerald-500" />
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 p-3 font-bold text-white hover:bg-emerald-500 disabled:opacity-60">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <KeyRound size={18} />}
          Sign in
        </button>
      </form>
    </main>
  );
}
