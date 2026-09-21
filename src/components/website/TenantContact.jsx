'use client';

import { useState } from 'react';
import { BiCheckCircle, BiEnvelope, BiLoaderAlt, BiMapPin, BiPhone, BiSend } from 'react-icons/bi';

export default function TenantContact({ websiteId, settings = {}, primaryColor = '#6366f1' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const contactEmail = settings.contact_email || 'contact@creator.com';
  const contactPhone = settings.contact_phone || '+1 (555) 234-5678';
  const address = settings.address || 'San Francisco, CA & Worldwide';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/webites/${websiteId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId,
          name,
          email,
          phone,
          subject: subject || 'General Inquiry',
          message,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      } else {
        setError(json.error || 'Failed to send message.');
      }
    } catch (err) {
      setError('Network error sending inquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800"
            style={{ color: primaryColor }}
          >
            Get In Touch
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Send an Inquiry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Have a project in mind, need custom pricing, or have technical questions? Reach out directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info Side */}
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <BiEnvelope />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Us</h4>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-sm font-semibold text-slate-900 dark:text-white hover:underline mt-0.5 block"
                >
                  {contactEmail}
                </a>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <BiPhone />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Call / WhatsApp</h4>
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">
                  {contactPhone}
                </span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <BiMapPin />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</h4>
                <span className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 block">
                  {address}
                </span>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xs">
            {success ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-3xl border border-emerald-200">
                  <BiCheckCircle />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message Dispatched!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. Your inquiry has been routed straight to our creator portal. We will respond promptly.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-4 px-6 py-2 rounded-full text-xs font-bold text-white cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jordan Belfort"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jordan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Project Inquiry / Consultation"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your project goals, timelines, or questions..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full text-xs font-bold text-white shadow-md transition-all hover:opacity-95 hover:scale-101 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  {loading ? <BiLoaderAlt className="animate-spin text-base" /> : <BiSend className="text-base" />}
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
