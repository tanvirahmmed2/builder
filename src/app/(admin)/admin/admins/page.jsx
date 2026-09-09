'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheckIcon, PlusIcon, CheckCircleIcon } from '@/components/ui/Icons';

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
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
        setSuccessMsg(`Admin ${data.admin.name} created successfully with full security rows!`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchAdmins();
      } else {
        setErrorMsg(data.error || 'Failed to create admin.');
      }
    } catch (err) {
      setErrorMsg('Server error creating admin.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-xs text-indigo-400 hover:underline">← Admin Overview</Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400">Team</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Platform Admin Management</h1>
          <p className="text-xs text-slate-400">
            Create and oversee secondary administrative accounts with security rows and role access.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all self-start"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create New Admin</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((adm) => (
          <div
            key={adm.id}
            className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {adm.role}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${adm.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {adm.isActive ? 'Active' : 'Suspended'}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{adm.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{adm.email}</p>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Verified:</span>
                <span className="text-emerald-400 font-semibold">{adm.isVerified ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>2FA Status:</span>
                <span className="text-slate-300">{adm.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between">
                <span>Created At:</span>
                <span className="text-slate-500 text-[11px]">{new Date(adm.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ADMIN MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Create Admin Account</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Scott"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@saasplatform.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Strong admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Administrative Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ADMIN">ADMIN (Full Operations)</option>
                  <option value="SUPPORT_ADMIN">SUPPORT_ADMIN (Reports & Support)</option>
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
