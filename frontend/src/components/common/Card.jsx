import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  header,
  headerAction,
  footer,
  ...props
}) {
  return (
    <div
      className={`bg-white dark:bg-[#1C273B] text-slate-900 dark:text-white rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm transition-colors duration-300 ${
        hover ? 'card-hover transition-all duration-200 hover:border-indigo-200 dark:hover:border-tan/40' : ''
      } ${className}`}
      {...props}
    >
      {(header || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div>{header}</div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={padding}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/60 dark:bg-white/5 rounded-b-2xl border-t border-slate-100 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
}
