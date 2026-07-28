import React from 'react';
import { Cpu, Layers, Calculator, BookOpen, User, Sparkles } from 'lucide-react';

export type ViewMode = 'portfolio' | 'hierarchy' | 'explorer' | 'alu' | 'computer';

interface HeaderProps {
  activeMode: ViewMode;
  setActiveMode: (mode: ViewMode) => void;
  selectedChipId: string;
  onSelectChip: (chipId: string) => void;
  allChips: { id: string; name: string; categoryName: string }[];
}

export const Header: React.FC<HeaderProps> = ({
  activeMode,
  setActiveMode,
  selectedChipId,
  onSelectChip,
  allChips
}) => {
  return (
    <header className="bg-[#0a0f18] border-b border-white/10 text-slate-100 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between min-h-[4rem] py-2 sm:py-0 gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-2.5 cursor-pointer shrink-0" onClick={() => setActiveMode('hierarchy')}>
              <div className="w-7 h-7 bg-cyan-400 rounded flex items-center justify-center text-black font-extrabold font-mono text-xs shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                AH
              </div>
              <div className="whitespace-nowrap">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs sm:text-sm text-white tracking-tight font-mono">
                    16-bit Hack Computer Architecture
                  </span>
                </div>
                <p className="text-[10px] text-cyan-400/90 font-mono leading-none mt-0.5">
                  by <span className="text-white font-semibold">Aarush Hadimani</span>
                </p>
              </div>
            </div>

            {/* Mobile Jump To Selector */}
            <div className="sm:hidden flex items-center space-x-1">
              <select
                value={activeMode === 'alu' ? 'ALU' : activeMode === 'computer' ? 'CPU' : selectedChipId}
                onChange={(e) => {
                  onSelectChip(e.target.value);
                }}
                className="bg-[#080c14] border border-cyan-500/30 text-cyan-300 text-[11px] font-mono rounded px-2 py-1 focus:outline-none cursor-pointer max-w-[100px] truncate"
              >
                {allChips.map((chip) => (
                  <option key={chip.id} value={chip.id} className="bg-[#080c14] text-slate-200 font-mono">
                    {chip.name}.hdl
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode Navigation Tabs - Horizontal Scroll on Mobile */}
          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none touch-pan-x shrink-0">
            <button
              onClick={() => setActiveMode('hierarchy')}
              className={`px-2.5 sm:px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeMode === 'hierarchy'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Logic Tree</span>
            </button>

            <button
              onClick={() => setActiveMode('explorer')}
              className={`px-2.5 sm:px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeMode === 'explorer'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Blueprint</span>
            </button>

            <button
              onClick={() => setActiveMode('alu')}
              className={`px-2.5 sm:px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeMode === 'alu'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              <span>ALU Lab</span>
            </button>

            <button
              onClick={() => setActiveMode('computer')}
              className={`px-2.5 sm:px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeMode === 'computer'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 shrink-0" />
              <span>Hack CPU</span>
            </button>

            <button
              onClick={() => setActiveMode('portfolio')}
              className={`px-2.5 sm:px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                activeMode === 'portfolio'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>About</span>
            </button>
          </nav>

          {/* Desktop Quick Chip Selector Dropdown */}
          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider hidden lg:inline">Jump To:</span>
            <select
              value={activeMode === 'alu' ? 'ALU' : activeMode === 'computer' ? 'CPU' : selectedChipId}
              onChange={(e) => {
                onSelectChip(e.target.value);
              }}
              className="bg-[#080c14] border border-cyan-500/30 text-cyan-300 text-xs font-mono rounded px-2.5 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer hover:border-cyan-400/70 transition-colors max-w-[130px] sm:max-w-[160px] truncate"
            >
              {allChips.map((chip) => (
                <option key={chip.id} value={chip.id} className="bg-[#080c14] text-slate-200 font-mono">
                  {chip.name}.hdl
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>
    </header>
  );
};

