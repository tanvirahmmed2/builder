'use client';

import { useState } from 'react';
import { BiImage, BiCheck, BiX } from 'react-icons/bi';

export default function SupportImageForm({ tickets = [], onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    support_id: tickets[0]?.id || 1,
    message_id: '',
    image_url: '',
    file_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_record',
          table: 'support_images',
          data: {
            ...formData,
            support_id: Number(formData.support_id),
            message_id: formData.message_id ? Number(formData.message_id) : null,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFormData({
          support_id: tickets[0]?.id || 1,
          message_id: '',
          image_url: '',
          file_name: '',
        });
        if (onSuccess) onSuccess(data.record);
      } else {
        setError(data.error || 'Failed to attach image to ticket');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <BiImage className="text-xl" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Attach Screenshot to Ticket</h3>
            <p className="text-xs text-slate-500">Add bug reproduction proofs, DNS records, or error screenshots.</p>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
          >
            <BiX className="text-xl" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Support Ticket ID</label>
            <input
              type="number"
              required
              placeholder="e.g. 1"
              value={formData.support_id}
              onChange={(e) => setFormData({ ...formData, support_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Linked Message ID (Optional)</label>
            <input
              type="number"
              placeholder="Leave empty if ticket general screenshot"
              value={formData.message_id}
              onChange={(e) => setFormData({ ...formData, message_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              required
              placeholder="https://images.unsplash.com/..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Original File Name</label>
            <input
              type="text"
              placeholder="e.g. error_screenshot_console.png"
              value={formData.file_name}
              onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-slate-900 text-xs font-bold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            <BiCheck className="text-base" />
            <span>{loading ? 'Attaching...' : 'Save Ticket Image'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
