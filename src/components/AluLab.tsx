import React, { useState, useEffect } from 'react';
import { evalALU, formatValue } from '../utils/logicSimulator';
import { Calculator, ArrowRight, Zap, CheckCircle2, RotateCcw, FileCode } from 'lucide-react';
import { AluDiagram } from './AluDiagram';
import { HdlViewer } from './HdlViewer';
import { CHIP_DATABASE } from '../data/hdlDatabase';

export const AluLab: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const [x, setX] = useState<number>(27);
  const [y, setY] = useState<number>(15);

  const [zx, setZx] = useState<number>(0);
  const [nx, setNx] = useState<number>(0);
  const [zy, setZy] = useState<number>(0);
  const [ny, setNy] = useState<number>(0);
  const [f, setF]   = useState<number>(1);
  const [no, setNo] = useState<number>(0);

  const alu = evalALU(x, y, zx, nx, zy, ny, f, no);

  const formatOut = formatValue(alu.out, 16);
  const formatX = formatValue(x, 16);
  const formatY = formatValue(y, 16);

  const handleToggleControl = (controlName: 'zx' | 'nx' | 'zy' | 'ny' | 'f' | 'no') => {
    if (controlName === 'zx') setZx((prev) => (prev ? 0 : 1));
    if (controlName === 'nx') setNx((prev) => (prev ? 0 : 1));
    if (controlName === 'zy') setZy((prev) => (prev ? 0 : 1));
    if (controlName === 'ny') setNy((prev) => (prev ? 0 : 1));
    if (controlName === 'f')  setF((prev) => (prev ? 0 : 1));
    if (controlName === 'no') setNo((prev) => (prev ? 0 : 1));
  };

  // Preset Functions Table from Nand2Tetris Specification
  const PRESET_OPERATIONS = [
    { name: '0', zx: 1, nx: 0, zy: 1, ny: 0, f: 1, no: 0, desc: 'Output 0' },
    { name: '1', zx: 1, nx: 1, zy: 1, ny: 1, f: 1, no: 1, desc: 'Output 1' },
    { name: '-1', zx: 1, nx: 1, zy: 1, ny: 0, f: 1, no: 0, desc: 'Output -1' },
    { name: 'x', zx: 0, nx: 0, zy: 1, ny: 1, f: 0, no: 0, desc: 'Output x' },
    { name: 'y', zx: 1, nx: 1, zy: 0, ny: 0, f: 0, no: 0, desc: 'Output y' },
    { name: '!x', zx: 0, nx: 1, zy: 1, ny: 1, f: 0, no: 0, desc: 'Bitwise NOT x' },
    { name: '!y', zx: 1, nx: 1, zy: 0, ny: 1, f: 0, no: 0, desc: 'Bitwise NOT y' },
    { name: '-x', zx: 0, nx: 0, zy: 1, ny: 1, f: 1, no: 1, desc: 'Negate x (-x)' },
    { name: '-y', zx: 1, nx: 1, zy: 0, ny: 0, f: 1, no: 1, desc: 'Negate y (-y)' },
    { name: 'x + 1', zx: 0, nx: 1, zy: 1, ny: 1, f: 1, no: 1, desc: 'Increment x' },
    { name: 'y + 1', zx: 1, nx: 1, zy: 0, ny: 1, f: 1, no: 1, desc: 'Increment y' },
    { name: 'x - 1', zx: 0, nx: 0, zy: 1, ny: 1, f: 1, no: 0, desc: 'Decrement x' },
    { name: 'y - 1', zx: 1, nx: 1, zy: 0, ny: 0, f: 1, no: 0, desc: 'Decrement y' },
    { name: 'x + y', zx: 0, nx: 0, zy: 0, ny: 0, f: 1, no: 0, desc: 'Add x + y' },
    { name: 'x - y', zx: 0, nx: 1, zy: 0, ny: 0, f: 1, no: 1, desc: 'Subtract x - y' },
    { name: 'y - x', zx: 0, nx: 0, zy: 0, ny: 1, f: 1, no: 1, desc: 'Subtract y - x' },
    { name: 'x & y', zx: 0, nx: 0, zy: 0, ny: 0, f: 0, no: 0, desc: 'Bitwise AND' },
    { name: 'x | y', zx: 0, nx: 1, zy: 0, ny: 1, f: 0, no: 1, desc: 'Bitwise OR' }
  ];

  const applyPreset = (op: typeof PRESET_OPERATIONS[0]) => {
    setZx(op.zx); setNx(op.nx);
    setZy(op.zy); setNy(op.ny);
    setF(op.f);   setNo(op.no);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Intro Header */}
      <div className="bg-[#0a0f18] rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20 mb-2 font-mono">
            <Calculator className="w-3.5 h-3.5" />
            <span>Project 2: Arithmetic Logic Unit Lab</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
            16-Bit Hack ALU Laboratory
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Experiment with the 6 ALU control bits (<span className="text-cyan-400 font-bold font-mono">zx, nx, zy, ny, f, no</span>) to compute 18 fundamental arithmetic and logical functions.
          </p>
        </div>

        <button
          onClick={() => { setX(27); setY(15); setZx(0); setNx(0); setZy(0); setNy(0); setF(1); setNo(0); }}
          className="px-3.5 py-2 rounded bg-[#111827] hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 flex items-center space-x-2 self-start md:self-center transition-colors font-mono"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset ALU State</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Control Panel Column */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Inputs X & Y */}
          <div className="bg-[#080c14] rounded-2xl p-5 border border-white/10 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider text-slate-400">
              1. Input Buses (x, y)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#0c121d] rounded-xl border border-white/10 space-y-1">
                <label className="text-xs text-cyan-400 font-bold block">Input x</label>
                <input
                  type="number"
                  value={x}
                  onChange={(e) => setX(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#05070a] border border-white/10 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
                <div className="text-[10px] text-slate-500 pt-1">
                  HEX: {formatX.hex}
                </div>
              </div>

              <div className="p-3 bg-[#0c121d] rounded-xl border border-white/10 space-y-1">
                <label className="text-xs text-cyan-400 font-bold block">Input y</label>
                <input
                  type="number"
                  value={y}
                  onChange={(e) => setY(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#05070a] border border-white/10 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
                <div className="text-[10px] text-slate-500 pt-1">
                  HEX: {formatY.hex}
                </div>
              </div>
            </div>
          </div>

          {/* Control Bits Toggles */}
          <div className="bg-[#080c14] rounded-2xl p-5 border border-white/10 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider text-slate-400">
              2. Control Bits (zx, nx, zy, ny, f, no)
            </h3>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { name: 'zx', state: zx, set: setZx, desc: 'Zero x input' },
                { name: 'nx', state: nx, set: setNx, desc: 'Negate x input' },
                { name: 'zy', state: zy, set: setZy, desc: 'Zero y input' },
                { name: 'ny', state: ny, set: setNy, desc: 'Negate y input' },
                { name: 'f',  state: f,  set: setF,  desc: '0: x&y, 1: x+y' },
                { name: 'no', state: no, set: setNo, desc: 'Negate output' },
              ].map((ctrl) => (
                <button
                  key={ctrl.name}
                  onClick={() => ctrl.set(ctrl.state ? 0 : 1)}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                    ctrl.state
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                      : 'bg-[#0c121d] hover:bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <span className="text-sm">{ctrl.name} = {ctrl.state}</span>
                  <span className="text-[10px] text-slate-500 mt-1">{ctrl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Operations Matrix */}
          <div className="bg-[#080c14] rounded-2xl p-5 border border-white/10 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider text-slate-400">
              3. Preset Function Selector (18 Ops)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_OPERATIONS.map((op) => {
                const isActive =
                  zx === op.zx && nx === op.nx &&
                  zy === op.zy && ny === op.ny &&
                  f === op.f && no === op.no;

                return (
                  <button
                    key={op.name}
                    onClick={() => applyPreset(op)}
                    className={`p-2 rounded border text-xs font-mono text-center transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                        : 'bg-[#0c121d] hover:bg-white/5 border-white/10 text-slate-300'
                    }`}
                  >
                    <div>{op.name}</div>
                    <div className="text-[9px] text-slate-500 font-sans mt-0.5">{op.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Output & Pipeline View Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Hack ALU Schematic Diagram */}
          <AluDiagram
            x={x}
            y={y}
            zx={zx}
            nx={nx}
            zy={zy}
            ny={ny}
            f={f}
            no={no}
            out={alu.out}
            zr={alu.zr}
            ng={alu.ng}
            onToggleControl={handleToggleControl}
          />

          {/* Main ALU Result Box */}
          <div className="bg-[#080c14] rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">ALU Computed Result</span>
                <h3 className="text-3xl font-bold text-cyan-400 mt-1">
                  out = {formatOut.signed}
                </h3>
              </div>

              {/* Status Flags zr & ng */}
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl border text-center ${alu.zr ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold' : 'bg-[#05070a] border-white/10 text-slate-600'}`}>
                  <div className="text-[10px]">zr (Zero?)</div>
                  <div className="text-base">{alu.zr ? '1 (TRUE)' : '0'}</div>
                </div>

                <div className={`p-3 rounded-xl border text-center ${alu.ng ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold' : 'bg-[#05070a] border-white/10 text-slate-600'}`}>
                  <div className="text-[10px]">ng (Negative?)</div>
                  <div className="text-base">{alu.ng ? '1 (TRUE)' : '0'}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-mono">
              <div className="p-3 bg-[#0c121d] rounded-xl border border-white/10">
                <span className="text-slate-500 text-[10px]">HEXADECIMAL</span>
                <p className="text-white font-bold text-sm mt-0.5">{formatOut.hex}</p>
              </div>

              <div className="p-3 bg-[#0c121d] rounded-xl border border-white/10">
                <span className="text-slate-500 text-[10px]">BINARY (16-BIT)</span>
                <p className="text-white font-bold text-xs mt-0.5 tracking-wider">{formatOut.bin}</p>
              </div>
            </div>
          </div>

          {/* ALU Internal Pipeline Flow */}
          <div className="bg-[#080c14] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Internal ALU Processing Pipeline</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              {/* Step 1: Zeroing */}
              <div className="p-3 bg-[#0c121d] rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-bold">1. Zero Inputs:</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">x1 (zx={zx}) &rarr; {alu.steps.x1}, y1 (zy={zy}) &rarr; {alu.steps.y1}</p>
                </div>
                <span className="text-cyan-400 font-bold">zx, zy</span>
              </div>

              {/* Step 2: Negating */}
              <div className="p-3 bg-[#0c121d] rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-bold">2. Negate Inputs:</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">x2 (nx={nx}) &rarr; {alu.steps.x2}, y2 (ny={ny}) &rarr; {alu.steps.y2}</p>
                </div>
                <span className="text-cyan-400 font-bold">nx, ny</span>
              </div>

              {/* Step 3: Compute Function */}
              <div className="p-3 bg-[#0c121d] rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-bold">3. Core Function (f={f}):</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {f ? `x2 + y2 = ${alu.steps.xPLUSy}` : `x2 & y2 = ${alu.steps.xANDy}`} &rarr; out1: {alu.steps.out1}
                  </p>
                </div>
                <span className="text-cyan-400 font-bold">f</span>
              </div>

              {/* Step 4: Negate Output */}
              <div className="p-3 bg-[#0c121d] rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-slate-300 font-bold">4. Output Negation (no={no}):</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">finalOut &rarr; {alu.steps.finalOut}</p>
                </div>
                <span className="text-cyan-400 font-bold">no</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ALU Hardware Description Language (HDL) Source */}
      <div className="pt-6 border-t border-white/10 space-y-3">
        <div className="flex items-center space-x-2">
          <FileCode className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white font-mono">ALU.hdl Hardware Implementation</h3>
          <span className="text-xs text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
            Hardware Description Language
          </span>
        </div>
        <HdlViewer
          chipName={CHIP_DATABASE['ALU'].name}
          hdl={CHIP_DATABASE['ALU'].hdl}
          categoryName={CHIP_DATABASE['ALU'].categoryName}
        />
      </div>
    </div>
  );
};
