'use client';

import { useState, useEffect } from 'react';
import {
  BiFile,
  BiCheck,
  BiX,
  BiImage,
  BiPlus,
  BiTrash,
  BiLinkExternal,
  BiLoaderAlt,
  BiGlobe,
  BiTimeFive,
} from 'react-icons/bi';

export default function BlogForm({
  blog = null,
  apps = [],
  onSuccess,
  onCancel,
  apiEndpoint = '/api/developer/blogs',
}) {
  const isEditing = Boolean(blog?.id);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    cover_image: '',
    app_id: '',
    is_published: true,
  });

  // Attached blogs_image
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImgInput, setNewImgInput] = useState({ image_url: '', alt_text: '', caption: '' });

  const [availableApps, setAvailableApps] = useState(apps);
  const [loading, setLoading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch apps if not passed in
  useEffect(() => {
    if (apps && apps.length > 0) {
      setAvailableApps(apps);
    } else {
      fetch('/api/developer/blogs')
        .then((r) => r.json())
        .then((data) => {
          if (data.apps) setAvailableApps(data.apps);
        })
        .catch(() => {});
    }
  }, [apps]);

  // Initialize form data when blog prop changes
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        summary: blog.summary || '',
        content: blog.content || '',
        cover_image: blog.cover_image || '',
        app_id: blog.app_id ? String(blog.app_id) : '',
        is_published: Boolean(blog.is_published),
      });
      setExistingImages(Array.isArray(blog.images) ? blog.images : []);
    } else {
      setFormData({
        title: '',
        slug: '',
        summary: '',
        content: '',
        cover_image: '',
        app_id: '',
        is_published: true,
      });
      setExistingImages([]);
    }
    setNewImages([]);
    setError('');
    setSuccessMsg('');
  }, [blog]);

  // Add pending image to list
  const handleAddNewImage = () => {
    if (!newImgInput.image_url.trim()) return;
    setNewImages((prev) => [
      ...prev,
      {
        image_url: newImgInput.image_url.trim(),
        alt_text: newImgInput.alt_text.trim() || null,
        caption: newImgInput.caption.trim() || null,
      },
    ]);
    setNewImgInput({ image_url: '', alt_text: '', caption: '' });
  };

  const removePendingImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Delete already saved image from DB
  const handleDeleteExistingImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this gallery image?')) return;
    setDeletingImageId(imageId);
    setError('');
    try {
      const res = await fetch(`${apiEndpoint}?image_id=${imageId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        setError(data.error || 'Failed to delete gallery image.');
      }
    } catch (err) {
      setError(err.message || 'Error deleting image.');
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const payload = {
      ...formData,
      app_id: formData.app_id ? Number(formData.app_id) : null,
    };

    if (isEditing) {
      payload.id = blog.id;
      if (newImages.length > 0) {
        payload.new_images = newImages;
      }
    } else {
      if (newImages.length > 0) {
        payload.images = newImages;
      }
    }

    try {
      const res = await fetch(apiEndpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(isEditing ? 'Blog updated successfully!' : 'Blog post published successfully!');
        setNewImages([]);
        if (data.record?.images) {
          setExistingImages(data.record.images);
        }
        if (onSuccess) onSuccess(data.record);
      } else {
        setError(data.error || 'Failed to save blog post.');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xl font-bold">
            <BiFile />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                {isEditing ? `Edit Article: ${formData.title || 'Untitled'}` : 'Publish Platform Blog Article'}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  formData.is_published
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {formData.is_published ? (
                  <>
                    <BiGlobe className="text-xs" /> Published
                  </>
                ) : (
                  <>
                    <BiTimeFive className="text-xs" /> Draft
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isEditing
                ? 'Update copy, link to platform apps, and manage gallery images.'
                : 'Create authoritative guides, news, and release notes for creators.'}
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
            aria-label="Close"
          >
            <BiX className="text-xl" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Article Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. 10 Portfolio Trends Dominating 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Slug (URL identifier)</label>
            <input
              type="text"
              placeholder="e.g. 10-portfolio-trends-2026 (auto-generated if empty)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.cover_image}
              onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Associated Ecosystem App (Optional)</label>
            <select
              value={formData.app_id}
              onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
            >
              <option value="">-- No App Linked (General Platform Article) --</option>
              {availableApps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.slug})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Brief Summary</label>
          <textarea
            rows={2}
            placeholder="Short hook for card previews, search results, and social snippets..."
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Article Body Content *</label>
          <textarea
            rows={6}
            required
            placeholder="Write full article content (Markdown supported: # Heading, **bold**, - list items)..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors font-mono text-xs leading-relaxed"
          />
        </div>

        {/* Publication Status Toggle */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800">Live Publication</div>
            <p className="text-[11px] text-slate-500">
              When published, this article will appear publicly in the /blogs directory and RSS feeds.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="ml-2 text-xs font-bold text-slate-700">
              {formData.is_published ? 'Published' : 'Draft'}
            </span>
          </label>
        </div>

        {/* blogs_image Gallery Management */}
        <div className="border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BiImage className="text-primary text-base" />
                <span>Gallery Images (blogs_image table)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Attach supplementary gallery images with custom alt text and captions.
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {existingImages.length + newImages.length} image(s)
            </span>
          </div>

          {/* Existing Saved Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Saved Gallery Images
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div className="aspect-video bg-slate-100 overflow-hidden relative">
                      <img
                        src={img.image_url}
                        alt={img.alt_text || 'Blog image'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://placehold.co/600x400/f1f5f9/94a3b8?text=Image+Unavailable';
                        }}
                      />
                      <button
                        type="button"
                        disabled={deletingImageId === img.id}
                        onClick={() => handleDeleteExistingImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-rose-600 hover:text-white text-rose-600 transition-colors shadow-xs cursor-pointer"
                        title="Delete image"
                      >
                        {deletingImageId === img.id ? (
                          <BiLoaderAlt className="animate-spin text-sm" />
                        ) : (
                          <BiTrash className="text-sm" />
                        )}
                      </button>
                    </div>
                    <div className="p-2 text-[11px] space-y-0.5">
                      {img.alt_text && (
                        <div className="font-semibold text-slate-800 truncate">
                          Alt: {img.alt_text}
                        </div>
                      )}
                      {img.caption && (
                        <div className="text-slate-500 italic truncate">
                          &ldquo;{img.caption}&rdquo;
                        </div>
                      )}
                      <div className="font-mono text-[9px] text-slate-400 truncate">
                        {img.image_url}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending New Images */}
          {newImages.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                Pending Images (Will be saved on form submit)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {newImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl border border-amber-200 bg-amber-50/40 overflow-hidden shadow-xs flex flex-col justify-between"
                  >
                    <div className="aspect-video bg-slate-100 overflow-hidden relative">
                      <img
                        src={img.image_url}
                        alt={img.alt_text || 'Pending blog image'}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePendingImage(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-rose-600 hover:text-white text-rose-600 transition-colors shadow-xs cursor-pointer"
                        title="Remove pending image"
                      >
                        <BiX className="text-base" />
                      </button>
                    </div>
                    <div className="p-2 text-[11px] space-y-0.5">
                      {img.alt_text && <div className="font-semibold text-slate-800 truncate">Alt: {img.alt_text}</div>}
                      {img.caption && <div className="text-slate-500 italic truncate">&ldquo;{img.caption}&rdquo;</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Image Input Fields */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
            <div className="text-xs font-bold text-slate-700">Attach Gallery Image</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <input
                  type="url"
                  placeholder="Image URL (https://...)"
                  value={newImgInput.image_url}
                  onChange={(e) => setNewImgInput({ ...newImgInput, image_url: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-secondary"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Alt text (e.g. Dashboard preview)"
                  value={newImgInput.alt_text}
                  onChange={(e) => setNewImgInput({ ...newImgInput, alt_text: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-secondary"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Caption"
                  value={newImgInput.caption}
                  onChange={(e) => setNewImgInput({ ...newImgInput, caption: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-secondary"
                />
                <button
                  type="button"
                  onClick={handleAddNewImage}
                  disabled={!newImgInput.image_url.trim()}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-white text-xs font-bold hover:bg-secondary-dark transition-colors cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1"
                >
                  <BiPlus className="text-sm" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-slate-900 text-xs font-bold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? <BiLoaderAlt className="animate-spin text-base" /> : <BiCheck className="text-base" />}
            <span>{loading ? 'Saving...' : isEditing ? 'Update Blog Post' : 'Save & Publish'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
