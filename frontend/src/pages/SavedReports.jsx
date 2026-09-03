import React, { useState } from 'react';
import { Bookmark, FileText, ArrowUpRight, Download, Trash2 } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';

export default function SavedReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([
    {
      id: 'REP-9042',
      title: 'Global Energy Transition Investment Report (2026 Audit)',
      date: 'Sep 3, 2026',
      verdict: 'Genuine',
      score: 88,
      sourcesCount: 3,
    },
    {
      id: 'REP-9041',
      title: 'Viral Phishing Solicitations & Spoofed Bank Alerts Analysis',
      date: 'Sep 1, 2026',
      verdict: 'Fake',
      score: 14,
      sourcesCount: 4,
    }
  ]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access bookmarked verification dossiers and exportable research reports.
          </p>
        </div>
      </div>

      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((rep) => (
            <Card key={rep.id} hover className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={rep.verdict === 'Genuine' ? 'success' : 'danger'} size="sm">
                    {rep.verdict}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    Score: {rep.score}/100
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {rep.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {rep.sourcesCount} Verified Citations • Saved on {rep.date}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  icon={FileText}
                  onClick={() => navigate('/results')}
                >
                  View Dossier
                </Button>
                <button
                  onClick={() => setReports(reports.filter(r => r.id !== rep.id))}
                  className="text-xs text-slate-400 hover:text-rose-600 p-1.5 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved reports"
          description="Bookmark comprehensive verification reports to view them here later."
          action={
            <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          }
        />
      )}
    </div>
  );
}
