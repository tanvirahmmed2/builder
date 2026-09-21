'use client';

import { use, useEffect, useState } from 'react';
import { BiSupport, BiCheckCircle, BiLoaderAlt, BiSend } from 'react-icons/bi';

export default function PublicSupportPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [website, setWebsite] = useState(null);
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  useEffect(() => {
    fetch(`/api/webites/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWebsite(data.website);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || !email.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_support_ticket',
          subject,
          email,
          description,
          priority,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedTicket({
          id: data.ticket?.id || Math.floor(Math.random() * 9000 + 1000),
          subject,
        });
      } else {
        alert(data.error || 'Failed to submit ticket');
      }
    } catch (err) {
      alert('Error sending ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-3">
        <BiLoaderAlt className="animate-spin text-4xl text-indigo-600" />
        <p className="text-xs font-semibold tracking-wider uppercase">Loading Support Center...</p>
      </div>
    );
  }

  const primaryColor = website?.settings?.primary_color || '#6366f1';

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span
          className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white inline-block"
          style={{ backgroundColor: primaryColor }}
        >
          Customer Helpdesk
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Help & Support Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Encountering an issue or have a billing inquiry? Create a support ticket and our team will assist you.
        </p>
      </div>

      {/* Ticket form or success banner */}
      {submittedTicket ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 flex items-center justify-center mx-auto text-3xl font-bold">
            <BiCheckCircle />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Ticket Submitted!</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your ticket <span className="font-mono font-bold text-indigo-600">#TCK-{submittedTicket.id}</span> has been logged. We'll reply to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span> within 24 hours.
          </p>
          <button
            onClick={() => {
              setSubmittedTicket(null);
              setSubject('');
              setDescription('');
            }}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors"
          >
            Submit Another Ticket
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Your Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subject / Topic *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Question regarding product license"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description of the Issue *
            </label>
            <textarea
              rows={5}
              required
              placeholder="Please provide detailed information so we can investigate and help quickly..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition-transform hover:scale-102 cursor-pointer"
            >
              <BiSend className="text-base" />
              <span>{submitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
