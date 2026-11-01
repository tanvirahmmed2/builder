'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import {
  BiGridAlt,
  BiSearch,
  BiCheckCircle,
  BiLinkExternal,
  BiPlus,
  BiTrash,
  BiEdit,
  BiTimeFive,
  BiRefresh,
  BiImage,
  BiLoaderAlt,
  BiShieldQuarter,
  BiLayer,
  BiX,
  BiCheck,
} from 'react-icons/bi';
import { Context } from '@/components/helper/Context';

export default function DeveloperServicesPage() {
  const { user } = useContext(Context);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [creating, setCreating] = useState(false);

  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const canManage = user?.role === 'admin' || permissions.includes('services') || permissions.includes('apps');
  const router = useRouter();

  const handleCreateDefaultService = async () => {
    if (!canManage || creating) return;
    try {
      setCreating(true);
      setActionError('');
      const res = await axios.post('/api/saas/developer/services', {
        title: 'New Service',
        is_published: false,
      });
      if (res.data?.success && (res.data.service || res.data.data)) {
        const newService = res.data.service || res.data.data;
        router.push(`/developer/services/${newService.slug}`);
      } else {
        setActionError(res.data?.error || 'Failed to create service.');
        setCreating(false);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Error creating service.');
      setCreating(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      setActionError('');
      const res = await axios.get('/api/saas/developer/services');
      if (res.data?.success) {
        setServices(res.data.services || res.data.data || []);
      } else {
        setActionError(res.data?.error || 'Failed to fetch services.');
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Error loading services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id, title) => {
    if (!canManage) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    try {
      setDeletingId(id);
      setActionError('');
      const res = await axios.delete(`/api/saas/developer/services?id=${id}`);
      if (res.data?.success) {
        setServices((prev) => prev.filter((s) => s.id !== id));
      } else {
        setActionError(res.data?.error || 'Failed to delete service.');
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Error deleting service.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (service) => {
    if (!canManage || togglingId) return;
    try {
      setTogglingId(service.id);
      setActionError('');
      const nextStatus = !service.is_published;
      const res = await axios.put('/api/saas/developer/services', {
        id: service.id,
        is_published: nextStatus,
      });
      if (res.data?.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, is_published: nextStatus } : s))
        );
      } else {
        setActionError(res.data?.error || 'Failed to toggle status.');
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Error updating status.');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      (s.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.slug || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'PUBLISHED') return s.is_published;
    if (filterTab === 'DRAFTS') return !s.is_published;
    return true;
  });

  const totalCount = services.length;
  const publishedCount = services.filter((s) => s.is_published).length;
  const draftCount = totalCount - publishedCount;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Services & Modules</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              {totalCount} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage platform service verticals, feature module mappings, and theme templates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchServices}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-sm"
            title="Refresh Services"
          >
            <BiRefresh className={`text-xl ${loading ? 'animate-spin' : ''}`} />
          </button>

          {canManage && (
            <button
              onClick={handleCreateDefaultService}
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium text-sm rounded-xl transition shadow-sm shadow-indigo-600/20"
            >
              {creating ? (
                <>
                  <BiLoaderAlt className="animate-spin text-lg" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <BiPlus className="text-xl" />
                  <span>Add Service</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-sm">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="p-1 hover:text-rose-900">
            <BiX className="text-lg" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-2xl shrink-0">
            <BiGridAlt />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Services</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
            <BiCheckCircle />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Published</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{publishedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-2xl shrink-0">
            <BiTimeFive />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Drafts</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">{draftCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {['ALL', 'PUBLISHED', 'DRAFTS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterTab === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search services, modules..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Loading services...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <BiGridAlt className="text-3xl" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No Services Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No services match your search for "${searchTerm}".`
              : 'Create your first service to power multi-type websites and modular add-ons.'}
          </p>
          {canManage && (
            <button
              onClick={handleCreateDefaultService}
              disabled={creating}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition"
            >
              <BiPlus className="text-lg" />
              <span>Create New Service</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const primaryImg =
              service.images?.find((img) => img.is_primary)?.image ||
              service.images?.[0]?.image;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col transition hover:shadow-md hover:border-slate-300 group"
              >
                {/* Image Header */}
                <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  {primaryImg ? (
                    <img
                      src={primaryImg}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-400">
                      <BiImage className="text-4xl" />
                      <span className="text-xs">No preview media</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-sm ${
                        service.is_published
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-slate-900/80 text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          service.is_published ? 'bg-white' : 'bg-amber-400'
                        }`}
                      />
                      {service.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {service.badge && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 bg-indigo-600/90 text-white text-xs font-semibold rounded-lg shadow-sm backdrop-blur-md">
                        {service.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition truncate">
                        {service.title}
                      </h3>
                    </div>

                    <p className="text-xs font-mono text-slate-400 mt-0.5 truncate">
                      /{service.slug}
                    </p>

                    <p className="text-sm text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                      {service.short_description || service.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Metadata Tags */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <BiLayer className="text-indigo-500 text-sm" />
                      {service.modules?.length || 0} Modules
                    </span>
                    <span>
                      {service.themes?.length || 0} Themes
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/developer/services/${service.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 rounded-lg text-xs font-medium transition shadow-sm"
                    >
                      <BiEdit className="text-sm" />
                      Edit Details
                    </Link>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTogglePublish(service)}
                        disabled={togglingId === service.id}
                        className={`p-1.5 rounded-lg border text-xs transition ${
                          service.is_published
                            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={service.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {togglingId === service.id ? (
                          <BiLoaderAlt className="animate-spin text-sm" />
                        ) : (
                          <BiCheck className="text-sm" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(service.id, service.title)}
                        disabled={deletingId === service.id}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition"
                        title="Delete Service"
                      >
                        {deletingId === service.id ? (
                          <BiLoaderAlt className="animate-spin text-sm" />
                        ) : (
                          <BiTrash className="text-sm" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

