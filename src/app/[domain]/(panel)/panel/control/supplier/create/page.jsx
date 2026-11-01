'use client'
import React, { useContext, useState } from 'react'
import { useRouter , useParams } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Context } from '@/components/helper/Context'
import SupplierForm from '@/components/website/manager/SupplierForm'

export default function SupplierCreatePage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';

  const { dashSidebar } = useContext(Context)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (supplierData) => {
    setLoading(true)
    try {
      await axios.post('/api/supplier', supplierData)
      toast.success('Supplier created successfully')
      router.push(`${basePath}/supplier`)
      router.refresh()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create supplier')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`w-full min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8 transition-all duration-300 ${dashSidebar ? 'lg:pl-68' : 'lg:pl-8'}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[70vh]">
        <SupplierForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  )
}
