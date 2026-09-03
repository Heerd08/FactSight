import React, { useState } from 'react';
import {
  Network,
  Award,
  Search,
  FileCheck2,
  Eye,
  Database,
  ShieldCheck,
  Building,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';

export default function SourceInsights() {
  const [searchDomain, setSearchDomain] = useState('');

  const pillars = [
    {
      title: 'Source Reputation',
      icon: Award,
      badge: 'Index Factor',
      desc: 'Evaluates publisher history, professional accreditation, peer review presence, and track record with factual corrections over time.',
      emptyNotice: 'Connect domain database to query publisher historical accuracy ratings.',
    },
    {
      title: 'Citation Quality',
      icon: FileCheck2,
      badge: 'Index Factor',
      desc: 'Measures whether articles cite primary documentation, public filings, and verifiable quotes versus anonymous rumors.',
      emptyNotice: 'Citations analysis will populate when active articles are inspected.',
    },
    {
      title: 'Publication Transparency',
      icon: Eye,
      badge: 'Index Factor',
      desc: 'Audits masthead disclosure, editorial ownership, conflict-of-interest declarations, and transparent funding sources.',
      emptyNotice: 'Transparency metrics ready for automated registry sync.',
    },
    {
      title: 'Evidence Availability',
      icon: Database,
      badge: 'Index Factor',
      desc: 'Tracks open data availability, reproducibility of quantitative claims, and availability of uncut audio/video records.',
      emptyNotice: 'Repository availability audits will sync via backend indexing.',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Source Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore publisher credibility metrics, transparency scores, and citation integrity.
          </p>
        </div>

        <Badge variant="purple" size="md" icon={ShieldCheck}>
          Intelligence Directory
        </Badge>
      </div>

      {/* Explanatory Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50/40 to-white rounded-2xl border border-indigo-100/90 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Network className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Source Reliability Architecture
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              FactSight AI will continuously monitor news outlets, research archives, and digital publications. Rather than relying on static blacklists, our engine evaluates sources dynamically based on four core pillars of information integrity.
            </p>
          </div>
        </div>
      </div>

      {/* Domain Lookup Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Lookup Publisher or Domain
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchDomain}
              onChange={(e) => setSearchDomain(e.target.value)}
              placeholder="Enter news domain (e.g. reuters.com, nature.com, bbc.co.uk)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>
          <button
            type="button"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Inspect Source
          </button>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <Card key={pillar.title} hover className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {pillar.title}
                    </h3>
                  </div>
                  <Badge variant="neutral" size="sm">{pillar.badge}</Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {pillar.desc}
                </p>

                {/* Empty State placeholder */}
                <div className="p-4 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 text-center">
                  <p className="text-[11px] text-slate-400 font-medium">
                    {pillar.emptyNotice}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Algorithmic index criteria</span>
                <span className="text-indigo-600 font-medium">Ready for API</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
