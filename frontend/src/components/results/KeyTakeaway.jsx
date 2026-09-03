import React from 'react';
import { Lightbulb, Info } from 'lucide-react';

export default function KeyTakeaway({ takeaway = null }) {
  return (
    <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-white rounded-2xl border border-indigo-100/90 shadow-2xs">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-indigo-950 uppercase tracking-wider">
            Key Takeaway
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {takeaway || (
              <span className="text-slate-400 italic">
                Your key takeaway will appear after analysis. Submit text, an article link, screenshot, or post above to view our concise verdict.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
