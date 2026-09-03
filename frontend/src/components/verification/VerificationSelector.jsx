import React from 'react';
import {
  FileText,
  Globe,
  Image as ImageIcon,
  Mail,
  Share2,
  Puzzle
} from 'lucide-react';

export default function VerificationSelector({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'text', label: 'Paste Text', icon: FileText },
    { id: 'url', label: 'Enter URL', icon: Globe },
    { id: 'image', label: 'Upload Image', icon: ImageIcon },
    { id: 'email', label: 'Email Verification', icon: Mail },
    { id: 'social', label: 'Social Media Link', icon: Share2 },
    { id: 'extension', label: 'Browser Extension', icon: Puzzle, badge: 'Coming Soon' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/70">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-500/10 border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full border border-amber-200/60">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
