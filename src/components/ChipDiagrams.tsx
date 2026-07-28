import React from 'react';
import { ChipData } from '../types';
import { ExternalLink } from 'lucide-react';

interface SubChipBoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  type: string;
  onInspect?: (type: string) => void;
  highlight?: boolean;
}

export const SubChipBox: React.FC<SubChipBoxProps> = ({
  x,
  y,
  w,
  h,
  name,
  type,
  highlight = false,
}) => {
  return (
    <g className="subchip-block">
      {/* Background Box */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="8"
        fill="#0f172a"
        stroke={highlight ? '#38bdf8' : '#334155'}
        strokeWidth="1.5"
        className="transition-colors"
      />
      {/* Header Accent Line */}
      <rect
        x={x + 1}
        y={y + 1}
        width={w - 2}
        height={4}
        rx="2"
        fill={highlight ? '#0284c7' : '#1e293b'}
      />

      {/* Chip Name */}
      <text
        x={x + w / 2}
        y={name !== type ? y + h / 2 - 2 : y + h / 2 + 4}
        textAnchor="middle"
        fill="#f8fafc"
        fontSize="11"
        fontWeight="bold"
        className="font-mono"
      >
        {name}
      </text>

      {/* Subchip Type Label */}
      {name !== type && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 12}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="9"
          className="font-mono"
        >
          ({type})
        </text>
      )}
    </g>
  );
};

// Wire line with live state coloring
interface WirePathProps {
  d: string;
  val: number;
  width?: number;
  label?: string;
  labelX?: number;
  labelY?: number;
}

export const WirePath: React.FC<WirePathProps> = ({
  d,
  val,
  width = 2,
  label,
  labelX,
  labelY,
}) => {
  const isHigh = val !== 0;
  const strokeColor = isHigh ? '#38bdf8' : '#334155';
  const glowFilter = isHigh ? 'drop-shadow(0 0 4px #38bdf8)' : 'none';

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={width}
        style={{ filter: glowFilter }}
        className="transition-colors duration-200"
      />
      {label && labelX !== undefined && labelY !== undefined && (
        <text
          x={labelX}
          y={labelY}
          fill={isHigh ? '#7dd3fc' : '#64748b'}
          fontSize="9"
          fontWeight="bold"
          className="font-mono"
        >
          {label}
        </text>
      )}
    </g>
  );
};
