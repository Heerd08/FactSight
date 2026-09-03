import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  PlusCircle,
  History,
  Bookmark,
  Network,
  HelpCircle,
  Info,
  Settings,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Verification', path: '/dashboard', icon: PlusCircle, isAction: true },
    { name: 'History', path: '/history', icon: History },
    { name: 'Saved Reports', path: '/saved-reports', icon: Bookmark },
    { name: 'Source Insights', path: '/source-insights', icon: Network },
  ];

  const secondaryNavItems = [
    { name: 'How It Works', path: '/how-it-works', icon: HelpCircle },
    { name: 'About Us', path: '/', icon: Info },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleNavClick = (item) => {
    if (onClose) onClose();
    if (item.isAction) {
      navigate('/dashboard');
      // Scroll to verify section if on dashboard
      setTimeout(() => {
        const el = document.getElementById('verify-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-2 mb-6">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-2.5 group cursor-pointer text-decoration-none"
              onClick={onClose}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-900 leading-tight tracking-tight flex items-center gap-1">
                  FactSight <span className="text-indigo-600">AI</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Credibility Engine
                </span>
              </div>
            </NavLink>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Navigation */}
          <div className="space-y-1">
            <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = !item.isAction && location.pathname === item.path;

              if (item.isAction) {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50/70 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100/80 transition-colors">
                      <Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span>{item.name}</span>
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Separator */}
          <div className="my-5 border-t border-slate-100" />

          {/* Secondary Navigation */}
          <div className="space-y-1">
            <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Platform & Settings
            </div>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive && item.path !== '/'
                        ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-slate-50 border border-indigo-100/80 shadow-2xs">
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Help fight misinformation</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
              Every verification helps build a more transparent and informed community.
            </p>
            <NavLink
              to="/how-it-works"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span>Learn More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
