'use client';

import { useState } from 'react';
import { BiCalendar, BiCheckCircle, BiClock, BiLoaderAlt, BiUser } from 'react-icons/bi';

export default function TenantAppointments({ websiteId, services = [], primaryColor = '#6366f1', preselectedService = '' }) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceName, setServiceName] = useState(preselectedService || (services[0]?.title || 'Architecture Consultation'));
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:30 AM - 12:30 PM',
    '02:00 PM - 03:00 PM',
    '03:30 PM - 04:30 PM',
    '05:00 PM - 06:00 PM',
  ];

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/webites/${websiteId}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId,
          clientName,
          clientEmail,
          clientPhone,
          serviceName,
          appointmentDate,
          timeSlot,
          notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(`Your appointment for "${serviceName}" on ${appointmentDate} (${timeSlot}) has been booked! We will confirm details via email.`);
        setClientName('');
        setClientEmail('');
        setClientPhone('');
        setNotes('');
      } else {
        setErrorMsg(json.error || 'Failed to book appointment.');
      }
    } catch (err) {
      setErrorMsg('Network error booking appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="appointments" className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800"
            style={{ color: primaryColor }}
          >
            Direct Calendar Booking
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Schedule an Appointment
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Select a service, choose your preferred date and time, and confirm your private consulting session.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm">
          {successMsg ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-3xl border border-emerald-200">
                <BiCheckCircle />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Booking Received!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                {successMsg}
              </p>
              <button
                type="button"
                onClick={() => setSuccessMsg('')}
                className="mt-4 px-6 py-2.5 rounded-full text-xs font-bold text-white cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Book Another Time
              </button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Service *
                  </label>
                  <select
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    {services.length > 0 ? (
                      services.map((s, idx) => (
                        <option key={s.id || idx} value={s.title}>
                          {s.title}
                        </option>
                      ))
                    ) : (
                      <option value="Consultation">Architecture Consultation</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time Slot *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    {timeSlots.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Notes / Topics to Cover
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a short brief about your project requirements or goals..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full text-xs font-bold text-white shadow-md transition-all hover:opacity-95 hover:scale-101 flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? <BiLoaderAlt className="animate-spin text-base" /> : <BiCalendar className="text-base" />}
                <span>Confirm Appointment</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
