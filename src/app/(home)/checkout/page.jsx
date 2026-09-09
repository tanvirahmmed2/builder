'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCardIcon, CheckCircleIcon, BoxIcon } from '@/components/ui/Icons';

function MainCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPkgId = searchParams.get('packageId') || 'b0000000-0000-0000-0000-000000000002';
  const creatorId = searchParams.get('creatorId') || 'c0000000-0000-0000-0000-000000000001';

  const [packages, setPackages] = useState([]);
  const [selectedPkgId, setSelectedPkgId] = useState(initialPkgId);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [tenantPortfolio, setTenantPortfolio] = useState(null);

  useEffect(() => {
    fetch('/api/creator')
      .then((res) => res.json())
      .then((data) => {
        if (data.packages) {
          setPackages(data.packages);
        }
      });
  }, []);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0] || {
    name: 'Pro Studio',
    priceInCents: 3500,
    maxPortfolios: 5,
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'purchase_subscription',
          creatorId,
          packageId: selectedPkgId,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTenantPortfolio(data.portfolio);
        setCompleted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircleIcon className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Payment Confirmed & Tenant Provisioned!</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your subscription to <strong>{selectedPkg?.name}</strong> is active. A dedicated PostgreSQL portfolio tenant has been initialized.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Assigned Subdomain:</span>
            <span className="font-mono font-bold text-emerald-400">
              {tenantPortfolio?.subdomain || 'alex-design'}.platform
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Transaction Status:</span>
            <span className="text-white font-semibold">COMPLETED (CARD_SIMULATED)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href={`/builder/${tenantPortfolio?.id || 'd0000000-0000-0000-0000-000000000001'}`}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white text-xs font-bold shadow-lg"
          >
            Launch Drag & Drop Builder →
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
          >
            Creator Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Complete Your Subscription</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your selected plan, simulate your secure payment, and launch your tenant portfolio website.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Package Selector */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Select Package</h3>
          <div className="space-y-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPkgId(pkg.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedPkgId === pkg.id
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{pkg.name}</span>
                    {selectedPkgId === pkg.id && (
                      <span className="text-[10px] bg-indigo-500 text-white font-bold px-1.5 py-0.2 rounded">
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{pkg.description}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="text-lg font-bold font-mono text-white">
                    ${(pkg.priceInCents / 100).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">/ mo</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              {['CARD', 'STRIPE'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                    paymentMethod === m
                      ? 'bg-white/10 border-indigo-500 text-white'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCardIcon className="w-4 h-4" />
                  <span>{m === 'CARD' ? 'Credit Card (Simulated)' : 'Stripe Sandbox'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="md:col-span-5">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6 sticky top-24">
            <h3 className="font-bold text-white text-base">Order Summary</h3>

            <div className="space-y-3 text-xs border-b border-white/10 pb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Package:</span>
                <span className="font-semibold text-white">{selectedPkg?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Billing Cycle:</span>
                <span className="text-white">Monthly recurring</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Tenants:</span>
                <span className="text-white">{selectedPkg?.maxPortfolios || 1} Portfolios</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tenant Provisioning:</span>
                <span className="text-emerald-400 font-bold">Instant Automatic</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="font-bold text-white text-sm">Total Due Today:</span>
              <span className="text-2xl font-black font-mono text-white">
                ${((selectedPkg?.priceInCents || 3500) / 100).toFixed(2)}
              </span>
            </div>

            <form onSubmit={handleCheckout}>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
              >
                <CreditCardIcon className="w-4 h-4" />
                <span>{loading ? 'Authorizing & Provisioning...' : 'Authorize & Start Building →'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MainCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-xs">Loading checkout...</div>}>
      <MainCheckoutContent />
    </Suspense>
  );
}
