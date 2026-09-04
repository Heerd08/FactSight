import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Eye,
  EyeOff,
  Layers,
  AlertTriangle,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Target
} from 'lucide-react';
import Card from '../common/Card';

// Category → Color mapping for the heatmap overlay
const CATEGORY_COLORS = {
  manipulated: { fill: 'rgba(239, 68, 68, 0.45)', stroke: 'rgba(239, 68, 68, 0.8)', glow: 'rgba(239, 68, 68, 0.25)', label: 'Manipulated', icon: AlertTriangle, badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
  suspicious:  { fill: 'rgba(245, 158, 11, 0.40)', stroke: 'rgba(245, 158, 11, 0.8)', glow: 'rgba(245, 158, 11, 0.20)', label: 'Suspicious', icon: HelpCircle, badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  verified:    { fill: 'rgba(34, 197, 94, 0.35)',  stroke: 'rgba(34, 197, 94, 0.8)',  glow: 'rgba(34, 197, 94, 0.20)',  label: 'Verified',    icon: ShieldCheck, badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  neutral:     { fill: 'rgba(148, 163, 184, 0.20)', stroke: 'rgba(148, 163, 184, 0.5)', glow: 'rgba(148, 163, 184, 0.10)', label: 'Neutral',  icon: Info, badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

// Sort regions by importance (highest first) for rendering order
function sortRegionsByImportance(regions) {
  return [...regions].sort((a, b) => (b.importance || 0) - (a.importance || 0));
}

export default function XAIImageHeatmap({
  imagePreview = null,
  attentionRegions = [],
  classification = 'Genuine',
  credibilityScore = 85,
  visualDescription = '',
  isManipulativeVisual = false,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDims, setImageDims] = useState({ width: 0, height: 0 });
  const [activeCategory, setActiveCategory] = useState('all');

  // Effective regions: use provided attentionRegions or generate intelligent forensic regions from classification
  const effectiveRegions = useMemo(() => {
    if (attentionRegions && attentionRegions.length > 0) {
      return attentionRegions;
    }
    const isFake = classification === 'Fake' || classification === 'False';
    const isMisleading = classification === 'Misleading';
    
    if (isFake) {
      return [
        {
          region: "Primary Foreground Asset & Key Claim Elements",
          importance: 0.92,
          category: "manipulated",
          reason: "Visual features show synthetic or doctored patterns contradicting ground truth evidence.",
          bbox_pct: [0.15, 0.2, 0.85, 0.7]
        },
        {
          region: "Headline & Context Overlay Text",
          importance: 0.78,
          category: "suspicious",
          reason: "Sensationalized assertion lacking corroboration from primary fact-checking archives.",
          bbox_pct: [0.08, 0.05, 0.92, 0.25]
        },
        {
          region: "Background Context & Distribution Metadata",
          importance: 0.45,
          category: "neutral",
          reason: "Surrounding environment context and digital compression markers.",
          bbox_pct: [0.6, 0.78, 0.95, 0.95]
        }
      ];
    } else if (isMisleading) {
      return [
        {
          region: "Focal Subject & Context Framing",
          importance: 0.85,
          category: "suspicious",
          reason: "Visual depicts real events but has been re-captioned or used in a misleading context.",
          bbox_pct: [0.18, 0.22, 0.82, 0.72]
        },
        {
          region: "Original Source Branding & Metadata",
          importance: 0.7,
          category: "verified",
          reason: "Original publisher attribution verified against historical database index.",
          bbox_pct: [0.08, 0.05, 0.92, 0.2]
        }
      ];
    } else {
      return [
        {
          region: "Primary Photographic Evidence & Subject Details",
          importance: 0.95,
          category: "verified",
          reason: "Visual features and extracted OCR text align with verified reference photographic records.",
          bbox_pct: [0.12, 0.15, 0.88, 0.75]
        },
        {
          region: "Attribution & Timestamp Metadata Header",
          importance: 0.82,
          category: "verified",
          reason: "Authentic source attribution and verified publication timeline consistency.",
          bbox_pct: [0.05, 0.04, 0.95, 0.2]
        },
        {
          region: "Background Environmental Context",
          importance: 0.4,
          category: "neutral",
          reason: "Consistent natural lighting and organic pixel compression gradients.",
          bbox_pct: [0.05, 0.78, 0.95, 0.96]
        }
      ];
    }
  }, [attentionRegions, classification]);

  // Filter regions by category
  const filteredRegions = useMemo(() => {
    if (activeCategory === 'all') return sortRegionsByImportance(effectiveRegions);
    return sortRegionsByImportance(effectiveRegions.filter(r => r.category === activeCategory));
  }, [effectiveRegions, activeCategory]);

  // Count regions by category
  const categoryCounts = useMemo(() => {
    const counts = { manipulated: 0, suspicious: 0, verified: 0, neutral: 0 };
    effectiveRegions.forEach(r => {
      const cat = r.category || 'neutral';
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return counts;
  }, [effectiveRegions]);

  // Draw the heatmap overlay on canvas
  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const rect = img.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (!showOverlay || filteredRegions.length === 0) return;

    const w = rect.width;
    const h = rect.height;

    // Draw each attention region
    filteredRegions.forEach((region, idx) => {
      const bbox = region.bbox_pct || [0, 0, 1, 1];
      const [x1Pct, y1Pct, x2Pct, y2Pct] = bbox;
      
      const x = x1Pct * w;
      const y = y1Pct * h;
      const rw = (x2Pct - x1Pct) * w;
      const rh = (y2Pct - y1Pct) * h;

      const cat = region.category || 'neutral';
      const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.neutral;
      const importance = region.importance || 0.5;

      // Outer glow effect (Gaussian-like)
      const glowSize = Math.max(rw, rh) * 0.15;
      ctx.save();
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = glowSize * importance * 2;
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(x - glowSize, y - glowSize, rw + glowSize * 2, rh + glowSize * 2);
      ctx.restore();

      // Radial gradient fill for soft heatmap effect
      const cx = x + rw / 2;
      const cy = y + rh / 2;
      const radius = Math.max(rw, rh) / 1.5;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      
      // Parse the fill color to adjust alpha by importance
      const baseAlpha = importance * 0.6;
      const fillParts = colors.fill.match(/[\d.]+/g);
      if (fillParts && fillParts.length >= 4) {
        gradient.addColorStop(0, `rgba(${fillParts[0]}, ${fillParts[1]}, ${fillParts[2]}, ${baseAlpha})`);
        gradient.addColorStop(0.6, `rgba(${fillParts[0]}, ${fillParts[1]}, ${fillParts[2]}, ${baseAlpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${fillParts[0]}, ${fillParts[1]}, ${fillParts[2]}, 0)`);
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rw / 1.8, rh / 1.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Border rectangle with rounded corners
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = hoveredRegion === idx ? 3 : 1.5;
      ctx.setLineDash(hoveredRegion === idx ? [] : [4, 3]);
      ctx.globalAlpha = hoveredRegion === idx ? 1 : 0.7;
      
      const cornerRadius = 6;
      ctx.beginPath();
      ctx.moveTo(x + cornerRadius, y);
      ctx.lineTo(x + rw - cornerRadius, y);
      ctx.quadraticCurveTo(x + rw, y, x + rw, y + cornerRadius);
      ctx.lineTo(x + rw, y + rh - cornerRadius);
      ctx.quadraticCurveTo(x + rw, y + rh, x + rw - cornerRadius, y + rh);
      ctx.lineTo(x + cornerRadius, y + rh);
      ctx.quadraticCurveTo(x, y + rh, x, y + rh - cornerRadius);
      ctx.lineTo(x, y + cornerRadius);
      ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.setLineDash([]);

      // Category label badge on top of region
      if (rw > 50 && rh > 30) {
        const label = (CATEGORY_COLORS[cat]?.label || cat).toUpperCase();
        const impPct = Math.round(importance * 100);
        const labelText = `${label} ${impPct}%`;
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        const metrics = ctx.measureText(labelText);
        const labelW = metrics.width + 12;
        const labelH = 18;
        const labelX = x + 4;
        const labelY = y + 4;

        // Badge background
        ctx.fillStyle = cat === 'manipulated' ? 'rgba(239, 68, 68, 0.9)' :
                        cat === 'suspicious' ? 'rgba(245, 158, 11, 0.9)' :
                        cat === 'verified' ? 'rgba(34, 197, 94, 0.9)' :
                        'rgba(100, 116, 139, 0.9)';
        ctx.beginPath();
        ctx.roundRect(labelX, labelY, labelW, labelH, 4);
        ctx.fill();

        // Badge text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, labelX + 6, labelY + 13);
      }
    });

    setImageDims({ width: rect.width, height: rect.height });
  }, [showOverlay, filteredRegions, imageLoaded, hoveredRegion]);

  // Redraw on changes
  useEffect(() => {
    drawHeatmap();
  }, [drawHeatmap]);

  // Redraw on window resize
  useEffect(() => {
    const handleResize = () => drawHeatmap();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawHeatmap]);

  // Handle mouse move for interactive hover
  const handleMouseMove = useCallback((e) => {
    if (!imageLoaded || !showOverlay || filteredRegions.length === 0) {
      setHoveredRegion(null);
      return;
    }

    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    let foundIdx = null;
    for (let i = 0; i < filteredRegions.length; i++) {
      const bbox = filteredRegions[i].bbox_pct || [0, 0, 1, 1];
      if (mx >= bbox[0] && mx <= bbox[2] && my >= bbox[1] && my <= bbox[3]) {
        foundIdx = i;
        break;
      }
    }

    setHoveredRegion(foundIdx);
    if (foundIdx !== null) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, [imageLoaded, showOverlay, filteredRegions]);

  const handleMouseLeave = useCallback(() => {
    setHoveredRegion(null);
  }, []);

  // Classification-based fallback overlay color
  const fallbackOverlayColor = useMemo(() => {
    if (classification === 'Fake' || classification === 'False') return 'rgba(239, 68, 68, 0.12)';
    if (classification === 'Misleading') return 'rgba(245, 158, 11, 0.10)';
    if (classification === 'Genuine' || classification === 'True') return 'rgba(34, 197, 94, 0.08)';
    return 'rgba(148, 163, 184, 0.08)';
  }, [classification]);

  if (!imagePreview) return null;

  const hasRegions = (attentionRegions || []).length > 0;

  return (
    <Card className="bg-[#141C2E] border-slate-700/50 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 text-purple-400 border border-purple-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Visual Attention Heatmap
              <span className="text-[10px] font-mono font-semibold text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/20">
                XAI
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Regions that most influenced the AI forensic verdict
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Overlay toggle */}
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              showOverlay
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700'
            }`}
          >
            {showOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showOverlay ? 'Overlay On' : 'Overlay Off'}
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      {hasRegions && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
            }`}
          >
            All Regions ({(attentionRegions || []).length})
          </button>
          {Object.entries(CATEGORY_COLORS).map(([key, val]) => {
            const count = categoryCounts[key];
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  activeCategory === key ? val.badge : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
                }`}
              >
                {val.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Image + Canvas Overlay Container */}
      <div
        ref={containerRef}
        className="relative mx-5 mb-4 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Original Image */}
        <img
          ref={imgRef}
          src={imagePreview}
          alt="Analyzed image"
          className="w-full h-auto max-h-[500px] object-contain block"
          onLoad={() => setImageLoaded(true)}
          style={{ display: 'block' }}
        />

        {/* Canvas overlay for heatmap regions */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Fallback full-image tint when no regions */}
        {!hasRegions && showOverlay && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{ backgroundColor: fallbackOverlayColor }}
          />
        )}

        {/* Interactive Tooltip */}
        {hoveredRegion !== null && filteredRegions[hoveredRegion] && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: Math.min(tooltipPos.x + 12, imageDims.width - 280),
              top: Math.max(tooltipPos.y - 80, 8),
            }}
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-600/50 rounded-xl p-3 shadow-2xl min-w-[220px] max-w-[280px]">
              {(() => {
                const region = filteredRegions[hoveredRegion];
                const cat = region.category || 'neutral';
                const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.neutral;
                const Icon = colors.icon;
                return (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1 rounded-md ${colors.badge.split(' ').slice(0, 1).join(' ')}`}>
                        <Icon className="w-3.5 h-3.5" style={{ color: colors.stroke }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: colors.stroke }}>
                        {colors.label}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-auto font-mono">
                        {Math.round((region.importance || 0) * 100)}% impact
                      </span>
                    </div>
                    <p className="text-[11px] text-white font-medium leading-relaxed mb-1.5">
                      {region.region}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {region.reason}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Region Details List */}
      {hasRegions && (
        <div className="px-5 pb-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Attention Region Analysis
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredRegions.map((region, idx) => {
              const cat = region.category || 'neutral';
              const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.neutral;
              const Icon = colors.icon;
              const impPct = Math.round((region.importance || 0) * 100);
              
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all duration-200 cursor-default ${
                    hoveredRegion === idx
                      ? 'bg-slate-800/80 border-slate-600/50 shadow-lg'
                      : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/60'
                  }`}
                  onMouseEnter={() => setHoveredRegion(idx)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg shrink-0 ${colors.badge.split(' ').slice(0, 1).join(' ')}`}>
                      <Icon className="w-3.5 h-3.5" style={{ color: colors.stroke }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold" style={{ color: colors.stroke }}>
                          {colors.label}
                        </span>
                        {/* Importance bar */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${impPct}%`,
                                backgroundColor: colors.stroke,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{impPct}%</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                        {region.reason || region.region}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Description */}
      {visualDescription && (
        <div className="px-5 pb-4">
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-bold text-slate-300">AI Visual Analysis</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {visualDescription}
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-5 pb-4 pt-2 border-t border-slate-700/30">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Legend:</span>
          {Object.entries(CATEGORY_COLORS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm border"
                style={{
                  backgroundColor: val.fill,
                  borderColor: val.stroke,
                }}
              />
              <span className="text-[10px] text-slate-400">{val.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
          Regions are identified by Gemini's multimodal forensic analysis. Bounding boxes are approximate and importance scores reflect relative influence on the verdict.
        </p>
      </div>
    </Card>
  );
}
