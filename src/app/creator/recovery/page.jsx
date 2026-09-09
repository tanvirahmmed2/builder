'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon } from '@/components/ui/Icons';

export default function CreatorRecoveryPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');

  const handleRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recover', email }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
      } else {
        setError(data.error || 'Creator email not found.');
      }
    } catch (err) {
      setError('Server error during recovery request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-white">Reset Creator Password</h1>
          <p className="text-xs text-slate-400">
            Enter your account email to receive a recovery token.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {token ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircleIcon className="w-4 h-4" />
              <span>Password Recovery Token Issued</span>
            </div>
            <p className="text-xs text-slate-300">
              Your recovery access token:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-emerald-300 select-all break-all border border-white/5">
              {token}
            </div>
            <Link
              href="/creator/login"
              className="block text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
            >
              Return to Creator Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRecovery} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account Email</label>
              <input
                type="email"
                required
                placeholder="alex.creator@designcraft.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
            >
              {loading ? 'Processing...' : 'Send Password Reset Token'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link href="/creator/login" className="text-xs text-slate-500 hover:text-slate-400">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
