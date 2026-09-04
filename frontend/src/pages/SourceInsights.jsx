import React from 'react';
import { Network, Award, CheckCircle2, Globe, Shield, ExternalLink } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

export default function SourceInsights() {
  const sources = [
    { name: 'Reuters News & Fact Check', domain: 'reuters.com', score: 98, rating: 'High', category: 'International News & Wire', checksCount: 1420 },
    { name: 'World Health Organization (WHO)', domain: 'who.int', score: 96, rating: 'High', category: 'Public Health & Global Guidelines', checksCount: 890 },
    { name: 'NASA Science Division', domain: 'nasa.gov', score: 99, rating: 'High', category: 'Aerospace & Scientific Research', checksCount: 650 },
    { name: 'Associated Press (AP)', domain: 'apnews.com', score: 97, rating: 'High', category: 'News Agency & Investigations', checksCount: 1210 },
    { name: 'National Institute of Standards (NIST)', domain: 'nist.gov', score: 99, rating: 'High', category: 'Physical Sciences & Standards', checksCount: 430 },
    { name: 'European Space Agency (ESA)', domain: 'esa.int', score: 98, rating: 'High', category: 'Space Exploration & Earth Observation', checksCount: 380 }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="pb-3 border-b border-slate-200 dark:border-slate-gray/20">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
          Source Insights & Trust Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-gray mt-1">
          Explore verified publishers, scientific institutions, and fact-checking archives in the FactSight knowledge base.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((s) => (
          <Card key={s.name} hover className="flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="success" size="sm" icon={CheckCircle2}>
                  {s.rating} Trust
                </Badge>
                <span className="text-xs font-mono font-extrabold text-indigo-600 dark:text-tan bg-indigo-50 dark:bg-tan/10 px-2 py-0.5 rounded border border-indigo-100 dark:border-tan/20">
                  {s.score}% Reliability
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</h3>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{s.domain}</span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">{s.category}</p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>{s.checksCount} Indexed Citations</span>
              <a
                href={`https://${s.domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-tan hover:underline font-semibold inline-flex items-center gap-1"
              >
                <span>Visit</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
