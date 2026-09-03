import React from 'react';
import { Sparkles, CheckCircle, XCircle, AlertCircle, HelpCircle, FileText, Info } from 'lucide-react';
import Card from '../common/Card';

export default function AIExplanation({ explanation = null }) {
  const hasExplanation = explanation && (
    explanation.mainClaim ||
    explanation.scoreRationale ||
    (explanation.supportingEvidence && explanation.supportingEvidence.length > 0)
  );

  return (
    <Card hover className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Metric 05
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <h4 className="text-sm font-semibold text-slate-700 mb-3">AI Explanation</h4>

        {hasExplanation ? (
          <div className="space-y-4 text-xs">
            {/* Main Claim */}
            {explanation.mainClaim && (
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <span className="font-bold text-indigo-900 block mb-1">Identified Claim:</span>
                <p className="text-slate-700 italic">"{explanation.mainClaim}"</p>
              </div>
            )}

            {/* Score Rationale */}
            {explanation.scoreRationale && (
              <div>
                <span className="font-bold text-slate-800 block mb-1">Score Rationale:</span>
                <p className="text-slate-600 leading-relaxed">{explanation.scoreRationale}</p>
              </div>
            )}

            {/* Supporting & Contradicting Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Supporting */}
              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Supporting Context</span>
                </div>
                {explanation.supportingEvidence && explanation.supportingEvidence.length > 0 ? (
                  <ul className="space-y-1 text-slate-600">
                    {explanation.supportingEvidence.map((item, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-emerald-500">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-400">None identified</span>
                )}
              </div>

              {/* Contradicting */}
              <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Contradicting Nuance</span>
                </div>
                {explanation.contradictingEvidence && explanation.contradictingEvidence.length > 0 ? (
                  <ul className="space-y-1 text-slate-600">
                    {explanation.contradictingEvidence.map((item, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-rose-500">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-400">No contradictions detected</span>
                )}
              </div>
            </div>

            {/* Source Quality Assessment */}
            {explanation.sourceQualityAssessment && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">Source Quality Assessment:</span>
                <p className="leading-relaxed">{explanation.sourceQualityAssessment}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">AI explanation will appear after analysis</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
              When content is submitted, our neural cross-referencing system outlines claim logic, verified corroborations, and nuance.
            </p>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 text-center">
        <span className="text-[11px] text-slate-400">
          Explainable AI • Transparent reasoning
        </span>
      </div>
    </Card>
  );
}
