import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  UserCircle2
} from 'lucide-react';

export default function Header({ onMenuToggle }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const sessionData = JSON.parse(localStorage.getItem('factsight_session') || '{}');
  const userName = sessionData?.user?.name || 'Heer';

  return (
    <header className="sticky top-0 z-30 h-16 bg-space-cadet/95 backdrop-blur-md border-b border-slate-gray/20 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Welcome Message */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-gray hover:text-white hover:bg-slate-gray/20 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-sm font-heading font-bold text-white tracking-wide">
            Welcome back, {userName}.
          </span>
          <span className="text-[10px] text-slate-gray tracking-widest uppercase">
            Your misinformation intelligence center.
          </span>
        </div>
      </div>

      {/* Right: Utility Icons & User Avatar */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Search Icon */}
        <button
          className="text-slate-gray hover:text-tan transition-colors cursor-pointer"
          aria-label="Search Investigations"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-gray hover:text-tan transition-colors relative cursor-pointer"
            aria-label="View Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-tan ring-2 ring-space-cadet"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-72 bg-space-cadet border border-slate-gray/30 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-gray/20 flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white uppercase tracking-widest">Alerts</span>
                <span className="text-[9px] font-bold text-space-cadet bg-tan px-2 py-0.5 rounded-full uppercase">
                  1 unread
                </span>
              </div>
              <div className="p-3 text-left hover:bg-slate-gray/10 transition-colors border-l-2 border-tan bg-slate-gray/5">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <p className="text-xs font-bold text-white">Analysis Complete</p>
                  <span className="text-[9px] text-slate-gray shrink-0 uppercase">Just now</span>
                </div>
                <p className="text-[11px] text-slate-gray line-clamp-2 leading-relaxed">
                  Your recent submission "Digital payment policy..." has finished processing.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-gray/30 hidden sm:block" />

        {/* User Avatar */}
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-slate-gray/10 border border-slate-gray/30 flex items-center justify-center text-white">
            <UserCircle2 className="w-5 h-5 text-tan" />
          </div>
        </button>
      </div>
    </header>
  );
}
