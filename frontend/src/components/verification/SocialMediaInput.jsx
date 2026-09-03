import React, { useState } from 'react';
import { Share2, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

export default function SocialMediaInput({ onAnalyze, isLoading }) {
  const [socialUrl, setSocialUrl] = useState('');
  const [error, setError] = useState('');

  const platforms = [
    { name: 'X / Twitter', example: 'twitter.com/...' },
    { name: 'Reddit', example: 'reddit.com/r/...' },
    { name: 'YouTube', example: 'youtube.com/watch?v=...' },
    { name: 'Instagram', example: 'instagram.com/p/...' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!socialUrl.trim()) return;

    if (!socialUrl.includes('http') && !socialUrl.includes('.com') && !socialUrl.includes('.org')) {
      setError('Please provide a valid social media post link.');
      return;
    }

    setError('');
    onAnalyze({ type: 'social', content: socialUrl.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="relative rounded-2xl border border-slate-200 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-2xs">
          <div className="flex items-center px-4 py-3 sm:py-4">
            <Share2 className="w-5 h-5 text-indigo-500 mr-3 shrink-0" />
            <input
              type="text"
              value={socialUrl}
              onChange={(e) => {
                setSocialUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="Paste a public social media post URL..."
              className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none"
            />
            {socialUrl && (
              <button
                type="button"
                onClick={() => setSocialUrl('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 px-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Platform Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-slate-400 mr-1">Supported platforms:</span>
        {platforms.map((p) => (
          <span
            key={p.name}
            className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60"
          >
            {p.name}
          </span>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <span className="text-xs text-slate-400">
          FactSight checks author credibility, bot network propagation patterns, and viral claim veracity.
        </span>

        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={Sparkles}
          iconPosition="left"
          disabled={!socialUrl.trim()}
          isLoading={isLoading}
          className="w-full sm:w-auto shadow-md shadow-indigo-500/20"
        >
          Analyze Post
        </Button>
      </div>
    </form>
  );
}
