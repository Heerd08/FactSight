import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  change,
  isPositive = true,
  period = 'vs last week',
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50',
  subtitle,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_-3px_rgba(99,102,241,0.05)] hover:shadow-md hover:border-indigo-100 transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        {change && (
          <div className="flex items-center gap-1 font-semibold">
            {isPositive ? (
              <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md text-[11px]">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {change}
              </span>
            ) : (
              <span className="flex items-center text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md text-[11px]">
                <TrendingDown className="w-3 h-3 mr-0.5" />
                {change}
              </span>
            )}
            <span className="text-slate-400 font-normal">{period}</span>
          </div>
        )}
        {subtitle && !change && (
          <span className="text-slate-400 text-[11px]">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
