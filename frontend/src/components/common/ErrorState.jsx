import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong while analyzing this content.',
  description = 'Our verification pipeline encountered an issue communicating with the verification service.',
  onRetry,
  retryLabel = 'Try Again'
}) {
  return (
    <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-rose-100 shadow-sm max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-4 shadow-2xs">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-2">{title}</h4>
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
        {description}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          icon={RotateCcw}
          onClick={onRetry}
          className="hover:border-rose-200 hover:text-rose-600"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
