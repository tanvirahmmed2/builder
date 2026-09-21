'use client';

import { useState } from 'react';
import { BiCheck, BiLoaderAlt, BiX } from 'react-icons/bi';

export default function TenantManageModal({
  isOpen,
  onClose,
  type, // 'product' | 'blog' | 'experience' | 'gallery'
  onSave,
  primaryColor = '#6366f1',
}) {
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [organization, setOrganization] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('General');
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        type,
        title,
        description,
        price: price ? Math.round(parseFloat(price) * 100) : 0,
        organization,
        location,
        category,
        imageUrl,
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Error saving item');
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'product': return 'Add New Product';
      case 'blog': return 'Create Blog Post';
      case 'experience': return 'Add Work Experience';
      case 'gallery': return 'Add Gallery Item';
      default: return 'Add Item';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {getModalTitle()}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <BiX className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {type === 'experience' ? 'Role Title *' : 'Title / Item Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'experience' ? 'Senior Full-Stack Developer' : 'Title'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {type === 'product' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Price in USD ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="49.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>
          )}

          {type === 'experience' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Apex Labs"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {type === 'gallery' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Content *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? <BiLoaderAlt className="animate-spin" /> : <BiCheck />}
              <span>Save & Publish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
