import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  FileSearch,
  ArrowRight,
  Flame
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
import XAIWordHeatmap from '../components/results/XAIWordHeatmap';
import XAIImageHeatmap from '../components/results/XAIImageHeatmap';
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

export default function Verify() {
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
    <div className="space-y-8 pb-12 pt-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-gray/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight flex items-center gap-2">
            Investigation Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-gray mt-2">
            Submit claims, news articles, screenshots, emails, or posts for instant AI credibility evaluation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/results')}
            className="border-tan/40 text-tan hover:bg-tan/10 font-bold tracking-wider text-xs uppercase flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Heatmap</span>
          </Button>

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
      </div>

      {/* Verification Input Hub */}
      <section id="verify-section" className="space-y-4">
        <Card padding="p-5 sm:p-6" className="bg-[#1C273B] border-slate-gray/30 shadow-2xl relative overflow-hidden">
          {/* Subtle Tan glow behind inputs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-tan/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="space-y-5 relative z-10">
            <VerificationSelector
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setApiNotice('');
              }}
            />

            <div className="pt-4">
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
          title="INVESTIGATING CLAIM"
          message="Extracting claims, evaluating sources, and checking evidence..."
        />
      )}

      {/* Results Section */}
      {!isLoading && submittedData && analysisResult && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-gray/20 pb-4">
            <div>
              <h2 className="text-xl font-heading font-bold text-white">Investigation Results</h2>
              <p className="text-xs text-slate-gray mt-1">Live evaluation generated from DeBERTa-v3 and ChromaDB.</p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/results', { state: { data: submittedData, result: analysisResult } })}
            >
              View Full Report
            </Button>
          </div>

          {/* Key Takeaway Banner */}
          <KeyTakeaway takeaway={analysisResult.keyTakeaway} />

          {/* Visual Attention Heatmap for Image Inputs */}
          {submittedData.type === 'image' && submittedData.preview && (
            <XAIImageHeatmap
              imagePreview={submittedData.preview}
              attentionRegions={analysisResult.attention_regions || []}
              classification={analysisResult.classification || 'Genuine'}
              credibilityScore={analysisResult.credibilityScore || 85}
              visualDescription={analysisResult.visual_description || ''}
              isManipulativeVisual={analysisResult.is_manipulative_visual || false}
            />
          )}

          {/* Interactive Explainable AI (XAI) Word Heatmap */}
          <XAIWordHeatmap
            content={typeof submittedData.content === 'string' ? submittedData.content : (analysisResult.aiExplanation?.mainClaim || '')}
            evidence={analysisResult.evidence || []}
            suspiciousPhrases={analysisResult.suspicious_phrases || []}
            verifiedPhrases={analysisResult.verified_phrases || []}
            unattributedPhrases={analysisResult.unattributed_phrases || []}
            redFlags={analysisResult.red_flags || []}
            contradictingEvidence={analysisResult.aiExplanation?.contradictingEvidence || []}
            supportingEvidence={analysisResult.aiExplanation?.supportingEvidence || []}
            classification={analysisResult.classification || 'Genuine'}
            credibilityScore={analysisResult.credibilityScore || 85}
          />

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
        <div className="p-8 sm:p-12 bg-space-cadet/50 rounded-2xl border border-dashed border-slate-gray/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-gray/10 text-slate-gray mx-auto flex items-center justify-center">
            <FileSearch className="w-6 h-6" />
          </div>
          <h3 className="text-base font-heading font-bold text-white tracking-wide">Ready for Investigation</h3>
          <p className="text-sm text-slate-gray max-w-md mx-auto leading-relaxed">
            Submit a claim or piece of media in the workspace above. FactSight will cross-reference its vector database and extract verifiable evidence.
          </p>
        </div>
      )}
    </div>
  );
}
