import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#1C273B] border-t border-coffee/30 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-tan/10 border border-tan/20 flex items-center justify-center text-tan shadow-xs">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-heading font-bold text-base text-white tracking-wide">
                FactSight <span className="text-tan">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-gray leading-relaxed pr-4">
              AI-powered misinformation detection and credibility assessment platform. Empowering readers with clear evidence and source transparency.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-[10px] font-bold text-tan uppercase tracking-widest mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs text-slate-gray">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Verification Dashboard</Link></li>
              <li><Link to="/results" className="hover:text-white transition-colors">Report View</Link></li>
              <li><Link to="/history" className="hover:text-white transition-colors">Analysis History</Link></li>
              <li><Link to="/source-insights" className="hover:text-white transition-colors">Source Insights</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[10px] font-bold text-tan uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs text-slate-gray">
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How FactSight Works</Link></li>
              <li><Link to="/settings" className="hover:text-white transition-colors">Settings & Privacy</Link></li>
              <li><span className="text-slate-gray/50 cursor-not-allowed">Browser Extension (Soon)</span></li>
              <li><span className="text-slate-gray/50 cursor-not-allowed">API Documentation</span></li>
            </ul>
          </div>

          {/* Disclaimer & Transparency */}
          <div>
            <h4 className="text-[10px] font-bold text-tan uppercase tracking-widest mb-4">Transparency</h4>
            <p className="text-xs text-slate-gray leading-relaxed mb-4">
              FactSight AI provides credibility indicators for educational purposes. We encourage users to verify primary sources and context.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-medium text-coffee tracking-wider">v2.0 (Dual-DB & RAG Edition)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-gray/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-gray">
          <p>© {new Date().getFullYear()} FactSight AI. Built for misinformation detection and truth verification.</p>
          <div className="flex items-center gap-6">
            <Link to="/how-it-works" className="hover:text-tan transition-colors">Methodology</Link>
            <Link to="/settings" className="hover:text-tan transition-colors">Privacy</Link>
            <Link to="/settings" className="hover:text-tan transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
