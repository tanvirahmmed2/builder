'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import CustomerNavbar from '@/components/website/user/bar/Navbar';
import CustomerSidebar from '@/components/website/user/bar/Sidebar';

export default function CustomerControlLayout({ children }) {
  const params = useParams();
  const router = useRouter();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCustomer() {
      try {
        const res = await axios.get(`/api/${domain}/user/auth/me`);
        if (res.data?.success && isMounted) {
          setCustomerData(res.data.data);
        } else if (isMounted) {
          router.push(`${basePrefix}/user/auth/login`);
        }
      } catch (err) {
        if (isMounted) router.push(`${basePrefix}/user/auth/login`);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain) loadCustomer();
    return () => {
      isMounted = false;
    };
  }, [domain]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-500 text-sm">
        Authenticating customer session...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <CustomerNavbar user={customerData?.user} />
      <div className="flex flex-1">
        <CustomerSidebar />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl">{children}</main>
      </div>
    </div>
  );
}

