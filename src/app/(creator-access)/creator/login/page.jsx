'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BiLoaderAlt, BiLockAlt } from 'react-icons/bi';

export default function CreatorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsUnverified(false);
    setResendMsg('');

    try {
      const res = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
        }),
      });
      const data = await res.json();
      if (data.success && data.creator) {
        router.push(`/creator/${data.creator.id}`);
      } else {
        setError(data.error || 'Authentication failed. Check your email and password.');
        if (data.unverified) {
          setIsUnverified(true);
          setUnverifiedEmail(data.email || email);
        }
      }
    } catch (err) {
      setError('Server error during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const targetEmail = unverifiedEmail || email;
    if (!targetEmail) return;
    setResending(true);
    setResendMsg('');
    try {
      const res = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend_verification',
          email: targetEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResendMsg(data.message || 'Verification email sent! Check your inbox.');
      } else {
        setError(data.error || 'Failed to resend verification link.');
      }
    } catch (_) {
      setError('Network error while resending verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-50">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Login</h1>
          <p className="text-xs text-slate-500">
            Access your creator dashboard, manage subscriptions, and build portfolio websites.
          </p>
        </div>

        {resendMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            {resendMsg}
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold space-y-2">
            <p>{error}</p>
            {isUnverified && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
              >
                {resending ? (
                  <>
                    <BiLoaderAlt className="animate-spin text-xs" />
                    <span>Resending link...</span>
                  </>
                ) : (
                  <span>Resend Verification Email →</span>
                )}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Link href="/creator/recovery" className="text-xs text-slate-600 hover:text-slate-900 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Continue →</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 space-y-2">
          <p className="text-xs text-slate-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/creator/register" className="font-semibold text-slate-900 hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
