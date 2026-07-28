import React, { useState } from 'react';
import { HackCpuState } from '../types';
import { formatValue } from '../utils/logicSimulator';
import { Cpu, Eye, EyeOff, Play, Pause, SkipForward, RotateCcw, X, Info, Zap } from 'lucide-react';

interface HackCpuDiagramProps {
  cpuState: HackCpuState;
  isRunning?: boolean;
  onToggleRun?: () => void;
  onStep?: () => void;
  onReset?: () => void;
  runSpeed?: number;
  onSpeedChange?: (speed: number) => void;
}

export const HackCpuDiagram: React.FC<HackCpuDiagramProps> = ({
  cpuState,
  isRunning = false,
  onToggleRun,
  onStep,
  onReset,
  runSpeed = 300,
  onSpeedChange
}) => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showValuesOnWires, setShowValuesOnWires] = useState<boolean>(true);

  const currentInstr = cpuState.rom[cpuState.pc] ?? 0;
  const isCInstr = (currentInstr & 0x8000) !== 0;

  // Control signals
  const aBit = isCInstr ? (currentInstr >> 12) & 1 : 0;
  const cBits = isCInstr ? (currentInstr >> 6) & 0b111111 : 0;
  const loadA = !isCInstr || ((currentInstr >> 5) & 1) === 1;
  const loadD = isCInstr && (((currentInstr >> 4) & 1) === 1);
  const writeM = cpuState.writeM;
  const jBits = isCInstr ? currentInstr & 0b111 : 0;

  const zr = cpuState.zr;
  const ng = cpuState.ng;
  const pos = !zr && !ng;
  const j1 = (jBits & 4) !== 0;
  const j2 = (jBits & 2) !== 0;
  const j3 = (jBits & 1) !== 0;
  const loadPC = isCInstr && ((j1 && ng) || (j2 && zr) || (j3 && pos));

  // Values
  const inMVal = cpuState.memory[cpuState.aReg & 0x3F] || 0;
  const aRegVal = cpuState.aReg;
  const dRegVal = cpuState.dReg;
  const amVal = aBit === 1 ? inMVal : aRegVal;
  const aluOutVal = cpuState.outM;
  const pcVal = cpuState.pc;
  const addressMVal = cpuState.addressM;

  const instrFmt = formatValue(currentInstr, 16);

  // Mux selections
  const mux1Sel = isCInstr ? 'a (ALU Result)' : 'b (Instruction Constant)';
  const mux2Sel = aBit === 1 ? 'b (Data In RAM[A])' : 'a (A Register)';

  const toggleElement = (id: string) => {
    setSelectedElement((prev) => (prev === id ? null : id));
  };

  const getHighlightClass = () => {
    return 'cursor-pointer hover:opacity-90 transition-all';
  };

  const getShapeProps = (
    id: string,
    defaultStroke: string,
    defaultWidth: number = 2,
    activeStroke: string = '#22d3ee',
    glowColor: string = 'rgba(34,211,238,0.9)'
  ) => {
    const isSelected = selectedElement === id;
    return {
      stroke: isSelected ? activeStroke : defaultStroke,
      strokeWidth: isSelected ? defaultWidth + 1.5 : defaultWidth,
      className: isSelected ? `transition-all filter drop-shadow-[0_0_8px_${glowColor}]` : 'transition-all',
    };
  };

  return (
    <div className="bg-[#06090e] rounded-2xl border border-white/10 p-5 shadow-2xl relative overflow-hidden font-mono text-xs space-y-4">
      {/* Header bar with Execution Controls inside the CPU Diagram card */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Hack CPU Architecture Blueprint</span>
          </h3>
        </div>

        {/* Embedded Execution Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tick / Step Button */}
          {onStep && (
            <button
              onClick={onStep}
              disabled={isRunning}
              className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-bold flex items-center space-x-1.5 transition-all shadow-[0_0_10px_rgba(34,211,238,0.3)] font-mono"
              title="Execute 1 Clock Cycle (Tick)"
            >
              <SkipForward className="w-3.5 h-3.5 fill-current" />
              <span>Tick Clock</span>
            </button>
          )}

          {/* Run / Pause Button */}
          {onToggleRun && (
            <button
              onClick={onToggleRun}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 transition-all font-mono ${
                isRunning
                  ? 'bg-amber-400 text-black hover:bg-amber-300'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Run'}</span>
            </button>
          )}

          {/* Reset Button */}
          {onReset && (
            <button
              onClick={onReset}
              className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 flex items-center space-x-1 transition-all"
              title="Reset PC and CPU State"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          )}

          {/* Speed Slider Control */}
          {onSpeedChange && (
            <div className="flex items-center space-x-2 px-2.5 py-1 bg-[#0a0f18] rounded-lg border border-white/10">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                  <span>Speed:</span>
                  <span className="font-bold text-cyan-300 ml-1.5 font-mono">
                    {runSpeed <= 20 ? 'Max (20ms)' : `${runSpeed}ms`}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="800"
                  step="10"
                  value={820 - runSpeed}
                  onChange={(e) => onSpeedChange(820 - Number(e.target.value))}
                  className="w-20 sm:w-24 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
              <div className="hidden md:flex items-center space-x-1 text-[9px]">
                <button
                  onClick={() => onSpeedChange(500)}
                  className={`px-1 py-0.5 rounded font-mono border ${runSpeed === 500 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'bg-slate-800 text-slate-400 border-transparent hover:text-white'}`}
                >
                  Slow
                </button>
                <button
                  onClick={() => onSpeedChange(200)}
                  className={`px-1 py-0.5 rounded font-mono border ${runSpeed === 200 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'bg-slate-800 text-slate-400 border-transparent hover:text-white'}`}
                >
                  1x
                </button>
                <button
                  onClick={() => onSpeedChange(50)}
                  className={`px-1 py-0.5 rounded font-mono border ${runSpeed === 50 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'bg-slate-800 text-slate-400 border-transparent hover:text-white'}`}
                >
                  Fast
                </button>
              </div>
            </div>
          )}

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Wire Values Toggle */}
          <button
            onClick={() => setShowValuesOnWires(!showValuesOnWires)}
            className={`px-2.5 py-1.5 rounded border transition-all flex items-center space-x-1.5 text-[11px] ${
              showValuesOnWires
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            {showValuesOnWires ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showValuesOnWires ? 'Values: ON' : 'Values: OFF'}</span>
          </button>
        </div>
      </div>

      {/* Instruction Type Badge & Hint */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 bg-[#0a0f19] px-3 py-1.5 rounded-lg border border-white/5">
        <div className="flex items-center space-x-2">
          <span>Instruction @ PC[{pcVal}]:</span>
          <span className="text-cyan-300 font-bold">{instrFmt.hex}</span>
          <span>({isCInstr ? <span className="text-amber-400 font-bold">C-Instruction</span> : <span className="text-cyan-400 font-bold">A-Instruction</span>})</span>
        </div>
        <div className="text-slate-400 flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click any block, wire, or control bubble in diagram for details</span>
        </div>
      </div>

      {/* SVG Diagram Canvas - Wide 1240 x 560 viewBox prevents label truncation */}
      <div className="w-full overflow-x-auto flex justify-start sm:justify-center touch-pan-x">
        <svg viewBox="0 0 1240 560" className="w-full min-w-[900px] shrink-0 h-auto select-none bg-[#090e17] rounded-xl border border-white/5 p-2">
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
            <marker id="arr-dark" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
            <g id="slash">
              <line x1="-4" y1="4" x2="4" y2="-4" stroke="#94a3b8" strokeWidth="1.5" />
            </g>
          </defs>

          {/* ================= CPU CHIP ENCLOSURE BOX ================= */}
          <g>
            {/* Main CPU Box Background & Frame */}
            <rect
              x="150"
              y="18"
              width="820"
              height="524"
              rx="16"
              fill="#0b1322"
              fillOpacity="0.75"
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* Inner subtle accent border */}
            <rect
              x="154"
              y="22"
              width="812"
              height="516"
              rx="12"
              fill="none"
              stroke="rgba(56, 189, 248, 0.2)"
              strokeWidth="1"
            />

            {/* Top CPU Title Badge */}
            <rect x="480" y="6" width="160" height="24" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
            <text x="560" y="22" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" className="font-mono">
              HACK CPU CHIP
            </text>
          </g>

          {/* ================= DATA BUSES & CONNECTIONS ================= */}

          {/* Top Feedback Bus (ALU Out -> Top -> D-Reg & Mux 1) */}
          <g className={getHighlightClass()} onClick={() => toggleElement('dataOutBus')}>
            <path
              d="M 870 200 L 870 40 L 210 40 L 210 220 L 240 220"
              fill="none"
              markerEnd="url(#arr)"
              {...getShapeProps('dataOutBus', isCInstr ? '#38bdf8' : '#334155', 3)}
            />
            <path
              d="M 270 40 L 270 155 L 360 155"
              fill="none"
              markerEnd="url(#arr)"
              {...getShapeProps('dataOutBus', isCInstr && loadD ? '#38bdf8' : '#334155', 3)}
            />
          </g>

          {/* Instr Bus */}
          <g className={getHighlightClass()} onClick={() => toggleElement('instrBus')}>
            <path d="M 115 260 L 240 260" fill="none" markerEnd="url(#arr)" {...getShapeProps('instrBus', '#38bdf8', 3)} />
            <path d="M 170 260 L 170 360 L 190 360" fill="none" markerEnd="url(#arr)" {...getShapeProps('instrBus', '#38bdf8', 2)} />
          </g>

          {/* Decode to Control Bubble */}
          <path d="M 260 360 L 275 360" fill="none" stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arr)" />

          {/* Data In Bus */}
          <g className={getHighlightClass()} onClick={() => toggleElement('dataInBus')}>
            <path
              d="M 115 440 L 530 440 L 530 290 L 560 290"
              fill="none"
              markerEnd="url(#arr)"
              {...getShapeProps('dataInBus', '#c084fc', 3, '#c084fc', 'rgba(192,132,252,0.9)')}
            />
          </g>

          {/* Reset Bus */}
          <g className={getHighlightClass()} onClick={() => toggleElement('resetInput')}>
            <path
              d="M 115 520 L 710 520 L 710 510"
              fill="none"
              markerEnd="url(#arr)"
              {...getShapeProps('resetInput', '#f43f5e', 2, '#f43f5e', 'rgba(244,63,94,0.9)')}
            />
          </g>

          {/* Mux 1 Out -> A Register In */}
          <path d="M 300 255 L 360 255" fill="none" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arr)" />

          {/* D Register Out -> ALU x Input */}
          <path d="M 480 155 L 700 155" fill="none" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arr)" />

          {/* A Register Out Branches */}
          <g className={getHighlightClass()} onClick={() => toggleElement('dataAddrBus')}>
            <path d="M 480 255 L 560 255" fill="none" markerEnd="url(#arr)" {...getShapeProps('dataAddrBus', '#38bdf8', 3)} />
            <path d="M 500 255 L 500 410 L 1050 410" fill="none" {...getShapeProps('dataAddrBus', '#a855f7', 2.5, '#c084fc', 'rgba(168,85,247,0.9)')} />
            <path d="M 500 410 L 500 485 L 700 485" fill="none" markerEnd="url(#arr)" {...getShapeProps('dataAddrBus', '#eab308', 2.5, '#facc15', 'rgba(250,204,21,0.9)')} />
          </g>

          {/* Mux 2 Out -> ALU y Input */}
          <path d="M 620 275 L 700 275" fill="none" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arr)" />

          {/* ALU Out -> Data Out Bus */}
          <g className={getHighlightClass()} onClick={() => toggleElement('dataOutBus')}>
            <path d="M 870 200 L 1050 200" fill="none" {...getShapeProps('dataOutBus', '#22d3ee', 3.5)} />
          </g>

          {/* Control -> Write Enable */}
          <g className={getHighlightClass()} onClick={() => toggleElement('writeEnable')}>
            <path d="M 945 330 L 1050 330" fill="none" {...getShapeProps('writeEnable', '#06b6d4', 2)} />
          </g>

          {/* PC Out -> Instruction Address Bus */}
          <g className={getHighlightClass()} onClick={() => toggleElement('pcAddrBus')}>
            <path d="M 820 485 L 1050 485" fill="none" {...getShapeProps('pcAddrBus', '#eab308', 2.5, '#facc15', 'rgba(250,204,21,0.9)')} />
          </g>

          {/* Control Lines to Blocks */}
          <path d="M 270 310 L 270 300" stroke="#06b6d4" strokeWidth="1.5" markerEnd="url(#arr)" />
          <path d="M 420 90 L 420 130" stroke="#06b6d4" strokeWidth="1.5" markerEnd="url(#arr)" />
          <path d="M 420 210 L 420 230" stroke="#06b6d4" strokeWidth="1.5" markerEnd="url(#arr)" />
          <path d="M 590 325 L 590 312" stroke="#06b6d4" strokeWidth="1.5" markerEnd="url(#arr)" />

          {/* ALU Top Control Arrows */}
          <g stroke="#06b6d4" strokeWidth="1.5" markerEnd="url(#arr)">
            <path d="M 740 70 L 740 115" />
            <path d="M 760 70 L 760 118" />
            <path d="M 780 70 L 780 121" />
            <path d="M 800 70 L 800 124" />
            <path d="M 820 70 L 820 127" />
            <path d="M 840 70 L 840 130" />
          </g>

          {/* ALU Bottom Flag Arrows */}
          <g stroke="#06b6d4" strokeWidth="1.5" markerEnd="url(#arr)">
            <path d="M 765 280 L 765 325" />
            <path d="M 805 274 L 805 325" />
          </g>

          {/* PC Top Control Arrows */}
          <g stroke="#eab308" strokeWidth="1.5" markerEnd="url(#arr)">
            <path d="M 730 375 L 730 460" />
            <path d="M 760 375 L 760 460" />
            <path d="M 790 375 L 790 460" />
          </g>

          {/* Junction Dots */}
          <circle cx="870" cy="200" r="4" fill="#22d3ee" />
          <circle cx="870" cy="40" r="4" fill="#38bdf8" />
          <circle cx="270" cy="40" r="4" fill="#38bdf8" />
          <circle cx="170" cy="260" r="4" fill="#38bdf8" />
          <circle cx="500" cy="255" r="4" fill="#38bdf8" />
          <circle cx="500" cy="410" r="4" fill="#a855f7" />

          {/* ================= BUS SLASHES & BIT WIDTH LABELS ================= */}
          <use href="#slash" x="500" y="40" />
          <text x="500" y="30" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold">16</text>

          <use href="#slash" x="190" y="260" />
          <text x="190" y="250" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold">16</text>

          <use href="#slash" x="330" y="255" />
          <text x="330" y="245" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold">16</text>

          <use href="#slash" x="590" y="155" />
          <text x="590" y="145" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold">16</text>

          <use href="#slash" x="650" y="275" />
          <text x="650" y="265" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold">16</text>

          <use href="#slash" x="200" y="440" />
          <text x="200" y="430" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold">16</text>

          <use href="#slash" x="200" y="520" />
          <text x="200" y="510" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold">1</text>

          <use href="#slash" x="930" y="200" />
          <text x="930" y="190" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold">16</text>

          <use href="#slash" x="930" y="410" />
          <text x="930" y="400" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold">15</text>

          <use href="#slash" x="930" y="485" />
          <text x="930" y="475" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-bold">15</text>

          {/* ================= HARDWARE MODULES (ALL CLICKABLE) ================= */}

          {/* Decode Box */}
          <g transform="translate(190, 342.5)" className={getHighlightClass()} onClick={() => toggleElement('decode')}>
            <rect width="70" height="35" rx="8" fill="#1e293b" {...getShapeProps('decode', '#38bdf8', 1.5)} />
            <text x="35" y="17.5" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-[11px] font-bold font-mono">
              Decode
            </text>
          </g>

          {/* First MUX */}
          <g transform="translate(240, 200)" className={getHighlightClass()} onClick={() => toggleElement('mux1')}>
            <polygon points="0,0 60,15 60,95 0,110" fill="#1e293b" {...getShapeProps('mux1', '#38bdf8', 1.5)} />
            <text x="30" y="55" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-xs font-bold font-mono">
              Mux
            </text>
            <text x="10" y="20" textAnchor="start" dominantBaseline="central" fill="#94a3b8" className="text-[10px] font-mono">a</text>
            <text x="10" y="60" textAnchor="start" dominantBaseline="central" fill="#94a3b8" className="text-[10px] font-mono">b</text>
            <text x="50" y="55" textAnchor="end" dominantBaseline="central" fill="#94a3b8" className="text-[9px] font-mono">out</text>
            <text x="30" y="95" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" className="text-[9px] font-mono">sel</text>
          </g>

          {/* D Register */}
          <g transform="translate(360, 130)" className={getHighlightClass()} onClick={() => toggleElement('dReg')}>
            <rect width="120" height="50" rx="4" fill="#0f172a" {...getShapeProps('dReg', '#38bdf8', 2)} />
            <text x="12" y="25" textAnchor="start" dominantBaseline="central" fill="#94a3b8" className="text-[10px] font-mono">in</text>
            <text x="60" y="25" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-sm font-bold font-mono">
              D Register
            </text>
            <text x="108" y="25" textAnchor="end" dominantBaseline="central" fill="#94a3b8" className="text-[10px] font-mono">out</text>
            <text x="60" y="10" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" className="text-[9px] font-mono">load</text>
            <polygon points="55,49 65,49 60,42" fill="#38bdf8" />
          </g>

          {/* A Register */}
          <g transform="translate(360, 230)" className={getHighlightClass()} onClick={() => toggleElement('aReg')}>
            <rect width="120" height="50" rx="4" fill="#0f172a" {...getShapeProps('aReg', '#38bdf8', 2)} />
            <text x="12" y="25" textAnchor="start" dominantBaseline="central" fill="#94a3b8" className="text-[10px] font-mono">in</text>
            <text x="60" y="25" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-sm font-bold font-mono">
              A Register
            </text>
            <text x="108" y="25" textAnchor="end" dominantBaseline="central" fill="#94a3b8" className="text-[10px] font-mono">out</text>
            <text x="60" y="10" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" className="text-[9px] font-mono">load</text>
            <polygon points="55,49 65,49 60,42" fill="#38bdf8" />
          </g>

          {/* Second MUX */}
          <g transform="translate(560, 230)" className={getHighlightClass()} onClick={() => toggleElement('mux2')}>
            <polygon points="0,0 60,15 60,75 0,90" fill="#1e293b" {...getShapeProps('mux2', '#38bdf8', 1.5)} />
            <text x="30" y="45" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-xs font-bold font-mono">
              Mux
            </text>
            <text x="10" y="25" textAnchor="start" dominantBaseline="central" fill="#94a3b8" className="text-[10px] font-mono">a</text>
            <text x="10" y="60" textAnchor="start" dominantBaseline="central" fill="#94a3b8" className="text-[10px] font-mono">b</text>
            <text x="50" y="45" textAnchor="end" dominantBaseline="central" fill="#94a3b8" className="text-[9px] font-mono">out</text>
            <text x="30" y="75" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" className="text-[9px] font-mono">sel</text>
          </g>

          {/* ALU Trapezoid */}
          <g transform="translate(700, 110)" className={getHighlightClass()} onClick={() => toggleElement('alu')}>
            <polygon points="0,0 170,25 170,155 0,180" fill="#1e293b" {...getShapeProps('alu', '#22d3ee', 2.5)} />
            <text x="85" y="60" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-xs font-bold font-mono">
              Arithmetic
            </text>
            <text x="85" y="78" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-xs font-bold font-mono">
              Logic Unit
            </text>
            <text x="85" y="96" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-xs font-bold font-mono">
              (ALU)
            </text>
            <text x="135" y="90" textAnchor="middle" dominantBaseline="central" fill="#38bdf8" className="text-[11px] font-mono">
              f(x, y)
            </text>

            <text x="20" y="20" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-mono">zx</text>
            <text x="45" y="22" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-mono">nx</text>
            <text x="70" y="24" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-mono">zy</text>
            <text x="95" y="26" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-mono">ny</text>
            <text x="120" y="28" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-mono">f</text>
            <text x="145" y="30" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-mono">no</text>

            <text x="15" y="45" textAnchor="start" dominantBaseline="central" fill="#ffffff" className="text-xs font-bold font-mono">x</text>
            <text x="15" y="165" textAnchor="start" dominantBaseline="central" fill="#ffffff" className="text-xs font-bold font-mono">y</text>

            <text x="65" y="160" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-mono">zr</text>
            <text x="105" y="155" textAnchor="middle" fill="#94a3b8" className="text-[9px] font-mono">ng</text>
          </g>

          {/* PC Program Counter */}
          <g transform="translate(700, 460)" className={getHighlightClass()} onClick={() => toggleElement('pc')}>
            <rect width="120" height="50" rx="4" fill="#0f172a" {...getShapeProps('pc', '#eab308', 2, '#facc15', 'rgba(250,204,21,0.9)')} />
            <text x="12" y="25" textAnchor="start" dominantBaseline="central" fill="#94a3b8" className="text-[10px] font-mono">in</text>
            <text x="60" y="25" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-sm font-bold font-mono">
              PC
            </text>
            <text x="108" y="25" textAnchor="end" dominantBaseline="central" fill="#94a3b8" className="text-[10px] font-mono">out</text>
            <text x="30" y="10" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" className="text-[8px] font-mono">reset</text>
            <text x="60" y="10" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" className="text-[8px] font-mono">load</text>
            <text x="90" y="10" textAnchor="middle" dominantBaseline="central" fill="#94a3b8" className="text-[8px] font-mono">inc</text>
            <polygon points="55,49 65,49 60,42" fill="#eab308" />
          </g>

          {/* ================= COMPACT CONTROL BUBBLES (SMALL PILLS) ================= */}

          {/* Oval 1: Decode Control */}
          <g transform="translate(270, 360)" className={getHighlightClass()} onClick={() => toggleElement('ctrl_decode')}>
            <ellipse rx="16" ry="10" fill="#0284c7" {...getShapeProps('ctrl_decode', '#ffffff', 1.5)} />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-[9px] font-bold font-mono">c</text>
          </g>

          {/* Oval 2: Mux 1 Control */}
          <g transform="translate(270, 318)" className={getHighlightClass()} onClick={() => toggleElement('ctrl_mux1')}>
            <ellipse rx="16" ry="10" fill="#0284c7" {...getShapeProps('ctrl_mux1', '#ffffff', 1.5)} />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-[9px] font-bold font-mono">c</text>
          </g>

          {/* Oval 3: D Reg Control */}
          <g transform="translate(420, 80)" className={getHighlightClass()} onClick={() => toggleElement('ctrl_dReg')}>
            <ellipse rx="16" ry="10" fill="#0284c7" {...getShapeProps('ctrl_dReg', '#ffffff', 1.5)} />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-[9px] font-bold font-mono">c</text>
          </g>

          {/* Oval 4: A Reg Control */}
          <g transform="translate(420, 200)" className={getHighlightClass()} onClick={() => toggleElement('ctrl_aReg')}>
            <ellipse rx="16" ry="10" fill="#0284c7" {...getShapeProps('ctrl_aReg', '#ffffff', 1.5)} />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-[9px] font-bold font-mono">c</text>
          </g>

          {/* Oval 5: Mux 2 Control */}
          <g transform="translate(590, 335)" className={getHighlightClass()} onClick={() => toggleElement('ctrl_mux2')}>
            <ellipse rx="16" ry="10" fill="#0284c7" {...getShapeProps('ctrl_mux2', '#ffffff', 1.5)} />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-[9px] font-bold font-mono">c</text>
          </g>

          {/* Oval 6: ALU Top Control */}
          <g transform="translate(785, 58)" className={getHighlightClass()} onClick={() => toggleElement('ctrl_alu')}>
            <ellipse rx="22" ry="10" fill="#0284c7" {...getShapeProps('ctrl_alu', '#ffffff', 1.5)} />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-[9px] font-bold font-mono">ctrl</text>
          </g>

          {/* Oval 7: ALU Bottom Control Flags */}
          <g transform="translate(785, 335)" className={getHighlightClass()} onClick={() => toggleElement('ctrl_aluFlags')}>
            <ellipse rx="16" ry="10" fill="#0284c7" {...getShapeProps('ctrl_aluFlags', '#ffffff', 1.5)} />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-[9px] font-bold font-mono">c</text>
          </g>

          {/* Oval 8: Write Enable Control */}
          <g transform="translate(930, 330)" className={getHighlightClass()} onClick={() => toggleElement('ctrl_writeM')}>
            <ellipse rx="16" ry="10" fill="#0284c7" {...getShapeProps('ctrl_writeM', '#ffffff', 1.5)} />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#ffffff" className="text-[9px] font-bold font-mono">c</text>
          </g>

          {/* Oval 9: PC Control */}
          <g transform="translate(760, 365)" className={getHighlightClass()} onClick={() => toggleElement('ctrl_pc')}>
            <ellipse rx="22" ry="10" fill="#ca8a04" {...getShapeProps('ctrl_pc', '#ffffff', 1.5, '#facc15', 'rgba(250,204,21,0.9)')} />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#000000" className="text-[9px] font-bold font-mono">ctrl</text>
          </g>

          {/* ================= TERMINAL PINS & LABELS (FULL VISIBILITY) ================= */}

          {/* Left Terminals */}
          <g transform="translate(115, 260)" className={getHighlightClass()} onClick={() => toggleElement('instrBus')}>
            <circle cx="0" cy="0" r="5" fill="#38bdf8" {...getShapeProps('instrBus', '#ffffff', 1.5)} />
            <text x="-12" y="0" textAnchor="end" dominantBaseline="central" fill="#ffffff" className="text-xs font-bold font-mono">
              Instr Bus
            </text>
          </g>

          <g transform="translate(115, 440)" className={getHighlightClass()} onClick={() => toggleElement('dataInBus')}>
            <circle cx="0" cy="0" r="5" fill="#c084fc" {...getShapeProps('dataInBus', '#ffffff', 1.5, '#c084fc', 'rgba(192,132,252,0.9)')} />
            <text x="-12" y="0" textAnchor="end" dominantBaseline="central" fill="#c084fc" className="text-xs font-bold font-mono">
              Data In Bus
            </text>
          </g>

          <g transform="translate(115, 520)" className={getHighlightClass()} onClick={() => toggleElement('resetInput')}>
            <circle cx="0" cy="0" r="5" fill="#f43f5e" {...getShapeProps('resetInput', '#ffffff', 1.5, '#f43f5e', 'rgba(244,63,94,0.9)')} />
            <text x="-12" y="0" textAnchor="end" dominantBaseline="central" fill="#f43f5e" className="text-xs font-bold font-mono">
              Reset
            </text>
          </g>

          {/* Right Terminals */}
          <g transform="translate(1050, 200)" className={getHighlightClass()} onClick={() => toggleElement('dataOutBus')}>
            <circle cx="0" cy="0" r="5" fill="#22d3ee" {...getShapeProps('dataOutBus', '#ffffff', 1.5)} />
            <text x="14" y="0" textAnchor="start" dominantBaseline="central" fill="#22d3ee" className="text-xs font-bold font-mono">
              Data Out Bus
            </text>
          </g>

          <g transform="translate(1050, 330)" className={getHighlightClass()} onClick={() => toggleElement('writeEnable')}>
            <circle cx="0" cy="0" r="5" fill="#06b6d4" {...getShapeProps('writeEnable', '#ffffff', 1.5)} />
            <text x="14" y="0" textAnchor="start" dominantBaseline="central" fill="#06b6d4" className="text-xs font-bold font-mono">
              Write Enable
            </text>
          </g>

          {/* Data Address Bus Badge relocated to x=880 to avoid any overlap with PC Control at x=760 */}
          <g transform="translate(1050, 410)" className={getHighlightClass()} onClick={() => toggleElement('dataAddrBus')}>
            <circle cx="0" cy="0" r="5" fill="#a855f7" {...getShapeProps('dataAddrBus', '#ffffff', 1.5, '#c084fc', 'rgba(168,85,247,0.9)')} />
            <text x="14" y="0" textAnchor="start" dominantBaseline="central" fill="#a855f7" className="text-xs font-bold font-mono">
              Data Address Bus
            </text>
          </g>

          <g transform="translate(1050, 485)" className={getHighlightClass()} onClick={() => toggleElement('pcAddrBus')}>
            <circle cx="0" cy="0" r="5" fill="#eab308" {...getShapeProps('pcAddrBus', '#ffffff', 1.5, '#facc15', 'rgba(250,204,21,0.9)')} />
            <text x="14" y="0" textAnchor="start" dominantBaseline="central" fill="#eab308" className="text-xs font-bold font-mono">
              Instruction Address Bus
            </text>
          </g>

          {/* ================= CPU CHIP BOUNDARY WIRE NAME BADGES (TOP OF WIRES) ================= */}

          {/* Input Pin Badges (Left Wall x=150) */}
          <g transform="translate(150, 260)" className="font-mono text-[9px] pointer-events-none">
            <rect x="-14" y="-9" width="28" height="18" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#38bdf8" fontWeight="bold">in</text>
          </g>

          <g transform="translate(150, 440)" className="font-mono text-[9px] pointer-events-none">
            <rect x="-16" y="-9" width="32" height="18" rx="4" fill="#0f172a" stroke="#c084fc" strokeWidth="1.5" />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#c084fc" fontWeight="bold">inM</text>
          </g>

          <g transform="translate(150, 520)" className="font-mono text-[9px] pointer-events-none">
            <rect x="-14" y="-9" width="28" height="18" rx="4" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.5" />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#f43f5e" fontWeight="bold">rst</text>
          </g>

          {/* Output Pin Badges (Right Wall x=970) */}
          <g transform="translate(970, 200)" className="font-mono text-[9px] pointer-events-none">
            <rect x="-18" y="-9" width="36" height="18" rx="4" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#22d3ee" fontWeight="bold">outM</text>
          </g>

          <g transform="translate(970, 330)" className="font-mono text-[9px] pointer-events-none">
            <rect x="-22" y="-9" width="44" height="18" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#06b6d4" fontWeight="bold">writeM</text>
          </g>

          <g transform="translate(970, 410)" className="font-mono text-[9px] pointer-events-none">
            <rect x="-28" y="-9" width="56" height="18" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#a855f7" fontWeight="bold">addressM</text>
          </g>

          <g transform="translate(970, 485)" className="font-mono text-[9px] pointer-events-none">
            <rect x="-14" y="-9" width="28" height="18" rx="4" fill="#0f172a" stroke="#eab308" strokeWidth="1.5" />
            <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#eab308" fontWeight="bold">pc</text>
          </g>

          {/* ================= DYNAMIC LIVE VALUE BADGES ON WIRES ================= */}
          {showValuesOnWires && (
            <>
              {/* Instr Bus value badge */}
              <g transform="translate(180, 230)">
                <rect x="-30" y="-9" width="60" height="18" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#38bdf8" className="text-[10px] font-bold font-mono">
                  {instrFmt.hex}
                </text>
              </g>

              {/* Data In Bus value badge */}
              <g transform="translate(310, 440)">
                <rect x="-25" y="-9" width="50" height="18" rx="4" fill="#0f172a" stroke="#c084fc" strokeWidth="1" />
                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#c084fc" className="text-[10px] font-bold font-mono">
                  {inMVal}
                </text>
              </g>

              {/* D Reg out value badge */}
              <g transform="translate(590, 155)">
                <rect x="-25" y="-9" width="50" height="18" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#38bdf8" className="text-[10px] font-bold font-mono">
                  {dRegVal}
                </text>
              </g>

              {/* A Reg out value badge */}
              <g transform="translate(520, 255)">
                <rect x="-20" y="-9" width="40" height="18" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#38bdf8" className="text-[10px] font-bold font-mono">
                  {aRegVal}
                </text>
              </g>

              {/* Mux 2 Out badge */}
              <g transform="translate(660, 275)">
                <rect x="-20" y="-9" width="40" height="18" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#38bdf8" className="text-[10px] font-bold font-mono">
                  {amVal}
                </text>
              </g>

              {/* Data Out Bus value badge */}
              <g transform="translate(930, 200)">
                <rect x="-20" y="-9" width="40" height="18" rx="4" fill="#0f172a" stroke="#22d3ee" strokeWidth="1" />
                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#22d3ee" className="text-[10px] font-bold font-mono">
                  {aluOutVal}
                </text>
              </g>

              {/* Data Address Bus badge - positioned at x=880 on the purple line to avoid PC Control at x=760 */}
              <g transform="translate(880, 410)">
                <rect x="-25" y="-9" width="50" height="18" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="1" />
                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#a855f7" className="text-[10px] font-bold font-mono">
                  @{addressMVal}
                </text>
              </g>

              {/* PC out badge */}
              <g transform="translate(890, 485)">
                <rect x="-25" y="-9" width="50" height="18" rx="4" fill="#0f172a" stroke="#eab308" strokeWidth="1" />
                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fill="#eab308" className="text-[10px] font-bold font-mono">
                  @{pcVal}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>

      {/* Interactive Detail Explanation Card on Click */}
      {selectedElement && (
        <div className="mt-4 p-4 bg-[#0a101d] rounded-xl border border-cyan-500/40 text-xs font-mono space-y-2 shadow-2xl relative animate-in fade-in duration-150">
          <button
            onClick={() => setSelectedElement(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-all"
            title="Close explanation"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Module Explanations */}
          {selectedElement === 'aReg' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase flex items-center space-x-2">
                <span>A Register (Address / Data Register)</span>
              </h4>
              <p className="text-slate-300 mt-1 leading-relaxed font-sans">
                A 16-bit multi-purpose register that holds either a memory address pointer or a 15-bit constant value. Its output feeds directly into the ALU y-input multiplexer, the RAM Data Address Bus, and the Program Counter input.
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-cyan-400 text-[11px] bg-black/40 p-2 rounded border border-white/5 font-mono">
                <div>Stored Value: <span className="text-white font-bold">{aRegVal}</span> (0x{aRegVal.toString(16).padStart(4, '0').toUpperCase()})</div>
                <div>Load Signal: <span className="text-white font-bold">{loadA ? '1 (LOADING)' : '0 (HOLD)'}</span></div>
              </div>
            </div>
          )}

          {selectedElement === 'dReg' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase flex items-center space-x-2">
                <span>D Register (Data Register)</span>
              </h4>
              <p className="text-slate-300 mt-1 leading-relaxed font-sans">
                A 16-bit register dedicated strictly to storing intermediate data computation values. Feeds directly into input 'x' of the Arithmetic Logic Unit.
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-cyan-400 text-[11px] bg-black/40 p-2 rounded border border-white/5 font-mono">
                <div>Stored Value: <span className="text-white font-bold">{dRegVal}</span> (0x{dRegVal.toString(16).padStart(4, '0').toUpperCase()})</div>
                <div>Load Signal: <span className="text-white font-bold">{loadD ? '1 (LOADING)' : '0 (HOLD)'}</span></div>
              </div>
            </div>
          )}

          {selectedElement === 'alu' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase flex items-center space-x-2">
                <span>Arithmetic Logic Unit (ALU)</span>
              </h4>
              <p className="text-slate-300 mt-1 leading-relaxed font-sans">
                The central calculation engine of the Hack CPU. Computes arithmetic functions (addition, subtraction, increments) and logical functions (AND, OR, bitwise negation) on 16-bit inputs x and y based on 6 control bits (zx, nx, zy, ny, f, no).
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-cyan-400 text-[11px] bg-black/40 p-2 rounded border border-white/5 font-mono">
                <div>Input x (D): <span className="text-white font-bold">{dRegVal}</span></div>
                <div>Input y (A/M): <span className="text-white font-bold">{amVal}</span></div>
                <div>Output outM: <span className="text-cyan-300 font-bold">{aluOutVal}</span></div>
                <div>Control Code: <span className="text-amber-300 font-bold">0b{cBits.toString(2).padStart(6, '0')}</span></div>
              </div>
            </div>
          )}

          {selectedElement === 'pc' && (
            <div>
              <h4 className="text-sm font-bold text-amber-300 uppercase flex items-center space-x-2">
                <span>Program Counter (PC)</span>
              </h4>
              <p className="text-slate-300 mt-1 leading-relaxed font-sans">
                A 16-bit counter tracking the ROM address of the current instruction to be executed. Advances sequentially (PC+1) or jumps to the address stored in the A Register when a conditional or unconditional branch condition is met.
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-amber-400 text-[11px] bg-black/40 p-2 rounded border border-white/5 font-mono">
                <div>Current PC Address: <span className="text-white font-bold">@{pcVal}</span></div>
                <div>Next Action: <span className="text-amber-300 font-bold">{loadPC ? 'LOAD (Branch to A)' : 'INCREMENT (PC + 1)'}</span></div>
              </div>
            </div>
          )}

          {selectedElement === 'decode' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">Instruction Decoder Unit</h4>
              <p className="text-slate-300 mt-1 leading-relaxed font-sans">
                Parses the 16-bit instruction word from ROM. MSB bit 15 selects instruction type: 0 = A-Instruction (loads constant into A), 1 = C-Instruction (specifies computation, destination, and jump).
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-cyan-400 text-[11px] bg-black/40 p-2 rounded border border-white/5 font-mono">
                <div>Raw Instruction: <span className="text-white font-bold">{instrFmt.bin}</span></div>
                <div>Instruction Type: <span className="text-amber-300 font-bold">{isCInstr ? 'C-Instruction' : 'A-Instruction'}</span></div>
              </div>
            </div>
          )}

          {selectedElement === 'mux1' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">Mux 1 (A-Register Input Multiplexer)</h4>
              <p className="text-slate-300 mt-1 leading-relaxed font-sans">
                2-to-1 Multiplexer selecting the source for the A Register. Passes the 15-bit constant from an A-instruction (b), or the computed ALU result from a C-instruction (a).
              </p>
              <div className="mt-2 text-cyan-300 text-[11px] bg-black/40 p-2 rounded border border-white/5 font-mono">
                Active Selection: <span className="text-white font-bold">{mux1Sel}</span>
              </div>
            </div>
          )}

          {selectedElement === 'mux2' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">Mux 2 (ALU Operand Y Multiplexer)</h4>
              <p className="text-slate-300 mt-1 leading-relaxed font-sans">
                Selects whether the ALU operates on the A Register value directly (when instruction 'a'-bit = 0) or the RAM memory value at address RAM[A] (when 'a'-bit = 1).
              </p>
              <div className="mt-2 text-cyan-300 text-[11px] bg-black/40 p-2 rounded border border-white/5 font-mono">
                'a'-bit: <span className="text-white font-bold">{aBit}</span> ({mux2Sel}) → Selected Operand Value = <span className="text-cyan-300 font-bold">{amVal}</span>
              </div>
            </div>
          )}

          {/* Control bubble explanations */}
          {selectedElement === 'ctrl_decode' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">Decode Control Bubble</h4>
              <p className="text-slate-300 mt-1 font-sans">
                Extracts execution control signals from instruction bits and dispatches load/select signals across the CPU architecture.
              </p>
            </div>
          )}

          {selectedElement === 'ctrl_mux1' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">Mux 1 Select Control Bubble</h4>
              <p className="text-slate-300 mt-1 font-sans">
                Asserts selection line 'sel'. Set to 0 for C-instructions (selecting ALU out) and 1 for A-instructions (selecting instruction constant).
              </p>
            </div>
          )}

          {selectedElement === 'ctrl_dReg' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">D Register Load Control Bubble</h4>
              <p className="text-slate-300 mt-1 font-sans">
                Controls D-Register load enable bit (destination bit d2 in C-instruction). Active when destination includes 'D'.
              </p>
            </div>
          )}

          {selectedElement === 'ctrl_aReg' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">A Register Load Control Bubble</h4>
              <p className="text-slate-300 mt-1 font-sans">
                Controls A-Register load enable bit. High for all A-instructions or C-instructions with destination bit d1=1 ('A').
              </p>
            </div>
          )}

          {selectedElement === 'ctrl_mux2' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">Mux 2 Select Control Bubble (a-bit)</h4>
              <p className="text-slate-300 mt-1 font-sans">
                Driven by instruction bit 12 ('a'-bit). Chooses between A Register (a=0) and memory operand M (a=1).
              </p>
            </div>
          )}

          {selectedElement === 'ctrl_alu' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">ALU Control Bits (zx, nx, zy, ny, f, no)</h4>
              <p className="text-slate-300 mt-1 font-sans">
                6 control lines directly derived from computation bits c1-c6 in C-instructions. Defines exact ALU operation.
              </p>
            </div>
          )}

          {selectedElement === 'ctrl_aluFlags' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">ALU Output Flags (zr, ng)</h4>
              <p className="text-slate-300 mt-1 font-sans">
                zr = 1 if ALU output is zero. ng = 1 if output is negative. Used by the PC control logic for branching decisions.
              </p>
            </div>
          )}

          {selectedElement === 'ctrl_writeM' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">Memory Write Enable Control (writeM)</h4>
              <p className="text-slate-300 mt-1 font-sans">
                Asserted when a C-instruction destination includes 'M' (destination bit d3=1). Prompts RAM[addressM] to write outM on clock cycle.
              </p>
            </div>
          )}

          {selectedElement === 'ctrl_pc' && (
            <div>
              <h4 className="text-sm font-bold text-amber-300 uppercase">PC Control Logic (reset, load, inc)</h4>
              <p className="text-slate-300 mt-1 font-sans">
                Evaluates jump bits (j1, j2, j3) against ALU flags (zr, ng). Asserts 'load' to jump if condition holds, else asserts 'inc'.
              </p>
            </div>
          )}

          {/* Busses explanations */}
          {selectedElement === 'instrBus' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">Instruction Bus (16-bit)</h4>
              <p className="text-slate-300 mt-1 font-sans">
                Delivers the 16-bit instruction word fetched from ROM at memory index PC to the Instruction Decoder and Mux 1.
              </p>
            </div>
          )}

          {selectedElement === 'dataInBus' && (
            <div>
              <h4 className="text-sm font-bold text-purple-300 uppercase">Data In Bus (16-bit / inM)</h4>
              <p className="text-slate-300 mt-1 font-sans">
                Carries data read from RAM at memory location RAM[addressM] into Mux 2 as potential operand y for the ALU.
              </p>
            </div>
          )}

          {selectedElement === 'resetInput' && (
            <div>
              <h4 className="text-sm font-bold text-rose-400 uppercase">Reset Input Line (1-bit)</h4>
              <p className="text-slate-300 mt-1 font-sans">
                When asserted high, forces the Program Counter back to 0 to restart program execution from ROM[0].
              </p>
            </div>
          )}

          {selectedElement === 'dataOutBus' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">Data Out Bus (16-bit / outM)</h4>
              <p className="text-slate-300 mt-1 font-sans">
                Carries the computed 16-bit result from the ALU to RAM and back into the CPU registers.
              </p>
            </div>
          )}

          {selectedElement === 'writeEnable' && (
            <div>
              <h4 className="text-sm font-bold text-cyan-300 uppercase">Write Enable Signal (writeM)</h4>
              <p className="text-slate-300 mt-1 font-sans">
                1-bit memory write control line. When high, RAM updates the value at RAM[addressM] with outM.
              </p>
            </div>
          )}

          {selectedElement === 'dataAddrBus' && (
            <div>
              <h4 className="text-sm font-bold text-purple-300 uppercase">Data Address Bus (15-bit / addressM)</h4>
              <p className="text-slate-300 mt-1 font-sans">
                Outputs the 15-bit address stored in the A Register to select the target RAM memory cell for reading or writing.
              </p>
            </div>
          )}

          {selectedElement === 'pcAddrBus' && (
            <div>
              <h4 className="text-sm font-bold text-amber-300 uppercase">Instruction Address Bus (15-bit / PC)</h4>
              <p className="text-slate-300 mt-1 font-sans">
                Outputs the 15-bit address stored in the PC to select the next instruction from ROM.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
