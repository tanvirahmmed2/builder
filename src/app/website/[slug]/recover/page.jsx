'use client';

import { use, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BiEnvelope,
  BiLockAlt,
  BiShow,
  BiHide,
  BiLoaderAlt,
  BiCheckCircle,
  BiErrorCircle,
  BiArrowBack,
  BiKey,
} from 'react-icons/bi';

function RecoverForm({ slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get('email') || '';
  const initialToken = searchParams.get('token') || searchParams.get('code') || '';

  const [website, setWebsite] = useState(null);
  const [step, setStep] = useState(initialToken ? 2 : 1); // 1 = Request code, 2 = Set new password
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      .catch((err) => console.error('Error loading website info in recover:', err));
  }, [slug]);

  const primaryColor = website?.settings?.primary_color || '#6366f1';
  const siteTitle = website?.settings?.site_title || website?.name || 'Tenant Website';
  const logoUrl = website?.settings?.logo_url;

  // Step 1: Request Reset Code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/webites/${slug}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recover',
          email,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(
          data.message || 'Recovery code dispatched! Please check your email inbox.'
        );
        setStep(2);
      } else {
        setError(data.error || 'Failed to send recovery code.');
      }
    } catch (err) {
      console.error('Recover request error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with Code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token.trim() || !newPassword) {
      setError('Please provide both the reset code and your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/webites/${slug}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          email,
          token,
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to reset password. The code may be invalid or expired.');
        setLoading(false);
        return;
      }

      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        router.push(
          `/website/${slug}/login?reset=true&email=${encodeURIComponent(email)}`
        );
      }, 1200);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An error occurred while updating your password.');
      setLoading(false);
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
              <BiKey className="text-2xl" />
            </div>
          )}
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {step === 1 ? 'Password Recovery' : 'Set New Password'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {step === 1
              ? `Enter your email to receive recovery instructions for ${siteTitle}.`
              : 'Enter the recovery code from your email along with your new password.'}
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

        {/* STEP 1: Enter email */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Registered Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? (
                <>
                  <BiLoaderAlt className="animate-spin text-base" />
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <span>Send Recovery Code</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Already have a reset code? Click here
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Enter code & new password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
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
                Recovery Code / Token
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <BiKey className="text-lg" />
                </div>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="6-digit code or reset token"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow font-mono font-bold"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <BiLockAlt className="text-lg" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow"
                  style={{ '--tw-ring-color': primaryColor }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <BiHide className="text-base" /> : <BiShow className="text-base" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm New Password
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
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              </div>
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Save New Password</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Back to request recovery code
              </button>
            </div>
          </form>
        )}

        {/* Footer Link */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span>Remembered your credentials? </span>
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

export default function WebsiteRecoverPage({ params }) {
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
      <RecoverForm slug={slug} />
    </Suspense>
  );
}
