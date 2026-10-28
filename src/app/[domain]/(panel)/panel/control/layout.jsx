'use client'
import React, { useContext, useEffect } from 'react'
import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { Context } from '@/components/helper/Context'
import Navbar from '@/components/website/bars/Navbar'
import Sidebar from '@/components/website/bars/Sidebar'
import { BiShieldX, BiLoaderAlt, BiHome } from 'react-icons/bi'

export const ROLE_PERMISSIONS = {
  admin: [
    'modules', 'branches', 'people', 'category', 'brands', 'product', 'price-tag', 'stock',
    'purchase', 'purchase-payments', 'supplier', 'customers', 'support', 'contact', 'reviews',
    'payments', 'return', 'report', 'backup', 'settings', 'sale',
    'pending-sale', 'confirmed-sale', 'out_for_delivery', 'completed-sale',
    'returned-sale', 'history', 'issue', 'profile', 'orders', 'overview', 'activity-logs', 'login-logs', 'investor', 'investments', 'withdrawals', 'salaries', 'staff-salaries', 'salary-payments', 'shares', 'expenses', 'expense-payments', 'profits', 'balance', 'notices', 'my-salary'
  ],
  manager: [
    'modules', 'sale', 'pending-sale', 'confirmed-sale', 'out_for_delivery',
    'completed-sale', 'returned-sale', 'payments', 'history', 'issue',
    'profile', 'orders', 'purchase', 'purchase-payments', 'return', 'stock', 'price-tag', 'customers', 'activity-logs', 'login-logs', 'expenses', 'expense-payments', 'notices', 'my-salary'
  ],
  sales: [
    'modules', 'sale', 'pending-sale', 'confirmed-sale', 'out_for_delivery',
    'completed-sale', 'returned-sale', 'payments', 'history', 'issue',
    'profile', 'orders', 'price-tag', 'notices', 'activity-logs', 'login-logs', 'my-salary'
  ],
  staff: [
    'modules', 'profile', 'issue', 'orders', 'price-tag', 'notices', 'activity-logs', 'login-logs', 'my-salary'
  ]
}

export default function DashboardLayout({ children }) {
  const { user, loading } = useContext(Context)
  const pathname = usePathname()
  const params = useParams()
  const domain = params?.domain || ''

  // Automatically scope all client API requests to the current website domain
  useEffect(() => {
    if (!domain) return

    const interceptor = axios.interceptors.request.use((config) => {
      if (typeof config.url === 'string') {
        const url = config.url
        if (
          url.startsWith('/api/') &&
          !url.startsWith('/api/saas/') &&
          !url.startsWith(`/api/${domain}/panel/control/`)
        ) {
          config.url = `/api/${domain}/panel/control${url.slice(4)}`
        }
      }
      return config
    })

    const originalFetch = window.fetch
    window.fetch = function (url, options) {
      if (
        typeof url === 'string' &&
        url.startsWith('/api/') &&
        !url.startsWith('/api/saas/') &&
        !url.startsWith(`/api/${domain}/panel/control/`)
      ) {
        url = `/api/${domain}/panel/control${url.slice(4)}`
      }
      return originalFetch.call(this, url, options)
    }

    return () => {
      axios.interceptors.request.eject(interceptor)
      window.fetch = originalFetch
    }
  }, [domain])

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
        <BiLoaderAlt className="animate-spin text-4xl text-slate-800" />
        <p className="text-slate-600 text-sm font-semibold animate-pulse">Authenticating staff session...</p>
      </div>
    )
  }

  const segments = pathname.split('/').filter(Boolean)
  const controlIdx = segments.indexOf('control')
  const moduleName = controlIdx !== -1 && segments.length > controlIdx + 1 ? segments[controlIdx + 1] : 'overview'
  const role = user?.role || 'staff'
  const allowedModules = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.staff
  const isAllowed = !moduleName || moduleName === 'profile' || moduleName === 'overview' || allowedModules.includes(moduleName)

  const basePath = domain ? `/${domain}/panel/control` : '/panel/control'

  return (
    <>
      <Navbar />
      <Sidebar />
      {!isAllowed ? (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 pt-20">
          <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-8 max-w-md w-full text-center flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-3xl font-bold border border-rose-100">
              <BiShieldX />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                Your staff role (<span className="font-bold uppercase text-slate-800">{role}</span>) does not have authorization to access the <span className="font-bold text-slate-800">/{moduleName}</span> console.
              </p>
            </div>
            <Link
              href={`${basePath}/overview`}
              className="mt-2 px-6 py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer bg-primary hover:bg-primary-dark"
            >
              <BiHome className="text-base" /> Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        children
      )}
    </>
  )
}

