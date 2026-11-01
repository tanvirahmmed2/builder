'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import {
  BiShoppingBag,
  BiDollarCircle,
  BiSupport,
  BiRightArrowAlt,
  BiTimeFive,
  BiCheckCircle
} from 'react-icons/bi';

export default function CustomerDashboardOverview() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  const [meData, setMeData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [meRes, ordersRes] = await Promise.all([
          axios.get(`/api/${domain}/user/auth/me`),
          axios.get(`/api/${domain}/user/control/orders`)
        ]);

        if (isMounted) {
          if (meRes.data?.success) setMeData(meRes.data.data);
          if (ordersRes.data?.success) setOrders(ordersRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain) loadData();
    return () => {
      isMounted = false;
    };
  }, [domain]);

  const user = meData?.user;
  const stats = meData?.stats || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Welcome back, {user?.first_name || 'Customer'}!
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Manage your order activity, view shipping updates, and handle support requests.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Orders</p>
            <h3 className="mt-1 text-2xl font-bold text-white">{stats.total_orders || orders.length}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <BiShoppingBag className="text-2xl" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Spent</p>
            <h3 className="mt-1 text-2xl font-bold text-white">
              ${Number(stats.total_spent || 0).toFixed(2)}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BiDollarCircle className="text-2xl" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Helpdesk Tickets</p>
            <h3 className="mt-1 text-2xl font-bold text-white">0 Active</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BiSupport className="text-2xl" />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Orders</h2>
          <Link href={`${basePrefix}/user/control/orders`} className="text-xs font-semibold text-blue-400 hover:text-blue-300">
            View All &rarr;
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-white/10 text-[11px] uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3 text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 font-semibold text-white">#{o.order_number}</td>
                    <td className="py-3 text-slate-400">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-400 border border-blue-500/20">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 capitalize">{o.payment_status}</td>
                    <td className="py-3 text-right font-bold text-white">${Number(o.grand_total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <BiShoppingBag className="mx-auto text-4xl mb-2 text-slate-600" />
            <p>No orders placed yet.</p>
            <Link
              href={`${basePrefix}/products`}
              className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

