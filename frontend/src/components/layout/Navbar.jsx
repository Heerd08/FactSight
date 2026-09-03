import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-space-cadet/90 backdrop-blur-md border-b border-slate-gray/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-tan flex items-center justify-center text-space-cadet shadow-md shadow-tan/20">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg text-white leading-tight tracking-tight flex items-center gap-1">
                FactSight <span className="text-tan">AI</span>
              </span>
              <span className="text-[10px] font-medium text-slate-gray uppercase tracking-wider">
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
                  isActive ? 'text-tan drop-shadow-[0_0_8px_rgba(213,184,147,0.4)]' : 'text-slate-gray hover:text-tan'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/how-it-works"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-tan drop-shadow-[0_0_8px_rgba(213,184,147,0.4)]' : 'text-slate-gray hover:text-tan'
                }`
              }
            >
              How It Works
            </NavLink>
            <NavLink
              to="/source-insights"
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? 'text-tan drop-shadow-[0_0_8px_rgba(213,184,147,0.4)]' : 'text-slate-gray hover:text-tan'
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
                Verify Claim
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-gray hover:text-white hover:bg-slate-gray/20 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-gray/30 bg-space-cadet px-4 pt-2 pb-6 space-y-3">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-gray hover:text-white hover:bg-slate-gray/20"
          >
            Home
          </NavLink>
          <NavLink
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-gray hover:text-white hover:bg-slate-gray/20"
          >
            How It Works
          </NavLink>
          <NavLink
            to="/source-insights"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-gray hover:text-white hover:bg-slate-gray/20"
          >
            Source Insights
          </NavLink>
          <div className="pt-2">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full">
                Verify Claim
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
