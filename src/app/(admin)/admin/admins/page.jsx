'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import AdminForm from '@/components/admin/forms/AdminForm';

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=admin');
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

  return (
    <AdminTableLayout
      title="Platform Administrators"
      subtitle="Manage internal operators and platform staff. (Role-free administrator domain)"
      badgeText="Admin"
      badgeColor="secondary"
      tableName="admin"
      records={admins}
      loading={loading}
      onRefresh={fetchAdmins}
      FormComponent={AdminForm}
      searchPlaceholder="Search admins by name or email..."
      filterPredicate={(admin, q) =>
        admin.name?.toLowerCase().includes(q) || admin.email?.toLowerCase().includes(q)
      }
      columns={['ID', 'Name', 'Email Address', 'Status', 'Last Login', 'Created At']}
      renderRow={(admin) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{admin.id}</td>
          <td className="px-4 py-3 font-semibold text-slate-800">{admin.name}</td>
          <td className="px-4 py-3 font-mono text-slate-600">{admin.email}</td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                admin.isActive !== false
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {admin.isActive !== false ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : 'Never'}
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
