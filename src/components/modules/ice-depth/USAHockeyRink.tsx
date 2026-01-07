import React from 'react';

interface Point {
  id: number;
  x: number;
  y: number;
  name?: string;
}

interface USAHockeyRinkProps {
  showPoints?: boolean;
  points?: Point[];
  measurements?: Record<string, number>;
  currentPointId?: number;
  onPointClick?: (pointId: number) => void;
  unit?: 'in' | 'mm';
  facilityLogo?: string;
  className?: string;
}

// Helper function to determine color based on depth
const getDepthColor = (depth: number, unit: 'in' | 'mm'): string => {
  // Convert to inches for comparison
  const depthInInches = unit === 'mm' ? depth / 25.4 : depth;

  if (depthInInches < 1) return '#ef4444'; // Red - too thin
  if (depthInInches > 1.75) return '#f59e0b'; // Yellow - too thick
  return '#10b981'; // Green - optimal
};

// Format display value
const displayValue = (value: number, unit: 'in' | 'mm'): string => {
  return unit === 'mm' ? `${value.toFixed(0)}` : `${value.toFixed(2)}"`;
};

export const USAHockeyRink: React.FC<USAHockeyRinkProps> = ({
  showPoints = false,
  points = [],
  measurements = {},
  currentPointId,
  onPointClick,
  unit = 'in',
  facilityLogo,
  className = '',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 850"
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      <defs>
        <linearGradient id="creaseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#b3d9ff', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: '#87ceeb', stopOpacity: 0.4 }} />
        </linearGradient>
        <linearGradient id="iceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f0f9ff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#e0f2fe', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="400" height="850" fill="#f8fafc" />

      {/* Ice surface with rounded corners (boards) */}
      <rect
        x="10"
        y="10"
        width="380"
        height="830"
        rx="56"
        ry="56"
        fill="url(#iceGradient)"
        stroke="#1a365d"
        strokeWidth="4"
      />

      {/* Center red line */}
      <line x1="10" y1="425" x2="390" y2="425" stroke="#c53030" strokeWidth="12" />

      {/* Blue lines */}
      <line x1="10" y1="285" x2="390" y2="285" stroke="#2b6cb0" strokeWidth="10" />
      <line x1="10" y1="565" x2="390" y2="565" stroke="#2b6cb0" strokeWidth="10" />

      {/* Goal lines */}
      <path d="M 45 70 L 355 70" stroke="#c53030" strokeWidth="4" strokeLinecap="round" />
      <path d="M 45 780 L 355 780" stroke="#c53030" strokeWidth="4" strokeLinecap="round" />

      {/* Top goal crease */}
      <path
        d="M 165 70 L 165 100 Q 165 115, 200 115 Q 235 115, 235 100 L 235 70 Z"
        fill="url(#creaseGradient)"
        stroke="#c53030"
        strokeWidth="2"
      />
      <path d="M 165 100 Q 200 140, 235 100" fill="none" stroke="#c53030" strokeWidth="2" />

      {/* Bottom goal crease */}
      <path
        d="M 165 780 L 165 750 Q 165 735, 200 735 Q 235 735, 235 750 L 235 780 Z"
        fill="url(#creaseGradient)"
        stroke="#c53030"
        strokeWidth="2"
      />
      <path d="M 165 750 Q 200 710, 235 750" fill="none" stroke="#c53030" strokeWidth="2" />

      {/* Center ice circle */}
      <circle cx="200" cy="425" r="50" fill="none" stroke="#2b6cb0" strokeWidth="3" />
      <circle cx="200" cy="425" r="6" fill="#2b6cb0" />

      {/* Face-off circles (4 total) */}
      {/* Top left */}
      <circle cx="110" cy="160" r="50" fill="none" stroke="#c53030" strokeWidth="2" />
      <circle cx="110" cy="160" r="6" fill="#c53030" />

      {/* Top right */}
      <circle cx="290" cy="160" r="50" fill="none" stroke="#c53030" strokeWidth="2" />
      <circle cx="290" cy="160" r="6" fill="#c53030" />

      {/* Bottom left */}
      <circle cx="110" cy="690" r="50" fill="none" stroke="#c53030" strokeWidth="2" />
      <circle cx="110" cy="690" r="6" fill="#c53030" />

      {/* Bottom right */}
      <circle cx="290" cy="690" r="50" fill="none" stroke="#c53030" strokeWidth="2" />
      <circle cx="290" cy="690" r="6" fill="#c53030" />

      {/* Neutral zone face-off dots (4 total) */}
      <circle cx="110" cy="335" r="6" fill="#c53030" />
      <circle cx="290" cy="335" r="6" fill="#c53030" />
      <circle cx="110" cy="515" r="6" fill="#c53030" />
      <circle cx="290" cy="515" r="6" fill="#c53030" />

      {/* Facility logo at center ice */}
      {facilityLogo && (
        <image
          href={facilityLogo}
          x="150"
          y="375"
          width="100"
          height="100"
          opacity="0.3"
        />
      )}

      {/* Measurement points overlay */}
      {showPoints && points.map((point) => {
        const measurementKey = `Point ${point.id}`;
        const depth = measurements[measurementKey];

        // Convert percentage to SVG coordinates
        // x: 0-100% maps to 10-390 (ice surface)
        // y: 0-100% maps to 10-840 (ice surface)
        const svgX = 10 + (point.x / 100) * 380;
        const svgY = 10 + (point.y / 100) * 830;

        const isCurrent = currentPointId === point.id;
        const color = depth ? getDepthColor(depth, unit) : '#6b7280';

        return (
          <g
            key={point.id}
            onClick={() => onPointClick?.(point.id)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            style={{ cursor: onPointClick ? 'pointer' : 'default' }}
          >
            {/* Outer ring for current point */}
            {isCurrent && (
              <circle
                cx={svgX}
                cy={svgY}
                r="20"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                className="animate-pulse"
              />
            )}

            {/* Point circle */}
            <circle
              cx={svgX}
              cy={svgY}
              r="14"
              fill={color}
              stroke="#fff"
              strokeWidth="2"
            />

            {/* Point label */}
            <text
              x={svgX}
              y={svgY + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize="11"
              fontWeight="600"
            >
              {point.id}
            </text>

            {/* Depth value below point */}
            {depth && (
              <text
                x={svgX}
                y={svgY + 28}
                textAnchor="middle"
                fill="#374151"
                fontSize="10"
                fontWeight="500"
              >
                {displayValue(depth, unit)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
