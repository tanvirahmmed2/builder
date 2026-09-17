'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UsersIcon, CheckCircleIcon, ExternalLinkIcon } from '@/components/ui/Icons';

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer/creators');
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
      await fetch('/api/developer/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_creator_role', creatorId, role: nextRole }),
      });
      fetchCreators();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-rose-400">
          <Link href="/developer" className="hover:underline">← Developer Overview</Link>
          <span>/</span>
          <span>Websites Directory</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-rose-500" />
          <span>Creator & Manager Directory</span>
        </h1>
        <p className="text-xs text-slate-400">
          Supervise registered creators and their assigned managers across all hosted portfolio websites.
        </p>
      </div>

      {/* Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            Loading creators directory...
          </div>
        ) : (
          creators.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <h3 className="font-bold text-white text-base">{c.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{c.email}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                      c.role === 'creator'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                    }`}
                  >
                    {c.role}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Verification:</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircleIcon className="w-3 h-3" /> Verified Account
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Website Subdomain:</span>
                    <span className="font-mono text-indigo-300">alex-design.platform</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registered Date:</span>
                    <span className="text-slate-400">{new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <a
                  href="/sites/alex-design"
                  target="_blank"
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                >
                  <span>View Website</span>
                  <ExternalLinkIcon className="w-3 h-3 text-pink-400" />
                </a>

                <button
                  onClick={() => handleToggleRole(c.id, c.role)}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                >
                  Switch Role to {c.role === 'creator' ? 'Manager' : 'Creator'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
