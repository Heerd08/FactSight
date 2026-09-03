import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Sliders,
  Shield,
  Check,
  Save,
  Lock,
  Eye,
  Database
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function Settings() {
  const [theme, setTheme] = useState('light');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [strictThreshold, setStrictThreshold] = useState('standard');
  const [saveHistoryLocally, setSaveHistoryLocally] = useState(true);
  const [anonymizeSubmissions, setAnonymizeSubmissions] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your interface preferences, threshold sensitivities, and privacy controls.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Save}
          onClick={handleSave}
        >
          {savedSuccess ? 'Preferences Saved!' : 'Save Changes'}
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Your settings have been saved locally for this browser session.</span>
        </div>
      )}

      {/* 1. Appearance Section */}
      <Card header={<h3 className="text-sm font-bold text-slate-800">Appearance</h3>}>
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Customize how FactSight looks on your device.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Light Theme (Default)</span>
                <span className="text-[11px] text-slate-500">Crisp lavender off-white palette optimized for readability.</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Dark Mode</span>
                <span className="text-[11px] text-slate-500">Sleek dark theme for low-light research environments.</span>
              </div>
            </button>
          </div>
        </div>
      </Card>

      {/* 2. Analysis Preferences */}
      <Card header={<h3 className="text-sm font-bold text-slate-800">Analysis Preferences</h3>}>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Verification Strictness Mode</h4>
              <p className="text-xs text-slate-500">Determines evidence threshold required for "Genuine" classification.</p>
            </div>
            <select
              value={strictThreshold}
              onChange={(e) => setStrictThreshold(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="relaxed">Relaxed (1 Primary Source)</option>
              <option value="standard">Standard (2+ Corroborating Sources)</option>
              <option value="rigorous">Rigorous (Peer Reviewed & Official Archives)</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Deepfake & Synthetic Media Detection</h4>
              <p className="text-xs text-slate-500">Run extra neural filters to check image compression artifacts and metadata tampering.</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Card>

      {/* 3. Notifications */}
      <Card header={<h3 className="text-sm font-bold text-slate-800">Notifications</h3>}>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Analysis Complete Sound / Alert</span>
              <span className="text-[11px] text-slate-500">Notify when long web or batch verifications finish.</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-800 block">High-Risk Disinformation Alerts</span>
              <span className="text-[11px] text-slate-500">Highlight flagged malicious links and phishing indicators with red alerts.</span>
            </div>
            <input
              type="checkbox"
              checked={highRiskOnly}
              onChange={(e) => setHighRiskOnly(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
          </label>
        </div>
      </Card>

      {/* 4. Privacy & Data Retention */}
      <Card header={<h3 className="text-sm font-bold text-slate-800">Privacy & Data Retention</h3>}>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Anonymize Content Submissions</h4>
              <p className="text-xs text-slate-500">Strip IP headers and author PII before querying external verification engines.</p>
            </div>
            <input
              type="checkbox"
              checked={anonymizeSubmissions}
              onChange={(e) => setAnonymizeSubmissions(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Local Browser Storage</h4>
              <p className="text-xs text-slate-500">Store recent reports in client localStorage rather than a central server.</p>
            </div>
            <input
              type="checkbox"
              checked={saveHistoryLocally}
              onChange={(e) => setSaveHistoryLocally(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
