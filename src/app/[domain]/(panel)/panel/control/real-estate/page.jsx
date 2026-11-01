'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '@/components/helper/Context';
import { 
  BiBuildingHouse, 
  BiPlus, 
  BiTrash, 
  BiEdit, 
  BiLoaderAlt, 
  BiMapPin, 
  BiCalendar, 
  BiStar, 
  BiDollarCircle, 
  BiUser,
  BiBed,
  BiBath,
  BiArea,
  BiX
} from 'react-icons/bi';

export default function RealEstateControlPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';

  const { dashSidebar } = useContext(Context);

  const [activeTab, setActiveTab] = useState('properties');
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
      const res = await axios.get(`/api/real-estate?tab=${activeTab}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch real estate error:', err);
      toast.error('Failed to load property data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === 'properties') {
      setFormData({ title: '', property_type: 'Apartment', listing_type: 'sale', price: 9500000, bedrooms: 3, bathrooms: 2, area_sqft: 1450, status: 'available', is_featured: false });
    } else if (activeTab === 'developments') {
      setFormData({ title: '', developer_name: '', location: 'Gulshan, Dhaka', status: 'under_construction', total_units: 24 });
    } else if (activeTab === 'agents') {
      setFormData({ full_name: '', email: '', phone: '', bio: '', license_number: '', is_active: true });
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
      const type = activeTab === 'developments' ? 'development' : activeTab === 'agents' ? 'agent' : 'property';
      const payload = { ...formData, type };

      if (editingItem) {
        await axios.put(`/api/real-estate/${editingItem.id}`, payload);
        toast.success('Updated successfully');
      } else {
        await axios.post('/api/real-estate', payload);
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
      const type = activeTab === 'developments' ? 'development' : activeTab === 'agents' ? 'agent' : activeTab === 'viewings' ? 'viewing' : 'property';
      await axios.delete(`/api/real-estate/${id}?type=${type}`);
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
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-emerald-600/20">
              <BiBuildingHouse />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Real Estate & Property Management</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage residential & commercial listings, property developments, and viewing requests</p>
            </div>
          </div>

          {activeTab !== 'viewings' && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/30"
            >
              <BiPlus className="text-base" /> New {activeTab === 'developments' ? 'Development' : activeTab === 'agents' ? 'Agent' : 'Property Listing'}
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl gap-6 overflow-x-auto">
          {[
            { id: 'properties', label: 'Properties & Units', icon: BiBuildingHouse },
            { id: 'developments', label: 'Projects & Developments', icon: BiArea },
            { id: 'agents', label: 'Real Estate Agents', icon: BiUser },
            { id: 'viewings', label: 'Viewing Bookings', icon: BiCalendar },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-2 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-600'
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
            <BiLoaderAlt className="animate-spin text-3xl text-emerald-600 mb-2" />
            <span className="text-xs font-semibold text-slate-500">Loading real estate records...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-b-xl border border-t-0 border-slate-200">
            <BiBuildingHouse className="text-4xl text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No properties found</h3>
            <p className="text-xs text-slate-400 mt-1">Get started by adding your first property or development</p>
          </div>
        ) : (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6">
            
            {activeTab === 'properties' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(p => (
                  <div key={p.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase">
                          For {p.listing_type}
                        </span>
                        {p.is_featured && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded text-[10px] font-bold flex items-center gap-1">
                            <BiStar /> Featured
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm truncate">{p.title}</h4>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">{p.property_type}</div>

                      <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-slate-600 text-center text-xs">
                        <div className="flex flex-col items-center">
                          <span className="flex items-center gap-1 font-bold"><BiBed /> {p.bedrooms}</span>
                          <span className="text-[10px] text-slate-400">Beds</span>
                        </div>
                        <div className="flex flex-col items-center border-x border-slate-100">
                          <span className="flex items-center gap-1 font-bold"><BiBath /> {p.bathrooms}</span>
                          <span className="text-[10px] text-slate-400">Baths</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="flex items-center gap-1 font-bold"><BiArea /> {p.area_sqft}</span>
                          <span className="text-[10px] text-slate-400">Sqft</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between">
                      <div className="text-lg font-bold text-slate-900">
                        ৳{Number(p.price || 0).toLocaleString()}
                        {p.listing_type === 'rent' && <span className="text-[11px] text-slate-400 font-normal">/mo</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(p)} className="p-1.5 text-slate-400 hover:text-emerald-600">
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

            {activeTab === 'developments' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map(d => (
                  <div key={d.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm">{d.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                          {d.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <BiMapPin /> {d.location || 'Dhaka'}
                      </div>
                      <div className="mt-4 text-xs text-slate-600 font-medium">
                        Total Capacity: <span className="font-bold text-slate-800">{d.total_units} Units</span>
                      </div>
                    </div>
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button onClick={() => openEditModal(d)} className="p-1.5 text-slate-400 hover:text-emerald-600">
                        <BiEdit className="text-base" />
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                        <BiTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'agents' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(a => (
                  <div key={a.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{a.full_name}</h4>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">License: {a.license_number || 'N/A'}</div>
                      <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                        {a.email && <div>{a.email}</div>}
                        {a.phone && <div className="font-mono">{a.phone}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(a)} className="p-1.5 text-slate-400 hover:text-emerald-600">
                        <BiEdit className="text-base" />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                        <BiTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'viewings' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Client</th>
                      <th className="p-3">Property</th>
                      <th className="p-3">Viewing Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {items.map(v => (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{v.client_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{v.client_phone}</div>
                        </td>
                        <td className="p-3 font-semibold">{v.property_title || 'Listing'}</td>
                        <td className="p-3">{new Date(v.viewing_date).toLocaleString('en-GB')}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase">
                            {v.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleDelete(v.id)} className="text-rose-600 hover:underline">Cancel</button>
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
                  {editingItem ? 'Edit' : 'Create'} {activeTab === 'developments' ? 'Development' : activeTab === 'agents' ? 'Agent' : 'Property Listing'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <BiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                {activeTab === 'properties' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Property Title</label>
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
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Type</label>
                        <select
                          value={formData.property_type || 'Apartment'}
                          onChange={e => setFormData({ ...formData, property_type: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                        >
                          <option value="Apartment">Apartment</option>
                          <option value="Duplex Villa">Duplex Villa</option>
                          <option value="Commercial Office">Commercial Office</option>
                          <option value="Residential Plot">Residential Plot</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Listing Type</label>
                        <select
                          value={formData.listing_type || 'sale'}
                          onChange={e => setFormData({ ...formData, listing_type: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                        >
                          <option value="sale">For Sale</option>
                          <option value="rent">For Rent</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Price (৳)</label>
                      <input
                        type="number"
                        required
                        value={formData.price || 0}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Bedrooms</label>
                        <input
                          type="number"
                          value={formData.bedrooms || 3}
                          onChange={e => setFormData({ ...formData, bedrooms: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Bathrooms</label>
                        <input
                          type="number"
                          value={formData.bathrooms || 2}
                          onChange={e => setFormData({ ...formData, bathrooms: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Sqft</label>
                        <input
                          type="number"
                          value={formData.area_sqft || 1200}
                          onChange={e => setFormData({ ...formData, area_sqft: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'developments' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Project Name</label>
                      <input
                        type="text"
                        required
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
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
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Total Units</label>
                      <input
                        type="number"
                        value={formData.total_units || 10}
                        onChange={e => setFormData({ ...formData, total_units: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'agents' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Agent Name</label>
                      <input
                        type="text"
                        required
                        value={formData.full_name || ''}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">License No</label>
                      <input
                        type="text"
                        value={formData.license_number || ''}
                        onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
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

