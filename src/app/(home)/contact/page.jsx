'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquareIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ExternalLinkIcon,
} from '@/components/ui/Icons';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setError(data.error || 'Failed to submit message.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="w-full flex flex-col gap-7 max-w-6xl mx-auto">

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-semibold">
          We are here to assist your creator journey
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl">
          Have questions about multi-tenant provisioning, custom enterprise domains, or package upgrades? Send us a message and our team will get back to you within 24 hours.
        </p>
      </div>

      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="w-full flex flex-col">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircleIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold ">Message Delivered Successfully</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out. Our support team and administrators have received your inquiry and will follow up shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20  text-xs font-semibold transition-all"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs  placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. liam@agency.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='input-style' />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Reverse Proxy Custom Domain Inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs  placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Message</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe your technical requirements, collaboration needs, or feedback..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs  placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-50  text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all"
              >
                {submitting ? 'Transmitting Inquiries...' : 'Send Message Now →'}
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 space-y-4">
            <h3 className="font-bold  text-base">Direct Channels</h3>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  @
                </div>
                <div>
                  <div className="font-semibold ">General Inquiries</div>
                  <div>support@saasplatform.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheckIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold ">Security & Vulnerabilities</div>
                  <div>security@saasplatform.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <ExternalLinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold ">Live Platform Status</div>
                  <div className="text-emerald-400 font-semibold">99.99% Uptime Active</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950/40 border border-indigo-500/20 space-y-3">
            <h4 className="font-bold  text-sm">Need Instant Assistance?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you have already purchased a tenant subscription, you can submit priority tickets directly through the Creator Dashboard or inspect active solutions in the Admin Center.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>Go to Creator Workspace</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
