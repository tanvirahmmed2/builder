'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BoxIcon, CheckCircleIcon } from '@/components/ui/Icons';

export default function CreatorRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('creator'); // 'creator' or 'manager'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          creatorData: { name, email, password, phone, role },
        }),
      });
      const data = await res.json();
      if (data.success) {
        // If creator role, route them to checkout to purchase package and launch tenant
        router.push(`/creator/checkout?creatorId=${data.creator.id}`);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Server error during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-indigo-500/25">
            P
          </div>
          <h1 className="text-2xl font-black text-white">Create Creator Account</h1>
          <p className="text-xs text-slate-400">
            Build, publish, and monetize your drag-and-drop portfolio website.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="alex@designcraft.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Create secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone (Optional)</label>
              <input
                type="tel"
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="creator">Creator (Site Owner)</option>
                <option value="manager">Manager (Site Collaborator)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all"
          >
            {loading ? 'Setting up Account...' : 'Continue to Package Selection →'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-400 space-y-2">
          <div>
            Already have an account?{' '}
            <Link href="/creator/login" className="text-indigo-400 hover:underline font-semibold">
              Sign in
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
