'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { BiShoppingBag, BiTimeFive, BiCheckCircle, BiPackage } from 'react-icons/bi';

export default function CustomerOrdersPage() {
  const params = useParams();
  const domain = params?.domain || '';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchOrders() {
      try {
        const res = await axios.get(`/api/${domain}/user/control/orders`);
        if (res.data?.success && isMounted) {
          setOrders(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain) fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [domain]);

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Order History & Deliveries</h1>
        <p className="text-xs text-slate-400 mt-1">Review your recent purchases, items, and shipping status.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Loading orders...</div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 space-y-4 hover:border-white/20 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-400">ORDER #{order.order_number}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase text-blue-400 border border-blue-500/20">
                    {order.status}
                  </span>
                  <span className="text-base font-bold text-white">
                    ${Number(order.grand_total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <BiPackage className="text-slate-500 text-sm" />
                        <span>{item.product_name}</span>
                        <span className="text-slate-500">&times; {item.quantity}</span>
                      </div>
                      <span className="font-semibold text-white">${Number(item.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-16 text-center text-slate-500">
          <BiShoppingBag className="mx-auto text-4xl mb-2 text-slate-600" />
          <p>No orders recorded in your history.</p>
        </div>
      )}
    </div>
  );
}

