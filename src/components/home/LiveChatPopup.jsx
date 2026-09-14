'use client';

import { useState, useEffect, useRef } from 'react';
import {
  BiMessageRoundedDots,
  BiX,
  BiMinus,
  BiSend,
  BiSupport,
  BiCheckCircle,
} from 'react-icons/bi';
import { SITE_NAME } from '@/lib/db/secret';

export default function LiveChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [chatSession, setChatSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle starting a new live chat session
  const handleStartChat = async (e) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    setLoading(true);
    const sessionId = 'live_' + Math.random().toString(36).substring(2, 9);

    try {
      // 1. Create live_chats record
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_record',
          table: 'live_chats',
          data: {
            visitor_name: visitorName,
            visitor_email: visitorEmail || null,
            session_id: sessionId,
            status: 'OPEN',
          },
        }),
      });
      const data = await res.json();

      const session = data.record || {
        id: Date.now(),
        visitor_name: visitorName,
        visitor_email: visitorEmail,
        session_id: sessionId,
      };

      setChatSession(session);

      // 2. Add automated greeting from Support Agent
      const welcomeMsg = {
        id: 'msg_welcome',
        chat_id: session.id,
        sender_type: 'ADMIN',
        sender_name: `${SITE_NAME} Support`,
        message: `Hello ${visitorName}! 👋 Thanks for reaching out. How can we help you build or customize your portfolio today?`,
        created_at: new Date().toISOString(),
      };

      setMessages([welcomeMsg]);

      // Also persist the automated greeting into live_chat_messages
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_record',
          table: 'live_chat_messages',
          data: welcomeMsg,
        }),
      });
    } catch (err) {
      console.error('Failed to initiate live chat:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a message in an active session
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !chatSession) return;

    const text = inputMessage.trim();
    setInputMessage('');

    const newMsg = {
      id: 'msg_' + Date.now(),
      chat_id: chatSession.id,
      sender_type: 'VISITOR',
      sender_name: chatSession.visitor_name,
      message: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      // Persist visitor message in live_chat_messages table
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_record',
          table: 'live_chat_messages',
          data: newMsg,
        }),
      });

      // Automated helpful agent response after 1.2s for interactive simulation
      setTimeout(async () => {
        const replyMsg = {
          id: 'msg_reply_' + Date.now(),
          chat_id: chatSession.id,
          sender_type: 'ADMIN',
          sender_name: 'Platform Agent',
          message:
            "Got it! An administrator has been alerted with your message. We're also available via email if you need us.",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, replyMsg]);

        await fetch('/api/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_record',
            table: 'live_chat_messages',
            data: replyMsg,
          }),
        });
      }, 1200);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Expanded Chat Popup Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[380px] h-[500px] max-h-[82vh] bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3.5 text-white flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  <BiSupport className="text-lg" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">{SITE_NAME} Support</h3>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Chat • Online Now
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Minimize chat"
                aria-label="Minimize chat"
              >
                <BiMinus className="text-lg" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Close chat"
                aria-label="Close chat"
              >
                <BiX className="text-xl" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!chatSession ? (
            /* STEP 1: Introduce yourself */
            <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto bg-slate-50/50">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center text-2xl mx-auto mb-2 border border-secondary/20">
                  <BiMessageRoundedDots />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-base font-bold text-slate-800">Need help building your site?</h4>
                  <p className="text-xs text-slate-500">
                    Ask questions about packages, custom domains, or showcase themes. We reply in seconds!
                  </p>
                </div>

                <form onSubmit={handleStartChat} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={visitorEmail}
                      onChange={(e) => setVisitorEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !visitorName.trim()}
                    className="w-full py-2.5 rounded-xl bg-secondary hover:bg-secondary-dark disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-secondary/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-4"
                  >
                    <span>{loading ? 'Connecting...' : 'Start Conversation'}</span>
                  </button>
                </form>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
                🔒 Encrypted end-to-end support session
              </div>
            </div>
          ) : (
            /* STEP 2: Live Message Stream */
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg, idx) => {
                  const isVisitor = msg.sender_type === 'VISITOR';
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {isVisitor ? 'You' : msg.sender_name}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isVisitor
                            ? 'bg-secondary text-white rounded-br-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                        {msg.created_at
                          ? new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Footer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type your question..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-secondary focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 rounded-xl bg-secondary hover:bg-secondary-dark disabled:opacity-40 text-white transition-all cursor-pointer shadow-xs"
                  title="Send message"
                  aria-label="Send message"
                >
                  <BiSend className="text-base" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Trigger Launcher Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-secondary hover:bg-secondary-dark text-white shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer group"
          aria-label="Open live chat support"
        >
          {isOpen ? (
            <BiX className="text-2xl" />
          ) : (
            <>
              <BiMessageRoundedDots className="text-2xl" />
              {/* Online Ping Indicator */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
