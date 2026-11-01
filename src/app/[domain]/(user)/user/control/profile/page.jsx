'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { BiUser, BiEnvelope, BiPhone, BiMap } from 'react-icons/bi';

export default function CustomerProfilePage() {
  const params = useParams();
  const domain = params?.domain || '';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchMe() {
      try {
        const res = await axios.get(`/api/${domain}/user/auth/me`);
        if (res.data?.success && isMounted) {
          setProfile(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (domain) fetchMe();
    return () => {
      isMounted = false;
    };
  }, [domain]);

  const user = profile?.user;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Profile & Credentials</h1>
        <p className="text-xs text-slate-400 mt-1">Review your contact information and shipping defaults.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
            {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {user?.first_name} {user?.last_name}
            </h3>
            <p className="text-xs text-slate-400">Verified Customer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <BiEnvelope className="text-lg text-blue-400" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-500">Email</p>
              <p className="text-xs text-slate-200">{user?.email || 'None'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BiPhone className="text-lg text-blue-400" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-500">Phone</p>
              <p className="text-xs text-slate-200">{user?.phone || 'None'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

