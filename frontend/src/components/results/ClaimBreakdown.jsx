import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function ClaimBreakdown({ claims = [] }) {
  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'Supported':
        return { variant: 'success', icon: CheckCircle2, text: 'Supported' };
      case 'Contradicted':
        return { variant: 'danger', icon: XCircle, text: 'Contradicted' };
      case 'Unverified':
      default:
        return { variant: 'warning', icon: AlertCircle, text: 'Unverified' };
    }
  };

  return (
    <Card header={<h4 className="text-sm font-bold text-slate-800">Claim-by-Claim Breakdown</h4>}>
      {claims && claims.length > 0 ? (
        <div className="space-y-3">
          {claims.map((c, idx) => {
            const badge = getVerdictBadge(c.verdict);
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Claim {idx + 1}
                  </span>
                  <p className="text-xs font-semibold text-slate-800">"{c.claimText}"</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {c.confidence && (
                    <span className="text-[11px] font-mono text-slate-400">
                      {c.confidence}% confidence
                    </span>
                  )}
                  <Badge variant={badge.variant} size="sm" icon={badge.icon}>
                    {badge.text}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400">
          <p>Claims identified in the submitted text or media will be dissected individually here.</p>
        </div>
      )}
    </Card>
  );
}
