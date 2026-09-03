import React from 'react';
import { Search, ExternalLink, ShieldCheck, ChevronRight, FileSearch } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import EvidenceCard from './EvidenceCard';

export default function EvidenceSection({ evidence = [], isDashboardMini = false }) {
  const hasEvidence = evidence && evidence.length > 0;

  if (isDashboardMini) {
    return (
      <Card hover className="h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Metric 03
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FileSearch className="w-4 h-4" />
            </div>
          </div>

          <h4 className="text-sm font-semibold text-slate-700 mb-2">Evidence</h4>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-3">
            <span className="text-xs text-slate-500">Evidence Found</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              {evidence.length} Sources
            </span>
          </div>

          {hasEvidence ? (
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {evidence.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {item.sourceName?.charAt(0) || 'S'}
                    </div>
                    <span className="font-medium text-slate-800 truncate">{item.sourceName}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 shrink-0 ml-2">
                    {item.relevanceScore}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs text-slate-400">No evidence available yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">Cross-referenced citations will populate after analysis.</p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-400">
            Real-time web & database lookup
          </span>
        </div>
      </Card>
    );
  }

  // Full section layout
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Top Evidence & Source Citations</h3>
          <p className="text-xs text-slate-500">Independent records matching the submitted claim.</p>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {evidence.length} Results
        </span>
      </div>

      {hasEvidence ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidence.map((item, idx) => (
            <EvidenceCard key={item.id || idx} item={item} />
          ))}
        </div>
      ) : (
        <div className="p-8 bg-white rounded-2xl border border-slate-200/80 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">No evidence items to display</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Once a claim is analyzed, matching corroborating news articles, academic papers, and official records will appear here with relevance scores.
          </p>
        </div>
      )}
    </div>
  );
}
