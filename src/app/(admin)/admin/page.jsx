'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  BoxIcon,
  CreditCardIcon,
  AlertCircleIcon,
  UsersIcon,
} from '@/components/ui/Icons';

export default function AdminDashboardPage() {
  const [data, setData] = useState({
    admins: [],
    packages: [],
    features: [],
    subscriptions: [],
    payments: [],
    reports: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin');
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = data.payments.reduce((acc, p) => acc + (p.amountInCents || 0), 0) / 100;
  const pendingReports = data.reports.filter((r) => r.status === 'OPEN').length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-8 rounded-3xl border border-indigo-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400">
            <ShieldCheckIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Super Admin Control Center</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Root Access
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Platform administration, team credentials, packages, subscriptions, and incident resolution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/admins"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
          >
            + Create Admin
          </Link>
          <Link
            href="/admin/packages"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
          >
            + New Package
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Payments Captured</div>
          <div className="text-3xl font-black text-emerald-400">${totalRevenue.toFixed(2)}</div>
          <div className="text-xs text-slate-500">{data.payments.length} successful transactions</div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Subscriptions</div>
          <div className="text-3xl font-black text-indigo-400">{data.subscriptions.length}</div>
          <div className="text-xs text-slate-500">Live creator billing accounts</div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Configured Packages</div>
          <div className="text-3xl font-black text-purple-400">{data.packages.length}</div>
          <div className="text-xs text-slate-500">{data.features.length} master features linked</div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Reports</div>
          <div className="text-3xl font-black text-rose-400">{pendingReports}</div>
          <div className="text-xs text-slate-500">{data.reports.length} total tickets logged</div>
        </div>
      </div>

      {/* Dedicated Task Launchpads */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Administrative Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Admins */}
          <Link
            href="/admin/admins"
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all space-y-3 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <UsersIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-indigo-300">Admin Management</h3>
            <p className="text-xs text-slate-400">
              Create another admin with security rows, monitor verification and 2FA statuses.
            </p>
            <span className="text-xs font-bold text-indigo-400 pt-2 block">Manage Admins ({data.admins.length}) →</span>
          </Link>

          {/* Packages */}
          <Link
            href="/admin/packages"
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-purple-500/40 hover:bg-slate-900/90 transition-all space-y-3 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <BoxIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-purple-300">Packages & Features</h3>
            <p className="text-xs text-slate-400">
              Define SaaS pricing tiers, feature master table, and package_features junction data.
            </p>
            <span className="text-xs font-bold text-purple-400 pt-2 block">Configure Packages ({data.packages.length}) →</span>
          </Link>

          {/* Subscriptions */}
          <Link
            href="/admin/subscriptions"
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all space-y-3 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CreditCardIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-emerald-300">Subscriptions & Payments</h3>
            <p className="text-xs text-slate-400">
              Audit recurring creator subscriptions, renewals, and one-off payment receipts.
            </p>
            <span className="text-xs font-bold text-emerald-400 pt-2 block">View Ledger ({data.subscriptions.length}) →</span>
          </Link>

          {/* Reports */}
          <Link
            href="/admin/reports"
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-rose-500/40 hover:bg-slate-900/90 transition-all space-y-3 group shadow-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircleIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-rose-300">Reports Helpdesk</h3>
            <p className="text-xs text-slate-400">
              Inspect reported inquiries and bugs from Creators and Users; send official Admin responses.
            </p>
            <span className="text-xs font-bold text-rose-400 pt-2 block">Respond to Reports ({data.reports.length}) →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
