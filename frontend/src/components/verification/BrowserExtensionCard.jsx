import React, { useState } from 'react';
import { Puzzle, Sparkles, CheckCircle2, Shield, Bell, Download, Check } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function BrowserExtensionCard() {
  const [copied, setCopied] = useState(false);

  const handleCopyPath = () => {
    navigator.clipboard?.writeText('extension');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 rounded-2xl border border-indigo-100 shadow-2xs">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">
          <Puzzle className="w-7 h-7" />
        </div>

        <div>
          <Badge variant="success" size="md" icon={CheckCircle2} className="mb-2">
            Manifest V3 Extension Ready
          </Badge>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
            FactSight Browser Companion
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Real-time credibility indicators while you browse. Highlights unverified claims and offers instantaneous 1-click truth evaluations directly in Chrome and Edge.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Right-Click Menu</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Select text on any webpage to verify instantly with FactSight AI.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span>Active Tab URL</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              1-click URL scraping and Pure RAG evidence lookup.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
              <Bell className="w-3.5 h-3.5 text-violet-500" />
              <span>On-Page Badges</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Floating credibility toast with verified citation counts.
            </p>
          </div>
        </div>

        {/* How to load instructions */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 mt-2">
          <p className="font-bold text-slate-800">How to Load into Chrome / Edge:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
            <li>Open <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">chrome://extensions</code> in your browser.</li>
            <li>Enable <strong>Developer mode</strong> in the top right toggle.</li>
            <li>Click <strong>Load unpacked</strong> and select the <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">FactSight/extension</code> folder.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
