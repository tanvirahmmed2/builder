'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import BlogForm from '@/components/admin/forms/BlogForm';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blogs');
      const data = await res.json();
      if (data.success) {
        setBlogs(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <AdminTableLayout
      title="Platform Blog Articles"
      subtitle="Manage marketing insights, tutorials, and system changelogs for the platform."
      badgeText="Blog"
      badgeColor="primary"
      tableName="blogs"
      apiEndpoint="/api/admin/blogs"
      records={blogs}
      loading={loading}
      onRefresh={fetchBlogs}
      FormComponent={BlogForm}
      searchPlaceholder="Search blogs by title, slug, or content..."
      filterPredicate={(blog, q) =>
        blog.title?.toLowerCase().includes(q) ||
        blog.slug?.toLowerCase().includes(q) ||
        blog.summary?.toLowerCase().includes(q)
      }
      columns={['ID', 'Cover', 'Title & Slug', 'Status', 'Published Date']}
      renderRow={(blog) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{blog.id}</td>
          <td className="px-4 py-3">
            {blog.cover_image ? (
              <img
                src={blog.cover_image}
                alt={blog.title}
                className="w-12 h-9 object-cover rounded-md border border-slate-200"
              />
            ) : (
              <div className="w-12 h-9 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
                No Img
              </div>
            )}
          </td>
          <td className="px-4 py-3 max-w-xs">
            <div className="font-semibold text-slate-800 truncate">{blog.title}</div>
            <div className="font-mono text-[11px] text-slate-400">/{blog.slug}</div>
          </td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                blog.is_published
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {blog.is_published ? 'Published' : 'Draft'}
            </span>
          </td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
