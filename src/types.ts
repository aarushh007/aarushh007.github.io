export type ChipCategory = 'primitive' | 'project1' | 'project2' | 'project3' | 'project5';

export interface PinDef {
  name: string;
  busWidth: number; // 1 or 16 or 2 or 3 or 8 or 14 or 15
  isInput: boolean;
  description?: string;
}

export interface InternalPart {
  name: string;
  type: string; // e.g. 'Nand', 'Not', 'HalfAdder', etc.
  connections: { pin: string; target: string }[];
}

export interface ChipData {
  id: string;
  name: string;
  category: ChipCategory;
  categoryName: string;
  summary: string;
  description: string;
  hdl: string;
  inputs: PinDef[];
  outputs: PinDef[];
  dependencies: string[]; // Chip IDs used in build
  usedIn: string[]; // Chip IDs that build upon this chip
  parts: InternalPart[];
  defaultInputs?: Record<string, number | number[] | boolean>;
}

export interface HackCpuState {
  aReg: number; // 15-bit or 16-bit
  dReg: number; // 16-bit
  pc: number;   // 15-bit
  memory: number[]; // 16-bit array (RAM/Screen)
  rom: number[];    // Instructions
  currentInstruction: number;
  writeM: boolean;
  outM: number;
  addressM: number;
  zr: boolean;
  ng: boolean;
  cycleCount: number;
}

export interface SampleProgram {
  id: string;
  title: string;
  description: string;
  assembly: string;
  machineCode: number[];
}
