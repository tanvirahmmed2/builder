'use client';

import { use, useEffect, useState } from 'react';
import {
  BiEnvelope,
  BiSearch,
  BiCheckCircle,
  BiTimeFive,
  BiLoaderAlt,
  BiSend,
} from 'react-icons/bi';

export default function ContactsPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyTextMap, setReplyTextMap] = useState({});
  const [sendingReply, setSendingReply] = useState({});

  const fetchContacts = async () => {
    try {
      const res = await fetch(`/api/webites/${slug}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [slug]);

  const handleReplyContact = async (id) => {
    const reply = replyTextMap[id];
    if (!reply?.trim()) return;

    setSendingReply((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reply_contact', id, reply }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Reply recorded and customer notified!');
        setReplyTextMap((prev) => ({ ...prev, [id]: '' }));
        fetchContacts();
      } else {
        alert(data.error || 'Failed to record reply');
      }
    } catch (err) {
      alert('Network error sending reply');
    } finally {
      setSendingReply((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filtered = contacts.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Contact Inquiries & Leads
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Messages and project inquiries submitted through your public website contact form.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search inquiries by name, email, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="text-xs text-slate-500 self-end sm:self-center font-medium">
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filtered.length}</span> messages
        </div>
      </div>

      {/* Contacts Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
          <p className="text-xs font-medium">Loading inquiries...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BiEnvelope className="mx-auto text-4xl text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No inquiries yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When potential clients get in touch through your contact form, you will see their messages right here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm">
                    {c.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    c.status === 'replied' || c.admin_reply
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}>
                    {c.status === 'replied' || c.admin_reply ? 'Replied' : 'Pending Reply'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                {c.subject && (
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Subject: {c.subject}
                  </div>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {c.message}
                </p>
              </div>

              {c.admin_reply && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1.5 mb-1">
                    <BiCheckCircle className="text-emerald-500" /> Previous Response:
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">{c.admin_reply}</div>
                </div>
              )}

              {/* Reply composer */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Type your response to this inquiry..."
                  value={replyTextMap[c.id] || ''}
                  onChange={(e) => setReplyTextMap({ ...replyTextMap, [c.id]: e.target.value })}
                  className="flex-1 px-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  disabled={sendingReply[c.id] || !replyTextMap[c.id]?.trim()}
                  onClick={() => handleReplyContact(c.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <BiSend className="text-sm" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
