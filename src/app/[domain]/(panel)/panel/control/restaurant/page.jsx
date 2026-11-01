'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '@/components/helper/Context';
import { 
  BiDish, 
  BiPlus, 
  BiTrash, 
  BiEdit, 
  BiLoaderAlt, 
  BiTimeFive, 
  BiTv, 
  BiCheckCircle,
  BiCalendarCheck,
  BiGridAlt,
  BiX
} from 'react-icons/bi';

export default function RestaurantControlPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';

  const { dashSidebar } = useContext(Context);

  const [activeTab, setActiveTab] = useState('items');
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
      const url = activeTab === 'kds' ? '/api/restaurant/kds' : `/api/restaurant?tab=${activeTab}`;
      const res = await axios.get(url);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch restaurant data error:', err);
      toast.error('Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === 'items') {
      setFormData({ name: '', description: '', base_price: 150, preparation_time_minutes: 15, is_vegetarian: false, is_spicy: false, is_available: true });
    } else if (activeTab === 'tables') {
      setFormData({ table_number: '', capacity: 4, status: 'available' });
    } else if (activeTab === 'reservations') {
      setFormData({ customer_name: '', customer_phone: '', party_size: 2, reservation_time: new Date().toISOString().slice(0, 16), notes: '' });
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
      const type = activeTab === 'tables' ? 'table' : activeTab === 'reservations' ? 'reservation' : 'item';
      const payload = { ...formData, type };

      if (editingItem) {
        await axios.put(`/api/restaurant/${editingItem.id}`, payload);
        toast.success('Updated successfully');
      } else {
        await axios.post('/api/restaurant', payload);
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
      const type = activeTab === 'tables' ? 'table' : activeTab === 'reservations' ? 'reservation' : 'item';
      await axios.delete(`/api/restaurant/${id}?type=${type}`);
      toast.success('Deleted successfully');
      setItems(items.filter(it => it.id !== id));
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const updateKdsStatus = async (ticketId, nextStatus) => {
    try {
      await axios.put('/api/restaurant/kds', { id: ticketId, status: nextStatus });
      toast.success(`Ticket marked as ${nextStatus}`);
      fetchItems();
    } catch (err) {
      toast.error('Failed to update KDS ticket');
    }
  };

  return (
    <div className={`w-full min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8 transition-all duration-300 ${dashSidebar ? 'lg:pl-64' : 'lg:pl-8'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-orange-600/20">
              <BiDish />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Restaurant, Cloud POS & Kitchen (KDS)</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage food menu items, tables, reservations, and live kitchen tickets</p>
            </div>
          </div>

          {activeTab !== 'kds' && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-orange-600/30"
            >
              <BiPlus className="text-base" /> New {activeTab === 'items' ? 'Food Item' : activeTab === 'tables' ? 'Table' : 'Reservation'}
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl gap-6 overflow-x-auto">
          {[
            { id: 'items', label: 'Food Menu Items', icon: BiDish },
            { id: 'tables', label: 'Floor Tables', icon: BiGridAlt },
            { id: 'reservations', label: 'Reservations', icon: BiCalendarCheck },
            { id: 'kds', label: 'Live Kitchen Display (KDS)', icon: BiTv },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-2 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'border-orange-600 text-orange-600'
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
            <BiLoaderAlt className="animate-spin text-3xl text-orange-600 mb-2" />
            <span className="text-xs font-semibold text-slate-500">Loading restaurant data...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-b-xl border border-t-0 border-slate-200">
            <BiDish className="text-4xl text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No records found</h3>
            <p className="text-xs text-slate-400 mt-1">Get started by creating your first entry</p>
          </div>
        ) : (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6">
            
            {activeTab === 'items' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map(item => (
                  <div key={item.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-36 object-cover" />
                      ) : (
                        <div className="w-full h-36 bg-slate-100 flex items-center justify-center text-slate-300">
                          <BiDish className="text-4xl" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.is_available ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {item.is_available ? 'Available' : 'Sold Out'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{item.description || 'Delicious freshly prepared dish.'}</p>
                        
                        <div className="mt-3 flex items-center gap-2">
                          {item.is_vegetarian && (
                            <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[9px] font-bold">VEG</span>
                          )}
                          {item.is_spicy && (
                            <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[9px] font-bold">SPICY</span>
                          )}
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
                            <BiTimeFive /> {item.preparation_time_minutes || 15}m
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                      <div className="text-base font-bold text-slate-900">৳{Number(item.base_price || 0).toLocaleString()}</div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-400 hover:text-orange-600">
                          <BiEdit className="text-base" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                          <BiTrash className="text-base" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tables' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {items.map(t => (
                  <div key={t.id} className="border border-slate-200 rounded-xl p-4 text-center shadow-sm relative group">
                    <div className="text-lg font-black text-slate-800">Table {t.table_number}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{t.capacity} Seats</div>
                    <div className="mt-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.status === 'occupied' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
                      <button onClick={() => openEditModal(t)} className="text-slate-400 hover:text-orange-600 text-xs">Edit</button>
                      <button onClick={() => handleDelete(t.id)} className="text-slate-400 hover:text-rose-600 text-xs">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reservations' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Table</th>
                      <th className="p-3">Party Size</th>
                      <th className="p-3">Reservation Time</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {items.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{r.customer_name}</td>
                        <td className="p-3 font-mono">{r.customer_phone}</td>
                        <td className="p-3">{r.table_number ? `Table ${r.table_number}` : 'Unassigned'}</td>
                        <td className="p-3">{r.party_size} guests</td>
                        <td className="p-3">{new Date(r.reservation_time).toLocaleString('en-GB')}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase">
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleDelete(r.id)} className="text-rose-600 hover:underline">Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'kds' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(k => (
                  <div key={k.id} className="border border-slate-200 rounded-2xl p-5 shadow-sm bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-400">TICKET #{k.ticket_number}</span>
                        <h4 className="font-bold text-slate-800 text-base">Order #{k.order_id || k.id}</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                        k.status === 'cooking' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        k.status === 'ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {k.status}
                      </span>
                    </div>

                    <div className="py-4 text-xs space-y-1 text-slate-600">
                      <div><span className="font-bold">Customer:</span> {k.customer_name || 'Walk-in'}</div>
                      <div><span className="font-bold">Received:</span> {new Date(k.created_at).toLocaleTimeString()}</div>
                      <div><span className="font-bold">Priority:</span> {k.priority || 'Normal'}</div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => updateKdsStatus(k.id, 'cooking')}
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition"
                      >
                        Start Cooking
                      </button>
                      <button
                        onClick={() => updateKdsStatus(k.id, 'ready')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                      >
                        <BiCheckCircle /> Ready
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
                  {editingItem ? 'Edit' : 'Create'} {activeTab === 'items' ? 'Food Item' : activeTab === 'tables' ? 'Table' : 'Reservation'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <BiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                {activeTab === 'items' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Item Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Price (৳)</label>
                      <input
                        type="number"
                        required
                        value={formData.base_price || 0}
                        onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Prep Time (Mins)</label>
                      <input
                        type="number"
                        value={formData.preparation_time_minutes || 15}
                        onChange={e => setFormData({ ...formData, preparation_time_minutes: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
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
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!formData.is_vegetarian}
                          onChange={e => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                        />
                        Vegetarian
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={!!formData.is_spicy}
                          onChange={e => setFormData({ ...formData, is_spicy: e.target.checked })}
                        />
                        Spicy
                      </label>
                    </div>
                  </>
                )}

                {activeTab === 'tables' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Table Number</label>
                      <input
                        type="text"
                        required
                        value={formData.table_number || ''}
                        onChange={e => setFormData({ ...formData, table_number: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Seating Capacity</label>
                      <input
                        type="number"
                        required
                        value={formData.capacity || 4}
                        onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'reservations' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Customer Name</label>
                      <input
                        type="text"
                        required
                        value={formData.customer_name || ''}
                        onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Customer Phone</label>
                      <input
                        type="tel"
                        required
                        value={formData.customer_phone || ''}
                        onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Party Size</label>
                      <input
                        type="number"
                        value={formData.party_size || 2}
                        onChange={e => setFormData({ ...formData, party_size: e.target.value })}
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
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold"
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

