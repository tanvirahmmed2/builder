'use client';

import { use, useEffect, useState } from 'react';
import WebsiteManageModal from '@/components/website/forms/WebsiteManageModal';
import {
  BiPlus,
  BiSearch,
  BiTrash,
  BiTimeFive,
  BiBuilding,
  BiLoaderAlt,
} from 'react-icons/bi';

export default function ExperiencesPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExperiences = async () => {
    try {
      const res = await fetch(`/api/webites/${slug}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setExperiences(data.experiences || []);
      }
    } catch (err) {
      console.error('Error fetching experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [slug]);

  const handleCreateExperience = async (payload) => {
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_experience',
          title: payload.title,
          company: payload.company,
          period: payload.period,
          description: payload.description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchExperiences();
      } else {
        alert(data.error || 'Failed to create experience');
      }
    } catch (err) {
      alert('Error adding experience');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this experience record?')) return;
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_experience', id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchExperiences();
      } else {
        alert(data.error || 'Failed to delete record');
      }
    } catch (err) {
      alert('Error deleting experience');
    }
  };

  const filtered = experiences.filter((e) =>
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Work Experience & Career Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Display your professional career path, clients served, and milestone positions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <BiPlus className="text-base" />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search by role, company or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="text-xs text-slate-500 self-end sm:self-center font-medium">
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filtered.length}</span> items
        </div>
      </div>

      {/* Experiences Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
          <p className="text-xs font-medium">Loading experiences...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BiTimeFive className="mx-auto text-4xl text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No experience added</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Highlight your career milestones so prospective customers and recruiters know your history.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Add First Experience
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Position / Role</th>
                <th className="px-6 py-4">Company / Organization</th>
                <th className="px-6 py-4">Time Period</th>
                <th className="px-6 py-4">Summary</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    {e.title}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <BiBuilding className="text-indigo-500 text-sm" />
                      {e.company}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {e.period}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] text-slate-400 line-clamp-1 max-w-sm">
                    {e.description}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Delete Experience"
                    >
                      <BiTrash className="text-base" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <WebsiteManageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateExperience}
        type="experience"
      />
    </div>
  );
}
