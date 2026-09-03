import React from 'react';

export default function ConfidenceBarChart({
  ranges = [
    { range: '90 - 100%', count: 342, percent: 42, label: 'High Certainty', color: 'bg-emerald-500' },
    { range: '75 - 89%', count: 260, percent: 32, label: 'Substantial', color: 'bg-indigo-500' },
    { range: '50 - 74%', count: 145, percent: 18, label: 'Moderate', color: 'bg-amber-500' },
    { range: '< 50%', count: 65, percent: 8, label: 'Low Evidence', color: 'bg-rose-500' },
  ]
}) {
  return (
    <div className="space-y-3.5">
      {ranges.map((r, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 font-mono text-[11px]">{r.range}</span>
              <span className="text-slate-400 text-[10px]">({r.label})</span>
            </div>
            <span className="font-mono text-slate-600 font-semibold">{r.count} claims ({r.percent}%)</span>
          </div>

          {/* Bar track */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${r.color} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${r.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
