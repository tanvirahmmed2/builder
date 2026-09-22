'use client';

import { useState, useEffect } from 'react';
import {
  BiVideo,
  BiPlus,
  BiTrash,
  BiEdit,
  BiRefresh,
  BiPlayCircle,
  BiUser,
  BiCalendar,
} from 'react-icons/bi';

function extractYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function DeveloperTutorialsPage() {
  const [tutorials, setTutorials] = useState([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTut, setEditingTut] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    youtube_link: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/developer/tutorials');
      const data = await res.json();
      if (data.success) {
        setTutorials(data.tutorials || []);
        setCanManage(Boolean(data.canManage));
      }
    } catch (err) {
      console.error('Failed to load tutorials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  const openCreateModal = () => {
    setEditingTut(null);
    setForm({ title: '', description: '', youtube_link: '' });
    setShowModal(true);
  };

  const openEditModal = (tut) => {
    setEditingTut(tut);
    setForm({
      title: tut.title,
      description: tut.description || '',
      youtube_link: tut.youtube_link,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = editingTut
        ? `/api/developer/tutorials/${editingTut.id}`
        : '/api/developer/tutorials';
      const method = editingTut ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchTutorials();
      } else {
        alert(data.error || 'Failed to save tutorial');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this tutorial?')) return;
    try {
      const res = await fetch(`/api/developer/tutorials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchTutorials();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BiVideo className="text-secondary" /> Video Tutorials Management
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Create and maintain step-by-step video guides published to the public /tutorials portal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTutorials}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <BiRefresh className="text-lg" />
          </button>
          {canManage && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-bold shadow-sm transition-all"
            >
              <BiPlus className="text-base" /> New Tutorial
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading video guides...</div>
      ) : tutorials.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-2 shadow-sm">
          <BiVideo className="text-4xl text-slate-400 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">No video tutorials published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((tut) => {
            const videoId = extractYoutubeId(tut.youtube_link);
            return (
              <div
                key={tut.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* YouTube Embed or Thumbnail */}
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    {videoId ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                        title={tut.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <BiPlayCircle className="text-4xl" />
                        <span className="text-xs">Invalid Video Link</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{tut.title}</h3>
                      {canManage && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEditModal(tut)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                            title="Edit"
                          >
                            <BiEdit className="text-base" />
                          </button>
                          <button
                            onClick={() => handleDelete(tut.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                            title="Delete"
                          >
                            <BiTrash className="text-base" />
                          </button>
                        </div>
                      )}
                    </div>
                    {tut.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {tut.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-50 mt-2">
                  {tut.creator_name ? (
                    <span className="flex items-center gap-1">
                      <BiUser /> {tut.creator_name}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="flex items-center gap-1">
                    <BiCalendar /> {new Date(tut.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-5 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTut ? 'Edit Video Tutorial' : 'Add New Video Tutorial'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tutorial Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Connecting Custom Domains & DNS Setup"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-secondary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">YouTube URL</label>
                <input
                  type="url"
                  required
                  value={form.youtube_link}
                  onChange={(e) => setForm({ ...form, youtube_link: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-secondary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief overview of what viewers will learn in this video guide..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-secondary focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingTut ? 'Update Tutorial' : 'Publish Tutorial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
