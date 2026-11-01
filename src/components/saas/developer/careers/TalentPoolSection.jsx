'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BiUser,
  BiSearch,
  BiPlus,
  BiTrash,
  BiEdit,
  BiRefresh,
  BiFile,
  BiLinkExternal,
  BiEnvelope,
  BiPhone,
  BiMapPin,
  BiDollarCircle,
  BiTime,
  BiBriefcase,
  BiX,
  BiLoaderAlt,
  BiCheckCircle,
} from 'react-icons/bi';

export default function TalentPoolSection() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    resume_url: '',
    portfolio_url: '',
    linkedin_url: '',
    github_url: '',
    total_experience_years: 0,
    highest_education: '',
    current_company: '',
    current_title: '',
    skills: '',
    bio: '',
    address: '',
    city: '',
    country: '',
    expected_salary: '',
    notice_period_days: 0,
  });

  const fetchApplicants = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/saas/developer/careers/applicants?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setApplicants(data.applicants || []);
      }
    } catch (err) {
      console.error('Failed to fetch applicants:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleCreateApplicant = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.email.trim()) {
      alert('First name and Email are required.');
      return;
    }

    try {
      setSaving(true);
      const skillsArray = form.skills
        ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await fetch('/api/saas/developer/careers/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          resume_url: form.resume_url.trim(),
          portfolio_url: form.portfolio_url.trim(),
          linkedin_url: form.linkedin_url.trim(),
          github_url: form.github_url.trim(),
          total_experience_years: Number(form.total_experience_years) || 0,
          highest_education: form.highest_education.trim(),
          current_company: form.current_company.trim(),
          current_title: form.current_title.trim(),
          skills: skillsArray,
          bio: form.bio.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          country: form.country.trim(),
          expected_salary: form.expected_salary.trim(),
          notice_period_days: Number(form.notice_period_days) || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setForm({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          resume_url: '',
          portfolio_url: '',
          linkedin_url: '',
          github_url: '',
          total_experience_years: 0,
          highest_education: '',
          current_company: '',
          current_title: '',
          skills: '',
          bio: '',
          address: '',
          city: '',
          country: '',
          expected_salary: '',
          notice_period_days: 0,
        });
        fetchApplicants();
      } else {
        alert(data.error || 'Failed to create applicant profile.');
      }
    } catch (err) {
      alert(err.message || 'Error saving applicant.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApplicant = async (id, name) => {
    if (!window.confirm(`Permanently delete applicant record for "${name}"?`)) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/saas/developer/careers/applicants/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setApplicants((prev) => prev.filter((a) => a.id !== id));
        if (selectedApplicant?.id === id) {
          setShowDetailModal(false);
          setSelectedApplicant(null);
        }
      } else {
        alert(data.error || 'Failed to delete applicant.');
      }
    } catch (err) {
      alert(err.message || 'Error deleting applicant.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenDetail = async (applicant) => {
    try {
      const res = await fetch(`/api/saas/developer/careers/applicants/${applicant.id}`);
      const data = await res.json();
      if (data.success && data.applicant) {
        setSelectedApplicant(data.applicant);
      } else {
        setSelectedApplicant(applicant);
      }
    } catch (_) {
      setSelectedApplicant(applicant);
    }
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            placeholder="Search candidates by name, email, skills, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchApplicants}
            title="Refresh"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <BiRefresh className="text-lg" />
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <BiPlus className="text-base" /> Add Candidate
          </button>
        </div>
      </div>

      {/* Candidate List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-indigo-600 mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading talent pool...</p>
        </div>
      ) : applicants.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl">
            <BiUser />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Candidates Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Candidates who apply via the public careers portal or manual talent uploads will appear here in the talent pool database.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Current Role & Company</th>
                  <th className="px-5 py-3.5">Experience & Education</th>
                  <th className="px-5 py-3.5">Skills</th>
                  <th className="px-5 py-3.5">Applications</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicants.map((a) => {
                  const fullName = `${a.first_name || ''} ${a.last_name || ''}`.trim() || 'Anonymous';
                  const skillsList = Array.isArray(a.skills)
                    ? a.skills
                    : typeof a.skills === 'string'
                    ? a.skills.split(',').filter(Boolean)
                    : [];

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs shrink-0">
                            {fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(a)}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer text-left"
                            >
                              {fullName}
                            </button>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{a.email}</span>
                              {a.phone && <span>&bull; {a.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{a.current_title || '—'}</div>
                        <div className="text-[11px] text-slate-400">{a.current_company || '—'}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">
                          {a.total_experience_years ? `${a.total_experience_years} yrs exp` : 'Entry / Unspecified'}
                        </div>
                        <div className="text-[11px] text-slate-400">{a.highest_education || '—'}</div>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {skillsList.slice(0, 3).map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold"
                            >
                              {s}
                            </span>
                          ))}
                          {skillsList.length > 3 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-semibold">
                              +{skillsList.length - 3}
                            </span>
                          )}
                          {skillsList.length === 0 && <span className="text-slate-400 text-[11px]">—</span>}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                          {a.applications_count || 0} applied
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {a.resume_url && (
                            <a
                              href={a.resume_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="View Resume"
                            >
                              <BiFile className="text-base" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(a)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Candidate Profile"
                          >
                            <BiEdit className="text-base" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === a.id}
                            onClick={() => handleDeleteApplicant(a.id, fullName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === a.id ? (
                              <BiLoaderAlt className="animate-spin text-base" />
                            ) : (
                              <BiTrash className="text-base" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                  <BiUser />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Add Candidate to Talent Pool</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <BiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack Engineer"
                    value={form.current_title}
                    onChange={(e) => setForm({ ...form, current_title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={form.current_company}
                    onChange={(e) => setForm({ ...form, current_company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={form.total_experience_years}
                    onChange={(e) => setForm({ ...form, total_experience_years: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Highest Education</label>
                  <input
                    type="text"
                    placeholder="e.g. B.S. in Computer Science"
                    value={form.highest_education}
                    onChange={(e) => setForm({ ...form, highest_education: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, Next.js, Node.js, PostgreSQL, Tailwind CSS"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Resume Link</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.resume_url}
                    onChange={(e) => setForm({ ...form, resume_url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Portfolio / Website Link</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.portfolio_url}
                    onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={form.linkedin_url}
                    onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">GitHub Profile</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={form.github_url}
                    onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Bio / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Candidate summary or recruiter notes..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicant Detail Drawer / Modal */}
      {showDetailModal && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-sm">
                  {`${selectedApplicant.first_name || ''} ${selectedApplicant.last_name || ''}`.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedApplicant.first_name} {selectedApplicant.last_name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedApplicant.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <BiX className="text-xl" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Core Badges */}
              <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                {selectedApplicant.phone && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <BiPhone className="text-sm text-slate-400" />
                    <span>{selectedApplicant.phone}</span>
                  </div>
                )}
                {selectedApplicant.current_company && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <BiBriefcase className="text-sm text-slate-400" />
                    <span>{selectedApplicant.current_title || 'Role'} at {selectedApplicant.current_company}</span>
                  </div>
                )}
                {selectedApplicant.city && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <BiMapPin className="text-sm text-slate-400" />
                    <span>{selectedApplicant.city}, {selectedApplicant.country}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {selectedApplicant.bio && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Candidate Summary</h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedApplicant.bio}
                  </p>
                </div>
              )}

              {/* Links */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Profile & Portfolio Links</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.resume_url && (
                    <a
                      href={selectedApplicant.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100"
                    >
                      <BiFile /> View Resume
                    </a>
                  )}
                  {selectedApplicant.portfolio_url && (
                    <a
                      href={selectedApplicant.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                    >
                      <BiLinkExternal /> Portfolio
                    </a>
                  )}
                  {selectedApplicant.linkedin_url && (
                    <a
                      href={selectedApplicant.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100"
                    >
                      <BiLinkExternal /> LinkedIn
                    </a>
                  )}
                  {selectedApplicant.github_url && (
                    <a
                      href={selectedApplicant.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-white font-bold hover:bg-black"
                    >
                      <BiLinkExternal /> GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* Linked Applications History */}
              {Array.isArray(selectedApplicant.applications) && selectedApplicant.applications.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Job Application History</h4>
                  <div className="space-y-2">
                    {selectedApplicant.applications.map((app) => (
                      <div
                        key={app.id}
                        className="p-3 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{app.job_title}</div>
                          <div className="text-[11px] text-slate-400">{app.department} &bull; Applied {new Date(app.created_at).toLocaleDateString()}</div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

