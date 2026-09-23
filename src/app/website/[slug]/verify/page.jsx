'use client';

import { use, useEffect, useState, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BiEnvelope,
  BiCheckCircle,
  BiErrorCircle,
  BiLoaderAlt,
  BiRefresh,
  BiArrowBack,
} from 'react-icons/bi';

function VerifyForm({ slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get('email') || '';
  const initialCode = searchParams.get('code') || searchParams.get('token') || '';

  const [website, setWebsite] = useState(null);
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [autoVerified, setAutoVerified] = useState(false);

  // Load website branding
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/webites/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWebsite(data.website);
      })
      .catch((err) => console.error('Error loading website info in verify:', err));
  }, [slug]);

  const performVerification = useCallback(
    async (verifyEmail, verifyCode) => {
      setError('');
      setSuccess('');
      setLoading(true);

      try {
        const res = await fetch(`/api/webites/${slug}/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify',
            email: verifyEmail,
            code: verifyCode,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || 'Verification failed. Please check your code.');
          setLoading(false);
          return;
        }

        setSuccess(data.message || 'Email verified successfully! You can now log in.');
        setTimeout(() => {
          router.push(
            `/website/${slug}/login?verified=true&email=${encodeURIComponent(verifyEmail)}`
          );
        }, 1500);
      } catch (err) {
        console.error('Verification error:', err);
        setError('An error occurred during verification.');
        setLoading(false);
      }
    },
    [slug, router]
  );

  // Auto trigger verification if both email and code were in query params on load
  useEffect(() => {
    if (initialEmail && initialCode && !autoVerifiedRef.current) {
      autoVerifiedRef.current = true;
      const timer = setTimeout(() => {
        performVerification(initialEmail, initialCode);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [initialEmail, initialCode, performVerification]);

  // Handle resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const primaryColor = website?.settings?.primary_color || '#6366f1';
  const siteTitle = website?.settings?.site_title || website?.name || 'Tenant Website';
  const logoUrl = website?.settings?.logo_url;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !code) {
      setError('Please provide both your email and the 6-digit code.');
      return;
    }
    performVerification(email, code);
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Please enter your email address to resend code.');
      return;
    }
    if (countdown > 0) return;

    setResending(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/webites/${slug}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend_code',
          email,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('A new verification code has been dispatched to your email.');
        setCountdown(60);
      } else {
        setError(data.error || 'Failed to resend code.');
      }
    } catch (err) {
      setError('Error resending verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md my-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href={`/website/${slug}/login`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <BiArrowBack className="text-sm" />
            <span>Back to login</span>
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
              <BiShieldCheck className="text-2xl" />
            </div>
          )}
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter the 6-digit verification code sent to your email to activate your account on{' '}
            <strong>{siteTitle}</strong>.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
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
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow"
                style={{ '--tw-ring-color': primaryColor }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center tracking-[0.4em] font-mono text-xl py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 transition-shadow font-bold"
              style={{ '--tw-ring-color': primaryColor }}
            />
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
                <span>Verifying...</span>
              </>
            ) : (
              <span>Confirm & Verify Email</span>
            )}
          </button>
        </form>

        {/* Resend Actions */}
        <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <p>Didn&apos;t receive the code?</p>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resending || countdown > 0}
            className="inline-flex items-center gap-1.5 font-bold hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ color: primaryColor }}
          >
            {resending ? (
              <>
                <BiLoaderAlt className="animate-spin text-sm" />
                <span>Sending...</span>
              </>
            ) : countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <>
                <BiRefresh className="text-base" />
                <span>Resend Verification Code</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WebsiteVerifyPage({ params }) {
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
      <VerifyForm slug={slug} />
    </Suspense>
  );
}
