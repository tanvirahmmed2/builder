'use client'
import React, { useState, useEffect } from 'react'
import { BiLoaderAlt, BiSave, BiUser } from 'react-icons/bi'

export default function SupplierForm({ onSubmit, initialData = null, loading = false, isEdit = false }) {
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    balance: '0',
    note: '',
    is_active: true
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        company_name: initialData.company_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        balance: initialData.balance !== undefined ? String(initialData.balance) : '0',
        note: initialData.note || '',
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
        <BiUser className="text-xl text-primary" />
        <h2 className="text-base font-bold text-slate-800">
          {isEdit ? 'Update Supplier Profile' : 'Register New Supplier'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Contact Person Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. John Doe"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Company Name</label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            placeholder="e.g. Apex Distribution Ltd."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Phone Number</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+880..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="supplier@company.com"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Physical Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Warehouse or office address..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Additional Notes</label>
          <textarea
            rows={3}
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Payment terms, delivery schedules..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400 resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="supplier_is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="w-4 h-4 text-primary rounded"
        />
        <label htmlFor="supplier_is_active" className="text-xs font-semibold text-slate-700 cursor-pointer">
          Active Supplier
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
      >
        {loading ? <BiLoaderAlt className="animate-spin text-base" /> : <BiSave className="text-base" />}
        {isEdit ? 'Save Supplier Changes' : 'Create Supplier'}
      </button>
    </form>
  )
}
