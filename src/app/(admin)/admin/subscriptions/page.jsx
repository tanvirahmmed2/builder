'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import SubscriptionForm from '@/components/admin/forms/SubscriptionForm';

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=subscription');
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
      title="Creator Subscriptions"
      subtitle="Active, trialing, and past-due platform package memberships."
      badgeText="Subscription"
      badgeColor="primary"
      tableName="subscription"
      records={subs}
      loading={loading}
      onRefresh={fetchSubs}
      FormComponent={SubscriptionForm}
      searchPlaceholder="Search subscriptions by creator ID or package ID..."
      filterPredicate={(s, q) =>
        String(s.creator_id).includes(q) ||
        String(s.package_id).includes(q) ||
        s.status?.toLowerCase().includes(q)
      }
      columns={['ID', 'Creator ID', 'Package ID', 'Status', 'Period Start', 'Period End', 'Cancel At End']}
      renderRow={(s) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{s.id}</td>
          <td className="px-4 py-3 font-bold text-slate-800">Creator #{s.creator_id}</td>
          <td className="px-4 py-3 font-semibold text-slate-700">Package #{s.package_id}</td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                s.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : s.status === 'TRIALING'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {s.status}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {s.current_period_start ? new Date(s.current_period_start).toLocaleDateString() : '—'}
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}
          </td>
          <td className="px-4 py-3 text-[11px] font-semibold text-slate-600">
            {s.cancel_at_period_end ? 'Yes (Pending cancel)' : 'No (Auto-renew)'}
          </td>
        </>
      )}
    />
  );
}
