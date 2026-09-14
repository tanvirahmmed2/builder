'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import PackageImageForm from '@/components/admin/forms/PackageImageForm';

export default function AdminPackageImagesPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=package_image');
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
      title="Package Media & Visuals"
      subtitle="Promotional screenshots, tier badge graphics, and visual comparisons."
      badgeText="Package Image"
      badgeColor="secondary"
      tableName="package_image"
      records={images}
      loading={loading}
      onRefresh={fetchImages}
      FormComponent={PackageImageForm}
      searchPlaceholder="Search by package ID or alt text..."
      filterPredicate={(img, q) =>
        String(img.package_id).includes(q) || img.alt_text?.toLowerCase().includes(q)
      }
      columns={['ID', 'Preview', 'Linked Package ID', 'Alt Description', 'Sort Order', 'Created Date']}
      renderRow={(img) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{img.id}</td>
          <td className="px-4 py-3">
            <img
              src={img.image_url}
              alt={img.alt_text || 'Package preview'}
              className="w-14 h-10 object-cover rounded-md border border-slate-200"
            />
          </td>
          <td className="px-4 py-3 font-bold text-slate-800">Package #{img.package_id}</td>
          <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{img.alt_text || '—'}</td>
          <td className="px-4 py-3 font-semibold text-slate-600">{img.sort_order}</td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {img.created_at ? new Date(img.created_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
