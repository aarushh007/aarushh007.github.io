import { HackCpuState, SampleProgram } from '../types';

// Helper for masking 16-bit integers
export const mask16 = (val: number): number => (val & 0xFFFF) >>> 0;
export const mask15 = (val: number): number => (val & 0x7FFF) >>> 0;

// Convert signed 16-bit int to string, hex, binary
export function formatValue(val: number, busWidth: number = 16) {
  const mask = busWidth >= 32 ? 0xFFFFFFFF : (1 << busWidth) - 1;
  const uint = (val & mask) >>> 0;
  
  // Signed 16-bit
  let signed = uint;
  if (busWidth === 16 && (uint & 0x8000)) {
    signed = uint - 0x10000;
  }

  const bin = uint.toString(2).padStart(busWidth, '0');
  const hex = '0x' + uint.toString(16).toUpperCase().padStart(Math.ceil(busWidth / 4), '0');

  return { uint, signed, bin, hex };
}

// Single-bit gates
export function evalNand(a: number, b: number): number {
  return (a & b) ? 0 : 1;
}

export function evalNot(a: number): number {
  return a ? 0 : 1;
}

export function evalAnd(a: number, b: number): number {
  return (a && b) ? 1 : 0;
}

export function evalOr(a: number, b: number): number {
  return (a || b) ? 1 : 0;
}

export function evalXor(a: number, b: number): number {
  return (a ^ b) ? 1 : 0;
}

export function evalMux(a: number, b: number, sel: number): number {
  return sel ? b : a;
}

export function evalDMux(inBit: number, sel: number): { a: number; b: number } {
  return {
    a: sel === 0 ? inBit : 0,
    b: sel === 1 ? inBit : 0,
  };
}

// 16-bit bus operations
export function evalNot16(inVal: number): number {
  return mask16(~inVal);
}

export function evalAnd16(a: number, b: number): number {
  return mask16(a & b);
}

export function evalOr16(a: number, b: number): number {
  return mask16(a | b);
}

export function evalMux16(a: number, b: number, sel: number): number {
  return sel ? mask16(b) : mask16(a);
}

export function evalOr8Way(in8: number): number {
  return (in8 & 0xFF) !== 0 ? 1 : 0;
}

export function evalMux4Way16(a: number, b: number, c: number, d: number, sel: number): number {
  switch (sel & 3) {
    case 0: return mask16(a);
    case 1: return mask16(b);
    case 2: return mask16(c);
    case 3: return mask16(d);
    default: return 0;
  }
}

export function evalMux8Way16(
  a: number, b: number, c: number, d: number,
  e: number, f: number, g: number, h: number,
  sel: number
): number {
  const s = sel & 7;
  const arr = [a, b, c, d, e, f, g, h];
  return mask16(arr[s] || 0);
}

export function evalDMux4Way(inBit: number, sel: number): { a: number; b: number; c: number; d: number } {
  const s = sel & 3;
  return {
    a: s === 0 ? inBit : 0,
    b: s === 1 ? inBit : 0,
    c: s === 2 ? inBit : 0,
    d: s === 3 ? inBit : 0,
  };
}

export function evalDMux8Way(inBit: number, sel: number): Record<string, number> {
  const s = sel & 7;
  const keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const res: Record<string, number> = {};
  keys.forEach((k, idx) => {
    res[k] = idx === s ? inBit : 0;
  });
  return res;
}

// Project 2 Logic
export function evalHalfAdder(a: number, b: number) {
  return {
    sum: (a ^ b) & 1,
    carry: (a & b) & 1,
  };
}

export function evalFullAdder(a: number, b: number, c: number) {
  const sum1 = (a ^ b) & 1;
  const carry1 = (a & b) & 1;
  const sum = (sum1 ^ c) & 1;
  const carry2 = (sum1 & c) & 1;
  const carry = (carry1 | carry2) & 1;
  return { sum, carry };
}

export function evalAdd16(a: number, b: number): number {
  return mask16(a + b);
}

export function evalInc16(inVal: number): number {
  return mask16(inVal + 1);
}

export interface AluResult {
  out: number;
  zr: boolean;
  ng: boolean;
  steps: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    xPLUSy: number;
    xANDy: number;
    out1: number;
    finalOut: number;
  };
}

export function evalALU(
  x: number,
  y: number,
  zx: number,
  nx: number,
  zy: number,
  ny: number,
  f: number,
  no: number
): AluResult {
  const x1 = zx ? 0 : mask16(x);
  const x2 = nx ? mask16(~x1) : x1;

  const y1 = zy ? 0 : mask16(y);
  const y2 = ny ? mask16(~y1) : y1;

  const xPLUSy = mask16(x2 + y2);
  const xANDy = mask16(x2 & y2);

  const out1 = f ? xPLUSy : xANDy;
  const finalOut = no ? mask16(~out1) : out1;

  const zr = finalOut === 0;
  const ng = (finalOut & 0x8000) !== 0;

  return {
    out: finalOut,
    zr,
    ng,
    steps: {
      x1, x2, y1, y2, xPLUSy, xANDy, out1, finalOut
    }
  };
}

// Hack Assembly Parser & CPU Simulator
export function parseAssembly(asm: string): number[] {
  const lines = asm.split('\n');
  const code: number[] = [];
  const labels: Record<string, number> = {};

  // First pass: collect labels
  let romAddr = 0;
  for (let line of lines) {
    line = line.replace(/\/\/.*/, '').trim();
    if (!line) continue;
    if (line.startsWith('(') && line.endsWith(')')) {
      const label = line.substring(1, line.length - 1).trim();
      labels[label] = romAddr;
    } else {
      romAddr++;
    }
  }

  // Symbol table initial pre-fills
  const symbols: Record<string, number> = {
    SP: 0, LCL: 1, ARG: 2, THIS: 3, THAT: 4,
    R0: 0, R1: 1, R2: 2, R3: 3, R4: 4, R5: 5, R6: 6, R7: 7,
    R8: 8, R9: 9, R10: 10, R11: 11, R12: 12, R13: 13, R14: 14, R15: 15,
    SCREEN: 16384, KBD: 24576,
    ...labels
  };

  let nextRamVar = 16;

  // Second pass: compile instructions
  for (let line of lines) {
    line = line.replace(/\/\/.*/, '').trim();
    if (!line || (line.startsWith('(') && line.endsWith(')'))) continue;

    if (line.startsWith('@')) {
      // A-Instruction (@value or @symbol)
      const valStr = line.substring(1).trim();
      let val = parseInt(valStr, 10);
      if (isNaN(val)) {
        if (symbols[valStr] !== undefined) {
          val = symbols[valStr];
        } else {
          symbols[valStr] = nextRamVar;
          val = nextRamVar;
          nextRamVar++;
        }
      }
      code.push(val & 0x7FFF);
    } else {
      // C-Instruction: dest=comp;jump
      let destStr = '';
      let compStr = line;
      let jumpStr = '';

      if (compStr.includes('=')) {
        const parts = compStr.split('=');
        destStr = parts[0].trim();
        compStr = parts[1].trim();
      }

      if (compStr.includes(';')) {
        const parts = compStr.split(';');
        compStr = parts[0].trim();
        jumpStr = parts[1].trim();
      }

      // Dest bits (d1 d2 d3 -> A D M)
      let d1 = destStr.includes('A') ? 1 : 0;
      let d2 = destStr.includes('D') ? 1 : 0;
      let d3 = destStr.includes('M') ? 1 : 0;
      const destBits = (d1 << 2) | (d2 << 1) | d3;

      // Comp bits (a c1 c2 c3 c4 c5 c6)
      const compMap: Record<string, number> = {
        '0': 0b0101010, '1': 0b0111111, '-1': 0b0111010,
        'D': 0b0001100, 'A': 0b0110000, '!D': 0b0001101, '!A': 0b0110001,
        '-D': 0b0001111, '-A': 0b0110011, 'D+1': 0b0011111, 'A+1': 0b0110111,
        'D-1': 0b0001110, 'A-1': 0b0110010, 'D+A': 0b0000010, 'D-A': 0b0010011,
        'A-D': 0b0000111, 'D&A': 0b0000000, 'D|A': 0b0010101,
        // M variants (a bit = 1)
        'M': 0b1110000, '!M': 0b1110001, '-M': 0b1110011,
        'M+1': 0b1110111, 'M-1': 0b1110010, 'D+M': 0b1000010,
        'D-M': 0b1010011, 'M-D': 0b1000111, 'D&M': 0b1000000, 'D|M': 0b1010101
      };

      const compBits = compMap[compStr] ?? 0b0101010;

      // Jump bits (j1 j2 j3)
      const jumpMap: Record<string, number> = {
        '': 0, 'JGT': 1, 'JEQ': 2, 'JGE': 3, 'JLT': 4, 'JNE': 5, 'JLE': 6, 'JMP': 7
      };
      const jumpBits = jumpMap[jumpStr] ?? 0;

      // 111 a c1 c2 c3 c4 c5 c6 d1 d2 d3 j1 j2 j3
      const instruction = (0b111 << 13) | (compBits << 6) | (destBits << 3) | jumpBits;
      code.push(instruction & 0xFFFF);
    }
  }

  return code;
}

// Single step Hack CPU Execution
export function stepCpu(state: HackCpuState): HackCpuState {
  const instruction = state.rom[state.pc] ?? 0;
  let nextState = { ...state, cycleCount: state.cycleCount + 1, currentInstruction: instruction };

  // Check if A-instruction (bit 15 == 0)
  const isCInstruction = (instruction & 0x8000) !== 0;

  if (!isCInstruction) {
    // A-instruction: @value
    nextState.aReg = instruction & 0x7FFF;
    nextState.writeM = false;
    nextState.pc = mask15(state.pc + 1);
  } else {
    // C-instruction: 111a c1c2c3c4c5c6 d1d2d3 j1j2j3
    const aBit = (instruction >> 12) & 1;
    const zx = (instruction >> 11) & 1;
    const nx = (instruction >> 10) & 1;
    const zy = (instruction >> 9) & 1;
    const ny = (instruction >> 8) & 1;
    const f  = (instruction >> 7) & 1;
    const no = (instruction >> 6) & 1;

    const d1 = (instruction >> 5) & 1; // store in A
    const d2 = (instruction >> 4) & 1; // store in D
    const d3 = (instruction >> 3) & 1; // write to M

    const j1 = (instruction >> 2) & 1; // out < 0
    const j2 = (instruction >> 1) & 1; // out == 0
    const j3 = instruction & 1;        // out > 0

    const aluX = state.dReg;
    const inM = state.memory[state.aReg] || 0;
    const aluY = aBit ? inM : state.aReg;

    const aluRes = evalALU(aluX, aluY, zx, nx, zy, ny, f, no);

    nextState.outM = aluRes.out;
    nextState.addressM = state.aReg & 0x7FFF;
    nextState.writeM = d3 === 1;
    nextState.zr = aluRes.zr;
    nextState.ng = aluRes.ng;

    // Memory write
    if (d3 === 1) {
      const newMem = [...state.memory];
      newMem[state.aReg & 0x3FFF] = aluRes.out;
      nextState.memory = newMem;
    }

    // Register writes
    if (d2 === 1) {
      nextState.dReg = aluRes.out;
    }
    if (d1 === 1) {
      nextState.aReg = aluRes.out;
    }

    // Evaluate Jump
    const isPos = !aluRes.zr && !aluRes.ng;
    let takeJump = false;

    if (j1 && aluRes.ng) takeJump = true; // JLT
    if (j2 && aluRes.zr) takeJump = true; // JEQ
    if (j3 && isPos)    takeJump = true; // JGT

    if (takeJump) {
      nextState.pc = mask15(state.aReg);
    } else {
      nextState.pc = mask15(state.pc + 1);
    }
  }

  return nextState;
}

// Check if Hack CPU program has reached a halt / terminal infinite loop
export function isCpuHalted(state: HackCpuState): boolean {
  if (state.cycleCount === 0) return false;
  if (state.pc >= state.rom.length) return true;

  const currentInstr = state.rom[state.pc] ?? 0;
  const isCInstr = (currentInstr & 0x8000) !== 0;

  if (isCInstr) {
    const jumpBits = currentInstr & 7;
    if (jumpBits > 0) {
      // Unconditional or conditional jump targeting current PC or previous PC (infinite loop halt)
      if (state.aReg === state.pc || state.aReg === state.pc - 1) {
        return true;
      }
    }
  }
  return false;
}

// Preset Sample Programs for the Hack Computer
export const SAMPLE_PROGRAMS: SampleProgram[] = [
  {
    id: 'add',
    title: '1. Add Two Numbers (17 + 25)',
    description: 'Loads 17 into D, adds 25, and writes the result to RAM[0].',
    assembly: `// Add 17 + 25 -> RAM[0]
@17
D=A
@25
D=D+A
@0
M=D
(END)
@END
0;JMP`,
    machineCode: []
  },
  {
    id: 'sum',
    title: '2. Sum 1 to N (1 + 2 + ... + 10)',
    description: 'Calculates the sum of numbers from 1 to 10 in a loop and stores total in RAM[1].',
    assembly: `// RAM[0] = N = 10, RAM[1] = sum
@10
D=A
@0
M=D     // RAM[0] = 10
@1
M=0     // RAM[1] = 0 (sum)

(LOOP)
@0
D=M
@END
D;JEQ   // if N==0 goto END

@0
D=M
@1
M=D+M   // sum += N

@0
M=M-1   // N--

@LOOP
0;JMP

(END)
@END
0;JMP`,
    machineCode: []
  },
  {
    id: 'counter',
    title: '3. Infinite Memory Counter',
    description: 'Increments RAM[0] continuously in a loop.',
    assembly: `// Continuous RAM[0]++
@0
M=M+1
@0
0;JMP`,
    machineCode: []
  },
  {
    id: 'mult',
    title: '4. Multiplication (6 x 7 = 42)',
    description: 'Multiplies RAM[0] (6) by RAM[1] (7) using a counter and repeated addition, storing the product 42 in RAM[2].',
    assembly: `// Multiplication: RAM[2] = RAM[0] * RAM[1] (6 * 7 = 42)
@6
D=A
@R0
M=D     // RAM[0] = 6 (multiplicand)

@7
D=A
@R1
M=D     // RAM[1] = 7 (multiplier)

@R2
M=0     // RAM[2] = 0 (product accumulator)

@R1
D=M
@counter
M=D     // counter = multiplier

(LOOP)
    @counter
    D=M
    @END
    D;JEQ   // if counter == 0 goto END

    @R0
    D=M
    @R2
    M=D+M   // RAM[2] += RAM[0]

    @counter
    M=M-1   // counter--

    @LOOP
    0;JMP

(END)
    @END
    0;JMP`,
    machineCode: []
  }
];

// Initialize sample programs with compiled machine code
SAMPLE_PROGRAMS.forEach(prog => {
  prog.machineCode = parseAssembly(prog.assembly);
});
