'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import { BiChevronDown, BiHelpCircle } from 'react-icons/bi';

export default function StoreFaqsPage() {
  const { website } = useContext(WebsiteContext) || {};
  const params = useParams();
  const domain = params?.domain || '';

  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchFaqs() {
      try {
        const res = await axios.get(`/api/${domain}/home/faqs`);
        if (res.data?.success && isMounted) {
          setFaqs(res.data.data.faqs || []);
          setCategories(res.data.data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain) fetchFaqs();
    return () => {
      isMounted = false;
    };
  }, [domain]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Help Center</span>
        <h1 className="text-4xl font-extrabold text-white">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-400">
          Everything you need to know about our products, billing, delivery, and services.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.length > 0 ? (
          faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-white hover:text-blue-400 transition-colors"
                >
                  <span className="text-base">{faq.question}</span>
                  <BiChevronDown
                    className={`text-xl text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-12 text-center text-slate-500">
            <BiHelpCircle className="mx-auto text-4xl mb-2 text-slate-600" />
            <p>No questions published yet. Feel free to contact our support team directly.</p>
          </div>
        )}
      </div>
    </div>
  );
}

