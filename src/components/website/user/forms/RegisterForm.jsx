'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { BiUser, BiEnvelope, BiPhone, BiLockAlt, BiLoaderAlt, BiArrowBack } from 'react-icons/bi';

export default function CustomerRegisterForm() {
  const params = useParams();
  const router = useRouter();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`/api/${domain}/user/auth/register`, {
        firstName,
        lastName,
        email,
        phone,
        password
      });

      if (res.data?.success) {
        router.push(`${basePrefix}/user/control`);
      } else {
        setError(res.data?.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Customer registration error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
        <p className="text-xs text-slate-400">Join our customer community for fast order checkout and support</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400">First Name</label>
            <div className="relative mt-1">
              <BiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base" />
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400">Email Address</label>
          <div className="relative mt-1">
            <BiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-9 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400">Phone</label>
          <div className="relative mt-1">
            <BiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
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
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Register</span>
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
        <Link href={`${basePrefix}/user/auth/login`} className="hover:text-blue-400">
          Already have an account? Sign In
        </Link>
        <Link href={`${basePrefix}/`} className="flex items-center gap-1 hover:text-white">
          <BiArrowBack />
          <span>Back to Store</span>
        </Link>
      </div>
    </div>
  );
}

