'use client';

import { use, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BiUser,
  BiEnvelope,
  BiLockAlt,
  BiPhone,
  BiShow,
  BiHide,
  BiLoaderAlt,
  BiCheckCircle,
  BiErrorCircle,
  BiArrowBack,
  BiUserPlus,
} from 'react-icons/bi';

function RegisterForm({ slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [website, setWebsite] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load website branding
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/webites/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWebsite(data.website);
      })
      .catch((err) => console.error('Error fetching website info in register:', err));
  }, [slug]);

  const primaryColor = website?.settings?.primary_color || '#6366f1';
  const siteTitle = website?.settings?.site_title || website?.name || 'Tenant Website';
  const logoUrl = website?.settings?.logo_url;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('You must accept the terms to create an account.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/webites/${slug}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(
        data.message || 'Account created! Please check your email for the verification code.'
      );

      // Redirect to verify page
      setTimeout(() => {
        router.push(`/website/${slug}/verify?email=${encodeURIComponent(email)}`);
      }, 1200);
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md my-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href={`/website/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <BiArrowBack className="text-sm" />
            <span>Back to site</span>
          </Link>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            {slug}
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteTitle}
              className="h-10 mx-auto object-contain rounded-lg mb-2"
            />
          ) : (
            <div
              className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md mb-2"
              style={{ backgroundColor: primaryColor }}
            >
              <BiUserPlus className="text-2xl" />
            </div>
          )}
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Create an Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join <strong>{siteTitle}</strong> to manage your orders, bookings, and services.
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <BiErrorCircle className="text-base shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-fadeIn">
            <BiCheckCircle className="text-base shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <BiUser className="text-lg" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow"
                style={{ '--tw-ring-color': primaryColor }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <BiEnvelope className="text-lg" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow"
                style={{ '--tw-ring-color': primaryColor }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Phone Number (optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <BiPhone className="text-lg" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow"
                style={{ '--tw-ring-color': primaryColor }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <BiLockAlt className="text-lg" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow"
                  style={{ '--tw-ring-color': primaryColor }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <BiHide className="text-base" /> : <BiShow className="text-base" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <BiLockAlt className="text-lg" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-0 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              I agree to the terms of service and acknowledge the site privacy notice.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? (
              <>
                <BiLoaderAlt className="animate-spin text-base" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        {/* Separator & Login CTA */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>Already have an account? </span>
          <Link
            href={`/website/${slug}/login`}
            className="font-bold hover:underline transition-colors"
            style={{ color: primaryColor }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function WebsiteRegisterPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams?.slug || '';

  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
          <p className="text-xs uppercase font-semibold">Loading...</p>
        </div>
      }
    >
      <RegisterForm slug={slug} />
    </Suspense>
  );
}
