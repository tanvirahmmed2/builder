'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '@/components/helper/Context';
import { 
  BiBookOpen, 
  BiPlus, 
  BiTrash, 
  BiEdit, 
  BiLoaderAlt, 
  BiTimeFive, 
  BiX
} from 'react-icons/bi';

export default function TutorialsControlPage() {
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
      const res = await axios.get('/api/tutorials');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch tutorials error:', err);
      toast.error('Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ title: '', summary: '', difficulty_level: 'Beginner', estimated_time_minutes: 15, is_published: true });
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
        await axios.put(`/api/tutorials/${editingItem.id}`, formData);
        toast.success('Updated successfully');
      } else {
        await axios.post('/api/tutorials', formData);
        toast.success('Created successfully');
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
    if (!confirm('Are you sure you want to delete this tutorial?')) return;
    try {
      await axios.delete(`/api/tutorials/${id}`);
      toast.success('Deleted successfully');
      setItems(items.filter(it => it.id !== id));
    } catch (err) {
      toast.error('Failed to delete tutorial');
    }
  };

  return (
    <div className={`w-full min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8 transition-all duration-300 ${dashSidebar ? 'lg:pl-64' : 'lg:pl-8'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-cyan-600/20">
              <BiBookOpen />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Tutorials & Knowledge Base</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage customer documentation, guides, and learning paths</p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-cyan-600/30"
          >
            <BiPlus className="text-base" /> New Tutorial
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
            <BiLoaderAlt className="animate-spin text-3xl text-cyan-600 mb-2" />
            <span className="text-xs font-semibold text-slate-500">Loading tutorials...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <BiBookOpen className="text-4xl text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No tutorials yet</h3>
            <p className="text-xs text-slate-400 mt-1">Create step-by-step guides for your users</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(t => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded text-[10px] font-bold">
                      {t.difficulty_level || 'General'}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <BiTimeFive /> {t.estimated_time_minutes} mins
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{t.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">{t.summary || 'Comprehensive tutorial guide.'}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                  <span className={`text-[10px] font-bold ${t.is_published ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {t.is_published ? 'Live Online' : 'Draft'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(t)} className="p-1.5 text-slate-400 hover:text-cyan-600">
                      <BiEdit className="text-base" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                      <BiTrash className="text-base" />
                    </button>
                  </div>
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
                  {editingItem ? 'Edit Tutorial' : 'New Tutorial Guide'}
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Level</label>
                    <select
                      value={formData.difficulty_level || 'Beginner'}
                      onChange={e => setFormData({ ...formData, difficulty_level: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Estimated Mins</label>
                    <input
                      type="number"
                      value={formData.estimated_time_minutes || 15}
                      onChange={e => setFormData({ ...formData, estimated_time_minutes: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Summary</label>
                  <textarea
                    rows={3}
                    value={formData.summary || ''}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="tut_pub"
                    checked={!!formData.is_published}
                    onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                  />
                  <label htmlFor="tut_pub" className="text-xs font-semibold text-slate-700">Publish Immediately</label>
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
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold"
                  >
                    {saving ? 'Saving...' : 'Save Tutorial'}
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

