'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import AdminForm from '@/components/admin/forms/AdminForm';

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resendingEmail, setResendingEmail] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [actionNotice, setActionNotice] = useState({ text: '', type: 'info' });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/new-admin/list');
      const data = await res.json();
      if (data.success) {
        setAdmins(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleToggleStatus = async (admin) => {
    try {
      setUpdatingStatusId(admin.id);
      setActionNotice({ text: '', type: 'info' });
      const res = await fetch('/api/admin/new-admin/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_status', id: admin.id }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice({
          text: data.message || `Status updated for ${admin.name}.`,
          type: 'success',
        });
        fetchAdmins();
      } else {
        setActionNotice({
          text: data.error || 'Failed to update admin account status.',
          type: 'error',
        });
      }
    } catch (err) {
      setActionNotice({ text: 'Network error updating account status.', type: 'error' });
    } finally {
      setUpdatingStatusId(null);
      setTimeout(() => setActionNotice({ text: '', type: 'info' }), 6000);
    }
  };

  const handleResendCode = async (email) => {
    try {
      setResendingEmail(email);
      setActionNotice({ text: '', type: 'info' });
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend_code', email }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice({
          text: `Verification code successfully resent to ${email} via Brevo.`,
          type: 'success',
        });
      } else {
        setActionNotice({
          text: data.error || 'Failed to resend verification code.',
          type: 'error',
        });
      }
    } catch (err) {
      setActionNotice({ text: 'Network error resending code.', type: 'error' });
    } finally {
      setResendingEmail(null);
      setTimeout(() => setActionNotice({ text: '', type: 'info' }), 6000);
    }
  };

  const activeAdminCount = admins.filter(
    (a) => (a.role || '').toLowerCase() === 'admin' && a.is_active !== false && a.isActive !== false
  ).length;

  return (
    <div className="space-y-4">
      {actionNotice.text && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
            actionNotice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-sky-50 border-sky-200 text-sky-800'
          }`}
        >
          <span>{actionNotice.text}</span>
          <button
            onClick={() => setActionNotice({ text: '', type: 'info' })}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      <AdminTableLayout
        title="Platform Administrators"
        subtitle="Manage internal operators and platform staff with Brevo email verification. At least one Super Admin must remain active."
        badgeText="Admin"
        badgeColor="secondary"
        tableName="admin"
        apiEndpoint="/api/admin/new-admin/list"
        records={admins}
        loading={loading}
        onRefresh={fetchAdmins}
        FormComponent={AdminForm}
        formProps={{ apiEndpoint: '/api/admin/new-admin' }}
        searchPlaceholder="Search admins by name, email, or role..."
        filterPredicate={(admin, q) =>
          admin.name?.toLowerCase().includes(q) ||
          admin.email?.toLowerCase().includes(q) ||
          admin.role?.toLowerCase().includes(q)
        }
        columns={['ID', 'Name', 'Email Address', 'Role', 'Status (Click to toggle)', 'Verification', 'Last Login', 'Created At']}
        renderRow={(admin) => {
          const isVerified = admin.is_verified === true || admin.isVerified === true;
          const isActive = admin.is_active !== false && admin.isActive !== false;
          const role = (admin.role || 'support').toLowerCase();
          const isLastActiveAdmin = role === 'admin' && isActive && activeAdminCount <= 1;

          const roleBadgeStyles = {
            developer: 'bg-cyan-50 text-cyan-700 border-cyan-200',
            marketer: 'bg-orange-50 text-orange-700 border-orange-200',
            admin: 'bg-purple-50 text-purple-700 border-purple-200',
            manager: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            support: 'bg-teal-50 text-teal-700 border-teal-200',
          };

          const roleLabels = {
            developer: 'Developer',
            marketer: 'Marketer',
            admin: 'Super Admin',
            manager: 'Manager',
            support: 'Support',
          };

          return (
            <>
              <td className="px-4 py-3 font-mono font-bold text-slate-500">#{admin.id}</td>
              <td className="px-4 py-3 font-semibold text-slate-800">{admin.name}</td>
              <td className="px-4 py-3 font-mono text-slate-600">{admin.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    roleBadgeStyles[role] || 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {roleLabels[role] || role}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  disabled={updatingStatusId === admin.id}
                  onClick={() => handleToggleStatus(admin)}
                  title={
                    isLastActiveAdmin
                      ? 'Protected: At least one Super Admin account must remain active'
                      : `Click to ${isActive ? 'deactivate' : 'activate'} this account`
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer hover:shadow-xs disabled:opacity-50 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>{updatingStatusId === admin.id ? 'Updating...' : isActive ? 'Active' : 'Inactive'}</span>
                  {isLastActiveAdmin && (
                    <span className="text-[9px] text-amber-600 font-semibold ml-0.5" title="Last active super admin">
                      (Protected)
                    </span>
                  )}
                </button>
              </td>
              <td className="px-4 py-3">
                {isVerified ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Pending Code
                    </span>
                    <button
                      type="button"
                      disabled={resendingEmail === admin.email}
                      onClick={() => handleResendCode(admin.email)}
                      className="text-[10px] text-secondary hover:underline font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      {resendingEmail === admin.email ? 'Sending...' : 'Resend'}
                    </button>
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-slate-500 text-[11px]">
                {admin.last_login_at || admin.lastLoginAt
                  ? new Date(admin.last_login_at || admin.lastLoginAt).toLocaleDateString()
                  : 'Never'}
              </td>
              <td className="px-4 py-3 text-slate-500 text-[11px]">
                {admin.created_at || admin.createdAt
                  ? new Date(admin.created_at || admin.createdAt).toLocaleDateString()
                  : '—'}
              </td>
            </>
          );
        }}
      />
    </div>
  );
}
