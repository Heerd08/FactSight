import React from 'react';
import { ExternalLink, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import Badge from '../common/Badge';

export default function EvidenceCard({ item }) {
  if (!item) return null;

  const trustBadgeVariant =
    item.trustRating === 'High' ? 'success' : item.trustRating === 'Medium' ? 'warning' : 'neutral';

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-200 transition-all hover:shadow-2xs">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
            {item.sourceName?.charAt(0) || 'S'}
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800">{item.sourceName}</h5>
            <span className="text-[10px] text-slate-400">{item.sourceDomain || 'Verified Domain'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={trustBadgeVariant} size="sm">
            {item.trustRating || 'Verified'} Trust
          </Badge>
          <span className="text-[11px] font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
            {item.relevanceScore}% Match
          </span>
        </div>
      </div>

      <h6 className="text-xs font-semibold text-slate-800 mb-1 line-clamp-1">
        {item.title}
      </h6>

      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">
        {item.description}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
        <span>{item.publishDate || 'Recent'}</span>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            <span>View Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
