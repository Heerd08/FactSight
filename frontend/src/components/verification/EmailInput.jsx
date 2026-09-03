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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {/* Sender optional header */}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 flex items-center gap-2 text-xs focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-2xs">
          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Sender address or domain (optional, e.g. alerts@bank-support.co)"
            className="w-full text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none text-xs sm:text-sm"
          />
        </div>

        {/* Email body textarea */}
        <div className="relative rounded-2xl border border-slate-200 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-2xs">
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Paste the email content you want to verify..."
            rows={6}
            className="w-full p-4 sm:p-5 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent rounded-2xl border-none focus:outline-none resize-y min-h-[160px]"
          />

          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl text-xs text-slate-500">
            <div className="flex items-center gap-2">
              {emailText.length > 0 && (
                <button
                  type="button"
                  onClick={() => setEmailText('')}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
            <span className="text-slate-400">{emailText.length} characters</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>Detects phishing phrasing, forged sender claims, urgency hooks, and malicious links.</span>
        </div>

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
          Analyze Email
        </Button>
      </div>
    </form>
  );
}
