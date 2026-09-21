'use client';

import { use, useEffect, useState } from 'react';
import {
  BiCalendar,
  BiSearch,
  BiCheckCircle,
  BiXCircle,
  BiTimeFive,
  BiLoaderAlt,
  BiPhone,
  BiEnvelope,
} from 'react-icons/bi';

export default function AppointmentsPage({ params }) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`/api/webites/${slug}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [slug]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/webites/${slug}/manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_appointment_status', id, status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAppointments();
      } else {
        alert(data.error || 'Failed to update appointment status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.service_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Appointments & Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming consultation and service booking requests from your visitors.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
          <input
            type="text"
            placeholder="Search by client or service name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 self-end sm:self-center"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Appointments Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <BiLoaderAlt className="animate-spin text-3xl text-indigo-600" />
          <p className="text-xs font-medium">Loading schedule...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BiCalendar className="mx-auto text-4xl text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No appointments scheduled</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Upcoming bookings made through your public site will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Scheduled Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">{a.client_name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <BiEnvelope className="text-xs" /> {a.client_email}
                    </div>
                    {a.client_phone && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <BiPhone className="text-xs" /> {a.client_phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {a.service_name || 'General Consultation'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <BiTimeFive /> {a.appointment_time || 'Flexible'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      a.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : a.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {a.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] text-slate-400 max-w-xs truncate">
                    {a.notes || 'No special notes'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      {a.status !== 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(a.id, 'confirmed')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl font-bold text-[10px] transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {a.status !== 'cancelled' && (
                        <button
                          onClick={() => handleUpdateStatus(a.id, 'cancelled')}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-[10px] transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
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
