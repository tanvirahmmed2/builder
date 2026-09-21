'use client';

import { use, useEffect, useState } from 'react';
import WebsiteManageModal from '@/components/website/forms/WebsiteManageModal';
import {
  BiPlus,
  BiSearch,
  BiTrash,
  BiPackage,
  BiDollarCircle,
  BiCheckCircle,
  BiLoaderAlt,
} from 'react-icons/bi';

export default function ProductsPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/webites/${slug}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [slug]);

  const handleCreateProduct = async (payload) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_product',
          name: payload.name,
          description: payload.description,
          price_in_cents: payload.price_in_cents,
          stock: payload.stock,
          images: payload.images,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        alert(data.error || 'Failed to create product');
      }
    } catch (err) {
      alert('Error creating product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_product', id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      } else {
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Products & Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store catalog, pricing, inventory levels, and product imagery.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <BiPlus className="text-base" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search and summary filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search products by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="text-xs text-slate-500 self-end sm:self-center font-medium">
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filtered.length}</span> of {products.length} items
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
          <p className="text-xs font-medium">Loading products catalog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BiPackage className="mx-auto text-4xl text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No products found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm ? 'No products match your search query.' : 'Get started by creating your first product.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Add First Product
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                          <BiPackage className="text-lg" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                          {item.description || 'No description provided'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    ${(Number(item.price_in_cents || 0) / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.stock > 0
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                    }`}>
                      {item.stock > 0 ? `${item.stock} in stock` : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <BiCheckCircle /> Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      title="Delete Product"
                    >
                      <BiTrash className="text-base" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <WebsiteManageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateProduct}
        type="product"
      />
    </div>
  );
}
