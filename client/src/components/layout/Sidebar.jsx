import React from 'react';
import { Ticket, BookOpen, Cpu, BarChart3, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, ticketCount }) => {
  const { user } = useAuth();

  const navItems = [
    {
      id: 'tickets',
      label: user?.role === 'customer' ? 'My Support Tickets' : 'Ticket Command Center',
      icon: Ticket,
      badge: ticketCount || 0,
    },
    {
      id: 'analytics',
      label: 'AI & Performance KPIs',
      icon: BarChart3,
      hidden: user?.role === 'customer',
    },
    {
      id: 'knowledge',
      label: 'Knowledge Base (RAG)',
      icon: BookOpen,
    },
    {
      id: 'playground',
      label: 'AI Classifier Playground',
      icon: Cpu,
    },
  ];

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/80 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shadow-xs">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </div>
          <nav className="space-y-1.5">
            {navItems
              .filter((item) => !item.hidden)
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ease-out active:scale-98 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/25 translate-x-1'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-indigo-50/70 hover:translate-x-1'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isActive
                            ? 'text-white scale-110'
                            : 'text-slate-400 group-hover:text-indigo-600 group-hover:scale-110'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>

        {/* AI Capabilities Card with subtle animated glow */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50/90 to-purple-50/50 border border-indigo-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all duration-300">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-300/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold mb-1.5">
            <Cpu className="w-4 h-4 animate-spin-slow" />
            <span>AI Copilot Active</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Multi-Tier Triage, RAG knowledge synthesis & automated deflection running in real-time.
          </p>
          <div className="mt-3 flex items-center justify-between text-[10px] text-indigo-800 font-semibold bg-white/90 px-2.5 py-1.5 rounded-lg border border-indigo-100 shadow-2xs group-hover:shadow-xs transition-shadow">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Accuracy
            </span>
            <span className="text-emerald-600 font-bold">94.8%</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between px-2">
        <span>Major Project v2.0</span>
        <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Ready
        </span>
      </div>
    </aside>
  );
};
