import React from 'react';
import { ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-bold text-base text-slate-900">
                FactSight <span className="text-indigo-600">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI-powered misinformation detection and credibility assessment platform. Empowering readers with clear evidence and source transparency.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Verification Dashboard</Link></li>
              <li><Link to="/results" className="hover:text-indigo-600 transition-colors">Report View</Link></li>
              <li><Link to="/history" className="hover:text-indigo-600 transition-colors">Analysis History</Link></li>
              <li><Link to="/source-insights" className="hover:text-indigo-600 transition-colors">Source Insights</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Resources</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/how-it-works" className="hover:text-indigo-600 transition-colors">How FactSight Works</Link></li>
              <li><Link to="/settings" className="hover:text-indigo-600 transition-colors">Settings & Privacy</Link></li>
              <li><span className="text-slate-400 cursor-not-allowed">Browser Extension (Soon)</span></li>
              <li><span className="text-slate-400 cursor-not-allowed">API Documentation</span></li>
            </ul>
          </div>

          {/* Disclaimer & Transparency */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Transparency</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              FactSight AI provides credibility indicators for educational purposes. We encourage users to verify primary sources and context.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="text-xs font-medium text-indigo-600">v2.0 (Dual-DB & RAG Edition)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} FactSight AI. Built for misinformation detection and truth verification.</p>
          <div className="flex items-center gap-6">
            <Link to="/how-it-works" className="hover:text-slate-600 transition-colors">Methodology</Link>
            <Link to="/settings" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link to="/settings" className="hover:text-slate-600 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
