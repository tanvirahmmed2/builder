'use client';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { WebsiteContext, useTenantBasePrefix } from '@/components/website/context/WebsiteContext';
import {
  BiRightArrowAlt,
  BiShoppingBag,
  BiCheckCircle,
  BiStar,
  BiCalendar,
  BiBriefcase,
  BiLayer
} from 'react-icons/bi';

export default function TenantHomePage() {
  const { website, addToCart } = useContext(WebsiteContext) || {};
  const params = useParams();
  const domain = params?.domain || '';
  const basePrefix = useTenantBasePrefix();

  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);

  const websiteType = website?.website_type ?? 'ecommerce';
  const siteName = website?.settings?.site_name ?? website?.name ?? 'Welcome';
  const tagline = website?.settings?.tagline ?? 'Experience unmatched quality and service.';

  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const res = await axios.get(`/api/${domain}/home/catalog?type=${websiteType}&limit=8`);
        if (res.data?.success && isMounted) {
          setCatalog(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load homepage catalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain) loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [domain, websiteType]);

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-16 lg:p-20 text-center relative shadow-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            {websiteType.toUpperCase()} PORTAL
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            {siteName}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            {tagline}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`${basePrefix}/products`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
            >
              <span>Explore Catalog</span>
              <BiRightArrowAlt className="text-lg" />
            </Link>
            <Link
              href={`${basePrefix}/contacts`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-all"
            >
              <span>Contact Us</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Content Based on Website Type */}

      {/* 1. E-Commerce Showcase */}
      {websiteType === 'ecommerce' && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Featured Products</h2>
              <p className="text-sm text-slate-400 mt-1">Hand-picked selections crafted for perfection</p>
            </div>
            <Link href={`${basePrefix}/products`} className="text-sm font-medium text-blue-400 hover:text-blue-300">
              View All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {catalog?.items?.length > 0 ? (
              catalog.items.map((prod) => (
                <div
                  key={prod.id}
                  className="group flex flex-col rounded-2xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-blue-500/30 hover:bg-slate-900/80"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-800 relative">
                    {prod.thumbnail_url ? (
                      <img
                        src={prod.thumbnail_url}
                        alt={prod.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-600">
                        <BiShoppingBag className="text-4xl" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-1 flex-col">
                    <span className="text-xs font-medium text-blue-400">{prod.category_name || 'Category'}</span>
                    <h3 className="text-base font-semibold text-white mt-1 group-hover:text-blue-400 transition-colors">
                      {prod.name}
                    </h3>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-white">${Number(prod.base_price).toFixed(2)}</span>
                      <button
                        onClick={() => addToCart && addToCart(prod)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                        title="Add to Cart"
                      >
                        <BiShoppingBag className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500">
                <BiShoppingBag className="mx-auto text-4xl mb-2" />
                <p>No products featured yet. Add products from the staff console.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Restaurant Showcase */}
      {websiteType === 'restaurant' && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Our Specialties</h2>
              <p className="text-sm text-slate-400 mt-1">Fresh ingredients & exquisite flavors</p>
            </div>
            <Link href={`${basePrefix}/products`} className="text-sm font-medium text-blue-400 hover:text-blue-300">
              Full Menu &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalog?.items?.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:bg-slate-900/80"
              >
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-800">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-600">🍽️</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <span className="font-bold text-blue-400">${Number(item.base_price).toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{item.description || 'Prepared fresh upon order'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Portfolio Showcase */}
      {websiteType === 'portfolio' && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Featured Projects</h2>
              <p className="text-sm text-slate-400 mt-1">High-impact engineering & creative works</p>
            </div>
            <Link href={`${basePrefix}/products`} className="text-sm font-medium text-blue-400 hover:text-blue-300">
              All Works &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalog?.projects?.map((proj) => (
              <div
                key={proj.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 transition-all hover:border-blue-500/30"
              >
                <div className="aspect-video w-full bg-slate-800 relative overflow-hidden">
                  {proj.thumbnail_url ? (
                    <img
                      src={proj.thumbnail_url}
                      alt={proj.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-600">
                      <BiLayer className="text-4xl" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-blue-400">{proj.category_name || 'Project'}</span>
                  <h3 className="mt-1 text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 line-clamp-2">{proj.summary || 'Project overview and delivery'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Organization Showcase */}
      {websiteType === 'organization' && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Open Opportunities</h2>
              <p className="text-sm text-slate-400 mt-1">Join our mission-driven team</p>
            </div>
            <Link href={`${basePrefix}/services`} className="text-sm font-medium text-blue-400 hover:text-blue-300">
              View All Roles &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {catalog?.jobs?.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 p-5 hover:bg-slate-900/80 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-white">{job.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{job.location || 'Remote'} &bull; {job.job_type || 'Full Time'}</p>
                </div>
                <Link
                  href={`${basePrefix}/contacts?job=${job.slug}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  Apply
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

