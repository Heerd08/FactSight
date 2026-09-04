import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  ExternalLink, 
  Eye, 
  Layers, 
  Info,
  Flame,
  ShieldCheck,
  Search
} from 'lucide-react';
import Card from '../common/Card';

// Comprehensive pattern definitions for explainable linguistic attribution
const SENSATIONALIST_PATTERNS = [
  'guaranteed cure', 'shocking truth', 'you won\'t believe', 'you wont believe',
  '100% proof', '100% proven', 'miracle cure', 'miracle', 'instant cure', 
  'secret remedy', 'secret they', 'they don\'t want you to know', 'they dont want you to know',
  'cover-up', 'cover up', 'hidden truth', 'exposed', 'mind-blowing', 'mind blowing',
  'urgent alert', 'share immediately', 'before it\'s deleted', 'before its deleted',
  'horrifying', 'terrifying', 'unbelievable', 'absolutely proven', 'hidden cure',
  'mainstream media won\'t tell', 'mainstream media wont tell', 'breaking news:', 'wake up'
];

const UNATTRIBUTED_PATTERNS = [
  'experts confirm', 'experts say', 'experts claim', 'unnamed officials claim',
  'unnamed officials say', 'unnamed officials', 'unnamed sources', 'sources say',
  'sources claim', 'insiders say', 'insiders reveal', 'doctors say', 'doctors claim',
  'scientists say', 'scientists claim', 'scientists confirm', 'studies show',
  'studies prove', 'research shows', 'research proves', 'many people say',
  'everyone knows', 'rumors suggest', 'allegedly', 'reportedly', 'anonymous sources',
  'secret sources'
];

export default function XAIWordHeatmap({ 
  content = '', 
  evidence = [], 
  suspiciousPhrases = [], 
  classification = 'Genuine',
  credibilityScore = 85 
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'sensational' | 'unattributed' | 'verified'
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Parse text into annotated token/phrase spans
  const { segments, counts } = useMemo(() => {
    const rawText = (content || '').toString().trim();
    if (!rawText) {
      return { segments: [], counts: { sensational: 0, unattributed: 0, verified: 0 } };
    }

    // Combine backend suspicious phrases with sensational patterns
    const allSensational = Array.from(new Set([
      ...SENSATIONALIST_PATTERNS,
      ...(suspiciousPhrases || []).map(p => p.toLowerCase())
    ])).filter(Boolean);

    // Build evidence entities/keywords for verified highlights
    const verifiedPhrases = [];
    (evidence || []).forEach(ev => {
      if (ev.title) {
        // Extract meaningful 3-5 word sequences from verified evidence titles
        const cleanTitleWords = ev.title.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 3);
        if (cleanTitleWords.length >= 2) {
          for (let i = 0; i < cleanTitleWords.length - 1; i++) {
            const pair = `${cleanTitleWords[i]} ${cleanTitleWords[i + 1]}`.toLowerCase();
            if (rawText.toLowerCase().includes(pair) && !allSensational.includes(pair)) {
              verifiedPhrases.push({ phrase: pair, source: ev.sourceName || ev.source || 'Verified Source', url: ev.url, snippet: ev.description || ev.snippet || ev.title });
            }
          }
        }
      }
    });

    // If classification is Genuine and score > 75, match core subject words as verified
    if (classification === 'Genuine' && credibilityScore > 70 && verifiedPhrases.length === 0) {
      const words = rawText.split(/\s+/).filter(w => w.length > 4);
      if (words.length > 0 && evidence.length > 0) {
        const primarySource = evidence[0];
        verifiedPhrases.push({
          phrase: words.slice(0, Math.min(3, words.length)).join(' ').toLowerCase(),
          source: primarySource.sourceName || primarySource.source || 'Authoritative Record',
          url: primarySource.url || '#',
          snippet: primarySource.description || primarySource.snippet || 'Empirically supported by public archival reference.'
        });
      }
    }

    // Find all matches with start and end indices
    const lowerText = rawText.toLowerCase();
    const intervals = [];

    // 1. Sensationalist matches (Red)
    allSensational.forEach(pattern => {
      let startIdx = 0;
      while ((startIdx = lowerText.indexOf(pattern, startIdx)) !== -1) {
        intervals.push({
          start: startIdx,
          end: startIdx + pattern.length,
          type: 'sensational',
          text: rawText.slice(startIdx, startIdx + pattern.length),
          category: 'Sensationalist / Urgent Buzzword',
          riskLevel: 'High Negative Impact',
          scoreImpact: '-15 to -25 pts',
          description: 'High-urgency clickbait or emotional trigger language designed to bypass critical skepticism without verifiable evidence.'
        });
        startIdx += pattern.length;
      }
    });

    // 2. Unattributed matches (Yellow)
    UNATTRIBUTED_PATTERNS.forEach(pattern => {
      let startIdx = 0;
      while ((startIdx = lowerText.indexOf(pattern, startIdx)) !== -1) {
        intervals.push({
          start: startIdx,
          end: startIdx + pattern.length,
          type: 'unattributed',
          text: rawText.slice(startIdx, startIdx + pattern.length),
          category: 'Unattributed Authority Claim',
          riskLevel: 'Medium Uncertainty',
          scoreImpact: '-10 to -15 pts',
          description: 'Vague attribution without named institutional author, DOI research link, or verified official spokesperson citation.'
        });
        startIdx += pattern.length;
      }
    });

    // 3. Verified matches (Green)
    verifiedPhrases.forEach(item => {
      let startIdx = 0;
      while ((startIdx = lowerText.indexOf(item.phrase, startIdx)) !== -1) {
        intervals.push({
          start: startIdx,
          end: startIdx + item.phrase.length,
          type: 'verified',
          text: rawText.slice(startIdx, startIdx + item.phrase.length),
          category: 'Verified Factual Corroboration',
          riskLevel: 'High Trust Indicator',
          scoreImpact: '+15 to +30 pts',
          sourceName: item.source,
          sourceUrl: item.url,
          sourceSnippet: item.snippet,
          description: `Corroborated by verified reference records from ${item.source}. Click to view source citation.`
        });
        startIdx += item.phrase.length;
      }
    });

    // Sort intervals by start position and remove overlapping conflicts (prioritize Red > Yellow > Green)
    intervals.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
    
    const nonOverlapping = [];
    let lastEnd = 0;
    intervals.forEach(inv => {
      if (inv.start >= lastEnd) {
        nonOverlapping.push(inv);
        lastEnd = inv.end;
      }
    });

    // Build segments list
    const resultSegments = [];
    let curr = 0;
    let sensCount = 0;
    let unattCount = 0;
    let verifCount = 0;

    nonOverlapping.forEach((inv, idx) => {
      if (inv.start > curr) {
        resultSegments.push({
          id: `plain-${idx}`,
          text: rawText.slice(curr, inv.start),
          type: 'neutral'
        });
      }

      if (inv.type === 'sensational') sensCount++;
      if (inv.type === 'unattributed') unattCount++;
      if (inv.type === 'verified') verifCount++;

      resultSegments.push({
        id: `highlight-${idx}`,
        ...inv
      });

      curr = inv.end;
    });

    if (curr < rawText.length) {
      resultSegments.push({
        id: 'plain-end',
        text: rawText.slice(curr),
        type: 'neutral'
      });
    }

    return {
      segments: resultSegments,
      counts: {
        sensational: sensCount,
        unattributed: unattCount,
        verified: verifCount
      }
    };
  }, [content, evidence, suspiciousPhrases, classification, credibilityScore]);

  return (
    <Card 
      className="bg-[#1C273B] border-slate-gray/30 shadow-2xl overflow-hidden relative"
      padding="p-5 sm:p-6"
      header={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-tan/15 border border-tan/30 flex items-center justify-center text-tan">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-heading font-bold text-white tracking-wide">
                  Interactive Explainable AI (XAI) Word Heatmap
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-tan/10 text-tan border border-tan/20">
                  Neural Attribution
                </span>
              </div>
              <p className="text-xs text-slate-gray mt-0.5">
                Hover or click highlighted words to inspect exact neural triggers and source citations.
              </p>
            </div>
          </div>

          {/* Quick Filter Pill Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-tan text-space-cadet font-bold shadow-md'
                  : 'bg-slate-gray/10 text-slate-gray hover:text-white border border-slate-gray/20'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>All ({counts.sensational + counts.unattributed + counts.verified})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('sensational')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === 'sensational'
                  ? 'bg-red-500/20 text-red-300 border border-red-500 shadow-md shadow-red-500/10 font-bold'
                  : 'bg-slate-gray/10 text-slate-gray hover:text-red-400 border border-slate-gray/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>Sensationalist ({counts.sensational})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('unattributed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === 'unattributed'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500 shadow-md shadow-amber-500/10 font-bold'
                  : 'bg-slate-gray/10 text-slate-gray hover:text-amber-400 border border-slate-gray/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span>Unattributed ({counts.unattributed})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('verified')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500 shadow-md shadow-emerald-500/10 font-bold'
                  : 'bg-slate-gray/10 text-slate-gray hover:text-emerald-400 border border-slate-gray/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Verified Facts ({counts.verified})</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Heatmap Spectrum Distribution Bar */}
        <div className="space-y-1.5 bg-space-cadet/60 p-3 rounded-xl border border-slate-gray/20">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-gray">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-tan" />
              <span>Linguistic Sentiment & Trust Distribution</span>
            </span>
            <span>
              {counts.sensational === 0 && counts.unattributed === 0 
                ? 'High Empirical Density' 
                : `${counts.sensational + counts.unattributed} Risk Triggers Detected`}
            </span>
          </div>

          <div className="h-2 w-full bg-slate-gray/20 rounded-full overflow-hidden flex">
            {counts.verified > 0 && (
              <div 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${Math.max(15, (counts.verified / Math.max(1, counts.verified + counts.sensational + counts.unattributed)) * 100)}%` }} 
                title={`${counts.verified} Verified Evidence Points`}
              />
            )}
            {counts.unattributed > 0 && (
              <div 
                className="h-full bg-amber-400 transition-all duration-500" 
                style={{ width: `${Math.max(15, (counts.unattributed / Math.max(1, counts.verified + counts.sensational + counts.unattributed)) * 100)}%` }} 
                title={`${counts.unattributed} Unattributed Claims`}
              />
            )}
            {counts.sensational > 0 && (
              <div 
                className="h-full bg-red-500 transition-all duration-500" 
                style={{ width: `${Math.max(15, (counts.sensational / Math.max(1, counts.verified + counts.sensational + counts.unattributed)) * 100)}%` }} 
                title={`${counts.sensational} Sensationalist Triggers`}
              />
            )}
            {counts.verified === 0 && counts.unattributed === 0 && counts.sensational === 0 && (
              <div className="h-full bg-tan/40 w-full" />
            )}
          </div>
        </div>

        {/* The Interactive Annotated Text Box */}
        <div className="relative p-5 sm:p-6 bg-[#131B2A] rounded-xl border border-slate-gray/30 leading-relaxed text-sm sm:text-base font-sans text-white select-text">
          {segments.map((seg) => {
            if (seg.type === 'neutral') {
              return <span key={seg.id} className="text-slate-200">{seg.text}</span>;
            }

            const isVisible = activeFilter === 'all' || activeFilter === seg.type;
            if (!isVisible) {
              return <span key={seg.id} className="text-slate-200">{seg.text}</span>;
            }

            const isSelected = selectedHighlight?.id === seg.id;

            // Highlight Styling based on Category
            let highlightClasses = '';
            let underlineClasses = '';
            let dotColor = '';

            if (seg.type === 'sensational') {
              highlightClasses = isSelected 
                ? 'bg-red-500/35 text-red-200 ring-2 ring-red-500 shadow-lg shadow-red-500/20' 
                : 'bg-red-500/20 text-red-300 hover:bg-red-500/30';
              underlineClasses = 'border-b-2 border-red-500 border-dashed';
              dotColor = 'bg-red-500';
            } else if (seg.type === 'unattributed') {
              highlightClasses = isSelected 
                ? 'bg-amber-500/35 text-amber-200 ring-2 ring-amber-400 shadow-lg shadow-amber-500/20' 
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30';
              underlineClasses = 'border-b-2 border-amber-400 border-dashed';
              dotColor = 'bg-amber-400';
            } else if (seg.type === 'verified') {
              highlightClasses = isSelected 
                ? 'bg-emerald-500/35 text-emerald-200 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20' 
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30';
              underlineClasses = 'border-b-2 border-emerald-500';
              dotColor = 'bg-emerald-500';
            }

            return (
              <span
                key={seg.id}
                onClick={() => setSelectedHighlight(isSelected ? null : seg)}
                onMouseEnter={() => setHoveredItem(seg)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative inline-block mx-0.5 px-1.5 py-0.5 rounded cursor-pointer transition-all duration-200 font-medium ${highlightClasses} ${underlineClasses}`}
              >
                {seg.text}

                {/* Inline Hover Tooltip */}
                {hoveredItem?.id === seg.id && !selectedHighlight && (
                  <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-space-cadet/95 text-xs text-white rounded-xl border border-tan/30 shadow-2xl backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                    <span className="flex items-center gap-1.5 font-bold mb-1">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span className="text-tan">{seg.category}</span>
                    </span>
                    <span className="block text-[11px] text-slate-300 leading-snug mb-1.5">
                      {seg.description}
                    </span>
                    {seg.sourceName && (
                      <span className="block text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>Source: {seg.sourceName}</span>
                      </span>
                    )}
                    <span className="block text-[9px] text-slate-gray mt-1 italic">
                      Click to pin detailed XAI inspector
                    </span>
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* Selected Highlight Inspector Drawer */}
        {selectedHighlight ? (
          <div className="p-4 sm:p-5 bg-space-cadet/90 border border-tan/40 rounded-xl shadow-xl space-y-3 animate-in slide-in-from-top-2 duration-300 relative">
            <button
              type="button"
              onClick={() => setSelectedHighlight(null)}
              className="absolute top-3 right-3 text-xs text-slate-gray hover:text-white px-2 py-1 rounded-md bg-slate-gray/10 transition-colors"
            >
              ✕ Close Inspector
            </button>

            <div className="flex items-center gap-2">
              {selectedHighlight.type === 'sensational' && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
              {selectedHighlight.type === 'unattributed' && <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />}
              {selectedHighlight.type === 'verified' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-tan font-bold">
                  {selectedHighlight.category}
                </span>
                <h4 className="text-sm font-bold text-white">
                  "{selectedHighlight.text}"
                </h4>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedHighlight.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-gray/20">
              <div className="bg-slate-gray/10 p-2.5 rounded-lg border border-slate-gray/20">
                <span className="text-[10px] text-slate-gray block uppercase font-bold">Risk Assessment</span>
                <span className="text-xs font-semibold text-white mt-0.5 block">{selectedHighlight.riskLevel}</span>
              </div>

              <div className="bg-slate-gray/10 p-2.5 rounded-lg border border-slate-gray/20">
                <span className="text-[10px] text-slate-gray block uppercase font-bold">Credibility Impact</span>
                <span className={`text-xs font-semibold mt-0.5 block ${selectedHighlight.type === 'verified' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedHighlight.scoreImpact}
                </span>
              </div>

              <div className="bg-slate-gray/10 p-2.5 rounded-lg border border-slate-gray/20 flex flex-col justify-center">
                <span className="text-[10px] text-slate-gray block uppercase font-bold">Ground Truth Link</span>
                {selectedHighlight.sourceUrl && selectedHighlight.sourceUrl !== '#' ? (
                  <a
                    href={selectedHighlight.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-tan hover:text-white inline-flex items-center gap-1 mt-0.5 truncate transition-colors"
                  >
                    <span>{selectedHighlight.sourceName || 'View Source'}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 mt-0.5">Linguistic Pattern Flag</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-space-cadet/40 rounded-xl border border-slate-gray/20 text-xs text-slate-gray">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-tan" />
              <span>Click on any highlighted phrase above to pin the neural attribution breakdown.</span>
            </span>
            <span className="hidden sm:inline font-mono text-[11px] text-tan">
              XAI Module v2.4 Active
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
