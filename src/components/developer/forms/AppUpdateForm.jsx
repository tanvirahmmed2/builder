'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TiptapEditor from '@/components/ui/TiptapEditor';
import {
  BiEdit,
  BiX,
  BiUpload,
  BiTrash,
  BiCheckCircle,
  BiTimeFive,
  BiLoaderAlt,
  BiGlobe,
  BiCloudUpload,
  BiImages,
  BiPlus,
} from 'react-icons/bi';

export default function AppUpdateForm({ app, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: app?.title || '',
    slug: app?.slug || '',
    short_description: app?.short_description || '',
    description: app?.description || '',
    is_published: Boolean(app?.is_published),
  });

  const [images, setImages] = useState(app?.images || []);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Existing Cloudinary Asset Library Modal
  const [showCloudinaryLibrary, setShowCloudinaryLibrary] = useState(false);
  const [cloudinaryAssets, setCloudinaryAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [attachingAssetId, setAttachingAssetId] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (app) {
      setFormData({
        title: app.title || '',
        slug: app.slug || '',
        short_description: app.short_description || '',
        description: app.description || '',
        is_published: Boolean(app.is_published),
      });
      setImages(app.images || []);
    }
  }, [app]);

  // Load existing Cloudinary account assets using axios
  const loadCloudinaryLibrary = async () => {
    setShowCloudinaryLibrary(true);
    setLoadingAssets(true);
    setError('');

    try {
      const res = await axios.post('/api/developer/apps', {
        action: 'list_cloudinary_assets',
      });

      if (res.data?.success && res.data?.assets) {
        setCloudinaryAssets(res.data.assets);
      } else {
        setError(res.data?.error || 'Failed to load Cloudinary library.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error fetching Cloudinary assets.');
    } finally {
      setLoadingAssets(false);
    }
  };

  // Attach an existing Cloudinary asset to this app using axios
  const handleAttachExistingAsset = async (asset) => {
    setAttachingAssetId(asset.public_id);
    setError('');
    setSuccessMsg('');

    try {
      const res = await axios.post('/api/developer/apps', {
        action: 'attach_cloudinary_asset',
        app_id: app.id,
        public_id: asset.public_id,
        asset_id: asset.asset_id,
        title: formData.title || 'App Image',
      });

      if (res.data?.success && res.data?.images) {
        setImages(res.data.images);
        setSuccessMsg(`Attached "${asset.public_id}" from Cloudinary.`);
      } else {
        setError(res.data?.error || 'Failed to attach Cloudinary asset.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error attaching asset.');
    } finally {
      setAttachingAssetId(null);
    }
  };

  // Handle local file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
    }));

    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => {
      const removed = prev[index];
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Upload selected files directly to Cloudinary via backend with axios
  const handleUploadFilesToCloudinary = async () => {
    if (selectedFiles.length === 0) return;

    setUploadingImages(true);
    setError('');
    setSuccessMsg('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('action', 'upload_images');
      uploadFormData.append('app_id', String(app.id));

      selectedFiles.forEach((file) => {
        uploadFormData.append('images', file);
      });

      const res = await axios.post('/api/developer/apps', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success && res.data?.images) {
        setImages(res.data.images);
        setSelectedFiles([]);
        setFilePreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSuccessMsg(res.data.message || 'Images stored in Cloudinary successfully.');
      } else {
        setError(res.data?.error || 'Failed to upload images to Cloudinary.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error uploading images.');
    } finally {
      setUploadingImages(false);
    }
  };

  // Delete an existing image (removes from Cloudinary & DB) using axios
  const handleDeleteImage = async (imageId) => {
    setDeletingImageId(imageId);
    setError('');
    setSuccessMsg('');

    try {
      const res = await axios.post('/api/developer/apps', {
        action: 'delete_image',
        image_id: imageId,
      });

      if (res.data?.success) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        setSuccessMsg('Image deleted from Cloudinary.');
      } else {
        setError(res.data?.error || 'Failed to delete image.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error deleting image.');
    } finally {
      setDeletingImageId(null);
    }
  };

  // Save changes / Publish using axios
  const handleSubmit = async (publishOverride) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const isPublished = publishOverride !== undefined ? publishOverride : formData.is_published;

    try {
      // If there are pending selected files not yet uploaded, upload them first
      if (selectedFiles.length > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append('action', 'upload_images');
        uploadFormData.append('app_id', String(app.id));
        selectedFiles.forEach((file) => uploadFormData.append('images', file));

        await axios.post('/api/developer/apps', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSelectedFiles([]);
        setFilePreviews([]);
      }

      const res = await axios.post('/api/developer/apps', {
        action: 'update_record',
        id: app.id,
        data: {
          ...formData,
          is_published: isPublished,
        },
      });

      if (res.data?.success && res.data?.record) {
        setSuccessMsg(
          isPublished
            ? 'Application published live successfully!'
            : 'Application draft saved successfully.'
        );
        if (onSuccess) onSuccess(res.data.record);
      } else {
        setError(res.data?.error || 'Failed to update application.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error saving application changes.');
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
            <BiEdit />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Edit Application: <span className="text-secondary">{formData.title || 'Untitled'}</span>
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
                    <BiCheckCircle className="text-xs" /> Published
                  </>
                ) : (
                  <>
                    <BiTimeFive className="text-xs" /> Draft Mode
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Configure app metadata, upload image files stored in Cloudinary, and toggle published status.
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-5"
      >
        {/* Core Fields */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Application Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. E-commerce Storefront"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Short Description (Summary)</label>
          <input
            type="text"
            placeholder="One-line summary shown on cards and ecosystem directory..."
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-secondary focus:bg-white transition-colors"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">Full Description & Capabilities</label>
            <span className="text-[11px] text-slate-400 font-medium">Rich text formatting enabled (Tiptap)</span>
          </div>
          <TiptapEditor
            value={formData.description}
            onChange={(content) => setFormData((prev) => ({ ...prev, description: content }))}
            placeholder="Detailed overview of what this application does, supported workflows, and features..."
            minHeight="180px"
          />
        </div>

        {/* Publication Status Toggle */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-800">Publishing Status</div>
            <p className="text-[11px] text-slate-500">
              When published, this application becomes active and accessible to creators across the platform.
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

        {/* Cloudinary Multiple Image Upload Section */}
        <div className="border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Cloudinary Image Gallery ({images.length})
              </h4>
              <p className="text-[11px] text-slate-500">
                Images are stored directly in Cloudinary (public_id as image, secret asset_id as image_id).
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={loadCloudinaryLibrary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-300"
              >
                <BiImages className="text-sm text-secondary" />
                <span>Browse Cloudinary Library</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold transition-colors cursor-pointer border border-secondary/20"
              >
                <BiUpload className="text-sm" />
                <span>Upload Files</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Modal / Panel for Existing Cloudinary Library */}
          {showCloudinaryLibrary && (
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <BiImages className="text-base text-secondary" />
                    <span>Your Existing Cloudinary Assets ({cloudinaryAssets.length})</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Click "Attach" on any asset to link its public_id and secret asset_id to this app.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCloudinaryLibrary(false)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <BiX className="text-lg" />
                </button>
              </div>

              {loadingAssets ? (
                <div className="py-8 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
                  <BiLoaderAlt className="animate-spin text-lg text-secondary" />
                  <span>Loading assets from Cloudinary...</span>
                </div>
              ) : cloudinaryAssets.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No assets found in Cloudinary library.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
                  {cloudinaryAssets.map((asset) => {
                    const isAttaching = attachingAssetId === asset.public_id;
                    const isAlreadyAttached = images.some((img) => img.image === asset.public_id);

                    return (
                      <div
                        key={asset.public_id}
                        className="group relative rounded-lg border border-slate-200 bg-white overflow-hidden aspect-video flex flex-col justify-between shadow-xs"
                      >
                        <img
                          src={asset.secure_url}
                          alt={asset.public_id}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 gap-1">
                          <span className="text-[9px] text-white font-mono truncate max-w-full px-1">
                            {asset.public_id}
                          </span>
                          <button
                            type="button"
                            disabled={isAttaching || isAlreadyAttached}
                            onClick={() => handleAttachExistingAsset(asset)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                              isAlreadyAttached
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-slate-900 hover:bg-secondary hover:text-white'
                            }`}
                          >
                            {isAttaching ? (
                              <BiLoaderAlt className="animate-spin text-xs" />
                            ) : isAlreadyAttached ? (
                              <>
                                <BiCheckCircle className="text-xs" /> Attached
                              </>
                            ) : (
                              <>
                                <BiPlus className="text-xs" /> Attach
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Existing Cloudinary Images in Database */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img) => {
                const srcUrl = img.url;
                return (
                  <div
                    key={img.id}
                    className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-video flex items-center justify-center shadow-xs"
                  >
                    <img
                      src={srcUrl}
                      alt={img.title || formData.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://placehold.co/600x400/f1f5f9/94a3b8?text=Cloudinary+Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={deletingImageId === img.id}
                        className="p-2 rounded-lg bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                        title="Delete from Cloudinary"
                      >
                        {deletingImageId === img.id ? (
                          <BiLoaderAlt className="animate-spin text-sm" />
                        ) : (
                          <>
                            <BiTrash className="text-sm" />
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] px-1.5 py-0.5 truncate font-mono text-center">
                      ID: {img.image}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              No images in gallery yet. Upload new images or attach existing ones from your Cloudinary library above.
            </div>
          )}

          {/* Newly Selected Local Files (Pending Upload) */}
          {filePreviews.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BiCloudUpload className="text-base text-secondary" />
                  <span>Ready to Upload ({filePreviews.length} selected)</span>
                </span>

                <button
                  type="button"
                  onClick={handleUploadFilesToCloudinary}
                  disabled={uploadingImages}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-secondary hover:bg-secondary-dark text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {uploadingImages ? (
                    <>
                      <BiLoaderAlt className="animate-spin text-sm" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <BiUpload className="text-sm" />
                      <span>Upload to Cloudinary Now</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {filePreviews.map((p, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-lg overflow-hidden border border-slate-200 bg-white aspect-video flex flex-col justify-between p-1 shadow-xs"
                  >
                    <img src={p.url} alt={p.name} className="w-full h-16 object-cover rounded" />
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span className="truncate max-w-[80px] font-mono">{p.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(idx)}
                        className="text-rose-500 hover:text-rose-700 p-0.5"
                        title="Remove"
                      >
                        <BiX className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="text-[11px] text-slate-400 font-mono">
            {formData.slug ? `/apps/${formData.slug}` : 'No slug set'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading || uploadingImages}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            {/* Save as Draft Button */}
            <button
              type="button"
              disabled={loading || uploadingImages}
              onClick={() => handleSubmit(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <BiTimeFive className="text-sm" />
              <span>Save as Draft</span>
            </button>

            {/* Publish Button */}
            <button
              type="button"
              disabled={loading || uploadingImages}
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <BiLoaderAlt className="animate-spin text-sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <BiGlobe className="text-sm" />
                  <span>Publish App</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
