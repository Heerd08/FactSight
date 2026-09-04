import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  XOctagon, 
  Clock, 
  ChevronRight,
  Cpu,
  Globe2,
  Database,
  Radio,
  Flame
} from 'lucide-react';
import Button from '../components/common/Button';

// Mock sparkline SVG component
const Sparkline = ({ colorClass, data }) => (
  <svg className={`w-16 h-8 ${colorClass}`} viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d={`M0 30 ${data.map((y, i) => `L${i * (100 / (data.length - 1))} ${30 - y}`).join(' ')}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Dashboard() {
  const navigate = useNavigate();

  // Retrieve user name from local storage
  const sessionData = JSON.parse(localStorage.getItem('factsight_session') || '{}');
  const userName = sessionData?.user?.name?.toUpperCase() || 'INVESTIGATOR';

  // Dynamic Data State
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    genuine: 0,
    misleading: 0,
    fake: 0,
    manipulated: 0,
    averageCredibility: 0
  });

  useEffect(() => {
    // Load history from local storage
    const storedHistory = JSON.parse(localStorage.getItem('factsight_history') || '[]');
    setHistory(storedHistory);

    if (storedHistory.length > 0) {
      let genuine = 0;
      let misleading = 0;
      let fake = 0;
      let manipulated = 0;
      let totalCredibility = 0;

      storedHistory.forEach(item => {
        totalCredibility += (item.credibilityScore || 0);
        const classification = (item.classification || '').toLowerCase();
        
        if (classification.includes('genuine')) genuine++;
        else if (classification.includes('misleading')) misleading++;
        else if (classification.includes('fake')) fake++;
        else if (classification.includes('manipulated')) manipulated++;
        else genuine++; // fallback
      });

      setStats({
        total: storedHistory.length,
        genuine,
        misleading,
        fake,
        manipulated,
        averageCredibility: Math.round(totalCredibility / storedHistory.length)
      });
    }
  }, []);

  // Calculate percentages safely
  const getPercentage = (value) => stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
  
  const genuinePct = getPercentage(stats.genuine);
  const misleadingPct = getPercentage(stats.misleading);
  const fakePct = getPercentage(stats.fake);
  const manipulatedPct = getPercentage(stats.manipulated);

  // Helper to determine color based on classification
  const getClassificationColor = (classification) => {
    const c = (classification || '').toLowerCase();
    if (c.includes('genuine')) return 'text-tan group-hover:text-tan';
    if (c.includes('misleading')) return 'text-coffee group-hover:text-coffee';
    if (c.includes('fake')) return 'text-caput-mortuum group-hover:text-caput-mortuum';
    return 'text-slate-gray group-hover:text-slate-gray';
  };

  const getBorderColor = (classification) => {
    const c = (classification || '').toLowerCase();
    if (c.includes('genuine')) return 'hover:border-tan/40';
    if (c.includes('misleading')) return 'hover:border-coffee/40';
    if (c.includes('fake')) return 'hover:border-caput-mortuum/40';
    return 'hover:border-slate-gray/40';
  };

  return (
    <div className="bg-space-cadet min-h-screen text-white pt-6 pb-16 space-y-10 animate-in fade-in duration-500 relative overflow-hidden">
      
      {/* Abstract Background Dotted Grid Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      {/* Faint Glowing Orb in Hero */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-tan/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

      {/* Hero Section */}
      <section className="relative border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 bg-tan rounded-full animate-pulse shadow-[0_0_8px_rgba(213,184,147,0.8)]" />
            <p className="text-tan text-xs font-bold uppercase tracking-[0.2em]">Your Intelligence Overview</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight drop-shadow-md">
            GOOD EVENING, <span className="italic">{userName}</span>
          </h1>
          <p className="text-slate-gray text-sm mt-3 max-w-xl leading-relaxed">
            Monitor your investigations, credibility assessments, and live active threats across the network.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/results')}
            className="px-6 py-3 border-tan/40 text-tan hover:bg-tan/10 hover:border-tan font-bold tracking-widest text-xs uppercase flex items-center gap-2"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>XAI Heatmap</span>
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/verify')}
            className="shadow-[0_0_20px_rgba(213,184,147,0.15)] px-8 py-3 rounded-none bg-tan text-space-cadet hover:bg-white hover:text-space-cadet transition-all font-bold tracking-widest text-xs uppercase relative overflow-hidden group"
          >
            <span className="relative z-10">+ New Investigation</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
          </Button>
        </div>
      </section>

      {/* Statistics Row (Glassmorphism Cards) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 z-10 relative">
        {/* Stat Card 1 */}
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-sm p-5 rounded-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-gray/40 group-hover:bg-slate-gray transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-slate-gray uppercase tracking-widest">Total Checks</p>
            <Activity className="w-4 h-4 text-slate-gray/50" />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-heading font-bold text-white">{stats.total}</p>
            <Sparkline colorClass="text-slate-gray/30" data={[5, 10, 8, 15, 12, 20, 25]} />
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-sm p-5 rounded-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-tan/40 group-hover:bg-tan transition-colors shadow-[0_0_10px_rgba(213,184,147,0.5)]" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-tan uppercase tracking-widest">Likely Genuine</p>
            <ShieldCheck className="w-4 h-4 text-tan/50" />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-heading font-bold text-white">{stats.genuine}</p>
            <Sparkline colorClass="text-tan/30" data={[2, 5, 4, 10, 8, 15, 20]} />
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-sm p-5 rounded-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-coffee/40 group-hover:bg-coffee transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-coffee uppercase tracking-widest">Misleading</p>
            <AlertTriangle className="w-4 h-4 text-coffee/50" />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-heading font-bold text-white">{stats.misleading}</p>
            <Sparkline colorClass="text-coffee/30" data={[10, 8, 12, 5, 8, 4, 2]} />
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-sm p-5 rounded-xl hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-caput-mortuum/40 group-hover:bg-caput-mortuum transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-caput-mortuum uppercase tracking-widest">Fake / Manipulated</p>
            <XOctagon className="w-4 h-4 text-caput-mortuum/50" />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-heading font-bold text-white">{stats.fake + stats.manipulated}</p>
            <Sparkline colorClass="text-caput-mortuum/30" data={[5, 10, 15, 12, 18, 22, 28]} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 z-10 relative">
        
        {/* Left Column */}
        <div className="space-y-6 lg:space-y-8 lg:col-span-1">
          
          {/* Credibility Overview */}
          <section className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl relative overflow-hidden">
            <h2 className="text-[10px] font-bold text-slate-gray uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
              Your Average Credibility
            </h2>
            
            <div className="flex justify-center mb-10 relative">
              {/* Glowing Background Ring */}
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                 <div className="w-32 h-32 bg-tan/10 blur-2xl rounded-full mix-blend-screen" />
              </div>
              
              {/* Radial Visualization */}
              <div className="w-48 h-48 rounded-full border-[10px] border-white/5 flex items-center justify-center relative shadow-inner shadow-black/20">
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_12px_rgba(213,184,147,0.6)]">
                  <circle 
                    cx="50%" cy="50%" r="44%" 
                    className="stroke-tan fill-transparent transition-all duration-1000 ease-out" 
                    strokeWidth="8" 
                    strokeDasharray="100 100" 
                    strokeDashoffset={stats.total > 0 ? 100 - stats.averageCredibility : 100}
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="text-center">
                  <span className="text-6xl font-heading font-bold text-white drop-shadow-md">{stats.total > 0 ? stats.averageCredibility : 0}</span>
                  <span className="block text-xs font-bold text-tan tracking-widest mt-1">/ 100</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-gray text-xs uppercase tracking-wider">Source Reliability</span>
                <span className="font-bold text-white">{stats.total > 0 ? Math.min(stats.averageCredibility + 8, 100) : 0}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-gray text-xs uppercase tracking-wider">Evidence Strength</span>
                <span className="font-bold text-white">{stats.total > 0 ? Math.min(stats.averageCredibility + 3, 100) : 0}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-gray text-xs uppercase tracking-wider">Consistency</span>
                <span className="font-bold text-white">{stats.total > 0 ? stats.averageCredibility : 0}%</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5">
                <span className="text-slate-gray text-xs uppercase tracking-wider font-bold">Manipulation Risk</span>
                <span className="font-bold text-caput-mortuum text-lg drop-shadow-[0_0_8px_rgba(99,32,36,0.5)]">{stats.total > 0 ? Math.max(100 - stats.averageCredibility - 5, 0) : 0}%</span>
              </div>
            </div>
          </section>

          {/* Active Global Threats Widget (NEW) */}
          <section className="bg-caput-mortuum/5 border border-caput-mortuum/20 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe2 className="w-24 h-24 text-caput-mortuum mix-blend-overlay" />
            </div>
            
            <div className="flex items-center gap-2 mb-6 border-b border-caput-mortuum/10 pb-4">
              <div className="w-1.5 h-1.5 bg-caput-mortuum rounded-full animate-pulse" />
              <h2 className="text-[10px] font-bold text-caput-mortuum uppercase tracking-widest">
                Active Threat Alerts
              </h2>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="bg-space-cadet/50 border border-white/5 p-3 rounded-lg text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-white font-bold font-heading text-sm">Election Deepfake Matrix</span>
                  <span className="text-[9px] bg-caput-mortuum text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Critical</span>
                </div>
                <p className="text-slate-gray text-xs">Spike in AI-generated audio clips linked to key state candidates.</p>
              </div>
              <div className="bg-space-cadet/50 border border-white/5 p-3 rounded-lg text-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-white font-bold font-heading text-sm">Financial Scams Alert</span>
                  <span className="text-[9px] bg-coffee text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">High</span>
                </div>
                <p className="text-slate-gray text-xs">Coordinated network spreading false banking liquidity reports.</p>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:space-y-8 lg:col-span-2">
          
          {/* Recent Investigations */}
          <section className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <h2 className="text-[10px] font-bold text-slate-gray uppercase tracking-widest">
                Recent Investigations
              </h2>
              <Link to="/investigations" className="text-[10px] text-tan hover:text-white uppercase tracking-widest transition-colors font-bold flex items-center gap-1">
                View History <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {history.length > 0 ? (
                history.slice(0, 4).map((item, index) => (
                  <div 
                    key={item.id || index} 
                    onClick={() => navigate('/results', { state: { data: { type: item.type, content: item.title }, result: item.fullResult } })}
                    className={`group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer ${getBorderColor(item.classification)}`}
                  >
                    <div className="flex-1 pr-4">
                      <h3 className={`text-sm md:text-base font-heading font-bold text-white mb-2 transition-colors ${getClassificationColor(item.classification)} line-clamp-1`}>
                        "{item.title}"
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                        <span className={getClassificationColor(item.classification).split(' ')[0]}>{item.classification || 'Unknown'}</span>
                        <span className="text-slate-gray font-normal flex items-center gap-1"><Clock className="w-3 h-3" /> {item.timestamp || 'Recently'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-5 mt-4 md:mt-0 bg-space-cadet/50 py-2 px-4 rounded-lg border border-white/5">
                      <div className="text-right">
                        <span className="block text-xl font-heading font-bold text-white leading-none">{item.credibilityScore || 0}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-gray transition-colors ${getClassificationColor(item.classification)}`} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center border border-white/5 bg-white/[0.02] rounded-xl border-dashed">
                  <ShieldCheck className="w-8 h-8 text-slate-gray/30 mx-auto mb-3" />
                  <p className="text-slate-gray text-sm">No investigations found yet. Verify your first claim to populate history.</p>
                </div>
              )}
            </div>
          </section>

          {/* Bottom Split Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Classification Breakdown */}
            <section className="bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
              <h2 className="text-[10px] font-bold text-slate-gray uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
                Global Verification Breadown
              </h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-tan">Genuine</span>
                    <span className="text-white">{genuinePct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-tan rounded-full shadow-[0_0_8px_rgba(213,184,147,0.8)]" style={{ width: `${genuinePct}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-coffee">Misleading</span>
                    <span className="text-white">{misleadingPct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-coffee rounded-full" style={{ width: `${misleadingPct}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-caput-mortuum">Fake</span>
                    <span className="text-white">{fakePct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-caput-mortuum rounded-full" style={{ width: `${fakePct}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-slate-gray">Manipulated</span>
                    <span className="text-white">{manipulatedPct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-slate-gray rounded-full" style={{ width: `${manipulatedPct}%` }} /></div>
                </div>
              </div>
            </section>

            {/* API & Engine Health (NEW) */}
            <section className="bg-[#1A2436] border border-white/5 p-6 rounded-2xl relative overflow-hidden shadow-inner shadow-black/20">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Database className="w-24 h-24 text-white mix-blend-overlay" />
              </div>

              <h2 className="text-[10px] font-bold text-slate-gray uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
                System Diagnostics
              </h2>
              
              <div className="space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Radio className="w-4 h-4 text-tan" />
                    <span className="text-xs text-white font-medium tracking-wide">DeBERTa-v3 Engine</span>
                  </div>
                  <span className="text-[10px] text-tan font-bold bg-tan/10 px-2 py-0.5 rounded border border-tan/20">ONLINE</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-white font-medium tracking-wide">Vector DB Sync</span>
                  </div>
                  <span className="text-[10px] text-slate-gray font-mono">1.2ms latency</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-sky-500" />
                    <span className="text-xs text-white font-medium tracking-wide">Compute Load</span>
                  </div>
                  <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-sky-500 w-[24%]" />
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5">
                  <p className="text-[9px] text-slate-gray uppercase tracking-widest flex items-center justify-between">
                    <span>Last Check</span>
                    <span className="text-white font-bold">2 seconds ago</span>
                  </p>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>

    </div>
  );
}
