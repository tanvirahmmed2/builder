'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '@/components/helper/Context';
import { 
  BiCompass, 
  BiPlus, 
  BiTrash, 
  BiEdit, 
  BiLoaderAlt, 
  BiMapPin, 
  BiTimeFive, 
  BiCalendar, 
  BiStar, 
  BiDollarCircle, 
  BiUser,
  BiX
} from 'react-icons/bi';

export default function ToursControlPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';

  const { dashSidebar } = useContext(Context);

  const [activeTab, setActiveTab] = useState('packages');
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
      const res = await axios.get(`/api/tours?tab=${activeTab}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch tours error:', err);
      toast.error('Failed to load travel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === 'packages') {
      setFormData({ title: '', duration_days: 3, duration_nights: 2, base_price: 12500, description: '', thumbnail_url: '', is_featured: false, is_active: true });
    } else if (activeTab === 'spots') {
      setFormData({ name: '', location: '', description: '', thumbnail_url: '', is_active: true });
    } else if (activeTab === 'bookings') {
      setFormData({ customer_name: '', customer_phone: '', customer_email: '', travel_date: new Date().toISOString().slice(0, 10), total_guests: 2, total_amount: 25000 });
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
      const type = activeTab === 'spots' ? 'spot' : activeTab === 'bookings' ? 'booking' : 'package';
      const payload = { ...formData, type };

      if (editingItem) {
        await axios.put(`/api/tours/${editingItem.id}`, payload);
        toast.success('Updated successfully');
      } else {
        await axios.post('/api/tours', payload);
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
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const type = activeTab === 'spots' ? 'spot' : activeTab === 'bookings' ? 'booking' : 'package';
      await axios.delete(`/api/tours/${id}?type=${type}`);
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
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-teal-600/20">
              <BiCompass />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Tour & Travel Management</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage vacation packages, sightseeing spots, and passenger bookings</p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-teal-600/30"
          >
            <BiPlus className="text-base" /> New {activeTab === 'spots' ? 'Destination' : activeTab === 'bookings' ? 'Booking' : 'Tour Package'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl gap-6 overflow-x-auto">
          {[
            { id: 'packages', label: 'Tour Packages', icon: BiCompass },
            { id: 'spots', label: 'Destinations & Spots', icon: BiMapPin },
            { id: 'bookings', label: 'Passenger Bookings', icon: BiCalendar },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-2 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'border-teal-600 text-teal-600'
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
            <BiLoaderAlt className="animate-spin text-3xl text-teal-600 mb-2" />
            <span className="text-xs font-semibold text-slate-500">Loading travel records...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-b-xl border border-t-0 border-slate-200">
            <BiCompass className="text-4xl text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No records found</h3>
            <p className="text-xs text-slate-400 mt-1">Get started by creating your first tour package or destination</p>
          </div>
        ) : (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6">
            
            {activeTab === 'packages' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(p => (
                  <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      {p.thumbnail_url ? (
                        <img src={p.thumbnail_url} alt={p.title} className="w-full h-44 object-cover" />
                      ) : (
                        <div className="w-full h-44 bg-slate-100 flex items-center justify-center text-slate-300">
                          <BiCompass className="text-4xl" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{p.title}</h4>
                          {p.is_featured && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded text-[10px] font-bold flex items-center gap-1">
                              <BiStar /> Featured
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.description || 'Scenic vacation package.'}</p>
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                          <span className="px-2 py-0.5 bg-slate-100 rounded">{p.duration_days} Days / {p.duration_nights} Nights</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-3">
                      <div className="text-lg font-bold text-slate-900">
                        ৳{Number(p.base_price || 0).toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">/person</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(p)} className="p-1.5 text-slate-400 hover:text-teal-600">
                          <BiEdit className="text-base" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                          <BiTrash className="text-base" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'spots' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {items.map(s => (
                  <div key={s.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      {s.thumbnail_url ? (
                        <img src={s.thumbnail_url} alt={s.name} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-slate-100 flex items-center justify-center text-slate-300">
                          <BiMapPin className="text-3xl" />
                        </div>
                      )}
                      <div className="p-4">
                        <h4 className="font-bold text-slate-800 text-sm">{s.name}</h4>
                        <div className="text-xs text-teal-600 font-semibold mt-0.5 flex items-center gap-1">
                          <BiMapPin /> {s.location || 'Bangladesh'}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-2">{s.description || 'Scenic sightseeing location.'}</p>
                      </div>
                    </div>
                    <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button onClick={() => openEditModal(s)} className="p-1.5 text-slate-400 hover:text-teal-600">
                        <BiEdit className="text-base" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                        <BiTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Package</th>
                      <th className="p-3">Travel Date</th>
                      <th className="p-3">Guests</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {items.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{b.customer_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{b.customer_phone}</div>
                        </td>
                        <td className="p-3 font-semibold">{b.package_title || 'Custom Tour'}</td>
                        <td className="p-3">{new Date(b.travel_date).toLocaleDateString('en-GB')}</td>
                        <td className="p-3">{b.total_guests} guests</td>
                        <td className="p-3 font-bold text-slate-900">৳{Number(b.total_amount || 0).toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${b.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {b.payment_status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-[10px] font-bold uppercase">
                            {b.booking_status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleDelete(b.id)} className="text-rose-600 hover:underline">Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  {editingItem ? 'Edit' : 'Create'} {activeTab === 'spots' ? 'Destination' : activeTab === 'bookings' ? 'Booking' : 'Tour Package'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <BiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                {activeTab === 'packages' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Package Title</label>
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
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Days</label>
                        <input
                          type="number"
                          value={formData.duration_days || 3}
                          onChange={e => setFormData({ ...formData, duration_days: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nights</label>
                        <input
                          type="number"
                          value={formData.duration_nights || 2}
                          onChange={e => setFormData({ ...formData, duration_nights: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Base Price (৳)</label>
                      <input
                        type="number"
                        required
                        value={formData.base_price || 0}
                        onChange={e => setFormData({ ...formData, base_price: e.target.value })}
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

                {activeTab === 'spots' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Spot Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Location</label>
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
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
                  </>
                )}

                {activeTab === 'bookings' && (
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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Guests</label>
                        <input
                          type="number"
                          value={formData.total_guests || 1}
                          onChange={e => setFormData({ ...formData, total_guests: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Total (৳)</label>
                        <input
                          type="number"
                          value={formData.total_amount || 0}
                          onChange={e => setFormData({ ...formData, total_amount: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
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
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
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

