'use client';

import { useState } from 'react';
import { BiCart, BiCheckCircle, BiDownload, BiShoppingBag, BiX } from 'react-icons/bi';

export default function TenantProducts({ products = [], primaryColor = '#6366f1', onAddToCart }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderMsg, setOrderMsg] = useState('');

  if (!products || products.length === 0) return null;

  const handleInstantBuy = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setOrderProcessing(true);
    setOrderMsg('');

    try {
      const res = await fetch(`/api/webites/${selectedProduct.website_id}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: selectedProduct.website_id,
          customerName,
          customerEmail,
          items: [
            {
              product_id: selectedProduct.id,
              name: selectedProduct.name,
              price: selectedProduct.price_in_cents,
              quantity: buyQuantity,
            },
          ],
        }),
      });

      const json = await res.json();
      if (json.success) {
        setOrderSuccess(true);
        setOrderMsg(`Order #${json.order?.order_number || 'Confirmed'} placed successfully! A confirmation receipt has been sent to ${customerEmail}.`);
      } else {
        setOrderMsg(json.error || 'Failed to place order.');
      }
    } catch (err) {
      setOrderMsg('Network error placing order.');
    } finally {
      setOrderProcessing(false);
    }
  };

  return (
    <section id="products" className="py-16 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800"
            style={{ color: primaryColor }}
          >
            Digital Assets & Products
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Store & Digital Goods
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            High quality production-ready boilerplates, design kits, and consulting packages ready for instant download.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => {
            const price = (Number(p.price_in_cents || 0) / 100).toFixed(2);
            const comparePrice = p.compare_at_price_in_cents
              ? (Number(p.compare_at_price_in_cents) / 100).toFixed(2)
              : null;

            return (
              <div
                key={p.id}
                className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group"
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold uppercase flex items-center gap-1">
                      {p.is_digital ? <BiDownload className="text-xs" /> : <BiShoppingBag className="text-xs" />}
                      <span>{p.is_digital ? 'Digital Good' : 'Physical'}</span>
                    </span>
                    {p.is_featured && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Featured
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {p.short_description || p.description}
                  </p>

                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      ${price}
                    </span>
                    {comparePrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ${comparePrice}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/80 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onAddToCart) onAddToCart(p);
                      setSelectedProduct(p);
                      setOrderSuccess(false);
                      setOrderMsg('');
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-transform hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <BiCart className="text-base" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Buy Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BiShoppingBag style={{ color: primaryColor }} />
                <span>Instant Checkout</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <BiX className="text-2xl" />
              </button>
            </div>

            {orderSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl border border-emerald-200">
                  <BiCheckCircle />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Payment Completed!</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {orderMsg}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-5 py-2 rounded-full text-xs font-bold text-white cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleInstantBuy} className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <div>
                    <strong className="block text-slate-900 dark:text-white font-semibold">
                      {selectedProduct.name}
                    </strong>
                    <span className="text-slate-500">
                      ${(Number(selectedProduct.price_in_cents || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      type="button"
                      onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))}
                      className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-1 text-slate-900 dark:text-white">{buyQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setBuyQuantity(buyQuantity + 1)}
                      className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 text-xs font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {orderMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
                    {orderMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email for Order Delivery *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={orderProcessing}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer transition-transform hover:scale-102 flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>
                      {orderProcessing
                        ? 'Processing...'
                        : `Pay $${((Number(selectedProduct.price_in_cents || 0) * buyQuantity) / 100).toFixed(2)}`}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
