import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bot, Sparkles, Shield, Headphones, User, PlusCircle } from 'lucide-react';

export const Navbar = ({ onOpenNewTicket }) => {
  const { user, quickSwitchUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo with hover glow */}
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-300">
            <Bot className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent group-hover:tracking-normal transition-all">
                ResolvAI
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                MERN Major Project
              </span>
            </div>
            <p className="text-xs text-slate-500">Intelligent Ticket Resolution & Automation System</p>
          </div>
        </div>

        {/* Demo Role Switcher Toolbar with Animated Hovering */}
        <div className="hidden md:flex items-center bg-slate-100/90 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-inner">
          <span className="text-[11px] font-semibold text-slate-500 px-2.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" /> Switch Role:
          </span>
          <button
            onClick={() => quickSwitchUser('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
              user?.role === 'admin'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin
          </button>
          <button
            onClick={() => quickSwitchUser('agent')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
              user?.role === 'agent'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" /> Support Agent
          </button>
          <button
            onClick={() => quickSwitchUser('customer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
              user?.role === 'customer'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Customer (Alice)
          </button>
        </div>

        {/* User profile & Animated New Ticket Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenNewTicket}
            className="animated-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35 transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4 transition-transform duration-200 hover:rotate-90" />
            <span>New Ticket</span>
          </button>

          {user && (
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
              <div className="relative group cursor-pointer">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full ring-2 ring-indigo-200 group-hover:ring-indigo-400 group-hover:scale-105 transition-all duration-200 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-semibold text-slate-800">{user.name}</div>
                <div className="text-[10px] text-slate-500 capitalize">{user.role} • {user.department || 'Support'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
