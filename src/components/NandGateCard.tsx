import React, { useState } from 'react';
import { Zap, HelpCircle } from 'lucide-react';

export const NandGateCard: React.FC = () => {
  const [inputA, setInputA] = useState<number>(0);
  const [inputB, setInputB] = useState<number>(0);

  const outputQ = !(inputA === 1 && inputB === 1) ? 1 : 0;

  const truthTableRows = [
    { a: 0, b: 0, q: 1 },
    { a: 0, b: 1, q: 1 },
    { a: 1, b: 0, q: 1 },
    { a: 1, b: 1, q: 0 },
  ];

  return (
    <div className="bg-[#080d1a] border border-amber-500/30 hover:border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-amber-950/20 relative overflow-hidden transition-all">
      {/* Background glow accent */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Left column: Explanation & Controls */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center space-x-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>THE UNIVERSAL AXIOM</span>
            </span>
            <h3 className="text-xl font-bold text-white font-mono tracking-tight">
              What is a NAND Gate?
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            A <strong className="text-amber-300 font-mono">NAND (NOT-AND)</strong> gate produces an output of <strong className="text-emerald-400 font-mono">1</strong> for all input combinations <em>except</em> when both inputs <strong className="text-cyan-300 font-mono">A</strong> and <strong className="text-cyan-300 font-mono">B</strong> are <strong className="text-amber-400 font-mono">1</strong>. While real-world processors use various semiconductor logic families, NAND is <strong>functionally complete</strong>—meaning any Boolean function, memory unit, and digital computer can be constructed using <em>only</em> NAND gates!
          </p>

          {/* Interactive Input Switches */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center space-x-2 bg-[#0d1527] border border-cyan-500/20 rounded-lg p-1.5">
              <span className="text-xs font-mono font-bold text-slate-400 pl-1">Input A:</span>
              <button
                onClick={() => setInputA(inputA === 0 ? 1 : 0)}
                className={`px-3 py-1 rounded font-mono text-xs font-bold transition-all ${
                  inputA === 1
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {inputA}
              </button>
            </div>

            <div className="flex items-center space-x-2 bg-[#0d1527] border border-cyan-500/20 rounded-lg p-1.5">
              <span className="text-xs font-mono font-bold text-slate-400 pl-1">Input B:</span>
              <button
                onClick={() => setInputB(inputB === 0 ? 1 : 0)}
                className={`px-3 py-1 rounded font-mono text-xs font-bold transition-all ${
                  inputB === 1
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {inputB}
              </button>
            </div>

            <div className="flex items-center space-x-2 bg-[#0d1527] border border-amber-500/30 rounded-lg px-3 py-2 shadow-inner">
              <span className="text-xs font-mono font-bold text-amber-300">Output Q =</span>
              <span
                className={`font-mono text-sm font-bold ${
                  outputQ === 1 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-slate-500'
                }`}
              >
                {outputQ}
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Gate Schematic + Truth Table */}
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#030712]/90 p-4 rounded-xl border border-amber-500/25 w-full lg:w-auto shadow-inner">
          {/* Gate Schematic Diagram */}
          <div className="flex flex-col items-center justify-center p-1">
            <svg width="220" height="140" viewBox="0 0 220 140" className="overflow-visible">
              <defs>
                <linearGradient id="nandGateFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0.1" />
                </linearGradient>
                <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Input Line A */}
              <line
                x1="45"
                y1="40"
                x2="75"
                y2="40"
                stroke={inputA === 1 ? '#38bdf8' : '#334155'}
                strokeWidth="3"
                className="transition-colors"
              />
              <text
                x="32"
                y="45"
                fill={inputA === 1 ? '#38bdf8' : '#94a3b8'}
                className="text-base font-bold font-mono"
                textAnchor="end"
              >
                A ({inputA})
              </text>

              {/* Input Line B */}
              <line
                x1="45"
                y1="100"
                x2="75"
                y2="100"
                stroke={inputB === 1 ? '#38bdf8' : '#334155'}
                strokeWidth="3"
                className="transition-colors"
              />
              <text
                x="32"
                y="105"
                fill={inputB === 1 ? '#38bdf8' : '#94a3b8'}
                className="text-base font-bold font-mono"
                textAnchor="end"
              >
                B ({inputB})
              </text>

              {/* NAND Gate Body */}
              <path
                d="M 75 25 L 110 25 A 45 45 0 0 1 110 115 L 75 115 Z"
                fill="url(#nandGateFill)"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinejoin="round"
                filter="url(#amberGlow)"
              />
              {/* Label inside gate */}
              <text
                x="100"
                y="74"
                fill="#fef3c7"
                className="text-sm font-extrabold font-mono tracking-wider drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                textAnchor="middle"
              >
                NAND
              </text>

              {/* Invert Bubble at Output */}
              <circle
                cx="160"
                cy="70"
                r="6"
                fill="#030712"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />

              {/* Output Line Q */}
              <line
                x1="166"
                y1="70"
                x2="185"
                y2="70"
                stroke={outputQ === 1 ? '#34d399' : '#334155'}
                strokeWidth="3.5"
                className="transition-colors"
              />
              <text
                x="195"
                y="75"
                fill={outputQ === 1 ? '#34d399' : '#94a3b8'}
                className="text-lg font-extrabold font-mono"
                textAnchor="start"
              >
                Q ({outputQ})
              </text>
            </svg>
            <span className="text-[11px] font-mono text-slate-400 mt-1">Logic Gate Symbol</span>
          </div>

          {/* Truth Table */}
          <div className="bg-[#0b1322] text-slate-200 rounded-xl p-3 font-mono border border-amber-500/30 shadow-lg min-w-[160px]">
            <div className="text-center font-bold text-xs uppercase tracking-wider mb-2 pb-1 border-b border-amber-500/30 text-amber-300">
              Truth Table
            </div>
            <table className="w-full text-center text-xs font-bold border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-1 px-2.5 border-r border-slate-800">A</th>
                  <th className="py-1 px-2.5 border-r border-slate-800">B</th>
                  <th className="py-1 px-2.5">Q</th>
                </tr>
              </thead>
              <tbody>
                {truthTableRows.map((row) => {
                  const isActive = row.a === inputA && row.b === inputB;
                  return (
                    <tr
                      key={`${row.a}-${row.b}`}
                      className={`transition-all duration-150 ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-200 font-extrabold shadow-[inset_0_0_8px_rgba(245,158,11,0.2)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <td className={`py-1.5 px-2.5 border-r border-slate-800/80 ${isActive ? 'text-cyan-300' : ''}`}>{row.a}</td>
                      <td className={`py-1.5 px-2.5 border-r border-slate-800/80 ${isActive ? 'text-cyan-300' : ''}`}>{row.b}</td>
                      <td className={`py-1.5 px-2.5 ${row.q === 1 ? 'text-emerald-400' : 'text-slate-500'} ${isActive && row.q === 1 ? 'drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]' : ''}`}>
                        {row.q}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
