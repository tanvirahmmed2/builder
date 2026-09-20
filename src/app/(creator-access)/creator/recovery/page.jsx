'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BiCheckCircle, BiLoaderAlt } from 'react-icons/bi';

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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-50">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-xs text-slate-500">
            Enter your account email to receive an instant recovery security token.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {token ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <BiCheckCircle className="text-base text-emerald-600 shrink-0" />
              <span>Password Recovery Token Issued</span>
            </div>
            <p className="text-xs text-slate-600">
              Use this temporary authorization token to reset your password:
            </p>
            <div className="p-3 bg-white rounded-xl font-mono text-xs text-slate-900 select-all break-all border border-slate-200">
              {token}
            </div>
            <Link
              href="/creator/login"
              className="block text-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all"
            >
              Return to Creator Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRecovery} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <BiLoaderAlt className="animate-spin text-base" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Continue →</span>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <Link href="/creator/login" className="text-xs text-slate-500 hover:text-slate-900 font-medium">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
