'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheckIcon, CheckCircleIcon } from '@/components/ui/Icons';

export default function AdminRecoveryPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState(null);
  const [error, setError] = useState('');

  const handleRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recover_admin', email }),
      });
      const data = await res.json();
      if (data.success) {
        setRecoveryToken(data.token);
      } else {
        setError(data.error || 'Failed to generate recovery token.');
      }
    } catch (err) {
      setError('Server error processing recovery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-indigo-500/20 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2 border border-indigo-500/30">
            <ShieldCheckIcon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Recovery</h1>
          <p className="text-xs text-slate-400">Generate a verified security recovery token for platform admins.</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {recoveryToken ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircleIcon className="w-4 h-4" />
              <span>Recovery Token Generated</span>
            </div>
            <p className="text-xs text-slate-300">
              Your temporary 60-minute admin access token is:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-emerald-300 select-all break-all border border-white/5">
              {recoveryToken}
            </div>
            <Link
              href="/admin/login"
              className="block text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
            >
              Return to Admin Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRecovery} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Account Email</label>
              <input
                type="email"
                required
                placeholder="admin@saasplatform.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              {loading ? 'Validating...' : 'Send Security Recovery Token'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link href="/admin/login" className="text-xs text-slate-500 hover:text-slate-400">
            ← Back to Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
