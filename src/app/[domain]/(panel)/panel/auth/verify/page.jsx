'use client';
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BiShieldCheck } from 'react-icons/bi';

export default function StaffVerifyPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 text-center space-y-4">
        <BiShieldCheck className="mx-auto text-5xl text-emerald-400" />
        <h2 className="text-2xl font-bold text-white">Staff Credential Confirmed</h2>
        <p className="text-xs text-slate-400">Security challenge passed. You may now proceed to the console.</p>
        <Link
          href={`${basePrefix}/panel/auth/login`}
          className="inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
        >
          Sign In to Console
        </Link>
      </div>
    </div>
  );
}

