'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  StarIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
  BoxIcon,
  MessageSquareIcon,
} from '@/components/ui/Icons';

export default function PublicPortfolioSite({ params }) {
  const unwrappedParams = use(params);
  const subdomain = unwrappedParams.subdomain || 'alex-design';

  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [sections, setSections] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Appointment Modal
  const [showApptModal, setShowApptModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 10:45 AM');
  const [notes, setNotes] = useState('');
  const [apptSuccess, setApptSuccess] = useState(false);

  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [repName, setRepName] = useState('');
  const [repEmail, setRepEmail] = useState('');
  const [repSubject, setRepSubject] = useState('');
  const [repDesc, setRepDesc] = useState('');
  const [repSuccess, setRepSuccess] = useState(false);

  const fetchSiteData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user?subdomain=${subdomain}`);
      const data = await res.json();
      if (data.success) {
        setPortfolio(data.portfolio);
        setSections(data.sections || []);
        setBlogs(data.blogs || []);
        setAppointments(data.appointments || []);
        setExperiences(data.experiences || []);
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteData();
  }, [subdomain]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'book_appointment',
          appointmentData: {
            portfolioId: portfolio.id,
            clientName,
            clientEmail,
            appointmentDate,
            timeSlot,
            notes,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowApptModal(false);
        setApptSuccess(true);
        setTimeout(() => setApptSuccess(false), 4000);
        fetchSiteData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_review',
          reviewData: {
            portfolioId: portfolio.id,
            clientName: reviewerName,
            clientEmail: reviewerEmail,
            rating: Number(rating),
            reviewTitle,
            reviewText,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowReviewModal(false);
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 4000);
        fetchSiteData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_report',
          reportData: {
            reporterName: repName,
            reporterEmail: repEmail,
            subject: repSubject,
            description: repDesc,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowReportModal(false);
        setRepSuccess(true);
        setTimeout(() => setRepSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const theme = portfolio?.themeConfig || {
    primaryColor: '#6366f1',
    backgroundColor: '#090d16',
    textColor: '#f8fafc',
  };

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white"
      style={{ backgroundColor: theme.backgroundColor || '#090d16' }}
    >
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 bg-black/40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-white tracking-tight">{portfolio?.title || 'Portfolio Site'}</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300">
              {subdomain}.saasplatform.com
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApptModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all"
            >
              Book Appointment
            </button>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <StarIcon className="w-3.5 h-3.5" filled />
              <span>Leave Review</span>
            </button>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
            >
              Creator Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {apptSuccess && (
        <div className="max-w-xl mx-auto mt-4 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
          ✓ Appointment request received! The creator will review and confirm your session.
        </div>
      )}
      {reviewSuccess && (
        <div className="max-w-xl mx-auto mt-4 p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold text-center">
          ✓ Thank you! Your review has been submitted for this portfolio website.
        </div>
      )}
      {repSuccess && (
        <div className="max-w-xl mx-auto mt-4 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
          ✓ Your report has been submitted to Platform Super Admins.
        </div>
      )}

      {/* Canvas Drag-and-Drop Rendered Sections */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {sections.map((section) => {
          const content = section.contentData || {};
          const styles = section.styles || {};

          return (
            <section
              key={section.id}
              style={{
                paddingTop: styles.paddingTop || '48px',
                paddingBottom: styles.paddingBottom || '48px',
                textAlign: styles.textAlign || 'left',
              }}
            >
              {/* HERO */}
              {section.moduleType === 'HERO' && (
                <div className="space-y-6">
                  <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                    {content.headline || 'Crafting Digital Experiences'}
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    {content.subheadline || 'Full-stack engineering and product design.'}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                    <button
                      onClick={() => setShowApptModal(true)}
                      className="px-6 py-3 rounded-xl text-xs font-bold text-white shadow-xl hover:scale-105 transition-all"
                      style={{ backgroundColor: theme.primaryColor || '#6366f1' }}
                    >
                      {content.ctaText || 'Book an Appointment'}
                    </button>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="px-6 py-3 rounded-xl text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 transition-all flex items-center gap-1.5"
                    >
                      <StarIcon className="w-4 h-4 text-amber-400" filled />
                      <span>Write a Review</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ABOUT */}
              {section.moduleType === 'ABOUT' && (
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{section.title}</h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">{content.bio}</p>
                </div>
              )}

              {/* EXPERIENCE */}
              {section.moduleType === 'EXPERIENCE' && (
                <div className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{content.heading || 'Work Experience'}</h2>
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-base">{exp.role}</span>
                          <span className="text-xs text-slate-400">{exp.startDate} - {exp.endDate || 'Present'}</span>
                        </div>
                        <div className="text-xs text-indigo-400 font-semibold">{exp.company} {exp.location && `• ${exp.location}`}</div>
                        <p className="text-xs text-slate-300 pt-2 leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BLOG */}
              {section.moduleType === 'BLOG' && (
                <div className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{content.heading || 'Recent Case Studies & Blog'}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {blogs.map((b) => (
                      <div key={b.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                        <h3 className="text-lg font-bold text-white">{b.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{b.summary}</p>
                        <p className="text-xs text-slate-300 pt-2 border-t border-white/5">{b.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* APPOINTMENT */}
              {section.moduleType === 'APPOINTMENT' && (
                <div id="appointment" className="p-8 rounded-3xl bg-indigo-950/20 border border-indigo-500/20 text-center space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{content.heading || 'Schedule an Appointment'}</h2>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Select a date and reserve a 1-on-1 strategy or technical consultation.
                  </p>
                  <button
                    onClick={() => setShowApptModal(true)}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    Open Booking Calendar
                  </button>
                </div>
              )}

              {/* REVIEWS */}
              {section.moduleType === 'REVIEWS' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{content.heading || 'Client Reviews & Ratings'}</h2>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5"
                    >
                      <StarIcon className="w-4 h-4" filled />
                      <span>Write a Review</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex text-amber-400">
                          {[...Array(r.rating || 5)].map((_, i) => (
                            <StarIcon key={i} className="w-4 h-4" filled />
                          ))}
                        </div>
                        <h4 className="font-bold text-white text-sm">&quot;{r.reviewTitle}&quot;</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">&quot;{r.reviewText}&quot;</p>
                        <div className="text-[11px] text-slate-500 pt-2">— {r.clientName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CONTACT */}
              {section.moduleType === 'CONTACT' && (
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">{section.title}</h2>
                  <div className="font-mono text-sm text-indigo-400">{content.email}</div>
                  <div className="pt-3">
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="text-xs text-slate-500 hover:text-slate-400 hover:underline"
                    >
                      Report issue / inquiry to Platform Admin
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </main>

      {/* BOOK APPOINTMENT MODAL */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Book Strategy Appointment</h3>
              <button onClick={() => setShowApptModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleBookAppointment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Lin"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="sarah@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="10:00 AM - 10:45 AM">10:00 AM - 10:45 AM</option>
                    <option value="02:00 PM - 02:45 PM">02:00 PM - 02:45 PM</option>
                    <option value="04:30 PM - 05:15 PM">04:30 PM - 05:15 PM</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Consultation Agenda</label>
                <textarea
                  rows={2}
                  placeholder="What would you like to discuss?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowApptModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAVE REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Rate & Review Website</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddReview} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <StarIcon className="w-6 h-6" filled={s <= rating} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Thorne"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  placeholder="marcus@vc.com"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flawless software delivery"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Feedback</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write your testimonial..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT ISSUE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Report Issue to Platform Admin</h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleReport} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={repEmail}
                  onChange={(e) => setRepEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Appointment booking confirmation question"
                  value={repSubject}
                  onChange={(e) => setRepSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the issue for the Super Admin team..."
                  value={repDesc}
                  onChange={(e) => setRepDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
                >
                  Send Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
