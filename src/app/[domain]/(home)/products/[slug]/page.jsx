'use client';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import { BiShoppingBag, BiArrowBack, BiCheck, BiShieldCheck } from 'react-icons/bi';

export default function ProductDetailPage() {
  const { website, addToCart } = useContext(WebsiteContext) || {};
  const params = useParams();
  const domain = params?.domain || '';
  const slug = params?.slug || '';
  const basePrefix = domain ? `/${domain}` : '';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      try {
        const res = await axios.get(`/api/${domain}/home/catalog?limit=100`);
        if (res.data?.success && isMounted) {
          const items = res.data.data.items || [];
          const found = items.find((p) => p.slug === slug || String(p.id) === slug);
          setProduct(found || null);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain && slug) fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [domain, slug]);

  const handleAddToCart = () => {
    if (!product || !addToCart) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-500">Loading item details...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white">Item Not Found</h2>
        <p className="mt-2 text-sm text-slate-400">The requested catalog item could not be located.</p>
        <Link
          href={`${basePrefix}/products`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <BiArrowBack />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={`${basePrefix}/products`}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <BiArrowBack />
        <span>Back to Catalog</span>
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Gallery / Image */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 aspect-square flex items-center justify-center p-8">
          {product.thumbnail_url || product.image_url ? (
            <img
              src={product.thumbnail_url || product.image_url}
              alt={product.name || product.title}
              className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
            />
          ) : (
            <BiShoppingBag className="text-8xl text-slate-700" />
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              {product.category_name || 'Category'}
            </span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
              {product.name || product.title}
            </h1>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-extrabold text-white">
              ${Number(product.base_price || 0).toFixed(2)}
            </span>
            {product.compare_price && (
              <span className="text-lg text-slate-500 line-through">
                ${Number(product.compare_price).toFixed(2)}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">
            {product.description || product.short_description || 'High-quality item engineered for performance, reliability, and satisfaction.'}
          </p>

          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            {/* Quantity Selector */}
            <div className="flex items-center rounded-xl border border-white/10 bg-slate-900 px-3 py-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2 text-slate-400 hover:text-white"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-semibold text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-2 text-slate-400 hover:text-white"
              >
                +
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-semibold transition-all shadow-lg ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 text-white shadow-blue-600/30 hover:bg-blue-500'
              }`}
            >
              {added ? (
                <>
                  <BiCheck className="text-lg" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <BiShoppingBag className="text-lg" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <BiShieldCheck className="text-lg text-blue-400" />
              <span>Verified Authenticity</span>
            </div>
            <div className="flex items-center gap-2">
              <BiCheck className="text-lg text-emerald-400" />
              <span>Instant Confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

