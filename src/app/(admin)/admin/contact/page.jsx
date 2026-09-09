'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquareIcon, CheckCircleIcon } from '@/components/ui/Icons';

export default function AdminContactInquiriesPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingContact, setReplyingContact] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyingContact) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply_contact',
          contactId: replyingContact.id,
          adminReply: replyText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyingContact(null);
        setReplyText('');
        fetchContacts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (contactId) => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive_contact', contactId }),
      });
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-rose-400">
          <Link href="/admin" className="hover:underline">← Admin Overview</Link>
          <span>/</span>
          <span>Inquiries</span>
        </div>
        <h1 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
          <MessageSquareIcon className="w-6 h-6 text-rose-500" />
          <span>Contact Messages & Leads</span>
        </h1>
        <p className="text-xs text-slate-400">
          Public inquiries submitted via the platform /contact page. Review messages and reply directly.
        </p>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Loading contact inquiries...
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-white/10 text-slate-500 text-xs">
            No contact inquiries found.
          </div>
        ) : (
          contacts.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                    {c.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm">{c.name}</span>
                    <span className="text-xs text-slate-400 ml-2 font-mono">({c.email})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.status === 'REPLIED'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : c.status === 'ARCHIVED'
                        ? 'bg-slate-700/40 text-slate-400 border border-slate-600/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse'
                    }`}
                  >
                    {c.status}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-rose-300">
                  Subject: {c.subject}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                  {c.message}
                </p>
              </div>

              {c.adminReply && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <CheckCircleIcon className="w-3 h-3" />
                    Admin Response Sent:
                  </span>
                  <p className="text-xs text-slate-300">{c.adminReply}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                {c.status !== 'ARCHIVED' && (
                  <button
                    onClick={() => handleArchive(c.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                  >
                    Archive
                  </button>
                )}
                <button
                  onClick={() => {
                    setReplyingContact(c);
                    setReplyText(c.adminReply || '');
                  }}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow"
                >
                  {c.adminReply ? 'Update Reply' : 'Reply to Inquiry'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyingContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Reply to {replyingContact.name}</h3>
                <p className="text-xs text-slate-400">{replyingContact.email}</p>
              </div>
              <button onClick={() => setReplyingContact(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Original Inquiry</label>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-400 italic">
                  "{replyingContact.message}"
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Official Admin Response</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Draft response from Platform Super Admin..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingContact(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
                >
                  {saving ? 'Transmitting...' : 'Send & Mark Replied'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
