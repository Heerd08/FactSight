import React, { useState } from 'react';
import { Globe, Sparkles, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

export default function UrlInput({ onAnalyze, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    if (!urlPattern.test(url.trim())) {
      setError('Please enter a valid article or webpage URL.');
      return;
    }

    setError('');
    onAnalyze({ type: 'url', content: url.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="relative rounded-2xl border border-slate-200 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-2xs">
          <div className="flex items-center px-4 py-3 sm:py-4">
            <Globe className="w-5 h-5 text-indigo-500 mr-3 shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="https://example.com/news-article-or-report..."
              className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none"
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <span className="text-xs text-slate-400">
          FactSight extracts main claims, compares reporting against primary sources, and assesses domain reputation.
        </span>

        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={Sparkles}
          iconPosition="left"
          disabled={!url.trim()}
          isLoading={isLoading}
          className="w-full sm:w-auto shadow-md shadow-indigo-500/20"
        >
          Analyze Article
        </Button>
      </div>
    </form>
  );
}
