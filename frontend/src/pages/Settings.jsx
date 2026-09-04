import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Shield, Bell, Check, Save } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { theme, setTheme, isDark } = useTheme();
  const [strictThreshold, setStrictThreshold] = useState('standard');
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [highRiskOnly, setHighRiskOnly] = useState(true);
  const [anonymizeSubmissions, setAnonymizeSubmissions] = useState(true);
  const [saveHistoryLocally, setSaveHistoryLocally] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    localStorage.setItem('factsight_strict_threshold', strictThreshold);
    localStorage.setItem('factsight_email_alerts', JSON.stringify(emailAlerts));
    localStorage.setItem('factsight_high_risk_only', JSON.stringify(highRiskOnly));
    localStorage.setItem('factsight_anonymize', JSON.stringify(anonymizeSubmissions));
    localStorage.setItem('factsight_save_local', JSON.stringify(saveHistoryLocally));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-slate-gray/20' : 'border-slate-200'
      }`}>
        <div>
          <h1 className={`text-2xl sm:text-3xl font-heading font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Settings & Preferences
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-gray' : 'text-slate-500'}`}>
            Manage your interface appearance, threshold sensitivities, and privacy controls.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Save}
          onClick={handleSave}
          className="shadow-md"
        >
          {savedSuccess ? 'Preferences Saved!' : 'Save Changes'}
        </Button>
      </div>

      {savedSuccess && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in duration-300 ${
          isDark 
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Your settings and appearance preferences have been saved locally.</span>
        </div>
      )}

      {/* 1. Appearance Section */}
      <Card 
        header={
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Appearance & Theme
          </h3>
        }
        className={isDark ? 'bg-[#1C273B] border-slate-gray/30' : 'bg-white border-slate-200'}
      >
        <div className="space-y-4">
          <p className={`text-xs ${isDark ? 'text-slate-gray' : 'text-slate-500'}`}>
            Choose your preferred workspace aesthetic. FactSight instantly transforms all UI components.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Mode Button */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-200 shadow-md'
                  : isDark 
                    ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${
                theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-amber-500/10 text-amber-400'
              }`}>
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className={`text-xs font-bold block ${
                  theme === 'light' ? 'text-indigo-900' : isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Light Mode
                </span>
                <span className={`text-[11px] mt-0.5 block leading-relaxed ${
                  theme === 'light' ? 'text-indigo-700' : isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Crisp off-white palette with high contrast optimized for bright workspaces.
                </span>
              </div>
              {theme === 'light' && (
                <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              )}
            </button>

            {/* Dark Mode Button */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-tan bg-tan/10 ring-2 ring-tan/30 shadow-md'
                  : isDark 
                    ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${
                theme === 'dark' ? 'bg-tan/20 text-tan' : 'bg-slate-100 text-slate-600'
              }`}>
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className={`text-xs font-bold block ${
                  theme === 'dark' ? 'text-tan' : isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Dark Mode (Space Cadet)
                </span>
                <span className={`text-[11px] mt-0.5 block leading-relaxed ${
                  theme === 'dark' ? 'text-slate-300' : isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Sleek deep navy theme tailored for low-light research environments.
                </span>
              </div>
              {theme === 'dark' && (
                <Check className="w-4 h-4 text-tan shrink-0 mt-0.5" />
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* 2. Analysis Preferences */}
      <Card 
        header={
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Analysis Preferences
          </h3>
        }
        className={isDark ? 'bg-[#1C273B] border-slate-gray/30' : 'bg-white border-slate-200'}
      >
        <div className="space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b ${
            isDark ? 'border-slate-gray/20' : 'border-slate-100'
          }`}>
            <div>
              <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Verification Strictness Mode
              </h4>
              <p className={`text-xs ${isDark ? 'text-slate-gray' : 'text-slate-500'}`}>
                Determines evidence threshold required for "Genuine" classification.
              </p>
            </div>
            <select
              value={strictThreshold}
              onChange={(e) => setStrictThreshold(e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 border transition-colors ${
                isDark 
                  ? 'bg-[#162032] border-slate-gray/40 text-white focus:ring-tan/30' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-indigo-100'
              }`}
            >
              <option value="relaxed">Relaxed (1 Primary Source)</option>
              <option value="standard">Standard (2+ Corroborating Sources)</option>
              <option value="rigorous">Rigorous (Peer Reviewed & Official Archives)</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Visual Attention Heatmap & Deepfake Forensics
              </h4>
              <p className={`text-xs ${isDark ? 'text-slate-gray' : 'text-slate-500'}`}>
                Extract Grad-CAM/DINO visual bounding boxes and pixel manipulation overlays.
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 accent-tan cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* 3. Notifications */}
      <Card 
        header={
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Notifications & Alerts
          </h3>
        }
        className={isDark ? 'bg-[#1C273B] border-slate-gray/30' : 'bg-white border-slate-200'}
      >
        <div className="space-y-3">
          <label className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
            isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
          }`}>
            <div>
              <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Analysis Complete Sound / Alert
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-gray' : 'text-slate-500'}`}>
                Notify when long web or batch verifications finish.
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 accent-tan cursor-pointer"
            />
          </label>

          <label className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
            isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
          }`}>
            <div>
              <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>
                High-Risk Disinformation Alerts
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-gray' : 'text-slate-500'}`}>
                Highlight flagged malicious links and phishing indicators with red alerts.
              </span>
            </div>
            <input
              type="checkbox"
              checked={highRiskOnly}
              onChange={(e) => setHighRiskOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 accent-tan cursor-pointer"
            />
          </label>
        </div>
      </Card>

      {/* 4. Privacy & Data Retention */}
      <Card 
        header={
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Privacy & Data Retention
          </h3>
        }
        className={isDark ? 'bg-[#1C273B] border-slate-gray/30' : 'bg-white border-slate-200'}
      >
        <div className="space-y-4">
          <div className={`flex items-center justify-between gap-4 pb-3 border-b ${
            isDark ? 'border-slate-gray/20' : 'border-slate-100'
          }`}>
            <div>
              <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Anonymize Content Submissions
              </h4>
              <p className={`text-xs ${isDark ? 'text-slate-gray' : 'text-slate-500'}`}>
                Strip IP headers and author PII before querying external verification engines.
              </p>
            </div>
            <input
              type="checkbox"
              checked={anonymizeSubmissions}
              onChange={(e) => setAnonymizeSubmissions(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 accent-tan cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Local Browser Storage
              </h4>
              <p className={`text-xs ${isDark ? 'text-slate-gray' : 'text-slate-500'}`}>
                Store recent reports in client localStorage rather than a central server.
              </p>
            </div>
            <input
              type="checkbox"
              checked={saveHistoryLocally}
              onChange={(e) => setSaveHistoryLocally(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 accent-tan cursor-pointer"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
