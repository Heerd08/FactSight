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
    { id: 'extension', label: 'Browser Extension', icon: Puzzle, isBadge: 'Soon' },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer select-none ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {tab.isBadge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.isBadge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
