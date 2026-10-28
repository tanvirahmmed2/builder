'use client'
import React, { useState, useEffect } from 'react'
import { BiLoaderAlt, BiSave, BiCategory } from 'react-icons/bi'

export default function CategoryForm({ onSubmit, initialData = null, loading = false, isEdit = false }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'PRODUCT',
    description: '',
    image: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        type: initialData.type || 'PRODUCT',
        description: initialData.description || '',
        image: initialData.image_url || initialData.image || ''
      })
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <BiCategory className="text-xl text-primary" />
        <h2 className="text-base font-bold text-slate-800">
          {isEdit ? 'Update Category' : 'Create New Category'}
        </h2>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700">Category Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Electronics, Clothing, Groceries"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700">Slug (Optional)</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="auto-generated-from-name"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700">Category Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
        >
          <option value="PRODUCT">Product Category</option>
          <option value="BLOG">Blog Category</option>
          <option value="GENERAL">General Category</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700">Category Image URL</label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700">Description</label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Category summary..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
      >
        {loading ? <BiLoaderAlt className="animate-spin text-base" /> : <BiSave className="text-base" />}
        {isEdit ? 'Save Category Changes' : 'Create Category'}
      </button>
    </form>
  )
}
