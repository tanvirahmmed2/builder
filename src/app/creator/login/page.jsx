'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreatorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('alex.creator@designcraft.com');
  const [password, setPassword] = useState('Creator@123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // In local demo mode, direct to Creator dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-emerald-500/25">
            C
          </div>
          <h1 className="text-2xl font-black text-white">Creator & Manager Sign In</h1>
          <p className="text-xs text-slate-400">
            Access your portfolio site, update modules, and check visitor bookings.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link href="/creator/recovery" className="text-xs text-emerald-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-400 space-y-2">
          <div>
            Don&apos;t have an account yet?{' '}
            <Link href="/creator/register" className="text-emerald-400 hover:underline font-semibold">
              Create account
            </Link>
          </div>
          <div>
            <Link href="/" className="text-slate-500 hover:text-slate-400">
              ← Return to Platform Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
