'use client';

import { use, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BiLockAlt,
  BiEnvelope,
  BiShow,
  BiHide,
  BiLoaderAlt,
  BiCheckCircle,
  BiErrorCircle,
  BiArrowBack,
} from 'react-icons/bi';

function LoginForm({ slug }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [website, setWebsite] = useState(null);
  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(() => {
    if (searchParams.get('verified') === 'true') {
      return 'Email verified successfully! You can now log in to your account.';
    }
    if (searchParams.get('reset') === 'true') {
      return 'Password updated! Please sign in with your new credentials.';
    }
    return '';
  });

  // Load website branding
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/webites/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWebsite(data.website);
      })
      .catch((err) => console.error('Error fetching website info:', err));
  }, [slug]);

  const primaryColor = website?.settings?.primary_color || '#6366f1';
  const siteTitle = website?.settings?.site_title || website?.name || 'Tenant Website';
  const logoUrl = website?.settings?.logo_url;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/webites/${slug}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess('Login successful! Redirecting...');

      // Redirect based on role or destination
      const redirectUrl = searchParams.get('redirect');
      setTimeout(() => {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (data.user?.isAdmin || data.user?.isOwner) {
          router.push(`/website/${slug}/dashboard`);
        } else {
          router.push(`/website/${slug}`);
        }
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
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
              {siteTitle.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your account on <strong>{siteTitle}</strong>
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

        {/* Login Form */}
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                href={`/website/${slug}/recover${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <BiLockAlt className="text-lg" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow"
                style={{ '--tw-ring-color': primaryColor }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <BiHide className="text-lg" /> : <BiShow className="text-lg" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-0 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">Remember me</span>
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
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Separator & Registration CTA */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>Don&apos;t have an account? </span>
          <Link
            href={`/website/${slug}/register`}
            className="font-bold hover:underline transition-colors"
            style={{ color: primaryColor }}
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function WebsiteLoginPage({ params }) {
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
      <LoginForm slug={slug} />
    </Suspense>
  );
}
