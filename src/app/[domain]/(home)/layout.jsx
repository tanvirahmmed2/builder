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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="inline-flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-sm font-medium">Loading website...</span>
        </div>
      </div>
    );
  }

  if (!websiteData?.website) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center">
        <div className="max-w-md w-full bg-slate-900/60 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            404
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Website Not Found</h1>
          <p className="text-sm text-slate-400 mb-6">
            The requested website &ldquo;{domain}&rdquo; could not be found or has not been published.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center w-full px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20"
          >
            Go to Platform Homepage
          </a>
        </div>
      </div>
    );
  }

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

