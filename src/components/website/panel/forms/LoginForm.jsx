'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { BiShieldQuarter, BiEnvelope, BiLockAlt, BiLoaderAlt, BiArrowBack } from 'react-icons/bi';

export default function StaffLoginForm() {
  const params = useParams();
  const router = useRouter();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`/api/${domain}/panel/auth/login`, {
        identifier,
        password
      });

      if (res.data?.success) {
        window.location.replace(`${basePrefix}/panel/control/overview`);
      } else {
        setError(res.data?.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Staff login error:', err);
      setError(err.response?.data?.error || 'Sign in failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center space-y-2 mb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 mb-3">
          <BiShieldQuarter className="text-2xl" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Staff Console</h2>
        <p className="text-xs text-slate-400">Authenticated access for managers, cashiers, and operators</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400">Staff Email or Phone</label>
          <div className="relative mt-1">
            <BiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base" />
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="staff@example.com"
              className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-9 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400">Password</label>
          <div className="relative mt-1">
            <BiLockAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-9 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <BiLoaderAlt className="animate-spin text-lg" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <span>Access Control Panel</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href={`${basePrefix}/`} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white">
          <BiArrowBack />
          <span>Return to Storefront</span>
        </Link>
      </div>
    </div>
  );
}

