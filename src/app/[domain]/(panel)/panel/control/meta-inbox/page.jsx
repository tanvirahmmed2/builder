'use client';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Context } from '@/components/helper/Context';
import { 
  BiMessageRoundedDots, 
  BiSend, 
  BiLoaderAlt, 
  BiUser, 
  BiCheckDouble, 
  BiX
} from 'react-icons/bi';

export default function MetaInboxControlPage() {
  const params = useParams();
  const domain = params?.domain || '';
  const basePath = domain ? `/${domain}/panel/control` : '/panel/control';

  const { dashSidebar } = useContext(Context);

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/meta-inbox');
      const list = Array.isArray(res.data) ? res.data : [];
      setConversations(list);
      if (list.length > 0 && !activeConv) {
        setActiveConv(list[0]);
      }
    } catch (err) {
      console.error('Fetch meta inbox error:', err);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await axios.get(`/api/meta-inbox?conversation_id=${convId}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
    }
  }, [activeConv]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await axios.post('/api/meta-inbox', {
        conversation_id: activeConv.id,
        content: replyText.trim(),
        sender_type: 'staff'
      });
      setMessages([...messages, res.data.message]);
      setReplyText('');
    } catch (err) {
      toast.error('Failed to deliver message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`w-full min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8 transition-all duration-300 ${dashSidebar ? 'lg:pl-64' : 'lg:pl-8'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-blue-500/20">
              <BiMessageRoundedDots />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Omnichannel & Social Inbox</h1>
              <p className="text-xs text-slate-500 mt-0.5">Centralized inbox for Facebook Messenger, Instagram DM, and WhatsApp customer chats</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
            <BiLoaderAlt className="animate-spin text-3xl text-blue-500 mb-2" />
            <span className="text-xs font-semibold text-slate-500">Connecting social channels...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
            <BiMessageRoundedDots className="text-4xl text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No active conversations</h3>
            <p className="text-xs text-slate-400 mt-1">Incoming Facebook, Instagram, and WhatsApp messages will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 h-[650px] flex overflow-hidden shadow-sm">
            
            {/* Conversation List */}
            <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
              <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-700">
                Inbox Threads ({conversations.length})
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {conversations.map(c => {
                  const isSelected = activeConv?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveConv(c)}
                      className={`p-4 cursor-pointer transition flex items-start gap-3 ${
                        isSelected ? 'bg-white border-l-4 border-l-blue-500 shadow-xs' : 'hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {c.contact_name?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-800 text-xs truncate">{c.contact_name || 'Customer'}</h4>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">{c.platform || 'Meta'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">{c.contact_phone || 'Online Guest'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{activeConv?.contact_name || 'Customer Chat'}</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Platform: {activeConv?.platform || 'Direct'}</span>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-slate-50/30">
                {messages.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 mt-10">No messages exchanged yet</div>
                ) : (
                  messages.map(m => {
                    const isStaff = m.sender_type === 'staff';
                    return (
                      <div key={m.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isStaff ? 'bg-blue-600 text-white rounded-br-xs' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                        }`}>
                          <p>{m.content}</p>
                          <div className={`text-[9px] mt-1 flex items-center gap-1 ${isStaff ? 'text-blue-200 justify-end' : 'text-slate-400'}`}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isStaff && <BiCheckDouble className="text-xs" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type reply message..."
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <BiSend className="text-base" /> Send
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

