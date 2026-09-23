'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import {
  BiSearch,
  BiPlus,
  BiMinus,
  BiTrash,
  BiRefresh,
  BiEdit,
  BiImage,
  BiGridAlt,
  BiLinkExternal,
  BiCheckCircle,
  BiTimeFive,
  BiUser,
  BiRocket,
  BiLoaderAlt,
} from 'react-icons/bi';
import BlogForm from '@/components/developer/forms/BlogForm';
import { Context } from '@/components/helper/Context';

export default function AdminBlogsPage() {
  const { user } = useContext(Context);
  const [blogs, setBlogs] = useState([]);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'DRAFTS'
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const userRole = (user?.role || '').toLowerCase();
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const canManage = Boolean(user?.isAdmin || ['admin', 'manager', 'marketer'].includes(userRole) || permissions.includes('blogs') || !userRole);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setActionError('');
      const res = await fetch('/api/developer/blogs');
      const data = await res.json();
      if (data.success) {
        setBlogs(data.records || []);
        if (data.apps) setApps(data.apps);
      } else {
        setActionError(data.error || 'Failed to fetch blogs');
      }
    } catch (e) {
      console.error(e);
      setActionError(e.message || 'Error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this blog post?')) return;
    setDeletingId(id);
    setActionError('');
    try {
      const res = await fetch(`/api/developer/blogs?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        if (editingBlog?.id === id) setEditingBlog(null);
      } else {
        setActionError(data.error || 'Failed to delete blog');
      }
    } catch (e) {
      setActionError(e.message || 'Error deleting blog');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (blog) => {
    setTogglingId(blog.id);
    setActionError('');
    try {
      const res = await fetch('/api/developer/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: blog.id,
          is_published: !blog.is_published,
        }),
      });
      const data = await res.json();
      if (data.success && data.record) {
        setBlogs((prev) => prev.map((b) => (b.id === blog.id ? data.record : b)));
        if (editingBlog?.id === blog.id) setEditingBlog(data.record);
      } else {
        setActionError(data.error || 'Failed to toggle publication status');
      }
    } catch (e) {
      setActionError(e.message || 'Error updating status');
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = blogs.filter((blog) => {
    if (filterTab === 'PUBLISHED' && !blog.is_published) return false;
    if (filterTab === 'DRAFTS' && blog.is_published) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      blog.title?.toLowerCase().includes(q) ||
      blog.slug?.toLowerCase().includes(q) ||
      blog.summary?.toLowerCase().includes(q) ||
      blog.author_name?.toLowerCase().includes(q) ||
      blog.app_title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Blog Articles</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Blogs &amp; News
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Publish educational articles, marketing insights, and product guides linked with ecosystem apps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchBlogs}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh table data"
          >
            <BiRefresh className="text-lg" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (showForm) {
                setShowForm(false);
              } else {
                setEditingBlog(null);
                setShowForm(true);
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              showForm && !editingBlog
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-secondary hover:bg-secondary-dark text-white'
            }`}
          >
            {showForm && !editingBlog ? <BiMinus className="text-base" /> : <BiPlus className="text-base" />}
            <span>{showForm && !editingBlog ? 'Hide Form' : 'Add Blog Article'}</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError('')}
            className="text-rose-500 hover:text-rose-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create / Edit Form */}
      {(showForm || editingBlog) && (
        <BlogForm
          blog={editingBlog}
          apps={apps}
          apiEndpoint="/api/developer/blogs"
          onSuccess={(savedRecord) => {
            if (editingBlog) {
              setBlogs((prev) => prev.map((b) => (b.id === savedRecord.id ? savedRecord : b)));
              setEditingBlog(null);
            } else {
              setBlogs((prev) => [savedRecord, ...prev]);
              setShowForm(false);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingBlog(null);
          }}
        />
      )}

      {/* Search & Filter Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
            <input
              type="text"
              placeholder="Search blogs by title, slug, author, or app..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
            {[
              { key: 'ALL', label: `All (${blogs.length})` },
              { key: 'PUBLISHED', label: `Published (${blogs.filter((b) => b.is_published).length})` },
              { key: 'DRAFTS', label: `Drafts (${blogs.filter((b) => !b.is_published).length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterTab(tab.key)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterTab === tab.key
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3 whitespace-nowrap">ID</th>
                <th className="px-4 py-3 whitespace-nowrap">Cover</th>
                <th className="px-4 py-3 whitespace-nowrap">Title &amp; App</th>
                <th className="px-4 py-3 whitespace-nowrap">Author</th>
                <th className="px-4 py-3 whitespace-nowrap">Gallery</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Published</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <BiLoaderAlt className="animate-spin text-lg text-secondary" />
                      <span>Loading blogs...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No blog articles match your current view.
                  </td>
                </tr>
              ) : (
                filtered.map((blog) => {
                  const imageCount = Array.isArray(blog.images) ? blog.images.length : 0;
                  const isBeingToggled = togglingId === blog.id;

                  return (
                    <tr
                      key={blog.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        editingBlog?.id === blog.id ? 'bg-secondary/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-500">#{blog.id}</td>

                      <td className="px-4 py-3">
                        {blog.cover_image ? (
                          <img
                            src={blog.cover_image}
                            alt={blog.title}
                            className="w-12 h-9 object-cover rounded-md border border-slate-200"
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://placehold.co/600x400/f1f5f9/94a3b8?text=Cover';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-9 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center text-[10px] text-slate-400">
                            No Img
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">{blog.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-400 truncate">
                            /{blog.slug}
                          </span>
                          {blog.app_title && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <BiRocket className="text-[10px]" /> {blog.app_title}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1 text-[11px]">
                          <BiUser className="text-slate-400" />
                          <span className="font-medium">{blog.author_name || 'Staff'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <BiImage className="text-sm text-slate-400" />
                          <span>{imageCount}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isBeingToggled}
                          onClick={() => handleTogglePublish(blog)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            blog.is_published
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                          }`}
                          title="Click to toggle publish status"
                        >
                          {isBeingToggled ? (
                            <BiLoaderAlt className="animate-spin text-xs" />
                          ) : blog.is_published ? (
                            <BiCheckCircle className="text-xs" />
                          ) : (
                            <BiTimeFive className="text-xs" />
                          )}
                          <span>{blog.is_published ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      <td className="px-4 py-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : '—'}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Public View Link */}
                          {blog.is_published && (
                            <Link
                              href={`/blogs/${blog.slug}`}
                              target="_blank"
                              className="text-slate-400 hover:text-secondary p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                              title="View published article"
                            >
                              <BiLinkExternal className="text-base" />
                            </Link>
                          )}

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBlog(blog);
                              setShowForm(false);
                            }}
                            className="text-slate-400 hover:text-secondary p-1.5 rounded-lg hover:bg-secondary/10 transition-colors cursor-pointer"
                            title="Edit article and images"
                          >
                            <BiEdit className="text-base" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={deletingId === blog.id}
                            onClick={() => handleDelete(blog.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete article"
                          >
                            {deletingId === blog.id ? (
                              <BiLoaderAlt className="animate-spin text-base" />
                            ) : (
                              <BiTrash className="text-base" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
