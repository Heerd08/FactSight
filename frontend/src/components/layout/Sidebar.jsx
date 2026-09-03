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
  UserCircle2
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const sessionData = JSON.parse(localStorage.getItem('factsight_session') || '{}');
  const userName = sessionData?.user?.name || 'Heer';

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Verify Claim', path: '/verify', icon: Search },
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
          className="fixed inset-0 bg-space-cadet/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#1A2436] border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.2)] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-2 mb-10">
            <NavLink
              to="/dashboard"
              className="flex items-center gap-3 group cursor-pointer text-decoration-none"
              onClick={onClose}
            >
              <div className="w-9 h-9 rounded-xl bg-tan/10 border border-tan/20 flex items-center justify-center text-tan shadow-lg shadow-tan/5 group-hover:bg-tan group-hover:text-space-cadet transition-all">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg text-white leading-tight tracking-wide">
                  FactSight <span className="text-tan">AI</span>
                </span>
                <span className="text-[9px] font-bold text-slate-gray uppercase tracking-widest">
                  Intelligence Center
                </span>
              </div>
            </NavLink>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-gray hover:text-white hover:bg-slate-gray/20 transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Navigation */}
          <div className="space-y-1">
            <div className="px-3 pb-3 text-[10px] font-bold text-slate-gray uppercase tracking-widest">
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
                        ? 'bg-tan/10 text-tan font-bold border-l-2 border-tan'
                        : 'text-slate-gray hover:bg-slate-gray/10 hover:text-white border-l-2 border-transparent'
                    }`
                  }
                >
                  <Icon className={`w-4 h-4 ${location.pathname === item.path ? 'text-tan' : 'text-slate-gray'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-4 border-t border-slate-gray/20 bg-slate-gray/5">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-gray/20 border border-slate-gray/40 flex items-center justify-center text-white">
              <UserCircle2 className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-wide uppercase">{userName}</span>
              <span className="text-[10px] text-tan font-bold uppercase tracking-widest">Verified User</span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-gray hover:bg-caput-mortuum/10 hover:text-caput-mortuum hover:border-caput-mortuum/30 border border-transparent transition-all uppercase tracking-widest"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
