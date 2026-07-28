import React, { useState, useEffect, useRef } from 'react';
import { HackCpuState, SampleProgram } from '../types';
import { SAMPLE_PROGRAMS, parseAssembly, stepCpu, formatValue, isCpuHalted } from '../utils/logicSimulator';
import { Cpu, Play, Pause, SkipForward, RotateCcw, Code, Terminal, HardDrive, Check, Zap, Layers, CheckCircle2, Sparkles, Award, FileCode } from 'lucide-react';
import { HackCpuDiagram } from './HackCpuDiagram';
import { HdlViewer } from './HdlViewer';
import { CHIP_DATABASE } from '../data/hdlDatabase';

export const CpuComputerSimulator: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const [selectedProgram, setSelectedProgram] = useState<SampleProgram>(SAMPLE_PROGRAMS[0]);
  const [customAssembly, setCustomAssembly] = useState<string>(SAMPLE_PROGRAMS[0].assembly);
  const [assembledCode, setAssembledCode] = useState<number[]>(SAMPLE_PROGRAMS[0].machineCode);

  const [cpuState, setCpuState] = useState<HackCpuState>({
    aReg: 0,
    dReg: 0,
    pc: 0,
    memory: new Array(64).fill(0),
    rom: SAMPLE_PROGRAMS[0].machineCode,
    currentInstruction: 0,
    writeM: false,
    outM: 0,
    addressM: 0,
    zr: true,
    ng: false,
    cycleCount: 0
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runSpeed, setRunSpeed] = useState<number>(300); // ms per step
  const [assemblyError, setAssemblyError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load preset sample program
  const handleSelectProgram = (prog: SampleProgram) => {
    setSelectedProgram(prog);
    setCustomAssembly(prog.assembly);
    const code = parseAssembly(prog.assembly);
    setAssembledCode(code);
    resetComputer(code);
  };

  // Compile custom assembly
  const handleCompileAssembly = () => {
    try {
      setAssemblyError(null);
      const code = parseAssembly(customAssembly);
      setAssembledCode(code);
      resetComputer(code);
    } catch (e: any) {
      setAssemblyError('Syntax error in Hack assembly code.');
    }
  };

  // Reset Computer
  const resetComputer = (romCode?: number[]) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const code = romCode || assembledCode;
    setCpuState({
      aReg: 0,
      dReg: 0,
      pc: 0,
      memory: new Array(64).fill(0),
      rom: code,
      currentInstruction: code[0] || 0,
      writeM: false,
      outM: 0,
      addressM: 0,
      zr: true,
      ng: false,
      cycleCount: 0
    });
  };

  // Single step execution
  const handleStep = () => {
    setCpuState((prevState) => {
      if (isCpuHalted(prevState)) return prevState;
      const next = stepCpu(prevState);
      if (isCpuHalted(next)) {
        setIsRunning(false);
      }
      return next;
    });
  };

  // Run / Pause loop with auto-halt detection
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setCpuState((prev) => {
          if (isCpuHalted(prev)) {
            setIsRunning(false);
            return prev;
          }
          const next = stepCpu(prev);
          if (isCpuHalted(next)) {
            setIsRunning(false);
          }
          return next;
        });
      }, runSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, runSpeed]);

  const currentInstr = cpuState.rom[cpuState.pc] ?? 0;
  const isCInstr = (currentInstr & 0x8000) !== 0;
  const currentInstrFmt = formatValue(currentInstr, 16);
  const isHalted = isCpuHalted(cpuState);

  // Extract primary program output
  const ram0 = cpuState.memory[0] || 0;
  const ram1 = cpuState.memory[1] || 0;
  const ram2 = cpuState.memory[2] || 0;

  let primaryOutputVal = ram0;
  let resultLabel = 'RAM[0] (Result)';

  if (selectedProgram.id === 'sum') {
    primaryOutputVal = ram1;
    resultLabel = 'RAM[1] (Sum Total)';
  } else if (selectedProgram.id === 'mult') {
    primaryOutputVal = ram2;
    resultLabel = 'RAM[2] (Product Result)';
  }

  let programOutputExplanation = '';
  if (selectedProgram.id === 'add') {
    programOutputExplanation = `Addition Result: 17 + 25 = ${ram0} stored in RAM[0].`;
  } else if (selectedProgram.id === 'sum') {
    programOutputExplanation = `Sum 1..10 Result: 1 + 2 + ... + 10 = ${ram1} stored in RAM[1].`;
  } else if (selectedProgram.id === 'mult') {
    programOutputExplanation = `Multiplication Result: RAM[0] (${ram0}) × RAM[1] (${ram1}) = RAM[2] (${ram2}).`;
  } else if (selectedProgram.id === 'counter') {
    programOutputExplanation = `Continuous Counter: RAM[0] continuously increments (Current = ${ram0}).`;
  } else {
    programOutputExplanation = `Program output at RAM[0] = ${ram0}, RAM[2] = ${ram2}, last written M = ${cpuState.outM} at RAM[${cpuState.addressM}].`;
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Intro Header */}
      <div className="bg-[#0a0f18] rounded-2xl p-6 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20 mb-2 font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>Project 5: Hack Computer Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
            Live Hack CPU & Computer Simulator
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-sans">
            Execute machine code instructions step-by-step on your custom Hack CPU, complete with A & D Registers, ALU, PC, ROM, and RAM.
          </p>
        </div>
      </div>

      {/* Interactive Microarchitecture Diagram */}
      <HackCpuDiagram
        cpuState={cpuState}
        isRunning={isRunning}
        onToggleRun={() => setIsRunning(!isRunning)}
        onStep={handleStep}
        onReset={() => resetComputer()}
        runSpeed={runSpeed}
        onSpeedChange={setRunSpeed}
      />

      {/* Program Output & Execution Result Banner */}
      <div className={`rounded-2xl p-5 border transition-all shadow-2xl ${
        isHalted
          ? 'bg-[#061c16] border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
          : isRunning
          ? 'bg-[#081826] border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
          : 'bg-[#080c14] border-white/10'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-3">
            {isHalted ? (
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : isRunning ? (
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
                <Play className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-white/10">
                <Terminal className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold tracking-wider uppercase text-white font-mono">
                  {isHalted
                    ? 'Program Execution Finished & Halted'
                    : isRunning
                    ? 'Executing Machine Instructions...'
                    : 'Program Output Monitor'}
                </h3>
                {isHalted && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-black uppercase font-mono">
                    DONE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {isHalted
                  ? `CPU halted at PC @${cpuState.pc} in ${cpuState.cycleCount} clock cycles.`
                  : isRunning
                  ? `Cycle #${cpuState.cycleCount} — Clock speed: ${runSpeed}ms`
                  : 'Click RUN or STEP to execute code and view computed output.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-[#05070a] border border-white/10 text-xs">
              <span className="text-slate-500 mr-1">Cycles:</span>
              <span className="font-bold text-cyan-400">#{cpuState.cycleCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#05070a] border border-white/10 text-xs">
              <span className="text-slate-500 mr-1">Status:</span>
              <span className={`font-bold ${isHalted ? 'text-emerald-400' : isRunning ? 'text-cyan-400' : 'text-slate-400'}`}>
                {isHalted ? 'HALTED' : isRunning ? 'RUNNING' : 'STOPPED'}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Output Reading */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Computed Result Metric */}
          <div className="md:col-span-2 p-4 rounded-xl bg-[#03060a] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 uppercase tracking-wide font-bold flex items-center space-x-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${isHalted ? 'text-emerald-400' : 'text-cyan-400'}`} />
                  <span>Primary Computed Program Output</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {resultLabel}
                </span>
              </div>

              <div className="mt-2 flex items-baseline space-x-3">
                <span className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${
                  isHalted ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]' : 'text-cyan-300'
                }`}>
                  {formatValue(primaryOutputVal, 16).signed}
                </span>
                <div className="text-xs text-slate-400 space-y-0.5 font-mono">
                  <div>Hex: <span className="text-slate-200 font-bold">{formatValue(primaryOutputVal, 16).hex}</span></div>
                  <div>Binary: <span className="text-slate-200 font-bold">{formatValue(primaryOutputVal, 16).bin}</span></div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 text-xs text-slate-400 font-mono flex items-center space-x-2">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{programOutputExplanation}</span>
            </div>
          </div>

          {/* Key Memory Locations Summary */}
          <div className="p-4 rounded-xl bg-[#03060a] border border-white/10 space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wide font-bold block">
              Key Register Outputs
            </span>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between p-1.5 rounded bg-[#090d16] border border-white/5">
                <span className="text-cyan-400 font-bold">RAM[0]:</span>
                <span className="text-white font-bold">{formatValue(ram0, 16).signed}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-[#090d16] border border-white/5">
                <span className="text-purple-400 font-bold">RAM[1]:</span>
                <span className="text-white font-bold">{formatValue(ram1, 16).signed}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-[#090d16] border border-white/5">
                <span className="text-yellow-400 font-bold">RAM[2]:</span>
                <span className="text-white font-bold">{formatValue(ram2, 16).signed}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-[#090d16] border border-white/5">
                <span className="text-slate-400 font-bold">D-Register:</span>
                <span className="text-white font-bold">{formatValue(cpuState.dReg, 16).signed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Program Selector (Top Level) */}
      <div className="bg-[#080c14] rounded-2xl p-5 border border-white/10 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Select Sample Hack Assembly Program</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {SAMPLE_PROGRAMS.map((prog) => (
            <button
              key={prog.id}
              onClick={() => handleSelectProgram(prog)}
              className={`text-left p-3 rounded-xl border text-xs transition-all ${
                selectedProgram.id === prog.id
                  ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'bg-[#0c121d] hover:bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{prog.title}</span>
                {selectedProgram.id === prog.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-[10px] text-slate-500 font-sans mt-1 line-clamp-2">{prog.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Assembly Code Editor */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Assembly Code Editor */}
          <div className="bg-[#080c14] rounded-2xl p-5 border border-white/10 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hack Assembly Code</span>
              </h3>

              <button
                onClick={handleCompileAssembly}
                className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs border border-cyan-500/40 transition-colors font-mono"
              >
                Assemble & Load
              </button>
            </div>

            <textarea
              value={customAssembly}
              onChange={(e) => setCustomAssembly(e.target.value)}
              rows={14}
              className="w-full bg-[#05070a] border border-white/10 rounded-xl p-3 text-xs text-cyan-300 font-mono leading-relaxed focus:outline-none focus:border-cyan-400"
              spellCheck={false}
            />

            {assemblyError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                {assemblyError}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: CPU State, Registers, ROM Monitor, RAM Data */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* CPU Registers & Flags */}
          <div className="bg-[#080c14] rounded-2xl p-6 border border-white/10 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider text-slate-400">
                  Hack CPU Registers & Status
                </h3>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                  Cycle: #{cpuState.cycleCount}
                </span>
              </div>

              {/* Quick Execution Controls (Tick / Step Button) */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleStep}
                  disabled={isRunning}
                  className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-bold flex items-center space-x-1.5 transition-all shadow-[0_0_10px_rgba(34,211,238,0.3)] font-mono"
                  title="Execute 1 Clock Cycle (Tick)"
                >
                  <SkipForward className="w-3.5 h-3.5 fill-current" />
                  <span>Tick Clock</span>
                </button>

                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1 transition-all font-mono ${
                    isRunning
                      ? 'bg-amber-400 text-black hover:bg-amber-300'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isRunning ? 'Pause' : 'Run'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Program Counter (PC) */}
              <div className="p-4 bg-[#0c121d] rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-yellow-200 font-bold block">PC (Program Counter)</span>
                <p className="text-xl font-bold text-white">@{cpuState.pc}</p>
                <p className="text-[10px] text-slate-500">Next instruction addr</p>
              </div>

              {/* A-Register */}
              <div className="p-4 bg-[#0c121d] rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold block">A-Register</span>
                <p className="text-xl font-bold text-white">{cpuState.aReg}</p>
                <p className="text-[10px] text-slate-500">Hex: 0x{cpuState.aReg.toString(16).toUpperCase()}</p>
              </div>

              {/* D-Register */}
              <div className="p-4 bg-[#0c121d] rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-purple-400 font-bold block">D-Register</span>
                <p className="text-xl font-bold text-white">{formatValue(cpuState.dReg, 16).signed}</p>
                <p className="text-[10px] text-slate-500">Hex: {formatValue(cpuState.dReg, 16).hex}</p>
              </div>
            </div>

            {/* Instruction Decoder Info */}
            <div className="p-4 bg-[#0c121d] rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">Current Instruction Decode:</span>
                <span className="text-cyan-400 font-bold">{currentInstrFmt.bin} ({currentInstrFmt.hex})</span>
              </div>

              <div className="text-xs text-slate-300">
                {!isCInstr ? (
                  <span className="text-cyan-400 font-bold">A-Instruction: Loads address @{currentInstr & 0x7FFF} into A-Register</span>
                ) : (
                  <span className="text-yellow-200 font-bold">C-Instruction: Computation & Memory/Jump Operation</span>
                )}
              </div>
            </div>
          </div>

          {/* Memory RAM Monitor */}
          <div className="bg-[#080c14] rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <span>Data Memory (RAM[0..15])</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">16-bit Words</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 font-mono">
              {cpuState.memory.slice(0, 16).map((val, idx) => {
                const isTargetRAM = cpuState.addressM === idx;
                const isWritten = isTargetRAM && cpuState.writeM;

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isWritten
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold ring-2 ring-rose-500/50'
                        : isTargetRAM
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                        : 'bg-[#0c121d] border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="text-[9px] text-slate-500">RAM[{idx}]</div>
                    <div className="text-sm font-bold mt-0.5">{formatValue(val, 16).signed}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* CPU Hardware Description Language (HDL) Source */}
      <div className="pt-6 border-t border-white/10 space-y-3">
        <div className="flex items-center space-x-2">
          <FileCode className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white font-mono">CPU.hdl Hardware Implementation</h3>
          <span className="text-xs text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
            Hardware Description Language
          </span>
        </div>
        <HdlViewer
          chipName={CHIP_DATABASE['CPU'].name}
          hdl={CHIP_DATABASE['CPU'].hdl}
          categoryName={CHIP_DATABASE['CPU'].categoryName}
        />
      </div>
    </div>
  );
};
