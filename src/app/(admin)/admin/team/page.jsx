'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UsersIcon, PlusIcon, ShieldCheckIcon, CheckCircleIcon } from '@/components/ui/Icons';

export default function AdminTeamManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_admin',
          adminData: { name, email, password, role },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setName('');
        setEmail('');
        setPassword('');
        fetchAdmins();
      } else {
        setError(data.error || 'Failed to add administrator.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAdmin = async (adminId, adminEmail) => {
    if (!confirm(`Are you sure you want to remove administrator ${adminEmail}? This action is irreversible.`)) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_admin', adminId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAdmins();
      } else {
        alert(data.error || 'Failed to remove admin.');
      }
    } catch (err) {
      alert('Error removing admin.');
    }
  };

  const handleToggleStatus = async (adminId) => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_admin_status', adminId }),
      });
      fetchAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400">
            <Link href="/admin" className="hover:underline">← Admin Overview</Link>
            <span>/</span>
            <span>Security Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-rose-500" />
            <span>Platform Administrators & Team Roles</span>
          </h1>
          <p className="text-xs text-slate-400">
            Provision new administrators with role-based access control, manage credentials, and revoke administrative privileges.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all self-start"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* Admin List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            Loading administrators...
          </div>
        ) : (
          admins.map((adm) => (
            <div
              key={adm.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                      {adm.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{adm.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{adm.email}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                      adm.role === 'SUPER_ADMIN'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {adm.role}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span
                      className={`font-semibold ${
                        adm.isActive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {adm.isActive ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verified:</span>
                    <span className="text-white">Yes (Email 2FA Ready)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(adm.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <button
                  onClick={() => handleToggleStatus(adm.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    adm.isActive ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  {adm.isActive ? 'Suspend' : 'Activate'}
                </button>

                {admins.length > 1 ? (
                  <button
                    onClick={() => handleRemoveAdmin(adm.id, adm.email)}
                    className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Remove Admin
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-600 italic">Primary Root Admin</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Invite Platform Administrator</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAddAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Administrator Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Wells"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jordan.admin@saasplatform.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Security Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="ADMIN">Standard Administrator</option>
                  <option value="SUPER_ADMIN">Super Administrator (Full Root Access)</option>
                  <option value="SUPPORT_ADMIN">Support / Helpdesk Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
                >
                  {saving ? 'Creating Admin...' : 'Confirm & Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
