import React from 'react';
import { Layers, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function ClaimBreakdown({ breakdown = [] }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'True':
      case 'Genuine':
        return { variant: 'success', icon: CheckCircle2, label: 'True' };
      case 'False':
      case 'Fake':
        return { variant: 'danger', icon: XCircle, label: 'False' };
      case 'Partially True':
      case 'Misleading':
        return { variant: 'warning', icon: AlertCircle, label: 'Partially True' };
      default:
        return { variant: 'neutral', icon: HelpCircle, label: 'Unverified' };
    }
  };

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Claim-by-Claim Breakdown</h4>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {breakdown.length} sub-claims analyzed
          </span>
        </div>
      }
    >
      {breakdown && breakdown.length > 0 ? (
        <div className="space-y-3">
          {breakdown.map((item, idx) => {
            const badge = getStatusBadge(item.status);
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    "{item.claim}"
                  </p>
                  <Badge variant={badge.variant} size="sm" icon={Icon}>
                    {badge.label}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.explanation}
                </p>

                {item.source && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-100">
                    <span>Verified against:</span>
                    <span className="font-semibold text-slate-600">{item.source}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-400">
          <p>Multi-sentence claims will be decomposed and verified individually here.</p>
        </div>
      )}
    </Card>
  );
}
