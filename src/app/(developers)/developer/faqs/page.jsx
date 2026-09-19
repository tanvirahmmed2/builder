'use client';

import { useState, useEffect, useContext } from 'react';
import { Context } from '@/components/helper/Context';
import {
  BiSearch,
  BiPlus,
  BiEdit,
  BiTrash,
  BiRefresh,
  BiHelpCircle,
  BiX,
  BiCheckCircle,
  BiErrorCircle,
  BiLoaderAlt,
  BiShieldQuarter,
} from 'react-icons/bi';

export default function DeveloperFaqsPage() {
  const { user } = useContext(Context);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const role = (user?.role || '').toLowerCase();
  const canManage = role === 'admin' || role === 'manager';

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer/faqs');
      const data = await res.json();
      if (data.success) {
        setFaqs(data.records || []);
      }
    } catch (err) {
      console.error('Failed to fetch FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({ question: '', answer: '' });
    setFeedback({ type: '', message: '' });
    setModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({ question: faq.question || '', answer: faq.answer || '' });
    setFeedback({ type: '', message: '' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFaq(null);
    setFormData({ question: '', answer: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      setFeedback({ type: 'error', message: 'Please provide both question and answer.' });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const method = editingFaq ? 'PUT' : 'POST';
      const payload = editingFaq ? { id: editingFaq.id, ...formData } : formData;

      const res = await fetch('/api/developer/faqs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: editingFaq ? 'FAQ updated successfully!' : 'FAQ created successfully!',
        });
        await fetchFaqs();
        setTimeout(() => closeModal(), 900);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Operation failed.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Network error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this FAQ item?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/developer/faqs?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        await fetchFaqs();
      } else {
        alert(data.error || 'Failed to delete FAQ.');
      }
    } catch (err) {
      console.error(err);
      alert('Error occurred while deleting FAQ.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredFaqs = faqs.filter((faq) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      faq.question?.toLowerCase().includes(term) ||
      faq.answer?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform FAQs Management</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Admin & Manager
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Create, update, and manage frequently asked questions displayed on the public /faqs portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchFaqs}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors text-sm"
            title="Refresh FAQs"
          >
            <BiRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canManage && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <BiPlus className="text-base" />
              <span>Add New FAQ</span>
            </button>
          )}
        </div>
      </div>

      {/* Permission Warning if not admin or manager */}
      {!canManage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-center gap-3 text-xs">
          <BiShieldQuarter className="text-lg text-amber-600 shrink-0" />
          <span>
            You are currently viewing FAQs in read-only mode. Only <strong>Admin</strong> and <strong>Manager</strong> accounts can add, edit, or delete items.
          </span>
        </div>
      )}

      {/* Search Bar & Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            placeholder="Search FAQs by question or answer keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Live FAQs</span>
          <span className="text-base font-bold text-slate-900">{faqs.length}</span>
        </div>
      </div>

      {/* FAQs List */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <BiLoaderAlt className="animate-spin text-3xl text-slate-400" />
          <p className="text-xs text-slate-500 font-medium">Loading FAQs from database...</p>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 text-2xl">
            <BiHelpCircle />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No FAQs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {searchTerm
              ? `No FAQs matched your search term "${searchTerm}". Try a different keyword.`
              : 'There are currently no FAQs in the database. Add your first FAQ now!'}
          </p>
          {canManage && !searchTerm && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <BiPlus /> Add FAQ
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {faq.question}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line pl-8">
                  {faq.answer}
                </p>
              </div>

              {canManage && (
                <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(faq)}
                    className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors text-base"
                    title="Edit FAQ"
                  >
                    <BiEdit />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(faq.id)}
                    disabled={deletingId === faq.id}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-base disabled:opacity-50"
                    title="Delete FAQ"
                  >
                    {deletingId === faq.id ? <BiLoaderAlt className="animate-spin" /> : <BiTrash />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit FAQ Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                  <BiHelpCircle />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <BiX className="text-xl" />
              </button>
            </div>

            {feedback.message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {feedback.type === 'success' ? (
                  <BiCheckCircle className="text-base shrink-0" />
                ) : (
                  <BiErrorCircle className="text-base shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., How do I customize my subdomain?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Answer <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Provide a clear, detailed, and helpful answer for creators and visitors..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <BiLoaderAlt className="animate-spin text-sm" />}
                  <span>{editingFaq ? 'Save Changes' : 'Create FAQ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
