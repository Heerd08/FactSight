import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Search,
  Award,
  BarChart3,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Submit Information',
      icon: FileText,
      tagline: 'Multi-modal entry points',
      desc: 'Users input claims through five dynamic modalities: plain text paragraphs, online news URLs, screenshot images, forwarded email headers, or social media links.',
      detail: 'Our parsing pipeline sanitizes and formats the submitted payload, stripping tracking telemetry while preserving critical semantic context.'
    },
    {
      num: '02',
      title: 'Extract Claims',
      icon: Sparkles,
      tagline: 'Natural language entity identification',
      desc: 'The neural engine identifies key factual assertions, statistical metrics, timeline sequences, and named entity references.',
      detail: 'Subjective opinions and hyperbolic rhetoric are separated from testable, falsifiable factual claims.'
    },
    {
      num: '03',
      title: 'Find Evidence',
      icon: Search,
      tagline: 'Automated retrieval-augmented lookup',
      desc: 'FactSight searches verified knowledge archives, official public registries, academic journals, and reputable news wires for corroborating records.',
      detail: 'Citations are ranked by semantic relevance percentage, timestamp alignment, and domain credibility.'
    },
    {
      num: '04',
      title: 'Evaluate Sources',
      icon: Award,
      tagline: 'Multi-factor journalistic audit',
      desc: 'Publishers and authors are evaluated across reputation, explicit attribution, transparency of corrections, and primary data availability.',
      detail: 'We assign dynamic trust levels (High, Medium, Low, Unknown) to prevent echo-chamber reinforcement.'
    },
    {
      num: '05',
      title: 'Generate Assessment',
      icon: BarChart3,
      tagline: 'Explainable verdict & credibility index',
      desc: 'A comprehensive report is compiled with a 0-100 Credibility Score, standardized Classification tier, key takeaways, and transparent AI reasoning.',
      detail: 'Users receive actionable insights with direct links to primary evidence sources.'
    }
  ];

  return (
    <div className="space-y-10 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <Badge variant="purple" size="md" icon={HelpCircle}>
          System Architecture & Methodology
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How FactSight AI Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          An evidence-first pipeline designed to assess online information veracity with complete transparency and zero black-box scoring.
        </p>
      </div>

      {/* Critical Philosophy Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50/40 to-slate-50 rounded-2xl border border-indigo-100 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Our Core Verification Philosophy
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              "FactSight provides credibility indicators rather than absolute truth. Users should always review the underlying evidence, source attributions, and context before forming conclusions."
            </p>
          </div>
        </div>
      </div>

      {/* 5 Steps Interactive Stack */}
      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.num} hover className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-lg shrink-0 border border-indigo-100 font-mono">
                    {step.num}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {step.title}
                      </h3>
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50/80 px-2.5 py-0.5 rounded-full">
                        {step.tagline}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                      {step.desc}
                    </p>
                    <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                      <strong className="text-slate-700">Under the Hood:</strong> {step.detail}
                    </p>
                  </div>
                </div>

                <div className="hidden md:flex p-3 rounded-xl bg-slate-50 text-slate-400 self-center">
                  <Icon className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Final Action Callout */}
      <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
          Try the Verification Pipeline Now
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Test our verification interface with custom text, links, or uploaded screenshots.
        </p>
        <div>
          <Link to="/dashboard">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
