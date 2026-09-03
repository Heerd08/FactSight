import React from 'react';
import { Award, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';
import Card from '../common/Card';

export default function CredibilityScore({ score = null }) {
  // Determine color and status label based on 0-100 score
  const getScoreDetails = (val) => {
    if (val === null || val === undefined) {
      return {
        label: 'Unscored',
        colorClass: 'text-slate-400',
        strokeColor: '#94A3B8',
        bgTint: 'bg-slate-50',
        badgeBorder: 'border-slate-200',
      };
    }
    if (val >= 80) {
      return {
        label: 'High Credibility',
        colorClass: 'text-emerald-600',
        strokeColor: '#10B981',
        bgTint: 'bg-emerald-50/50',
        badgeBorder: 'border-emerald-200',
      };
    }
    if (val >= 50) {
      return {
        label: 'Moderate Credibility',
        colorClass: 'text-amber-500',
        strokeColor: '#F59E0B',
        bgTint: 'bg-amber-50/50',
        badgeBorder: 'border-amber-200',
      };
    }
    return {
      label: 'Low Credibility',
      colorClass: 'text-rose-500',
      strokeColor: '#F43F5E',
      bgTint: 'bg-rose-50/50',
      badgeBorder: 'border-rose-200',
    };
  };

  const { label, colorClass, strokeColor, bgTint, badgeBorder } = getScoreDetails(score);

  // SVG Circular progress math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const displayScore = score !== null ? Math.min(Math.max(score, 0), 100) : 0;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <Card hover className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Metric 01
        </span>
        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
          <Award className="w-4 h-4" />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-slate-700 mb-2">Credibility Score</h4>

      <div className="flex flex-col items-center justify-center py-2">
        {/* Circular Progress Gauge */}
        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-100"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={strokeColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Score Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${colorClass}`}>
              {score !== null ? `${score}` : '__'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">/ 100</span>
          </div>
        </div>

        {/* Dynamic Label Badge */}
        <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${bgTint} ${colorClass} ${badgeBorder}`}>
          {label}
        </div>
      </div>

      <p className="text-[11px] text-slate-400 text-center mt-2">
        {score !== null
          ? 'Calculated via multi-source consistency and verifiable evidence.'
          : 'Pending content evaluation.'}
      </p>
    </Card>
  );
}
