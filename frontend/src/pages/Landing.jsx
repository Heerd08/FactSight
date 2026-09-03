import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  ArrowRight,
  Database,
  CheckCircle2,
  Globe
} from 'lucide-react';
import Button from '../components/common/Button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-space-cadet">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-28 sm:pb-32 overflow-hidden">
        {/* Subtle organic shapes for the hero */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] opacity-30 pointer-events-none">
          <div className="absolute top-10 left-10 w-[400px] h-[400px] rounded-full bg-coffee/20 blur-3xl mix-blend-screen" />
          <div className="absolute top-32 right-10 w-[500px] h-[500px] rounded-full bg-slate-gray/20 blur-3xl mix-blend-screen" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-gray/10 border border-slate-gray/30 text-tan text-[11px] font-semibold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI-Powered Fact Verification</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-white tracking-tight leading-tight sm:leading-none">
              DON'T JUST READ IT. <br className="hidden sm:inline" />
              <span className="text-tan italic">VERIFY IT.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-gray leading-relaxed max-w-2xl mx-auto font-normal">
              Evaluate news articles, viral claims, screenshots, emails, and social media posts with explainable AI, verifiable citations, and multi-source corroboration.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" className="w-full">
                  Verify a Claim
                </Button>
              </Link>
              <Link to="/how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  How It Works
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-slate-gray/20 mt-16">
              <div className="p-2 text-center">
                <p className="text-3xl font-heading font-bold text-tan">99.4%</p>
                <p className="text-xs text-slate-gray mt-1 uppercase tracking-wider">Pipeline Uptime</p>
              </div>
              <div className="p-2 text-center">
                <p className="text-3xl font-heading font-bold text-tan">&lt; 1.2s</p>
                <p className="text-xs text-slate-gray mt-1 uppercase tracking-wider">Verification Latency</p>
              </div>
              <div className="p-2 text-center">
                <p className="text-3xl font-heading font-bold text-tan">50K+</p>
                <p className="text-xs text-slate-gray mt-1 uppercase tracking-wider">Indexed Fact Checks</p>
              </div>
              <div className="p-2 text-center">
                <p className="text-3xl font-heading font-bold text-tan">100%</p>
                <p className="text-xs text-slate-gray mt-1 uppercase tracking-wider">Transparent Citations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-[#1C273B] border-y border-coffee/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold text-tan uppercase tracking-widest">
              Investigation Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-3">
              How FactSight Evaluates Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-space-cadet border border-slate-gray/20 hover:border-tan/40 transition-colors relative group">
              <div className="text-4xl font-heading font-bold text-slate-gray/30 mb-6 group-hover:text-tan/30 transition-colors">01</div>
              <h3 className="text-lg font-heading font-bold text-white mb-3">Submit Evidence</h3>
              <p className="text-sm text-slate-gray leading-relaxed">
                Paste claims, enter web article URLs, upload screenshots, inspect forwarded emails, or check social media posts.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-space-cadet border border-slate-gray/20 hover:border-tan/40 transition-colors relative group">
              <div className="text-4xl font-heading font-bold text-slate-gray/30 mb-6 group-hover:text-tan/30 transition-colors">02</div>
              <h3 className="text-lg font-heading font-bold text-white mb-3">AI & Database Analysis</h3>
              <p className="text-sm text-slate-gray leading-relaxed">
                FactSight dissects assertions, inspects publication credentials, and searches vector databases for semantic corroboration.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-space-cadet border border-slate-gray/20 hover:border-tan/40 transition-colors relative group">
              <div className="text-4xl font-heading font-bold text-slate-gray/30 mb-6 group-hover:text-tan/30 transition-colors">03</div>
              <h3 className="text-lg font-heading font-bold text-white mb-3">Review Findings</h3>
              <p className="text-sm text-slate-gray leading-relaxed">
                Review the Credibility Score, Source Trust metrics, Editorial Explanation, and explicitly verified citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-space-cadet relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(111,77,56,0.15)_0,rgba(37,52,79,1)_100%)]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            Ready to Investigate?
          </h2>
          <p className="text-base text-slate-gray max-w-xl mx-auto leading-relaxed">
            Jump directly into the investigation workspace and start verifying claims with enterprise-grade accuracy.
          </p>
          <div className="pt-6">
            <Link to="/dashboard">
              <Button
                variant="primary"
                size="lg"
              >
                Launch Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
