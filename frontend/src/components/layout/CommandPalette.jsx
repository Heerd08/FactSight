import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  FileText,
  Globe,
  Bookmark,
  History,
  BarChart3,
  Network,
  HelpCircle,
  Settings,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Command
} from 'lucide-react';
import { getStoredHistory } from '../../services/storage';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [historyItems, setHistoryItems] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setHistoryItems(getStoredHistory().slice(0, 4));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationCommands = [
    { label: 'Verification Dashboard', path: '/dashboard', icon: Sparkles, section: 'Navigation' },
    { label: 'Verification Analytics', path: '/analytics', icon: BarChart3, section: 'Navigation' },
    { label: 'Evaluation History', path: '/history', icon: History, section: 'Navigation' },
    { label: 'Saved Reports Dossier', path: '/saved-reports', icon: Bookmark, section: 'Navigation' },
    { label: 'Source Insights Network', path: '/source-insights', icon: Network, section: 'Navigation' },
    { label: 'How It Works & Methodology', path: '/how-it-works', icon: HelpCircle, section: 'Navigation' },
    { label: 'Platform Settings', path: '/settings', icon: Settings, section: 'System' },
  ];

  const filteredCommands = navigationCommands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredHistory = historyItems.filter((h) =>
    (h.content || h.claim || '').toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectRoute = (path) => {
    onClose();
    navigate(path);
  };

  const handleSelectHistory = (item) => {
    onClose();
    navigate('/results');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports, claims, sources, or navigate..."
            className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List Body */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
          {/* Quick Navigation Commands */}
          <div className="py-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Navigation
            </div>
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.path}
                    onClick={() => handleSelectRoute(cmd.path)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-700 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-indigo-100/70 text-slate-500 group-hover:text-indigo-600 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{cmd.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-2 text-xs text-slate-400 italic">No matching pages found.</p>
            )}
          </div>

          {/* Recent Claims from session/storage */}
          {filteredHistory.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Recent Verifications
              </div>
              {filteredHistory.map((item, idx) => (
                <button
                  key={item.id || idx}
                  onClick={() => handleSelectHistory(item)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate max-w-sm">{item.content || item.claim}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                    {item.formattedDate || item.id}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">ESC</span>
            <span>to close</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>FactSight AI Global Command</span>
          </div>
        </div>
      </div>
    </div>
  );
}
