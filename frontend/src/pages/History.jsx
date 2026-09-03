import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, Trash2, ArrowUpRight, ShieldCheck, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('factsight_history') || '[]');
    if (saved.length === 0) {
      // Default sample items
      const sample = [
        {
          id: 'FSA-1049',
          title: 'NASA confirms Artemis lunar mission trajectory schedule and milestones',
          type: 'text',
          classification: 'Genuine',
          credibilityScore: 95,
          timestamp: 'Today, 2:15 PM',
        },
        {
          id: 'FSA-1048',
          title: 'Viral post claiming microwave ovens delete cellular DNA sequence',
          type: 'social',
          classification: 'Fake',
          credibilityScore: 12,
          timestamp: 'Yesterday',
        },
        {
          id: 'FSA-1047',
          title: 'Global oil production decreased 80% overnight according to forum leak',
          type: 'url',
          classification: 'Fake',
          credibilityScore: 18,
          timestamp: 'Sep 2, 2026',
        }
      ];
      setHistoryItems(sample);
    } else {
      setHistoryItems(saved);
    }
  }, []);

  const handleClearHistory = () => {
    localStorage.removeItem('factsight_history');
    setHistoryItems([]);
  };

  const filtered = historyItems.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.classification?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadgeVariant = (cls) => {
    switch (cls) {
      case 'Genuine': return 'success';
      case 'Misleading': return 'warning';
      case 'Fake': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analysis History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review past verifications, scores, and RAG evidence audits.
          </p>
        </div>

        {historyItems.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={handleClearHistory}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 self-start sm:self-auto"
          >
            Clear History
          </Button>
        )}
      </div>

      {/* Search Filter */}
      {historyItems.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search past verification queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>
      )}

      {/* History Table */}
      {filtered.length > 0 ? (
        <Card padding="p-0" className="overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.fullResult) {
                    navigate('/results', { state: { data: { content: item.title, type: item.type }, result: item.fullResult } });
                  } else {
                    navigate('/dashboard');
                  }
                }}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-semibold text-slate-400">{item.id}</span>
                    <Badge variant={getBadgeVariant(item.classification)} size="sm">
                      {item.classification}
                    </Badge>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">• {item.timestamp}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                    {item.title}
                  </h4>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-mono font-extrabold text-slate-800">
                      {item.credibilityScore}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">Score</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={HistoryIcon}
          title="No verification history"
          description="Your analyzed claims and source audits will appear here."
          action={
            <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
              New Verification
            </Button>
          }
        />
      )}
    </div>
  );
}
