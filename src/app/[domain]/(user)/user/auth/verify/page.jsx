'use client';
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BiCheckCircle } from 'react-icons/bi';

export default function UserVerifyPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center space-y-4">
        <BiCheckCircle className="mx-auto text-5xl text-emerald-400" />
        <h2 className="text-2xl font-bold text-white">Account Verified</h2>
        <p className="text-xs text-slate-400">Your customer identity has been confirmed. You may now sign in.</p>
        <Link
          href={`${basePrefix}/user/auth/login`}
          className="inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
        >
          Sign In Now
        </Link>
      </div>
    </div>
  );
}

