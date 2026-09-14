'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import SupportMessageForm from '@/components/admin/forms/SupportMessageForm';

export default function AdminSupportMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=support_messages');
      const data = await res.json();
      if (data.success) {
        setMessages(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <AdminTableLayout
      title="Support Ticket Messages"
      subtitle="Communication log and thread responses on customer support tickets."
      badgeText="Support Message"
      badgeColor="secondary"
      tableName="support_messages"
      records={messages}
      loading={loading}
      onRefresh={fetchMessages}
      FormComponent={SupportMessageForm}
      searchPlaceholder="Search messages by ticket ID, author, or content..."
      filterPredicate={(msg, q) =>
        String(msg.support_id).includes(q) ||
        msg.sender_name?.toLowerCase().includes(q) ||
        msg.message?.toLowerCase().includes(q)
      }
      columns={['ID', 'Ticket ID', 'Sender Type', 'Sender Name', 'Message Content', 'Timestamp']}
      renderRow={(msg) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{msg.id}</td>
          <td className="px-4 py-3 font-bold text-slate-800">Ticket #{msg.support_id}</td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                msg.sender_type === 'ADMIN'
                  ? 'bg-secondary/10 text-secondary border border-secondary/20'
                  : 'bg-primary/15 text-primary border border-primary/20'
              }`}
            >
              {msg.sender_type}
            </span>
          </td>
          <td className="px-4 py-3 font-semibold text-slate-700">{msg.sender_name}</td>
          <td className="px-4 py-3 text-slate-600 max-w-md truncate">{msg.message}</td>
          <td className="px-4 py-3 text-slate-500 text-[11px]">
            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : '—'}
          </td>
        </>
      )}
    />
  );
}
