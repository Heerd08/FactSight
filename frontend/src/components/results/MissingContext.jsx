import React from 'react';
import { Info, HelpCircle, AlertCircle } from 'lucide-react';
import Card from '../common/Card';

export default function MissingContext({ contextItems = [] }) {
  return (
    <Card header={<h4 className="text-sm font-bold text-slate-800">Missing Context & Nuance</h4>}>
      {contextItems && contextItems.length > 0 ? (
        <ul className="space-y-2.5">
          {contextItems.map((item, idx) => (
            <li
              key={idx}
              className="p-3 rounded-xl bg-sky-50/40 border border-sky-100/80 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
            >
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400">
          <p>Omitted timeline events, statistical baseline figures, or quotes taken out of context will be listed here.</p>
        </div>
      )}
    </Card>
  );
}
