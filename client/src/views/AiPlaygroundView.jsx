import React, { useState } from 'react';
import API from '../services/api';
import { Cpu, Sparkles, Bot, CheckCircle2, RefreshCw, Terminal, Layers } from 'lucide-react';

export const AiPlaygroundView = () => {
  const [subject, setSubject] = useState('Payment failed but card charged twice');
  const [description, setDescription] = useState(
    'I tried renewing my annual plan with Mastercard. It showed an error 500, but checking my bank statement I was charged $120 twice! This is urgent, please refund immediately.'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pythonResult, setPythonResult] = useState(null);
  const [comparePython, setComparePython] = useState(false);

  const samplePrompts = [
    {
      title: 'Password Expired',
      sub: 'Forgot password reset link expired',
      desc: 'I received the email link to reset my password but when I clicked it 2 days later it says invalid or expired token. How do I get a new link?',
    },
    {
      title: 'Server Outage (Urgent)',
      sub: 'Production API down 500 Internal Server Error',
      desc: 'Our cluster is failing with connection timeout on /api/v1/checkout. Production down, blocking all customer orders right now! ASAP help needed.',
    },
    {
      title: 'Feature Request',
      sub: 'Dark mode and CSV export for reporting',
      desc: 'Would love if your dashboard supported dark mode and allowed exporting monthly analytics to CSV or Excel for accounting.',
    },
  ];

  const handleRunAi = async () => {
    if (!subject.trim() && !description.trim()) return;

    setLoading(true);
    setResult(null);
    setPythonResult(null);

    try {
      // 1. Run MERN built-in NLP + RAG
      const mernRes = await API.post('/tickets/preview-ai', {
        title: subject,
        description,
      });

      if (mernRes.data.success) {
        setResult(mernRes.data.preview);
      }

      // 2. If comparison enabled, run Python Bridge
      if (comparePython) {
        try {
          const pyRes = await API.post('/ai/python-bridge', {
            subject,
            description,
          });
          setPythonResult(pyRes.data);
        } catch (pyErr) {
          console.warn('Python bridge call failed:', pyErr);
        }
      }
    } catch (err) {
      alert('AI test failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          AI Classifier & RAG Test Bench
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 shadow-2xs">
            Interactive Sandbox
          </span>
        </h2>
        <p className="text-xs text-slate-500">
          Test custom customer ticket scenarios to observe multi-tier triage, confidence scoring, and RAG knowledge synthesis in real-time.
        </p>
      </div>

      {/* Preset Scenario Pills with animated hover lifts */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-semibold text-[11px] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" /> Presets:
        </span>
        {samplePrompts.map((s, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSubject(s.sub);
              setDescription(s.desc);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-all duration-200 text-xs font-semibold shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95"
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Input Form & Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="pretty-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" /> Ticket Input Payload
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Inquiry Description</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none focus:bg-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer font-medium hover:text-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={comparePython}
                  onChange={(e) => setComparePython(e.target.checked)}
                  className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Benchmark with Python ML Bridge</span>
              </label>

              <button
                onClick={handleRunAi}
                disabled={loading}
                className="animated-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Evaluating Model...' : 'Execute AI Triage'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Panel with Pretty Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="pretty-card p-6 min-h-[380px] space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" /> Model Inference Output
              </span>
              {result && (
                <span className="font-mono text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                  {(result.confidence * 100).toFixed(0)}% Confidence
                </span>
              )}
            </h3>

            {!result && !loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs space-y-2">
                <Bot className="w-10 h-10 opacity-30 text-indigo-600" />
                <p className="font-medium">Click "Execute AI Triage" to inspect real-time inference</p>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-indigo-700 text-xs space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="font-semibold animate-pulse">Computing vectors, sentiment, and knowledge retrieval...</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                {/* 4 Metrics Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors">
                    <span className="text-[10px] text-slate-500 block font-medium">Category</span>
                    <span className="font-bold text-indigo-700 truncate block mt-0.5">{result.category}</span>
                  </div>
                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors">
                    <span className="text-[10px] text-slate-500 block font-medium">Triage Tier</span>
                    <span className="font-bold text-purple-700 block mt-0.5 capitalize">{result.tier.replace('_', ' ')}</span>
                  </div>
                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors">
                    <span className="text-[10px] text-slate-500 block font-medium">Urgency</span>
                    <span className="font-bold text-amber-700 block mt-0.5 capitalize">{result.urgency}</span>
                  </div>
                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors">
                    <span className="text-[10px] text-slate-500 block font-medium">Sentiment</span>
                    <span className="font-bold text-rose-700 block mt-0.5 capitalize">{result.sentiment}</span>
                  </div>
                </div>

                {/* Auto Resolution Status Banner with soft glow */}
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between shadow-2xs ${
                    result.autoResolveEligible
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">
                      {result.autoResolveEligible
                        ? 'Eligible for 100% Instant Automated Resolution'
                        : 'Routed to Agent with AI Copilot Assistance Draft'}
                    </span>
                  </div>
                </div>

                {/* Synthesized Response Body */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    AI Synthesized Response & Knowledge Retrieval:
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto shadow-inner">
                    {result.suggestedResponse}
                  </div>
                </div>

                {/* Python ML Benchmark comparison card */}
                {comparePython && pythonResult && (
                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1.5 text-xs shadow-2xs">
                    <div className="flex items-center justify-between text-purple-800 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-600" /> Python Machine Learning Engine Output:
                      </span>
                      <span className="font-mono text-[10px] bg-purple-100 px-2.5 py-0.5 rounded-full text-purple-700 border border-purple-200">
                        SentenceTransformers
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-purple-900 font-medium">
                      <div>Category: <strong className="text-slate-900">{pythonResult.category}</strong></div>
                      <div>Tier: <strong className="text-slate-900">{pythonResult.tier}</strong></div>
                      <div>Confidence: <strong className="text-emerald-700">{((pythonResult.confidence || 0.88) * 100).toFixed(0)}%</strong></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
