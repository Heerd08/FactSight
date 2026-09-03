import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Filter,
  ArrowRight,
  PlusCircle,
  FileSearch,
  Clock,
  ExternalLink
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verification History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review and audit past claim evaluations and credibility reports.
          </p>
        </div>

        <Link to="/dashboard">
          <Button variant="primary" size="sm" icon={PlusCircle}>
            New Verification
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search previous verifications by claim or domain..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'text', 'urls', 'media'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State per instructions */}
      <Card className="border-dashed border-slate-300">
        <EmptyState
          icon={HistoryIcon}
          title="No verification history yet."
          description="When you analyze content, your previous reports will appear here with full timestamps, credibility ratings, and source citations."
          action={
            <Link to="/dashboard">
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                Start Your First Verification
              </Button>
            </Link>
          }
        />
      </Card>
    </div>
  );
}
