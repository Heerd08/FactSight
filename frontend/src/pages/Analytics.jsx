import React from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  ArrowUpRight,
  Globe,
  Database,
  Filter
} from 'lucide-react';
import Card from '../components/common/Card';
import MetricCard from '../components/common/MetricCard';
import ActivityLineChart from '../components/charts/ActivityLineChart';
import VerdictDonutChart from '../components/charts/VerdictDonutChart';
import ConfidenceBarChart from '../components/charts/ConfidenceBarChart';
import Badge from '../components/common/Badge';

export default function Analytics() {
  const topPublishers = [
    { domain: 'reuters.com', name: 'Reuters News', checks: 142, trustRate: '98.5%', status: 'High Trust' },
    { domain: 'apnews.com', name: 'Associated Press', checks: 118, trustRate: '97.8%', status: 'High Trust' },
    { domain: 'bbc.com', name: 'BBC News', checks: 95, trustRate: '96.2%', status: 'High Trust' },
    { domain: 'theguardian.com', name: 'The Guardian', checks: 74, trustRate: '92.4%', status: 'High Trust' },
    { domain: 'unverified-blog.xyz', name: 'Unattributed Wire', checks: 31, trustRate: '21.0%', status: 'Disputed' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verification Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry, claim veracity distributions, and source credibility index metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time Aggregation
          </span>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Claims Evaluated"
          value="823"
          change="+18.4%"
          isPositive={true}
          period="this month"
          icon={Layers}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />

        <MetricCard
          title="Verified Genuine Rate"
          value="52.0%"
          change="+4.2%"
          isPositive={true}
          period="vs prior period"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <MetricCard
          title="Disinformation Flagged"
          value="26.0%"
          change="-2.1%"
          isPositive={true}
          period="false claims"
          icon={XCircle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />

        <MetricCard
          title="Avg Confidence Score"
          value="88.6"
          subtitle="Out of 100 max index"
          icon={Sparkles}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Area Chart (7 cols) */}
        <div className="lg:col-span-7">
          <Card
            header={<h3 className="text-sm font-bold text-slate-800">Verification Activity Trend</h3>}
            headerAction={
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                Hourly Batch
              </span>
            }
          >
            <ActivityLineChart />
          </Card>
        </div>

        {/* Verdict Distribution Donut (5 cols) */}
        <div className="lg:col-span-5">
          <Card
            header={<h3 className="text-sm font-bold text-slate-800">Verdict Classification Breakdown</h3>}
          >
            <VerdictDonutChart />
          </Card>
        </div>
      </div>

      {/* Secondary Analytics Row: Confidence Distribution & Top Sources Audited */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confidence Range Bars (5 cols) */}
        <div className="lg:col-span-5">
          <Card
            header={<h3 className="text-sm font-bold text-slate-800">Confidence Score Distribution</h3>}
          >
            <ConfidenceBarChart />
          </Card>
        </div>

        {/* Publisher Trust Table (7 cols) */}
        <div className="lg:col-span-7">
          <Card
            header={<h3 className="text-sm font-bold text-slate-800">Most Frequently Cross-Referenced Publishers</h3>}
            padding="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-5 py-3">Publisher Domain</th>
                    <th className="px-4 py-3">Checks</th>
                    <th className="px-4 py-3">Trust Index</th>
                    <th className="px-5 py-3 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topPublishers.map((p) => (
                    <tr key={p.domain} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{p.domain}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">{p.checks}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-900 font-bold">{p.trustRate}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Badge
                          variant={p.status === 'High Trust' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
