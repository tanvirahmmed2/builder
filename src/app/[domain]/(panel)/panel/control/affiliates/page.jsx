'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '@/components/helper/Context';
import { 
  BiShareAlt, 
  BiPlus, 
  BiTrash, 
  BiEdit, 
  BiLoaderAlt, 
  BiDollarCircle, 
  BiUser, 
  BiCheckCircle,
  BiX
} from 'react-icons/bi';

export default function AffiliatesControlPage() {
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
      const res = await axios.get('/api/affiliates');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch affiliates error:', err);
      toast.error('Failed to load affiliates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ affiliate_code: '', commission_rate: 10 });
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
        await axios.put(`/api/affiliates/${editingItem.id}`, formData);
        toast.success('Updated successfully');
      } else {
        await axios.post('/api/affiliates', formData);
        toast.success('Affiliate created');
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
    if (!confirm('Are you sure you want to delete this affiliate?')) return;
    try {
      await axios.delete(`/api/affiliates/${id}`);
      toast.success('Deleted successfully');
      setItems(items.filter(it => it.id !== id));
    } catch (err) {
      toast.error('Failed to delete affiliate');
    }
  };

  return (
    <div className={`w-full min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8 transition-all duration-300 ${dashSidebar ? 'lg:pl-64' : 'lg:pl-8'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-blue-600/20">
              <BiShareAlt />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Affiliate Marketing & Referrals</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage partner affiliate links, commission rates, and referral payout balances</p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
          >
            <BiPlus className="text-base" /> New Affiliate
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
            <BiLoaderAlt className="animate-spin text-3xl text-blue-600 mb-2" />
            <span className="text-xs font-semibold text-slate-500">Loading affiliates...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <BiShareAlt className="text-4xl text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No affiliates registered</h3>
            <p className="text-xs text-slate-400 mt-1">Onboard affiliates to drive organic referral sales</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Affiliate Code</th>
                  <th className="p-3">Partner Name</th>
                  <th className="p-3">Commission</th>
                  <th className="p-3">Total Earned</th>
                  <th className="p-3">Payable Balance</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-blue-600">{a.affiliate_code}</td>
                    <td className="p-3 font-semibold text-slate-800">{a.user_name || 'Direct Partner'}</td>
                    <td className="p-3 font-bold text-slate-700">{a.commission_rate}%</td>
                    <td className="p-3">৳{Number(a.total_earnings || 0).toLocaleString()}</td>
                    <td className="p-3 font-bold text-emerald-600">৳{Number(a.balance || 0).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditModal(a)} className="p-1.5 text-slate-400 hover:text-blue-600">
                          <BiEdit className="text-base" />
                        </button>
                        <button onClick={() => handleDelete(a.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                          <BiTrash className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  {editingItem ? 'Edit Affiliate' : 'New Affiliate Partner'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <BiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Affiliate Code</label>
                  <input
                    type="text"
                    value={formData.affiliate_code || ''}
                    onChange={e => setFormData({ ...formData, affiliate_code: e.target.value.toUpperCase() })}
                    placeholder="Leave blank to auto-generate"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    required
                    value={formData.commission_rate || 10}
                    onChange={e => setFormData({ ...formData, commission_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
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
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                  >
                    {saving ? 'Saving...' : 'Save Partner'}
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

