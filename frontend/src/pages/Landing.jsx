import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  BarChart3,
  Network,
  Eye,
  Zap,
  Globe
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FD]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>AI-Powered Fact Verification & Credibility Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
              Verify Claims. <br className="hidden sm:inline" />
              Detect Misinformation. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Understand the Truth.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Evaluate news articles, viral claims, screenshots, emails, and social media posts with explainable AI, verifiable citations, and multi-source corroboration.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right" className="w-full shadow-lg shadow-indigo-500/25">
                  Start Fact Verification
                </Button>
              </Link>
              <Link to="/how-it-works" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  How FactSight Works
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-200/80 mt-12">
              <div className="p-3 text-center">
                <p className="text-2xl font-extrabold text-indigo-600 font-mono">99.4%</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Pipeline Uptime</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-2xl font-extrabold text-indigo-600 font-mono">&lt; 1.2s</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Verification Latency</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-2xl font-extrabold text-indigo-600 font-mono">50K+</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Indexed Fact Checks</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-2xl font-extrabold text-indigo-600 font-mono">100%</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Transparent RAG Citations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works 3-Step */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How FactSight AI Evaluates Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F8F9FD] border border-slate-200/80 relative hover:border-indigo-200 transition-all">
              <div className="text-3xl font-extrabold text-indigo-600/30 mb-4 font-mono">01</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Submit Any Content</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste claims, enter web article URLs, upload screenshots, inspect forwarded emails, or check social media posts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F9FD] border border-slate-200/80 relative hover:border-indigo-200 transition-all">
              <div className="text-3xl font-extrabold text-indigo-600/30 mb-4 font-mono">02</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">DeBERTa & RAG Analysis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                FactSight dissects assertions, inspects publication credentials, and searches vector databases for semantic corroboration.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F9FD] border border-slate-200/80 relative hover:border-indigo-200 transition-all">
              <div className="text-3xl font-extrabold text-indigo-600/30 mb-4 font-mono">03</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Understand the Evidence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review your Credibility Score, Source Trust metrics, AI Explanation, and specific verified citations.
              </p>
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
            Jump directly into the verification dashboard. Powered by DeBERTa-v3 and ChromaDB RAG.
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
