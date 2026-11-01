'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { WebsiteProvider } from '@/components/website/context/WebsiteContext';
import StoreNavbar from '@/components/website/bars/StoreNavbar';
import StoreFooter from '@/components/website/bars/StoreFooter';

export default function StorefrontLayout({ children }) {
  const params = useParams();
  const domain = params?.domain || '';
  const [websiteData, setWebsiteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchBootstrap() {
      try {
        const res = await axios.get(`/api/${domain}/home/bootstrap`);
        if (res.data?.success && isMounted) {
          setWebsiteData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load store bootstrap:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain) {
      fetchBootstrap();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [domain]);

  return (
    <WebsiteProvider
      slug={domain}
      initialWebsite={websiteData?.website}
      initialData={websiteData}
    >
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
        <StoreNavbar />
        <main className="flex-1 w-full">{children}</main>
        <StoreFooter />
      </div>
    </WebsiteProvider>
  );
}

