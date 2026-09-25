'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BiCreditCard,
  BiCheckCircle,
  BiCube,
  BiLoaderAlt,
  BiLockAlt,
  BiShieldQuarter,
  BiArrowBack,
  BiUser,
} from 'react-icons/bi';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPkgId = searchParams.get('packageId');

  const [creator, setCreator] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedPkgId, setSelectedPkgId] = useState(initialPkgId ? Number(initialPkgId) : null);
  const [paymentMethod, setPaymentMethod] = useState('PAYONEER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Verify creator session
  useEffect(() => {
    async function checkCreatorSession() {
      setCheckingAuth(true);
      try {
        const res = await fetch('/api/creator/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'me' }),
        });
        const data = await res.json();
        if (data.success && data.creator) {
          setCreator(data.creator);
        } else {
          setCreator(null);
        }
      } catch {
        setCreator(null);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkCreatorSession();
  }, []);

  // 2. Fetch available packages
  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => {
        const list = data.packages || [];
        setPackages(list);
        if (!selectedPkgId && list.length > 0) {
          const matched = initialPkgId ? list.find((p) => p.id === Number(initialPkgId)) : list[0];
          setSelectedPkgId(matched ? matched.id : list[0].id);
        }
      })
      .catch(console.error);
  }, [initialPkgId, selectedPkgId]);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];
  const price = selectedPkg ? (Number(selectedPkg.price_in_cents || 0) / 100).toFixed(2) : '0.00';

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (!creator) {
      router.push(`/creator/login?redirect=/creator/checkout?packageId=${selectedPkgId}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create UNPAID purchase and UNPAID payment invoice
      const res = await fetch('/api/creator/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_order',
          creatorId: creator.id,
          packageId: selectedPkgId || selectedPkg?.id,
          billingInterval: selectedPkg?.billing_interval || 'MONTHLY',
          paymentMethod: paymentMethod || 'PAYONEER',
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Redirect to creator payments page to view unpaid invoice and pay now via Payoneer
        router.push(`/creator/${creator.id}/payments?orderPlaced=true&paymentId=${data.payment?.id}`);
      } else {
        setError(data.error || 'Failed to generate order invoice. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error processing checkout order.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
        <p className="text-xs text-slate-500 font-medium">Verifying creator authentication...</p>
      </div>
    );
  }

  // If not logged in as a creator, prompt to login
  if (!creator) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto text-3xl shadow-sm">
          <BiUser />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Creator Login Required</h1>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            You must be logged in with your creator account to purchase a platform package and create your website subscription.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={`/creator/login?redirect=${encodeURIComponent(`/creator/checkout?packageId=${selectedPkgId || 1}`)}`}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all text-center"
          >
            Log In as Creator →
          </Link>
          <Link
            href="/creator/register"
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all text-center"
          >
            Register Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <BiArrowBack className="text-base" />
          <span>Back to Packages</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold">
          <BiLockAlt className="text-slate-500" />
          <span>Secure Checkout Gateway</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Package & Subscription</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Review your selected plan. Confirming will generate your unpaid invoice for payment via Payoneer.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center max-w-lg mx-auto">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Package Selector & Details */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BiCube className="text-indigo-600 text-base" />
              <span>Select Your Package</span>
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPkgId;
                const pkgPrice = (Number(pkg.price_in_cents || 0) / 100).toFixed(2);
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{pkg.name}</span>
                        {pkg.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{pkg.description || 'Complete portfolio system'}</p>
                      <div className="text-[11px] text-slate-400">
                        Up to <strong className="text-slate-700">{pkg.max_portfolios || 1} website(s)</strong> • {pkg.billing_interval || 'Monthly'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900 font-mono">${pkgPrice}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{pkg.currency || 'USD'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BiCreditCard className="text-indigo-600 text-base" />
              <span>Payment Gateway</span>
            </h2>

            <div className="p-4 rounded-2xl border-2 border-indigo-600 bg-indigo-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  P
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Payoneer Global Payment</div>
                  <p className="text-[11px] text-slate-500">Pay securely via Payoneer balance, bank transfer, or card.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                Recommended
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-5 border border-slate-800">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Order Summary</span>
              <h3 className="text-xl font-bold text-white mt-1">{selectedPkg?.name || 'Selected Package'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Creator: {creator.name} ({creator.email})</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Billing Interval:</span>
                <span className="text-white font-semibold capitalize">{selectedPkg?.billing_interval || 'Monthly'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Included Websites:</span>
                <span className="text-white font-semibold">{selectedPkg?.max_portfolios || 1} Site(s)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Setup & Activation:</span>
                <span className="text-emerald-400 font-semibold">Complimentary ($0)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Initial Status:</span>
                <span className="text-amber-400 font-semibold">Unpaid (Awaiting Payment)</span>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total Due:</span>
                <div className="text-2xl font-black text-white font-mono">
                  ${price} <span className="text-xs text-slate-400 font-normal">{selectedPkg?.currency || 'USD'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmOrder}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <BiLoaderAlt className="animate-spin text-base" />
                  <span>Generating Unpaid Order...</span>
                </>
              ) : (
                <>
                  <BiShieldQuarter className="text-base" />
                  <span>Confirm Order & Proceed to Invoices →</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-normal">
              Clicking confirm will record your unpaid order in your creator billing portal where you can review your invoice and pay instantly via Payoneer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
