import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, CheckCircle2, AlertTriangle, FileText, Database } from 'lucide-react';
import Button from '../components/common/Button';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginState, setLoginState] = useState('idle'); // idle | authenticating | verifying | success

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoginState('authenticating');

    setTimeout(() => {
      setLoginState('verifying');
      setTimeout(() => {
        setLoginState('success');
        setTimeout(() => {
          localStorage.setItem('factsight_session', JSON.stringify({
            user: { name: 'Heer', email: email },
            token: 'mock-jwt-token-123'
          }));
          navigate('/dashboard');
        }, 800);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-space-cadet flex">
      {/* Left Side - Statistics & Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 border-r border-slate-gray/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(213,184,147,0.1)_0,rgba(37,52,79,1)_70%)] pointer-events-none" />
        
        {/* Abstract News/Investigation Imagery Overlay */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(97, 120, 145, 0.4) 0%, transparent 50%)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tan/10 border border-tan/20 flex items-center justify-center text-tan shadow-lg shadow-tan/5">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-heading font-bold text-xl text-white tracking-wide">
            FactSight <span className="text-tan">AI</span>
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-heading font-bold text-white mb-6 leading-tight">
            The Truth is <br />
            <span className="text-tan italic">In The Data.</span>
          </h2>
          <p className="text-sm text-slate-gray leading-relaxed mb-12">
            FactSight cross-references assertions against a continuously updated vector database of verified fact-checks and primary sources, utilizing DeBERTa-v3 semantic search to identify manipulation.
          </p>

          {/* Investigation Statistics */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-gray/10 border border-slate-gray/20 rounded-xl p-4">
              <Database className="w-8 h-8 text-tan" />
              <div>
                <p className="text-xs font-bold text-slate-gray uppercase tracking-wider">Indexed Fact Checks</p>
                <p className="text-2xl font-heading font-bold text-white mt-1">50,000+</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-gray/10 border border-slate-gray/20 rounded-xl p-4">
              <CheckCircle2 className="w-8 h-8 text-tan" />
              <div>
                <p className="text-xs font-bold text-slate-gray uppercase tracking-wider">Detection Accuracy</p>
                <p className="text-2xl font-heading font-bold text-white mt-1">94.8%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-coffee/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-xl bg-tan/10 border border-tan/20 flex items-center justify-center text-tan">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-heading font-bold text-xl text-white tracking-wide">
              FactSight <span className="text-tan">AI</span>
            </span>
          </div>

          {loginState === 'idle' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-3xl font-heading font-bold text-white mb-2">WELCOME BACK</h1>
              <p className="text-sm text-tan mb-8 font-medium tracking-wide">Secure Access to Your Intelligence Center.</p>

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="p-3 bg-caput-mortuum/10 border border-caput-mortuum/50 rounded-lg flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-caput-mortuum mt-0.5 shrink-0" />
                    <p className="text-sm text-white">{error}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-gray uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-gray/10 border border-slate-gray/30 rounded-xl px-4 py-3 text-white placeholder-slate-gray/50 focus:outline-none focus:border-tan focus:ring-1 focus:ring-tan transition-colors"
                    placeholder="investigator@factsight.ai"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-gray uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-gray/10 border border-slate-gray/30 rounded-xl px-4 py-3 text-white placeholder-slate-gray/50 focus:outline-none focus:border-tan focus:ring-1 focus:ring-tan transition-colors"
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-gray/30 bg-slate-gray/10 text-tan focus:ring-tan focus:ring-offset-space-cadet" />
                    <span className="text-sm text-slate-gray group-hover:text-white transition-colors">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-tan hover:text-white transition-colors">
                    Forgot password?
                  </button>
                </div>

                <div className="pt-6">
                  <Button type="submit" variant="primary" size="lg" className="w-full group">
                    <span>SIGN IN</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </form>

              <div className="mt-8 pt-8 border-t border-slate-gray/20 text-center">
                <p className="text-xs text-slate-gray flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Encrypted connection. Authorized personnel only.
                </p>
              </div>
            </div>
          ) : (
            // Authentication Transition States
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
              <div className="w-16 h-16 rounded-2xl bg-slate-gray/10 border border-slate-gray/20 flex items-center justify-center mb-6 relative">
                {loginState === 'success' ? (
                  <CheckCircle2 className="w-8 h-8 text-tan animate-in zoom-in duration-300" />
                ) : (
                  <>
                    <ShieldCheck className="w-8 h-8 text-tan animate-pulse" />
                    <div className="absolute inset-0 border-2 border-t-tan border-r-transparent border-b-transparent border-l-transparent rounded-2xl animate-spin" />
                  </>
                )}
              </div>
              
              <h2 className="text-xl font-heading font-bold text-white mb-2">
                {loginState === 'authenticating' && 'AUTHENTICATING...'}
                {loginState === 'verifying' && 'VERIFYING SESSION...'}
                {loginState === 'success' && 'ACCESS GRANTED'}
              </h2>
              
              <p className="text-sm text-slate-gray">
                {loginState === 'authenticating' && 'Establishing secure connection...'}
                {loginState === 'verifying' && 'Checking intelligence clearance...'}
                {loginState === 'success' && 'Redirecting to Command Center...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
