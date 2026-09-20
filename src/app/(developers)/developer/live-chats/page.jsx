'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BiSearch,
  BiRefresh,
  BiTrash,
  BiSend,
  BiSupport,
  BiUser,
  BiCheckCircle,
  BiTimeFive,
  BiLoaderAlt,
  BiChevronRight,
} from 'react-icons/bi';

export default function AdminLiveChatsPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch all chat sessions
  const fetchChats = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoadingChats(true);
      const res = await fetch('/api/developer/live_chats');
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        setChats(data.records);
        // If a chat is selected, refresh its details
        if (selectedChat) {
          const updated = data.records.find((c) => c.id === selectedChat.id);
          if (updated) setSelectedChat((prev) => ({ ...prev, ...updated }));
        }
      }
    } catch (e) {
      console.error('Failed to fetch live chats:', e);
    } finally {
      if (!silent) setLoadingChats(false);
    }
  }, [selectedChat]);

  useEffect(() => {
    fetchChats();
  }, []);

  // Fetch messages for selected chat
  const fetchMessages = useCallback(async (chatId, silent = false) => {
    if (!chatId) return;
    try {
      if (!silent) setLoadingMessages(true);
      const res = await fetch(`/api/developer/live_chats?chatId=${chatId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        if (data.chat) {
          setSelectedChat(data.chat);
        }
      }
    } catch (err) {
      console.error('Error fetching messages for chat:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  // Background polling every 3.5s for live message updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChats(true);
      if (selectedChat?.id) {
        fetchMessages(selectedChat.id, true);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [selectedChat?.id, fetchChats, fetchMessages]);

  // Staff sends reply to visitor
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedChat?.id || sendingReply) return;

    const text = replyMessage.trim();
    setReplyMessage('');
    setSendingReply(true);

    try {
      const res = await fetch('/api/developer/live_chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat.id,
          message: text,
        }),
      });
      const data = await res.json();
      if (data.success && data.record) {
        setMessages((prev) => [...prev, data.record]);
        fetchChats(true);
      } else {
        alert(data.error || 'Failed to send reply.');
      }
    } catch (err) {
      console.error('Error sending staff reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  // Update status (e.g. OPEN, ACTIVE, RESOLVED, CLOSED)
  const handleStatusChange = async (newStatus) => {
    if (!selectedChat?.id) return;
    try {
      const res = await fetch('/api/developer/live_chats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedChat.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedChat((prev) => ({ ...prev, status: newStatus }));
        fetchChats(true);
      }
    } catch (err) {
      console.error('Failed to update chat status:', err);
    }
  };

  // Delete chat
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this live chat session? All message history will be removed.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/developer/live_chats?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        if (selectedChat?.id === id) {
          setSelectedChat(null);
          setMessages([]);
        }
        fetchChats();
      } else {
        alert(data.error || 'Failed to delete chat.');
      }
    } catch (err) {
      console.error('Delete chat error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter chats by search and status
  const filteredChats = chats.filter((chat) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      String(chat.status).toUpperCase() === statusFilter;
    if (!matchesStatus) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      chat.visitor_name?.toLowerCase().includes(q) ||
      chat.visitor_email?.toLowerCase().includes(q) ||
      chat.session_id?.toLowerCase().includes(q) ||
      chat.last_message?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Live Chat Workspace</h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Admin • Manager • Support
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time live chat conversations between home page visitors and platform staff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchChats(false)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            title="Refresh conversations"
          >
            <BiRefresh className="text-base" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Two-Panel Chat Workspace */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] max-h-[750px]">
        {/* Left Column: Chat Sessions List (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search and Filters */}
          <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
            <div className="relative">
              <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search visitor, email, message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              {['ALL', 'OPEN', 'ACTIVE', 'RESOLVED', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white font-bold'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingChats && chats.length === 0 ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <BiLoaderAlt className="animate-spin text-2xl text-slate-600" />
                <span className="text-xs">Loading conversations...</span>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No conversations found matching criteria.
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = selectedChat?.id === chat.id;
                const status = String(chat.status || 'OPEN').toUpperCase();
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`p-3.5 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                        : 'hover:bg-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {chat.visitor_name?.charAt(0)?.toUpperCase() || 'V'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {chat.visitor_name}
                        </h4>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                            status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : status === 'OPEN'
                              ? 'bg-blue-100 text-blue-700'
                              : status === 'RESOLVED'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mb-1">
                        {chat.last_message || 'No messages yet'}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{chat.visitor_email || 'No email provided'}</span>
                        <span>
                          {chat.last_message_at
                            ? new Date(chat.last_message_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : chat.created_at
                            ? new Date(chat.created_at).toLocaleDateString()
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Thread (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white">
          {!selectedChat ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center text-3xl mb-3">
                <BiSupport />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">Select a Conversation</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Choose an active or incoming chat session from the left to view the visitor thread and reply in real-time.
              </p>
            </div>
          ) : (
            /* Active Chat Thread */
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {selectedChat.visitor_name?.charAt(0)?.toUpperCase() || 'V'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {selectedChat.visitor_name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        #{selectedChat.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span>{selectedChat.visitor_email || 'Guest Visitor'}</span>
                      {selectedChat.ip_address && (
                        <span>• IP: {selectedChat.ip_address}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Dropdown */}
                  <select
                    value={selectedChat.status || 'OPEN'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-slate-800 cursor-pointer"
                  >
                    <option value="OPEN">Status: OPEN</option>
                    <option value="ACTIVE">Status: ACTIVE</option>
                    <option value="RESOLVED">Status: RESOLVED</option>
                    <option value="CLOSED">Status: CLOSED</option>
                  </select>

                  <button
                    type="button"
                    disabled={deletingId === selectedChat.id}
                    onClick={() => handleDelete(selectedChat.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete conversation"
                  >
                    <BiTrash className="text-base" />
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                    <BiLoaderAlt className="animate-spin text-xl text-slate-600" />
                    <span className="text-xs">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    No messages in this chat yet.
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isStaff = msg.sender_type === 'ADMIN';
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[11px] font-bold text-slate-600">
                            {msg.sender_name}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {msg.created_at
                              ? new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>

                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isStaff
                              ? 'bg-slate-900 text-white rounded-br-xs'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Box */}
              <form
                onSubmit={handleSendReply}
                className="p-4 border-t border-slate-200 bg-white flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder={`Reply to ${selectedChat.visitor_name}...`}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white transition-colors"
                />

                <button
                  type="submit"
                  disabled={!replyMessage.trim() || sendingReply}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {sendingReply ? (
                    <>
                      <BiLoaderAlt className="animate-spin text-sm" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Reply</span>
                      <BiSend className="text-sm" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
