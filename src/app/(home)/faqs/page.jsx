'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BiChevronDown,
  BiSearch,
  BiHelpCircle,
  BiMessageRoundedDots,
  BiEnvelope,
  BiLoaderAlt,
} from 'react-icons/bi';

export default function FaqsPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(0); // first item open by default

  useEffect(() => {
    async function loadFaqs() {
      try {
        setLoading(true);
        const res = await fetch('/api/faqs');
        const data = await res.json();
        if (data.success && Array.isArray(data.faqs)) {
          setFaqs(data.faqs);
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFaqs();
  }, []);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const filteredFaqs = faqs.filter((faq) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      faq.question?.toLowerCase().includes(term) ||
      faq.answer?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
         
          <h1 className="text-3xl sm:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about building, launching, and managing your portfolio websites, custom domains, and creator tools.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative">
              <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
              <input
                type="text"
                placeholder="Search any question or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm shadow-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* FAQs Accordion Section */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
            <BiLoaderAlt className="animate-spin text-3xl text-primary" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Loading answers for you...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-2xl">
              <BiSearch />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">No matching questions found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              We couldn&apos;t find an answer matching &ldquo;{searchTerm}&rdquo;. Feel free to reach out to our team directly!
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-xs text-primary hover:underline font-semibold cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl transition-all duration-200 overflow-hidden shadow-xs ${
                    isOpen
                      ? 'border-primary/40 dark:border-primary/50 ring-1 ring-primary/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen ? 'bg-primary text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <BiChevronDown className="text-xl" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Still Have Questions CTA Banner */}
        <div className="bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Still have questions?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Can&apos;t find the answer you&apos;re looking for? Our friendly support engineering team is available 24/7 to help you succeed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-slate-900 hover:bg-primary-light font-semibold text-xs transition-all shadow-md"
            >
              <BiEnvelope className="text-base" />
              <span>Contact Support</span>
            </Link>
            <Link
              href="/creator/login"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-all"
            >
              <BiMessageRoundedDots className="text-base" />
              <span>Creator Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
