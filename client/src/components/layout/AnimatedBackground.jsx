import React from 'react';

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-slate-50/90 bg-grid-pattern">
      {/* Floating Ambient Pastel Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-300/30 to-violet-300/25 blur-3xl orb-1" />
      <div className="absolute top-1/3 -right-28 w-[420px] h-[420px] rounded-full bg-gradient-to-bl from-sky-300/25 to-indigo-200/25 blur-3xl orb-2" />
      <div className="absolute -bottom-24 left-1/3 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-rose-200/20 to-amber-200/20 blur-3xl orb-3" />
    </div>
  );
};
