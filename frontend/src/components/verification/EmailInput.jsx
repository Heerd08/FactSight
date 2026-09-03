import React, { useState } from 'react';
import { Mail, Sparkles, Trash2, ShieldAlert } from 'lucide-react';
import Button from '../common/Button';

export default function EmailInput({ onAnalyze, isLoading }) {
  const [emailText, setEmailText] = useState('');
  const [sender, setSender] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailText.trim()) return;
    onAnalyze({
      type: 'email',
      content: emailText,
      sender: sender.trim() || undefined,
    });
  };

  const handleClear = () => {
    setEmailText('');
    setSender('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {/* Optional Sender Field */}
        <div className="flex items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-2xs">
          <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Sender address (e.g., alerts@bank-security-notice.com) [Optional]"
            className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none"
          />
        </div>

        {/* Email Body */}
        <div className="relative rounded-2xl border border-slate-200 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-2xs">
          <textarea
            rows={5}
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Paste raw email body, suspicious newsletters, urgent account alerts, or investment solicitations..."
            className="w-full p-4 sm:p-5 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none resize-none"
          />

          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/60 rounded-b-2xl border-t border-slate-100 text-xs text-slate-400">
            <span>Evaluates phishing indicators & urgency pressure</span>
            {emailText && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <span className="text-xs text-slate-400">
          FactSight checks spoofed sender domains, social-engineering tactics, and fraudulent requests.
        </span>

        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={Sparkles}
          iconPosition="left"
          disabled={!emailText.trim()}
          isLoading={isLoading}
          className="w-full sm:w-auto shadow-md shadow-indigo-500/20"
        >
          Verify Email
        </Button>
      </div>
    </form>
  );
}
