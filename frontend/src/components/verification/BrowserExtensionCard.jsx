import React from 'react';
import { Puzzle, Sparkles, CheckCircle2, Shield, Bell } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function BrowserExtensionCard() {
  return (
    <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 rounded-2xl border border-indigo-100 shadow-2xs">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 mb-1">
          <Puzzle className="w-7 h-7" />
        </div>

        <div className="flex items-center justify-center gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            FactSight Browser Extension
          </h3>
          <Badge variant="warning" size="sm">Coming Soon</Badge>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Verify information directly while browsing. Highlight any text or right-click any article to get instantaneous credibility scores, source trust ratings, and cross-referenced evidence.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
          <div className="p-3 bg-white rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Scan</span>
            </div>
            <p className="text-[11px] text-slate-500">Scan entire web articles with a single click in your toolbar.</p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Real-Time Badge</span>
            </div>
            <p className="text-[11px] text-slate-500">Instant visual credibility ratings overlay on social feeds.</p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs mb-1">
              <Bell className="w-3.5 h-3.5" />
              <span>Claim Alerts</span>
            </div>
            <p className="text-[11px] text-slate-500">Unbiased warnings when reading flagged or disputed news.</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>Targeting Chrome, Brave, Edge & Firefox</span>
          </div>
        </div>
      </div>
    </div>
  );
}
