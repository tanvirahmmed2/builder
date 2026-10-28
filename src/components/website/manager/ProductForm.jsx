'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BiLoaderAlt, BiSave, BiPackage } from 'react-icons/bi'

export default function ProductForm({ onSubmit, initialData = null, loading = false, isEdit = false }) {
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    brand_id: '',
    sku: '',
    barcode: '',
    unit: 'pcs',
    buy_price: '0',
    sale_price: '0',
    discount_price: '0',
    stock: '10',
    description: '',
    image: '',
    is_active: true
  })

  useEffect(() => {
    // Load categories and brands
    axios.get('/api/category').then(r => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => {})
    axios.get('/api/brand').then(r => setBrands(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category_id: initialData.category_id || '',
        brand_id: initialData.brand_id || '',
        sku: initialData.sku || '',
        barcode: initialData.barcode || '',
        unit: initialData.unit || 'pcs',
        buy_price: initialData.buy_price !== undefined ? String(initialData.buy_price) : '0',
        sale_price: initialData.sale_price !== undefined ? String(initialData.sale_price) : '0',
        discount_price: initialData.discount_price !== undefined ? String(initialData.discount_price) : '0',
        stock: initialData.stock !== undefined ? String(initialData.stock) : '0',
        description: initialData.description || '',
        image: initialData.image || initialData.image_url || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true
      })
    }
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <BiPackage className="text-xl text-primary" />
        <h2 className="text-base font-bold text-slate-800">
          {isEdit ? 'Update Product Catalog' : 'Create Product Catalog'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Product Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Wireless Noise-Cancelling Headphones"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Category</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.category_id || c.id} value={c.category_id || c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Brand</label>
          <select
            value={formData.brand_id}
            onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          >
            <option value="">Select Brand</option>
            {brands.map((b) => (
              <option key={b.brand_id || b.id} value={b.brand_id || b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">SKU Code</label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="e.g. SKU-PROD-001"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Barcode</label>
          <input
            type="text"
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            placeholder="e.g. 890123456789"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Cost / Buy Price (৳)</label>
          <input
            type="number"
            step="0.01"
            value={formData.buy_price}
            onChange={(e) => setFormData({ ...formData, buy_price: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Sale Price (৳) *</label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.sale_price}
            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Discount Amount (৳)</label>
          <input
            type="number"
            step="0.01"
            value={formData.discount_price}
            onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Initial Stock</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Product Image URL</label>
          <input
            type="text"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Product details, specs, warranties..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400 resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="product_is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="w-4 h-4 text-primary rounded"
        />
        <label htmlFor="product_is_active" className="text-xs font-semibold text-slate-700 cursor-pointer">
          Product Active in POS and Store
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
      >
        {loading ? <BiLoaderAlt className="animate-spin text-base" /> : <BiSave className="text-base" />}
        {isEdit ? 'Save Product Changes' : 'Create Product'}
      </button>
    </form>
  )
}
