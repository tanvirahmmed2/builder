'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import LiveChatForm from '@/components/admin/forms/LiveChatForm';

export default function AdminLiveChatsPage() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=live_chats');
      const data = await res.json();
      if (data.success) {
        setChats(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <AdminTableLayout
      title="Live Chat Sessions"
      subtitle="Real-time support and engagement streams with portfolio creators and visitors."
      badgeText="Live Chat"
      badgeColor="primary"
      tableName="live_chats"
      records={chats}
      loading={loading}
      onRefresh={fetchChats}
      FormComponent={LiveChatForm}
      searchPlaceholder="Search by visitor name, email, or session..."
      filterPredicate={(chat, q) =>
        chat.visitor_name?.toLowerCase().includes(q) ||
        chat.visitor_email?.toLowerCase().includes(q) ||
        chat.session_id?.toLowerCase().includes(q)
      }
      columns={['ID', 'Visitor Name', 'Email Address', 'Session Token', 'Status', 'IP Address', 'Started At']}
      renderRow={(chat) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{chat.id}</td>
          <td className="px-4 py-3 font-bold text-slate-800">{chat.visitor_name}</td>
          <td className="px-4 py-3 font-mono text-slate-600">{chat.visitor_email || '—'}</td>
          <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{chat.session_id}</td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                chat.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : chat.status === 'OPEN'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {chat.status}
            </span>
          </td>
          <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{chat.ip_address || '—'}</td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {chat.created_at ? new Date(chat.created_at).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    />
  );
}
