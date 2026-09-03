import React from 'react';
import { Scale, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import Card from '../common/Card';

export default function EvidenceBalance({
  supportingCount = 0,
  contradictingCount = 0,
  inconclusiveCount = 0,
  isEmpty = false
}) {
  const total = supportingCount + contradictingCount + inconclusiveCount;

  const supportingPct = total > 0 ? Math.round((supportingCount / total) * 100) : 0;
  const contradictingPct = total > 0 ? Math.round((contradictingCount / total) * 100) : 0;
  const inconclusivePct = total > 0 ? Math.max(0, 100 - supportingPct - contradictingPct) : 0;

  return (
    <Card hover className="h-full flex flex-col justify-between border-slate-200/90">
      <div>
        {/* Metric Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Evidence Balance
          </span>
          <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Scale className="w-4 h-4" />
          </div>
        </div>

        <h4 className="text-sm font-bold text-slate-800 mb-1">
          Evidence Distribution
        </h4>
        <p className="text-xs text-slate-500 mb-5">
          Proportion of corroborating vs contradictory independent records.
        </p>

        {isEmpty || total === 0 ? (
          <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <HelpCircle className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No evidence counts calculated</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Evidence balance bars will generate once citations are indexed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Supporting Evidence Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Supporting Evidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 text-[11px]">{supportingCount} sources</span>
                  <span className="font-mono font-bold text-emerald-600">{supportingPct}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${supportingPct}%` }}
                />
              </div>
            </div>

            {/* Contradicting Evidence Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-rose-700">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Contradicting Evidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 text-[11px]">{contradictingCount} sources</span>
                  <span className="font-mono font-bold text-rose-600">{contradictingPct}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${contradictingPct}%` }}
                />
              </div>
            </div>

            {/* Inconclusive Evidence Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-amber-700">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Inconclusive / Contextual</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 text-[11px]">{inconclusiveCount} sources</span>
                  <span className="font-mono font-bold text-amber-600">{inconclusivePct}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${inconclusivePct}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Total Evaluated Records</span>
        <span className="font-mono font-bold text-slate-700">{total} citations</span>
      </div>
    </Card>
  );
}
