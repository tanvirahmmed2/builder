'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import {
  BiSearch,
  BiPlus,
  BiMinus,
  BiTrash,
  BiRefresh,
  BiEnvelope,
  BiCheckCircle,
  BiTimeFive,
  BiX,
  BiSend,
  BiCheckShield,
  BiUser,
  BiMessageDetail,
} from 'react-icons/bi';
import { Context } from '@/components/helper/Context';
import ContactForm from '@/components/developer/forms/ContactForm';

export default function AdminContactsPage() {
  const { user } = useContext(Context);
  const userRole = (user?.role || '').toLowerCase();
  const canReply = ['admin', 'manager', 'support'].includes(userRole);
  const canDelete = ['admin', 'manager'].includes(userRole);

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);

  // Modal State for viewing & replying
  const [activeContact, setActiveContact] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [actionNotice, setActionNotice] = useState({ text: '', type: '' });

  const notify = (text, type = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice({ text: '', type: '' }), 6000);
  };

  const fetchContacts = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch('/api/developer/contacts');
      const data = await res.json();
      if (data.success) {
        setContacts(data.records || []);
      }
    } catch (e) {
      console.error('Error loading contacts:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts(true);
  }, [fetchContacts]);

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!canDelete) {
      notify('Permission denied: Only Admin and Manager roles can delete contacts.', 'error');
      return;
    }
    if (!confirm('Are you sure you want to delete this contact message? This action cannot be undone.')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/developer/contacts?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        notify('Contact message deleted successfully.');
        if (activeContact?.id === id) {
          setActiveContact(null);
        }
        fetchContacts();
      } else {
        notify(data.error || 'Failed to delete contact.', 'error');
      }
    } catch (e) {
      console.error(e);
      notify('Network error deleting contact.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenReplyModal = (contact) => {
    setActiveContact(contact);
    setReplyText(contact.reply || '');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!canReply) {
      notify('Permission denied: Support, Manager, or Admin role required to reply.', 'error');
      return;
    }
    if (!replyText.trim()) {
      notify('Please write a reply message before sending.', 'error');
      return;
    }

    setReplySending(true);
    try {
      const res = await fetch('/api/developer/contacts/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeContact.id,
          reply: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        notify('Reply sent successfully via email and inquiry marked as Replied!');
        // Update local state
        setContacts((prev) =>
          prev.map((c) => (c.id === activeContact.id ? { ...c, ...data.record } : c))
        );
        setActiveContact((prev) => (prev ? { ...prev, ...data.record } : null));
      } else {
        notify(data.error || 'Failed to send reply.', 'error');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      notify('Network error when sending reply email.', 'error');
    } finally {
      setReplySending(false);
    }
  };

  // Stats calculation
  const totalCount = contacts.length;
  const newCount = contacts.filter((c) => c.status === 'NEW').length;
  const repliedCount = contacts.filter((c) => c.status === 'REPLIED').length;

  const filtered = contacts.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q) ||
      c.message?.toLowerCase().includes(q) ||
      c.reply?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionNotice.text && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-sm transition-all ${
            actionNotice.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <BiCheckCircle className="text-base" />
            <span>{actionNotice.text}</span>
          </div>
          <button
            onClick={() => setActionNotice({ text: '', type: '' })}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <BiX className="text-base" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Messages</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Inquiries
            </span>
          </div>
          <p className="text-xs text-slate-500">
            View public inquiries, compose mailer email replies, and manage customer communications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchContacts(true)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh contacts"
          >
            <BiRefresh className="text-lg" />
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              showForm
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {showForm ? <BiMinus className="text-base" /> : <BiPlus className="text-base" />}
            <span>{showForm ? 'Close Form' : 'New Entry'}</span>
          </button>
        </div>
      </div>

      {/* Permissions Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <BiCheckShield className="text-indigo-600 text-lg shrink-0" />
          <span>
            Signed in as <strong className="capitalize text-slate-900">{userRole || 'staff'}</strong>.
            {canReply ? (
              <span className="text-emerald-700 ml-1">You have authorization to send email replies.</span>
            ) : (
              <span className="text-amber-700 ml-1">Reply permissions require Support, Manager, or Admin role.</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className={`px-2.5 py-1 rounded-lg border ${canReply ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            Reply: {canReply ? 'Enabled' : 'Disabled'}
          </span>
          <span className={`px-2.5 py-1 rounded-lg border ${canDelete ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            Delete: {canDelete ? 'Admin & Manager' : 'Restricted'}
          </span>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Inquiries</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <BiEnvelope className="text-xl" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-600">New / Unanswered</span>
            <div className="text-2xl font-bold text-blue-700 mt-1">{newCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BiTimeFive className="text-xl" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600">Replied / Solved</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{repliedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BiCheckCircle className="text-xl" />
          </div>
        </div>
      </div>

      {showForm && (
        <ContactForm
          apiEndpoint="/api/developer/contacts"
          onSuccess={() => {
            setShowForm(false);
            notify('Inquiry record saved.');
            fetchContacts();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            {['ALL', 'NEW', 'REPLIED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab === 'ALL' ? 'All Messages' : tab === 'NEW' ? 'New' : 'Replied'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
              <input
                type="text"
                placeholder="Search name, email, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium shrink-0">
              <span className="font-bold text-slate-800">{filtered.length}</span> of {contacts.length}
            </div>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3 whitespace-nowrap">ID</th>
                <th className="px-4 py-3 whitespace-nowrap">Sender</th>
                <th className="px-4 py-3 whitespace-nowrap">Subject & Message</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Received</th>
                <th className="px-4 py-3 whitespace-nowrap">Reply Status</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    Loading contact inquiries...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    No contact records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isReplied = c.status === 'REPLIED';
                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleOpenReplyModal(c)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-400">#{c.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">{c.email}</div>
                      </td>
                      <td className="px-4 py-3 max-w-sm">
                        <div className="font-semibold text-slate-900 truncate">{c.subject}</div>
                        <div className="text-slate-500 text-[11px] truncate">{c.message}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isReplied
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isReplied ? 'Replied' : 'New'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-[11px]">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 max-w-xs text-[11px]">
                        {isReplied ? (
                          <div className="text-emerald-700 truncate">
                            <span className="font-semibold">By: </span>
                            {c.replied_by_name || 'Staff'}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No reply yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenReplyModal(c)}
                            className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px]"
                          >
                            {isReplied ? 'View / Update' : 'Reply'}
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              disabled={deletingId === c.id}
                              onClick={(e) => handleDelete(c.id, e)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete inquiry (Admin/Manager)"
                            >
                              <BiTrash className="text-base" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail & Reply Modal */}
      {activeContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <BiMessageDetail className="text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Inquiry #{activeContact.id}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeContact.status === 'REPLIED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {activeContact.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Received on {new Date(activeContact.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveContact(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <BiX className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Sender & Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">Sender Name</span>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <BiUser className="text-slate-400" />
                    <span>{activeContact.name}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">Email Address</span>
                  <div className="font-mono text-slate-800 text-xs flex items-center gap-1.5">
                    <BiEnvelope className="text-slate-400" />
                    <a href={`mailto:${activeContact.email}`} className="text-indigo-600 hover:underline">
                      {activeContact.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Inquiry Content */}
              <div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                  Subject
                </span>
                <h4 className="text-base font-bold text-slate-900 mb-3">{activeContact.subject}</h4>

                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                  Message Content
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                  {activeContact.message}
                </div>
              </div>

              {/* Previous Reply Banner if exists */}
              {activeContact.reply && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-800 font-bold text-[11px]">
                    <span className="flex items-center gap-1">
                      <BiCheckCircle className="text-sm" />
                      <span>Last Reply Sent:</span>
                    </span>
                    <span className="font-normal text-emerald-600">
                      {activeContact.updated_at ? new Date(activeContact.updated_at).toLocaleString() : ''}
                    </span>
                  </div>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-white/80 p-3 rounded-xl border border-emerald-100 font-normal">
                    {activeContact.reply}
                  </div>
                  {activeContact.replied_by_name && (
                    <div className="text-[11px] text-emerald-700">
                      Replied by: <strong>{activeContact.replied_by_name}</strong> ({activeContact.replied_by_role || 'Staff'})
                    </div>
                  )}
                </div>
              )}

              {/* Reply Composer */}
              <form onSubmit={handleSendReply} className="space-y-4 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      {activeContact.reply ? 'Send New Email Response' : 'Write Response via Mailer'}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Recipient: <strong className="text-slate-700 font-mono">{activeContact.email}</strong>
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    disabled={!canReply || replySending}
                    placeholder={
                      canReply
                        ? 'Type your official reply here. Submitting will email the user and update status to Replied...'
                        : 'Your current account role does not have permission to send replies.'
                    }
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div>
                    {canDelete && (
                      <button
                        type="button"
                        disabled={deletingId === activeContact.id}
                        onClick={() => handleDelete(activeContact.id)}
                        className="flex items-center gap-1 text-rose-600 hover:text-rose-800 text-xs font-semibold py-2 px-3 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <BiTrash className="text-base" />
                        <span>Delete Inquiry</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveContact(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={!canReply || replySending || !replyText.trim()}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <BiSend className="text-base" />
                      <span>{replySending ? 'Sending Email...' : 'Send Reply via Email'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
