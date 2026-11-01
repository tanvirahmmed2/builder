'use client';
import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { BiStore, BiLogOut, BiUser } from 'react-icons/bi';

export default function CustomerNavbar({ user }) {
  const params = useParams();
  const router = useRouter();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  const handleLogout = async () => {
    try {
      await axios.post(`/api/${domain}/user/auth/logout`);
    } catch (_) {}
    router.push(`${basePrefix}/user/auth/login`);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Link
          href={`${basePrefix}/`}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <BiStore className="text-base" />
          <span>Return to Store</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
              {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden sm:inline font-medium">{user.first_name || 'Customer'}</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-white/20 hover:text-white transition-colors"
          title="Sign Out"
        >
          <BiLogOut className="text-sm" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

