'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import PaymentForm from '@/components/admin/forms/PaymentForm';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=payment');
      const data = await res.json();
      if (data.success) {
        setPayments(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <AdminTableLayout
      title="Payment Transactions"
      subtitle="Financial records, checkout revenue, subscription charges, and refund history."
      badgeText="Payment"
      badgeColor="secondary"
      tableName="payment"
      records={payments}
      loading={loading}
      onRefresh={fetchPayments}
      FormComponent={PaymentForm}
      searchPlaceholder="Search payments by txn ID, creator ID, or method..."
      filterPredicate={(p, q) =>
        p.transaction_id?.toLowerCase().includes(q) ||
        String(p.creator_id).includes(q) ||
        p.payment_method?.toLowerCase().includes(q)
      }
      columns={['ID', 'Transaction ID', 'Creator ID', 'Amount', 'Method', 'Status', 'Date']}
      renderRow={(p) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{p.id}</td>
          <td className="px-4 py-3 font-mono font-bold text-slate-800">{p.transaction_id}</td>
          <td className="px-4 py-3 font-semibold text-slate-700">Creator #{p.creator_id}</td>
          <td className="px-4 py-3 font-bold text-slate-900">
            ${((p.amount_in_cents || 0) / 100).toFixed(2)} {p.currency || 'USD'}
          </td>
          <td className="px-4 py-3 text-slate-600 text-[11px] font-semibold">{p.payment_method}</td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                p.status === 'COMPLETED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : p.status === 'PENDING'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {p.status}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
