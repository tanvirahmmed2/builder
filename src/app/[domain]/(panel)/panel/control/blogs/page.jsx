'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '@/components/helper/Context';
import { 
  BiNews, 
  BiPlus, 
  BiTrash, 
  BiEdit, 
  BiLoaderAlt, 
  BiCalendar, 
  BiShow, 
  BiX
} from 'react-icons/bi';

export default function BlogsControlPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';

  const { dashSidebar } = useContext(Context);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/blogs');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch blogs error:', err);
      toast.error('Failed to load blog articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ title: '', summary: '', content: '', thumbnail_url: '', is_published: true });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await axios.put(`/api/blogs/${editingItem.id}`, formData);
        toast.success('Updated successfully');
      } else {
        await axios.post('/api/blogs', formData);
        toast.success('Published successfully');
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await axios.delete(`/api/blogs/${id}`);
      toast.success('Deleted successfully');
      setItems(items.filter(it => it.id !== id));
    } catch (err) {
      toast.error('Failed to delete article');
    }
  };

  return (
    <div className={`w-full min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8 transition-all duration-300 ${dashSidebar ? 'lg:pl-64' : 'lg:pl-8'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-pink-600/20">
              <BiNews />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Articles & Blog Publishing</h1>
              <p className="text-xs text-slate-500 mt-0.5">Publish stories, company announcements, guides, and SEO news</p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-pink-600/30"
          >
            <BiPlus className="text-base" /> New Article
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
            <BiLoaderAlt className="animate-spin text-3xl text-pink-600 mb-2" />
            <span className="text-xs font-semibold text-slate-500">Loading articles...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <BiNews className="text-4xl text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No blog posts yet</h3>
            <p className="text-xs text-slate-400 mt-1">Write your first post to engage your audience</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(b => (
              <div key={b.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                  {b.thumbnail_url ? (
                    <img src={b.thumbnail_url} alt={b.title} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-slate-100 flex items-center justify-center text-slate-300">
                      <BiNews className="text-4xl" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {b.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <BiShow /> {b.view_count || 0} reads
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm truncate">{b.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">{b.summary || 'No summary text.'}</p>
                    <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
                      <BiCalendar /> {new Date(b.created_at).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-end gap-1.5 border-t border-slate-100 mt-2">
                  <button onClick={() => openEditModal(b)} className="p-1.5 text-slate-400 hover:text-pink-600">
                    <BiEdit className="text-base" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                    <BiTrash className="text-base" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  {editingItem ? 'Edit Article' : 'Write New Article'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <BiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Thumbnail URL</label>
                  <input
                    type="url"
                    value={formData.thumbnail_url || ''}
                    onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Summary / Excerpt</label>
                  <textarea
                    rows={2}
                    value={formData.summary || ''}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Article Content</label>
                  <textarea
                    rows={5}
                    value={formData.content || ''}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                    placeholder="Write article markdown or HTML..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={!!formData.is_published}
                    onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                  />
                  <label htmlFor="is_published" className="text-xs font-semibold text-slate-700">Publish Immediately</label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold"
                  >
                    {saving ? 'Saving...' : 'Save Article'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

