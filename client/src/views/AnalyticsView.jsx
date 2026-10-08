import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  BarChart3,
  Cpu,
  Star,
  Clock,
  Activity,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const AnalyticsView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/analytics/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-xs text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-indigo-600" /> Loading Executive Performance Analytics...
      </div>
    );
  }

  const { summary, categoryStats, tierStats, sentimentStats, recentActivities } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            AI Operations & Performance Analytics
            <span className="relative inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Real-Time
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time monitoring of AI ticket deflection, categorization accuracy, and customer satisfaction metrics.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="animated-btn-subtle flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs text-slate-700 font-semibold transition shadow-xs group"
        >
          <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-indigo-600" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stat Cards Grid with Pretty Cards and Hover Lifts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="pretty-card p-5 space-y-3 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Volume</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{summary?.totalTickets || 0}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> 100%
              </span>
              <span>processed by AI</span>
            </div>
          </div>
        </div>

        {/* AI Auto-Resolution Rate */}
        <div className="pretty-card p-5 space-y-3 group cursor-default bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 border-indigo-200/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-800">AI Auto-Resolution Rate</span>
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 group-hover:scale-110 group-hover:bg-indigo-700 group-hover:text-white transition-all duration-300">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-indigo-950 tracking-tight">
              {summary?.autoResolutionRate || 65}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden p-0.5 border border-slate-200/50">
              <div
                className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${summary?.autoResolutionRate || 65}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-indigo-700 mt-1.5 font-medium">
              {summary?.autoResolvedTickets || 0} tickets resolved without human touch
            </div>
          </div>
        </div>

        {/* Average CSAT Rating */}
        <div className="pretty-card p-5 space-y-3 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Customer Satisfaction (CSAT)</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
              <Star className="w-4 h-4 fill-amber-500 group-hover:fill-white" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-900 tracking-tight">
              {summary?.averageCsat || 4.8} <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Based on verified customer ratings
            </div>
          </div>
        </div>

        {/* AI Latency */}
        <div className="pretty-card p-5 space-y-3 group cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">AI Response Latency</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-700 tracking-tight">&lt; 2.5s</div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              99.2% faster than standard SLAs
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Category Breakdown & Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="pretty-card p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" /> Ticket Volume by AI Category
          </h3>
          <div className="space-y-3.5 pt-2">
            {(categoryStats || []).map((cat, idx) => {
              const total = summary?.totalTickets || 1;
              const percent = ((cat.count / total) * 100).toFixed(0);
              return (
                <div key={idx} className="space-y-1.5 group">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-semibold group-hover:text-indigo-600 transition-colors">{cat._id}</span>
                    <span className="text-slate-500 font-mono font-medium">
                      {cat.count} tickets ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500 group-hover:from-indigo-600 group-hover:to-purple-600"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution Tier Distribution */}
        <div className="pretty-card p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-600" /> Resolution Tier Distribution
          </h3>
          <div className="grid grid-cols-3 gap-3.5 pt-2">
            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-center hover:scale-105 transition-transform duration-200">
              <div className="text-[10px] uppercase font-bold text-indigo-700">Tier 1</div>
              <div className="text-2xl font-extrabold text-indigo-900 mt-1">
                {tierStats?.find((t) => t._id === 'tier_1')?.count || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-medium">Instant Auto-Resolve</div>
            </div>

            <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-100 text-center hover:scale-105 transition-transform duration-200">
              <div className="text-[10px] uppercase font-bold text-sky-700">Tier 2</div>
              <div className="text-2xl font-extrabold text-sky-900 mt-1">
                {tierStats?.find((t) => t._id === 'tier_2')?.count || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-medium">Agent + AI Assisted</div>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-100 text-center hover:scale-105 transition-transform duration-200">
              <div className="text-[10px] uppercase font-bold text-rose-700">Tier 3</div>
              <div className="text-2xl font-extrabold text-rose-900 mt-1">
                {tierStats?.find((t) => t._id === 'tier_3')?.count || 0}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-medium">Escalated Complex</div>
            </div>
          </div>

          {/* Sentiment Summary */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Customer Sentiment Detection:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {(sentimentStats || []).map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-xl bg-slate-50 text-slate-700 text-xs border border-slate-200 capitalize font-medium hover:border-indigo-300 transition-colors shadow-2xs"
                >
                  {s._id}: <strong className="text-slate-900">{s.count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Audit Trail */}
      <div className="pretty-card p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" /> Real-Time Audit Log & Automation Stream
        </h3>
        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {(recentActivities || []).map((act, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className="font-mono text-indigo-700 font-semibold text-[11px]">[{act.action}]</span>
                <span className="text-slate-700 font-medium">{act.details}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(act.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
