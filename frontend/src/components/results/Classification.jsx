import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Shield, ArrowUpRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function Classification({ classification = 'Unverified', confidence = 0 }) {
  const getVerdictDetails = (type) => {
    switch (type) {
      case 'Genuine':
      case 'True':
        return {
          title: 'Genuine',
          color: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          icon: CheckCircle2,
          description: 'Supported by verified factual evidence and credible sources.',
        };
      case 'Misleading':
      case 'Partially True':
        return {
          title: 'Misleading',
          color: 'text-amber-700',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: AlertTriangle,
          description: 'Contains factual distortions, omitted context, or selective framing.',
        };
      case 'Fake':
      case 'False':
        return {
          title: 'Fake',
          color: 'text-rose-700',
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          icon: XCircle,
          description: 'Directly contradicted by empirical data and reliable fact-checkers.',
        };
      default:
        return {
          title: 'Unverified',
          color: 'text-slate-700',
          bg: 'bg-slate-100',
          border: 'border-slate-200',
          icon: HelpCircle,
          description: 'Insufficient public evidence or confidence to determine certainty.',
        };
    }
  };

  const verdict = getVerdictDetails(classification);
  const Icon = verdict.icon;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <Card hover className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Metric 02
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        <h4 className="text-sm font-semibold text-slate-700 mb-2">Classification</h4>

        <div className={`p-4 rounded-xl border ${verdict.bg} ${verdict.border} my-2`}>
          <div className="flex items-center gap-2 mb-1.5">
            <Icon className={`w-5 h-5 ${verdict.color}`} />
            <span className={`text-base font-extrabold ${verdict.color}`}>
              {verdict.title}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-snug">
            {verdict.description}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-500 font-medium">Model Confidence</span>
          <span className="font-bold text-slate-800 font-mono">{confidencePercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
