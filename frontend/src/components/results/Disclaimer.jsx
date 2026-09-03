import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function Disclaimer({ className = '' }) {
  return (
    <div className={`flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed ${className}`}>
      <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
      <p>
        <strong className="text-slate-700 font-semibold">Educational & Research Disclaimer:</strong> FactSight AI provides information and credibility indicators for educational and informational purposes. Always review the underlying evidence before making important decisions.
      </p>
    </div>
  );
}
