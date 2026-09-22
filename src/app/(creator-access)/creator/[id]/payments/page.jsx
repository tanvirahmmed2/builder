'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCreator } from '../layout';
import Link from 'next/link';
import {
  BiCreditCard,
  BiReceipt,
  BiCheckCircle,
  BiX,
  BiPrinter,
  BiSearch,
  BiRefresh,
  BiLoaderAlt,
  BiCheckShield,
  BiRightArrowAlt,
  BiErrorCircle,
  BiWorld,
} from 'react-icons/bi';

function PaymentsContent() {
  const { creator, payments = [], stats = {}, refetch } = useCreator();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderPlaced = searchParams.get('orderPlaced');
  const highlightedPaymentId = searchParams.get('paymentId');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payModalPayment, setPayModalPayment] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const totalSpentFormatted = (Number(stats?.totalSpentCents || 0) / 100).toFixed(2);

  // Auto-open pay modal if arriving from checkout
  useEffect(() => {
    if (orderPlaced && highlightedPaymentId && payments.length > 0) {
      const match = payments.find((p) => String(p.id) === String(highlightedPaymentId));
      if (match && match.status === 'UNPAID') {
        setPayModalPayment(match);
      }
    }
  }, [orderPlaced, highlightedPaymentId, payments]);

  const handlePayNow = async (payment) => {
    setPaying(true);
    setPayError('');
    try {
      const res = await fetch('/api/creator/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pay_invoice',
          creatorId: creator.id,
          paymentId: payment.id,
          paymentMethod: 'PAYONEER',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSuccessData(data);
        if (refetch) await refetch();
      } else {
        setPayError(data.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setPayError('Network error processing Payoneer payment.');
    } finally {
      setPaying(false);
    }
  };

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

  const unpaidCount = payments.filter((p) => p.status === 'UNPAID' || p.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Order Placed Notice Banner */}
      {orderPlaced && (
        <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
              <h3 className="font-bold text-sm">Order Created Successfully!</h3>
            </div>
            <p className="text-xs text-indigo-700">
              Your unpaid package invoice is listed below. Click <strong className="font-semibold">"Pay Now"</strong> to complete payment via Payoneer and activate your subscription.
            </p>
          </div>
          {highlightedPaymentId && (
            <button
              type="button"
              onClick={() => {
                const match = payments.find((p) => String(p.id) === String(highlightedPaymentId));
                if (match) setPayModalPayment(match);
              }}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              Pay Now via Payoneer →
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing & Invoices</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Financial
            </span>
            {unpaidCount > 0 && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {unpaidCount} Unpaid
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Review payment receipts, outstanding invoices, Payoneer transactions, and activate your package subscriptions.
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
            <span>Completed settlements</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Invoices Issued</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{payments.length}</div>
          <p className="text-[11px] text-slate-500">{unpaidCount > 0 ? `${unpaidCount} awaiting payment` : 'All invoices settled'}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment Gateway</span>
          <div className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">P</span>
            <span>Payoneer Global</span>
          </div>
          <p className="text-[11px] text-slate-500">Fast, verified payment processing</p>
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
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {payments.length} invoices
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3 whitespace-nowrap">Invoice / Transaction</th>
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
                    No payment invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const amount = (Number(p.amount_in_cents || 0) / 100).toFixed(2);
                  const isUnpaid = p.status === 'UNPAID' || p.status === 'PENDING';
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        String(p.id) === String(highlightedPaymentId) ? 'bg-indigo-50/40' : ''
                      }`}
                    >
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
                              : isUnpaid
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                        {isUnpaid && (
                          <button
                            type="button"
                            onClick={() => setPayModalPayment(p)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer"
                          >
                            <span>Pay Now</span>
                            <BiRightArrowAlt className="text-sm" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          <BiReceipt className="text-slate-400 text-xs" />
                          <span>Receipt</span>
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

      {/* Payoneer Payment Modal */}
      {payModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  P
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Payoneer Payment Gateway</h3>
                  <p className="text-[11px] text-slate-500">Invoice: {payModalPayment.transaction_id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPayModalPayment(null);
                  setPaymentSuccessData(null);
                  setPayError('');
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <BiX className="text-xl" />
              </button>
            </div>

            {paymentSuccessData ? (
              <div className="space-y-5 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 text-3xl">
                  <BiCheckCircle />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Payment Completed!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your payment of ${(Number(payModalPayment.amount_in_cents || 0) / 100).toFixed(2)} {payModalPayment.currency || 'USD'} has been confirmed via Payoneer. Your subscription is now <strong className="text-emerald-600 font-bold">ACTIVE</strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Package:</span>
                    <strong className="text-slate-900">{payModalPayment.package_name || 'Portfolio Package'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subscription Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">ACTIVE</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <Link
                    href={`/creator/${creator.id}/webites?setup=true`}
                    onClick={() => setPayModalPayment(null)}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <BiWorld className="text-base" />
                    <span>Setup Subscription & Provision Website →</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setPayModalPayment(null);
                      setPaymentSuccessData(null);
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {payError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <BiErrorCircle className="text-base shrink-0" />
                    <span>{payError}</span>
                  </div>
                )}

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Package Name:</span>
                    <strong className="text-slate-900 font-semibold">{payModalPayment.package_name || 'Portfolio Package'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Invoice Ref:</span>
                    <span className="font-mono text-slate-700">{payModalPayment.transaction_id}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Payee:</span>
                    <span className="text-slate-800">{creator?.name} ({creator?.email})</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">Total Due:</span>
                    <div className="text-xl font-black text-indigo-600 font-mono">
                      ${(Number(payModalPayment.amount_in_cents || 0) / 100).toFixed(2)}{' '}
                      <span className="text-xs text-slate-400 font-normal">{payModalPayment.currency || 'USD'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/40 text-[11px] text-indigo-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                    <BiCheckShield className="text-sm" />
                    <span>Payoneer Checkout Integration</span>
                  </div>
                  <p>
                    Clicking "Pay with Payoneer" will authorize and execute payment for this invoice, immediately activating your package subscription quota.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePayNow(payModalPayment)}
                  disabled={paying}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {paying ? (
                    <>
                      <BiLoaderAlt className="animate-spin text-base" />
                      <span>Processing Payoneer Transaction...</span>
                    </>
                  ) : (
                    <>
                      <BiCreditCard className="text-base" />
                      <span>Pay with Payoneer (${(Number(payModalPayment.amount_in_cents || 0) / 100).toFixed(2)}) →</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <BiReceipt className="text-2xl text-slate-800" />
                <h3 className="text-base font-bold text-slate-900">Official Invoice Receipt</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <BiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium">Invoice Reference</span>
                <span className="font-mono font-bold text-slate-800">{selectedInvoice.transaction_id}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Date</span>
                  <div className="text-slate-800 font-medium mt-0.5">
                    {selectedInvoice.created_at ? new Date(selectedInvoice.created_at).toLocaleDateString() : '—'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Status</span>
                  <div className="mt-0.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedInvoice.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-slate-100 py-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-700 font-semibold">{selectedInvoice.package_name || 'Portfolio Package'}</span>
                  <span className="font-mono font-bold text-slate-900">
                    ${(Number(selectedInvoice.amount_in_cents || 0) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Payment Method: {selectedInvoice.payment_method}</span>
                  <span>Currency: {selectedInvoice.currency || 'USD'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono text-base text-indigo-600">
                  ${(Number(selectedInvoice.amount_in_cents || 0) / 100).toFixed(2)} {selectedInvoice.currency || 'USD'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {(selectedInvoice.status === 'UNPAID' || selectedInvoice.status === 'PENDING') && (
                <button
                  type="button"
                  onClick={() => {
                    const inv = selectedInvoice;
                    setSelectedInvoice(null);
                    setPayModalPayment(inv);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BiCreditCard className="text-sm" />
                  <span>Pay Now via Payoneer</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BiPrinter className="text-sm" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatorPaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center">
          <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
        </div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}
