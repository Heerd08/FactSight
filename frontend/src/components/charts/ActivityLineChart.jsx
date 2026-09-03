import React, { useState } from 'react';

export default function ActivityLineChart({
  data = [
    { day: 'Mon', claims: 45, verified: 32 },
    { day: 'Tue', claims: 58, verified: 41 },
    { day: 'Wed', claims: 72, verified: 54 },
    { day: 'Thu', claims: 64, verified: 48 },
    { day: 'Fri', claims: 89, verified: 67 },
    { day: 'Sat', claims: 53, verified: 39 },
    { day: 'Sun', claims: 68, verified: 51 },
  ]
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxVal = Math.max(...data.map(d => d.claims), 100);
  const height = 180;
  const width = 480;
  const paddingX = 30;
  const paddingY = 20;

  const getX = (idx) => paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX);
  const getY = (val) => height - paddingY - (val / maxVal) * (height - 2 * paddingY);

  const points = data.map((d, i) => `${getX(i)},${getY(d.claims)}`).join(' ');
  const areaPoints = `${getX(0)},${height - paddingY} ${points} ${getX(data.length - 1)},${height - paddingY}`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            <span className="text-slate-600 font-medium">Claims Scanned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-medium">Corroborated</span>
          </div>
        </div>
        <span className="text-slate-400 font-mono text-[11px]">Last 7 Days</span>
      </div>

      <div className="relative w-full h-[180px] select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, i) => {
            const y = height - paddingY - ratio * (height - 2 * paddingY);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Gradient Area */}
          <polygon points={areaPoints} fill="url(#areaGradient)" />

          {/* Trend Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#4F46E5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Nodes */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.claims);
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  className={`${isHovered ? 'fill-indigo-600 stroke-white stroke-2' : 'fill-white stroke-indigo-600 stroke-2'} transition-all`}
                />
                {/* Day label */}
                <text
                  x={cx}
                  y={height - 2}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-sans"
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredIdx !== null && (
          <div
            className="absolute bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 z-20"
            style={{
              left: `${(getX(hoveredIdx) / width) * 100}%`,
              top: `${getY(data[hoveredIdx].claims)}px`,
            }}
          >
            <div className="font-bold">{data[hoveredIdx].day}</div>
            <div className="text-indigo-200">{data[hoveredIdx].claims} Claims checked</div>
            <div className="text-emerald-300">{data[hoveredIdx].verified} Verified True</div>
          </div>
        )}
      </div>
    </div>
  );
}
