import React from 'react';
import { Cpu, Layers, BookOpen, Calculator, CheckCircle2, Award, Code2, Terminal, HardDrive, Binary, ArrowRight, User, Sparkles } from 'lucide-react';
import { ViewMode } from './Header';

interface PortfolioShowcaseProps {
  onNavigate: (mode: ViewMode, chipId?: string) => void;
}

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({ onNavigate }) => {
  const achievements = [
    {
      title: "100% Primitive Gate Genesis",
      description: "Built all logic gates (NOT, AND, OR, XOR, MUX, DMUX, 16-bit buses) starting exclusively from the primitive 2-input NAND gate.",
      icon: <Binary className="w-5 h-5 text-cyan-400" />
    },
    {
      title: "Custom 16-Bit ALU",
      description: "Engineered the core Arithmetic Logic Unit capable of 18 elementary mathematical and bitwise operations using 6 control bits.",
      icon: <Calculator className="w-5 h-5 text-cyan-400" />
    },
    {
      title: "Sequential Memory Hierarchy",
      description: "Constructed memory units from single 1-bit Flip-Flops up to 16K-word RAM modules and Program Counters (PC).",
      icon: <HardDrive className="w-5 h-5 text-cyan-400" />
    },
    {
      title: "Complete Hack CPU Architecture",
      description: "Implemented instruction decoding, multiplexing, A/D register files, and conditional branch control logic for the 16-bit Hack instruction set.",
      icon: <Cpu className="w-5 h-5 text-cyan-400" />
    }
  ];

  const developmentStages = [
    {
      stage: "01",
      title: "Elementary Logic Gates",
      subtitle: "The Foundation",
      chips: ["Nand", "Not", "And", "Or", "Xor", "Mux", "DMux", "Not16", "And16", "Or16", "Mux16", "Or8Way", "Mux4Way16", "Mux8Way16", "DMux4Way", "DMux8Way"],
      description: "Starting with raw NAND gates, synthesized basic logic gates and multi-bit multiplexers required for routing signals in a computer.",
      actionChip: "Xor"
    },
    {
      stage: "02",
      title: "Combinational Arithmetic",
      subtitle: "The Mathematical Engine",
      chips: ["HalfAdder", "FullAdder", "Add16", "Inc16", "ALU"],
      description: "Constructed 2's complement binary adders and the versatile 16-bit Hack ALU capable of computing additions, subtractions, AND, OR, and negation.",
      actionChip: "ALU"
    },
    {
      stage: "03",
      title: "Sequential Memory",
      subtitle: "State & Time",
      chips: ["Bit", "Register", "PC", "RAM8", "RAM64", "RAM512", "RAM4K", "RAM16K"],
      description: "Built clocked memory cells starting from Data Flip-Flops (DFF), scaling up to 16-bit Registers, Program Counters, and deep RAM architectures.",
      actionChip: "Register"
    },
    {
      stage: "04",
      title: "Machine Language & CPU",
      subtitle: "Instruction Execution",
      chips: ["CPU"],
      description: "Synthesized the Hack CPU to parse 16-bit A-type and C-type instructions, coordinate ALU computations, update registers, and determine PC jumps.",
      actionChip: "CPU"
    },
    {
      stage: "05",
      title: "Computer System",
      subtitle: "Hardware Synthesis",
      chips: ["Computer", "ROM32K", "Memory"],
      description: "Interconnected the CPU, ROM32K program memory, and RAM16K memory-mapped I/O (including Screen & Keyboard) into a unified computer.",
      actionChip: "Computer"
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Portfolio Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0a1220] via-[#070d18] to-[#040810] p-8 sm:p-10 shadow-[0_0_40px_rgba(34,211,238,0.1)]">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Nand2Tetris Systems Architecture Portfolio &bull; Aarush Hadimani</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-mono leading-tight">
              Hack 16-Bit Computer Architecture & Simulator
            </h1>
            <p className="text-sm sm:text-base font-semibold text-cyan-400 font-mono">
              Designed & Implemented from First Principles by Aarush Hadimani
            </p>
          </div>

          <p className="text-slate-300 text-base leading-relaxed max-w-3xl">
            A complete, interactive simulation and architectural showcase demonstrating how a general-purpose 16-bit computer was constructed from scratch — starting strictly from primitive <strong className="text-cyan-300 font-mono">NAND gates</strong> all the way to a functioning <strong className="text-cyan-300 font-mono">CPU</strong>, <strong className="text-cyan-300 font-mono">Memory Map</strong>, and <strong className="text-cyan-300 font-mono">Hack Computer Platform</strong> as part of the <strong className="text-white">Nand2Tetris</strong> curriculum.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('computer')}
              className="px-5 py-2.5 rounded-lg bg-cyan-500 text-black font-bold font-mono text-xs uppercase tracking-wider hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center space-x-2"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Computer Simulator</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('alu')}
              className="px-5 py-2.5 rounded-lg bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold font-mono text-xs uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center space-x-2"
            >
              <Calculator className="w-4 h-4" />
              <span>Explore ALU Lab</span>
            </button>

            <button
              onClick={() => onNavigate('hierarchy')}
              className="px-5 py-2.5 rounded-lg bg-slate-800/80 border border-white/10 text-slate-200 font-semibold font-mono text-xs uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center space-x-2"
            >
              <Layers className="w-4 h-4" />
              <span>Browse HDL Hierarchy</span>
            </button>
          </div>
        </div>
      </section>

      {/* Creator Highlights & Achievements */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3">
          <Award className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white font-mono tracking-tight">Technical Milestones & Achievements</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#0a0f18] border border-white/10 hover:border-cyan-500/40 transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-white font-mono">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Nand2Tetris Architectural Journey (5 Stages) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white font-mono tracking-tight flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <span>Nand2Tetris Building Roadmap</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">From raw boolean gates to machine-code execution</p>
          </div>
        </div>

        <div className="space-y-4">
          {developmentStages.map((stg) => (
            <div
              key={stg.stage}
              className="p-6 rounded-xl bg-[#080d16] border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center font-mono font-extrabold text-cyan-400 text-lg shrink-0">
                  {stg.stage}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white font-mono">{stg.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-white/5">
                      {stg.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{stg.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {stg.chips.map((chipName) => (
                      <button
                        key={chipName}
                        onClick={() => onNavigate('explorer', chipName)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0f172a] text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all"
                      >
                        {chipName}.hdl
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="shrink-0 w-full lg:w-auto">
                <button
                  onClick={() => onNavigate('explorer', stg.actionChip)}
                  className="w-full lg:w-auto px-4 py-2 rounded bg-slate-800 border border-white/10 hover:border-cyan-400 text-slate-200 text-xs font-mono font-semibold flex items-center justify-center space-x-2 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect HDL Blueprint</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
