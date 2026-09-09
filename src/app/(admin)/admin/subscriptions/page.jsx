'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCardIcon, BoxIcon } from '@/components/ui/Icons';

export default function SubscriptionsManagementPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin');
        const data = await res.json();
        if (data.success) {
          setSubscriptions(data.subscriptions || []);
          setPayments(data.payments || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalVolume = payments.reduce((acc, p) => acc + (p.amountInCents || 0), 0) / 100;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-xs text-indigo-400 hover:underline">← Admin Overview</Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-400">Financials</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
          <div>
            <h1 className="text-2xl font-bold text-white">Subscriptions & Payment Ledger</h1>
            <p className="text-xs text-slate-400">
              Audit recurring creator subscriptions, revenue transactions, and payment statuses.
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Total Captured Revenue</div>
            <div className="text-xl font-black text-emerald-400">${totalVolume.toFixed(2)} USD</div>
          </div>
        </div>
      </div>

      {/* Subscriptions & Payments in 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recurring Subscriptions */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BoxIcon className="w-4 h-4 text-indigo-400" />
            <span>Active Subscriptions ({subscriptions.length})</span>
          </h2>

          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    {sub.creator?.name || 'Creator'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {sub.creator?.email} • Plan: <span className="text-indigo-400 font-semibold">{sub.package?.name || 'Pro'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    Current Period End: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payments Ledger */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCardIcon className="w-4 h-4 text-emerald-400" />
            <span>Completed Payments ({payments.length})</span>
          </h2>

          <div className="space-y-3">
            {payments.map((pmt) => (
              <div
                key={pmt.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    ${(pmt.amountInCents / 100).toFixed(2)} {pmt.currency}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Paid by {pmt.creator?.name || 'Creator'} • Method: {pmt.paymentMethod}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">
                    Txn: {pmt.transactionId}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {pmt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
