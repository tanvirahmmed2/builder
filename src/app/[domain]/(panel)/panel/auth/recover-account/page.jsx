'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BiEnvelope, BiArrowBack, BiCheckCircle } from 'react-icons/bi';

export default function StaffRecoverAccountPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">Staff Account Recovery</h2>
          <p className="text-xs text-slate-400">Enter your authorized staff email to receive recovery instructions</p>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <BiCheckCircle className="mx-auto text-4xl text-emerald-400" />
            <p className="text-xs text-slate-300">
              Recovery link dispatched to {email} if found on record.
            </p>
            <Link
              href={`${basePrefix}/panel/auth/login`}
              className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Staff Email</label>
              <div className="relative mt-1">
                <BiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@example.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-9 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
            >
              Send Password Reset
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href={`${basePrefix}/panel/auth/login`} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white">
            <BiArrowBack />
            <span>Return to Staff Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

