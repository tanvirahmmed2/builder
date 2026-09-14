'use client';

import { useState, useEffect } from 'react';
import AdminTableLayout from '@/components/admin/AdminTableLayout';
import LiveChatMessageForm from '@/components/admin/forms/LiveChatMessageForm';

export default function AdminLiveChatMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin?table=live_chat_messages');
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
      title="Live Chat Messages"
      subtitle="Audit transcript log of conversations across live chat sessions."
      badgeText="Live Chat Message"
      badgeColor="secondary"
      tableName="live_chat_messages"
      records={messages}
      loading={loading}
      onRefresh={fetchMessages}
      FormComponent={LiveChatMessageForm}
      searchPlaceholder="Search messages by sender or body..."
      filterPredicate={(msg, q) =>
        msg.sender_name?.toLowerCase().includes(q) ||
        msg.message?.toLowerCase().includes(q) ||
        String(msg.chat_id).includes(q)
      }
      columns={['ID', 'Chat ID', 'Sender Type', 'Sender Name', 'Message Snippet', 'Sent At']}
      renderRow={(msg) => (
        <>
          <td className="px-4 py-3 font-mono font-bold text-slate-500">#{msg.id}</td>
          <td className="px-4 py-3 font-bold text-slate-800">Chat #{msg.chat_id}</td>
          <td className="px-4 py-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                msg.sender_type === 'ADMIN'
                  ? 'bg-secondary/10 text-secondary border border-secondary/20'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
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
