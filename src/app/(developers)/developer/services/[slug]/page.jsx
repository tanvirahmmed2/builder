'use client';

import { useState, useEffect, use, useContext, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import {
  BiArrowBack,
  BiSave,
  BiTrash,
  BiCheckCircle,
  BiXCircle,
  BiLoaderAlt,
  BiLayer,
  BiImage,
  BiCloudUpload,
  BiPlus,
  BiPalette,
  BiCube,
  BiLinkExternal,
  BiEdit,
  BiCheck,
  BiX,
  BiImages,
  BiBadgeCheck,
  BiStar,
  BiGlobe,
} from 'react-icons/bi';
import { Context } from '@/components/helper/Context';
import TiptapEditor from '@/components/ui/TiptapEditor';

export default function ServiceDetailPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();
  const { user } = useContext(Context) || {};
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const canManage = user?.role === 'admin' || permissions.includes('services') || permissions.includes('apps');

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('general'); // general | modules | themes | media | packages

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    short_description: '',
    description: '',
    icon: '',
    badge: '',
    is_published: false,
    is_featured: false,
    order_index: 0,
  });

  // Modules State
  const [modules, setModules] = useState([]);
  const [newModule, setNewModule] = useState({ module_name: '', module_slug: '', description: '', is_active: true });
  const [showAddModule, setShowAddModule] = useState(false);

  // Themes State
  const [themes, setThemes] = useState([]);
  const [newTheme, setNewTheme] = useState({ name: '', slug: '', preview_image: '', is_active: true, is_premium: false });
  const [showAddTheme, setShowAddTheme] = useState(false);

  // Images State
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const fileInputRef = useRef(null);

  // Cloudinary Library Modal
  const [showCloudinaryModal, setShowCloudinaryModal] = useState(false);
  const [cloudinaryAssets, setCloudinaryAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [attachingAsset, setAttachingAsset] = useState(false);

  // Linked Packages
  const [linkedPackages, setLinkedPackages] = useState([]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`/api/saas/developer/services/${encodeURIComponent(slug)}`);
      if (res.data?.success && res.data.service) {
        const s = res.data.service;
        setService(s);
        setFormData({
          title: s.title || '',
          slug: s.slug || '',
          short_description: s.short_description || '',
          description: s.description || '',
          icon: s.icon || '',
          badge: s.badge || '',
          is_published: Boolean(s.is_published),
          is_featured: Boolean(s.is_featured),
          order_index: Number(s.order_index) || 0,
        });
        setModules(Array.isArray(s.modules) ? s.modules : []);
        setThemes(Array.isArray(s.themes) ? s.themes : []);
        setImages(Array.isArray(s.images) ? s.images : []);
        setLinkedPackages(Array.isArray(s.packages) ? s.packages : []);
      } else {
        setError(res.data?.error || 'Service not found');
      }
    } catch (err) {
      console.error('Error fetching service:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [slug]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!canManage) return;

    if (!formData.title.trim()) {
      setError('Service title is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccessMsg('');

      const payload = {
        id: service.id,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        short_description: formData.short_description,
        description: formData.description,
        icon: formData.icon,
        badge: formData.badge,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        order_index: formData.order_index,
        modules: modules.map((m) => ({
          name: m.module_name || m.name,
          slug: m.module_slug || m.slug,
          description: m.description || '',
          is_active: m.is_active !== false,
        })),
        themes: themes.map((t) => ({
          name: t.name,
          slug: t.slug,
          preview_image: t.preview_image || '',
          is_active: t.is_active !== false,
          is_premium: Boolean(t.is_premium),
        })),
      };

      const res = await axios.put('/api/saas/developer/services', payload);
      if (res.data?.success) {
        setSuccessMsg('Service saved successfully!');
        if (res.data.service?.slug && res.data.service.slug !== slug) {
          router.push(`/developer/services/${res.data.service.slug}`);
        } else {
          fetchService();
        }
      } else {
        setError(res.data?.error || 'Failed to update service.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error updating service.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async () => {
    if (!canManage) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${service?.title}" and all its module bindings?`)) {
      return;
    }

    try {
      setDeleting(true);
      const res = await axios.delete(`/api/saas/developer/services?id=${service.id}`);
      if (res.data?.success) {
        router.push('/developer/services');
      } else {
        alert(res.data?.error || 'Failed to delete service.');
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error deleting service.');
    } finally {
      setDeleting(false);
    }
  };

  // Modules Handlers
  const handleAddModule = () => {
    if (!newModule.module_name.trim()) return;
    const cleanName = newModule.module_name.trim();
    const cleanSlug =
      newModule.module_slug.trim() ||
      cleanName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    setModules((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        module_name: cleanName,
        module_slug: cleanSlug,
        description: newModule.description.trim(),
        is_active: newModule.is_active,
      },
    ]);
    setNewModule({ module_name: '', module_slug: '', description: '', is_active: true });
    setShowAddModule(false);
  };

  const handleRemoveModule = (modSlug) => {
    setModules((prev) => prev.filter((m) => (m.module_slug || m.slug) !== modSlug));
  };

  const handleToggleModuleActive = (modSlug) => {
    setModules((prev) =>
      prev.map((m) =>
        (m.module_slug || m.slug) === modSlug ? { ...m, is_active: !m.is_active } : m
      )
    );
  };

  // Themes Handlers
  const handleAddTheme = () => {
    if (!newTheme.name.trim()) return;
    const cleanName = newTheme.name.trim();
    const cleanSlug =
      newTheme.slug.trim() ||
      cleanName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    setThemes((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: cleanName,
        slug: cleanSlug,
        preview_image: newTheme.preview_image.trim(),
        is_active: newTheme.is_active,
        is_premium: newTheme.is_premium,
      },
    ]);
    setNewTheme({ name: '', slug: '', preview_image: '', is_active: true, is_premium: false });
    setShowAddTheme(false);
  };

  const handleRemoveTheme = (thSlug) => {
    setThemes((prev) => prev.filter((t) => t.slug !== thSlug));
  };

  const handleToggleThemeActive = (thSlug) => {
    setThemes((prev) =>
      prev.map((t) => (t.slug === thSlug ? { ...t, is_active: !t.is_active } : t))
    );
  };

  // Image Upload Handlers
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !service?.id) return;

    try {
      setUploadingImage(true);
      setError('');
      const uploadData = new FormData();
      uploadData.append('id', String(service.id));
      for (let i = 0; i < files.length; i++) {
        uploadData.append('images', files[i]);
      }

      const res = await axios.put('/api/saas/developer/services', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success && res.data.service) {
        setImages(res.data.service.images || []);
        setSuccessMsg('Images uploaded successfully!');
      } else {
        setError(res.data?.error || 'Failed to upload images.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload error.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this image permanently?')) return;
    try {
      setDeletingImageId(imageId);
      const res = await axios.delete(`/api/saas/developer/services?image_id=${imageId}`);
      if (res.data?.success) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        alert(res.data?.error || 'Failed to delete image');
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error deleting image');
    } finally {
      setDeletingImageId(null);
    }
  };

  // Cloudinary Library Modal Handlers
  const handleOpenCloudinary = async () => {
    setShowCloudinaryModal(true);
    setLoadingAssets(true);
    try {
      const res = await axios.get('/api/saas/developer/services?cloudinary_assets=true');
      if (res.data?.success && Array.isArray(res.data.assets)) {
        setCloudinaryAssets(res.data.assets);
      }
    } catch (err) {
      console.error('Failed to load Cloudinary assets:', err);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleAttachCloudinaryAsset = async (asset) => {
    if (!service?.id || attachingAsset) return;
    try {
      setAttachingAsset(true);
      const res = await axios.put('/api/saas/developer/services', {
        id: service.id,
        attach_asset: {
          secure_url: asset.secure_url,
          public_id: asset.public_id,
          title: service.title,
        },
      });

      if (res.data?.success && res.data.service) {
        setImages(res.data.service.images || []);
        setShowCloudinaryModal(false);
        setSuccessMsg('Asset attached to service gallery!');
      } else {
        alert(res.data?.error || 'Failed to attach asset.');
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Error attaching asset.');
    } finally {
      setAttachingAsset(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3 text-slate-500">
        <BiLoaderAlt className="animate-spin text-3xl text-secondary" />
        <span className="text-xs font-semibold">Loading service details...</span>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-500 mx-auto text-3xl mb-4">
          <BiXCircle />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Service Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <Link
          href="/developer/services"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all shadow-xs"
        >
          <BiArrowBack /> Back to Services Directory
        </Link>
      </div>
    );
  }

  const primaryImage = images.find((i) => i.is_primary) || images[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/developer/services"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-colors shadow-xs"
          >
            <BiArrowBack className="text-lg" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-xl shrink-0">
            <BiCube />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {service?.title || 'Service Details'}
              </h1>
              {formData.is_published ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <BiCheckCircle className="text-xs" /> Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  Draft
                </span>
              )}
              {formData.is_featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
                  <BiStar className="text-xs" /> Featured
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Slug: <code className="font-mono text-slate-700 dark:text-slate-300">/{service?.slug}</code> &bull; ID: #{service?.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {canManage && (
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteService}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {deleting ? <BiLoaderAlt className="animate-spin text-sm" /> : <BiTrash className="text-sm" />}
              <span>Delete</span>
            </button>
          )}

          {canManage && (
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {saving ? <BiLoaderAlt className="animate-spin text-sm" /> : <BiSave className="text-sm" />}
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="p-1 hover:text-rose-900"><BiX /></button>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:text-emerald-900"><BiX /></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        {[
          { id: 'general', label: 'General & Overview', icon: BiCube },
          { id: 'modules', label: `Modules (${modules.length})`, icon: BiLayer },
          { id: 'themes', label: `Themes (${themes.length})`, icon: BiPalette },
          { id: 'media', label: `Gallery (${images.length})`, icon: BiImages },
          { id: 'packages', label: `Linked Packages (${linkedPackages.length})`, icon: BiBadgeCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-secondary text-secondary'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="text-sm" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General & Overview */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Identity Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Service Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Service Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Slug <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Elevator pitch or quick summary displayed on marketing cards..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Icon Identifier / React Icon
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BiStore, BiRestaurant"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary font-mono transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Marketing Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Most Popular, New"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Sort Order Index
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Rich Text Description */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Comprehensive Service Description
                </h3>
                <span className="text-[11px] text-slate-400">Rich HTML formatting</span>
              </div>
              <TiptapEditor
                value={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="Describe features, target audience, architectural capabilities, and platform value..."
                minHeight="220px"
              />
            </div>
          </div>

          {/* Right Column: Status & Preview */}
          <div className="space-y-6">
            {/* Visibility Settings Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Publishing & Status
              </h3>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Public Visibility</div>
                  <div className="text-[11px] text-slate-500">Live on SaaS marketing portal & checkout</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 accent-secondary rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Featured Service</div>
                  <div className="text-[11px] text-slate-500">Promote on homepage showcase</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 accent-secondary rounded cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>Created: {service?.created_at ? new Date(service.created_at).toLocaleDateString() : 'N/A'}</div>
                <div>Last Updated: {service?.updated_at ? new Date(service.updated_at).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>

            {/* Quick Preview Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/5 via-slate-50 to-primary/5 dark:from-secondary/10 dark:via-slate-900 dark:to-primary/10 border border-secondary/20 space-y-3">
              <div className="text-xs font-bold text-secondary uppercase tracking-wider">Storefront Card Preview</div>
              {primaryImage ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={primaryImage.image}
                    alt={primaryImage.title || formData.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                  No preview image uploaded
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{formData.title || 'Service Title'}</h4>
                  {formData.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-white">
                      {formData.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {formData.short_description || 'Short summary preview will appear here.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Modules (service_modules) */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Service Ecosystem Modules</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Modules registered under this service are dynamically unlocked in packages and tenant builder panels.
              </p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => setShowAddModule(true)}
                className="px-3 py-1.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <BiPlus className="text-sm" /> Add Module
              </button>
            )}
          </div>

          {/* Add Module Modal / Form */}
          {showAddModule && (
            <div className="p-5 rounded-2xl bg-secondary/5 dark:bg-secondary/10 border border-secondary/20 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add New Service Module</h4>
                <button
                  type="button"
                  onClick={() => setShowAddModule(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <BiX className="text-base" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Module Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kitchen Display System (KDS)"
                    value={newModule.module_name}
                    onChange={(e) => setNewModule({ ...newModule, module_name: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Module Slug (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. kds-display"
                    value={newModule.module_slug}
                    onChange={(e) => setNewModule({ ...newModule, module_slug: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Real-time kitchen ticket management and order routing"
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModule(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="px-4 py-1.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 shadow-xs"
                >
                  Add to List
                </button>
              </div>
            </div>
          )}

          {/* Module List Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            {modules.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <BiLayer className="text-3xl mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-semibold">No modules registered yet for this service.</p>
                <p className="text-[11px]">Click &ldquo;Add Module&rdquo; to define modules for this service ecosystem.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3.5">Module Name</th>
                      <th className="px-5 py-3.5">Slug</th>
                      <th className="px-5 py-3.5">Description</th>
                      <th className="px-5 py-3.5 text-center">Active</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {modules.map((mod) => (
                      <tr key={mod.module_slug || mod.slug} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                          {mod.module_name || mod.name}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                          {mod.module_slug || mod.slug}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {mod.description || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleModuleActive(mod.module_slug || mod.slug)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer ${
                              mod.is_active !== false
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {mod.is_active !== false ? 'Enabled' : 'Disabled'}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveModule(mod.module_slug || mod.slug)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <BiTrash className="text-sm" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Themes (service_themes) */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Service Frontend Themes</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Themes made available specifically for this service type during onboarding and site customization.
              </p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => setShowAddTheme(true)}
                className="px-3 py-1.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
              >
                <BiPlus className="text-sm" /> Add Theme
              </button>
            )}
          </div>

          {/* Add Theme Modal / Form */}
          {showAddTheme && (
            <div className="p-5 rounded-2xl bg-secondary/5 dark:bg-secondary/10 border border-secondary/20 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Add Service Theme</h4>
                <button
                  type="button"
                  onClick={() => setShowAddTheme(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <BiX className="text-base" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Theme Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Modern Bistro, Luxe Storefront"
                    value={newTheme.name}
                    onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Theme Slug (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. modern-bistro"
                    value={newTheme.slug}
                    onChange={(e) => setNewTheme({ ...newTheme, slug: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preview Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://res.cloudinary.com/..."
                  value={newTheme.preview_image}
                  onChange={(e) => setNewTheme({ ...newTheme, preview_image: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-secondary"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTheme.is_premium}
                    onChange={(e) => setNewTheme({ ...newTheme, is_premium: e.target.checked })}
                    className="w-4 h-4 accent-secondary rounded"
                  />
                  <span>Premium Theme (Paid Tier Only)</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTheme(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddTheme}
                  className="px-4 py-1.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 shadow-xs"
                >
                  Add Theme
                </button>
              </div>
            </div>
          )}

          {/* Themes Grid */}
          {themes.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <BiPalette className="text-3xl mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-semibold">No themes assigned to this service yet.</p>
              <p className="text-[11px]">Click &ldquo;Add Theme&rdquo; to attach visual themes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {themes.map((th) => (
                <div
                  key={th.slug}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                      {th.preview_image ? (
                        <Image src={th.preview_image} alt={th.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          No Preview
                        </div>
                      )}
                      {th.is_premium && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                          PRO
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{th.name}</h4>
                      <code className="text-[10px] font-mono text-slate-400">{th.slug}</code>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleToggleThemeActive(th.slug)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer ${
                        th.is_active !== false
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {th.is_active !== false ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveTheme(th.slug)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <BiTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Media Gallery (service_images) */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Service Gallery & Screenshots</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                High-resolution marketing screenshots and banner assets uploaded directly to Cloudinary.
              </p>
            </div>
            {canManage && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenCloudinary}
                  className="px-3 py-1.5 rounded-xl border border-secondary/30 text-secondary hover:bg-secondary/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <BiImages className="text-sm" /> Browse Cloudinary
                </button>
                <label className="px-3.5 py-1.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer">
                  {uploadingImage ? <BiLoaderAlt className="animate-spin text-sm" /> : <BiCloudUpload className="text-base" />}
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {images.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <BiImage className="text-3xl mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-semibold">No screenshots or gallery images uploaded yet.</p>
              <p className="text-[11px]">Upload images above or select from your Cloudinary library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-xs"
                >
                  <Image src={img.image} alt={img.title || 'Service Image'} fill className="object-cover" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                    <button
                      type="button"
                      disabled={deletingImageId === img.id}
                      onClick={() => handleDeleteImage(img.id)}
                      className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                      title="Delete Image"
                    >
                      {deletingImageId === img.id ? (
                        <BiLoaderAlt className="animate-spin text-base" />
                      ) : (
                        <BiTrash className="text-base" />
                      )}
                    </button>
                    <a
                      href={img.image}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors shadow-xs"
                      title="Open full size"
                    >
                      <BiLinkExternal className="text-base" />
                    </a>
                  </div>
                  {img.is_primary && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-secondary text-white shadow-xs">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Linked Packages */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subscription Packages</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Subscription tiers and pricing plans tied directly to this ecosystem service.
              </p>
            </div>
            <Link
              href="/developer/packages"
              className="px-3.5 py-1.5 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <BiPlus className="text-sm" /> Create / Manage Packages
            </Link>
          </div>

          {linkedPackages.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <BiBadgeCheck className="text-3xl mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-semibold">No packages linked to this service yet.</p>
              <p className="text-[11px]">Go to Packages Manager to configure pricing tiers for this service.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {linkedPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pkg.name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pkg.is_active !== false
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {pkg.is_active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      ${Number(pkg.monthly_price_usd || 0).toFixed(2)}
                      <span className="text-[11px] font-normal text-slate-400"> / mo</span>
                    </div>
                  </div>

                  <Link
                    href={`/developer/packages/${pkg.slug}`}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    <BiEdit /> Edit Package Tier
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cloudinary Modal */}
      {showCloudinaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-xl">
                  <BiImages />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cloudinary Media Library</h3>
                  <p className="text-[11px] text-slate-500">Select an existing asset to attach to this service</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCloudinaryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <BiX className="text-xl" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {loadingAssets ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <BiLoaderAlt className="animate-spin text-3xl text-secondary" />
                  <span className="text-xs">Loading Cloudinary media assets...</span>
                </div>
              ) : cloudinaryAssets.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <BiImages className="text-4xl mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold">No uploaded Cloudinary assets found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {cloudinaryAssets.map((asset) => (
                    <div
                      key={asset.public_id}
                      onClick={() => handleAttachCloudinaryAsset(asset)}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:border-secondary cursor-pointer transition-all shadow-xs"
                    >
                      <Image src={asset.secure_url} alt={asset.public_id} fill className="object-cover" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                        <span className="text-[10px] font-bold text-white bg-secondary px-2.5 py-1 rounded-lg">
                          {attachingAsset ? 'Attaching...' : 'Attach Image'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCloudinaryModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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

