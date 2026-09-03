import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Database, Cpu, Globe2, Activity, CheckCircle2 } from 'lucide-react';

export default function LoadingState({
  title = 'INITIATING INVESTIGATION',
  message = 'Executing verification sequence through FactSight intelligence network.',
}) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { label: 'USER INPUT', icon: Globe2 },
    { label: 'REACT FRONTEND', icon: Activity },
    { label: 'BACKEND API', icon: Database },
    { label: 'ML / AI MODEL', icon: Cpu },
    { label: 'SOURCE + EVIDENCE CHECKING', icon: SearchIcon },
    { label: 'CREDIBILITY SCORE', icon: Sparkles },
    { label: 'FRONTEND RESULT', icon: CheckCircle2 }
  ];

  // Helper icon for search since it's not imported directly in the array
  function SearchIcon(props) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    );
  }

  useEffect(() => {
    // Simulate progression through the architecture flow
    const interval = setInterval(() => {
      setActiveStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 400); // Progress every 400ms

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-space-cadet/50 rounded-2xl border border-slate-gray/30 shadow-2xl relative overflow-hidden text-center">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-tan/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative mb-8 z-10">
        <div className="w-16 h-16 rounded-2xl bg-tan/10 border border-tan/30 flex items-center justify-center text-tan shadow-[0_0_15px_rgba(213,184,147,0.2)]">
          <ShieldCheck className="w-8 h-8 animate-pulse" />
        </div>
        <div className="absolute -inset-2 border border-tan/20 rounded-2xl animate-[spin_4s_linear_infinite]" />
      </div>

      <h3 className="text-lg font-heading font-bold text-white tracking-widest mb-2 z-10">{title}</h3>
      <p className="text-xs text-slate-gray max-w-md leading-relaxed mb-10 uppercase tracking-widest z-10">{message}</p>

      {/* Architecture Flow Pipeline */}
      <div className="flex flex-col w-full max-w-md gap-3 z-10">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStep;
          const isPast = index < activeStep;

          let bgClass = 'bg-slate-gray/5 border-slate-gray/10';
          let textClass = 'text-slate-gray/50';
          let iconClass = 'text-slate-gray/30';

          if (isPast) {
            bgClass = 'bg-slate-gray/20 border-slate-gray/40';
            textClass = 'text-white';
            iconClass = 'text-slate-gray';
          } else if (isActive) {
            bgClass = 'bg-tan/10 border-tan/40 shadow-[0_0_10px_rgba(213,184,147,0.2)]';
            textClass = 'text-tan font-bold';
            iconClass = 'text-tan animate-pulse';
          }

          return (
            <div key={step.label} className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 ${bgClass}`}>
              <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center shrink-0">
                <Icon className={`w-4 h-4 ${iconClass}`} />
              </div>
              <div className="flex-1 text-left">
                <span className={`text-[10px] uppercase tracking-widest ${textClass}`}>
                  {step.label}
                </span>
              </div>
              <div className="shrink-0">
                {isPast ? (
                  <CheckCircle2 className="w-4 h-4 text-tan" />
                ) : isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-tan animate-ping mr-1" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-gray/20 mr-1" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
