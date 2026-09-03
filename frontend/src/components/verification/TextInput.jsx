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
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxChars))}
          placeholder="Paste news text, a viral claim, quote, or paragraph to evaluate credibility and retrieve verified fact-checks..."
          className="w-full p-4 sm:p-5 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none resize-none"
        />

        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/60 rounded-b-2xl border-t border-slate-100 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className={text.length > maxChars * 0.9 ? 'text-amber-600 font-semibold' : ''}>
              {text.length} / {maxChars} characters
            </span>
          </div>

          {text && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>FactSight cross-references DeBERTa classification with live RAG vector search.</span>
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
          Verify Content
        </Button>
      </div>
    </form>
  );
}
