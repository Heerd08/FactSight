import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-slate-900 leading-tight tracking-tight flex items-center gap-1">
                FactSight <span className="text-indigo-600">AI</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Truth Verification
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/how-it-works"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
                }`
              }
            >
              How It Works
            </NavLink>
            <NavLink
              to="/source-insights"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
                }`
              }
            >
              Source Insights
            </NavLink>
          </div>

          {/* Right Action */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Home
          </NavLink>
          <NavLink
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            How It Works
          </NavLink>
          <NavLink
            to="/source-insights"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Source Insights
          </NavLink>
          <div className="pt-2">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
