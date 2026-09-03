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
  const [analysisResult, setAnalysisResult] = useState(null);
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

      setSubmittedData(data);
      setAnalysisResult(result);

      // Save to local session history for easy review
      const historyItem = {
        id: result.id || `FSA-${Date.now().toString().slice(-4)}`,
        title: typeof data.content === 'string' ? data.content.slice(0, 70) : (data.fileName || 'Asset Verification'),
        type: data.type || 'text',
        classification: result.classification || 'Genuine',
        credibilityScore: result.credibilityScore || 85,
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        fullResult: result
      };

      const existingHistory = JSON.parse(localStorage.getItem('factsight_history') || '[]');
      localStorage.setItem('factsight_history', JSON.stringify([historyItem, ...existingHistory.slice(0, 19)]));

    } catch (err) {
      console.error('Verification error:', err);
      setApiNotice('Error analyzing claim. Please check your backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setAnalysisResult(null);
    setApiNotice('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Verification Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit claims, news articles, screenshots, emails, or posts for instant AI & RAG credibility evaluation.
          </p>
        </div>

        {submittedData && (
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={handleReset}
            className="self-start sm:self-auto"
          >
            New Verification
          </Button>
        )}
      </div>

      {/* Verification Input Hub */}
      <section id="verify-section" className="space-y-4">
        <Card padding="p-5 sm:p-6" className="border-indigo-100 shadow-xs">
          <div className="space-y-5">
            <VerificationSelector
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setApiNotice('');
              }}
            />

            <div className="pt-2">
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
          </div>
        </Card>
      </section>

      {/* Loading State */}
      {isLoading && (
        <LoadingState
          title="FactSight AI is verifying your submission..."
          message="Running DeBERTa-v3 neural inference, querying ChromaDB Vector Store, and assessing source attribution..."
        />
      )}

      {/* Results Section */}
      {!isLoading && submittedData && analysisResult && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Credibility Assessment Overview</h2>
              <p className="text-xs text-slate-500">Live evaluation generated from DeBERTa-v3 and ChromaDB RAG.</p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/results', { state: { data: submittedData, result: analysisResult } })}
              className="shadow-sm shadow-indigo-500/20"
            >
              View Full Report
            </Button>
          </div>

          {/* Key Takeaway Banner */}
          <KeyTakeaway takeaway={analysisResult.keyTakeaway} />

          {/* 4 Core Result Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <CredibilityScore score={analysisResult.credibilityScore} />
            <Classification
              classification={analysisResult.classification}
              confidence={analysisResult.confidence}
            />
            <EvidenceSection
              evidence={analysisResult.evidence || []}
              isDashboardMini={true}
            />
            <SourceTrust sourceTrust={analysisResult.sourceTrust} />
          </div>

          {/* AI Explanation & Rationale */}
          <AIExplanation explanation={analysisResult.aiExplanation} />

          {/* Disclaimer */}
          <Disclaimer />
        </section>
      )}

      {/* Empty State when no submission has taken place */}
      {!isLoading && !submittedData && (
        <div className="p-8 sm:p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center">
            <FileSearch className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Ready to Analyze</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Enter a statement or claim in the input box above. FactSight AI will analyze phrasing, calculate confidence, and cross-reference with our vector database.
          </p>
        </div>
      )}
    </div>
  );
}
