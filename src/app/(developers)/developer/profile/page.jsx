'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BiUser,
  BiCheckShield,
  BiShieldQuarter,
  BiCheckCircle,
  BiXCircle,
  BiTime,
  BiEnvelope,
  BiKey,
  BiDevices,
  BiEdit,
  BiRefresh,
  BiCopy,
  BiCheck,
  BiDesktop,
  BiGlobe,
} from 'react-icons/bi';

export default function DeveloperProfilePage() {
  const [profile, setProfile] = useState(null);
  const [activeSessions, setActiveSessions] = useState(1);
  const [recentLogins, setRecentLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer');
      const data = await res.json();
      if (data.success && data.developer) {
        setProfile(data.developer);
        setActiveSessions(data.activeSessions || 1);
        setRecentLogins(data.recentLogins || []);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopyEmail = () => {
    if (profile?.email) {
      navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRoleBadgeStyle = (role) => {
    const r = (role || '').toLowerCase();
    switch (r) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'developer':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'support':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'marketer':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'DV';

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-white border border-slate-200 rounded-3xl p-8" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl p-5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white border border-slate-200 rounded-3xl p-6" />
          <div className="h-80 bg-white border border-slate-200 rounded-3xl p-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-secondary/10 via-primary/5 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex items-center gap-5 z-10">
          {/* Avatar Initial */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary via-indigo-600 to-primary text-white flex items-center justify-center text-2xl font-bold shadow-md shrink-0 ring-4 ring-slate-50">
            {initials}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {profile?.name || 'Developer'}
              </h1>

              {/* Role badge */}
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border ${getRoleBadgeStyle(
                  profile?.role
                )}`}
              >
                {profile?.role || 'Developer'}
              </span>

              {/* Verified badge */}
              {profile?.is_verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <BiCheckCircle className="text-xs" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <BiEnvelope className="text-slate-400 text-sm" />
              <span>{profile?.email}</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 hover:text-slate-800 text-slate-400 transition-colors cursor-pointer"
                title="Copy Email"
              >
                {copied ? <BiCheck className="text-emerald-600" /> : <BiCopy />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            type="button"
            onClick={fetchProfile}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
            title="Refresh profile data"
          >
            <BiRefresh className="text-xl" />
          </button>
          <Link
            href="/developer/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <BiEdit className="text-base" />
            <span>Edit Profile &amp; Settings</span>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Role</span>
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <BiShieldQuarter className="text-xl" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 capitalize">{profile?.role || 'Developer'}</div>
          <p className="text-[11px] text-slate-400 mt-1">Access permission level</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Status</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <BiCheckCircle className="text-xl" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-600">
            {profile?.is_active !== false ? 'Active' : 'Deactivated'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for administrative tasks</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Two-Factor 2FA</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BiKey className="text-xl" />
            </div>
          </div>
          <div className="text-xl font-bold text-indigo-600">
            {profile?.two_factor_enabled ? 'Enabled' : 'Disabled'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {profile?.two_factor_enabled ? 'Two-step verification active' : 'Standard credentials only'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Sessions</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <BiDevices className="text-xl" />
            </div>
          </div>
          <div className="text-xl font-bold text-purple-600">{activeSessions} Device{activeSessions === 1 ? '' : 's'}</div>
          <p className="text-[11px] text-slate-400 mt-1">Authenticated tokens</p>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Details Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-2xl bg-secondary/10 text-secondary">
              <BiUser className="text-2xl" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Personal &amp; Account Details</h2>
              <p className="text-xs text-slate-500">Overview of your registered operator credentials.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Developer ID</span>
              <span className="font-mono font-bold text-slate-800">#{profile?.id}</span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Full Name</span>
              <span className="font-bold text-slate-900">{profile?.name}</span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Email Address</span>
              <span className="font-medium text-slate-800">{profile?.email}</span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Governance Role</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] border ${getRoleBadgeStyle(profile?.role)}`}>
                {profile?.role}
              </span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Email Verification</span>
              <span className={`inline-flex items-center gap-1 font-bold ${profile?.is_verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                {profile?.is_verified ? <BiCheckCircle /> : <BiXCircle />}
                <span>{profile?.is_verified ? 'Verified Email' : 'Pending Verification'}</span>
              </span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Registration Date</span>
              <span className="text-slate-700 font-medium">
                {profile?.created_at ? new Date(profile.created_at).toLocaleString() : '—'}
              </span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Last Profile Update</span>
              <span className="text-slate-700 font-medium">
                {profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Activity Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <BiCheckShield className="text-2xl" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Security &amp; Device Activity</h2>
              <p className="text-xs text-slate-500">Audit logs and access metadata for this account.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Last Sign In</span>
              <span className="text-slate-800 font-medium">
                {profile?.last_login_at ? new Date(profile.last_login_at).toLocaleString() : 'Never logged in'}
              </span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Last IP Address</span>
              <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {profile?.last_login_ip || '127.0.0.1'}
              </span>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Two-Factor Authentication (2FA)</span>
              <span className={`font-bold ${profile?.two_factor_enabled ? 'text-emerald-600' : 'text-slate-500'}`}>
                {profile?.two_factor_enabled ? 'Protected' : 'Not configured'}
              </span>
            </div>
          </div>

          {/* Recent Login History */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Login Activity</h3>
            {recentLogins.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recent login activity logs found.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {recentLogins.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          entry.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span className="font-bold text-slate-800">{entry.status}</span>
                      <span className="font-mono text-slate-500 text-[10px]">{entry.ip_address || '—'}</span>
                    </div>
                    <span className="text-slate-400">
                      {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
