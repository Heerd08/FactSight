import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle } from 'lucide-react';
import Card from '../common/Card';

export default function CredibilityScore({ score = null, isPreview = false }) {
  // Score interpretation
  let label = 'Awaiting Analysis';
  let colorClass = 'text-slate-400';
  let strokeColor = '#94A3B8';
  let bgTint = 'bg-slate-50';
  let badgeBorder = 'border-slate-200';
  let Icon = HelpCircle;

  if (score !== null && score !== undefined) {
    if (score >= 75) {
      label = 'High Credibility';
      colorClass = 'text-emerald-600';
      strokeColor = '#10B981';
      bgTint = 'bg-emerald-50/50';
      badgeBorder = 'border-emerald-200';
      Icon = ShieldCheck;
    } else if (score >= 45) {
      label = 'Moderate Credibility';
      colorClass = 'text-amber-600';
      strokeColor = '#F59E0B';
      bgTint = 'bg-amber-50/50';
      badgeBorder = 'border-amber-200';
      Icon = AlertTriangle;
    } else {
      label = 'Low Credibility';
      colorClass = 'text-rose-600';
      strokeColor = '#EF4444';
      bgTint = 'bg-rose-50/50';
      badgeBorder = 'border-rose-200';
      Icon = ShieldAlert;
    }
  }

  // Circular gauge calculation
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const displayScore = score !== null ? Math.min(100, Math.max(0, score)) : 0;
  const strokeDashoffset = score !== null 
    ? circumference - (displayScore / 100) * circumference 
    : circumference;

  return (
    <Card hover className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Metric 01
        </span>
        <div className={`p-1.5 rounded-lg ${bgTint} ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-slate-700 mb-2">Credibility Score</h4>

      {/* Circular Visualization */}
      <div className="flex flex-col items-center justify-center my-3">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress circle */}
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

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`text-2xl font-extrabold tracking-tight ${score !== null ? 'text-slate-900' : 'text-slate-400'}`}>
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
