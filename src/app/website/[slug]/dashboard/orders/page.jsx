'use client';

import { use, useEffect, useState } from 'react';
import {
  BiShoppingBag,
  BiSearch,
  BiDollarCircle,
  BiCheckCircle,
  BiTimeFive,
  BiLoaderAlt,
  BiUser,
} from 'react-icons/bi';

export default function OrdersPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/webites/${slug}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [slug]);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id?.toString().includes(searchTerm);
    const matchStatus = statusFilter === 'all' || o.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid' || !o.payment_status)
    .reduce((sum, o) => sum + (Number(o.total_in_cents || 0) / 100), 0);

  return (
    <div className="space-y-6">
      {/* KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Orders</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {orders.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Collected</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ${totalRevenue.toFixed(2)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Payment Model</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            Standard / COD
          </div>
        </div>
      </div>

      {/* Header with search & filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search by customer name, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
          <p className="text-xs font-medium">Loading orders & transactions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BiShoppingBag className="mx-auto text-4xl text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No orders found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When visitors make purchases on your store, the transactions will appear right here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Purchased Items</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Fulfillment</th>
                <th className="px-6 py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    #ORD-{o.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{o.customer_name || 'Guest User'}</div>
                    <div className="text-[11px] text-slate-400">{o.customer_email || 'No email provided'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] max-w-xs truncate">
                      {Array.isArray(o.items)
                        ? o.items.map((i) => `${i.quantity || 1}x ${i.name}`).join(', ')
                        : typeof o.items === 'object' && o.items !== null
                        ? JSON.stringify(o.items)
                        : o.items || 'Standard Order Items'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                    ${(Number(o.total_in_cents || 0) / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {o.payment_status || 'Paid'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                      {o.fulfillment_status || 'Processing'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-[11px] text-slate-400">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
