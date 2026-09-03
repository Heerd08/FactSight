import React from 'react';
import {
  Eye,
  AlertTriangle,
  Flame,
  Clock,
  Zap,
  HelpCircle,
  Megaphone,
  Sparkles,
  ShieldCheck,
  Info
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function ManipulationLens({ signals = [] }) {
  const getSignalIcon = (type) => {
    switch (type) {
      case 'Emotional language':
        return Flame;
      case 'Excessive urgency':
        return Clock;
      case 'Sensational wording':
        return Zap;
      case 'Unsupported certainty':
        return AlertTriangle;
      case 'Missing attribution':
        return HelpCircle;
      case 'Clickbait framing':
        return Megaphone;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'High':
        return 'danger';
      case 'Medium':
        return 'warning';
      case 'Low':
      default:
        return 'neutral';
    }
  };

  const hasSignals = signals && signals.length > 0;

  return (
    <Card hover className="border-slate-200/90">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-50 text-purple-600">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Manipulation Lens
            </h4>
            <p className="text-xs text-slate-500">
              Heuristic audit for linguistic framing and cognitive persuasion signals
            </p>
          </div>
        </div>

        {hasSignals && (
          <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
            {signals.length} Signals Flagged
          </span>
        )}
      </div>

      {/* Critical Explicit Disclaimer */}
      <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 mb-4 flex items-start gap-2.5 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important:</strong> Warning signals evaluate rhetorical and linguistic framing. They are <u>not</u> definitive proof that the underlying factual assertions are false.
        </p>
      </div>

      {!hasSignals ? (
        <div className="py-8 px-4 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-800">
            No manipulation warning signals detected
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            The analyzed text exhibits neutral linguistic tone, proper attribution markers, and balanced evidentiary phrasing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map((sig, idx) => {
            const Icon = getSignalIcon(sig.type);
            const severityVariant = getSeverityBadge(sig.severity);

            return (
              <div
                key={sig.id || idx}
                className="p-3.5 bg-white rounded-xl border border-slate-200/90 hover:border-purple-200 hover:shadow-xs transition-all flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-900">
                      {sig.type}
                    </h5>
                    <Badge variant={severityVariant} size="sm">
                      {sig.severity} Severity
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sig.explanation || sig.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Framing taxonomy: 6 cognitive dimensions</span>
        <span>Neural rhetoric classifier</span>
      </div>
    </Card>
  );
}
