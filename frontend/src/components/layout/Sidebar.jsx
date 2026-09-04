import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Search,
  History,
  Network,
  Settings,
  X,
  LogOut,
  UserCircle2,
  Flame
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const sessionData = JSON.parse(localStorage.getItem('factsight_session') || '{}');
  const userName = sessionData?.user?.name || 'Heer';

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Verify Claim', path: '/verify', icon: Search },
    { name: 'XAI Heatmap', path: '/results', icon: Flame },
    { name: 'Investigations', path: '/investigations', icon: History },
    { name: 'Insights', path: '/insights', icon: Network },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('factsight_session');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r shadow-2xl flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDark 
            ? 'bg-[#1A2436] border-white/5 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-2 mb-8">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-3 group cursor-pointer text-decoration-none"
              onClick={onClose}
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                isDark 
                  ? 'bg-tan/10 border-tan/20 text-tan shadow-lg shadow-tan/5 group-hover:bg-tan group-hover:text-space-cadet' 
                  : 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-md group-hover:bg-indigo-600 group-hover:text-white'
              }`}>
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className={`font-heading font-bold text-lg leading-tight tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  FactSight <span className={isDark ? "text-tan" : "text-indigo-600"}>AI</span>
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-gray' : 'text-slate-400'}`}>
                  Intelligence Center
                </span>
              </div>
            </NavLink>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className={`lg:hidden p-1.5 rounded-lg transition-colors ${
                isDark ? 'text-slate-gray hover:text-white hover:bg-slate-gray/20' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Navigation */}
          <div className="space-y-1">
            <div className={`px-3 pb-3 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-gray' : 'text-slate-400'}`}>
              Command Center
            </div>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? isDark
                          ? 'bg-tan/10 text-tan font-bold border-l-2 border-tan'
                          : 'bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600'
                        : isDark
                          ? 'text-slate-gray hover:bg-slate-gray/10 hover:text-white border-l-2 border-transparent'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent'
                    }`
                  }
                >
                  <Icon className={`w-4 h-4 ${
                    location.pathname === item.path 
                      ? (isDark ? 'text-tan' : 'text-indigo-600') 
                      : (isDark ? 'text-slate-gray' : 'text-slate-400')
                  }`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className={`p-4 border-t ${
          isDark ? 'border-slate-gray/20 bg-slate-gray/5' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${
              isDark ? 'bg-slate-gray/20 border-slate-gray/40 text-white' : 'bg-indigo-100 border-indigo-200 text-indigo-700'
            }`}>
              <UserCircle2 className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold tracking-wide uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{userName}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-tan' : 'text-indigo-600'}`}>Verified Analyst</span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold border border-transparent transition-all uppercase tracking-widest ${
              isDark 
                ? 'text-slate-gray hover:bg-caput-mortuum/10 hover:text-rose-400 hover:border-caput-mortuum/30' 
                : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
