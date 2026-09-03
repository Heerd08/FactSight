import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Search,
  FileText,
  Layers,
  Globe,
  Lock,
  ChevronRight,
  Eye,
  BarChart3,
  Network
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-bold text-indigo-700 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Next-Gen Misinformation Detection Engine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                See the Facts. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600">
                  Know the Truth.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                FactSight AI helps you verify online information, evaluate source credibility, and understand the evidence behind claims.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="w-full shadow-lg shadow-indigo-500/25"
                  >
                    Start Verifying
                  </Button>
                </Link>

                <Link to="/how-it-works" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    How It Works
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>5-Layer Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Transparent Source Citations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Explainable AI Rationale</span>
                </div>
              </div>
            </div>

            {/* Right Hero Illustration / Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                {/* Floating Decorative Elements */}
                <div className="absolute -top-4 -left-4 bg-white p-3 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-500/10 flex items-center gap-2.5 z-20 animate-bounce" style={{ animationDuration: '6s' }}>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Source Authenticated</p>
                    <p className="text-[9px] text-emerald-600 font-medium">94% Confidence</p>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-500/10 flex items-center gap-2.5 z-20 animate-bounce" style={{ animationDuration: '7s' }}>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Cross-Referenced</p>
                    <p className="text-[9px] text-indigo-600 font-medium">12 Public Citations</p>
                  </div>
                </div>

                {/* Main Hero Visual Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-indigo-500/10 p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">factsight.engine/demo</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-mono">
                    "Scientists confirm new deep-sea coral species with natural bioluminescent properties in Pacific trench..."
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Credibility</span>
                      <span className="text-xl font-extrabold text-indigo-600">88/100</span>
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">High Trust</span>
                    </div>

                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Classification</span>
                      <span className="text-sm font-bold text-slate-800 block mt-1">Genuine</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">3 Peer Reviews</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-600 truncate">Oceanographic Institute Report</span>
                      <span className="text-emerald-600 font-semibold">96% Match</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-600 truncate">Marine Biology Journal Q2</span>
                      <span className="text-emerald-600 font-semibold">91% Match</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Verification Section */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              How FactSight Delivers Clarity
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Transparent, repeatable, and multi-sourced verification designed for individuals and researchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 01 */}
            <div className="p-6 rounded-2xl bg-[#F8F9FD] border border-slate-200/80 relative hover:border-indigo-200 transition-all">
              <div className="text-3xl font-extrabold text-indigo-600/30 mb-4 font-mono">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Submit Information</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste claims, enter web article URLs, upload screenshots, inspect forwarded emails, or check social media posts.
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-2xl bg-[#F8F9FD] border border-slate-200/80 relative hover:border-indigo-200 transition-all">
              <div className="text-3xl font-extrabold text-indigo-600/30 mb-4 font-mono">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Analysis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                FactSight dissects assertions, inspects publication credentials, and searches reputable databases for corroboration.
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-2xl bg-[#F8F9FD] border border-slate-200/80 relative hover:border-indigo-200 transition-all">
              <div className="text-3xl font-extrabold text-indigo-600/30 mb-4 font-mono">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Understand the Evidence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review your Credibility Score, Source Trust metrics, AI Explanation, and specific verified citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Capabilities Section */}
      <section id="about" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Built for Truth & Integrity
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                A Comprehensive Solution Against Disinformation
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Misinformation travels fast. FactSight provides an objective, evidence-first evaluation layer to help you determine what is genuine, what is misleading, and what lacks evidence.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Source Reputation & Attribution</h4>
                    <p className="text-xs text-slate-500">Examine publisher track records, author bylines, and domain transparency.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Multi-Modal Inputs</h4>
                    <p className="text-xs text-slate-500">Supports raw text, news URLs, image screenshots, emails, and social posts.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">No Opaque Black Boxes</h4>
                    <p className="text-xs text-slate-500">Every verdict is backed by explicit citations and verifiable primary links.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/dashboard">
                  <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                    Open FactSight Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Feature Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Eye className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">OCR & Media Scan</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Extracts claims directly from viral screenshots and meme formats.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                  <Network className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Source Insights</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Historical trustworthiness indexing across thousands of news outlets.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Credibility Index</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  0-100 algorithmic score based on empirical evidence strength.
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Privacy Conscious</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your submissions remain confidential and under your control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-14 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to Verify Your First Claim?
          </h2>
          <p className="text-sm text-indigo-100 max-w-xl mx-auto leading-relaxed">
            Jump directly into the verification dashboard. No credit card or account creation required for testing.
          </p>
          <div className="pt-2">
            <Link to="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-indigo-700 hover:bg-indigo-50 border-white font-bold shadow-lg"
              >
                Launch Verification Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
