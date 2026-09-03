import React from 'react';

export default function VerdictDonutChart({
  verdicts = [
    { label: 'Verified True', count: 428, percent: 52, color: '#10B981', bg: 'bg-emerald-500' },
    { label: 'False / Fabricated', count: 214, percent: 26, color: '#EF4444', bg: 'bg-rose-500' },
    { label: 'Misleading Nuance', count: 115, percent: 14, color: '#F59E0B', bg: 'bg-amber-500' },
    { label: 'Uncertain / Pending', count: 66, percent: 8, color: '#64748B', bg: 'bg-slate-500' },
  ]
}) {
  const total = verdicts.reduce((acc, v) => acc + v.count, 0);
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* Donut Graphic */}
      <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {verdicts.map((v, i) => {
            const strokeDasharray = `${(v.percent / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += (v.percent / 100) * circumference;

            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={v.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out hover:opacity-90 cursor-pointer"
              />
            );
          })}
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            {total}
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Evaluated
          </span>
        </div>
      </div>

      {/* Legend & Percentages */}
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-2.5 w-full">
        {verdicts.map((v, i) => (
          <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${v.bg}`} />
              <span className="text-slate-700 font-medium text-[11px] sm:text-xs">{v.label}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="font-bold text-slate-800">{v.percent}%</span>
              <span className="text-slate-400 hidden sm:inline">({v.count})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
