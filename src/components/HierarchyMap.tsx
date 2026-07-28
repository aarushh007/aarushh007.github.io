import React from 'react';
import { CHIP_DATABASE } from '../data/hdlDatabase';
import { ChipCategory } from '../types';
import { Layers, ArrowRight, Cpu, Zap, HardDrive, Calculator, Code2 } from 'lucide-react';
import { NandGateCard } from './NandGateCard';

interface HierarchyMapProps {
  selectedChipId: string;
  onSelectChip: (chipId: string) => void;
  onOpenBlueprint: (chipId: string) => void;
}

export const HierarchyMap: React.FC<HierarchyMapProps> = ({
  selectedChipId,
  onSelectChip,
  onOpenBlueprint
}) => {
  const categories: { id: ChipCategory; name: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'primitive',
      name: '0. Primitives (Axioms)',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
      desc: 'Hardware Axioms provided as physical building blocks: NAND Gate & DFF (Flip-Flop).'
    },
    {
      id: 'project1',
      name: '1. Elementary Logic Gates',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      desc: 'Basic Boolean operators, multi-bit buses, and multi-way multiplexors/demultiplexors.'
    },
    {
      id: 'project2',
      name: '2. Combinational & ALU',
      icon: <Calculator className="w-4 h-4 text-amber-400" />,
      desc: 'Binary adders, incrementors, and the 16-bit Arithmetic Logic Unit (ALU).'
    },
    {
      id: 'project3',
      name: '3. Sequential & Memory',
      icon: <HardDrive className="w-4 h-4 text-purple-400" />,
      desc: '1-bit cells, 16-bit registers, RAM hierarchy (RAM8 to RAM16K), and Program Counter (PC).'
    },
    {
      id: 'project5',
      name: '4. Computer Architecture',
      icon: <Cpu className="w-4 h-4 text-rose-400" />,
      desc: 'Memory map controller, Central Processing Unit (CPU), and complete Hack Computer.'
    }
  ];

  const chipsByCategory = (catId: ChipCategory) => {
    return Object.values(CHIP_DATABASE).filter((c) => c.category === catId);
  };

  const activeChip = CHIP_DATABASE[selectedChipId];

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium border border-emerald-500/20 mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Nand2Tetris Step-by-Step Hardware Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 font-mono tracking-tight">
            How to Build a Computer from NAND Gates
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            From a single NAND gate to a complete 16-bit computer, this interactive project showcases the step-by-step construction of the Hack computer. Explore every chip, understand the digital logic behind each design, and see how individual components combine to create a fully functional computing system.
          </p>
        </div>
      </div>

      {/* NAND Gate Foundational Card & Truth Table */}
      <NandGateCard />

      {/* Selected Chip Dependency Highlight Bar */}
      {activeChip && (
        <div className="bg-[#0a0f18] rounded-xl p-4 border border-white/10 text-xs font-mono flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <span className="text-slate-400">Inspecting Chip:</span>
            <span className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
              {activeChip.name}
            </span>
            <button
              onClick={() => onOpenBlueprint(activeChip.id)}
              className="px-2.5 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center space-x-1.5 transition-all shadow-[0_0_10px_rgba(34,211,238,0.3)] text-[11px]"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Go to Blueprint →</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            <span className="text-slate-500">Dependency Path:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {activeChip.dependencies.length > 0 ? (
                activeChip.dependencies.map((dep, dIdx) => (
                  <React.Fragment key={dep}>
                    {dIdx > 0 && <span className="text-slate-600">→</span>}
                    <button
                      onClick={() => onSelectChip(dep)}
                      className="px-2 py-0.5 rounded bg-[#111827] hover:bg-white/10 text-cyan-300 border border-white/10 hover:border-cyan-400 transition-colors"
                    >
                      {dep}
                    </button>
                  </React.Fragment>
                ))
              ) : (
                <span className="text-slate-500 italic">None (Primitive Axiom)</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hierarchy Levels */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const chips = chipsByCategory(cat.id);
          return (
            <div key={cat.id} className="bg-[#080c14] rounded-xl border border-white/10 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded bg-[#111827] border border-white/10">{cat.icon}</div>
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">{cat.name}</h3>
                    <p className="text-xs text-slate-400">{cat.desc}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono self-start sm:self-center">
                  {chips.length} Chips
                </span>
              </div>

              {/* Chips Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {chips.map((chip) => {
                  const isSelected = chip.id === selectedChipId;
                  const isDependency = activeChip?.dependencies.includes(chip.id);
                  const isUsedIn = activeChip?.usedIn.includes(chip.id);

                  return (
                    <div
                      key={chip.id}
                      onClick={() => {
                        if (!isSelected) {
                          onSelectChip(chip.id);
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all duration-200 group relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'chip-active bg-cyan-500/10 border-cyan-400 text-white shadow-[0_0_16px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/50'
                          : isDependency
                          ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200 hover:border-cyan-400'
                          : isUsedIn
                          ? 'bg-purple-950/30 border-purple-500/40 text-purple-200 hover:border-purple-400'
                          : 'bg-[#0c121d] hover:bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-sm tracking-wide">{chip.name}</span>
                          {chip.id === 'ALU' || chip.id === 'CPU' ? (
                            <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-400/40">
                              DEDICATED LAB
                            </span>
                          ) : isSelected ? (
                            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-400/30">
                              ACTIVE
                            </span>
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">{chip.summary}</p>
                      </div>

                      {/* Action Button Section */}
                      {isSelected ? (
                        <div className="mt-3 pt-2.5 border-t border-cyan-500/30 space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenBlueprint(chip.id);
                            }}
                            className="w-full py-1.5 px-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center space-x-1.5 shadow-[0_0_10px_rgba(34,211,238,0.4)] transition-all active:scale-95"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>
                              {chip.id === 'ALU'
                                ? 'Go to ALU Unit →'
                                : chip.id === 'CPU'
                                ? 'Go to Hack CPU →'
                                : 'Go to Chip →'}
                            </span>
                          </button>
                        </div>
                      ) : (
                        /* Dependency badges & info when not selected */
                        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>{chip.inputs.length} IN / {chip.outputs.length} OUT</span>
                          {isDependency && <span className="text-cyan-400 font-bold">PREREQ</span>}
                          {isUsedIn && <span className="text-purple-400 font-bold">BUILDS UPON</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
