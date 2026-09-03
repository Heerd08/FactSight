import React from 'react';
import { AlertTriangle, Sparkles, Sliders, ShieldCheck } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function ManipulationIndicators({ indicators = [] }) {
  return (
    <Card header={<h4 className="text-sm font-bold text-slate-800">Potential Manipulation Indicators</h4>}>
      {indicators && indicators.length > 0 ? (
        <div className="space-y-3">
          {indicators.map((ind, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-100/80 flex items-start gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950">{ind.type}</span>
                  <Badge
                    variant={ind.severity === 'High' ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {ind.severity} Severity
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ind.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400">
          <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>No manipulation markers flagged</span>
          </div>
          <p className="text-[11px] text-slate-400">Deepfake heuristics, cherry-picked data, and synthetic audio patterns will appear here if detected.</p>
        </div>
      )}
    </Card>
  );
}
