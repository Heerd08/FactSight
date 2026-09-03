import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, PlusCircle, ArrowRight } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

export default function SavedReports() {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bookmarked claims and evidence dossiers for easy reference and reporting.
          </p>
        </div>

        <Link to="/dashboard">
          <Button variant="primary" size="sm" icon={PlusCircle}>
            New Verification
          </Button>
        </Link>
      </div>

      {/* Empty State per instructions */}
      <Card className="border-dashed border-slate-300">
        <EmptyState
          icon={Bookmark}
          title="No saved reports yet."
          description="Bookmark important verification reports from the results screen to save them here for long-term reference and citation export."
          action={
            <Link to="/dashboard">
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                Explore Dashboard
              </Button>
            </Link>
          }
        />
      </Card>
    </div>
  );
}
