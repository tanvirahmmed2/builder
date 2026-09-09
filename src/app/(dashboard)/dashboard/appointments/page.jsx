'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/creator');
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppts();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await fetch('/api/creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_appointment', id, status }),
      });
      fetchAppts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard" className="text-indigo-400 hover:underline">← Dashboard</Link>
            <span>/</span>
            <span>Modules</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Appointments & Bookings Module</h1>
          <p className="text-xs text-slate-400">
            Client sessions scheduled through your live portfolio booking widget. Both Creators and Managers can confirm or cancel.
          </p>
        </div>

        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{appt.clientName}</span>
                  <span className="text-xs text-slate-400">({appt.clientEmail})</span>
                </div>
                <div className="text-xs text-indigo-400 font-semibold">
                  Date: {appt.appointmentDate} • Time Slot: {appt.timeSlot}
                </div>
                {appt.notes && (
                  <p className="text-xs text-slate-300 pt-1 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-white/5">
                    Notes: {appt.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    appt.status === 'CONFIRMED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : appt.status === 'CANCELLED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {appt.status}
                </span>

                <button
                  onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
}
