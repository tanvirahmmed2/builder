'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '@/components/helper/Context';
import { 
  BiBuilding, 
  BiPlus, 
  BiTrash, 
  BiEdit, 
  BiLoaderAlt, 
  BiGroup, 
  BiBriefcase, 
  BiTimeFive, 
  BiEnvelope, 
  BiPhone,
  BiCalendar,
  BiX
} from 'react-icons/bi';

export default function OrganizationControlPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';

  const { dashSidebar } = useContext(Context);

  const [activeTab, setActiveTab] = useState('members');
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/organization?tab=${activeTab}`);
      setItems(Array.isArray(res.data) ? res.data : []);

      if (activeTab === 'members' || activeTab === 'jobs') {
        const deptRes = await axios.get('/api/organization?tab=departments');
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      }
    } catch (err) {
      console.error('Fetch organization error:', err);
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === 'members') {
      setFormData({ full_name: '', email: '', phone: '', avatar_url: '', bio: '', department_id: '', status: 'active' });
    } else if (activeTab === 'departments') {
      setFormData({ name: '', description: '', is_active: true });
    } else if (activeTab === 'jobs') {
      setFormData({ title: '', department_id: '', job_type: 'Full-time', location: 'Dhaka, Bangladesh', salary_range: '৳40,000 - ৳60,000', description: '', requirements: '', status: 'active' });
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
      const type = activeTab === 'departments' ? 'department' : activeTab === 'jobs' ? 'job' : 'member';
      const payload = { ...formData, type };

      if (editingItem) {
        await axios.put(`/api/organization/${editingItem.id}`, payload);
        toast.success('Updated successfully');
      } else {
        await axios.post('/api/organization', payload);
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
      const type = activeTab === 'departments' ? 'department' : activeTab === 'jobs' ? 'job' : activeTab === 'leaves' ? 'leave' : 'member';
      await axios.delete(`/api/organization/${id}?type=${type}`);
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
            <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-sky-600/20">
              <BiBuilding />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Organization & Staff Directory</h1>
              <p className="text-xs text-slate-500 mt-0.5">Manage departments, team hierarchy, job openings, and leave tracking</p>
            </div>
          </div>

          {activeTab !== 'leaves' && (
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-sky-600/30"
            >
              <BiPlus className="text-base" /> New {activeTab === 'departments' ? 'Department' : activeTab === 'jobs' ? 'Job Posting' : 'Member'}
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl gap-6 overflow-x-auto">
          {[
            { id: 'members', label: 'Team Members', icon: BiGroup },
            { id: 'departments', label: 'Departments', icon: BiBuilding },
            { id: 'jobs', label: 'Careers & Hiring', icon: BiBriefcase },
            { id: 'leaves', label: 'Leave Requests', icon: BiCalendar },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-2 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'border-sky-600 text-sky-600'
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
            <BiLoaderAlt className="animate-spin text-3xl text-sky-600 mb-2" />
            <span className="text-xs font-semibold text-slate-500">Loading organization records...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-b-xl border border-t-0 border-slate-200">
            <BiGroup className="text-4xl text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No records found</h3>
            <p className="text-xs text-slate-400 mt-1">Get started by creating your first team member or department</p>
          </div>
        ) : (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6">
            
            {activeTab === 'members' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(m => (
                  <div key={m.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt={m.full_name} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg border border-sky-100">
                          {m.full_name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{m.full_name}</h4>
                        <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                          {m.department_name || 'General Staff'}
                        </span>
                        <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                          {m.email && <div className="flex items-center gap-1.5"><BiEnvelope /> {m.email}</div>}
                          {m.phone && <div className="flex items-center gap-1.5"><BiPhone /> {m.phone}</div>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(m)} className="p-1.5 text-slate-400 hover:text-sky-600">
                        <BiEdit className="text-base" />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                        <BiTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'departments' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {items.map(d => (
                  <div key={d.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm">{d.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {d.is_active ? 'Active' : 'Archived'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{d.description || 'Department within the organization.'}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button onClick={() => openEditModal(d)} className="p-1.5 text-slate-400 hover:text-sky-600">
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

            {activeTab === 'jobs' && (
              <div className="space-y-4">
                {items.map(j => (
                  <div key={j.id} className="border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">{j.title}</h4>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">{j.job_type}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${j.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                          {j.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-4">
                        <span>{j.department_name || 'General'}</span>
                        <span>•</span>
                        <span>{j.location}</span>
                        {j.salary_range && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">{j.salary_range}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(j)} className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(j.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                        <BiTrash className="text-base" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'leaves' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Member</th>
                      <th className="p-3">Start Date</th>
                      <th className="p-3">End Date</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {items.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{l.member_name}</td>
                        <td className="p-3">{new Date(l.start_date).toLocaleDateString('en-GB')}</td>
                        <td className="p-3">{new Date(l.end_date).toLocaleDateString('en-GB')}</td>
                        <td className="p-3">{l.total_days} days</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{l.reason || 'Personal'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded text-[10px] font-bold uppercase">
                            {l.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleDelete(l.id)} className="text-rose-600 hover:underline">Revoke</button>
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
                  {editingItem ? 'Edit' : 'Create'} {activeTab === 'departments' ? 'Department' : activeTab === 'jobs' ? 'Job Posting' : 'Member'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <BiX className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                {activeTab === 'members' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.full_name || ''}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department</label>
                      <select
                        value={formData.department_id || ''}
                        onChange={e => setFormData({ ...formData, department_id: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                      >
                        <option value="">Unassigned</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email || ''}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Bio / Profile</label>
                      <textarea
                        rows={2}
                        value={formData.bio || ''}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'departments' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Department Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
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

                {activeTab === 'jobs' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Job Title</label>
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
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Job Type</label>
                        <select
                          value={formData.job_type || 'Full-time'}
                          onChange={e => setFormData({ ...formData, job_type: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Remote">Remote</option>
                          <option value="Contract">Contract</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Salary Range</label>
                        <input
                          type="text"
                          value={formData.salary_range || ''}
                          onChange={e => setFormData({ ...formData, salary_range: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
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
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold"
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

