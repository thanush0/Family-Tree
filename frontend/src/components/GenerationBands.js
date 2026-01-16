import React from 'react';

/**
 * GenerationBands Component
 * Renders background bands to visually separate generations
 */
function GenerationBands({ generationBands, viewportWidth = 10000, viewportHeight = 5000 }) {
  if (!generationBands || generationBands.length === 0) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      viewBox={`${-viewportWidth / 2} ${-200} ${viewportWidth} ${viewportHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Define patterns and gradients for bands */}
        <linearGradient id="bandGradient0" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.08)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0.03)', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="bandGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(16, 185, 129, 0.08)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(16, 185, 129, 0.03)', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="bandGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(168, 85, 247, 0.08)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(168, 85, 247, 0.03)', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="bandGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'rgba(251, 191, 36, 0.08)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(251, 191, 36, 0.03)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {generationBands.map((band, index) => (
        <g key={band.generation}>
          {/* Background band */}
          <rect
            x={-viewportWidth / 2}
            y={band.y}
            width={viewportWidth}
            height={band.height}
            fill={`url(#bandGradient${index % 4})`}
            opacity={0.6}
          />
          
          {/* Top border line */}
          <line
            x1={-viewportWidth / 2}
            y1={band.y}
            x2={viewportWidth / 2}
            y2={band.y}
            stroke="rgba(71, 85, 105, 0.3)"
            strokeWidth="2"
            strokeDasharray="10, 5"
          />
          
          {/* Generation label */}
          <text
            x={-viewportWidth / 2 + 40}
            y={band.y + 30}
            fill="rgba(226, 232, 240, 0.5)"
            fontSize="16"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Generation {band.generation}
          </text>
          
          {/* Decorative corner accent */}
          <circle
            cx={-viewportWidth / 2 + 20}
            cy={band.y + 30}
            r="6"
            fill={`hsla(${index * 30}, 60%, 60%, 0.4)`}
            stroke={`hsla(${index * 30}, 60%, 60%, 0.8)`}
            strokeWidth="2"
          />
        </g>
      ))}
    </svg>
  );
}

export default GenerationBands;
