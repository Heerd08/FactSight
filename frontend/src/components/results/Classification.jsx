import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileQuestion,
  HelpCircle,
  Layers
} from 'lucide-react';
import Card from '../common/Card';

export default function Classification({ classification = null }) {
  // Config for each classification state
  const config = {
    Genuine: {
      label: 'Genuine',
      desc: 'Content appears substantiated by credible facts and verified records.',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    Misleading: {
      label: 'Misleading',
      desc: 'Contains factual elements but presents distorted, selective context.',
      badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    Fake: {
      label: 'Fake',
      desc: 'Information contains fabricated claims or debunked falsehoods.',
      badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      iconColor: 'text-rose-600',
    },
    'Potentially Manipulated': {
      label: 'Potentially Manipulated',
      desc: 'Shows indicators of altered visuals, audio synthesis, or cropped quotes.',
      badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Layers,
      iconColor: 'text-purple-600',
    },
    'Insufficient Evidence': {
      label: 'Insufficient Evidence',
      desc: 'Not enough verifiable independent data exists to assess credibility.',
      badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: FileQuestion,
      iconColor: 'text-slate-500',
    },
  };

  const current = classification ? config[classification] : null;
  const FallbackIcon = HelpCircle;

  return (
    <Card hover className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Metric 02
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <h4 className="text-sm font-semibold text-slate-700 mb-4">Classification</h4>

        <div className="flex flex-col items-center justify-center text-center my-3 py-2">
          {current ? (
            <>
              <div className={`p-3.5 rounded-2xl ${current.badgeStyle} mb-3 shadow-2xs`}>
                <current.icon className={`w-8 h-8 ${current.iconColor}`} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${current.badgeStyle}`}>
                {current.label}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed mt-3 max-w-[220px]">
                {current.desc}
              </p>
            </>
          ) : (
            <>
              <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-400 mb-3">
                <FallbackIcon className="w-8 h-8 text-slate-400" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                Awaiting Submission
              </span>
              <p className="text-xs text-slate-400 leading-relaxed mt-3 max-w-[220px]">
                Classification tier will be generated upon claim analysis.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-center">
        <span className="text-[11px] text-slate-400">
          5 categories • Automated contextual taxonomy
        </span>
      </div>
    </Card>
  );
}
