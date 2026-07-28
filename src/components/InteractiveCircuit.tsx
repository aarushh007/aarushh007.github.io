import React from 'react';
import { ChipData } from '../types';
import { formatValue } from '../utils/logicSimulator';
import { RefreshCw } from 'lucide-react';
import { SubChipBox, WirePath } from './ChipDiagrams';

interface InteractiveCircuitProps {
  chip: ChipData;
  inputs: Record<string, number | number[] | boolean>;
  outputs: Record<string, number | number[] | boolean>;
  onToggleInputPin: (pinName: string, currentVal: number) => void;
  onSelectSubChip?: (subChipId: string) => void;
  onClockPulse?: () => void;
  onToggleBit?: (pinName: string, bitIdx: number) => void;
}

export const InteractiveCircuit: React.FC<InteractiveCircuitProps> = ({
  chip,
  inputs,
  outputs,
  onToggleInputPin,
  onClockPulse,
  onToggleBit,
}) => {
  const isBitwise16Gate = ['Not16', 'And16', 'Or16'].includes(chip.id);

  // Helper for wire color based on active state
  const getSignalColor = (val: number | boolean | undefined) => {
    return Number(val) ? '#38bdf8' : '#334155';
  };

  // Helper to get formatted decimal text for a pin
  const getDecimalDisplay = (pinName: string, busWidth: number, val: any) => {
    if (busWidth === 1) {
      return Number(val) ? '1' : '0';
    }
    if (pinName === 'sel' || pinName.startsWith('sel')) {
      const selNum = Number(val) || 0;
      const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const label = labels[selNum] ? ` (${labels[selNum]})` : '';
      const bin = selNum.toString(2).padStart(busWidth, '0');
      return `${selNum} [${bin}]${label}`;
    }
    if (pinName === 'address' || pinName.startsWith('address')) {
      const fmt = formatValue(Number(val), busWidth);
      return `${fmt.uint}`;
    }
    const fmt = formatValue(Number(val), busWidth);
    return `Dec: ${fmt.signed}`;
  };

  // Port positioning math to guarantee 100% wire alignment
  const getInputY = (idx: number, total: number) => {
    if (chip.id === 'Computer') {
      return 220;
    }
    if (chip.id === 'PC') {
      const yMap = [90, 170, 250, 325];
      return yMap[idx] ?? (60 + idx * 70);
    }
    if (chip.id === 'Memory') {
      const yMap = [130, 50, 270];
      return yMap[idx] ?? (60 + idx * 70);
    }
    if (chip.id === 'Bit') {
      if (idx === 0) return 130; // 'in'
      if (idx === 1) return 70;  // 'load'
    }
    if (chip.id === 'DMux4Way') {
      return 160;
    }
    if (chip.id === 'DMux8Way') {
      return 180;
    }
    if (chip.id === 'Mux4Way16') {
      const yMap = [80, 130, 210, 260];
      return yMap[idx] ?? (80 + idx * 50);
    }
    if (chip.id === 'Mux8Way16') {
      const yMap = [72, 98, 124, 150, 192, 218, 244, 270];
      return yMap[idx] ?? (72 + idx * 26);
    }
    if (total === 1) return 190;
    if (total === 2) return 120 + idx * 140; // 120, 260
    if (total === 3) return 90 + idx * 100; // 90, 190, 290
    return 60 + idx * (260 / Math.max(1, total - 1));
  };

  const getOutputY = (idx: number, total: number) => {
    if (chip.id === 'PC') {
      return 160;
    }
    if (chip.id === 'Memory') {
      return 195;
    }
    if (chip.id === 'Bit') {
      return 150; // 'out'
    }
    if (chip.id === 'Mux4Way16' || chip.id === 'Mux8Way16') {
      return 170;
    }
    if (chip.id === 'DMux4Way') {
      const yMap = [60, 140, 220, 300];
      return yMap[idx] ?? 60;
    }
    if (chip.id === 'DMux8Way') {
      const yMap = [52, 90, 128, 166, 204, 242, 280, 318];
      return yMap[idx] ?? 52;
    }
    if (total === 1) return 190;
    if (total === 2) return 120 + idx * 140; // 120, 260
    if (total === 3) return 90 + idx * 100; // 90, 190, 290
    return 60 + idx * (260 / Math.max(1, total - 1));
  };

  // --------------------------------------------------------------------------
  // RENDERER 1: Bitwise 16-bit Interactive Diagram (Not16, And16, Or16)
  // --------------------------------------------------------------------------
  if (isBitwise16Gate) {
    const inputA = Number(inputs.a ?? inputs.in ?? 0) & 0xffff;
    const inputB = Number(inputs.b ?? 0) & 0xffff;
    const outVal = Number(outputs.out ?? 0) & 0xffff;

    return (
      <div className="bg-[#05070a] rounded-xl border border-white/10 p-5 relative shadow-2xl overflow-hidden bg-blueprint space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              16-Bit Parallel Internal Logic Diagram (<span className="text-cyan-400">{chip.name}</span>)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
            Click any bit in the input line below to toggle [1/0]
          </span>
        </div>

        {/* 16-bit Interactive Bit Grid per Input */}
        <div className="space-y-4">
          {chip.inputs.map((pin) => {
            const num = Number(inputs[pin.name] ?? 0) & 0xffff;
            return (
              <div key={pin.name} className="bg-[#0a0f18] rounded-xl p-3.5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-200">
                    Input 16-Bit Bus <span className="text-cyan-400">{pin.name}</span> [15..0]
                  </span>
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    Decimal: {formatValue(num, 16).signed}
                  </span>
                </div>

                <div className="grid grid-cols-[repeat(16,minmax(28px,1fr))] gap-1 overflow-x-auto py-1 min-w-0">
                  {Array.from({ length: 16 }, (_, i) => 15 - i).map((bitIdx) => {
                    const bitVal = (num >> bitIdx) & 1;
                    return (
                      <button
                        key={bitIdx}
                        onClick={() => onToggleBit?.(pin.name, bitIdx)}
                        className={`flex flex-col items-center justify-center p-1.5 rounded text-xs font-mono font-bold transition-all border ${
                          bitVal
                            ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                            : 'bg-[#0f172a] text-slate-500 border-white/10 hover:border-slate-500'
                        }`}
                        title={`Bit ${bitIdx}: Click to toggle`}
                      >
                        <span className="text-[8px] opacity-60 font-normal">b{bitIdx}</span>
                        <span>{bitVal}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Internal Parallel Gate Wiring Visualizer */}
          <div className="bg-[#080c14] rounded-xl p-4 border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-slate-400 gap-1 sm:gap-0">
              <span className="font-semibold text-slate-300">Internal Wiring: 16 Parallel {chip.id.replace('16', '')} Gates</span>
              <span className="text-slate-500">Signal: Cyan = HIGH (1), Dark = LOW (0)</span>
            </div>

            <div className="w-full overflow-x-auto flex justify-start sm:justify-center touch-pan-x">
              <svg viewBox="0 0 720 280" className="w-full h-auto max-w-[720px] min-w-[480px] sm:min-w-0 shrink-0 font-mono text-xs">
                {Array.from({ length: 16 }, (_, i) => 15 - i).map((bitIdx, row) => {
                  const y = 18 + row * 16;
                  const bitA = (inputA >> bitIdx) & 1;
                  const bitB = (inputB >> bitIdx) & 1;
                  const bitOut = (outVal >> bitIdx) & 1;

                  const colorA = bitA ? '#38bdf8' : '#334155';
                  const colorB = bitB ? '#38bdf8' : '#334155';
                  const colorOut = bitOut ? '#34d399' : '#334155';

                  return (
                    <g key={bitIdx}>
                      {/* Bit index label */}
                      <text x="105" y={y + 4} fill="#64748b" fontSize="9" fontWeight="bold">
                        [{bitIdx}]
                      </text>

                      {/* Input Wires */}
                      {chip.inputs.length > 1 ? (
                        <>
                          {/* Input Wire A (First Half: x 130 to 232.5) */}
                          <line x1="130" y1={y} x2="232.5" y2={y} stroke={colorA} strokeWidth="1.5" />
                          <text x="135" y={y - 2} fill={colorA} fontSize="8">
                            a[{bitIdx}]={bitA}
                          </text>

                          {/* Input Wire B (Second Half: x 232.5 to 335) */}
                          <line x1="232.5" y1={y} x2="335" y2={y} stroke={colorB} strokeWidth="1.5" />
                          <text x="237" y={y - 2} fill={colorB} fontSize="8">
                            b[{bitIdx}]={bitB}
                          </text>
                        </>
                      ) : (
                        <>
                          {/* Single Input Wire (x 130 to 335) */}
                          <line x1="130" y1={y} x2="335" y2={y} stroke={colorA} strokeWidth="1.5" />
                          <text x="135" y={y - 2} fill={colorA} fontSize="8">
                            in[{bitIdx}]={bitA}
                          </text>
                        </>
                      )}

                      {/* Gate Box */}
                      <rect
                        x="335"
                        y={y - 6}
                        width="80"
                        height="12"
                        rx="3"
                        fill="#0f172a"
                        stroke={bitOut ? '#38bdf8' : '#334155'}
                        strokeWidth="1"
                      />
                      <text x="375" y={y + 3} textAnchor="middle" fill="#f8fafc" fontSize="8" fontWeight="bold">
                        {chip.id.replace('16', '')}_{bitIdx}
                      </text>

                      {/* Output Wire */}
                      <line x1="415" y1={y} x2="615" y2={y} stroke={colorOut} strokeWidth="1.5" />
                      <text x="515" y={y - 2} fill={colorOut} fontSize="8" fontWeight="bold">
                        out[{bitIdx}] = {bitOut}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Static Read-Only 16-Bit Output Line (Same visual format as input) */}
          <div className="bg-[#0a0f18] rounded-xl p-3.5 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-200">
                Output 16-Bit Bus <span className="text-emerald-400">out</span> [15..0] (Static Result)
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                Decimal: {formatValue(outVal, 16).signed}
              </span>
            </div>

            <div className="grid grid-cols-[repeat(16,minmax(28px,1fr))] gap-1 overflow-x-auto py-1 min-w-0">
              {Array.from({ length: 16 }, (_, i) => 15 - i).map((bitIdx) => {
                const bitVal = (outVal >> bitIdx) & 1;
                return (
                  <div
                    key={bitIdx}
                    className={`flex flex-col items-center justify-center p-1.5 rounded text-xs font-mono font-bold border transition-all ${
                      bitVal
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
                        : 'bg-[#0f172a] text-slate-600 border-white/10'
                    }`}
                    title={`Bit ${bitIdx}: Output bit ${bitVal}`}
                  >
                    <span className="text-[8px] opacity-60 font-normal">b{bitIdx}</span>
                    <span>{bitVal}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDERER 2: Internal Wiring Diagrams for Standard Logic Gates
  // --------------------------------------------------------------------------
  const inputA = Number(inputs.a ?? inputs.in ?? inputs.x ?? 0);
  const inputB = Number(inputs.b ?? inputs.y ?? 0);
  const inputC = Number(inputs.c ?? 0);
  const selVal = Number(inputs.sel ?? 0);

  const outVal = Number(outputs.out ?? outputs.a ?? 0);

  // 8-way OR signal breakdown
  const in8Val = Number(inputs.in ?? 0) & 0xff;
  const b0 = (in8Val >> 0) & 1;
  const b1 = (in8Val >> 1) & 1;
  const b2 = (in8Val >> 2) & 1;
  const b3 = (in8Val >> 3) & 1;
  const b4 = (in8Val >> 4) & 1;
  const b5 = (in8Val >> 5) & 1;
  const b6 = (in8Val >> 6) & 1;
  const b7 = (in8Val >> 7) & 1;

  const or1Val = b0 | b1;
  const or2Val = b2 | b3;
  const or3Val = b4 | b5;
  const or4Val = b6 | b7;

  const or5Val = or1Val | or2Val;
  const or6Val = or3Val | or4Val;
  const or7Val = or5Val | or6Val;

  // Mux4Way16 signal breakdown
  const inputC_Mux = Number(inputs.c ?? 0);
  const inputD_Mux = Number(inputs.d ?? 0);
  const selVal4 = Number(inputs.sel ?? 0) & 3;
  const sel0 = (selVal4 >> 0) & 1;
  const sel1 = (selVal4 >> 1) & 1;

  const mux1Val = sel0 ? inputB : inputA;
  const mux2Val = sel0 ? inputD_Mux : inputC_Mux;
  const outMux4 = sel1 ? mux2Val : mux1Val;

  // Mux8Way16 signal breakdown
  const inputE_Mux = Number(inputs.e ?? 0);
  const inputF_Mux = Number(inputs.f ?? 0);
  const inputG_Mux = Number(inputs.g ?? 0);
  const inputH_Mux = Number(inputs.h ?? 0);
  const selVal8 = Number(inputs.sel ?? 0) & 7;
  const sel01 = selVal8 & 3;
  const sel2 = (selVal8 >> 2) & 1;

  const mux8Ways = [
    inputA, inputB, inputC_Mux, inputD_Mux,
    inputE_Mux, inputF_Mux, inputG_Mux, inputH_Mux
  ];
  const mux8Sub1 = mux8Ways[sel01] ?? inputA;
  const mux8Sub2 = mux8Ways[4 + sel01] ?? inputE_Mux;
  const outMux8 = sel2 ? mux8Sub2 : mux8Sub1;

  return (
    <div className="bg-[#05070a] rounded-xl border border-white/10 p-5 relative shadow-2xl overflow-hidden bg-blueprint space-y-4">
      {/* Top Diagram Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Internal Schematic Wiring Blueprint (<span className="text-cyan-400">{chip.name}</span>)
          </h3>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {['DFF', 'Bit', 'Register', 'PC'].includes(chip.id) && onClockPulse && (
            <button
              onClick={onClockPulse}
              className="px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clock Pulse (Tick)</span>
            </button>
          )}

          <span className="text-[10px] text-slate-400 font-mono">
            {chip.id.startsWith('RAM') || chip.id === 'Memory' || chip.id === 'Computer' ? 'Static Architectural Blueprint' : 'Click input pins on left to toggle'}
          </span>
        </div>
      </div>

      {/* Address Map Summary for Memory Chip */}
      {chip.id === 'Memory' && (
        <div className="bg-[#0a0f18] rounded-xl p-3 border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-xs">
          <div className="bg-[#0f172a] p-2 rounded border border-white/5 flex flex-col">
            <span className="text-cyan-400 font-bold">0-16383 (0x0000-0x3FFF)</span>
            <span className="text-slate-200">Regular RAM (16K)</span>
          </div>
          <div className="bg-[#0f172a] p-2 rounded border border-white/5 flex flex-col">
            <span className="text-cyan-400 font-bold">16384-24575 (0x4000-0x5FFF)</span>
            <span className="text-slate-200">Screen memory map (8K)</span>
          </div>
          <div className="bg-[#0f172a] p-2 rounded border border-white/5 flex flex-col">
            <span className="text-cyan-400 font-bold">24576 (0x6000)</span>
            <span className="text-slate-200">Keyboard memory map</span>
          </div>
        </div>
      )}

      {/* Interactive 8-Bit Input Bar for Or8Way */}
      {chip.id === 'Or8Way' && (
        <div className="bg-[#0a0f18] rounded-xl p-3 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-slate-200">
              8-Bit Input Bus <span className="text-cyan-400">in[0..7]</span> (Click bit to toggle [0/1])
            </span>
            <span className="font-mono text-xs font-bold text-cyan-400">
              Value: {in8Val}
            </span>
          </div>
          <div className="grid grid-cols-8 gap-1.5 py-1">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((bitIdx) => {
              const bitVal = (in8Val >> bitIdx) & 1;
              return (
                <button
                  key={bitIdx}
                  onClick={() => {
                    if (onToggleBit) {
                      onToggleBit('in', bitIdx);
                    } else {
                      onToggleInputPin('in', in8Val ^ (1 << bitIdx));
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded text-xs font-mono font-bold transition-all border cursor-pointer ${
                    bitVal
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                      : 'bg-[#0f172a] text-slate-400 border-white/10 hover:border-slate-500'
                  }`}
                  title={`Click to toggle in[${bitIdx}]`}
                >
                  <span className="text-[9px] opacity-70">in[{bitIdx}]</span>
                  <span>{bitVal}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Selector Dropdown Bar for Mux4Way16 / DMux4Way */}
      {(chip.id === 'Mux4Way16' || chip.id === 'DMux4Way') && (
        <div className="bg-[#0a0f18] rounded-xl p-3 border border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-slate-200">
              Select Bus <span className="text-cyan-400">sel[0..1]</span>:
            </span>
            <select
              value={selVal4}
              onChange={(e) => onToggleInputPin('sel', Number(e.target.value))}
              className="bg-[#0f172a] border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
            >
              <option value={0}>sel = 0 (00) ➔ {chip.id === 'DMux4Way' ? "Route 'in' to 'a'" : "Choose 'a'"}</option>
              <option value={1}>sel = 1 (01) ➔ {chip.id === 'DMux4Way' ? "Route 'in' to 'b'" : "Choose 'b'"}</option>
              <option value={2}>sel = 2 (10) ➔ {chip.id === 'DMux4Way' ? "Route 'in' to 'c'" : "Choose 'c'"}</option>
              <option value={3}>sel = 3 (11) ➔ {chip.id === 'DMux4Way' ? "Route 'in' to 'd'" : "Choose 'd'"}</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-slate-400">Quick Select:</span>
            {[0, 1, 2, 3].map((val) => {
              const labels = ['a', 'b', 'c', 'd'];
              return (
                <button
                  key={val}
                  onClick={() => onToggleInputPin('sel', val)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all border cursor-pointer ${
                    selVal4 === val
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                      : 'bg-[#0f172a] text-slate-400 border-white/10 hover:border-slate-500'
                  }`}
                >
                  {val} ({labels[val]})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Selector Dropdown Bar for Mux8Way16 / DMux8Way */}
      {(chip.id === 'Mux8Way16' || chip.id === 'DMux8Way') && (
        <div className="bg-[#0a0f18] rounded-xl p-3 border border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-slate-200">
              Select Bus <span className="text-cyan-400">sel[0..2]</span>:
            </span>
            <select
              value={selVal8}
              onChange={(e) => onToggleInputPin('sel', Number(e.target.value))}
              className="bg-[#0f172a] border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map((val) => {
                const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                const binary = val.toString(2).padStart(3, '0');
                const actionText = chip.id === 'DMux8Way' ? `Route 'in' to '${labels[val]}'` : `Choose '${labels[val]}'`;
                return (
                  <option key={val} value={val}>
                    sel = {val} ({binary}) ➔ {actionText}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Quick Select:</span>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((val) => {
              const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
              return (
                <button
                  key={val}
                  onClick={() => onToggleInputPin('sel', val)}
                  className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all border cursor-pointer ${
                    selVal8 === val
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                      : 'bg-[#0f172a] text-slate-400 border-white/10 hover:border-slate-500'
                  }`}
                >
                  {val} ({labels[val]})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SVG Canvas for Internal Wiring */}
      <div className="w-full overflow-x-auto flex justify-start sm:justify-center py-2 touch-pan-x">
        <svg viewBox="0 0 760 380" className="w-full max-w-3xl h-auto font-mono text-xs select-none min-w-[500px] sm:min-w-0 shrink-0">
          <defs>
            <pattern id="circuit-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="760" height="380" fill="#05070a" rx="10" />
          <rect width="760" height="380" fill="url(#circuit-grid)" rx="10" opacity="0.6" />

          {/* Enclosure Title Header (Positioned above the chip internals frame) */}
          <rect
            x={chip.id === 'Computer' ? 242.5 : 280}
            y="8"
            width="200"
            height="26"
            rx="6"
            fill="#111827"
            stroke="rgba(34, 211, 238, 0.4)"
          />
          <text
            x={chip.id === 'Computer' ? 342.5 : 380}
            y="25"
            textAnchor="middle"
            fill="#22d3ee"
            fontWeight="bold"
            fontSize="13"
            className="font-mono"
          >
            CHIP {chip.name}
          </text>

          {/* Outer Enclosure Frame for the Chip Internals */}
          <rect
            x={chip.id === 'Computer' ? 125 : 180}
            y="40"
            width={chip.id === 'Computer' ? 435 : 400}
            height={chip.id === 'Computer' ? 280 : 325}
            rx="12"
            fill="#0a0f18"
            stroke={chip.id === 'Computer' ? "rgba(56, 189, 248, 0.6)" : "rgba(255, 255, 255, 0.15)"}
            strokeDasharray={chip.id === 'Computer' ? "5 4" : undefined}
            strokeWidth="1.5"
          />

          {/* ------------------------------------------------------------------ */}
          {/* DYNAMIC INTERNAL WIRING CASES BASED ON CHIP ID */}
          {/* ------------------------------------------------------------------ */}

          {/* CASE: Primitive Nand */}
          {chip.id === 'Nand' && (
            <g>
              {/* Clean Primitive Gate Block (No transistor structure) */}
              <rect x="300" y="110" width="160" height="160" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <text x="380" y="175" textAnchor="middle" fill="#38bdf8" fontSize="20" fontWeight="bold">
                NAND
              </text>
              <text x="380" y="205" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="medium">
                Primitive Hardware Gate
              </text>

              {/* Input Wires */}
              <WirePath d="M 180 120 L 300 150" val={inputA} />
              <WirePath d="M 180 260 L 300 230" val={inputB} />

              {/* Output Wire */}
              <WirePath d="M 460 190 L 580 190" val={outVal} />
            </g>
          )}

          {/* CASE: Not Gate */}
          {chip.id === 'Not' && (
            <g>
              <WirePath d="M 180 190 L 260 190 L 260 160 L 320 160" val={inputA} />
              <WirePath d="M 260 190 L 260 220 L 320 220" val={inputA} />

              <SubChipBox x={320} y={130} w={120} h={120} name="Nand_1" type="Nand" />

              <WirePath d="M 440 190 L 580 190" val={outVal} />
            </g>
          )}

          {/* CASE: And Gate */}
          {chip.id === 'And' && (
            <g>
              <WirePath d="M 180 120 L 240 140" val={inputA} />
              <WirePath d="M 180 260 L 240 240" val={inputB} />

              <SubChipBox x={240} y={110} w={110} h={160} name="Nand_1" type="Nand" />

              <WirePath d="M 350 190 L 420 190" val={Number(inputs.a) && Number(inputs.b) ? 0 : 1} />

              <SubChipBox x={420} y={140} w={100} h={100} name="Not_1" type="Not" />

              <WirePath d="M 520 190 L 580 190" val={outVal} />
            </g>
          )}

          {/* CASE: Or Gate */}
          {chip.id === 'Or' && (
            <g>
              {/* Input 'a' branching into both inputs of Nand_a */}
              <WirePath d="M 180 120 L 210 120 L 210 100 L 240 100" val={inputA} />
              <WirePath d="M 210 120 L 210 140 L 240 140" val={inputA} />
              <circle cx="210" cy="120" r="3" fill={inputA ? '#38bdf8' : '#334155'} />

              {/* Input 'b' branching into both inputs of Nand_b */}
              <WirePath d="M 180 260 L 210 260 L 210 240 L 240 240" val={inputB} />
              <WirePath d="M 210 260 L 210 280 L 240 280" val={inputB} />
              <circle cx="210" cy="260" r="3" fill={inputB ? '#38bdf8' : '#334155'} />

              <SubChipBox x={240} y={80} w={100} h={80} name="Nand_a" type="Nand" />
              <SubChipBox x={240} y={220} w={100} h={80} name="Nand_b" type="Nand" />

              <WirePath d="M 340 120 L 380 120 L 380 160 L 430 160" val={inputA ? 0 : 1} />
              <WirePath d="M 340 260 L 380 260 L 380 220 L 430 220" val={inputB ? 0 : 1} />

              <SubChipBox x={430} y={130} w={100} h={120} name="Nand_out" type="Nand" />

              <WirePath d="M 530 190 L 580 190" val={outVal} />
            </g>
          )}

          {/* CASE: Xor Gate */}
          {chip.id === 'Xor' && (
            <g>
              {/* Input A Line & Branching */}
              <WirePath d="M 180 120 L 210 120 L 210 100 L 340 100" val={inputA} />
              <WirePath d="M 210 120 L 210 240 L 240 240" val={inputA} />
              <circle cx="210" cy="120" r="3" fill={inputA ? '#38bdf8' : '#334155'} />

              {/* Input B Line & Branching */}
              <WirePath d="M 180 260 L 195 260 L 195 160 L 240 160" val={inputB} />
              <WirePath d="M 195 260 L 195 300 L 340 300" val={inputB} />
              <circle cx="195" cy="260" r="3" fill={inputB ? '#38bdf8' : '#334155'} />

              {/* SubChipBoxes for NOT gates */}
              <SubChipBox x={240} y={135} w={70} h={50} name="Not_b" type="Not" />
              <SubChipBox x={240} y={215} w={70} h={50} name="Not_a" type="Not" />

              {/* Inverter Outputs to AND Inputs */}
              <WirePath d="M 310 160 L 340 160" val={!inputB ? 1 : 0} />
              <WirePath d="M 310 240 L 340 240" val={!inputA ? 1 : 0} />

              {/* AND Gates */}
              <SubChipBox x={340} y={80} w={90} h={100} name="And_1" type="And" />
              <SubChipBox x={340} y={220} w={90} h={100} name="And_2" type="And" />

              {/* AND Outputs to OR Inputs */}
              <WirePath d="M 430 130 L 450 130 L 450 160 L 470 160" val={inputA && !inputB ? 1 : 0} />
              <WirePath d="M 430 270 L 450 270 L 450 220 L 470 220" val={!inputA && inputB ? 1 : 0} />

              {/* OR Gate */}
              <SubChipBox x={470} y={135} w={90} h={110} name="Or_1" type="Or" />

              {/* Final Output */}
              <WirePath d="M 560 190 L 580 190" val={outVal} />
            </g>
          )}

          {/* CASE: Mux Gate */}
          {chip.id === 'Mux' && (
            <g>
              {/* Input a wire (Y=90): (180, 90) -> top input of And_a at (340, 90) */}
              <WirePath d="M 180 90 L 340 90" val={inputA} />

              {/* Input sel wire (Y=190): (180, 190) -> junction dot at (210, 190) */}
              <WirePath d="M 180 190 L 210 190" val={selVal} />

              {/* Junction dot on sel line at (210, 190) */}
              <circle
                cx="210"
                cy="190"
                r="3.5"
                fill={selVal ? '#38bdf8' : '#334155'}
                stroke={selVal ? '#22d3ee' : '#475569'}
                strokeWidth="1.5"
              />

              {/* sel Branch 1: From junction (210, 190) into Not_sel inverter at (240, 190) */}
              <WirePath d="M 210 190 L 240 190" val={selVal} />

              {/* Not_sel Inverter SubChipBox */}
              <SubChipBox x={240} y={165} w={70} h={50} name="Not_sel" type="Not" />

              {/* Not_sel output: From inverter output (310, 190) to bottom input of And_a at (340, 130) */}
              <WirePath d="M 310 190 L 325 190 L 325 130 L 340 130" val={!selVal ? 1 : 0} />

              {/* sel Branch 2: From junction (210, 190) down to top input of And_b at (340, 250) */}
              <WirePath d="M 210 190 L 210 250 L 340 250" val={selVal} />

              {/* Input b wire (Y=290): (180, 290) -> bottom input of And_b at (340, 290) */}
              <WirePath d="M 180 290 L 340 290" val={inputB} />

              {/* Top AND Gate (And_a) SubChipBox */}
              <SubChipBox x={340} y={70} w={90} h={80} name="And_a" type="And" />

              {/* Bottom AND Gate (And_b) SubChipBox */}
              <SubChipBox x={340} y={230} w={90} h={80} name="And_b" type="And" />

              {/* And_a Output: From (430, 110) to top input of Or_out at (470, 165) */}
              <WirePath d="M 430 110 L 450 110 L 450 165 L 470 165" val={inputA && !selVal ? 1 : 0} />

              {/* And_b Output: From (430, 270) to bottom input of Or_out at (470, 215) */}
              <WirePath d="M 430 270 L 450 270 L 450 215 L 470 215" val={inputB && selVal ? 1 : 0} />

              {/* OR Gate (Or_out) SubChipBox */}
              <SubChipBox x={470} y={145} w={90} h={90} name="Or_out" type="Or" />

              {/* Or_out Output: From (560, 190) to right output pin (580, 190) */}
              <WirePath d="M 560 190 L 580 190" val={outVal} />
            </g>
          )}

          {/* CASE: DMux Gate */}
          {chip.id === 'DMux' && (
            <g>
              {/* Input 'in' wire (Y=120): (180, 120) to junction dot at (200, 120) */}
              <WirePath d="M 180 120 L 200 120" val={inputA} />
              <circle
                cx="200"
                cy="120"
                r="3.5"
                fill={inputA ? '#38bdf8' : '#334155'}
                stroke={inputA ? '#22d3ee' : '#475569'}
                strokeWidth="1"
              />

              {/* 'in' Branch 1: From junction (200, 120) up to top input of and_a at (340, 90) */}
              <WirePath d="M 200 120 L 200 90 L 340 90" val={inputA} />

              {/* 'in' Branch 2: From junction (200, 120) down to bottom input of and_b at (340, 290) */}
              <WirePath d="M 200 120 L 200 290 L 340 290" val={inputA} />

              {/* Input 'sel' wire (Y=260): (180, 260) to junction dot at (220, 260) */}
              <WirePath d="M 180 260 L 220 260" val={selVal} />

              {/* Junction dot on 'sel' line at (220, 260) */}
              <circle
                cx="220"
                cy="260"
                r="3.5"
                fill={selVal ? '#38bdf8' : '#334155'}
                stroke={selVal ? '#22d3ee' : '#475569'}
                strokeWidth="1"
              />

              {/* 'sel' Branch 1: From junction (220, 260) up to not_sel inverter input at (240, 190) */}
              <WirePath d="M 220 260 L 220 190 L 240 190" val={selVal} />

              {/* 'sel' Branch 2: From junction (220, 260) to top input of and_b at (340, 250) */}
              <WirePath d="M 220 260 L 220 250 L 340 250" val={selVal} />

              {/* not_sel Inverter SubChipBox */}
              <SubChipBox x={240} y={165} w={70} h={50} name="not_sel" type="Not" />

              {/* not_sel output: From inverter output (310, 190) to bottom input of and_a at (340, 130) */}
              <WirePath d="M 310 190 L 325 190 L 325 130 L 340 130" val={!selVal ? 1 : 0} />

              {/* Top AND Gate (and_a) SubChipBox */}
              <SubChipBox x={340} y={70} w={90} h={80} name="and_a" type="And" />

              {/* Bottom AND Gate (and_b) SubChipBox */}
              <SubChipBox x={340} y={230} w={90} h={80} name="and_b" type="And" />

              {/* and_a Output: From (430, 110) to top output pin 'a' at (580, 120) */}
              <WirePath d="M 430 110 L 450 110 L 450 120 L 580 120" val={inputA && !selVal ? 1 : 0} />

              {/* and_b Output: From (430, 270) to bottom output pin 'b' at (580, 260) */}
              <WirePath d="M 430 270 L 450 270 L 450 260 L 580 260" val={inputA && selVal ? 1 : 0} />
            </g>
          )}

          {/* CASE: HalfAdder */}
          {chip.id === 'HalfAdder' && (
            <g>
              <WirePath d="M 180 120 L 280 120" val={inputA} />
              <WirePath d="M 220 120 L 220 240 L 280 240" val={inputA} />

              <WirePath d="M 180 260 L 280 260" val={inputB} />
              <WirePath d="M 240 260 L 240 140 L 280 140" val={inputB} />

              <SubChipBox x={280} y={80} w={120} h={80} name="Xor_sum" type="Xor" />
              <SubChipBox x={280} y={220} w={120} h={80} name="And_carry" type="And" />

              <WirePath d="M 400 120 L 580 120" val={Number(outputs.sum || 0)} />
              <WirePath d="M 400 260 L 580 260" val={Number(outputs.carry || 0)} />
            </g>
          )}

          {/* CASE: FullAdder */}
          {chip.id === 'FullAdder' && (() => {
            const s1Val = inputA ^ inputB;
            const c1Val = inputA & inputB;
            const c2Val = s1Val & inputC;
            const sumVal = Number(outputs.sum ?? 0);
            const carryVal = Number(outputs.carry ?? 0);

            return (
              <g>
                {/* Input A wire: (180, 90) -> (205, 90) -> (205, 110) -> (230, 110) */}
                <WirePath d="M 180 90 L 205 90 L 205 110 L 230 110" val={inputA} />

                {/* Input B wire: (180, 190) -> (205, 190) -> (205, 170) -> (230, 170) */}
                <WirePath d="M 180 190 L 205 190 L 205 170 L 230 170" val={inputB} />

                {/* HalfAdder 1 */}
                <SubChipBox x={230} y={80} w={100} h={120} name="HA_1" type="HalfAdder" />

                {/* Intermediate sum s1 wire: HA_1 sum out (330, 110) -> HA_2 sum in (360, 110) */}
                <WirePath d="M 330 110 L 360 110" val={s1Val} />

                {/* External Carry-In C wire: (180, 290) -> (345, 290) -> (345, 170) -> (360, 170) */}
                <WirePath d="M 180 290 L 345 290 L 345 170 L 360 170" val={inputC} />

                {/* HalfAdder 2 */}
                <SubChipBox x={360} y={80} w={100} h={120} name="HA_2" type="HalfAdder" />

                {/* HA_1 carry c1 wire: HA_1 carry out (330, 170) -> (345, 170) -> (345, 235) -> Or_carry top in (480, 235) */}
                <WirePath d="M 330 170 L 345 170 L 345 235 L 480 235" val={c1Val} />

                {/* HA_2 carry c2 wire: HA_2 carry out (460, 170) -> (472, 170) -> (472, 285) -> Or_carry bottom in (480, 285) */}
                <WirePath d="M 460 170 L 472 170 L 472 285 L 480 285" val={c2Val} />

                {/* Or_carry Gate */}
                <SubChipBox x={480} y={215} w={80} h={90} name="Or_carry" type="Or" />

                {/* Output sum wire: HA_2 sum out (460, 110) -> (490, 110) -> (490, 120) -> (580, 120) */}
                <WirePath d="M 460 110 L 490 110 L 490 120 L 580 120" val={sumVal} />

                {/* Output carry wire: Or_carry out (560, 260) -> (580, 260) */}
                <WirePath d="M 560 260 L 580 260" val={carryVal} />
              </g>
            );
          })()}

          {/* CASE: Bit */}
          {chip.id === 'Bit' && (() => {
            const inValBit = Number(inputs.in ?? 0);
            const loadValBit = Number(inputs.load ?? 0);
            const outValBit = Number(outputs.out ?? 0);
            const muxOutValBit = loadValBit ? inValBit : outValBit;

            return (
              <g>
                {/* Wire from external pin (180, 130) straight into Mux top input (270, 130) */}
                <WirePath d="M 180 130 L 270 130" val={inValBit} />
                <polygon
                  points="270,130 264,126 264,134"
                  fill={getSignalColor(inValBit)}
                />

                {/* Wire from external pin (180, 70) -> (300, 70) -> (300, 125) into Mux top */}
                <path
                  d="M 180 70 L 300 70 L 300 125"
                  stroke={loadValBit ? '#f43f5e' : '#881337'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <polygon
                  points="300,125 296,118 304,118"
                  fill={loadValBit ? '#f43f5e' : '#881337'}
                />

                {/* Trapezoid Mux Chip */}
                <polygon
                  points="270,115 330,135 330,165 270,185"
                  fill="#0f172a"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                />
                <text
                  x="292"
                  y="154"
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="12"
                  fontWeight="bold"
                  className="font-mono"
                >
                  Mux
                </text>

                {/* Wire from Mux to DFF: (330, 150) -> (390, 150) */}
                <WirePath d="M 330 150 L 390 150" val={muxOutValBit} />
                <polygon
                  points="390,150 384,146 384,154"
                  fill={getSignalColor(muxOutValBit)}
                />

                {/* DFF SubChip Box */}
                <rect
                  x="390"
                  y="120"
                  width="75"
                  height="60"
                  rx="6"
                  fill="#0f172a"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                />
                <text
                  x="427"
                  y="154"
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="13"
                  fontWeight="bold"
                  className="font-mono"
                >
                  DFF
                </text>
                {/* DFF Clock Triangle Symbol */}
                <polygon
                  points="422,180 427,172 432,180"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="1.5"
                />

                {/* DFF Output Wire to Junction Node (465, 150) -> (510, 150) */}
                <WirePath d="M 465 150 L 510 150" val={outValBit} />

                {/* Junction Node Circle */}
                <circle
                  cx="510"
                  cy="150"
                  r="3.5"
                  fill={outValBit ? '#38bdf8' : '#334155'}
                  stroke={outValBit ? '#22d3ee' : '#475569'}
                  strokeWidth="1.5"
                />

                {/* Wire from Junction Node to External 'out' Pin (510, 150) -> (580, 150) */}
                <WirePath d="M 510 150 L 580 150" val={outValBit} />
                <polygon
                  points="575,150 569,146 569,154"
                  fill={getSignalColor(outValBit)}
                />

                {/* Feedback Loop: From Junction (510, 150) -> Down (510, 215) -> Left (240, 215) -> Up (240, 170) -> Right into Mux bottom (270, 170) */}
                <WirePath
                  d="M 510 150 L 510 215 L 240 215 L 240 170 L 270 170"
                  val={outValBit}
                />
                <polygon
                  points="270,170 264,166 264,174"
                  fill={getSignalColor(outValBit)}
                />
              </g>
            );
          })()}

          {/* CASE: Register */}
          {chip.id === 'Register' && (() => {
            const regInVal = Number(inputs.in ?? 0);
            const regLoadVal = Number(inputs.load ?? 0);
            const regOutVal = Number(outputs.out ?? 0);

            // 8 Bit cells inside the register visualization
            const bitIndices = [0, 1, 2, 3, 4, 5, 6, 7];

            return (
              <g>
                {/* 1. BACKGROUND BUS TRUNKS & CONNECTIONS (Rendered behind boxes) */}

                {/* Col 0 Input Bus Trunk (X=205) */}
                <WirePath d="M 180 120 L 205 120 L 205 242" val={regInVal ? 1 : 0} />

                {/* Col 1 Input Bus Bypass (over top at Y=48 to X=390) */}
                <WirePath d="M 205 120 L 205 48 L 390 48 L 390 242" val={regInVal ? 1 : 0} />

                {/* Main Load Bus (X=180, Y=260) -> down to Y=292 -> across to Col 0 (X=220) & Col 1 (X=405) */}
                <path
                  d="M 180 260 L 220 260 L 220 292 L 405 292 L 405 92"
                  stroke={regLoadVal ? '#f43f5e' : '#881337'}
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M 220 292 L 220 92"
                  stroke={regLoadVal ? '#f43f5e' : '#881337'}
                  strokeWidth="2"
                  fill="none"
                />

                {/* Col 0 Output Bus Trunk (X=368) -> down to Y=305 -> across to X=555 */}
                <WirePath d="M 368 84 L 368 305 L 555 305 L 555 190 L 580 190" val={regOutVal ? 1 : 0} />

                {/* Col 1 Output Bus Trunk (X=555) -> down to Y=305 */}
                <WirePath d="M 555 84 L 555 305" val={regOutVal ? 1 : 0} />

                {/* 2. PER-BIT WIRES & TAP LINES */}
                {bitIndices.map((bitIdx) => {
                  const col = bitIdx < 4 ? 0 : 1;
                  const row = bitIdx % 4;
                  const bx = col === 0 ? 240 : 425;
                  const by = 60 + row * 56;

                  const bitIn = (regInVal >> bitIdx) & 1;
                  const bitOut = (regOutVal >> bitIdx) & 1;

                  const inTrunkX = col === 0 ? 205 : 390;
                  const loadTrunkX = col === 0 ? 220 : 405;
                  const outTrunkX = col === 0 ? 368 : 555;

                  return (
                    <g key={`wire-${bitIdx}`}>
                      {/* Horizontal Input Tap into left edge of Bit box */}
                      <WirePath d={`M ${inTrunkX} ${by + 16} L ${bx} ${by + 16}`} val={bitIn} />

                      {/* Horizontal Load Tap into left edge of Bit box */}
                      <path
                        d={`M ${loadTrunkX} ${by + 32} L ${bx} ${by + 32}`}
                        stroke={regLoadVal ? '#f43f5e' : '#881337'}
                        strokeWidth="1.5"
                        fill="none"
                      />

                      {/* Horizontal Output Tap out of right edge of Bit box */}
                      <WirePath d={`M ${bx + 110} ${by + 24} L ${outTrunkX} ${by + 24}`} val={bitOut} />
                    </g>
                  );
                })}

                {/* 3. BIT CELL BOXES & LABELS (Rendered on top of wires) */}
                {bitIndices.map((bitIdx) => {
                  const col = bitIdx < 4 ? 0 : 1;
                  const row = bitIdx % 4;
                  const bx = col === 0 ? 240 : 425;
                  const by = 60 + row * 56;

                  const bitIn = (regInVal >> bitIdx) & 1;
                  const bitOut = (regOutVal >> bitIdx) & 1;

                  return (
                    <g key={`box-${bitIdx}`}>
                      {/* Bit SubChip Box */}
                      <rect
                        x={bx}
                        y={by}
                        width="110"
                        height="48"
                        rx="6"
                        fill={bitOut ? 'rgba(34, 211, 238, 0.15)' : '#0f172a'}
                        stroke={bitOut ? '#22d3ee' : '#334155'}
                        strokeWidth="1.5"
                        className="transition-all"
                      />

                      {/* Bit Cell Title */}
                      <text x={bx + 10} y={by + 18} fill="#94a3b8" fontSize="10" fontWeight="bold" className="font-mono">
                        Bit_{bitIdx}
                      </text>

                      {/* Bit State Badge */}
                      <rect
                        x={bx + 68}
                        y={by + 8}
                        width="32"
                        height="18"
                        rx="4"
                        fill={bitOut ? '#22d3ee' : '#1e293b'}
                      />
                      <text
                        x={bx + 84}
                        y={by + 21}
                        textAnchor="middle"
                        fill={bitOut ? '#000000' : '#64748b'}
                        fontSize="10"
                        fontWeight="bold"
                        className="font-mono"
                      >
                        {bitOut}
                      </text>

                      {/* Info label: in & load status */}
                      <text x={bx + 10} y={by + 36} fill="#64748b" fontSize="8.5" className="font-mono">
                        in:{bitIn} | load:{regLoadVal}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })()}

          {/* CASE: DMux4Way Gate */}
          {chip.id === 'DMux4Way' && (() => {
            const inBit = Number(inputs.in ?? 0);
            const selVal4 = Number(inputs.sel ?? 0) & 3;
            const sel0 = (selVal4 >> 0) & 1;
            const sel1 = (selVal4 >> 1) & 1;

            const outA = Number(outputs.a ?? 0);
            const outB = Number(outputs.b ?? 0);
            const outC = Number(outputs.c ?? 0);
            const outD = Number(outputs.d ?? 0);

            const topIn = sel1 === 0 ? inBit : 0;
            const botIn = sel1 === 1 ? inBit : 0;

            return (
              <g>
                {/* SubChip 1: 1st stage DMux (split by sel[1]) */}
                <SubChipBox x={235} y={115} w={90} h={90} name="DMux_0" type="DMux" />

                {/* Input 'in' wire from external pin (180, 160) straight to (235, 160) */}
                <WirePath d="M 180 160 L 235 160" val={inBit} />

                {/* Intermediate top & bottom wires */}
                <WirePath d="M 325 138 L 360 138 L 360 85 L 395 85" val={topIn} />
                <WirePath d="M 325 182 L 360 182 L 360 235 L 395 235" val={botIn} />

                {/* 2nd stage DMuxes (split by sel[0]) */}
                <SubChipBox x={395} y={45} w={90} h={80} name="DMux_top" type="DMux" />
                <SubChipBox x={395} y={195} w={90} h={80} name="DMux_bot" type="DMux" />

                {/* Output Wires to external pins (a: 60, b: 140, c: 220, d: 300) */}
                <WirePath d="M 485 65 L 530 65 L 530 60 L 580 60" val={outA} />
                <WirePath d="M 485 105 L 530 105 L 530 140 L 580 140" val={outB} />
                <WirePath d="M 485 215 L 530 215 L 530 220 L 580 220" val={outC} />
                <WirePath d="M 485 255 L 530 255 L 530 300 L 580 300" val={outD} />

                {/* Red Selector Control Wires */}
                <path
                  d="M 215 332 L 215 295"
                  stroke={selVal4 ? '#f43f5e' : '#881337'}
                  strokeWidth="2.5"
                />
                <path
                  d="M 215 295 L 280 295 L 280 205"
                  stroke={sel1 ? '#f43f5e' : '#881337'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M 215 295 L 365 295 L 440 295 L 440 275"
                  stroke={sel0 ? '#f43f5e' : '#881337'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M 365 295 L 365 150 L 440 150 L 440 125"
                  stroke={sel0 ? '#f43f5e' : '#881337'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle cx="215" cy="295" r="3.5" fill={selVal4 ? '#f43f5e' : '#881337'} />
                <circle cx="280" cy="205" r="3" fill={sel1 ? '#f43f5e' : '#881337'} />
                <circle cx="365" cy="295" r="3" fill={sel0 ? '#f43f5e' : '#881337'} />
                <circle cx="440" cy="275" r="3" fill={sel0 ? '#f43f5e' : '#881337'} />
                <circle cx="440" cy="125" r="3" fill={sel0 ? '#f43f5e' : '#881337'} />

                {/* Interactive sel selector button inside SVG */}
                <g
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextVal = (selVal4 + 1) % 4;
                    onToggleInputPin('sel', nextVal);
                  }}
                >
                  <rect
                    x="160"
                    y="332"
                    width="110"
                    height="30"
                    rx="6"
                    fill="#0f172a"
                    stroke={selVal4 ? '#f43f5e' : '#e11d48'}
                    strokeWidth="1.5"
                    className="transition-all group-hover:stroke-pink-400 group-hover:fill-[#1e1028]"
                  />
                  <text
                    x="215"
                    y="351"
                    textAnchor="middle"
                    fill={selVal4 ? '#f43f5e' : '#fb7185'}
                    fontSize="11"
                    fontWeight="bold"
                    className="font-mono"
                  >
                    sel: {selVal4} ({['a', 'b', 'c', 'd'][selVal4]}) ▾
                  </text>
                </g>
              </g>
            );
          })()}

          {/* CASE: DMux8Way Gate */}
          {chip.id === 'DMux8Way' && (() => {
            const inBit = Number(inputs.in ?? 0);
            const selVal8 = Number(inputs.sel ?? 0) & 7;
            const sel2 = (selVal8 >> 2) & 1;
            const sel01 = selVal8 & 3;

            const topIn = sel2 === 0 ? inBit : 0;
            const botIn = sel2 === 1 ? inBit : 0;

            const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

            return (
              <g>
                {/* SubChip 1: 1st stage DMux */}
                <SubChipBox x={235} y={135} w={90} h={90} name="DMux_main" type="DMux" />
                <WirePath d="M 180 180 L 235 180" val={inBit} />

                {/* Intermediate top & bottom wires */}
                <WirePath d="M 325 157 L 350 157 L 350 100 L 380 100" val={topIn} />
                <WirePath d="M 325 203 L 350 203 L 350 260 L 380 260" val={botIn} />

                {/* 2nd stage DMux4Way subchips */}
                <SubChipBox x={380} y={55} w={110} h={90} name="DMux4Way_top" type="DMux4Way" />
                <SubChipBox x={380} y={215} w={110} h={90} name="DMux4Way_bot" type="DMux4Way" />

                {/* Outputs a..h */}
                <WirePath d="M 490 65 L 530 65 L 530 52 L 580 52" val={Number(outputs.a ?? 0)} />
                <WirePath d="M 490 85 L 530 85 L 530 90 L 580 90" val={Number(outputs.b ?? 0)} />
                <WirePath d="M 490 105 L 530 105 L 530 128 L 580 128" val={Number(outputs.c ?? 0)} />
                <WirePath d="M 490 125 L 530 125 L 530 166 L 580 166" val={Number(outputs.d ?? 0)} />

                <WirePath d="M 490 225 L 530 225 L 530 204 L 580 204" val={Number(outputs.e ?? 0)} />
                <WirePath d="M 490 245 L 530 245 L 530 242 L 580 242" val={Number(outputs.f ?? 0)} />
                <WirePath d="M 490 265 L 530 265 L 530 280 L 580 280" val={Number(outputs.g ?? 0)} />
                <WirePath d="M 490 285 L 530 285 L 530 318 L 580 318" val={Number(outputs.h ?? 0)} />

                {/* Red Selector Control Wires */}
                <path
                  d="M 215 332 L 215 295"
                  stroke={selVal8 ? '#f43f5e' : '#881337'}
                  strokeWidth="2.5"
                />
                <path
                  d="M 215 295 L 280 295 L 280 225"
                  stroke={sel2 ? '#f43f5e' : '#881337'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M 215 295 L 355 295 L 355 315 L 435 315 L 435 305"
                  stroke={sel01 ? '#f43f5e' : '#881337'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M 355 315 L 355 170 L 435 170 L 435 145"
                  stroke={sel01 ? '#f43f5e' : '#881337'}
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle cx="215" cy="295" r="3.5" fill={selVal8 ? '#f43f5e' : '#881337'} />
                <circle cx="280" cy="225" r="3" fill={sel2 ? '#f43f5e' : '#881337'} />
                <circle cx="355" cy="295" r="3" fill={sel01 ? '#f43f5e' : '#881337'} />
                <circle cx="355" cy="315" r="3" fill={sel01 ? '#f43f5e' : '#881337'} />
                <circle cx="435" cy="305" r="3" fill={sel01 ? '#f43f5e' : '#881337'} />
                <circle cx="435" cy="145" r="3" fill={sel01 ? '#f43f5e' : '#881337'} />

                {/* Interactive sel selector button inside SVG */}
                <g
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextVal = (selVal8 + 1) % 8;
                    onToggleInputPin('sel', nextVal);
                  }}
                >
                  <rect
                    x="155"
                    y="332"
                    width="120"
                    height="30"
                    rx="6"
                    fill="#0f172a"
                    stroke={selVal8 ? '#f43f5e' : '#e11d48'}
                    strokeWidth="1.5"
                    className="transition-all group-hover:stroke-pink-400 group-hover:fill-[#1e1028]"
                  />
                  <text
                    x="215"
                    y="351"
                    textAnchor="middle"
                    fill={selVal8 ? '#f43f5e' : '#fb7185'}
                    fontSize="11"
                    fontWeight="bold"
                    className="font-mono"
                  >
                    sel: {selVal8} ({keys[selVal8]}) ▾
                  </text>
                </g>
              </g>
            );
          })()}

          {/* CASE: RAM Chips (RAM8, RAM64, RAM512, RAM4K, RAM16K) - Static Architecture Diagram */}
          {['RAM8', 'RAM64', 'RAM512', 'RAM4K', 'RAM16K'].includes(chip.id) && (() => {
            let capacityText = '8 Words (16-bit)';
            let subChipType = 'Register';
            let totalBlocks = 8;
            let rangeSize = 1;
            let addrWidth = 3;

            if (chip.id === 'RAM8') {
              capacityText = '8 Words (16-bit)';
              subChipType = 'Register';
              totalBlocks = 8;
              rangeSize = 1;
              addrWidth = 3;
            } else if (chip.id === 'RAM64') {
              capacityText = '64 Words (8 x RAM8)';
              subChipType = 'RAM8';
              totalBlocks = 8;
              rangeSize = 8;
              addrWidth = 6;
            } else if (chip.id === 'RAM512') {
              capacityText = '512 Words (8 x RAM64)';
              subChipType = 'RAM64';
              totalBlocks = 8;
              rangeSize = 64;
              addrWidth = 9;
            } else if (chip.id === 'RAM4K') {
              capacityText = '4,096 Words (8 x RAM512)';
              subChipType = 'RAM512';
              totalBlocks = 8;
              rangeSize = 512;
              addrWidth = 12;
            } else if (chip.id === 'RAM16K') {
              capacityText = '16,384 Words (4 x RAM4K)';
              subChipType = 'RAM4K';
              totalBlocks = 4;
              rangeSize = 4096;
              addrWidth = 14;
            }

            const dmuxName = totalBlocks === 4 ? 'DMux4Way' : 'DMux8Way';
            const muxName = totalBlocks === 4 ? 'Mux4Way16' : 'Mux8Way16';
            const topSelBits = totalBlocks === 4 ? `address[12..13]` : `address[${addrWidth - 3}..${addrWidth - 1}]`;

            return (
              <g>
                {/* Title inside diagram */}
                <text x="380" y="60" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold" className="font-mono">
                  {chip.id} Structural Decomposition ({capacityText})
                </text>
                <text x="380" y="75" textAnchor="middle" fill="#64748b" fontSize="9" className="font-mono">
                  Address Demultiplexer ➔ Memory Array ({totalBlocks} x {subChipType}) ➔ Output Multiplexer
                </text>

                {/* 1. INPUT BUS WIRES */}

                {/* Data Input Bus: in[16] */}
                <path d="M 180 90 L 315 90" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
                <polygon points="315,90 309,87 309,93" fill="#38bdf8" />

                {/* Load Write Enable Signal */}
                <path d="M 180 190 L 210 190" stroke="#f43f5e" strokeWidth="2" fill="none" />
                <polygon points="210,190 204,187 204,193" fill="#f43f5e" />

                {/* Address Bus */}
                <path d="M 180 290 L 245 290 L 245 235" stroke="#a855f7" strokeWidth="2.5" fill="none" />
                <polygon points="245,235 242,241 248,241" fill="#a855f7" />
                <path d="M 245 290 L 515 290 L 515 235" stroke="#a855f7" strokeWidth="2.5" fill="none" />
                <polygon points="515,235 512,241 518,241" fill="#a855f7" />
                <circle cx="245" cy="290" r="3" fill="#a855f7" />

                {/* 2. MODULE A: Address Decoder (DMux) */}
                <rect x="210" y="145" width="70" height="90" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
                <text x="245" y="180" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold" className="font-mono">
                  {dmuxName}
                </text>
                <text x="245" y="195" textAnchor="middle" fill="#64748b" fontSize="7" className="font-mono">
                  sel={topSelBits}
                </text>

                {/* Load outputs from DMux to Memory Blocks */}
                <path d="M 280 190 L 315 190" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
                <polygon points="315,190 310,187 310,193" fill="#f43f5e" />

                {/* 3. MODULE B: Memory Blocks Array (Central Column) */}
                <rect x="315" y="85" width="135" height="260" rx="10" fill="#0b1220" stroke="#22d3ee" strokeWidth="1.5" />
                <rect x="315" y="85" width="135" height="22" rx="8" fill="#162238" />
                <text x="382" y="100" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="bold" className="font-mono">
                  MEMORY CORE
                </text>

                {/* Stacked Sub-Blocks */}
                {Array.from({ length: totalBlocks }, (_, i) => {
                  const start = i * rangeSize;
                  const end = (i + 1) * rangeSize - 1;
                  const rangeText = rangeSize === 1 ? `Word ${i}` : `[${start}..${end}]`;

                  if (totalBlocks === 4) {
                    const sy = 118 + i * 54;
                    return (
                      <g key={i}>
                        <rect x="323" y={sy} width="119" height="44" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
                        <text x="331" y={sy + 18} fill="#38bdf8" fontSize="10" fontWeight="bold" className="font-mono">
                          {subChipType}_{i}
                        </text>
                        <text x="331" y={sy + 34} fill="#64748b" fontSize="8" className="font-mono">
                          Addr {rangeText}
                        </text>
                        <circle cx="430" cy={sy + 22} r="3" fill="#22d3ee" />
                      </g>
                    );
                  }

                  const sy = 112 + i * 28;
                  return (
                    <g key={i}>
                      <rect x="323" y={sy} width="119" height="23" rx="5" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
                      <text x="331" y={sy + 15} fill="#38bdf8" fontSize="9" fontWeight="bold" className="font-mono">
                        {subChipType}_{i}
                      </text>
                      <text x="435" y={sy + 15} textAnchor="end" fill="#64748b" fontSize="8" className="font-mono">
                        {rangeText}
                      </text>
                    </g>
                  );
                })}

                {/* 4. MODULE C: Output Multiplexer (Mux) */}
                <path d="M 450 190 L 480 190" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
                <polygon points="480,190 474,187 474,193" fill="#38bdf8" />

                <rect x="480" y="145" width="70" height="90" rx="8" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
                <text x="515" y="180" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold" className="font-mono">
                  {muxName}
                </text>
                <text x="515" y="195" textAnchor="middle" fill="#64748b" fontSize="7" className="font-mono">
                  sel={topSelBits}
                </text>

                {/* 5. DATA OUTPUT BUS */}
                <path d="M 550 190 L 580 190" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
                <polygon points="580,190 574,187 574,193" fill="#38bdf8" />
              </g>
            );
          })()}

          {/* CASE: Or8Way Gate */}
          {chip.id === 'Or8Way' && (
            <g>
              {/* Column 1 OR Gates (OR1..OR4) */}
              <SubChipBox x={220} y={50} w={75} h={50} name="OR1" type="Or" />
              <SubChipBox x={220} y={130} w={75} h={50} name="OR2" type="Or" />
              <SubChipBox x={220} y={210} w={75} h={50} name="OR3" type="Or" />
              <SubChipBox x={220} y={290} w={75} h={50} name="OR4" type="Or" />

              {/* Column 2 OR Gates (OR5..OR6) */}
              <SubChipBox x={340} y={90} w={75} h={50} name="OR5" type="Or" />
              <SubChipBox x={340} y={250} w={75} h={50} name="OR6" type="Or" />

              {/* Column 3 OR Gate (OR7) - centered at Y=190 */}
              <SubChipBox x={460} y={160} w={80} h={60} name="OR7" type="Or" />

              {/* Wires from inputs at X=180 to Column 1 (OR1..OR4) */}
              <WirePath d="M 180 55 L 220 60" val={b0} />
              <WirePath d="M 180 95 L 220 90" val={b1} />

              <WirePath d="M 180 135 L 220 140" val={b2} />
              <WirePath d="M 180 175 L 220 170" val={b3} />

              <WirePath d="M 180 215 L 220 220" val={b4} />
              <WirePath d="M 180 255 L 220 250" val={b5} />

              <WirePath d="M 180 295 L 220 300" val={b6} />
              <WirePath d="M 180 335 L 220 325" val={b7} />

              {/* Wires from Col 1 to Col 2 */}
              <WirePath d="M 295 75 L 315 75 L 315 100 L 340 100" val={or1Val} />
              <WirePath d="M 295 155 L 315 155 L 315 130 L 340 130" val={or2Val} />

              <WirePath d="M 295 235 L 315 235 L 315 260 L 340 260" val={or3Val} />
              <WirePath d="M 295 315 L 315 315 L 315 290 L 340 290" val={or4Val} />

              {/* Wires from Col 2 to Col 3 */}
              <WirePath d="M 415 115 L 435 115 L 435 175 L 460 175" val={or5Val} />
              <WirePath d="M 415 275 L 435 275 L 435 205 L 460 205" val={or6Val} />

              {/* Output wire from OR7 to enclosure output (Y=190) */}
              <WirePath d="M 540 190 L 580 190" val={or7Val} />
            </g>
          )}

          {/* CASE: Mux4Way16 Gate */}
          {chip.id === 'Mux4Way16' && (
            <g>
              {/* Three MUX16 SubChips */}
              {/* Top-Left MUX16 */}
              <SubChipBox x={240} y={70} w={110} h={70} name="MUX16" type="Mux16" />
              {/* Bottom-Left MUX16 */}
              <SubChipBox x={240} y={200} w={110} h={70} name="MUX16" type="Mux16" />
              {/* Right MUX16 */}
              <SubChipBox x={430} y={125} w={110} h={90} name="MUX16" type="Mux16" />

              {/* Input Wires (Single clean bus lines aligned with port inputs) */}
              {/* Input 'a' -> Top MUX16 upper input (y=80) */}
              <path
                d="M 180 80 L 240 80"
                stroke={getSignalColor(inputA)}
                strokeWidth="3"
              />

              {/* Input 'b' -> Top MUX16 lower input (y=130) */}
              <path
                d="M 180 130 L 240 130"
                stroke={getSignalColor(inputB)}
                strokeWidth="3"
              />

              {/* Input 'c' -> Bottom MUX16 upper input (y=210) */}
              <path
                d="M 180 210 L 240 210"
                stroke={getSignalColor(inputC_Mux)}
                strokeWidth="3"
              />

              {/* Input 'd' -> Bottom MUX16 lower input (y=260) */}
              <path
                d="M 180 260 L 240 260"
                stroke={getSignalColor(inputD_Mux)}
                strokeWidth="3"
              />

              {/* Intermediate Bus Wires */}
              {/* Top MUX16 output (y=105) -> Right MUX16 upper input (y=145) */}
              <path
                d="M 350 105 L 390 105 L 390 145 L 430 145"
                stroke={getSignalColor(mux1Val)}
                strokeWidth="3"
                fill="none"
              />

              {/* Bottom MUX16 output (y=235) -> Right MUX16 lower input (y=195) */}
              <path
                d="M 350 235 L 390 235 L 390 195 L 430 195"
                stroke={getSignalColor(mux2Val)}
                strokeWidth="3"
                fill="none"
              />

              {/* Output Wire -> Right MUX16 output (y=170) to external pin */}
              <path
                d="M 540 170 L 580 170"
                stroke={getSignalColor(outMux4)}
                strokeWidth="3"
              />

              {/* Red Selector Lines (sel wire entering ONLY from bottom left) */}
              {/* Main vertical sel wire from bottom box up to split */}
              <path
                d="M 215 332 L 215 295"
                stroke={selVal4 ? '#f43f5e' : '#881337'}
                strokeWidth="2.5"
              />

              {/* sel[0] branch (Up to Top Mux16 select input y=140 and Bottom Mux16 select input y=270) */}
              <path
                d="M 215 295 L 215 140 L 240 140"
                stroke={sel0 ? '#f43f5e' : '#881337'}
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 215 270 L 240 270"
                stroke={sel0 ? '#f43f5e' : '#881337'}
                strokeWidth="2.5"
                fill="none"
              />
              <circle cx="215" cy="270" r="3.5" fill={sel0 ? '#f43f5e' : '#881337'} />

              {/* sel[1] branch (Right along y=295 to x=405 then Up to Right Mux16 select input y=215) */}
              <path
                d="M 215 295 L 405 295 L 405 215 L 430 215"
                stroke={sel1 ? '#f43f5e' : '#881337'}
                strokeWidth="2.5"
                fill="none"
              />
              <circle cx="215" cy="295" r="4" fill={selVal4 ? '#f43f5e' : '#881337'} />

              {/* Interactive sel selector button at bottom left */}
              <g
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextVal = (selVal4 + 1) % 4;
                  onToggleInputPin('sel', nextVal);
                }}
              >
                <rect
                  x="160"
                  y="332"
                  width="110"
                  height="30"
                  rx="6"
                  fill="#0f172a"
                  stroke={selVal4 ? '#f43f5e' : '#e11d48'}
                  strokeWidth="1.5"
                  className="transition-all group-hover:stroke-pink-400 group-hover:fill-[#1e1028]"
                />
                <text
                  x="215"
                  y="351"
                  textAnchor="middle"
                  fill={selVal4 ? '#f43f5e' : '#fb7185'}
                  fontSize="11"
                  fontWeight="bold"
                  className="font-mono"
                >
                  sel: {selVal4} ({['a', 'b', 'c', 'd'][selVal4]}) ▾
                </text>
              </g>
            </g>
          )}

          {/* CASE: Mux8Way16 Gate */}
          {chip.id === 'Mux8Way16' && (
            <g>
              {/* Three SubChips: Two MUX4WAY16, One MUX16 */}
              <SubChipBox x={240} y={62} w={120} h={98} name="MUX4WAY16" type="Mux4Way16" />
              <SubChipBox x={240} y={182} w={120} h={98} name="MUX4WAY16" type="Mux4Way16" />
              <SubChipBox x={430} y={125} w={110} h={90} name="MUX16" type="Mux16" />

              {/* Input Wires (Single clean bus lines for a..h) */}
              <path d="M 180 72 L 240 72" stroke={getSignalColor(inputA)} strokeWidth="3" />
              <path d="M 180 98 L 240 98" stroke={getSignalColor(inputB)} strokeWidth="3" />
              <path d="M 180 124 L 240 124" stroke={getSignalColor(inputC_Mux)} strokeWidth="3" />
              <path d="M 180 150 L 240 150" stroke={getSignalColor(inputD_Mux)} strokeWidth="3" />

              <path d="M 180 192 L 240 192" stroke={getSignalColor(inputE_Mux)} strokeWidth="3" />
              <path d="M 180 218 L 240 218" stroke={getSignalColor(inputF_Mux)} strokeWidth="3" />
              <path d="M 180 244 L 240 244" stroke={getSignalColor(inputG_Mux)} strokeWidth="3" />
              <path d="M 180 270 L 240 270" stroke={getSignalColor(inputH_Mux)} strokeWidth="3" />

              {/* Intermediate Bus Wires */}
              <path
                d="M 360 111 L 395 111 L 395 145 L 430 145"
                stroke={getSignalColor(mux8Sub1)}
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M 360 231 L 395 231 L 395 195 L 430 195"
                stroke={getSignalColor(mux8Sub2)}
                strokeWidth="3"
                fill="none"
              />

              {/* Output Wire */}
              <path
                d="M 540 170 L 580 170"
                stroke={getSignalColor(outMux8)}
                strokeWidth="3"
              />

              {/* Red Selector Lines for sel[0..2] */}
              <path
                d="M 215 332 L 215 295"
                stroke={selVal8 ? '#f43f5e' : '#881337'}
                strokeWidth="2.5"
              />

              {/* sel[0..1] branch to upper and lower MUX4WAY16 chips */}
              <path
                d="M 215 295 L 215 152 L 240 152"
                stroke={sel01 ? '#f43f5e' : '#881337'}
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 215 272 L 240 272"
                stroke={sel01 ? '#f43f5e' : '#881337'}
                strokeWidth="2.5"
                fill="none"
              />
              <circle cx="215" cy="272" r="3.5" fill={sel01 ? '#f43f5e' : '#881337'} />

              {/* sel[2] branch to right MUX16 chip */}
              <path
                d="M 215 295 L 405 295 L 405 205 L 430 205"
                stroke={sel2 ? '#f43f5e' : '#881337'}
                strokeWidth="2.5"
                fill="none"
              />
              <circle cx="215" cy="295" r="4" fill={selVal8 ? '#f43f5e' : '#881337'} />

              {/* Interactive sel selector button inside SVG */}
              <g
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextVal = (selVal8 + 1) % 8;
                  onToggleInputPin('sel', nextVal);
                }}
              >
                <rect
                  x="155"
                  y="332"
                  width="120"
                  height="30"
                  rx="6"
                  fill="#0f172a"
                  stroke={selVal8 ? '#f43f5e' : '#e11d48'}
                  strokeWidth="1.5"
                  className="transition-all group-hover:stroke-pink-400 group-hover:fill-[#1e1028]"
                />
                <text
                  x="215"
                  y="351"
                  textAnchor="middle"
                  fill={selVal8 ? '#f43f5e' : '#fb7185'}
                  fontSize="11"
                  fontWeight="bold"
                  className="font-mono"
                >
                  sel: {selVal8} ({['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][selVal8]}) ▾
                </text>
              </g>
            </g>
          )}

          {/* CASE: PC (Program Counter) - Clean rectangular chips styled like other diagrams with non-overlapping orthogonal wires */}
          {chip.id === 'PC' && (() => {
            const inVal = Number(inputs.in ?? 0);
            const loadVal = Number(inputs.load ?? 0);
            const incVal = Number(inputs.inc ?? 0);
            const resetVal = Number(inputs.reset ?? 0);
            const outVal = Number(outputs.out ?? 0);

            const incOut = (outVal + 1) & 0xffff;
            const mux1Out = incVal ? incOut : outVal;
            const mux2Out = loadVal ? inVal : mux1Out;
            const mux3Out = resetVal ? 0 : mux2Out;

            return (
              <g>
                {/* 1. TOP FEEDBACK LOOP WIRE (Register output -> Inc16 input & Mux 1 input 0) */}
                {/* Main feedback wire from Register output junction (568, 160) up to Y=48, left to X=200 */}
                <path
                  d="M 568 160 L 568 48 L 200 48 L 200 160 L 220 160"
                  stroke={getSignalColor(outVal)}
                  strokeWidth="2.5"
                  fill="none"
                />
                {/* Branch from feedback wire down to Mux 1 input 0 at (295, 145) */}
                <path
                  d="M 285 48 L 285 145 L 295 145"
                  stroke={getSignalColor(outVal)}
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle cx="285" cy="48" r="3.5" fill={getSignalColor(outVal)} />

                {/* 2. CHIP BLOCK 1: Inc16 */}
                <SubChipBox x={220} y={125} w={55} h={70} name="Inc16" type="Inc16" />
                {/* Clock icon inside Inc16 */}
                <polygon points="241,195 247.5,186 254,195" fill="none" stroke="#38bdf8" strokeWidth="1.5" />

                {/* Wire from Inc16 output (275, 160) to Mux 1 input 1 (295, 175) */}
                <path
                  d="M 275 160 L 285 160 L 285 175 L 295 175"
                  stroke={getSignalColor(incOut)}
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* 3. CHIP BLOCK 2: Mux 1 (inc) */}
                <SubChipBox x={295} y={125} w={50} h={70} name="Mux" type="inc" />
                <text x="298" y="148" textAnchor="start" fill="#94a3b8" fontSize="8" fontWeight="bold" className="font-mono">0</text>
                <text x="298" y="178" textAnchor="start" fill="#94a3b8" fontSize="8" fontWeight="bold" className="font-mono">1</text>

                {/* Wire from Mux 1 output (345, 160) to Mux 2 input 0 (365, 145) */}
                <path
                  d="M 345 160 L 352 160 L 352 145 L 365 145"
                  stroke={getSignalColor(mux1Out)}
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* 4. CHIP BLOCK 3: Mux 2 (load) */}
                <SubChipBox x={365} y={125} w={50} h={70} name="Mux" type="load" />
                <text x="368" y="148" textAnchor="start" fill="#94a3b8" fontSize="8" fontWeight="bold" className="font-mono">0</text>
                <text x="368" y="178" textAnchor="start" fill="#94a3b8" fontSize="8" fontWeight="bold" className="font-mono">1</text>

                {/* Wire from Mux 2 output (415, 160) to Mux 3 input 0 (435, 145) */}
                <path
                  d="M 415 160 L 425 160 L 425 145 L 435 145"
                  stroke={getSignalColor(mux2Out)}
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* 5. CHIP BLOCK 4: Mux 3 (reset) */}
                <SubChipBox x={435} y={125} w={50} h={70} name="Mux" type="reset" />
                <text x="438" y="148" textAnchor="start" fill="#94a3b8" fontSize="8" fontWeight="bold" className="font-mono">0</text>
                <text x="438" y="178" textAnchor="start" fill="#94a3b8" fontSize="8" fontWeight="bold" className="font-mono">1</text>

                {/* Constant '0' input wire to Mux 3 input 1 (435, 175) */}
                <path d="M 420 175 L 435 175" stroke="#64748b" strokeWidth="2" fill="none" />

                {/* Wire from Mux 3 output (485, 160) to Register input (505, 160) */}
                <path
                  d="M 485 160 L 505 160"
                  stroke={getSignalColor(mux3Out)}
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* 6. CHIP BLOCK 5: Register */}
                <SubChipBox x={505} y={125} w={55} h={70} name="Register" type="Register" />
                {/* Clock icon inside Register */}
                <polygon points="526,195 532.5,186 539,195" fill="none" stroke="#38bdf8" strokeWidth="1.5" />

                {/* Register load signal input at bottom (532.5, 195) */}
                <path d="M 532.5 220 L 532.5 195" stroke="#22c55e" strokeWidth="2" fill="none" />
                <text x="532.5" y="230" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold" className="font-mono">1</text>

                {/* 7. INPUT BUS & CONTROL WIRES */}
                {/* Input 'in' bus from (180, 90) -> right to X=360 -> down to Y=175 -> right to Mux 2 input 1 (365, 175) */}
                <path
                  d="M 180 90 L 360 90 L 360 175 L 365 175"
                  stroke={getSignalColor(inVal)}
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* Control Signal 'load' from (180, 170) -> down to Y=225 -> right to X=390 -> up to Mux 2 sel pin (390, 195) */}
                <path
                  d="M 180 170 L 190 170 L 190 225 L 390 225 L 390 195"
                  stroke={getSignalColor(loadVal)}
                  strokeWidth="2"
                  fill="none"
                />

                {/* Control Signal 'inc' from (180, 250) -> right to X=320 -> up to Mux 1 sel pin (320, 195) */}
                <path
                  d="M 180 250 L 320 250 L 320 195"
                  stroke={getSignalColor(incVal)}
                  strokeWidth="2"
                  fill="none"
                />

                {/* Control Signal 'reset' from (180, 325) -> right to X=460 -> up to Mux 3 sel pin (460, 195) */}
                <path
                  d="M 180 325 L 460 325 L 460 195"
                  stroke={getSignalColor(resetVal)}
                  strokeWidth="2"
                  fill="none"
                />

                {/* 8. REGISTER OUTPUT WIRE to enclosure output (580, 160) */}
                <path
                  d="M 560 160 L 580 160"
                  stroke={getSignalColor(outVal)}
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle cx="568" cy="160" r="3.5" fill={getSignalColor(outVal)} />
              </g>
            );
          })()}

          {/* CASE: Memory Chip (Data Memory with RAM16K, Screen, Keyboard) */}
          {chip.id === 'Memory' && (
            <g>
              {/* Outer Data Memory Box */}
              <rect x="240" y="75" width="280" height="280" rx="8" fill="#0a0f18" stroke="#38bdf8" strokeWidth="2" />
              <text x="380" y="98" textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="bold" className="font-mono">
                Data Memory
              </text>

              {/* Clock Triangle at Bottom */}
              <polygon points="373,355 380,345 387,355" fill="none" stroke="#38bdf8" strokeWidth="1.5" />

              {/* Inner Stacked Memory Blocks */}
              {/* RAM (16K) Block */}
              <rect x="295" y="112" width="150" height="110" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="370" y="158" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="bold" className="font-mono">
                RAM
              </text>
              <text x="370" y="176" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold" className="font-mono">
                (16K)
              </text>
              <text x="290" y="122" textAnchor="end" fill="#94a3b8" fontSize="9" fontWeight="bold" className="font-mono">
                0x0000
              </text>
              <text x="290" y="218" textAnchor="end" fill="#94a3b8" fontSize="9" fontWeight="bold" className="font-mono">
                0x3FFF
              </text>

              {/* Screen Memory Map (8K) Block */}
              <rect x="295" y="222" width="150" height="60" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="370" y="243" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold" className="font-mono">
                screen
              </text>
              <text x="370" y="257" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold" className="font-mono">
                memory map
              </text>
              <text x="370" y="271" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold" className="font-mono">
                (8K)
              </text>
              <text x="290" y="232" textAnchor="end" fill="#94a3b8" fontSize="9" fontWeight="bold" className="font-mono">
                0x4000
              </text>
              <text x="290" y="278" textAnchor="end" fill="#94a3b8" fontSize="9" fontWeight="bold" className="font-mono">
                0x5FFF
              </text>

              {/* Keyboard Memory Map Block */}
              <rect x="295" y="282" width="150" height="50" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="370" y="303" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold" className="font-mono">
                keyboard
              </text>
              <text x="370" y="317" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold" className="font-mono">
                memory map
              </text>
              <text x="290" y="292" textAnchor="end" fill="#94a3b8" fontSize="9" fontWeight="bold" className="font-mono">
                0x6000
              </text>

              {/* Right Output Peripherals */}
              {/* Screen Peripheral Block */}
              <rect x="458" y="232" width="54" height="40" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <text x="485" y="256" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" className="font-mono">
                screen
              </text>
              <path d="M 445 252 L 458 252" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
              <polygon points="453,249 458,252 453,255" fill="#38bdf8" />

              {/* Keyboard Peripheral Block */}
              <rect x="458" y="287" width="54" height="40" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <text x="485" y="311" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" className="font-mono">
                Keyboard
              </text>
              <path d="M 445 307 L 458 307" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
              <polygon points="453,304 458,307 453,310" fill="#38bdf8" />

              {/* Wires & Labels */}
              {/* 1. load Wire from top input pin (180, 50) -> (380, 50) -> (380, 75) */}
              <path d="M 180 50 L 380 50 L 380 75" stroke="#38bdf8" strokeWidth="2" fill="none" />
              <polygon points="376,69 380,75 384,69" fill="#38bdf8" />
              <text x="380" y="44" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold" className="font-mono">
                load
              </text>

              {/* 2. in Bus Wire from left input pin (180, 130) -> (240, 130) */}
              <path d="M 180 130 L 240 130" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
              <polygon points="234,126 240,130 234,134" fill="#38bdf8" />
              <path d="M 206 135 L 214 125" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="210" y="146" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" className="font-mono">
                16
              </text>

              {/* 3. address Bus Wire from left input pin (180, 270) -> (240, 270) */}
              <path d="M 180 270 L 240 270" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
              <polygon points="234,266 240,270 234,274" fill="#38bdf8" />
              <path d="M 206 275 L 214 265" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="210" y="286" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" className="font-mono">
                15
              </text>

              {/* 4. out Bus Wire from Data Memory right edge (520, 195) -> (580, 195) */}
              <path d="M 520 195 L 580 195" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
              <polygon points="574,191 580,195 574,199" fill="#38bdf8" />
              <path d="M 546 200 L 554 190" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="550" y="210" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" className="font-mono">
                16
              </text>
            </g>
          )}

          {/* CASE: Computer Chip (Hack Computer Implementation) */}
          {chip.id === 'Computer' && (
            <g>
              {/* ============================================================ */}
              {/* 1. ALL WIRES & PATHS (Rendered FIRST so they lie BEHIND chips) */}
              {/* ============================================================ */}

              {/* A. ROM32K -> CPU: instruction */}
              <path d="M 265 175 L 315 175" stroke="#38bdf8" strokeWidth="2" fill="none" />
              <polygon points="309,171 315,175 309,179" fill="#38bdf8" />

              {/* B. CPU -> Memory: writeM (loops over top to Memory top) */}
              <path d="M 395 130 L 415 130 L 415 62 L 490 62 L 490 95" stroke="#38bdf8" strokeWidth="2" fill="none" />
              <polygon points="486,89 490,95 494,89" fill="#38bdf8" />

              {/* C. CPU -> Memory: outM */}
              <path d="M 395 160 L 445 160" stroke="#38bdf8" strokeWidth="2" fill="none" />
              <polygon points="439,156 445,160 439,164" fill="#38bdf8" />

              {/* D. CPU -> Memory: addressM */}
              <path d="M 395 200 L 445 200" stroke="#38bdf8" strokeWidth="2" fill="none" />
              <polygon points="439,196 445,200 439,204" fill="#38bdf8" />

              {/* E. CPU -> ROM32K: pc (loops around bottom left to ROM32K left side) */}
              <path d="M 380 253 L 380 295 L 150 295 L 150 180 L 195 180" stroke="#38bdf8" strokeWidth="2" fill="none" />
              <polygon points="189,176 195,180 189,184" fill="#38bdf8" />

              {/* F. Memory -> CPU: inM (loops around top) */}
              <path d="M 515 95 L 515 48 L 300 48 L 300 130 L 315 130" stroke="#38bdf8" strokeWidth="2" fill="none" />
              <polygon points="309,126 315,130 309,134" fill="#38bdf8" />

              {/* G. Direct reset wire from bottom reset button (290, 338) -> (290, 230) -> CPU (315, 230) */}
              <path d="M 290 338 L 290 230 L 315 230" stroke="#38bdf8" strokeWidth="2" fill="none" />
              <polygon points="309,226 315,230 309,234" fill="#38bdf8" />

              {/* H. Peripheral Connection Wires going OUTSIDE the box to Screen & Keyboard */}
              <path d="M 535 131 L 595 131" stroke="#38bdf8" strokeWidth="2" fill="none" strokeDasharray="4 2" />
              <polygon points="590,127 595,131 590,135" fill="#38bdf8" />

              {/* Keyboard -> Memory (arrow points LEFT into Memory) */}
              <path d="M 595 231 L 535 231" stroke="#38bdf8" strokeWidth="2" fill="none" strokeDasharray="4 2" />
              <polygon points="541,227 535,231 541,235" fill="#38bdf8" />


              {/* ============================================================ */}
              {/* 2. SUBCHIP BOXES & SOLID BACKGROUNDS (Rendered ON TOP of wires) */}
              {/* ============================================================ */}

              {/* ROM32K Subchip */}
              <rect x="195" y="95" width="70" height="170" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />

              {/* CPU Subchip (Tapered trapezoid block, no checkmarks) */}
              <polygon points="315,95 395,110 395,250 315,265" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />

              {/* Memory Subchip (no checkmarks) */}
              <rect x="445" y="95" width="90" height="170" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />

              {/* Right Peripherals OUTSIDE the main enclosure box */}
              <rect x="595" y="110" width="115" height="42" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <rect x="595" y="210" width="115" height="42" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />

              {/* Bottom Interactive Reset Input Button */}
              <g className="cursor-pointer group" onClick={() => onToggleInputPin('reset', Number(inputs.reset ?? 0))}>
                <rect
                  x="245"
                  y="338"
                  width="90"
                  height="26"
                  rx="5"
                  fill={Number(inputs.reset) ? "rgba(34, 211, 238, 0.2)" : "#0f172a"}
                  stroke={Number(inputs.reset) ? "#22d3ee" : "#0284c7"}
                  strokeWidth="1.5"
                  className="transition-all group-hover:stroke-cyan-400"
                />
                <text
                  x="290"
                  y="355"
                  textAnchor="middle"
                  fill={Number(inputs.reset) ? "#ffffff" : "#38bdf8"}
                  fontSize="11"
                  fontWeight="bold"
                  className="font-mono"
                >
                  reset: {inputs.reset ?? 0}
                </text>
              </g>


              {/* ============================================================ */}
              {/* 3. TEXT LABELS & TITLES (Rendered ON TOP for crisp legibility) */}
              {/* ============================================================ */}

              {/* ROM32K text */}
              <text x="230" y="180" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="bold" className="font-mono">
                ROM32K
              </text>

              {/* CPU text */}
              <text x="355" y="180" textAnchor="middle" fill="#f8fafc" fontSize="14" fontWeight="bold" className="font-mono">
                CPU
              </text>

              {/* Memory text */}
              <text x="490" y="180" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="bold" className="font-mono">
                Memory
              </text>

              {/* Screen text (outside box) */}
              <text x="652" y="128" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" className="font-mono">
                Screen (8K)
              </text>
              <text x="652" y="141" textAnchor="middle" fill="#e0f2fe" fontSize="9" className="font-mono">
                0x4000 - 0x5FFF
              </text>

              {/* Keyboard text (outside box) */}
              <text x="652" y="228" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" className="font-mono">
                Keyboard
              </text>
              <text x="652" y="241" textAnchor="middle" fill="#e0f2fe" fontSize="9" className="font-mono">
                0x6000
              </text>

              {/* Wire Label Badges with dark text stroke for 100% legibility */}
              <text
                x="290"
                y="167"
                textAnchor="middle"
                fill="#38bdf8"
                stroke="#05070a"
                strokeWidth="3"
                paintOrder="stroke fill"
                fontSize="10"
                fontWeight="bold"
                className="font-mono"
              >
                instruction
              </text>

              <text
                x="452"
                y="56"
                textAnchor="middle"
                fill="#38bdf8"
                stroke="#05070a"
                strokeWidth="3"
                paintOrder="stroke fill"
                fontSize="10"
                fontWeight="bold"
                className="font-mono"
              >
                writeM
              </text>

              <text
                x="420"
                y="152"
                textAnchor="middle"
                fill="#38bdf8"
                stroke="#05070a"
                strokeWidth="3"
                paintOrder="stroke fill"
                fontSize="10"
                fontWeight="bold"
                className="font-mono"
              >
                outM
              </text>

              <text
                x="420"
                y="192"
                textAnchor="middle"
                fill="#38bdf8"
                stroke="#05070a"
                strokeWidth="3"
                paintOrder="stroke fill"
                fontSize="10"
                fontWeight="bold"
                className="font-mono"
              >
                addressM
              </text>

              <text
                x="300"
                y="225"
                textAnchor="middle"
                fill="#38bdf8"
                stroke="#05070a"
                strokeWidth="3"
                paintOrder="stroke fill"
                fontSize="10"
                fontWeight="bold"
                className="font-mono"
              >
                reset
              </text>

              <text
                x="322"
                y="300"
                textAnchor="middle"
                fill="#38bdf8"
                stroke="#05070a"
                strokeWidth="3"
                paintOrder="stroke fill"
                fontSize="10"
                fontWeight="bold"
                className="font-mono"
              >
                pc
              </text>

              <text
                x="407"
                y="42"
                textAnchor="middle"
                fill="#38bdf8"
                stroke="#05070a"
                strokeWidth="3"
                paintOrder="stroke fill"
                fontSize="10"
                fontWeight="bold"
                className="font-mono"
              >
                inM
              </text>
            </g>
          )}

          {/* DEFAULT / OTHER CHIPS (Add16, Inc16, ALU, etc.) */}
          {!['Nand', 'Not', 'And', 'Or', 'Xor', 'Mux', 'DMux', 'DMux4Way', 'DMux8Way', 'HalfAdder', 'FullAdder', 'Or8Way', 'Mux4Way16', 'Mux8Way16', 'Bit', 'Register', 'RAM8', 'RAM64', 'RAM512', 'RAM4K', 'RAM16K', 'PC', 'Memory', 'Computer'].includes(chip.id) && (
            <g>
              {/* Internal Gate Blocks in columns */}
              {chip.parts.length > 0 ? (
                chip.parts.map((part, idx) => {
                  const col = idx % 2;
                  const row = Math.floor(idx / 2);
                  const bx = 220 + col * 170;
                  const by = 80 + row * 85;

                  if (by + 70 > 340) return null;

                  return (
                    <g key={idx}>
                      <SubChipBox x={bx} y={by} w={140} h={65} name={part.name} type={part.type} />
                      {/* Connection wire from input */}
                      <WirePath d={`M 180 ${120 + idx * 40} L ${bx} ${by + 30}`} val={1} />
                      {/* Connection wire to output */}
                      <WirePath d={`M ${bx + 140} ${by + 30} L 580 ${120 + idx * 40}`} val={1} />
                    </g>
                  );
                })
              ) : (
                <g>
                  <rect x="250" y="100" width="260" height="160" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                  <text x="380" y="170" textAnchor="middle" fill="#22d3ee" fontSize="16" fontWeight="bold">
                    {chip.name} Internal Logic
                  </text>
                  <text x="380" y="195" textAnchor="middle" fill="#94a3b8" fontSize="11">
                    {chip.category === 'primitive' ? 'Hardware Primitive Gate' : 'Integrated Circuit Module'}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* EXTERNAL INPUT PINS (LEFT SIDE) */}
          {/* ------------------------------------------------------------------ */}
          {chip.id === 'Or8Way' ? (
            <g key="or8way_input_pins">
              {[b0, b1, b2, b3, b4, b5, b6, b7].map((bitVal, i) => {
                const py = 55 + i * 40;
                const isHigh = Boolean(bitVal);
                return (
                  <g
                    key={`or8way_pin_${i}`}
                    className="group cursor-pointer"
                    onClick={() => {
                      if (onToggleBit) {
                        onToggleBit('in', i);
                      } else {
                        onToggleInputPin('in', in8Val ^ (1 << i));
                      }
                    }}
                  >
                    {/* Wire to Enclosure */}
                    <path
                      d={`M 120 ${py} L 180 ${py}`}
                      stroke={getSignalColor(bitVal)}
                      strokeWidth="2"
                      className="transition-colors"
                    />

                    {/* Input Pin Button / Display Box */}
                    <rect
                      x="10"
                      y={py - 14}
                      width="110"
                      height="28"
                      rx="6"
                      fill={isHigh ? 'rgba(34, 211, 238, 0.2)' : '#0f172a'}
                      stroke={isHigh ? '#22d3ee' : '#334155'}
                      strokeWidth="1.5"
                      className="transition-all group-hover:stroke-cyan-400"
                    />
                    <text
                      x="65"
                      y={py + 4}
                      textAnchor="middle"
                      fill={isHigh ? '#ffffff' : '#94a3b8'}
                      fontSize="11"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      in[{i}]: {bitVal}
                    </text>

                    {/* Pin Port Circle on Enclosure */}
                    <circle cx="180" cy={py} r="4" fill={getSignalColor(bitVal)} />
                    <text x="190" y={py - 6} fill="#94a3b8" fontSize="9" className="font-mono">
                      in[{i}]
                    </text>
                  </g>
                );
              })}
            </g>
          ) : (
            (chip.id === 'Computer'
              ? []
              : ['Mux4Way16', 'Mux8Way16', 'DMux4Way', 'DMux8Way'].includes(chip.id)
                ? chip.inputs.filter((p) => p.name !== 'sel')
                : chip.inputs
            ).map((pin, idx) => {
              const isMux8 = chip.id === 'Mux8Way16';
              const py = getInputY(
                idx,
                chip.id === 'Mux4Way16' ? 4 : isMux8 ? 8 : chip.inputs.length
              );
              const isRam = chip.id.startsWith('RAM') || chip.id === 'Memory' || chip.id === 'Computer';
              const val = inputs[pin.name] ?? 0;
              const isHigh = Boolean(Number(val));
              const decimalText = isRam
                ? pin.busWidth > 1 ? `${pin.busWidth}-bit Bus` : '1-bit Signal'
                : getDecimalDisplay(pin.name, pin.busWidth, val);
              const boxHeight = isMux8 ? 22 : 32;
              const boxOffset = isMux8 ? 11 : 16;

              return (
                <g
                  key={pin.name}
                  className={isRam ? '' : 'group cursor-pointer'}
                  onClick={isRam ? undefined : () => onToggleInputPin(pin.name, Number(val))}
                >
                  {/* Wire to Enclosure */}
                  <path
                    d={`M 120 ${py} L 180 ${py}`}
                    stroke={isRam ? '#38bdf8' : getSignalColor(val)}
                    strokeWidth={pin.busWidth > 1 ? '3' : '2'}
                    className="transition-colors"
                  />

                  {/* Input Pin Button / Display Box */}
                  <rect
                    x="10"
                    y={py - boxOffset}
                    width="110"
                    height={boxHeight}
                    rx={isMux8 ? '5' : '6'}
                    fill={isRam ? '#0f172a' : isHigh ? 'rgba(34, 211, 238, 0.2)' : '#0f172a'}
                    stroke={isRam ? '#0284c7' : isHigh ? '#22d3ee' : '#334155'}
                    strokeWidth="1.5"
                    className={isRam ? '' : 'transition-all group-hover:stroke-cyan-400'}
                  />
                  <text
                    x="65"
                    y={py + (isMux8 ? 3.5 : 4)}
                    textAnchor="middle"
                    fill={isRam ? '#38bdf8' : isHigh ? '#ffffff' : '#94a3b8'}
                    fontSize={isMux8 ? '10' : '11'}
                    fontWeight="bold"
                    className="font-mono"
                  >
                    {chip.id === 'Computer' ? `${pin.name}: 1-bit Signal` : `${pin.name}: ${decimalText}`}
                  </text>

                  {/* Pin Port Circle on Enclosure */}
                  <circle cx="180" cy={py} r="4" fill={isRam ? '#38bdf8' : getSignalColor(val)} />
                  <text
                    x={chip.id === 'PC' && pin.name === 'load' ? 192 : 190}
                    y={chip.id === 'PC' && pin.name === 'load' ? py + 15 : py - (isMux8 ? 5 : 7)}
                    fill="#94a3b8"
                    fontSize={isMux8 ? '9' : '10'}
                    className="font-mono"
                  >
                    {pin.name}
                  </text>
                </g>
              );
            })
          )}

          {/* ------------------------------------------------------------------ */}
          {/* EXTERNAL OUTPUT PINS (RIGHT SIDE) */}
          {/* ------------------------------------------------------------------ */}
          {chip.outputs.map((pin, idx) => {
            const py = getOutputY(idx, chip.outputs.length);
            const isRam = chip.id.startsWith('RAM') || chip.id === 'Memory';
            const val = outputs[pin.name] ?? 0;
            const isHigh = Boolean(Number(val));
            const decimalText = isRam
              ? `${pin.busWidth}-bit Bus`
              : getDecimalDisplay(pin.name, pin.busWidth, val);

            return (
              <g key={pin.name}>
                {/* Wire from Enclosure */}
                <path
                  d={`M 580 ${py} L 650 ${py}`}
                  stroke={isRam ? '#38bdf8' : getSignalColor(val)}
                  strokeWidth={pin.busWidth > 1 ? '3' : '2'}
                  className="transition-colors"
                />

                {/* Pin Port Circle on Enclosure */}
                <circle cx="580" cy={py} r="4" fill={isRam ? '#38bdf8' : getSignalColor(val)} />
                <text x="570" y={py - 7} textAnchor="end" fill="#94a3b8" fontSize="10" className="font-mono">
                  {pin.name}
                </text>

                {/* Output Monitor Box */}
                <rect
                  x="650"
                  y={py - 16}
                  width="100"
                  height="32"
                  rx="6"
                  fill={isRam ? '#0f172a' : isHigh ? 'rgba(52, 211, 153, 0.2)' : '#0f172a'}
                  stroke={isRam ? '#0284c7' : isHigh ? '#34d399' : '#334155'}
                  strokeWidth="1.5"
                />
                <text
                  x="700"
                  y={py + 4}
                  textAnchor="middle"
                  fill={isRam ? '#38bdf8' : isHigh ? '#34d399' : '#64748b'}
                  fontSize="11"
                  fontWeight="bold"
                  className="font-mono"
                >
                  {pin.name}: {decimalText}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {(!chip.id.startsWith('RAM') && chip.id !== 'Memory' && chip.id !== 'Computer') && (
        <div className="mt-2 text-center text-[11px] text-slate-400 font-mono flex items-center justify-center space-x-4">
          <span><strong className="text-cyan-400">Inputs:</strong> Click input pin boxes on left to toggle state</span>
          <span>•</span>
          <span><strong className="text-cyan-400">Outputs:</strong> Real-time hardware propagation</span>
        </div>
      )}
    </div>
  );
};
