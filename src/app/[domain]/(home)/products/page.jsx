'use client';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import { BiSearch, BiShoppingBag, BiFilter } from 'react-icons/bi';

export default function StoreCatalogPage() {
  const { website, addToCart } = useContext(WebsiteContext) || {};
  const params = useParams();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const websiteType = website?.website_type || 'ecommerce';

  useEffect(() => {
    let isMounted = true;
    async function fetchCatalog() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          type: websiteType,
          limit: '50'
        });
        if (selectedCategory) queryParams.set('category', selectedCategory);
        if (search) queryParams.set('q', search);

        const res = await axios.get(`/api/${domain}/home/catalog?${queryParams.toString()}`);
        if (res.data?.success && isMounted) {
          const d = res.data.data;
          setItems(d.items || d.projects || []);
          setCategories(d.categories || []);
        }
      } catch (err) {
        console.error('Catalog fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain) fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, [domain, websiteType, selectedCategory, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Catalog & Offerings</h1>
          <p className="mt-1 text-sm text-slate-400">Browse through all available products, items, and services</p>
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full rounded-xl border border-white/10 bg-slate-900 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'border border-white/10 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading catalog items...</div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col rounded-2xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-blue-500/30 hover:bg-slate-900/80"
            >
              <Link href={`${basePrefix}/products/${item.slug || item.id}`} className="block aspect-square w-full overflow-hidden rounded-xl bg-slate-800 relative">
                {item.thumbnail_url || item.image_url ? (
                  <img
                    src={item.thumbnail_url || item.image_url}
                    alt={item.name || item.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-600">
                    <BiShoppingBag className="text-4xl" />
                  </div>
                )}
              </Link>
              <div className="mt-4 flex flex-1 flex-col">
                <span className="text-xs font-medium text-blue-400">{item.category_name || 'General'}</span>
                <Link href={`${basePrefix}/products/${item.slug || item.id}`}>
                  <h3 className="text-base font-semibold text-white mt-1 group-hover:text-blue-400 transition-colors">
                    {item.name || item.title}
                  </h3>
                </Link>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-white">
                    ${Number(item.base_price || 0).toFixed(2)}
                  </span>
                  <button
                    onClick={() => addToCart && addToCart(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                    title="Add to Cart"
                  >
                    <BiShoppingBag className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-500">
          <BiFilter className="mx-auto text-4xl mb-2" />
          <p>No items found matching the selected criteria.</p>
        </div>
      )}
    </div>
  );
}

