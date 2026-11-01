'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '@/components/helper/Context';
import { 
  BiBus, 
  BiPlus, 
  BiTrash, 
  BiEdit, 
  BiLoaderAlt, 
  BiNavigation, 
  BiCalendar, 
  BiTimeFive, 
  BiMapPin,
  BiCar,
  BiCreditCard,
  BiX
} from 'react-icons/bi';

export default function TransportControlPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';

  const { dashSidebar } = useContext(Context);

  const [activeTab, setActiveTab] = useState('routes');
  const [items, setItems] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/transport?tab=${activeTab}`);
      setItems(Array.isArray(res.data) ? res.data : []);

      if (activeTab === 'trips') {
        const [rRes, vRes] = await Promise.all([
          axios.get('/api/transport?tab=routes'),
          axios.get('/api/transport?tab=vehicles')
        ]);
        setRoutes(Array.isArray(rRes.data) ? rRes.data : []);
        setVehicles(Array.isArray(vRes.data) ? vRes.data : []);
      }
    } catch (err) {
      console.error('Fetch transport error:', err);
      toast.error('Failed to load fleet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === 'routes') {
      setFormData({ route_name: 'Dhaka to Chittagong Express', origin: 'Dhaka', destination: 'Chittagong', distance_km: 245, estimated_duration_minutes: 360, is_active: true });
    } else if (activeTab === 'vehicles') {
      setFormData({ registration_number: 'DHAKA-METRO-BA-11-2026', model: 'Scania Higer Multi-axle', total_seats: 40, status: 'available', is_active: true });
    } else if (activeTab === 'trips') {
      setFormData({ route_id: routes[0]?.id || '', vehicle_id: vehicles[0]?.id || '', departure_time: new Date().toISOString().slice(0, 16), status: 'scheduled' });
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
      const type = activeTab === 'vehicles' ? 'vehicle' : activeTab === 'trips' ? 'trip' : 'route';
      const payload = { ...formData, type };

      if (editingItem) {
        await axios.put(`/api/transport/${editingItem.id}`, payload);
        toast.success('Updated successfully');
      } else {
        await axios.post('/api/transport', payload);
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
      const type = activeTab === 'vehicles' ? 'vehicle' : activeTab === 'trips' ? 'trip' : activeTab === 'bookings' ? 'booking' : 'route';
      await axios.delete(`/api/transport/${id}?type=${type}`);
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
            <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-violet-600/20">
              <BiBus />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Transport & Fleet Operations</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage transit routes, fleet vehicles, trip schedules, and passenger tickets</p>
            </div>
          </div>

          {activeTab !== 'bookings' && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-violet-600/30"
            >
              <BiPlus className="text-base" /> New {activeTab === 'vehicles' ? 'Vehicle' : activeTab === 'trips' ? 'Trip Schedule' : 'Route'}
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl gap-6 overflow-x-auto">
          {[
            { id: 'routes', label: 'Routes & Stations', icon: BiNavigation },
            { id: 'vehicles', label: 'Fleet & Vehicles', icon: BiCar },
            { id: 'trips', label: 'Trips & Departures', icon: BiCalendar },
            { id: 'bookings', label: 'Passenger Tickets', icon: BiCreditCard },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-2 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'border-violet-600 text-violet-600'
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
            <BiLoaderAlt className="animate-spin text-3xl text-violet-600 mb-2" />
            <span className="text-xs font-semibold text-slate-500">Loading transport data...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-b-xl border border-t-0 border-slate-200">
            <BiBus className="text-4xl text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No records found</h3>
            <p className="text-xs text-slate-400 mt-1">Get started by creating your first transit route or adding a vehicle</p>
          </div>
        ) : (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6">
            
            {activeTab === 'routes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(r => (
                  <div key={r.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm">{r.route_name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {r.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <span>{r.origin}</span>
                        <span className="text-slate-300">➔</span>
                        <span>{r.destination}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                        <span>{r.distance_km} KM</span>
                        <span>•</span>
                        <span>{Math.round(r.estimated_duration_minutes / 60)} Hours</span>
                      </div>
                    </div>
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button onClick={() => openEditModal(r)} className="p-1.5 text-slate-400 hover:text-violet-600">
                        <BiEdit className="text-base" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                        <BiTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {items.map(v => (
                  <div key={v.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm font-mono">{v.registration_number}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-50 text-violet-700">
                          {v.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{v.model || 'Standard Coach'}</div>
                      <div className="mt-4 text-xs font-bold text-slate-700">
                        Capacity: {v.total_seats} Passenger Seats
                      </div>
                    </div>
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button onClick={() => openEditModal(v)} className="p-1.5 text-slate-400 hover:text-violet-600">
                        <BiEdit className="text-base" />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                        <BiTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'trips' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Route</th>
                      <th className="p-3">Vehicle</th>
                      <th className="p-3">Departure</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {items.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{t.route_name || `${t.origin} ➔ ${t.destination}`}</td>
                        <td className="p-3 font-mono">{t.registration_number || 'Unassigned'}</td>
                        <td className="p-3 font-semibold text-slate-700">{new Date(t.departure_time).toLocaleString('en-GB')}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded text-[10px] font-bold uppercase">
                            {t.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleDelete(t.id)} className="text-rose-600 hover:underline">Cancel</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Ticket Code</th>
                      <th className="p-3">Passenger</th>
                      <th className="p-3">Route</th>
                      <th className="p-3">Seats</th>
                      <th className="p-3">Fare</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {items.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-violet-700">{b.booking_code}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{b.passenger_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{b.passenger_phone}</div>
                        </td>
                        <td className="p-3">{b.route_name || 'Scheduled Trip'}</td>
                        <td className="p-3">{b.total_seats} seats</td>
                        <td className="p-3 font-bold text-slate-900">৳{Number(b.total_fare || 0).toLocaleString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase">
                            {b.payment_status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleDelete(b.id)} className="text-rose-600 hover:underline">Void</button>
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
                  {editingItem ? 'Edit' : 'Create'} {activeTab === 'vehicles' ? 'Vehicle' : activeTab === 'trips' ? 'Trip Schedule' : 'Route'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <BiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                {activeTab === 'routes' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Route Name</label>
                      <input
                        type="text"
                        required
                        value={formData.route_name || ''}
                        onChange={e => setFormData({ ...formData, route_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Origin City</label>
                        <input
                          type="text"
                          required
                          value={formData.origin || ''}
                          onChange={e => setFormData({ ...formData, origin: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Destination City</label>
                        <input
                          type="text"
                          required
                          value={formData.destination || ''}
                          onChange={e => setFormData({ ...formData, destination: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Distance (KM)</label>
                        <input
                          type="number"
                          value={formData.distance_km || 0}
                          onChange={e => setFormData({ ...formData, distance_km: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Estimated Mins</label>
                        <input
                          type="number"
                          value={formData.estimated_duration_minutes || 60}
                          onChange={e => setFormData({ ...formData, estimated_duration_minutes: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'vehicles' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Registration Number</label>
                      <input
                        type="text"
                        required
                        value={formData.registration_number || ''}
                        onChange={e => setFormData({ ...formData, registration_number: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Model / Maker</label>
                      <input
                        type="text"
                        value={formData.model || ''}
                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Total Passenger Seats</label>
                      <input
                        type="number"
                        required
                        value={formData.total_seats || 40}
                        onChange={e => setFormData({ ...formData, total_seats: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'trips' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Route</label>
                      <select
                        required
                        value={formData.route_id || ''}
                        onChange={e => setFormData({ ...formData, route_id: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                      >
                        <option value="">Select Route</option>
                        {routes.map(r => (
                          <option key={r.id} value={r.id}>{r.route_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Vehicle</label>
                      <select
                        value={formData.vehicle_id || ''}
                        onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                      >
                        <option value="">Select Vehicle</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.registration_number} ({v.model})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Departure Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.departure_time || ''}
                        onChange={e => setFormData({ ...formData, departure_time: e.target.value })}
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
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"
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

