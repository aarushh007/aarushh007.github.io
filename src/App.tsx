import React, { useState, useEffect } from 'react';
import { Header, ViewMode } from './components/Header';
import { HierarchyMap } from './components/HierarchyMap';
import { ChipExplorer } from './components/ChipExplorer';
import { AluLab } from './components/AluLab';
import { CpuComputerSimulator } from './components/CpuComputerSimulator';
import { PortfolioShowcase } from './components/PortfolioShowcase';
import { CHIP_DATABASE } from './data/hdlDatabase';

export default function App() {
  const [activeMode, setActiveMode] = useState<ViewMode>('hierarchy');
  const [selectedChipId, setSelectedChipId] = useState<string>('Nand');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeMode]);

  const allChips = Object.values(CHIP_DATABASE).map((chip) => ({
    id: chip.id,
    name: chip.name,
    categoryName: chip.categoryName
  }));

  const handleSelectChip = (chipId: string) => {
    setSelectedChipId(chipId);
  };

  const handleOpenBlueprint = (chipId: string) => {
    if (chipId === 'ALU') {
      setActiveMode('alu');
      return;
    }
    if (chipId === 'CPU') {
      setActiveMode('computer');
      return;
    }
    setSelectedChipId(chipId);
    setActiveMode('explorer');
  };

  const handleNavigateFromPortfolio = (mode: ViewMode, chipId?: string) => {
    if (chipId) {
      setSelectedChipId(chipId);
    }
    setActiveMode(mode);
  };

  return (
    <div className="min-h-screen bg-[#05070a] bg-blueprint text-slate-100 font-sans selection:bg-cyan-500 selection:text-black flex flex-col antialiased">
      {/* Navbar */}
      <Header
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        selectedChipId={selectedChipId}
        onSelectChip={handleOpenBlueprint}
        allChips={allChips}
      />

      {/* Main View Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeMode === 'portfolio' && (
          <PortfolioShowcase onNavigate={handleNavigateFromPortfolio} />
        )}

        {activeMode === 'hierarchy' && (
          <HierarchyMap
            selectedChipId={selectedChipId}
            onSelectChip={handleSelectChip}
            onOpenBlueprint={handleOpenBlueprint}
          />
        )}

        {activeMode === 'explorer' && (
          <ChipExplorer
            selectedChipId={selectedChipId}
            onSelectChip={handleOpenBlueprint}
            onBackToTree={() => setActiveMode('hierarchy')}
          />
        )}

        {activeMode === 'alu' && <AluLab />}

        {activeMode === 'computer' && <CpuComputerSimulator />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#05070a]/90 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Aarush Hadimani &bull; Nand2Tetris Computer Simulator & Portfolio</span>
          <span className="text-cyan-400">First-Principles Hardware Synthesis: From Primitive NAND Gate to 16-Bit Computer</span>
        </div>
      </footer>
    </div>
  );
}
