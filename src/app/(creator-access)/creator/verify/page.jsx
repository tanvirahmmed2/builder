'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BiLoaderAlt, BiCheckCircle, BiErrorCircle, BiEnvelope } from 'react-icons/bi';

function CreatorVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [loading, setLoading] = useState(Boolean(token && emailParam));
  const [success, setSuccess] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [error, setError] = useState('');
  const [emailInput, setEmailInput] = useState(emailParam || '');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    if (!token || !emailParam) return;

    let ignore = false;
    async function verifyAccount() {
      try {
        const res = await fetch('/api/creator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify',
            token,
            email: emailParam,
          }),
        });
        const data = await res.json();
        if (!ignore) {
          if (data.success) {
            setSuccess(true);
            if (data.alreadyVerified) {
              setAlreadyVerified(true);
            }
          } else {
            setError(data.error || 'Account verification failed.');
          }
        }
      } catch (err) {
        if (!ignore) {
          setError('Network error while attempting to verify account.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    verifyAccount();
    return () => {
      ignore = true;
    };
  }, [token, emailParam]);

  const handleResend = async (e) => {
    if (e) e.preventDefault();
    if (!emailInput) {
      setError('Please enter your email address to receive a verification link.');
      return;
    }

    setResending(true);
    setResendMsg('');
    setError('');

    try {
      const res = await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend_verification',
          email: emailInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResendMsg(data.message || 'Verification link sent! Please check your inbox.');
      } else {
        setError(data.error || 'Failed to resend verification link.');
      }
    } catch (_) {
      setError('Server error while requesting new verification link.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-50">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 text-center">
        {/* State 1: Verifying */}
        {loading && (
          <div className="space-y-4 py-6">
            <BiLoaderAlt className="animate-spin text-4xl text-slate-900 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Verifying Your Account...</h2>
            <p className="text-xs text-slate-500">
              Validating security token for <span className="font-semibold text-slate-700">{emailParam}</span>.
            </p>
          </div>
        )}

        {/* State 2: Verified Successfully */}
        {!loading && success && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-4xl mx-auto border border-emerald-100">
              <BiCheckCircle />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {alreadyVerified ? 'Account Already Verified' : 'Account Verified!'}
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your creator account has been successfully confirmed. You can now sign in to your Creator Studio.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/creator/login"
                className="w-full block py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all text-center cursor-pointer"
              >
                Login →
              </Link>
            </div>
          </div>
        )}

        {/* State 3: Error or Missing Link */}
        {!loading && !success && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-4xl mx-auto border border-rose-100">
              <BiErrorCircle />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verification Problem</h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                {error || 'We could not verify your email address. The token may be invalid or expired.'}
              </p>
            </div>

            {resendMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                {resendMsg}
              </div>
            )}

            <form onSubmit={handleResend} className="pt-2 space-y-3 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={resending}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {resending ? (
                  <>
                    <BiLoaderAlt className="animate-spin text-sm" />
                    <span>Sending link...</span>
                  </>
                ) : (
                  <>
                    <BiEnvelope className="text-base" />
                    <span>Send New Verification Link</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Back to{' '}
                <Link href="/creator/login" className="font-semibold text-slate-900 hover:underline">
                  Login
                </Link>
                {' '}or{' '}
                <Link href="/creator/register" className="font-semibold text-slate-900 hover:underline">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreatorVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <BiLoaderAlt className="animate-spin text-3xl text-slate-800" />
        </div>
      }
    >
      <CreatorVerifyContent />
    </Suspense>
  );
}
