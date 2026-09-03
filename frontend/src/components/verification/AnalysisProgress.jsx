import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Database,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Loader2,
  BrainCircuit
} from 'lucide-react';

export default function AnalysisProgress({ onComplete, submittedText = '' }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(10);

  const stages = [
    { id: 1, title: 'Reading submitted content', detail: 'Parsing semantics, syntax, and raw context' },
    { id: 2, title: 'Identifying claims', detail: 'Isolating testable assertions and quantitative claims' },
    { id: 3, title: 'Searching for evidence', detail: 'Querying news archives, official databases, and peer reviews' },
    { id: 4, title: 'Evaluating sources', detail: 'Auditing domain reputation, publisher accountability, and bias' },
    { id: 5, title: 'Generating assessment', detail: 'Synthesizing evidence balance and credibility breakdown' },
  ];

  useEffect(() => {
    // Progress through the 5 stages with realistic AI pipeline timing
    const stepDuration = 700; // 700ms per stage -> ~3.5s total

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 500);
          return prev;
        }
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 98) {
          return prev + 2;
        }
        return 100;
      });
    }, 65);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="p-6 sm:p-10 bg-white rounded-2xl border border-indigo-100 shadow-lg text-left max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Analyzing claim...
            </h3>
            <p className="text-xs text-slate-500">
              Multi-source neural verification pipeline in progress
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
            {progress}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Submitted Content Snippet */}
      {submittedText && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 line-clamp-2 italic">
          "{submittedText}"
        </div>
      )}

      {/* 5 Animated Stages Timeline */}
      <div className="space-y-3 pt-2">
        {stages.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;
          const isPending = idx > currentStage;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-3.5 p-3 rounded-xl transition-all duration-200 ${
                isCurrent
                  ? 'bg-indigo-50/80 border border-indigo-200/80 shadow-2xs'
                  : isDone
                  ? 'bg-white border border-slate-100 text-slate-700'
                  : 'bg-slate-50/50 border border-transparent opacity-45'
              }`}
            >
              {/* Step Status Indicator */}
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center animate-spin">
                    <Loader2 className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center font-mono">
                    {stage.id}
                  </div>
                )}
              </div>

              {/* Step Details */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-indigo-950'
                        : isDone
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.title}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full animate-pulse">
                      Processing...
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-medium text-emerald-600">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {stage.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
