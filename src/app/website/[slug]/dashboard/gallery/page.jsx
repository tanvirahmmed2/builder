'use client';

import { use, useEffect, useState } from 'react';
import WebsiteManageModal from '@/components/website/forms/WebsiteManageModal';
import {
  BiPlus,
  BiSearch,
  BiTrash,
  BiImage,
  BiLoaderAlt,
} from 'react-icons/bi';

export default function GalleryPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGallery = async () => {
    try {
      const res = await fetch(`/api/webites/${slug}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setGallery(data.gallery || []);
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [slug]);

  const handleCreateGalleryItem = async (payload) => {
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_gallery',
          title: payload.title,
          category: payload.category,
          media_url: payload.media_url,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchGallery();
      } else {
        alert(data.error || 'Failed to add gallery item');
      }
    } catch (err) {
      alert('Error adding gallery item');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_gallery', id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchGallery();
      } else {
        alert(data.error || 'Failed to delete item');
      }
    } catch (err) {
      alert('Error deleting item');
    }
  };

  const filtered = gallery.filter((g) =>
    g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Portfolio Media & Gallery
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curate visual showcases of your best creative work, designs, and case studies.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <BiPlus className="text-base" />
          <span>Add Media</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search gallery by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="text-xs text-slate-500 self-end sm:self-center font-medium">
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filtered.length}</span> media items
        </div>
      </div>

      {/* Gallery Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
          <p className="text-xs font-medium">Loading gallery...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BiImage className="mx-auto text-4xl text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No media items yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Upload or link photos of your design projects, portfolio shots, and illustrations.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Add First Media
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col justify-between group"
            >
              <div className="aspect-4/3 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={item.media_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.category && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white">
                    {item.category}
                  </span>
                )}
              </div>
              <div className="p-4 flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shrink-0"
                  title="Delete media item"
                >
                  <BiTrash className="text-base" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <WebsiteManageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateGalleryItem}
        type="gallery"
      />
    </div>
  );
}
