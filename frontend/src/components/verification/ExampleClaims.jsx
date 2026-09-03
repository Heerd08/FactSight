import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ExampleClaims({ onSelectClaim }) {
  const examples = [
    {
      type: 'Scientific Discovery',
      text: 'James Webb Space Telescope detects atmospheric methane and carbon dioxide on exoplanet K2-18b in habitable zone.',
      badge: 'Science',
    },
    {
      type: 'Health Claim',
      text: 'Drinking boiled garlic water cures acute respiratory infections within 24 hours without medication.',
      badge: 'Health',
    },
    {
      type: 'Economic Policy',
      text: 'Central Bank announces complete phase-out of all physical paper currency by December 2026.',
      badge: 'Economy',
    },
  ];

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>Try an example claim:</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {examples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectClaim(ex.text)}
            className="p-2.5 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200/90 hover:border-indigo-200 text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded">
                {ex.badge}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed font-normal">
              "{ex.text}"
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
