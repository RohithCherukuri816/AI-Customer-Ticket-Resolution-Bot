import React, { useState } from 'react';
import {
  Search,
  Kanban,
  List,
  Bot,
  Sparkles,
} from 'lucide-react';
import { StatusBadge, PriorityBadge, TierBadge } from '../components/common/TicketBadge';

export const TicketWorkspaceView = ({
  tickets,
  onSelectTicket,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  tierFilter,
  setTierFilter,
}) => {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  const categories = [
    'All Categories',
    'Account & Authentication',
    'Billing & Payments',
    'Technical & Infrastructure',
    'Feature Requests',
    'Security & Compliance',
    'General Support',
  ];

  const kanbanColumns = [
    { id: 'open', title: 'Open / Triage', dot: 'bg-emerald-500', barColor: 'from-emerald-400 to-teal-500' },
    { id: 'in_progress', title: 'In Progress / Assigned', dot: 'bg-amber-500', barColor: 'from-amber-400 to-orange-500' },
    { id: 'resolved', title: 'Resolved (AI & Human)', dot: 'bg-blue-500', barColor: 'from-blue-400 to-indigo-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar with Glassmorphic Lite Shadow */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-200/90 shadow-sm transition-all duration-300">
        <div className="flex-1 min-w-[260px] relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets by ID, keyword, customer, or error..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer transition-all"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat === 'All Categories' ? 'all' : cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Tier Dropdown */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer transition-all"
          >
            <option value="all">All Tiers</option>
            <option value="tier_1">Tier 1 (Auto-Resolve)</option>
            <option value="tier_2">Tier 2 (Assisted)</option>
            <option value="tier_3">Tier 3 (Escalated)</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Toggle View Mode Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs transition-all duration-200 active:scale-95 ${
                viewMode === 'kanban'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-all duration-200 active:scale-95 ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Render Kanban or List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kanbanColumns.map((col) => {
            const columnTickets = tickets.filter((t) =>
              col.id === 'resolved' ? ['resolved', 'closed'].includes(t.status) : t.status === col.id
            );

            return (
              <div key={col.id} className="flex flex-col space-y-3.5">
                {/* Column Header */}
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot} shadow-xs animate-pulse`}></span>
                    <h3 className="text-xs font-bold text-slate-800">{col.title}</h3>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono shadow-inner">
                    {columnTickets.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3.5 min-h-[400px]">
                  {columnTickets.length === 0 ? (
                    <div className="p-10 text-center text-xs text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 flex flex-col items-center justify-center space-y-2">
                      <Sparkles className="w-5 h-5 text-slate-300" />
                      <span>No tickets in this lane</span>
                    </div>
                  ) : (
                    columnTickets.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => onSelectTicket(t._id)}
                        className="pretty-card p-4.5 cursor-pointer space-y-3 group overflow-hidden"
                      >
                        {/* Top Gradient Accent Bar */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${col.barColor} opacity-70 group-hover:opacity-100 transition-opacity`} />

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-indigo-600 font-bold tracking-tight group-hover:text-indigo-700">
                            {t.ticketNumber}
                          </span>
                          <PriorityBadge priority={t.priority} />
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {t.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                            {t.description}
                          </p>
                        </div>

                        {/* AI Resolution Indicators */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Bot className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                            <span className="truncate max-w-[120px]">{t.category}</span>
                          </div>
                          <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs group-hover:bg-emerald-100 transition-colors">
                            {((t.aiConfidence || 0.88) * 100).toFixed(0)}% AI
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <img
                              src={t.customer?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${t.customer?.name}`}
                              alt={t.customer?.name}
                              className="w-4.5 h-4.5 rounded-full border border-slate-200 group-hover:scale-110 transition-transform"
                            />
                            <span className="truncate max-w-[90px] font-medium text-slate-700">{t.customer?.name || 'Customer'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tabular List View with Pretty Row Transitions */
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Ticket ID</th>
                  <th className="py-3.5 px-4 font-semibold">Subject & Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">AI Triage / Tier</th>
                  <th className="py-3.5 px-4 font-semibold">Priority</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tickets.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => onSelectTicket(t._id)}
                    className="hover:bg-indigo-50/40 hover:translate-x-1 cursor-pointer transition-all duration-150"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">{t.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">By {t.customer?.name || 'User'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{t.category}</td>
                    <td className="py-3.5 px-4">
                      <TierBadge tier={t.tier} />
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">
                      {((t.aiConfidence || 0.88) * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
