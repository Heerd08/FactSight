import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle, Award, Calendar, CheckCircle2, FileCheck2 } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function SourceTrust({ sourceTrust = null }) {
  const metrics = [
    {
      key: 'reputation',
      label: 'Source Reputation',
      icon: Award,
      value: sourceTrust?.reputation || 'Unknown',
      desc: 'Domain history & journalistic standard compliance',
    },
    {
      key: 'attribution',
      label: 'Attribution',
      icon: CheckCircle2,
      value: sourceTrust?.attribution || 'Unknown',
      desc: 'Named authors and explicit source citations',
    },
    {
      key: 'publicationDate',
      label: 'Publication Date',
      icon: Calendar,
      value: sourceTrust?.publicationDate || 'Unknown',
      desc: 'Recency and timestamp verification',
    },
    {
      key: 'evidenceQuality',
      label: 'Evidence Quality',
      icon: FileCheck2,
      value: sourceTrust?.evidenceQuality || 'Unknown',
      desc: 'Primary documentation vs hearsay corroboration',
    },
  ];

  const getBadgeVariant = (val) => {
    switch (val) {
      case 'High':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <Card hover className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Metric 04
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <h4 className="text-sm font-semibold text-slate-700 mb-3">Source Trust</h4>

        <div className="space-y-3 my-2">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.key}
                className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-700 truncate">{m.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{m.desc}</p>
                  </div>
                </div>

                <Badge variant={getBadgeVariant(m.value)} size="sm">
                  {m.value}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-center">
        <span className="text-[11px] text-slate-400">
          Source audit index • Multi-factor heuristics
        </span>
      </div>
    </Card>
  );
}
