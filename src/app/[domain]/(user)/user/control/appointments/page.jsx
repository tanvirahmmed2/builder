'use client';
import React from 'react';
import { BiCalendar } from 'react-icons/bi';

export default function CustomerAppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Appointments & Bookings</h1>
        <p className="text-xs text-slate-400 mt-1">Review your scheduled dining reservations and consultations.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-16 text-center text-slate-500">
        <BiCalendar className="mx-auto text-4xl mb-2 text-slate-600" />
        <p>No active reservations or sessions booked.</p>
      </div>
    </div>
  );
}

