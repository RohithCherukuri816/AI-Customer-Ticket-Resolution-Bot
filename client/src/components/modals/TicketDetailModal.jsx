import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  CheckCircle,
  Star,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { StatusBadge, PriorityBadge, TierBadge, SentimentBadge } from '../common/TicketBadge';

export const TicketDetailModal = ({ ticketId, onClose, onTicketUpdated }) => {
  const { user, socket } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotSummary, setCopilotSummary] = useState('');
  const [csatRating, setCsatRating] = useState(5);
  const [csatFeedback, setCsatFeedback] = useState('');
  const [csatSubmitted, setCsatSubmitted] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch ticket details & messages
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketRes, messagesRes] = await Promise.all([
        API.get(`/tickets/${ticketId}`),
        API.get(`/tickets/${ticketId}/messages`),
      ]);

      if (ticketRes.data.success) {
        setTicket(ticketRes.data.data);
      }
      if (messagesRes.data.success) {
        setMessages(messagesRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching ticket data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchData();
    }
  }, [ticketId]);

  // Join ticket socket room for real-time updates
  useEffect(() => {
    if (!socket || !ticketId) return;

    socket.emit('join_ticket', ticketId);

    const handleNewMessage = (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
      scrollToBottom();
    };

    const handleTicketUpdated = (updated) => {
      setTicket(updated);
      onTicketUpdated?.(updated);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('ticket_updated', handleTicketUpdated);

    return () => {
      socket.emit('leave_ticket', ticketId);
      socket.off('new_message', handleNewMessage);
      socket.off('ticket_updated', handleTicketUpdated);
    };
  }, [socket, ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    try {
      const { data } = await API.post(`/tickets/${ticketId}/messages`, {
        text: replyText.trim(),
      });

      if (data.success) {
        setReplyText('');
      }
    } catch (err) {
      alert('Error sending message: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  // Update status (e.g. resolve)
  const handleUpdateStatus = async (status) => {
    try {
      const { data } = await API.patch(`/tickets/${ticketId}`, { status });
      if (data.success) {
        setTicket(data.data);
        onTicketUpdated?.(data.data);
      }
    } catch (err) {
      alert('Error updating ticket: ' + (err.response?.data?.message || err.message));
    }
  };

  // Assign to me
  const handleAssignToMe = async () => {
    try {
      const { data } = await API.post(`/tickets/${ticketId}/assign`, { agentId: user.id });
      if (data.success) {
        setTicket(data.data);
        onTicketUpdated?.(data.data);
      }
    } catch (err) {
      alert('Error assigning ticket: ' + (err.response?.data?.message || err.message));
    }
  };

  // Copilot: Generate AI Reply Draft
  const handleAiCopilotDraft = async (tone = 'professional') => {
    setCopilotLoading(true);
    try {
      const { data } = await API.post(`/tickets/${ticketId}/ai-copilot`, {
        action: 'draft_reply',
        tone,
      });

      if (data.success) {
        setReplyText(data.result);
      }
    } catch (err) {
      alert('AI Copilot error: ' + (err.response?.data?.message || err.message));
    } finally {
      setCopilotLoading(false);
    }
  };

  // Copilot: Summarize Thread
  const handleAiCopilotSummarize = async () => {
    setCopilotLoading(true);
    try {
      const { data } = await API.post(`/tickets/${ticketId}/ai-copilot`, {
        action: 'summarize',
      });

      if (data.success) {
        setCopilotSummary(data.result);
      }
    } catch (err) {
      alert('Summary error: ' + (err.response?.data?.message || err.message));
    } finally {
      setCopilotLoading(false);
    }
  };

  // Submit CSAT
  const handleSubmitCsat = async () => {
    try {
      const { data } = await API.post(`/tickets/${ticketId}/csat`, {
        score: csatRating,
        feedback: csatFeedback,
      });

      if (data.success) {
        setCsatSubmitted(true);
        setTicket(data.data);
        onTicketUpdated?.(data.data);
      }
    } catch (err) {
      alert('CSAT submit failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!ticketId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white text-indigo-700 font-bold border border-slate-200 shadow-2xs">
              {ticket?.ticketNumber || '...'}
            </span>
            <div className="truncate max-w-md">
              <h2 className="text-base font-bold text-slate-900 truncate">{ticket?.title}</h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span>Customer: <strong className="text-slate-700">{ticket?.customer?.name}</strong></span>
                <span>•</span>
                <span>{new Date(ticket?.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <StatusBadge status={ticket?.status || 'open'} />
            <PriorityBadge priority={ticket?.priority || 'medium'} />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Messages Thread & Reply Box */}
          <div className="flex-1 flex flex-col border-r border-slate-200 bg-slate-50/40">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading ticket thread...
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isAi = msg.senderType === 'ai_bot';
                    const isAgent = msg.senderType === 'agent';
                    const isCustomer = msg.senderType === 'customer';

                    return (
                      <div
                        key={msg._id || index}
                        className={`flex gap-3 max-w-[85%] ${
                          isCustomer ? 'mr-auto' : isAgent ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0 mt-1">
                          {isAi ? (
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                              <Bot className="w-4 h-4" />
                            </div>
                          ) : (
                            <img
                              src={msg.sender?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderName}`}
                              alt={msg.senderName}
                              className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-2xs"
                            />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                            isAi
                              ? 'bg-indigo-50/80 border border-indigo-200 text-slate-800'
                              : isAgent
                              ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1.5 text-[11px]">
                            <span className="font-semibold flex items-center gap-1.5">
                              {msg.senderName}
                              {isAi && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200 font-mono">
                                  AI Resolution Bot
                                </span>
                              )}
                              {isAgent && (
                                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded font-mono">
                                  Staff Agent
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] opacity-70">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="whitespace-pre-wrap">{msg.text}</div>

                          {/* Quick action buttons if provided by AI message */}
                          {msg.suggestedActions && msg.suggestedActions.length > 0 && ticket?.status !== 'resolved' && (
                            <div className="mt-3 pt-2.5 border-t border-indigo-200 flex flex-wrap gap-2">
                              {msg.suggestedActions.map((action, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleUpdateStatus(action.action === 'resolve' ? 'resolved' : 'in_progress')}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 transition shadow-2xs"
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Customer CSAT Rating Box if resolved */}
            {ticket?.status === 'resolved' && user?.role === 'customer' && !ticket?.csatScore && !csatSubmitted && (
              <div className="p-4 mx-4 mb-2 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                <div className="flex items-center gap-2 text-amber-800 font-semibold mb-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>How satisfied were you with this resolution?</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setCsatRating(star)}
                      className={`p-1.5 rounded-lg border transition ${
                        csatRating >= star
                          ? 'border-amber-400 bg-amber-100 text-amber-700'
                          : 'border-slate-200 bg-white text-slate-400'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${csatRating >= star ? 'fill-amber-500' : ''}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-800">{csatRating} / 5 Stars</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={csatFeedback}
                    onChange={(e) => setCsatFeedback(e.target.value)}
                    placeholder="Optional feedback: Was the AI / Agent helpful?"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800"
                  />
                  <button
                    onClick={handleSubmitCsat}
                    className="animated-btn px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
                  >
                    Submit Rating
                  </button>
                </div>
              </div>
            )}

            {/* Reply Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response or click an AI Copilot prompt on the right..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="animated-btn flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Right Column: AI Insights & Agent Copilot Workbench */}
          <div className="w-80 sm:w-96 p-5 overflow-y-auto space-y-5 bg-slate-50/70 border-l border-slate-200">
            {/* Quick Actions Bar */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Ticket Controls
              </span>
              <div className="flex flex-wrap gap-2">
                {ticket?.status !== 'resolved' ? (
                  <button
                    onClick={() => handleUpdateStatus('resolved')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition shadow-2xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus('in_progress')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-Open Ticket
                  </button>
                )}

                {user?.role !== 'customer' && !ticket?.assignedAgent && (
                  <button
                    onClick={handleAssignToMe}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition shadow-2xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Assign to Me
                  </button>
                )}
              </div>
            </div>

            {/* AI Triage Intelligence Card */}
            <div className="p-4 rounded-xl bg-white border border-indigo-100 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-600" /> AI Triage Intelligence
                </span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {((ticket?.aiConfidence || 0.88) * 100).toFixed(0)}% Conf
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Predicted Category:</span>
                  <span className="font-semibold text-slate-800">{ticket?.category}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Resolution Tier:</span>
                  <TierBadge tier={ticket?.tier} />
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Customer Sentiment:</span>
                  <SentimentBadge sentiment={ticket?.aiSentiment} />
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Resolution Status:</span>
                  <span className="capitalize font-mono text-indigo-700 font-medium">
                    {ticket?.aiResolutionStatus?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Agent AI Copilot Actions */}
            {user?.role !== 'customer' && (
              <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" /> Agent AI Copilot
                  </span>
                  {copilotLoading && (
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleAiCopilotDraft('professional')}
                    disabled={copilotLoading}
                    className="w-full text-left p-2.5 rounded-lg bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200 text-xs font-semibold text-indigo-700 flex items-center justify-between transition"
                  >
                    <span>✨ Generate Draft from Knowledge Base</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAiCopilotDraft('empathetic')}
                      disabled={copilotLoading}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 text-center transition"
                    >
                      💖 Empathetic Tone
                    </button>
                    <button
                      onClick={() => handleAiCopilotDraft('concise')}
                      disabled={copilotLoading}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700 text-center transition"
                    >
                      ⚡ Concise Tone
                    </button>
                  </div>

                  <button
                    onClick={handleAiCopilotSummarize}
                    disabled={copilotLoading}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 flex items-center justify-between transition"
                  >
                    <span>📝 Summarize Ticket History</span>
                  </button>
                </div>

                {copilotSummary && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-indigo-200 text-[11px] text-slate-700 leading-relaxed">
                    <div className="flex justify-between items-center mb-1 text-indigo-700 font-bold">
                      <span>Executive Summary</span>
                      <button onClick={() => setCopilotSummary('')}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap">{copilotSummary}</div>
                  </div>
                )}
              </div>
            )}

            {/* Matched Knowledge Base Articles (RAG) */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Matched RAG Articles
              </span>
              <div className="space-y-2">
                {ticket?.aiMatchedArticles && ticket.aiMatchedArticles.length > 0 ? (
                  ticket.aiMatchedArticles.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition text-xs space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span className="truncate pr-2">{m.title}</span>
                        <span className="text-[10px] text-emerald-600 font-mono font-bold">
                          {((m.score || 0.8) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Semantic match utilized in AI auto-triage.</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-400 text-center">
                    No articles matched for this query.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
