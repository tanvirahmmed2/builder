'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UsersIcon, CheckCircleIcon } from '@/components/ui/Icons';

export default function DashboardTeamPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/creator');
      const data = await res.json();
      if (data.success) {
        setCreators(data.creators || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const handleToggleRole = async (creatorId, currentRole) => {
    const nextRole = currentRole === 'creator' ? 'manager' : 'creator';
    try {
      await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_role', creatorId, role: nextRole }),
      });
      fetchCreators();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard" className="text-indigo-400 hover:underline">← Dashboard</Link>
            <span>/</span>
            <span>Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Creator & Manager Team Roles</h1>
          <p className="text-xs text-slate-400">
            Both <strong>Creator</strong> and <strong>Manager</strong> roles can update every aspect of the portfolio website, including Blog, Appointments, Experiences, and Reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {creators.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between gap-4 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <img
                  src={c.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                />
                <div>
                  <div className="font-bold text-white text-base">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.email}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.role === 'creator'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {c.role}
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3" /> Full Edit Rights
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => handleToggleRole(c.id, c.role)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                >
                  Switch to {c.role === 'creator' ? 'Manager' : 'Creator'}
                </button>
                <span className="text-[10px] text-slate-500">1-Click Role Toggle</span>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
