'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import SubscriberForm from '@/components/admin/forms/SubscriberForm';

export default function AdminSubscribersPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=subscribers');
      const data = await res.json();
      if (data.success) {
        setSubs(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  return (
    <AdminTableLayout
      title="Newsletter Subscribers"
      subtitle="Email audience list receiving platform updates, product news, and design tutorials."
      badgeText="Subscriber"
      badgeColor="primary"
      tableName="subscribers"
      records={subs}
      loading={loading}
      onRefresh={fetchSubs}
      FormComponent={SubscriberForm}
      searchPlaceholder="Search subscribers by email or source..."
      filterPredicate={(s, q) =>
        s.email?.toLowerCase().includes(q) || s.source?.toLowerCase().includes(q)
      }
      columns={['ID', 'Subscriber Email', 'Status', 'Acquisition Channel', 'Subscribed Date']}
      renderRow={(s) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{s.id}</td>
          <td className="px-4 py-3 font-mono font-semibold text-slate-800">{s.email}</td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                s.status === 'SUBSCRIBED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {s.status}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{s.source || 'FOOTER'}</td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {s.subscribed_at ? new Date(s.subscribed_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
