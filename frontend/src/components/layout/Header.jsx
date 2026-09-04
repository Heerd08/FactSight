import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  UserCircle2,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Header({ onMenuToggle }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  const sessionData = JSON.parse(localStorage.getItem('factsight_session') || '{}');
  const userName = sessionData?.user?.name || 'Heer';

  return (
    <header className={`sticky top-0 z-30 h-16 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-all duration-300 border-b ${
      isDark 
        ? 'bg-space-cadet/95 border-slate-gray/20 text-white' 
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      {/* Left: Mobile Toggle & Welcome Message */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className={`lg:hidden p-2 rounded-lg transition-colors ${
            isDark 
              ? 'text-slate-gray hover:text-white hover:bg-slate-gray/20' 
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className={`text-sm font-heading font-bold tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Welcome back, {userName}.
          </span>
          <span className={`text-[10px] tracking-widest uppercase ${isDark ? 'text-slate-gray' : 'text-slate-500'}`}>
            Your misinformation intelligence center.
          </span>
        </div>
      </div>

      {/* Right: Utility Icons, Theme Toggle & User Avatar */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
            isDark
              ? 'border-white/10 bg-white/5 text-amber-300 hover:bg-white/10'
              : 'border-slate-200 bg-slate-100 text-indigo-600 hover:bg-slate-200/80'
          }`}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span className="hidden md:inline text-[11px] text-slate-300">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline text-[11px] text-slate-700">Dark</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`transition-colors relative cursor-pointer p-1.5 rounded-lg ${
              isDark ? 'text-slate-gray hover:text-tan' : 'text-slate-500 hover:text-indigo-600'
            }`}
            aria-label="View Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-tan ring-2 ring-space-cadet"></span>
          </button>

          {showNotifications && (
            <div className={`absolute right-0 mt-4 w-72 border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 ${
              isDark ? 'bg-space-cadet border-slate-gray/30' : 'bg-white border-slate-200 shadow-slate-200'
            }`}>
              <div className={`px-4 py-2 border-b flex items-center justify-between mb-1 ${
                isDark ? 'border-slate-gray/20' : 'border-slate-100'
              }`}>
                <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>Alerts</span>
                <span className="text-[9px] font-bold text-space-cadet bg-tan px-2 py-0.5 rounded-full uppercase">
                  1 unread
                </span>
              </div>
              <div className={`p-3 text-left transition-colors border-l-2 border-tan ${
                isDark ? 'hover:bg-slate-gray/10 bg-slate-gray/5' : 'hover:bg-slate-50 bg-slate-50/50'
              }`}>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Analysis Complete</p>
                  <span className="text-[9px] text-slate-400 shrink-0 uppercase">Just now</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  Your recent image verification has completed with 4 attention regions.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={`h-5 w-px hidden sm:block ${isDark ? 'bg-slate-gray/30' : 'bg-slate-200'}`} />

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${
            isDark 
              ? 'bg-slate-gray/10 border-slate-gray/30 text-tan' 
              : 'bg-indigo-50 border-indigo-200 text-indigo-700'
          }`}>
            <UserCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
