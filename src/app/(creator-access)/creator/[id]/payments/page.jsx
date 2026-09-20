'use client';

import { useState } from 'react';
import { useCreator } from '../layout';
import {
  BiCreditCard,
  BiReceipt,
  BiCheckCircle,
  BiX,
  BiPrinter,
  BiSearch,
  BiRefresh,
} from 'react-icons/bi';

export default function CreatorPaymentsPage() {
  const { creator, payments = [], stats = {}, refetch } = useCreator();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const totalSpentFormatted = (Number(stats?.totalSpentCents || 0) / 100).toFixed(2);

  const filtered = payments.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.transaction_id?.toLowerCase().includes(q) ||
      p.package_name?.toLowerCase().includes(q) ||
      p.payment_method?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing & Invoices</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Financial
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Review payment receipts, subscription charges, package renewals, and downloadable tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch && refetch()}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh transactions"
          >
            <BiRefresh className="text-lg" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Billed</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ${totalSpentFormatted} <span className="text-xs text-slate-400 font-normal">USD</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <BiCheckCircle className="text-xs" />
            <span>All charges successfully processed</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Invoices Issued</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{payments.length}</div>
          <p className="text-[11px] text-slate-500">Official itemized tax receipts generated</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Settlement Currency</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">USD ($)</div>
          <p className="text-[11px] text-slate-500">Zero international conversion fees</p>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              placeholder="Search by transaction ID, package, method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {payments.length} transactions
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3 whitespace-nowrap">Transaction ID</th>
                <th className="px-4 py-3 whitespace-nowrap">Package / Plan</th>
                <th className="px-4 py-3 whitespace-nowrap">Amount</th>
                <th className="px-4 py-3 whitespace-nowrap">Method</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const amount = (Number(p.amount_in_cents || 0) / 100).toFixed(2);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {p.transaction_id}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {p.package_name || 'Portfolio Package'}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 font-mono">
                        ${amount} <span className="text-[10px] text-slate-400 font-normal">{p.currency || 'USD'}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-[11px] font-semibold">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px]">
                          {p.payment_method}
                        </span>
                      </td>
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
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(p)}
                          className="px-3 py-1 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice / Receipt View Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-lg w-full rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl space-y-6 relative text-slate-800">
            <button
              type="button"
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close receipt modal"
            >
              <BiX className="text-2xl" />
            </button>

            {/* Receipt Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  PB
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Official Payment Receipt</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    TXN: {selectedInvoice.transaction_id}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                PAID IN FULL
              </span>
            </div>

            {/* Receipt Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-500">
                <span>Billed To:</span>
                <span className="text-slate-900 font-semibold">{creator?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-500">
                <span>Account Email:</span>
                <span className="text-slate-900 font-mono">{creator?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-500">
                <span>Subscription Plan:</span>
                <span className="text-slate-900 font-semibold">
                  {selectedInvoice.package_name || 'Creator Plan'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-500">
                <span>Payment Method:</span>
                <span className="text-slate-900 font-mono">{selectedInvoice.payment_method}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-500">
                <span>Transaction Date:</span>
                <span className="text-slate-900 font-mono">
                  {new Date(selectedInvoice.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 pt-3 text-sm font-bold border-t border-slate-200">
                <span className="text-slate-900">Total Amount Settled:</span>
                <span className="text-slate-900 font-mono">
                  ${(Number(selectedInvoice.amount_in_cents || 0) / 100).toFixed(2)}{' '}
                  {selectedInvoice.currency || 'USD'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BiPrinter className="text-base" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
