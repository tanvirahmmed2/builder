'use client';
import React, { useContext, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import { BiCalendar, BiTime, BiCheckCircle } from 'react-icons/bi';

export default function StoreAppointmentsPage() {
  const { website } = useContext(WebsiteContext) || {};
  const params = useParams();
  const domain = params?.domain || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceName, setServiceName] = useState('Standard Reservation');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('12:00');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');

  const siteType = website?.website_type || 'ecommerce';
  const isRestaurant = siteType === 'restaurant';

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await axios.post(`/api/${domain}/home/inquiries`, {
        type: 'appointment',
        name,
        email,
        phone,
        serviceName,
        appointmentDate,
        startTime,
        message
      });

      if (res.data?.success) {
        setBooked(true);
      } else {
        setError(res.data?.error || 'Failed to submit booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('An error occurred while booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
          {isRestaurant ? 'Table Reservation' : 'Appointments'}
        </span>
        <h1 className="text-4xl font-extrabold text-white">
          {isRestaurant ? 'Book Your Dining Experience' : 'Schedule a Session'}
        </h1>
        <p className="text-sm text-slate-400">
          Select your desired date and time. Instant confirmation via SMS/Email.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
        {booked ? (
          <div className="py-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BiCheckCircle className="text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-white">Booking Requested!</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We have received your schedule request for {appointmentDate} at {startTime}. Our concierge will confirm shortly.
            </p>
            <button
              onClick={() => setBooked(false)}
              className="mt-4 rounded-xl border border-white/10 bg-slate-900 px-5 py-2 text-xs font-semibold text-slate-200 hover:text-white"
            >
              Book Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleBook} className="space-y-5">
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400">Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400">Date</label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400">Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400">Special Notes / Guests</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isRestaurant ? 'e.g. Table for 4, anniversary setup' : 'e.g. Project scope consultation'}
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Submitting...' : 'Confirm Schedule Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

