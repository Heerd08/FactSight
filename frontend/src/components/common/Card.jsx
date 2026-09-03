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
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(99,102,241,0.06)] ${
        hover ? 'card-hover transition-all duration-200 hover:border-indigo-200' : ''
      } ${className}`}
      {...props}
    >
      {(header || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>{header}</div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={padding}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/60 rounded-b-2xl border-t border-slate-100 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
}
