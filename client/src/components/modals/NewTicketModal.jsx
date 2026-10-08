import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { X, Sparkles, Send, Bot, CheckCircle2, BookOpen } from 'lucide-react';

export const NewTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Debounced real-time AI triage preview as user types
  useEffect(() => {
    if (!title && !description) {
      setAiPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsAnalyzing(true);
        const { data } = await API.post('/tickets/preview-ai', { title, description });
        if (data.success && data.preview) {
          setAiPreview(data.preview);
        }
      } catch (err) {
        console.error('Preview error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [title, description]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await API.post('/tickets', {
        title,
        description,
        priority,
      });

      if (data.success) {
        onTicketCreated(data.data);
        setTitle('');
        setDescription('');
        setAiPreview(null);
        onClose();
      }
    } catch (err) {
      alert('Error creating ticket: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Open Support Ticket
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  AI Auto-Triage
                </span>
              </h2>
              <p className="text-xs text-slate-500">Describe your inquiry. ResolvAI will analyze and attempt immediate resolution.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <form id="new-ticket-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ticket Title / Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cannot reset password, link expired"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe your issue with error codes or context..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              ></textarea>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Initial Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="low">Low (General guidance)</option>
                  <option value="medium">Medium (Standard request)</option>
                  <option value="high">High (Impacting workflow)</option>
                  <option value="urgent">Urgent (Production broken)</option>
                </select>
              </div>
            </div>
          </form>

          {/* Real-time AI Triage Card */}
          {aiPreview && (
            <div className="rounded-xl bg-indigo-50/60 border border-indigo-200 p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-indigo-700 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span>Real-Time AI Pre-Triage Prediction:</span>
                </div>
                {isAnalyzing && <span className="text-[11px] text-indigo-600 animate-pulse">Analyzing...</span>}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
                  <div className="text-[10px] text-slate-500">Category</div>
                  <div className="font-semibold text-indigo-900 truncate">{aiPreview.category}</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
                  <div className="text-[10px] text-slate-500">Confidence</div>
                  <div className="font-semibold text-emerald-600">{(aiPreview.confidence * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
                  <div className="text-[10px] text-slate-500">Detected Urgency</div>
                  <div className="font-semibold text-amber-600 capitalize">{aiPreview.urgency}</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
                  <div className="text-[10px] text-slate-500">Resolution Tier</div>
                  <div className="font-semibold text-purple-600 capitalize">{aiPreview.tier.replace('_', ' ')}</div>
                </div>
              </div>

              {/* Immediate Knowledge Deflection suggestion if available */}
              {aiPreview.matchedArticles && aiPreview.matchedArticles.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-indigo-200 text-xs shadow-2xs">
                  <div className="flex items-center gap-1.5 text-indigo-800 font-semibold mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Instant AI Deflection Match:</span>
                  </div>
                  <p className="text-slate-700 text-[11px]">
                    Article: <strong className="text-slate-900">{aiPreview.matchedArticles[0].title}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {aiPreview.autoResolveEligible
                      ? 'This ticket is eligible for Instant AI Auto-Resolution upon submission!'
                      : 'AI will post suggested steps immediately while an agent assists.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Powered by ResolvAI RAG & Multi-Class Classifier
          </p>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-ticket-form"
              disabled={submitting || !title.trim() || !description.trim()}
              className="animated-btn flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition duration-150"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting & Triage...' : 'Submit Ticket'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
