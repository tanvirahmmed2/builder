'use client';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { WebsiteContext } from '@/components/website/context/WebsiteContext';
import { BiCheckCircle, BiRightArrowAlt, BiCompass } from 'react-icons/bi';

export default function StoreServicesPage() {
  const { website } = useContext(WebsiteContext) || {};
  const params = useParams();
  const domain = params?.domain || '';
  const basePrefix = domain ? `/${domain}` : '';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchServices() {
      try {
        const res = await axios.get(`/api/${domain}/home/catalog?type=portfolio`);
        if (res.data?.success && isMounted) {
          setServices(res.data.data.services || []);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain) fetchServices();
    return () => {
      isMounted = false;
    };
  }, [domain]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Capabilities</span>
        <h1 className="text-4xl font-extrabold text-white">Services & Solutions</h1>
        <p className="text-sm text-slate-400">
          Tailored offerings designed to scale your operations and drive measurable outcomes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {services.length > 0 ? (
          services.map((srv) => (
            <div
              key={srv.id}
              className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/40 p-6 hover:bg-slate-900/80 transition-all hover:border-blue-500/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 mb-4 border border-blue-500/20">
                <BiCompass className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white">{srv.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed flex-1">
                {srv.summary || srv.description || 'Specialized service engineered to exceed benchmarks.'}
              </p>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Starting from</span>
                  <div className="text-lg font-bold text-white">${Number(srv.starting_price || 0).toFixed(2)}</div>
                </div>
                <Link
                  href={`${basePrefix}/contacts?service=${srv.slug || srv.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  <span>Inquire</span>
                  <BiRightArrowAlt />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500">
            <BiCompass className="mx-auto text-4xl mb-2" />
            <p>No standalone services listed. Check out our catalog for products.</p>
          </div>
        )}
      </div>
    </div>
  );
}

