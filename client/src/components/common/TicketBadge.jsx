import React from 'react';

export const StatusBadge = ({ status }) => {
  const configs = {
    open: { label: 'Open', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    in_progress: { label: 'In Progress', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    resolved: { label: 'Resolved', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    closed: { label: 'Closed', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const current = configs[status] || configs.open;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {current.label}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const configs = {
    urgent: { label: 'Urgent', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    high: { label: 'High', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
    medium: { label: 'Medium', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    low: { label: 'Low', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };

  const current = configs[priority] || configs.medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg}`}>
      {current.label}
    </span>
  );
};

export const TierBadge = ({ tier }) => {
  const configs = {
    tier_1: { label: 'Tier 1 • Auto-Resolvable', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    tier_2: { label: 'Tier 2 • Agent Assisted', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
    tier_3: { label: 'Tier 3 • Escalated', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  const current = configs[tier] || { label: tier, bg: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${current.bg}`}>
      {current.label}
    </span>
  );
};

export const SentimentBadge = ({ sentiment }) => {
  const configs = {
    frustrated: { label: 'Frustrated 😤', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    negative: { label: 'Negative 🙁', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    neutral: { label: 'Neutral 😐', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    positive: { label: 'Positive 😊', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  };

  const current = configs[sentiment] || configs.neutral;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${current.bg}`}>
      {current.label}
    </span>
  );
};
