'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import BlogImageForm from '@/components/admin/forms/BlogImageForm';

export default function AdminBlogImagesPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=blogs_image');
      const data = await res.json();
      if (data.success) {
        setImages(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <AdminTableLayout
      title="Blog Media & Images"
      subtitle="Manage promotional assets, figures, and attached images for platform blogs."
      badgeText="Blog Image"
      badgeColor="secondary"
      tableName="blogs_image"
      records={images}
      loading={loading}
      onRefresh={fetchImages}
      FormComponent={BlogImageForm}
      searchPlaceholder="Search by caption, alt text, or blog ID..."
      filterPredicate={(img, q) =>
        img.caption?.toLowerCase().includes(q) ||
        img.alt_text?.toLowerCase().includes(q) ||
        String(img.blog_id).includes(q)
      }
      columns={['ID', 'Preview', 'Linked Blog ID', 'Alt Text', 'Caption', 'Created At']}
      renderRow={(img) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{img.id}</td>
          <td className="px-4 py-3">
            <img
              src={img.image_url}
              alt={img.alt_text || 'Blog image'}
              className="w-14 h-10 object-cover rounded-md border border-slate-200"
            />
          </td>
          <td className="px-4 py-3 font-mono font-semibold text-slate-700">Blog #{img.blog_id}</td>
          <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{img.alt_text || '—'}</td>
          <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{img.caption || '—'}</td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {img.created_at ? new Date(img.created_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
