'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '@/components/helper/Context';
import { 
  BiBoltCircle, 
  BiPlus, 
  BiTrash, 
  BiEdit, 
  BiLoaderAlt, 
  BiLinkAlt, 
  BiCheckCircle, 
  BiX
} from 'react-icons/bi';

export default function AutomationControlPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';

  const { dashSidebar } = useContext(Context);

  const [activeTab, setActiveTab] = useState('workflows');
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
      const res = await axios.get(`/api/automation?tab=${activeTab}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch automation error:', err);
      toast.error('Failed to load automation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === 'workflows') {
      setFormData({ name: 'Order Notification SMS', description: 'Trigger Brevo / SMS on new order placement', trigger_type: 'order_placed', is_active: true });
    } else {
      setFormData({ name: 'Zapier / ERP Sync', url: 'https://webhook.site/demo', events: 'order.created,order.completed', is_active: true });
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
      const payload = { ...formData, type: activeTab === 'webhooks' ? 'webhook' : 'workflow' };

      if (editingItem) {
        await axios.put(`/api/automation/${editingItem.id}`, payload);
        toast.success('Updated successfully');
      } else {
        await axios.post('/api/automation', payload);
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
      const type = activeTab === 'webhooks' ? 'webhook' : 'workflow';
      await axios.delete(`/api/automation/${id}?type=${type}`);
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
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-purple-600/20">
              <BiBoltCircle />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Enterprise Automation & Webhooks</h1>
              <p className="text-xs text-slate-500 mt-0.5">Automate business triggers, email/SMS dispatch workflows, and external webhook integrations</p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-purple-600/30"
          >
            <BiPlus className="text-base" /> New {activeTab === 'webhooks' ? 'Webhook Endpoint' : 'Trigger Workflow'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl gap-6 overflow-x-auto">
          {[
            { id: 'workflows', label: 'Automation Workflows', icon: BiBoltCircle },
            { id: 'webhooks', label: 'Outgoing Webhooks', icon: BiLinkAlt },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-2 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'border-purple-600 text-purple-600'
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
            <BiLoaderAlt className="animate-spin text-3xl text-purple-600 mb-2" />
            <span className="text-xs font-semibold text-slate-500">Loading automation data...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-b-xl border border-t-0 border-slate-200">
            <BiBoltCircle className="text-4xl text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No automation configured</h3>
            <p className="text-xs text-slate-400 mt-1">Create trigger workflows or webhooks to connect external applications</p>
          </div>
        ) : (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6">
            
            {activeTab === 'workflows' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(w => (
                  <div key={w.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm">{w.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${w.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {w.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-purple-600 font-mono font-semibold">
                        Trigger: {w.trigger_type}
                      </div>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{w.description || 'Automated background action.'}</p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button onClick={() => openEditModal(w)} className="p-1.5 text-slate-400 hover:text-purple-600">
                        <BiEdit className="text-base" />
                      </button>
                      <button onClick={() => handleDelete(w.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                        <BiTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'webhooks' && (
              <div className="space-y-4">
                {items.map(wh => (
                  <div key={wh.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">{wh.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${wh.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {wh.is_active ? 'Listening' : 'Disabled'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono mt-1 truncate max-w-xl">
                        URL: {wh.url}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Events: <span className="font-semibold text-slate-600">{wh.events || 'all'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(wh)} className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(wh.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                        <BiTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  {editingItem ? 'Edit' : 'Create'} {activeTab === 'webhooks' ? 'Webhook Endpoint' : 'Automation Workflow'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <BiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                {activeTab === 'workflows' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Workflow Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Trigger Event</label>
                      <select
                        value={formData.trigger_type || 'order_placed'}
                        onChange={e => setFormData({ ...formData, trigger_type: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                      >
                        <option value="order_placed">Order Placed</option>
                        <option value="order_completed">Order Completed</option>
                        <option value="customer_registered">New Customer Signup</option>
                        <option value="low_stock_alert">Low Inventory Warning</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'webhooks' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Webhook Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Payload URL</label>
                      <input
                        type="url"
                        required
                        value={formData.url || ''}
                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Events (comma separated)</label>
                      <input
                        type="text"
                        value={formData.events || ''}
                        onChange={e => setFormData({ ...formData, events: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
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
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
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

