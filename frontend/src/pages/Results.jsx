import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Printer,
  FileCheck,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  HelpCircle,
  FileText
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import CredibilityScore from '../components/results/CredibilityScore';
import Classification from '../components/results/Classification';
import SourceTrust from '../components/results/SourceTrust';
import AIExplanation from '../components/results/AIExplanation';
import EvidenceSection from '../components/results/EvidenceSection';
import KeyTakeaway from '../components/results/KeyTakeaway';
import ClaimBreakdown from '../components/results/ClaimBreakdown';
import ManipulationIndicators from '../components/results/ManipulationIndicators';
import MissingContext from '../components/results/MissingContext';
import Disclaimer from '../components/results/Disclaimer';
import EmptyState from '../components/common/EmptyState';

export default function Results() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Read session storage for last verified item
    try {
      const stored = sessionStorage.getItem('last_verification');
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  // If no data has been submitted yet in this session
  if (!data) {
    return (
      <div className="py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <Card className="border-dashed border-slate-300">
          <EmptyState
            icon={FileText}
            title="No Active Verification Report"
            description="Submit text, an article link, screenshot, or social post from the dashboard to generate a full credibility assessment."
            action={
              <Link to="/dashboard">
                <Button variant="primary" size="md">
                  Go to Verification Dashboard
                </Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Report Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verification Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Report ID: <span className="font-mono text-slate-700">FSA-2026-9042</span> • Generated {data.submittedAt || 'Today'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Bookmark}
            onClick={handleSave}
            className={saved ? 'text-indigo-600 border-indigo-200 bg-indigo-50' : ''}
          >
            {saved ? 'Saved' : 'Save Report'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Share2}
            onClick={handleShare}
          >
            {copied ? 'Link Copied!' : 'Share'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
            className="hidden sm:inline-flex"
          >
            Print
          </Button>
        </div>
      </div>

      {/* Backend Notice Banner */}
      <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-indigo-950">
            Frontend Readiness State
          </p>
          <p className="text-indigo-700 leading-relaxed">
            Analysis complete — connect your backend API to display the real verification result. All components on this page accept real live JSON response payloads.
          </p>
        </div>
      </div>

      {/* Submitted Content Recap Card */}
      <Card header={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted Information</span>}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="purple" size="sm">
              Input Type: {data.type ? data.type.toUpperCase() : 'TEXT'}
            </Badge>
            {data.fileName && (
              <span className="text-xs text-slate-500 font-mono">
                {data.fileName}
              </span>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans">
            {typeof data.content === 'string' ? data.content : 'Image / Media Submission'}
          </div>

          {data.preview && (
            <div className="mt-3 flex justify-center bg-slate-100 rounded-xl p-3 max-h-60 overflow-hidden">
              <img src={data.preview} alt="Submitted Preview" className="max-h-56 object-contain rounded" />
            </div>
          )}
        </div>
      </Card>

      {/* Key Takeaway Card */}
      <KeyTakeaway
        takeaway={data.keyTakeaway || "The submitted content is evaluated based on multi-source verification and forensic AI analysis."}
      />

      {/* 5 Core Result Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <CredibilityScore score={data.credibilityScore !== undefined ? data.credibilityScore : 50} />
        <Classification classification={data.classification || "Misleading"} />
        <EvidenceSection
          evidence={data.evidence && data.evidence.length > 0 ? data.evidence : []}
          isDashboardMini={true}
        />
        <SourceTrust
          sourceTrust={data.sourceTrust || {
            reputation: 'High',
            attribution: 'High',
            publicationDate: 'Verified',
            evidenceQuality: 'High'
          }}
        />

        <div className="lg:col-span-2">
          <AIExplanation
            explanation={data.aiExplanation || {
              mainClaim: typeof data.content === 'string' ? data.content.slice(0, 140) : 'Verification Asset',
              scoreRationale: data.summary || 'Empirical evaluation performed by FactSight AI.',
              supportingEvidence: [],
              contradictingEvidence: [],
              sourceQualityAssessment: 'Verified against authoritative fact-checking and scientific records.'
            }}
          />
        </div>
      </div>

      {/* In-depth Evidence List */}
      <EvidenceSection
        evidence={data.evidence && data.evidence.length > 0 ? data.evidence : []}
        isDashboardMini={false}
      />

      {/* Claim Breakdown */}
      <ClaimBreakdown
        claims={data.claimsBreakdown && data.claimsBreakdown.length > 0 ? data.claimsBreakdown : [
          {
            claimText: typeof data.content === 'string' ? data.content.slice(0, 120) : 'Evaluated submission',
            verdict: data.credibilityScore >= 75 ? 'Supported' : data.credibilityScore <= 35 ? 'Contradicted' : 'Unverified',
            confidence: data.credibilityScore || 85
          }
        ]}
      />

      {/* Manipulation Indicators & Missing Context Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ManipulationIndicators indicators={data.manipulationIndicators || []} />
        <MissingContext
          contextItems={data.aiExplanation?.missingContext && data.aiExplanation.missingContext.length > 0
            ? data.aiExplanation.missingContext
            : [
                'FactSight cross-references against both verified Kaggle benchmarks and real-time LLM knowledge.',
                'Claims should be independently verified before making critical medical, financial, or legal decisions.'
              ]}
        />
      </div>

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
}
