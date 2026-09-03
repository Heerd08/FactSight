import React from 'react';
import { Sparkles, CheckCircle2, XCircle, Info, HelpCircle } from 'lucide-react';
import Card from '../common/Card';

export default function AIExplanation({ explanation = null }) {
  if (!explanation) {
    return (
      <Card header={<h4 className="text-sm font-bold text-slate-800">AI Explanation</h4>} className="h-full">
        <div className="py-8 text-center text-xs text-slate-400">
          <p>The AI model's step-by-step reasoning will appear here after analysis.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">AI Explanation & Score Rationale</h4>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            Explainable AI
          </span>
        </div>
      }
      className="h-full"
    >
      <div className="space-y-4">
        {/* Main Claim Evaluated */}
        {explanation.mainClaim && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Evaluated Core Claim
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
              "{explanation.mainClaim}"
            </p>
          </div>
        )}

        {/* Score Rationale */}
        {explanation.scoreRationale && (
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Rationale & Synthesis
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {explanation.scoreRationale}
            </p>
          </div>
        )}

        {/* Supporting Evidence Bullets */}
        {explanation.supportingEvidence && explanation.supportingEvidence.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Corroborating Evidence</span>
            </span>
            <ul className="space-y-1 pl-1">
              {explanation.supportingEvidence.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contradicting Evidence Bullets */}
        {explanation.contradictingEvidence && explanation.contradictingEvidence.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Contradicting Evidence / Discrepancies</span>
            </span>
            <ul className="space-y-1 pl-1">
              {explanation.contradictingEvidence.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
