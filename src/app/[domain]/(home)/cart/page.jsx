'use client';
import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import {
  BiShoppingBag,
  BiTrash,
  BiCheckCircle,
  BiArrowBack,
  BiCreditCard,
  BiMoney
} from 'react-icons/bi';

export default function CartAndCheckoutPage() {
  const { cart = [], removeFromCart, clearCart } = useContext(WebsiteContext) || {};
  const params = useParams();
  const router = useRouter();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [customerNote, setCustomerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [error, setError] = useState('');

  // Group cart items and calculate totals
  const groupedItems = cart.reduce((acc, item) => {
    const key = item.id || item.slug;
    if (!acc[key]) {
      acc[key] = { ...item, quantity: 0 };
    }
    acc[key].quantity += 1;
    return acc;
  }, {});

  const itemList = Object.values(groupedItems);
  const subtotal = itemList.reduce((sum, item) => sum + (Number(item.base_price || item.price || 0) * item.quantity), 0);
  const shippingFee = subtotal > 0 ? 5.00 : 0.00;
  const grandTotal = subtotal + shippingFee;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (itemList.length === 0) return;
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: { addressLine, city },
        billingAddress: { addressLine, city },
        paymentMethod,
        customerNote,
        shippingFee,
        items: itemList.map((i) => ({
          productId: i.id,
          name: i.name || i.title,
          price: i.base_price || i.price || 0,
          quantity: i.quantity
        }))
      };

      const res = await axios.post(`/api/${domain}/home/cart/checkout`, payload);
      if (res.data?.success) {
        setOrderComplete(res.data.data);
        if (clearCart) clearCart();
      } else {
        setError(res.data?.error || 'Failed to place order');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Order processing failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20">
          <BiCheckCircle className="text-4xl" />
        </div>
        <h1 className="text-3xl font-bold text-white">Order Confirmed!</h1>
        <p className="mt-2 text-sm text-slate-400">
          Thank you for your purchase. Your order number is{' '}
          <span className="font-semibold text-blue-400">#{orderComplete.orderNumber}</span>.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href={`${basePrefix}/products`}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Continue Shopping
          </Link>
          <Link
            href={`${basePrefix}/user/control`}
            className="rounded-xl border border-white/10 bg-slate-900 px-6 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-slate-600 mb-4 border border-white/10">
          <BiShoppingBag className="text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
        <p className="mt-2 text-sm text-slate-400">Discover great products and add them to your shopping bag.</p>
        <Link
          href={`${basePrefix}/products`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <BiArrowBack />
          <span>Browse Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">Shopping Cart & Checkout</h1>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Review Bag ({cart.length} items)</h2>
            <div className="divide-y divide-white/5">
              {itemList.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center">
                      {item.thumbnail_url || item.image_url ? (
                        <img src={item.thumbnail_url || item.image_url} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <BiShoppingBag className="text-slate-600 text-xl" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{item.name || item.title}</h3>
                      <p className="text-xs text-slate-400">
                        Qty: {item.quantity} &bull; ${Number(item.base_price || item.price || 0).toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-white text-sm">
                      ${(Number(item.base_price || item.price || 0) * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart && removeFromCart(cart.findIndex((c) => c.id === item.id))}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove Item"
                    >
                      <BiTrash className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between text-xs text-slate-400">
              <button onClick={clearCart} className="text-rose-400 hover:underline">
                Clear Cart
              </button>
              <Link href={`${basePrefix}/products`} className="text-blue-400 hover:underline">
                + Add More Items
              </Link>
            </div>
          </div>
        </div>

        {/* Checkout Form & Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleCheckout} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-5">
            <h2 className="text-lg font-bold text-white">Customer & Delivery Details</h2>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Full Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Doe"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400">Phone</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Delivery Address</label>
              <input
                type="text"
                required
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="123 Main St, Apt 4"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_delivery')}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                    paymentMethod === 'cash_on_delivery'
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-white/10 bg-slate-950 text-slate-400'
                  }`}
                >
                  <BiMoney className="text-base text-blue-400" />
                  <span>Cash on Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-white/10 bg-slate-950 text-slate-400'
                  }`}
                >
                  <BiCreditCard className="text-base text-blue-400" />
                  <span>Online Card</span>
                </button>
              </div>
            </div>

            {/* Summary calculations */}
            <div className="border-t border-white/10 pt-4 space-y-2 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-white">${shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold text-white">
                <span>Total</span>
                <span className="text-blue-400">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Placing Order...' : `Place Order &bull; $${grandTotal.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

