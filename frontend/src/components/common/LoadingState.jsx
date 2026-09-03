import React from 'react';
import { Sparkles, ShieldCheck, Search, Database } from 'lucide-react';

export default function LoadingState({
  title = 'FactSight AI is verifying content...',
  message = 'Scanning sources, evaluating claim consistency, and compiling evidence breakdown.',
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-indigo-100 shadow-sm text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 animate-pulse">
          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6">{message}</p>

      {/* Verification Steps Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100/60 text-xs text-indigo-700 font-medium">
          <Search className="w-3.5 h-3.5 animate-bounce" />
          <span>Searching sources</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100/60 text-xs text-indigo-700 font-medium">
          <Database className="w-3.5 h-3.5 animate-pulse" />
          <span>Cross-referencing</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100/60 text-xs text-indigo-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Scoring trust</span>
        </div>
      </div>
    </div>
  );
}
