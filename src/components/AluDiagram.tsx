import React from 'react';
import { formatValue } from '../utils/logicSimulator';

interface AluDiagramProps {
  x: number;
  y: number;
  zx: number;
  nx: number;
  zy: number;
  ny: number;
  f: number;
  no: number;
  out: number;
  zr: number;
  ng: number;
  onToggleControl?: (control: 'zx' | 'nx' | 'zy' | 'ny' | 'f' | 'no') => void;
}

export const AluDiagram: React.FC<AluDiagramProps> = ({
  x,
  y,
  zx,
  nx,
  zy,
  ny,
  f,
  no,
  out,
  zr,
  ng,
  onToggleControl,
}) => {
  const formattedX = formatValue(x, 16);
  const formattedY = formatValue(y, 16);
  const formattedOut = formatValue(out, 16);

  const controls = [
    { name: 'zx', val: zx, x: 180, desc: 'Zero x' },
    { name: 'nx', val: nx, x: 210, desc: 'Negate x' },
    { name: 'zy', val: zy, x: 240, desc: 'Zero y' },
    { name: 'ny', val: ny, x: 270, desc: 'Negate y' },
    { name: 'f',  val: f,  x: 300, desc: '0:AND, 1:ADD' },
    { name: 'no', val: no, x: 330, desc: 'Negate out' },
  ] as const;

  return (
    <div className="bg-[#080c14] rounded-2xl p-5 border border-white/10 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
          <span>Hack ALU Schematic Diagram</span>
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">
          Click control signals to toggle
        </span>
      </div>

      <div className="w-full max-w-2xl overflow-x-auto flex justify-start sm:justify-center py-2 touch-pan-x">
        <svg
          viewBox="0 0 520 330"
          className="w-full max-w-[560px] min-w-[480px] shrink-0 h-auto select-none"
          style={{ filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.5))' }}
        >
          <defs>
            {/* Arrowhead marker right */}
            <marker
              id="arrow-right"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>

            {/* Arrowhead marker down */}
            <marker
              id="arrow-down"
              viewBox="0 0 10 10"
              refX="5"
              refY="8"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 1 0 L 5 10 L 9 0 z" fill="#38bdf8" />
            </marker>

            {/* Arrowhead marker down for flags */}
            <marker
              id="arrow-flag-zr"
              viewBox="0 0 10 10"
              refX="5"
              refY="8"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 1 0 L 5 10 L 9 0 z" fill={zr ? '#38bdf8' : '#475569'} />
            </marker>

            <marker
              id="arrow-flag-ng"
              viewBox="0 0 10 10"
              refX="5"
              refY="8"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 1 0 L 5 10 L 9 0 z" fill={ng ? '#f43f5e' : '#475569'} />
            </marker>

            {/* Output arrowhead */}
            <marker
              id="arrow-out"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
            </marker>

            {/* Gradient background for ALU block */}
            <linearGradient id="alu-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* TOP CONTROL SIGNALS (zx, nx, zy, ny, f, no) */}
          {controls.map((ctrl) => {
            const isActive = ctrl.val === 1;
            return (
              <g
                key={ctrl.name}
                onClick={() => onToggleControl && onToggleControl(ctrl.name)}
                className="cursor-pointer group"
              >
                {/* Text Label */}
                <text
                  x={ctrl.x}
                  y={18}
                  textAnchor="middle"
                  className="font-mono font-bold text-[13px] transition-colors"
                  fill={isActive ? '#38bdf8' : '#94a3b8'}
                >
                  {ctrl.name}
                </text>

                {/* Line downwards */}
                <line
                  x1={ctrl.x}
                  y1={24}
                  x2={ctrl.x}
                  y2={54}
                  stroke={isActive ? '#38bdf8' : '#475569'}
                  strokeWidth={isActive ? '2.5' : '1.5'}
                  markerEnd="url(#arrow-down)"
                />

                {/* Bit value badge */}
                <rect
                  x={ctrl.x - 9}
                  y={28}
                  width={18}
                  height={14}
                  rx={3}
                  fill={isActive ? '#0284c7' : '#1e293b'}
                  stroke={isActive ? '#38bdf8' : '#475569'}
                  strokeWidth="1"
                />
                <text
                  x={ctrl.x}
                  y={39}
                  textAnchor="middle"
                  className="font-mono font-bold text-[10px]"
                  fill={isActive ? '#ffffff' : '#94a3b8'}
                >
                  {ctrl.val}
                </text>
              </g>
            );
          })}

          {/* ALU POLYGON SYMBOL */}
          {/* Exact geometry matching the textbook diagram */}
          <path
            d="M 170,60 L 340,60 L 380,100 L 380,200 L 340,240 L 170,240 L 130,210 L 130,170 L 155,150 L 130,130 L 130,90 Z"
            fill="url(#alu-grad)"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Central ALU Title */}
          <text
            x={255}
            y={158}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-sans font-extrabold text-[28px] tracking-wider fill-white"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
          >
            ALU
          </text>

          {/* LEFT INPUT BUS X */}
          <g>
            {/* Label x */}
            <text
              x={25}
              y={114}
              textAnchor="start"
              className="font-mono font-bold text-[18px] fill-cyan-400"
            >
              x
            </text>

            {/* Input Value Display */}
            <text
              x={55}
              y={102}
              className="font-mono text-[11px] fill-slate-300 font-bold"
            >
              = {formattedX.signed}
            </text>

            {/* Wire line */}
            <line
              x1={40}
              y1={110}
              x2={122}
              y2={110}
              stroke="#38bdf8"
              strokeWidth="2.5"
              markerEnd="url(#arrow-right)"
            />

            {/* Bus slash mark */}
            <line
              x1={75}
              y1={103}
              x2={85}
              y2={117}
              stroke="#38bdf8"
              strokeWidth="2"
            />

            {/* 16 bits label */}
            <text
              x={80}
              y={128}
              textAnchor="middle"
              className="font-mono text-[10px] fill-slate-400 font-semibold"
            >
              16 bits
            </text>
          </g>

          {/* LEFT INPUT BUS Y */}
          <g>
            {/* Label y */}
            <text
              x={25}
              y={194}
              textAnchor="start"
              className="font-mono font-bold text-[18px] fill-cyan-400"
            >
              y
            </text>

            {/* Input Value Display */}
            <text
              x={55}
              y={182}
              className="font-mono text-[11px] fill-slate-300 font-bold"
            >
              = {formattedY.signed}
            </text>

            {/* Wire line */}
            <line
              x1={40}
              y1={190}
              x2={122}
              y2={190}
              stroke="#38bdf8"
              strokeWidth="2.5"
              markerEnd="url(#arrow-right)"
            />

            {/* Bus slash mark */}
            <line
              x1={75}
              y1={183}
              x2={85}
              y2={197}
              stroke="#38bdf8"
              strokeWidth="2"
            />

            {/* 16 bits label */}
            <text
              x={80}
              y={208}
              textAnchor="middle"
              className="font-mono text-[10px] fill-slate-400 font-semibold"
            >
              16 bits
            </text>
          </g>

          {/* RIGHT OUTPUT BUS out / f(x,y) */}
          <g>
            {/* Function f(x,y) label above wire */}
            <text
              x={425}
              y={132}
              textAnchor="middle"
              className="font-mono font-bold text-[14px] fill-slate-200"
            >
              f(x,y)
            </text>

            {/* Wire line */}
            <line
              x1={380}
              y1={150}
              x2={452}
              y2={150}
              stroke="#34d399"
              strokeWidth="3"
              markerEnd="url(#arrow-out)"
            />

            {/* Bus slash mark */}
            <line
              x1={415}
              y1={143}
              x2={425}
              y2={157}
              stroke="#34d399"
              strokeWidth="2"
            />

            {/* 16 bits label below wire */}
            <text
              x={420}
              y={168}
              textAnchor="middle"
              className="font-mono text-[10px] fill-slate-400 font-semibold"
            >
              16 bits
            </text>

            {/* Label out */}
            <text
              x={464}
              y={155}
              textAnchor="start"
              className="font-mono font-extrabold text-[18px] fill-emerald-400"
            >
              out
            </text>

            {/* Out Value Display */}
            <text
              x={464}
              y={172}
              className="font-mono text-[12px] fill-emerald-300 font-bold"
            >
              = {formattedOut.signed}
            </text>
          </g>

          {/* BOTTOM FLAG zr */}
          <g>
            <line
              x1={220}
              y1={240}
              x2={220}
              y2={282}
              stroke={zr ? '#38bdf8' : '#475569'}
              strokeWidth={zr ? '2.5' : '1.5'}
              markerEnd="url(#arrow-flag-zr)"
            />

            <text
              x={220}
              y={302}
              textAnchor="middle"
              className="font-mono font-bold text-[15px] transition-colors"
              fill={zr ? '#38bdf8' : '#64748b'}
            >
              zr
            </text>

            <rect
              x={205}
              y={310}
              width={30}
              height={14}
              rx={3}
              fill={zr ? '#0284c7' : '#0f172a'}
              stroke={zr ? '#38bdf8' : '#334155'}
              strokeWidth="1"
            />
            <text
              x={220}
              y={321}
              textAnchor="middle"
              className="font-mono font-bold text-[9px]"
              fill={zr ? '#ffffff' : '#64748b'}
            >
              {zr}
            </text>
          </g>

          {/* BOTTOM FLAG ng */}
          <g>
            <line
              x1={290}
              y1={240}
              x2={290}
              y2={282}
              stroke={ng ? '#f43f5e' : '#475569'}
              strokeWidth={ng ? '2.5' : '1.5'}
              markerEnd="url(#arrow-flag-ng)"
            />

            <text
              x={290}
              y={302}
              textAnchor="middle"
              className="font-mono font-bold text-[15px] transition-colors"
              fill={ng ? '#f43f5e' : '#64748b'}
            >
              ng
            </text>

            <rect
              x={275}
              y={310}
              width={30}
              height={14}
              rx={3}
              fill={ng ? '#e11d48' : '#0f172a'}
              stroke={ng ? '#f43f5e' : '#334155'}
              strokeWidth="1"
            />
            <text
              x={290}
              y={321}
              textAnchor="middle"
              className="font-mono font-bold text-[9px]"
              fill={ng ? '#ffffff' : '#64748b'}
            >
              {ng}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};
