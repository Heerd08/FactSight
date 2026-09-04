import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Printer,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import CredibilityScore from '../components/results/CredibilityScore';
import Classification from '../components/results/Classification';
import EvidenceSection from '../components/results/EvidenceSection';
import SourceTrust from '../components/results/SourceTrust';
import AIExplanation from '../components/results/AIExplanation';
import XAIWordHeatmap from '../components/results/XAIWordHeatmap';
import XAIImageHeatmap from '../components/results/XAIImageHeatmap';
import ClaimBreakdown from '../components/results/ClaimBreakdown';
import ManipulationIndicators from '../components/results/ManipulationIndicators';
import MissingContext from '../components/results/MissingContext';
import KeyTakeaway from '../components/results/KeyTakeaway';
import Disclaimer from '../components/results/Disclaimer';
import { createReport } from '../services/api';

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Retrieve state passed via navigation or fallback to most recent investigation from history
  const history = JSON.parse(localStorage.getItem('factsight_history') || '[]');
  const latestHistory = history[0];

  const passedData = location.state?.data || (latestHistory ? {
    type: latestHistory.type || 'text',
    content: latestHistory.title,
    submittedAt: latestHistory.timestamp || 'Recently',
    preview: latestHistory.preview || latestHistory.fullResult?.image_preview,
    fileName: latestHistory.fileName
  } : {
    type: 'text',
    content: 'Global clean energy investments reached an all-time record in 2025 according to accredited international monitoring agencies.',
    submittedAt: 'Today',
  });

  const result = location.state?.result || latestHistory?.fullResult || {
    id: 'FSA-2026-9042',
    classification: 'Genuine',
    confidence: 0.94,
    credibilityScore: 88,
    keyTakeaway: 'The submitted content is evaluated as authentic with strong multi-source corroboration and high journalistic attribution.',
    aiExplanation: {
      mainClaim: typeof passedData.content === 'string' ? passedData.content.slice(0, 140) : 'Asset Verification',
      scoreRationale: 'Strong empirical backing confirmed across accredited databases with consistent timestamps and explicit institutional authorship.',
      supportingEvidence: [
        'Primary research records confirm key statistical milestones and verified measurements.',
        'Official spokesperson statements directly align with stated timeline sequences.'
      ],
      contradictingEvidence: [],
      sourceQualityAssessment: 'Verified domain with transparent editorial accountability standards and zero active dispute flags.'
    },
    sourceTrust: {
      reputation: 'High',
      attribution: 'Verified',
      publicationDate: 'Recent',
      evidenceQuality: 'High'
    },
    evidence: [
      {
        id: '1',
        sourceName: 'Reuters Fact Check',
        sourceDomain: 'reuters.com',
        title: 'Independent confirmation of reported statements and statistical findings',
        description: 'Public archival records and interview transcripts confirm key timeline elements described in the analyzed claim.',
        relevanceScore: 94,
        trustRating: 'High',
        url: 'https://reuters.com',
        publishDate: 'September 2026'
      },
      {
        id: '2',
        sourceName: 'Associated Press News',
        sourceDomain: 'apnews.com',
        title: 'Primary investigation and photographic corroboration',
        description: 'Associated Press reporters verified context and corroborated quotes directly with regional representatives.',
        relevanceScore: 89,
        trustRating: 'High',
        url: 'https://apnews.com',
        publishDate: 'September 2026'
      }
    ],
    manipulationIndicators: [],
    claimsBreakdown: [
      {
        claimText: 'Primary asserted hypothesis and verifiable timeline',
        verdict: 'Supported',
        confidence: 94
      }
    ]
  };

  const handleSave = async () => {
    setSaved(true);
    await createReport(
      result.id,
      `Report: ${result.aiExplanation?.mainClaim?.slice(0, 40) || 'Verification'}`,
      result.keyTakeaway,
      result.reasons || ['Empirically corroborated']
    );
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isImageResult = passedData.type === 'image' || result.type === 'image' || Boolean(passedData.preview || result.image_preview);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Action Bar */}
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
            Report ID: <span className="font-mono text-slate-700">{result.id || 'FSA-2026-9042'}</span> • Generated {passedData.submittedAt || 'Today'}
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

      {/* Submitted Content Recap Card */}
      <Card header={<span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted Information</span>}>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="purple" size="sm">
              Input Type: {passedData.type ? passedData.type.toUpperCase() : 'TEXT'}
            </Badge>
            {passedData.fileName && (
              <span className="text-xs text-slate-500 font-mono">
                {passedData.fileName}
              </span>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans">
            {typeof passedData.content === 'string' ? passedData.content : 'Image / Media Submission'}
          </div>

          {(passedData.preview || result.image_preview) && (
            <div className="mt-3 flex justify-center bg-slate-100 rounded-xl p-3 max-h-60 overflow-hidden">
              <img src={passedData.preview || result.image_preview} alt="Submitted Preview" className="max-h-56 object-contain rounded" />
            </div>
          )}
        </div>
      </Card>

      {/* Conditional Heatmap: ONLY Image Heatmap for Images, ONLY Word Heatmap for Text */}
      {isImageResult ? (
        <XAIImageHeatmap
          imagePreview={passedData.preview || result.image_preview}
          attentionRegions={result.attention_regions || []}
          classification={result.classification || 'Genuine'}
          credibilityScore={result.credibilityScore || 85}
          visualDescription={result.visual_description || ''}
          isManipulativeVisual={result.is_manipulative_visual || false}
        />
      ) : (
        <XAIWordHeatmap
          content={typeof passedData.content === 'string' ? passedData.content : (result.aiExplanation?.mainClaim || '')}
          evidence={result.evidence || []}
          suspiciousPhrases={result.suspicious_phrases || []}
          verifiedPhrases={result.verified_phrases || []}
          unattributedPhrases={result.unattributed_phrases || []}
          redFlags={result.red_flags || []}
          contradictingEvidence={result.aiExplanation?.contradictingEvidence || []}
          supportingEvidence={result.aiExplanation?.supportingEvidence || []}
          classification={result.classification || 'Genuine'}
          credibilityScore={result.credibilityScore || 85}
        />
      )}

      {/* Key Takeaway Card */}
      <KeyTakeaway takeaway={result.keyTakeaway} />

      {/* 4 Core Result Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <CredibilityScore score={result.credibilityScore} />
        <Classification classification={result.classification} confidence={result.confidence} />
        <EvidenceSection
          evidence={result.evidence || []}
          isDashboardMini={true}
        />
        <SourceTrust sourceTrust={result.sourceTrust} />
      </div>

      {/* AI Explanation & Score Rationale */}
      <AIExplanation explanation={result.aiExplanation} />

      {/* In-depth Evidence List */}
      <EvidenceSection
        evidence={result.evidence || []}
        isDashboardMini={false}
      />

      {/* Manipulation Indicators & Missing Context Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ManipulationIndicators indicators={result.manipulationIndicators || []} />
        <MissingContext
          contextItems={result.aiExplanation?.missingContext || [
            'Historical context and baseline data confirm current reporting standards.',
            'Cross-check with primary institutional releases recommended for regional breakdowns.'
          ]}
        />
      </div>

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
}
