'use client'
import React, { useState, useEffect } from 'react'
import { BiLoaderAlt, BiSave, BiTag } from 'react-icons/bi'

export default function BrandForm({ onSubmit, initialData = null, loading = false, isEdit = false }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    is_active: true
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        image: initialData.image_url || initialData.image || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
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
        <BiTag className="text-xl text-primary" />
        <h2 className="text-base font-bold text-slate-800">
          {isEdit ? 'Update Brand' : 'Create New Brand'}
        </h2>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-700">Brand Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Apple, Samsung, Nike"
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
        <label className="text-xs font-bold text-slate-700">Brand Logo / Image URL</label>
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
          placeholder="Brief brand background..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400 resize-none"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="w-4 h-4 text-primary rounded"
        />
        <label htmlFor="is_active" className="text-xs font-semibold text-slate-700 cursor-pointer">
          Active Brand
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
      >
        {loading ? <BiLoaderAlt className="animate-spin text-base" /> : <BiSave className="text-base" />}
        {isEdit ? 'Save Brand Changes' : 'Create Brand'}
      </button>
    </form>
  )
}
