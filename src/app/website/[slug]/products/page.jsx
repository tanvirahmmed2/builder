'use client';

import { use, useEffect, useState } from 'react';
import WebsiteProducts from '@/components/website/cards/WebsiteProducts';
import { BiLoaderAlt, BiShoppingBag, BiX, BiCheckCircle } from 'react-icons/bi';

export default function PublicProductsPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    fetch(`/api/webites/${slug}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setData(resData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = (product) => {
    setCart((prev) => [...prev, product]);
    setIsCartOpen(true);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0 || !customerName || !customerEmail) return;

    setCheckingOut(true);
    try {
      const totalInCents = cart.reduce((sum, item) => sum + Number(item.price_in_cents || 0), 0);
      const res = await fetch(`/api/webites/${slug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price_in_cents })),
          total_in_cents: totalInCents,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setOrderSuccess(resData.order);
        setCart([]);
      } else {
        alert(resData.error || 'Checkout failed');
      }
    } catch (err) {
      alert('Error during checkout');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-3">
        <BiLoaderAlt className="animate-spin text-4xl text-indigo-600" />
        <p className="text-xs font-semibold tracking-wider uppercase">Loading Products...</p>
      </div>
    );
  }

  const { website, products = [] } = data || {};
  const primaryColor = website?.settings?.primary_color || '#6366f1';
  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price_in_cents || 0) / 100), 0);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span
          className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white inline-block"
          style={{ backgroundColor: primaryColor }}
        >
          Store Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Featured Products & Digital Goods
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Browse digital downloads, merchandise, tools, and courses crafted by {website?.name || 'Creator'}.
        </p>
      </div>

      {/* Cart button floating header */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold shadow-xs hover:border-indigo-500 transition-colors cursor-pointer"
        >
          <BiShoppingBag className="text-base text-indigo-600" />
          <span>Cart ({cart.length})</span>
          {cart.length > 0 && (
            <span className="font-mono text-indigo-600 font-bold">${cartTotal.toFixed(2)}</span>
          )}
        </button>
      </div>

      {/* Products Grid */}
      <WebsiteProducts
        products={products}
        primaryColor={primaryColor}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <BiShoppingBag className="text-indigo-600" /> Your Shopping Cart
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <BiX className="text-2xl" />
                </button>
              </div>

              {orderSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                    <BiCheckCircle />
                  </div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">Order Confirmed!</h4>
                  <p className="text-xs text-slate-500">
                    Thank you for your purchase. Order #{orderSuccess.id} has been recorded.
                  </p>
                  <button
                    onClick={() => {
                      setOrderSuccess(null);
                      setIsCartOpen(false);
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-xs">
                  Your cart is empty. Add a product to get started!
                </div>
              ) : (
                <div className="py-4 space-y-3">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-indigo-600 font-mono font-bold">
                          ${(Number(item.price_in_cents || 0) / 100).toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCart((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-rose-500 text-xs hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && !orderSuccess && (
              <form onSubmit={handleCheckout} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Subtotal</span>
                  <span className="font-mono text-indigo-600">${cartTotal.toFixed(2)}</span>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Your Email Address"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={checkingOut}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition-colors cursor-pointer"
                >
                  {checkingOut ? 'Processing Order...' : `Complete Purchase ($${cartTotal.toFixed(2)})`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
