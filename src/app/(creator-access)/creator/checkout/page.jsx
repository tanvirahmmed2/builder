'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCardIcon, CheckCircleIcon, BoxIcon } from '@/components/ui/Icons';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPkgId = searchParams.get('packageId') || 'b0000000-0000-0000-0000-000000000002';
  const creatorId = searchParams.get('creatorId') || 'c0000000-0000-0000-0000-000000000001';

  const [packages, setPackages] = useState([]);
  const [selectedPkgId, setSelectedPkgId] = useState(initialPkgId);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [websitePortfolio, setWebsitePortfolio] = useState(null);

  useEffect(() => {
    fetch('/api/creator')
      .then((res) => res.json())
      .then((data) => {
        if (data.packages) {
          setPackages(data.packages);
        }
      });
  }, []);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

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
        setWebsitePortfolio(data.portfolio);
        setCompleted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white">Subscribe & Auto-Provision Website</h1>
        <p className="text-sm text-slate-400">
          Select your plan, confirm payment, and launch your drag-and-drop portfolio site.
        </p>
      </div>

      {completed && websitePortfolio ? (
        <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-6 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircleIcon className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Subscription Active!</h2>
            <p className="text-xs text-slate-300 mt-1">
              Your portfolio website has been generated automatically.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-1 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Website Subdomain:</span>
              <strong className="text-indigo-400 font-mono">{websitePortfolio.subdomain}.saasplatform.com</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Portfolio Title:</span>
              <strong className="text-white">{websitePortfolio.title}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Plan:</span>
              <strong className="text-emerald-400">{selectedPkg?.name}</strong>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Open Creator Dashboard →
            </button>
            <a
              href={`/sites/${websitePortfolio.subdomain}`}
              target="_blank"
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
            >
              Preview Live Portfolio Site ↗
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan Selection */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white">1. Select Subscription Package</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                    selectedPkgId === pkg.id
                      ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl'
                      : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">{pkg.name}</span>
                    <input
                      type="radio"
                      name="plan"
                      checked={selectedPkgId === pkg.id}
                      onChange={() => setSelectedPkgId(pkg.id)}
                      className="accent-indigo-500"
                    />
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">${(pkg.priceInCents / 100).toFixed(0)}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{pkg.description}</p>
                </div>
              ))}
            </div>

            {/* Payment Method */}
            <h2 className="text-base font-bold text-white pt-4">2. Payment Method</h2>
            <div className="grid grid-cols-3 gap-3">
              {['CARD', 'PAYPAL', 'CRYPTO'].map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                    paymentMethod === pm
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-900/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {pm === 'CARD' ? 'Credit Card' : pm}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-white font-semibold">
                <CreditCardIcon className="w-4 h-4 text-emerald-400" />
                <span>Simulated Secure Payment Processing</span>
              </div>
              <p>Test sandbox gateway. Completing this order will generate an instant transaction ID and provision your portfolio website.</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 h-fit space-y-4">
            <h3 className="font-bold text-white text-base">Order Summary</h3>
            <div className="space-y-2 text-xs text-slate-300 pb-4 border-b border-white/10">
              <div className="flex justify-between">
                <span>Selected Plan:</span>
                <strong className="text-white">{selectedPkg?.name || 'Pro Studio'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Billing Interval:</span>
                <span>Monthly</span>
              </div>
              <div className="flex justify-between">
                <span>Website Domain:</span>
                <span className="text-emerald-400">Auto-Generated</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-white">Total Due Today:</span>
              <span className="text-2xl font-black text-indigo-400">
                ${((selectedPkg?.priceInCents || 3500) / 100).toFixed(2)}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 text-white text-xs font-bold shadow-xl shadow-indigo-500/25 transition-all"
            >
              {loading ? 'Processing Payment & Website...' : 'Complete Payment & Launch Site'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function CreatorCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
