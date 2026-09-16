'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import AdminForm from '@/components/admin/forms/AdminForm';

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resendingEmail, setResendingEmail] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/admin');
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

  const handleResendCode = async (email) => {
    try {
      setResendingEmail(email);
      setActionNotice('');
      const res = await fetch('/api/admin/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Verification code successfully resent to ${email} via Brevo.`);
      } else {
        setActionNotice(data.error || 'Failed to resend verification code.');
      }
    } catch (err) {
      setActionNotice('Network error resending code.');
    } finally {
      setResendingEmail(null);
      setTimeout(() => setActionNotice(''), 6000);
    }
  };

  return (
    <div className="space-y-4">
      {actionNotice && (
        <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice('')} className="text-sky-500 hover:text-sky-700 font-bold ml-2">×</button>
        </div>
      )}

      <AdminTableLayout
        title="Platform Administrators"
        subtitle="Manage internal operators and platform staff with Brevo email verification."
        badgeText="Admin"
        badgeColor="secondary"
        tableName="admin"
        apiEndpoint="/api/admin/admin"
        records={admins}
        loading={loading}
        onRefresh={fetchAdmins}
        FormComponent={AdminForm}
        searchPlaceholder="Search admins by name or email..."
        filterPredicate={(admin, q) =>
          admin.name?.toLowerCase().includes(q) || admin.email?.toLowerCase().includes(q)
        }
        columns={['ID', 'Name', 'Email Address', 'Status', 'Verification', 'Last Login', 'Created At']}
        renderRow={(admin) => {
          const isVerified = admin.is_verified === true || admin.isVerified === true;
          const isActive = admin.is_active !== false && admin.isActive !== false;

          return (
            <>
              <td className="px-4 py-3 font-mono font-bold text-slate-500">#{admin.id}</td>
              <td className="px-4 py-3 font-semibold text-slate-800">{admin.name}</td>
              <td className="px-4 py-3 font-mono text-slate-600">{admin.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </span>
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
