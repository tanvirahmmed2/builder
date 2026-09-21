'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BiCreditCard, BiCheckCircle, BiCube, BiDesktop, BiLoaderAlt, BiLockAlt } from 'react-icons/bi';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPkgId = searchParams.get('packageId');
  const creatorId = searchParams.get('creatorId') || '1';

  const [packages, setPackages] = useState([]);
  const [selectedPkgId, setSelectedPkgId] = useState(initialPkgId ? Number(initialPkgId) : null);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [websiteName, setWebsiteName] = useState('My Flagship Studio');
  const [subdomain, setSubdomain] = useState(`creator-${creatorId}`);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [createdWebsite, setCreatedWebsite] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/creator?creatorId=${creatorId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.packages && data.packages.length > 0) {
          setPackages(data.packages);
          if (!selectedPkgId) {
            setSelectedPkgId(data.packages[0].id);
          }
        }
      })
      .catch(console.error);
  }, [creatorId, selectedPkgId]);

  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanSubdomain = (subdomain || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleanSubdomain || cleanSubdomain.length < 3) {
      setError('Subdomain is mandatory and must be at least 3 characters long (letters, numbers, hyphens only).');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'purchase_subscription',
          creatorId: Number(creatorId),
          packageId: selectedPkgId || selectedPkg?.id || 1,
          paymentMethod,
          provisionWebsite: true,
          websiteName: (websiteName || 'My Portfolio & Store').trim(),
          subdomain: cleanSubdomain,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreatedWebsite(data.website);
        setCompleted(true);
      } else {
        setError(data.error || 'Payment failed.');
      }
    } catch (err) {
      setError('Network error processing checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-1">
          <BiLockAlt className="text-slate-500" />
          <span>Secure Checkout Gateway</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Choose Package & Claim Your Subdomain</h1>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          Every package includes an instantly provisioned tenant website hosted on your chosen subdomain with complimentary SSL.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold max-w-lg mx-auto text-center">
          {error}
        </div>
      )}

      {completed ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 text-center max-w-lg mx-auto animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 text-3xl">
            <BiCheckCircle />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Website Provisioned!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your package is active and your tenant website is ready at your claimed subdomain.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Subscribed Package:</span>
              <strong className="text-slate-900 font-semibold">{selectedPkg?.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Claimed Subdomain:</span>
              <strong className="text-slate-900 font-mono text-emerald-600">
                {createdWebsite?.subdomain || subdomain}.saasplatform.com
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase text-[10px]">
                Live & Active
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <a
              href={`/website/${createdWebsite?.subdomain || subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <span>Visit Live Tenant Website →</span>
            </a>
            <a
              href={`/website/${createdWebsite?.subdomain || subdomain}/dashboard`}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <span>Open Tenant Management Dashboard</span>
            </a>
            <button
              type="button"
              onClick={() => router.push(`/creator/${creatorId}/webites`)}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Manage in Creator Portal
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan Selection & Website Details (2 Cols) */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <BiCube className="text-slate-500 text-lg" />
                <span>1. Select Subscription Package</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packages.map((pkg) => {
                  const isSel = selectedPkgId === pkg.id;
                  const price = (Number(pkg.price_in_cents || 0) / 100).toFixed(0);

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSel
                          ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{pkg.name}</span>
                        <input
                          type="radio"
                          name="plan"
                          checked={isSel}
                          onChange={() => setSelectedPkgId(pkg.id)}
                          className="accent-slate-900 cursor-pointer"
                        />
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900">${price}</span>
                        <span className="text-xs text-slate-400">
                          / {pkg.billing_interval?.toLowerCase() || 'month'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        {pkg.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Initial Website Details */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BiDesktop className="text-slate-500 text-lg" />
                <span>2. Initial Website Provisioning</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Website Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={websiteName}
                    onChange={(e) => {
                      setWebsiteName(e.target.value);
                      setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Mandatory Subdomain *</span>
                    <span className="text-[10px] text-slate-400 font-normal">min 3 chars, lowercase & hyphens</span>
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="e.g. acmestudio"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-l-xl px-4 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
                    />
                    <span className="bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl px-3 py-2 text-xs text-slate-500 font-mono">
                      .saasplatform.com
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span>Live preview:</span>
                    <span className="font-mono text-emerald-600 font-semibold truncate">
                      https://{subdomain ? subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '') : 'yourbrand'}.saasplatform.com
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BiCreditCard className="text-slate-500 text-lg" />
                <span>3. Payment Method</span>
              </h2>

              <div className="grid grid-cols-3 gap-3">
                {['CARD', 'PAYPAL', 'STRIPE'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      paymentMethod === m
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {m === 'CARD' ? 'Credit Card' : m === 'PAYPAL' ? 'PayPal' : 'Stripe Instant'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary & Submit (1 Col) */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5 sticky top-20">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Selected Plan:</span>
                  <strong className="text-slate-900 font-semibold">{selectedPkg?.name}</strong>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Billing Cycle:</span>
                  <span className="text-slate-700 capitalize">
                    {selectedPkg?.billing_interval?.toLowerCase() || 'Monthly'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Instant Subdomain:</span>
                  <span className="text-slate-700 font-mono text-[11px] truncate max-w-[150px]">
                    {subdomain}.saas
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Platform Setup Fee:</span>
                  <span className="text-emerald-600 font-bold">$0.00 Free</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total Billed:</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-slate-900">
                      ${(Number(selectedPkg?.price_in_cents || 0) / 100).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">USD</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <BiLoaderAlt className="animate-spin text-base" />
                    <span>Processing Subscription...</span>
                  </>
                ) : (
                  <span>Complete Purchase & Launch →</span>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                By purchasing, you agree to automatic renewal at the end of each billing cycle. You can cancel at any time.
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function CreatorCheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center text-xs text-slate-500">
            <BiLoaderAlt className="animate-spin text-2xl mr-2 text-slate-800" />
            Loading checkout gateway...
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
