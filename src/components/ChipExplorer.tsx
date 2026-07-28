import React, { useState, useEffect } from 'react';
import { CHIP_DATABASE } from '../data/hdlDatabase';
import { HdlViewer } from './HdlViewer';
import { TruthTable } from './TruthTable';
import { InteractiveCircuit } from './InteractiveCircuit';
import {
  evalNand, evalNot, evalAnd, evalOr, evalXor, evalMux, evalDMux,
  evalNot16, evalAnd16, evalOr16, evalMux16, evalOr8Way, evalMux4Way16, evalMux8Way16, evalDMux4Way, evalDMux8Way,
  evalHalfAdder, evalFullAdder, evalAdd16, evalInc16, evalALU, formatValue
} from '../utils/logicSimulator';
import { ArrowLeft, Play, RefreshCw, Cpu, Settings2, Info } from 'lucide-react';

interface ChipExplorerProps {
  selectedChipId: string;
  onSelectChip: (chipId: string) => void;
  onBackToTree?: () => void;
}

export const ChipExplorer: React.FC<ChipExplorerProps> = ({ selectedChipId, onSelectChip, onBackToTree }) => {
  // If ALU or CPU is somehow selected while on ChipExplorer, immediately redirect to their dedicated pages
  useEffect(() => {
    if (selectedChipId === 'ALU') {
      onSelectChip('ALU');
    } else if (selectedChipId === 'CPU') {
      onSelectChip('CPU');
    }
  }, [selectedChipId, onSelectChip]);

  if (selectedChipId === 'ALU' || selectedChipId === 'CPU') {
    return null;
  }

  const chip = CHIP_DATABASE[selectedChipId] || CHIP_DATABASE['Nand'];

  // Local state for inputs & state
  const [inputs, setInputs] = useState<Record<string, number | number[] | boolean>>({});
  const [sequentialState, setSequentialState] = useState<number>(0); // For DFF / Bit / Register / PC
  const [ramState, setRamState] = useState<Record<number, number>>({}); // Memory store per address for RAM chips

  // Initialize inputs when selectedChipId changes
  useEffect(() => {
    const initInputs: Record<string, number | number[] | boolean> = {};
    const initRam: Record<number, number> = {};
    chip.inputs.forEach((pin) => {
      if (chip.defaultInputs && chip.defaultInputs[pin.name] !== undefined) {
        initInputs[pin.name] = chip.defaultInputs[pin.name];
      } else {
        initInputs[pin.name] = 0;
      }
    });
    if (chip.id.startsWith('RAM') && chip.defaultInputs) {
      const defaultAddr = Number(chip.defaultInputs.address || 0);
      const defaultIn = Number(chip.defaultInputs.in || 0);
      if (chip.defaultInputs.load) {
        initRam[defaultAddr] = defaultIn;
      }
    }
    setInputs(initInputs);
    setSequentialState(0);
    setRamState(initRam);
  }, [selectedChipId]);

  // Compute live outputs based on selected chip and inputs
  const computeOutputs = (): Record<string, number> => {
    const res: Record<string, number> = {};

    try {
      if (chip.id === 'Nand') {
        res.out = evalNand(Number(inputs.a || 0), Number(inputs.b || 0));
      } else if (chip.id === 'Not') {
        res.out = evalNot(Number(inputs.in || 0));
      } else if (chip.id === 'And') {
        res.out = evalAnd(Number(inputs.a || 0), Number(inputs.b || 0));
      } else if (chip.id === 'Or') {
        res.out = evalOr(Number(inputs.a || 0), Number(inputs.b || 0));
      } else if (chip.id === 'Xor') {
        res.out = evalXor(Number(inputs.a || 0), Number(inputs.b || 0));
      } else if (chip.id === 'Mux') {
        res.out = evalMux(Number(inputs.a || 0), Number(inputs.b || 0), Number(inputs.sel || 0));
      } else if (chip.id === 'DMux') {
        const dm = evalDMux(Number(inputs.in || 0), Number(inputs.sel || 0));
        res.a = dm.a;
        res.b = dm.b;
      } else if (chip.id === 'Not16') {
        res.out = evalNot16(Number(inputs.in || 0));
      } else if (chip.id === 'And16') {
        res.out = evalAnd16(Number(inputs.a || 0), Number(inputs.b || 0));
      } else if (chip.id === 'Or16') {
        res.out = evalOr16(Number(inputs.a || 0), Number(inputs.b || 0));
      } else if (chip.id === 'Mux16') {
        res.out = evalMux16(Number(inputs.a || 0), Number(inputs.b || 0), Number(inputs.sel || 0));
      } else if (chip.id === 'Or8Way') {
        res.out = evalOr8Way(Number(inputs.in || 0));
      } else if (chip.id === 'Mux4Way16') {
        res.out = evalMux4Way16(
          Number(inputs.a || 0), Number(inputs.b || 0), Number(inputs.c || 0), Number(inputs.d || 0),
          Number(inputs.sel || 0)
        );
      } else if (chip.id === 'Mux8Way16') {
        res.out = evalMux8Way16(
          Number(inputs.a || 0), Number(inputs.b || 0), Number(inputs.c || 0), Number(inputs.d || 0),
          Number(inputs.e || 0), Number(inputs.f || 0), Number(inputs.g || 0), Number(inputs.h || 0),
          Number(inputs.sel || 0)
        );
      } else if (chip.id === 'DMux4Way') {
        const dm = evalDMux4Way(Number(inputs.in || 0), Number(inputs.sel || 0));
        res.a = dm.a; res.b = dm.b; res.c = dm.c; res.d = dm.d;
      } else if (chip.id === 'DMux8Way') {
        const dm = evalDMux8Way(Number(inputs.in || 0), Number(inputs.sel || 0));
        Object.assign(res, dm);
      } else if (chip.id === 'HalfAdder') {
        const ha = evalHalfAdder(Number(inputs.a || 0), Number(inputs.b || 0));
        res.sum = ha.sum; res.carry = ha.carry;
      } else if (chip.id === 'FullAdder') {
        const fa = evalFullAdder(Number(inputs.a || 0), Number(inputs.b || 0), Number(inputs.c || 0));
        res.sum = fa.sum; res.carry = fa.carry;
      } else if (chip.id === 'Add16') {
        res.out = evalAdd16(Number(inputs.a || 0), Number(inputs.b || 0));
      } else if (chip.id === 'Inc16') {
        res.out = evalInc16(Number(inputs.in || 0));
      } else if (chip.id === 'ALU') {
        const alu = evalALU(
          Number(inputs.x || 0), Number(inputs.y || 0),
          Number(inputs.zx || 0), Number(inputs.nx || 0),
          Number(inputs.zy || 0), Number(inputs.ny || 0),
          Number(inputs.f || 0), Number(inputs.no || 0)
        );
        res.out = alu.out;
        res.zr = alu.zr ? 1 : 0;
        res.ng = alu.ng ? 1 : 0;
      } else if (['RAM8', 'RAM64', 'RAM512', 'RAM4K', 'RAM16K'].includes(chip.id)) {
        const addrVal = Number(inputs.address || 0);
        res.out = ramState[addrVal] ?? 0;
      } else if (['DFF', 'Bit', 'Register', 'PC'].includes(chip.id)) {
        res.out = sequentialState;
      } else {
        res.out = 0;
      }
    } catch (e) {
      console.error(e);
    }

    return res;
  };

  const outputs = computeOutputs();

  const syncRamValueIfNeeded = (newInputs: Record<string, number | number[] | boolean>) => {
    if (chip.id.startsWith('RAM')) {
      const loadVal = Number(newInputs.load ?? 0);
      if (loadVal) {
        const addrVal = Number(newInputs.address || 0);
        const inVal = Number(newInputs.in || 0);
        setRamState((prev) => ({ ...prev, [addrVal]: inVal }));
      }
    }
  };

  const handleToggleInput = (pinName: string, targetVal: number) => {
    const pin = chip.inputs.find((p) => p.name === pinName);
    if (!pin) return;

    if (pin.busWidth === 1) {
      setInputs((prev) => {
        const nextVal = targetVal ? 0 : 1;
        const next = { ...prev, [pinName]: nextVal };
        syncRamValueIfNeeded(next);
        return next;
      });
    } else {
      const currentVal = Number(inputs[pinName] || 0);
      let nextVal = targetVal;
      if (targetVal === currentVal) {
        const maxVal = (1 << Math.min(pin.busWidth, 16)) - 1;
        nextVal = (currentVal + 1) & maxVal;
      }
      setInputs((prev) => {
        const next = { ...prev, [pinName]: nextVal };
        syncRamValueIfNeeded(next);
        return next;
      });
    }
  };

  const handleToggleBit = (pinName: string, bitIdx: number) => {
    setInputs((prev) => {
      const currentVal = Number(prev[pinName] || 0);
      const mask = (1 << bitIdx) >>> 0;
      const newVal = (currentVal ^ mask) >>> 0;
      const next = { ...prev, [pinName]: newVal };
      syncRamValueIfNeeded(next);
      return next;
    });
  };

  const handleNumericInputChange = (pinName: string, valStr: string) => {
    let num = parseInt(valStr, 10);
    if (isNaN(num)) num = 0;
    setInputs((prev) => {
      const next = { ...prev, [pinName]: num };
      syncRamValueIfNeeded(next);
      return next;
    });
  };

  // Clock Pulse handler for sequential logic chips
  const handleClockPulse = () => {
    const inVal = Number(inputs.in || 0);
    const loadVal = Number(inputs.load ?? 1);
    const resetVal = Number(inputs.reset || 0);
    const incVal = Number(inputs.inc || 0);

    if (chip.id === 'DFF' || chip.id === 'Bit' || chip.id === 'Register') {
      if (loadVal) {
        setSequentialState(inVal);
      }
    } else if (chip.id.startsWith('RAM')) {
      const addrVal = Number(inputs.address || 0);
      if (loadVal) {
        setRamState((prev) => ({
          ...prev,
          [addrVal]: inVal,
        }));
      }
    } else if (chip.id === 'PC') {
      let nextState = sequentialState;
      if (incVal) nextState = (nextState + 1) & 0xFFFF;
      if (loadVal) nextState = inVal;
      if (resetVal) nextState = 0;
      setSequentialState(nextState);
    }
  };

  const isRamChip = ['RAM8', 'RAM64', 'RAM512', 'RAM4K', 'RAM16K'].includes(chip.id);
  const isMemoryChip = chip.id === 'Memory';
  const isComputerChip = chip.id === 'Computer';

  const hideSignalControls = isRamChip;
  const hideComputedResults = isRamChip || isMemoryChip || isComputerChip;
  const showTruthTable = ['Nand', 'Not', 'And', 'Or', 'Xor', 'Mux', 'DMux', 'HalfAdder', 'FullAdder'].includes(chip.id);

  const hasLeftColumnContent = !hideSignalControls || !hideComputedResults || chip.parts.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Navigation Breadcrumb */}
      {onBackToTree && (
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-[#080c14] px-4 py-2.5 rounded-xl border border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">{chip.categoryName}</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-bold">{chip.name}.hdl</span>
          </div>

          <button
            onClick={onBackToTree}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 font-mono font-bold text-xs flex items-center space-x-2 shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Go to Tree View</span>
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-[#0a0f18] rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-3 py-1 rounded bg-cyan-500/10 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/20">
              {chip.categoryName}
            </span>
            <span className="text-slate-400 text-xs font-mono">
              {chip.inputs.length} Inputs / {chip.outputs.length} Outputs
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight flex items-center space-x-3">
            <span>CHIP {chip.name}</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400">{chip.description}</p>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Controls & Output Monitor */}
        {hasLeftColumnContent && (
          <div className="lg:col-span-4 space-y-6">
            
            {/* Inputs Panel */}
            {!hideSignalControls && (
              <div className="bg-[#080c14] rounded-2xl p-5 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <Settings2 className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Signal Controls (IN)
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Live Toggle</span>
                </div>

                <div className="space-y-3">
                  {['Not16', 'And16', 'Or16'].includes(chip.id) ? (
                    <div className="p-3.5 rounded-xl bg-[#0c121d] border border-cyan-500/30 text-xs font-mono text-cyan-300 space-y-1">
                      <p className="font-bold">16-Bit Interactive Input Grid</p>
                      <p className="text-[11px] text-slate-400">
                        Use the 16-Bit Bit Grid inside the main schematic diagram on the right to toggle individual bits [15..0] or enter values.
                      </p>
                    </div>
                  ) : (chip.id.startsWith('RAM') || chip.id === 'Memory' || chip.id === 'Computer') ? (
                    <div className="p-4 rounded-xl bg-[#0c121d] border border-cyan-500/30 space-y-3 font-mono">
                      <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        <span>STATIC SPECIFICATION VIEW</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {chip.id === 'Computer'
                          ? 'This Hack Computer chip integrates ROM32K instruction memory, CPU, and Memory data RAM into a complete Harvard computer architecture.'
                          : `This ${chip.id} chip is displayed as a static architectural diagram illustrating memory mapping across RAM (16K), Screen (8K), and Keyboard memory.`}
                      </p>
                      <div className="text-[11px] text-slate-400 space-y-2 bg-[#05070a] p-3 rounded-lg border border-white/5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Architecture:</span>
                          <span className="text-slate-300">
                            {chip.id === 'Computer' ? 'Hack Computer Harvard Architecture' : 'Memory-Mapped I/O Bank'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    chip.inputs.map((pin) => {
                      const val = inputs[pin.name] ?? 0;

                      if (pin.busWidth === 1) {
                        return (
                          <div
                            key={pin.name}
                            className="p-3 rounded-xl bg-[#0c121d] border border-white/10 flex items-center justify-between hover:border-cyan-500/30 transition-colors"
                          >
                            <div>
                              <span className="font-mono text-xs font-bold text-white">{pin.name}</span>
                              <span className="text-[10px] text-slate-500 ml-2 font-mono">(1-bit)</span>
                            </div>

                            <button
                              onClick={() => handleToggleInput(pin.name, Number(val))}
                              className={`w-20 py-1.5 rounded text-xs font-mono font-bold transition-all shadow-sm ${
                                Number(val)
                                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                                  : 'bg-[#111827] text-slate-400 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {Number(val) ? 'HIGH (1)' : 'LOW (0)'}
                            </button>
                          </div>
                        );
                      }

                      // 2-bit or 3-bit Selector Dropdown for sel pin
                      if (pin.name === 'sel' && pin.busWidth === 2) {
                        return (
                          <div key={pin.name} className="p-3.5 rounded-xl bg-[#0c121d] border border-cyan-500/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-white">{pin.name}</span>
                              <span className="text-[10px] text-cyan-400 font-mono">2-bit Selector (0..3)</span>
                            </div>

                            <select
                              value={Number(val) & 3}
                              onChange={(e) => handleNumericInputChange(pin.name, e.target.value)}
                              className="w-full bg-[#05070a] border border-cyan-500/50 rounded-lg px-3 py-2 text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                            >
                              <option value={0}>0 (00) ➔ Select Input 'a'</option>
                              <option value={1}>1 (01) ➔ Select Input 'b'</option>
                              <option value={2}>2 (10) ➔ Select Input 'c'</option>
                              <option value={3}>3 (11) ➔ Select Input 'd'</option>
                            </select>

                            <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-0.5">
                              <span>Selected Value: {Number(val) & 3}</span>
                              <span>sel[1..0] = {((Number(val) >> 1) & 1)}{((Number(val) >> 0) & 1)}</span>
                            </div>
                          </div>
                        );
                      }

                      if (pin.name === 'sel' && pin.busWidth === 3) {
                        return (
                          <div key={pin.name} className="p-3.5 rounded-xl bg-[#0c121d] border border-cyan-500/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-white">{pin.name}</span>
                              <span className="text-[10px] text-cyan-400 font-mono">3-bit Selector (0..7)</span>
                            </div>

                            <select
                              value={Number(val) & 7}
                              onChange={(e) => handleNumericInputChange(pin.name, e.target.value)}
                              className="w-full bg-[#05070a] border border-cyan-500/50 rounded-lg px-3 py-2 text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                            >
                              <option value={0}>0 (000) ➔ Choose 'a'</option>
                              <option value={1}>1 (001) ➔ Choose 'b'</option>
                              <option value={2}>2 (010) ➔ Choose 'c'</option>
                              <option value={3}>3 (011) ➔ Choose 'd'</option>
                              <option value={4}>4 (100) ➔ Choose 'e'</option>
                              <option value={5}>5 (101) ➔ Choose 'f'</option>
                              <option value={6}>6 (110) ➔ Choose 'g'</option>
                              <option value={7}>7 (111) ➔ Choose 'h'</option>
                            </select>

                            <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-0.5">
                              <span>Selected Value: {Number(val) & 7}</span>
                              <span>sel[2..0] = {((Number(val) >> 2) & 1)}{((Number(val) >> 1) & 1)}{((Number(val) >> 0) & 1)}</span>
                            </div>
                          </div>
                        );
                      }

                      if (pin.name === 'address') {
                        const addrVal = Number(val) || 0;
                        const busWidth = pin.busWidth;
                        const maxAddr = Math.min((1 << Math.min(busWidth, 16)) - 1, 16383);

                        let rangeSize = 1;
                        let subChipCount = 8;
                        let subChipType = 'Register';
                        let activeIdx = 0;

                        if (chip.id === 'RAM8') {
                          activeIdx = addrVal & 7;
                          rangeSize = 1;
                          subChipCount = 8;
                          subChipType = 'Register';
                        } else if (chip.id === 'RAM64') {
                          activeIdx = (addrVal >> 3) & 7;
                          rangeSize = 8;
                          subChipCount = 8;
                          subChipType = 'RAM8';
                        } else if (chip.id === 'RAM512') {
                          activeIdx = (addrVal >> 6) & 7;
                          rangeSize = 64;
                          subChipCount = 8;
                          subChipType = 'RAM64';
                        } else if (chip.id === 'RAM4K') {
                          activeIdx = (addrVal >> 9) & 7;
                          rangeSize = 512;
                          subChipCount = 8;
                          subChipType = 'RAM512';
                        } else if (chip.id === 'RAM16K') {
                          activeIdx = (addrVal >> 12) & 3;
                          rangeSize = 4096;
                          subChipCount = 4;
                          subChipType = 'RAM4K';
                        }

                        return (
                          <div key={pin.name} className="p-3.5 rounded-xl bg-[#0c121d] border border-cyan-500/40 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-white">{pin.name}</span>
                              <span className="text-[10px] text-cyan-400 font-mono">
                                {busWidth}-bit Address Bus
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-mono text-slate-400">Addr:</span>
                              <input
                                type="number"
                                min={0}
                                max={maxAddr}
                                value={addrVal}
                                onChange={(e) => {
                                  let num = parseInt(e.target.value, 10);
                                  if (isNaN(num)) num = 0;
                                  num = Math.max(0, Math.min(num, maxAddr));
                                  handleNumericInputChange(pin.name, num.toString());
                                }}
                                className="w-full bg-[#05070a] border border-cyan-500/50 rounded px-3 py-1.5 text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                                placeholder="Enter decimal address..."
                              />
                            </div>

                            {subChipCount > 0 && (
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-slate-400">Target Sub-Module Block:</label>
                                <select
                                  value={activeIdx}
                                  onChange={(e) => {
                                    const selectedBlockIdx = parseInt(e.target.value, 10);
                                    const newAddr = selectedBlockIdx * rangeSize;
                                    handleNumericInputChange(pin.name, newAddr.toString());
                                  }}
                                  className="w-full bg-[#05070a] border border-white/10 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                                >
                                  {Array.from({ length: subChipCount }, (_, i) => {
                                    const start = i * rangeSize;
                                    const end = (i + 1) * rangeSize - 1;
                                    return (
                                      <option key={i} value={i}>
                                        {subChipType}_{i} ({rangeSize === 1 ? `Word ${i}` : `Addr ${start}..${end}`})
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                            )}

                            <div className="text-[10px] font-mono text-slate-400 bg-cyan-950/30 p-2 rounded border border-cyan-500/20 space-y-0.5">
                              <div className="flex justify-between text-cyan-300 font-bold">
                                <span>Selected Block:</span>
                                <span>{subChipType}_{activeIdx}</span>
                              </div>
                              <div className="flex justify-between text-slate-400">
                                <span>Binary Addr:</span>
                                <span>{formatValue(addrVal, busWidth).bin}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Multi-bit Bus Input (16-bit, 2-bit, etc.): Clean Decimal Input
                      const valFmt = formatValue(Number(val), pin.busWidth);
                      return (
                        <div key={pin.name} className="p-3.5 rounded-xl bg-[#0c121d] border border-white/10 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-white">{pin.name}</span>
                            <span className="text-[10px] text-cyan-400 font-mono">
                              {pin.busWidth}-bit Bus (Decimal)
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono text-slate-400">Dec:</span>
                            <input
                              type="number"
                              value={Number(val)}
                              onChange={(e) => handleNumericInputChange(pin.name, e.target.value)}
                              className="w-full bg-[#05070a] border border-white/10 rounded px-3 py-1.5 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-400"
                              placeholder="Decimal integer"
                            />
                          </div>

                          <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-1">
                            <span>Decimal: {valFmt.signed}</span>
                            <span>Binary: {valFmt.bin}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Outputs Monitor */}
            {!hideComputedResults && (
              <div className="bg-[#080c14] rounded-2xl p-5 border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Computed Results (OUT)
                    </h3>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Live State
                  </span>
                </div>

                <div className="space-y-3">
                  {chip.outputs.map((pin) => {
                    const val = outputs[pin.name] ?? 0;
                    const valFmt = formatValue(Number(val), pin.busWidth);

                    return (
                      <div key={pin.name} className="p-3.5 rounded-xl bg-[#0c121d] border border-white/10 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-white">{pin.name}</span>
                          <span className="font-mono text-sm font-bold text-cyan-400">
                            {pin.busWidth === 1 ? (Number(val) ? '1 (HIGH)' : '0 (LOW)') : `Decimal: ${valFmt.signed}`}
                          </span>
                        </div>

                        {pin.busWidth > 1 && (
                          <div className="text-[10px] font-mono text-slate-400 flex justify-between pt-1">
                            <span>Binary: {valFmt.bin}</span>
                            <span>Uint: {valFmt.uint}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-Parts Composition */}
            {chip.parts.length > 0 && (
              <div className="bg-[#080c14] rounded-2xl p-5 border border-white/10 shadow-xl space-y-3">
                <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Internal Sub-Gates</span>
                </h3>
                <p className="text-xs text-slate-400">
                  This chip is built by connecting the following gates together:
                </p>

                <div className="space-y-1.5 pt-1">
                  {chip.parts.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => onSelectChip(p.type)}
                      className="w-full text-left p-2.5 rounded bg-[#0c121d] hover:bg-white/5 border border-white/10 text-xs font-mono text-cyan-300 flex items-center justify-between group transition-colors"
                    >
                      <span>{p.name} ({p.type})</span>
                      <span className="text-[10px] text-slate-500 group-hover:text-cyan-400">Inspect &rarr;</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Right Column: Circuit Blueprint + HDL Code + Truth Table */}
        <div className={hasLeftColumnContent ? "lg:col-span-8 space-y-6" : "lg:col-span-12 space-y-6"}>
          
          {/* Interactive Circuit Canvas */}
          <InteractiveCircuit
            chip={chip}
            inputs={inputs}
            outputs={outputs}
            onToggleInputPin={handleToggleInput}
            onSelectSubChip={onSelectChip}
            onClockPulse={handleClockPulse}
            onToggleBit={handleToggleBit}
          />

          {/* HDL Code & Truth Table Grid */}
          {showTruthTable ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HdlViewer
                chipName={chip.name}
                hdl={chip.hdl}
                categoryName={chip.categoryName}
              />

              <TruthTable
                chipId={chip.id}
                currentInputs={inputs}
              />
            </div>
          ) : (
            <HdlViewer
              chipName={chip.name}
              hdl={chip.hdl}
              categoryName={chip.categoryName}
            />
          )}

        </div>

      </div>
    </div>
  );
};
