import React from 'react';
import {
  FileText,
  Globe,
  Image as ImageIcon,
  Share2,
  Mail,
  Puzzle,
  Sparkles
} from 'lucide-react';

export default function VerificationTabs({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'text',
      title: 'Paste Text',
      desc: 'Raw claims, news excerpts, or headlines',
      icon: FileText,
    },
    {
      id: 'url',
      title: 'Analyze URL',
      desc: 'Full articles, blogs, or press releases',
      icon: Globe,
    },
    {
      id: 'image',
      title: 'Upload Screenshot',
      desc: 'Visual claims, infographics, OCR scan',
      icon: ImageIcon,
    },
    {
      id: 'social',
      title: 'Social Media',
      desc: 'Posts from X, Reddit, YouTube, TikTok',
      icon: Share2,
    },
    {
      id: 'email',
      title: 'Email',
      desc: 'Phishing hooks, sender claims, leaks',
      icon: Mail,
    },
    {
      id: 'extension',
      title: 'Browser Extension',
      desc: '1-click web companion',
      icon: Puzzle,
      badge: 'Coming Soon',
      isComingSoon: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
              isActive
                ? 'bg-white border-2 border-indigo-600 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-100/50'
                : 'bg-white/80 hover:bg-white border border-slate-200/90 hover:border-indigo-200 hover:shadow-xs'
            }`}
          >
            {/* Active Indicator Top Bar */}
            {isActive && (
              <span className="absolute top-0 inset-x-4 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-b-full" />
            )}

            {/* Icon & Badge */}
            <div className="flex items-center justify-between mb-3 w-full">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {tab.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
                  {tab.badge}
                </span>
              )}
            </div>

            {/* Title & Short Description */}
            <div>
              <h4
                className={`text-xs font-bold leading-tight mb-1 transition-colors ${
                  isActive ? 'text-indigo-950' : 'text-slate-800 group-hover:text-indigo-600'
                }`}
              >
                {tab.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {tab.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
