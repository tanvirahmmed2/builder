'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '@/components/helper/Context';
import { 
  BiBriefcase, 
  BiPlus, 
  BiTrash, 
  BiEdit, 
  BiLoaderAlt, 
  BiGlobe, 
  BiCodeAlt, 
  BiStar, 
  BiLayer, 
  BiDollarCircle, 
  BiCheckCircle,
  BiX
} from 'react-icons/bi';

export default function PortfolioControlPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';

  const { dashSidebar } = useContext(Context);

  const [activeTab, setActiveTab] = useState('projects');
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
      const res = await axios.get(`/api/portfolio?tab=${activeTab}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch portfolio error:', err);
      toast.error('Failed to load portfolio items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === 'projects') {
      setFormData({ title: '', summary: '', client_name: '', project_url: '', github_url: '', thumbnail_url: '', is_featured: false });
    } else if (activeTab === 'services') {
      setFormData({ title: '', summary: '', starting_price: 100, is_active: true });
    } else {
      setFormData({ skill_name: '', proficiency_percentage: 85, sort_order: 1 });
    }
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
      const payload = {
        ...formData,
        type: activeTab === 'services' ? 'service' : activeTab === 'skills' ? 'skill' : 'project'
      };

      if (editingItem) {
        await axios.put(`/api/portfolio/${editingItem.id}`, payload);
        toast.success('Updated successfully');
      } else {
        await axios.post('/api/portfolio', payload);
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
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const type = activeTab === 'services' ? 'service' : activeTab === 'skills' ? 'skill' : 'project';
      await axios.delete(`/api/portfolio/${id}?type=${type}`);
      toast.success('Deleted successfully');
      setItems(items.filter(it => it.id !== id));
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  return (
    <div className={`w-full min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8 transition-all duration-300 ${dashSidebar ? 'lg:pl-64' : 'lg:pl-8'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-600/20">
              <BiBriefcase />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Portfolio & Creative Showcase</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage projects, service packages, and technical skills</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
            >
              <BiPlus className="text-base" /> New {activeTab === 'projects' ? 'Project' : activeTab === 'services' ? 'Service' : 'Skill'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl gap-6">
          {[
            { id: 'projects', label: 'Projects Showcase', icon: BiBriefcase },
            { id: 'services', label: 'Services & Pricing', icon: BiDollarCircle },
            { id: 'skills', label: 'Skills & Tech Stack', icon: BiCodeAlt },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-2 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="text-base" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-b-xl border border-t-0 border-slate-200">
            <BiLoaderAlt className="animate-spin text-3xl text-indigo-600 mb-2" />
            <span className="text-xs font-semibold text-slate-500">Loading portfolio data...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-b-xl border border-t-0 border-slate-200">
            <BiLayer className="text-4xl text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No items found</h3>
            <p className="text-xs text-slate-400 mt-1">Get started by creating your first entry</p>
          </div>
        ) : (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6">
            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(p => (
                  <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                    {p.thumbnail_url ? (
                      <img src={p.thumbnail_url} alt={p.title} className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-slate-100 flex items-center justify-center text-slate-400">
                        <BiBriefcase className="text-4xl" />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-800 text-sm">{p.title}</h4>
                          {p.is_featured && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded text-[10px] font-bold flex items-center gap-1">
                              <BiStar /> Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{p.summary || 'No summary provided'}</p>
                        {p.client_name && (
                          <div className="mt-2 text-[11px] text-slate-400 font-medium">Client: {p.client_name}</div>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {p.project_url && (
                            <a href={p.project_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-600">
                              <BiGlobe className="text-base" />
                            </a>
                          )}
                          {p.github_url && (
                            <a href={p.github_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-800">
                              <BiCodeAlt className="text-base" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEditModal(p)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded">
                            <BiEdit className="text-base" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded">
                            <BiTrash className="text-base" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'services' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map(s => (
                  <div key={s.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm">{s.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {s.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.summary || 'No summary available.'}</p>
                      <div className="mt-4 text-lg font-bold text-slate-800">
                        ৳{Number(s.starting_price || 0).toLocaleString()}
                        <span className="text-[11px] text-slate-400 font-normal ml-1">starting</span>
                      </div>
                    </div>
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button onClick={() => openEditModal(s)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded">
                        <BiEdit className="text-base" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded">
                        <BiTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {items.map(sk => (
                  <div key={sk.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{sk.skill_name}</div>
                      <div className="w-28 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${sk.proficiency_percentage}%` }}></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-600 mr-2">{sk.proficiency_percentage}%</span>
                      <button onClick={() => openEditModal(sk)} className="p-1 text-slate-400 hover:text-indigo-600">
                        <BiEdit className="text-base" />
                      </button>
                      <button onClick={() => handleDelete(sk.id)} className="p-1 text-slate-400 hover:text-rose-600">
                        <BiTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  {editingItem ? 'Edit' : 'Create'} {activeTab === 'projects' ? 'Project' : activeTab === 'services' ? 'Service' : 'Skill'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <BiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                {activeTab === 'projects' && (
                  <>
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
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Client Name</label>
                      <input
                        type="text"
                        value={formData.client_name || ''}
                        onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Summary</label>
                      <textarea
                        rows={2}
                        value={formData.summary || ''}
                        onChange={e => setFormData({ ...formData, summary: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Project Demo URL</label>
                      <input
                        type="url"
                        value={formData.project_url || ''}
                        onChange={e => setFormData({ ...formData, project_url: e.target.value })}
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
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={!!formData.is_featured}
                        onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                      />
                      <label htmlFor="is_featured" className="text-xs font-semibold text-slate-700">Mark as Featured</label>
                    </div>
                  </>
                )}

                {activeTab === 'services' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Service Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Starting Price (৳)</label>
                      <input
                        type="number"
                        value={formData.starting_price || 0}
                        onChange={e => setFormData({ ...formData, starting_price: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Summary</label>
                      <textarea
                        rows={2}
                        value={formData.summary || ''}
                        onChange={e => setFormData({ ...formData, summary: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'skills' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Skill Name</label>
                      <input
                        type="text"
                        required
                        value={formData.skill_name || ''}
                        onChange={e => setFormData({ ...formData, skill_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Proficiency (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.proficiency_percentage || 80}
                        onChange={e => setFormData({ ...formData, proficiency_percentage: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </>
                )}

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
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                  >
                    {saving ? 'Saving...' : 'Save'}
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

