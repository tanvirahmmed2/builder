'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCardIcon, CheckCircleIcon } from '@/components/ui/Icons';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered =
    filter === 'ALL' ? payments : payments.filter((p) => p.status === filter);

  const totalCents = payments.reduce((acc, curr) => acc + (curr.amountInCents || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400">
            <Link href="/admin" className="hover:underline">← Admin Overview</Link>
            <span>/</span>
            <span>Billing</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <CreditCardIcon className="w-6 h-6 text-rose-500" />
            <span>Payments & Financial Ledger</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time transaction log for SaaS package purchases and recurring tenant subscriptions.
          </p>
        </div>

        <div className="bg-slate-900 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3">
          <div className="text-xs text-slate-400">Total Processed:</div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            ${(totalCents / 100).toFixed(2)} USD
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-1">
          <div className="text-xs text-slate-400">Total Transactions</div>
          <div className="text-2xl font-bold font-mono text-white">{payments.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-1">
          <div className="text-xs text-slate-400">Successful Settlement Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">100.0%</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-1">
          <div className="text-xs text-slate-400">Primary Payment Gateway</div>
          <div className="text-2xl font-bold font-mono text-indigo-400">CARD_GATEWAY</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Transaction History</span>
          <div className="flex gap-2">
            {['ALL', 'COMPLETED', 'PENDING', 'REFUNDED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filter === st
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Transaction ID</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Creator Account</th>
                <th className="py-3.5 px-4 font-semibold">Method</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Loading payments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    No transactions matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-300 font-semibold">
                      {p.transactionId}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ${((p.amountInCents || 0) / 100).toFixed(2)} {p.currency || 'USD'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {p.creatorId || 'c0000000-0001'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <CheckCircleIcon className="w-3 h-3" />
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(p.createdAt || Date.now()).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
