import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  Inbox,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  FileSearch,
  CheckCircle2
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import VerificationSelector from '../components/verification/VerificationSelector';
import TextInput from '../components/verification/TextInput';
import UrlInput from '../components/verification/UrlInput';
import ImageUpload from '../components/verification/ImageUpload';
import EmailInput from '../components/verification/EmailInput';
import SocialMediaInput from '../components/verification/SocialMediaInput';
import BrowserExtensionCard from '../components/verification/BrowserExtensionCard';
import CredibilityScore from '../components/results/CredibilityScore';
import Classification from '../components/results/Classification';
import EvidenceSection from '../components/results/EvidenceSection';
import SourceTrust from '../components/results/SourceTrust';
import AIExplanation from '../components/results/AIExplanation';
import KeyTakeaway from '../components/results/KeyTakeaway';
import Disclaimer from '../components/results/Disclaimer';
import LoadingState from '../components/common/LoadingState';
import {
  analyzeText,
  analyzeUrl,
  analyzeImage,
  analyzeEmail,
  analyzeSocialMedia
} from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [apiNotice, setApiNotice] = useState('');

  // Handle Analysis trigger
  const handleAnalyze = async (data) => {
    setIsLoading(true);
    setApiNotice('');

    try {
      let result;
      switch (data.type) {
        case 'text':
          result = await analyzeText(data.content);
          break;
        case 'url':
          result = await analyzeUrl(data.content);
          break;
        case 'image':
          result = await analyzeImage(data.file);
          break;
        case 'email':
          result = await analyzeEmail(data.content);
          break;
        case 'social':
          result = await analyzeSocialMedia(data.content);
          break;
        default:
          result = await analyzeText(data.content);
      }

      // Simulate a realistic processing delay for smooth UX transition
      setTimeout(() => {
        setIsLoading(false);
        setSubmittedData(data);
        setApiNotice('Analysis complete — connect your backend API to display the real verification result.');

        // Save submitted item to session storage so /results page can access context
        const sessionPayload = {
          type: data.type,
          content: data.content || data.fileName || 'Submitted content',
          preview: data.preview || null,
          fileName: data.fileName || null,
          sender: data.sender || null,
          submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'ready_for_backend'
        };
        sessionStorage.setItem('last_verification', JSON.stringify(sessionPayload));

        // Navigate to /results after a moment or scroll to results section
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1200);
    } catch (err) {
      setIsLoading(false);
      console.error('Verification error:', err);
    }
  };

  const handleGoToResultsPage = () => {
    navigate('/results');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verify information. Get real facts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            Engine Status: <strong className="text-indigo-600 font-semibold">Active</strong>
          </span>
        </div>
      </div>

      {/* Main Verification Card */}
      <div id="verify-section">
        <Card className="shadow-sm border-slate-200/90">
          <div className="max-w-3xl mb-6">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Source Verification Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              What would you like to verify today?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Paste any claim, news, social media post, or article link and let our AI analyze it with real evidence.
            </p>
          </div>

          {/* Verification Option Selector Tabs */}
          <div className="mb-6">
            <VerificationSelector activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Dynamic Tab Input Form */}
          <div className="bg-slate-50/50 p-4 sm:p-6 rounded-2xl border border-slate-200/70">
            {activeTab === 'text' && (
              <TextInput onAnalyze={handleAnalyze} isLoading={isLoading} />
            )}
            {activeTab === 'url' && (
              <UrlInput onAnalyze={handleAnalyze} isLoading={isLoading} />
            )}
            {activeTab === 'image' && (
              <ImageUpload onAnalyze={handleAnalyze} isLoading={isLoading} />
            )}
            {activeTab === 'email' && (
              <EmailInput onAnalyze={handleAnalyze} isLoading={isLoading} />
            )}
            {activeTab === 'social' && (
              <SocialMediaInput onAnalyze={handleAnalyze} isLoading={isLoading} />
            )}
            {activeTab === 'extension' && (
              <BrowserExtensionCard />
            )}
          </div>
        </Card>
      </div>

      {/* Loading Overlay State if actively verifying */}
      {isLoading && (
        <div className="animate-in fade-in duration-300">
          <LoadingState />
        </div>
      )}

      {/* Backend Notice Banner when verification request completed */}
      {apiNotice && (
        <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-indigo-950">{apiNotice}</p>
              <p className="text-[11px] text-indigo-700">
                Submitted input captured for processing. All components below are structured for live data.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleGoToResultsPage}
            icon={ArrowRight}
            iconPosition="right"
            className="shrink-0"
          >
            View Full Report
          </Button>
        </div>
      )}

      {/* Verification Results Section */}
      <div id="results-section" className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Verification Results
            </h3>
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              <span className={`w-1.5 h-1.5 rounded-full ${submittedData ? 'bg-indigo-600 animate-pulse' : 'bg-slate-400'}`}></span>
              {submittedData ? 'Analysis Ready' : 'Ready for analysis'}
            </span>
          </div>

          {submittedData && (
            <button
              onClick={() => {
                setSubmittedData(null);
                setApiNotice('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          )}
        </div>

        {/* Empty State before submission */}
        {!submittedData && !isLoading && (
          <Card className="border-dashed border-slate-300/80 bg-white/60">
            <div className="py-12 px-4 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mx-auto mb-4 shadow-2xs">
                <FileSearch className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">
                Your verification results will appear here.
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                Submit information above to begin analysis. FactSight will evaluate claim validity, source trust, cross-referenced citations, and neural rationale.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Supports Text, URLs, Screenshots, Emails, and Social Posts</span>
              </div>
            </div>
          </Card>
        )}

        {/* Five Core Result Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Credibility Score */}
          <CredibilityScore
            score={submittedData ? 85 : null}
            isPreview={!submittedData}
          />

          {/* Card 2: Classification */}
          <Classification
            classification={submittedData ? 'Genuine' : null}
          />

          {/* Card 3: Evidence (Mini summary for dashboard) */}
          <EvidenceSection
            evidence={submittedData ? [
              { id: '1', sourceName: 'Reuters Fact Check', relevanceScore: 94 },
              { id: '2', sourceName: 'Associated Press News', relevanceScore: 89 },
              { id: '3', sourceName: 'ScienceDirect Archive', relevanceScore: 82 },
            ] : []}
            isDashboardMini={true}
          />

          {/* Card 4: Source Trust */}
          <SourceTrust
            sourceTrust={submittedData ? {
              reputation: 'High',
              attribution: 'High',
              publicationDate: 'Verified',
              evidenceQuality: 'High'
            } : null}
          />

          {/* Card 5: AI Explanation (Spans 2 columns on lg screens) */}
          <div className="lg:col-span-2">
            <AIExplanation
              explanation={submittedData ? {
                mainClaim: typeof submittedData.content === 'string' ? submittedData.content.slice(0, 120) : 'Uploaded Media Claim',
                scoreRationale: 'Strong corroboration found across multiple high-trust journalistic and primary research archives with zero contradictory redactions.',
                supportingEvidence: [
                  'Consistent with primary findings documented in official peer-reviewed publications.',
                  'Direct quotations match publicly recorded press conferences and official transcripts.'
                ],
                contradictingEvidence: [],
                sourceQualityAssessment: 'Publishing domain maintains transparent editorial corrections policy and identifiable accredited journalist bylines.'
              } : null}
            />
          </div>
        </div>

        {/* Key Takeaway Card */}
        <KeyTakeaway
          takeaway={submittedData ? 'The evaluated claim is substantiated by verifiable primary sources and corroborated across high-credibility news organizations.' : null}
        />

        {/* Top Evidence Detailed Section */}
        <EvidenceSection
          evidence={submittedData ? [
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
          ] : []}
          isDashboardMini={false}
        />

        {/* Disclaimer */}
        <Disclaimer />
      </div>
    </div>
  );
}
