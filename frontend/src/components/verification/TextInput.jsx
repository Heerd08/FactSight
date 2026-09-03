import React, { useState } from 'react';
import { Sparkles, Trash2, HelpCircle } from 'lucide-react';
import Button from '../common/Button';

export default function TextInput({ onAnalyze, isLoading }) {
  const [text, setText] = useState('');
  const maxChars = 5000;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAnalyze({ type: 'text', content: text });
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative rounded-2xl border border-slate-200 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-2xs">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxChars))}
          placeholder="Paste the text or claim you want to verify..."
          rows={6}
          className="w-full p-4 sm:p-5 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent rounded-2xl border-none focus:outline-none resize-y min-h-[160px]"
        />

        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {text.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Clear text"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className={`font-mono text-xs ${text.length > maxChars * 0.9 ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}>
              {text.length} / {maxChars}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Tip: Include direct quotes, factual statistics, or news excerpts for highest accuracy.</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={Sparkles}
          iconPosition="left"
          disabled={!text.trim()}
          isLoading={isLoading}
          className="w-full sm:w-auto shadow-md shadow-indigo-500/20"
        >
          Analyze Content
        </Button>
      </div>
    </form>
  );
}
