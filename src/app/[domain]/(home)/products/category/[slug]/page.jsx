'use client';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import { BiShoppingBag, BiArrowBack } from 'react-icons/bi';

export default function CategoryDetailPage() {
  const { website, addToCart } = useContext(WebsiteContext) || {};
  const params = useParams();
  const domain = params?.domain || '';
  const slug = params?.slug || '';
  const basePrefix = domain ? `/${domain}` : '';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchCategoryItems() {
      try {
        const res = await axios.get(`/api/${domain}/home/catalog?category=${slug}&limit=50`);
        if (res.data?.success && isMounted) {
          setItems(res.data.data.items || []);
        }
      } catch (err) {
        console.error('Failed to load category items:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain && slug) fetchCategoryItems();
    return () => {
      isMounted = false;
    };
  }, [domain, slug]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <Link
        href={`${basePrefix}/products`}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <BiArrowBack />
        <span>All Products</span>
      </Link>

      <div className="border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold text-white capitalize">{slug.replace(/-/g, ' ')}</h1>
        <p className="text-xs text-slate-400 mt-1">Showing all items curated under this category</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading category items...</div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((prod) => (
            <div
              key={prod.id}
              className="group flex flex-col rounded-2xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:bg-slate-900/80"
            >
              <Link href={`${basePrefix}/products/${prod.slug || prod.id}`} className="aspect-square w-full rounded-xl bg-slate-800 overflow-hidden block">
                {prod.thumbnail_url ? (
                  <img src={prod.thumbnail_url} alt={prod.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-600">
                    <BiShoppingBag className="text-4xl" />
                  </div>
                )}
              </Link>
              <div className="mt-4 flex flex-1 flex-col">
                <Link href={`${basePrefix}/products/${prod.slug || prod.id}`}>
                  <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {prod.name}
                  </h3>
                </Link>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-white">${Number(prod.base_price).toFixed(2)}</span>
                  <button
                    onClick={() => addToCart && addToCart(prod)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
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
          No items found in this category.
        </div>
      )}
    </div>
  );
}

