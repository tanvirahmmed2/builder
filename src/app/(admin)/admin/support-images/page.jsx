'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import SupportImageForm from '@/components/admin/forms/SupportImageForm';

export default function AdminSupportImagesPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=support_images');
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
      title="Support Ticket Attachments"
      subtitle="Screenshots, logs, and evidence images uploaded to troubleshoot support tickets."
      badgeText="Support Image"
      badgeColor="primary"
      tableName="support_images"
      records={images}
      loading={loading}
      onRefresh={fetchImages}
      FormComponent={SupportImageForm}
      searchPlaceholder="Search by ticket ID or file name..."
      filterPredicate={(img, q) =>
        String(img.support_id).includes(q) || img.file_name?.toLowerCase().includes(q)
      }
      columns={['ID', 'Preview', 'Ticket ID', 'File Name', 'Linked Message', 'Uploaded Date']}
      renderRow={(img) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{img.id}</td>
          <td className="px-4 py-3">
            <img
              src={img.image_url}
              alt={img.file_name || 'Screenshot'}
              className="w-14 h-10 object-cover rounded-md border border-slate-200"
            />
          </td>
          <td className="px-4 py-3 font-bold text-slate-800">Ticket #{img.support_id}</td>
          <td className="px-4 py-3 font-mono text-slate-600 max-w-xs truncate">
            {img.file_name || 'attachment.png'}
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {img.message_id ? `Message #${img.message_id}` : 'General Ticket'}
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {img.created_at ? new Date(img.created_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
