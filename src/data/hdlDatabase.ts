import { ChipData } from '../types';

export const CHIP_DATABASE: Record<string, ChipData> = {
  Nand: {
    id: 'Nand',
    name: 'Nand',
    category: 'primitive',
    categoryName: 'Primitive Gate',
    summary: 'The fundamental building block of digital computers.',
    description: 'NAND (Not-AND) returns 0 only when both inputs are 1. It is functionally complete, meaning any Boolean function can be implemented using only NAND gates.',
    hdl: `// Primitive Gate - Built into hardware simulator
CHIP Nand {
    IN a, b;
    OUT out;

    // Primitive hardware implementation
}`,
    inputs: [
      { name: 'a', busWidth: 1, isInput: true },
      { name: 'b', busWidth: 1, isInput: true }
    ],
    outputs: [
      { name: 'out', busWidth: 1, isInput: false }
    ],
    dependencies: [],
    usedIn: ['Not', 'And', 'Or'],
    parts: [],
    defaultInputs: { a: 0, b: 0 }
  },

  DFF: {
    id: 'DFF',
    name: 'DFF',
    category: 'primitive',
    categoryName: 'Primitive Sequential Gate',
    summary: 'Data Flip-Flop: stores a single bit across clock cycles.',
    description: 'DFF outputs the value of its input from the previous clock cycle (out(t) = in(t-1)). It forms the foundation of all memory and sequential logic in the computer.',
    hdl: `// Primitive Sequential Gate
CHIP DFF {
    IN in;
    OUT out;

    // Clock-driven hardware flip-flop
}`,
    inputs: [
      { name: 'in', busWidth: 1, isInput: true }
    ],
    outputs: [
      { name: 'out', busWidth: 1, isInput: false }
    ],
    dependencies: [],
    usedIn: ['Bit'],
    parts: [],
    defaultInputs: { in: 0 }
  },

  // Project 1
  Not: {
    id: 'Not',
    name: 'Not',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: 'Inverts a single bit (NOT gate).',
    description: 'Calculates out = NOT in. Constructed by feeding the same input signal into both inputs of a NAND gate.',
    hdl: `CHIP Not {
    IN in;
    OUT out;

    PARTS:
    Nand(a=in,b=in,out=out);
}`,
    inputs: [{ name: 'in', busWidth: 1, isInput: true }],
    outputs: [{ name: 'out', busWidth: 1, isInput: false }],
    dependencies: ['Nand'],
    usedIn: ['And', 'Xor', 'Mux', 'DMux', 'Not16', 'DMux4Way', 'CPU'],
    parts: [
      { name: 'Nand_1', type: 'Nand', connections: [{ pin: 'a', target: 'in' }, { pin: 'b', target: 'in' }, { pin: 'out', target: 'out' }] }
    ],
    defaultInputs: { in: 0 }
  },

  And: {
    id: 'And',
    name: 'And',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: 'Outputs 1 if both inputs are 1 (AND gate).',
    description: 'Constructed by taking the output of a NAND gate and passing it through a NOT gate (which is itself another NAND gate).',
    hdl: `CHIP And {
    IN a, b;
    OUT out;
    
    PARTS:
    Nand(a=a,b=b, out=temp);
    Not(in=temp,out=out);
}`,
    inputs: [
      { name: 'a', busWidth: 1, isInput: true },
      { name: 'b', busWidth: 1, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 1, isInput: false }],
    dependencies: ['Nand', 'Not'],
    usedIn: ['Xor', 'Mux', 'DMux', 'And16', 'HalfAdder', 'DMux4Way', 'CPU'],
    parts: [
      { name: 'Nand_1', type: 'Nand', connections: [{ pin: 'a', target: 'a' }, { pin: 'b', target: 'b' }, { pin: 'out', target: 'temp' }] },
      { name: 'Not_1', type: 'Not', connections: [{ pin: 'in', target: 'temp' }, { pin: 'out', target: 'out' }] }
    ],
    defaultInputs: { a: 0, b: 0 }
  },

  Or: {
    id: 'Or',
    name: 'Or',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: 'Outputs 1 if at least one input is 1 (OR gate).',
    description: "By De Morgan's Laws, A OR B = NOT (NOT A AND NOT B). Built using three NAND gates.",
    hdl: `CHIP Or {
    IN a, b;
    OUT out;

    PARTS:
    Nand(a=a,b=a,out=temp1);
    Nand(a=b,b=b,out=temp2);
    Nand(a=temp1,b=temp2,out=out);
}`,
    inputs: [
      { name: 'a', busWidth: 1, isInput: true },
      { name: 'b', busWidth: 1, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 1, isInput: false }],
    dependencies: ['Nand'],
    usedIn: ['Xor', 'Mux', 'Or16', 'Or8Way', 'FullAdder', 'PC', 'CPU'],
    parts: [
      { name: 'Nand_a', type: 'Nand', connections: [{ pin: 'a', target: 'a' }, { pin: 'b', target: 'a' }, { pin: 'out', target: 'temp1' }] },
      { name: 'Nand_b', type: 'Nand', connections: [{ pin: 'a', target: 'b' }, { pin: 'b', target: 'b' }, { pin: 'out', target: 'temp2' }] },
      { name: 'Nand_out', type: 'Nand', connections: [{ pin: 'a', target: 'temp1' }, { pin: 'b', target: 'temp2' }, { pin: 'out', target: 'out' }] }
    ],
    defaultInputs: { a: 0, b: 0 }
  },

  Xor: {
    id: 'Xor',
    name: 'Xor',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: 'Exclusive OR gate: outputs 1 if exactly one input is 1.',
    description: 'XOR = (a AND NOT b) OR (NOT a AND b). Built using Not, And, and Or gates.',
    hdl: `CHIP Xor {
    IN a, b;
    OUT out;

    PARTS:
    Not(in=a, out=nota);
    Not(in=b, out=notb);
    And(a=a, b=notb, out=w1);
    And(a=nota, b=b, out=w2);
    Or(a=w1, b=w2, out=out);
}`,
    inputs: [
      { name: 'a', busWidth: 1, isInput: true },
      { name: 'b', busWidth: 1, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 1, isInput: false }],
    dependencies: ['Not', 'And', 'Or'],
    usedIn: ['HalfAdder'],
    parts: [
      { name: 'Not_a', type: 'Not', connections: [{ pin: 'in', target: 'a' }, { pin: 'out', target: 'nota' }] },
      { name: 'Not_b', type: 'Not', connections: [{ pin: 'in', target: 'b' }, { pin: 'out', target: 'notb' }] },
      { name: 'And_1', type: 'And', connections: [{ pin: 'a', target: 'a' }, { pin: 'b', target: 'notb' }, { pin: 'out', target: 'w1' }] },
      { name: 'And_2', type: 'And', connections: [{ pin: 'a', target: 'nota' }, { pin: 'b', target: 'b' }, { pin: 'out', target: 'w2' }] },
      { name: 'Or_1', type: 'Or', connections: [{ pin: 'a', target: 'w1' }, { pin: 'b', target: 'w2' }, { pin: 'out', target: 'out' }] }
    ],
    defaultInputs: { a: 0, b: 0 }
  },

  Mux: {
    id: 'Mux',
    name: 'Mux',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: '2-to-1 Multiplexor: selects between inputs a and b using sel.',
    description: 'If sel == 0, out = a; if sel == 1, out = b. Formula: (a AND NOT sel) OR (b AND sel).',
    hdl: `CHIP Mux {
    IN a, b, sel;
    OUT out;

    PARTS:
    Not(in=sel,out=notsel);

    And(a=a,b=notsel,out=notselANDa);
    And(a=sel, b=b, out=selANDb);

    Or(a=notselANDa,b=selANDb, out=out);
}`,
    inputs: [
      { name: 'a', busWidth: 1, isInput: true },
      { name: 'sel', busWidth: 1, isInput: true },
      { name: 'b', busWidth: 1, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 1, isInput: false }],
    dependencies: ['Not', 'And', 'Or'],
    usedIn: ['Mux16', 'DMux4Way', 'Bit'],
    parts: [
      { name: 'Not_sel', type: 'Not', connections: [{ pin: 'in', target: 'sel' }, { pin: 'out', target: 'notsel' }] },
      { name: 'And_a', type: 'And', connections: [{ pin: 'a', target: 'a' }, { pin: 'b', target: 'notsel' }, { pin: 'out', target: 'notselANDa' }] },
      { name: 'And_b', type: 'And', connections: [{ pin: 'a', target: 'sel' }, { pin: 'b', target: 'b' }, { pin: 'out', target: 'selANDb' }] },
      { name: 'Or_out', type: 'Or', connections: [{ pin: 'a', target: 'notselANDa' }, { pin: 'b', target: 'selANDb' }, { pin: 'out', target: 'out' }] }
    ],
    defaultInputs: { a: 0, b: 1, sel: 0 }
  },

  DMux: {
    id: 'DMux',
    name: 'DMux',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: 'Demultiplexor: routes input to channel a or b based on sel.',
    description: 'If sel == 0: {a = in, b = 0}. If sel == 1: {a = 0, b = in}.',
    hdl: `CHIP DMux {
    IN in, sel;
    OUT a, b;

    PARTS:
    Not(in=sel, out=NOTsel);
    And(a=in, b=NOTsel, out=a);

    And(a=in, b=sel, out=b);
}`,
    inputs: [
      { name: 'in', busWidth: 1, isInput: true },
      { name: 'sel', busWidth: 1, isInput: true }
    ],
    outputs: [
      { name: 'a', busWidth: 1, isInput: false },
      { name: 'b', busWidth: 1, isInput: false }
    ],
    dependencies: ['Not', 'And'],
    usedIn: ['DMux8Way'],
    parts: [
      { name: 'Not_sel', type: 'Not', connections: [{ pin: 'in', target: 'sel' }, { pin: 'out', target: 'NOTsel' }] },
      { name: 'And_a', type: 'And', connections: [{ pin: 'a', target: 'in' }, { pin: 'b', target: 'NOTsel' }, { pin: 'out', target: 'a' }] },
      { name: 'And_b', type: 'And', connections: [{ pin: 'a', target: 'in' }, { pin: 'b', target: 'sel' }, { pin: 'out', target: 'b' }] }
    ],
    defaultInputs: { in: 1, sel: 0 }
  },

  Not16: {
    id: 'Not16',
    name: 'Not16',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: '16-bit bitwise NOT gate.',
    description: 'Applies NOT logic to each of the 16 bits in the bus independently.',
    hdl: `CHIP Not16 {
    IN in[16];
    OUT out[16];

    PARTS:
    Not(in=in[0],out=out[0]);
    Not(in=in[1],out=out[1]);
    // ... repeat for all 16 bits ...
    Not(in=in[15],out=out[15]);
}`,
    inputs: [{ name: 'in', busWidth: 16, isInput: true }],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['Not'],
    usedIn: ['ALU'],
    parts: [],
    defaultInputs: { in: 0 }
  },

  And16: {
    id: 'And16',
    name: 'And16',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: '16-bit bitwise AND gate.',
    description: 'Applies AND logic to corresponding bits of two 16-bit buses a and b.',
    hdl: `CHIP And16 {
    IN a[16], b[16];
    OUT out[16];

    PARTS:
    And(a=a[0],b=b[0],out=out[0]);
    And(a=a[1],b=b[1],out=out[1]);
    // ... repeat for all 16 bits ...
    And(a=a[15],b=b[15],out=out[15]);
}`,
    inputs: [
      { name: 'a', busWidth: 16, isInput: true },
      { name: 'b', busWidth: 16, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['And'],
    usedIn: ['ALU'],
    parts: [],
    defaultInputs: { a: 0xF0F0, b: 0xFF00 }
  },

  Or16: {
    id: 'Or16',
    name: 'Or16',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: '16-bit bitwise OR gate.',
    description: 'Applies OR logic to corresponding bits of two 16-bit buses.',
    hdl: `CHIP Or16 {
    IN a[16], b[16];
    OUT out[16];

    PARTS:
    Or(a=a[0],b=b[0],out=out[0]);
    // ... repeat for all 16 bits ...
    Or(a=a[15],b=b[15],out=out[15]);
}`,
    inputs: [
      { name: 'a', busWidth: 16, isInput: true },
      { name: 'b', busWidth: 16, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['Or'],
    usedIn: [],
    parts: [],
    defaultInputs: { a: 0x0F0F, b: 0x3333 }
  },

  Mux16: {
    id: 'Mux16',
    name: 'Mux16',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: '16-bit 2-to-1 Multiplexor.',
    description: 'Selects between 16-bit input buses a and b depending on single-bit select signal sel.',
    hdl: `CHIP Mux16 {
    IN a[16], b[16], sel;
    OUT out[16];

    PARTS:
    Mux(sel=sel,a=a[0],b=b[0],out=out[0]);
    // ... repeat for all 16 bits ...
    Mux(sel=sel,a=a[15],b=b[15],out=out[15]);
}`,
    inputs: [
      { name: 'a', busWidth: 16, isInput: true },
      { name: 'b', busWidth: 16, isInput: true },
      { name: 'sel', busWidth: 1, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['Mux'],
    usedIn: ['Mux4Way16', 'Mux8Way16', 'ALU', 'PC', 'CPU'],
    parts: [],
    defaultInputs: { a: 42, b: 100, sel: 0 }
  },

  Or8Way: {
    id: 'Or8Way',
    name: 'Or8Way',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: '8-way OR gate: outputs 1 if any of the 8 input bits is 1.',
    description: 'Arranged in a binary tree reduction of 2-input OR gates (OR 4 pairs -> OR 2 pairs -> final OR). Used in the ALU to compute the zero flag (zr).',
    hdl: `CHIP Or8Way {
    IN in[8];
    OUT out;

    PARTS:
    Or(a=in[0],b=in[1],out=OR1);
    Or(a=in[2],b=in[3],out=OR2);
    Or(a=in[4],b=in[5],out=OR3);
    Or(a=in[6],b=in[7],out=OR4);

    Or(a=OR1,b=OR2,out=OR5);
    Or(a=OR3,b=OR4,out=OR6);

    Or(a=OR5,b=OR6,out=out);
}`,
    inputs: [{ name: 'in', busWidth: 8, isInput: true }],
    outputs: [{ name: 'out', busWidth: 1, isInput: false }],
    dependencies: ['Or'],
    usedIn: ['ALU'],
    parts: [
      { name: 'OR1', type: 'Or', connections: [{ pin: 'a', target: 'in[0]' }, { pin: 'b', target: 'in[1]' }, { pin: 'out', target: 'OR1' }] },
      { name: 'OR2', type: 'Or', connections: [{ pin: 'a', target: 'in[2]' }, { pin: 'b', target: 'in[3]' }, { pin: 'out', target: 'OR2' }] },
      { name: 'OR3', type: 'Or', connections: [{ pin: 'a', target: 'in[4]' }, { pin: 'b', target: 'in[5]' }, { pin: 'out', target: 'OR3' }] },
      { name: 'OR4', type: 'Or', connections: [{ pin: 'a', target: 'in[6]' }, { pin: 'b', target: 'in[7]' }, { pin: 'out', target: 'OR4' }] },
      { name: 'OR5', type: 'Or', connections: [{ pin: 'a', target: 'OR1' }, { pin: 'b', target: 'OR2' }, { pin: 'out', target: 'OR5' }] },
      { name: 'OR6', type: 'Or', connections: [{ pin: 'a', target: 'OR3' }, { pin: 'b', target: 'OR4' }, { pin: 'out', target: 'OR6' }] },
      { name: 'OR7', type: 'Or', connections: [{ pin: 'a', target: 'OR5' }, { pin: 'b', target: 'OR6' }, { pin: 'out', target: 'out' }] }
    ],
    defaultInputs: { in: 0 }
  },

  Mux4Way16: {
    id: 'Mux4Way16',
    name: 'Mux4Way16',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: '4-way 16-bit Multiplexor.',
    description: 'Selects one of four 16-bit input buses (a, b, c, d) using 2-bit select signal sel[2]. Built from three Mux16 chips.',
    hdl: `CHIP Mux4Way16 {
    IN a[16], b[16], c[16], d[16], sel[2];
    OUT out[16];
    
    PARTS:
    Mux16(a=a,b=b,sel=sel[0],out=mux1);
    Mux16(a=c,b=d,sel=sel[0],out=mux2);

    Mux16(a=mux1,b=mux2,sel=sel[1],out=out);
}`,
    inputs: [
      { name: 'a', busWidth: 16, isInput: true },
      { name: 'b', busWidth: 16, isInput: true },
      { name: 'c', busWidth: 16, isInput: true },
      { name: 'd', busWidth: 16, isInput: true },
      { name: 'sel', busWidth: 2, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['Mux16'],
    usedIn: ['Mux8Way16', 'RAM16K', 'Memory'],
    parts: [
      { name: 'Mux1', type: 'Mux16', connections: [{ pin: 'a', target: 'a' }, { pin: 'b', target: 'b' }, { pin: 'sel', target: 'sel[0]' }, { pin: 'out', target: 'mux1' }] },
      { name: 'Mux2', type: 'Mux16', connections: [{ pin: 'a', target: 'c' }, { pin: 'b', target: 'd' }, { pin: 'sel', target: 'sel[0]' }, { pin: 'out', target: 'mux2' }] },
      { name: 'MuxOut', type: 'Mux16', connections: [{ pin: 'a', target: 'mux1' }, { pin: 'b', target: 'mux2' }, { pin: 'sel', target: 'sel[1]' }, { pin: 'out', target: 'out' }] }
    ],
    defaultInputs: { a: 10, b: 20, c: 30, d: 40, sel: 0 }
  },

  Mux8Way16: {
    id: 'Mux8Way16',
    name: 'Mux8Way16',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: '8-way 16-bit Multiplexor.',
    description: 'Selects one of 8 input 16-bit buses (a through h) using 3-bit sel[3]. Built from two Mux4Way16 chips and one Mux16 chip.',
    hdl: `CHIP Mux8Way16 {
    IN a[16], b[16], c[16], d[16],
       e[16], f[16], g[16], h[16],
       sel[3];
    OUT out[16];

    PARTS:
    Mux4Way16(a=a , b=b , c=c , d=d , sel=sel[0..1] , out=mux1 );
    Mux4Way16(a=e , b=f , c=g , d=h , sel=sel[0..1] , out=mux2 );

    Mux16(a=mux1 , b=mux2 , sel=sel[2] , out=out );
}`,
    inputs: [
      { name: 'a', busWidth: 16, isInput: true },
      { name: 'b', busWidth: 16, isInput: true },
      { name: 'c', busWidth: 16, isInput: true },
      { name: 'd', busWidth: 16, isInput: true },
      { name: 'e', busWidth: 16, isInput: true },
      { name: 'f', busWidth: 16, isInput: true },
      { name: 'g', busWidth: 16, isInput: true },
      { name: 'h', busWidth: 16, isInput: true },
      { name: 'sel', busWidth: 3, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['Mux4Way16', 'Mux16'],
    usedIn: ['RAM8', 'RAM64', 'RAM512', 'RAM4K'],
    parts: [],
    defaultInputs: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, sel: 0 }
  },

  DMux4Way: {
    id: 'DMux4Way',
    name: 'DMux4Way',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: '4-way Demultiplexor.',
    description: 'Routes a 1-bit input signal to one of four outputs (a, b, c, d) selected by 2-bit sel[2].',
    hdl: `CHIP DMux4Way {
    IN in, sel[2];
    OUT a, b, c, d;

    PARTS:
    Not(in=sel[1],out=not1);
    Not(in=sel[0],out=not2);

    And(a=not1,b=not2,out=and1);
    And(a=not1,b=sel[0], out=and2);
    And(a=sel[1],b=not2, out=and3);
    And(a=sel[1], b=sel[0], out=and4);

    Mux(a=false,b=in,sel=and1,out=a);
    Mux(a=false,b=in,sel=and2,out=b);
    Mux(a=false,b=in,sel=and3,out=c);
    Mux(a=false,b=in,sel=and4,out=d);
}`,
    inputs: [
      { name: 'in', busWidth: 1, isInput: true },
      { name: 'sel', busWidth: 2, isInput: true }
    ],
    outputs: [
      { name: 'a', busWidth: 1, isInput: false },
      { name: 'b', busWidth: 1, isInput: false },
      { name: 'c', busWidth: 1, isInput: false },
      { name: 'd', busWidth: 1, isInput: false }
    ],
    dependencies: ['Not', 'And', 'Mux'],
    usedIn: ['DMux8Way', 'RAM16K', 'Memory'],
    parts: [],
    defaultInputs: { in: 1, sel: 0 }
  },

  DMux8Way: {
    id: 'DMux8Way',
    name: 'DMux8Way',
    category: 'project1',
    categoryName: 'Project 1: Elementary Logic',
    summary: '8-way Demultiplexor.',
    description: 'Routes 1-bit input to one of eight output lines (a..h) selected by 3-bit sel[3]. Built using DMux and two DMux4Way chips.',
    hdl: `CHIP DMux8Way {
    IN in, sel[3];
    OUT a, b, c, d, e, f, g, h;

    PARTS:
    DMux(in=in , sel=sel[2] , a=mux1 , b=mux2 );

    DMux4Way(in=mux1 , sel=sel[0..1] , a=a , b=b , c=c , d=d );
    DMux4Way(in=mux2 , sel=sel[0..1] , a=e , b=f , c=g , d=h );
}`,
    inputs: [
      { name: 'in', busWidth: 1, isInput: true },
      { name: 'sel', busWidth: 3, isInput: true }
    ],
    outputs: [
      { name: 'a', busWidth: 1, isInput: false },
      { name: 'b', busWidth: 1, isInput: false },
      { name: 'c', busWidth: 1, isInput: false },
      { name: 'd', busWidth: 1, isInput: false },
      { name: 'e', busWidth: 1, isInput: false },
      { name: 'f', busWidth: 1, isInput: false },
      { name: 'g', busWidth: 1, isInput: false },
      { name: 'h', busWidth: 1, isInput: false }
    ],
    dependencies: ['DMux', 'DMux4Way'],
    usedIn: ['RAM8', 'RAM64', 'RAM512', 'RAM4K'],
    parts: [],
    defaultInputs: { in: 1, sel: 0 }
  },

  // Project 2
  HalfAdder: {
    id: 'HalfAdder',
    name: 'HalfAdder',
    category: 'project2',
    categoryName: 'Project 2: Arithmetic & ALU',
    summary: 'Adds two 1-bit numbers, producing sum bit and carry bit.',
    description: 'sum = a XOR b, carry = a AND b. The foundation of binary addition.',
    hdl: `CHIP HalfAdder {
    IN a, b;    // 1-bit inputs
    OUT sum,    // Right bit of a + b 
        carry;  // Left bit of a + b

    PARTS:
    Xor(a=a,b=b,out=sum);
    And(a=a,b=b,out=carry);
}`,
    inputs: [
      { name: 'a', busWidth: 1, isInput: true },
      { name: 'b', busWidth: 1, isInput: true }
    ],
    outputs: [
      { name: 'sum', busWidth: 1, isInput: false },
      { name: 'carry', busWidth: 1, isInput: false }
    ],
    dependencies: ['Xor', 'And'],
    usedIn: ['FullAdder', 'Add16'],
    parts: [
      { name: 'Xor_1', type: 'Xor', connections: [{ pin: 'a', target: 'a' }, { pin: 'b', target: 'b' }, { pin: 'out', target: 'sum' }] },
      { name: 'And_1', type: 'And', connections: [{ pin: 'a', target: 'a' }, { pin: 'b', target: 'b' }, { pin: 'out', target: 'carry' }] }
    ],
    defaultInputs: { a: 1, b: 1 }
  },

  FullAdder: {
    id: 'FullAdder',
    name: 'FullAdder',
    category: 'project2',
    categoryName: 'Project 2: Arithmetic & ALU',
    summary: 'Adds three 1-bit numbers (a, b, and carry-in c).',
    description: 'Constructed from two HalfAdders and one OR gate to combine the carry signals.',
    hdl: `CHIP FullAdder {
    IN a, b, c;  // 1-bit inputs
    OUT sum,     // Right bit of a + b + c
        carry;   // Left bit of a + b + c

    PARTS:
    HalfAdder(a=a,b=b,sum=sum1,carry=carry1);
    HalfAdder(a=sum1,b=c,sum=sum,carry=carry2);
    Or(a=carry1,b=carry2,out=carry);
}`,
    inputs: [
      { name: 'a', busWidth: 1, isInput: true },
      { name: 'b', busWidth: 1, isInput: true },
      { name: 'c', busWidth: 1, isInput: true }
    ],
    outputs: [
      { name: 'sum', busWidth: 1, isInput: false },
      { name: 'carry', busWidth: 1, isInput: false }
    ],
    dependencies: ['HalfAdder', 'Or'],
    usedIn: ['Add16'],
    parts: [
      { name: 'HA1', type: 'HalfAdder', connections: [{ pin: 'a', target: 'a' }, { pin: 'b', target: 'b' }, { pin: 'sum', target: 'sum1' }, { pin: 'carry', target: 'carry1' }] },
      { name: 'HA2', type: 'HalfAdder', connections: [{ pin: 'a', target: 'sum1' }, { pin: 'b', target: 'c' }, { pin: 'sum', target: 'sum' }, { pin: 'carry', target: 'carry2' }] },
      { name: 'Or_carry', type: 'Or', connections: [{ pin: 'a', target: 'carry1' }, { pin: 'b', target: 'carry2' }, { pin: 'out', target: 'carry' }] }
    ],
    defaultInputs: { a: 1, b: 1, c: 1 }
  },

  Add16: {
    id: 'Add16',
    name: 'Add16',
    category: 'project2',
    categoryName: 'Project 2: Arithmetic & ALU',
    summary: '16-bit Adder.',
    description: 'Adds two 16-bit numbers using ripple-carry logic (1 HalfAdder for bit 0 + 15 FullAdders for bits 1..15). Overflow carry is dropped.',
    hdl: `CHIP Add16 {
    IN a[16], b[16];
    OUT out[16];

    PARTS:
    HalfAdder(a=a[0] , b=b[0] , sum=out[0] , carry=carry1 );
    FullAdder(a=a[1] , b=b[1] , c=carry1 , sum=out[1] , carry=carry2 );
    // ... repeat FullAdder for bits 2..14 ...
    FullAdder(a=a[15] , b=b[15] , c=carry15 , sum=out[15] , carry=carry16 );
}`,
    inputs: [
      { name: 'a', busWidth: 16, isInput: true },
      { name: 'b', busWidth: 16, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['HalfAdder', 'FullAdder'],
    usedIn: ['Inc16', 'ALU'],
    parts: [],
    defaultInputs: { a: 1234, b: 5678 }
  },

  Inc16: {
    id: 'Inc16',
    name: 'Inc16',
    category: 'project2',
    categoryName: 'Project 2: Arithmetic & ALU',
    summary: '16-bit Incrementor: out = in + 1.',
    description: 'Built by passing `in` as input `a` to an `Add16` chip, with input `b` wired to 1 (b[0]=true, b[1..15]=false).',
    hdl: `CHIP Inc16 {
    IN in[16];
    OUT out[16];

    PARTS:
    Add16(a=in ,
    b[0]=true,
    b[1]=false, b[2]=false, b[3]=false, b[4]=false,
    b[5]=false, b[6]=false, b[7]=false, b[8]=false,
    b[9]=false, b[10]=false, b[11]=false, b[12]=false,
    b[13]=false, b[14]=false, b[15]=false,
    out=out
    );
}`,
    inputs: [{ name: 'in', busWidth: 16, isInput: true }],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['Add16'],
    usedIn: ['PC'],
    parts: [],
    defaultInputs: { in: 15 }
  },

  ALU: {
    id: 'ALU',
    name: 'ALU',
    category: 'project2',
    categoryName: 'Project 2: Arithmetic & ALU',
    summary: 'Arithmetic Logic Unit: heart of the computer CPU.',
    description: 'Computes 18 distinct arithmetic/logical functions on two 16-bit inputs (x, y) controlled by 6 input bits: zx, nx, zy, ny, f, no. Outputs 16-bit out, plus status flags zr (is out == 0?) and ng (is out < 0?).',
    hdl: `CHIP ALU {
    IN  
        x[16], y[16],  // 16-bit inputs        
        zx, // zero the x input?
        nx, // negate the x input?
        zy, // zero the y input?
        ny, // negate the y input?
        f,  // compute (out = x + y) or (out = x & y)?
        no; // negate the out output?
    OUT 
        out[16], // 16-bit output
        zr,      // if (out == 0) equals 1, else 0
        ng;      // if (out < 0)  equals 1, else 0

    PARTS:
    Mux16(a=x , b=false , sel=zx , out=x1 );
    Not16(in=x1, out=NOTx1);
    Mux16(a=x1 , b=NOTx1 , sel=nx , out=x2 );

    Mux16(a=y , b=false , sel=zy , out=y1 );
    Not16(in=y1, out=NOTy1);
    Mux16(a=y1 , b=NOTy1 , sel=ny , out=y2 );

    Add16(a=x2 , b=y2 , out=xPLUSy );
    And16(a=x2 , b=y2 , out=xANDy );

    Mux16(a=xANDy , b=xPLUSy , sel=f , out=out1 );
    Not16(in=out1 , out=NOTout1 );

    Mux16(a=out1 , b=NOTout1 , sel=no , out=finalOut );

    Mux16(a=finalOut, b=false, sel=false, out=out);

    // Flag generation (zr, ng)
    Or(a=false, b=f15, out=ng);
    Or8Way(in[0..7]=f0..f7, out=l);
    Or8Way(in[8..15]=f8..f15, out=r);
    Or(a=l, b=r, out=hasOne);
    Not(in=hasOne, out=zr);
}`,
    inputs: [
      { name: 'x', busWidth: 16, isInput: true },
      { name: 'y', busWidth: 16, isInput: true },
      { name: 'zx', busWidth: 1, isInput: true },
      { name: 'nx', busWidth: 1, isInput: true },
      { name: 'zy', busWidth: 1, isInput: true },
      { name: 'ny', busWidth: 1, isInput: true },
      { name: 'f', busWidth: 1, isInput: true },
      { name: 'no', busWidth: 1, isInput: true }
    ],
    outputs: [
      { name: 'out', busWidth: 16, isInput: false },
      { name: 'zr', busWidth: 1, isInput: false },
      { name: 'ng', busWidth: 1, isInput: false }
    ],
    dependencies: ['Mux16', 'Not16', 'Add16', 'And16', 'Or8Way', 'Or', 'Not'],
    usedIn: ['CPU'],
    parts: [],
    defaultInputs: { x: 17, y: 3, zx: 0, nx: 0, zy: 0, ny: 0, f: 1, no: 0 }
  },

  // Project 3
  Bit: {
    id: 'Bit',
    name: 'Bit',
    category: 'project3',
    categoryName: 'Project 3: Sequential Logic',
    summary: '1-bit Memory Register.',
    description: 'Stores 1 bit of memory. If load == 1, stores the new in value on next clock cycle; otherwise retains current state.',
    hdl: `CHIP Bit {
    IN in, load;
    OUT out;

    PARTS:
    Mux(a=DFFout, b=in, sel=load, out=DFFin);
    DFF(in=DFFin, out=DFFout, out=out);
}`,
    inputs: [
      { name: 'in', busWidth: 1, isInput: true },
      { name: 'load', busWidth: 1, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 1, isInput: false }],
    dependencies: ['Mux', 'DFF'],
    usedIn: ['Register'],
    parts: [
      { name: 'Mux1', type: 'Mux', connections: [{ pin: 'a', target: 'DFFout' }, { pin: 'b', target: 'in' }, { pin: 'sel', target: 'load' }, { pin: 'out', target: 'DFFin' }] },
      { name: 'DFF1', type: 'DFF', connections: [{ pin: 'in', target: 'DFFin' }, { pin: 'out', target: 'DFFout' }, { pin: 'out', target: 'out' }] }
    ],
    defaultInputs: { in: 1, load: 1 }
  },

  Register: {
    id: 'Register',
    name: 'Register',
    category: 'project3',
    categoryName: 'Project 3: Sequential Logic',
    summary: '16-bit Register.',
    description: 'Constructed from 16 single Bit chips sharing the load signal line.',
    hdl: `CHIP Register {
    IN in[16], load;
    OUT out[16];

    PARTS:
    Bit(in=in[0], load=load, out=out[0]);
    // ... repeat for all 16 bits ...
    Bit(in=in[15], load=load, out=out[15]);
}`,
    inputs: [
      { name: 'in', busWidth: 16, isInput: true },
      { name: 'load', busWidth: 1, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['Bit'],
    usedIn: ['RAM8', 'PC', 'CPU'],
    parts: [],
    defaultInputs: { in: 255, load: 1 }
  },

  RAM8: {
    id: 'RAM8',
    name: 'RAM8',
    category: 'project3',
    categoryName: 'Project 3: Sequential Logic',
    summary: 'Memory bank of 8 16-bit Registers.',
    description: 'Uses DMux8Way to route `load` signal to target address register, and Mux8Way16 to read selected output register.',
    hdl: `CHIP RAM8 {
    IN in[16], load, address[3];
    OUT out[16];

    PARTS:
    DMux8Way(in=load , sel=address , 
    a=load1 , b=load2 , c=load3 , d=load4 , 
    e=load5 , f=load6 , g=load7 , h=load8 );

    Register(in=in , load=load1 , out=out1 );
    Register(in=in , load=load2 , out=out2 );
    Register(in=in , load=load3 , out=out3 );
    Register(in=in , load=load4 , out=out4 );
    Register(in=in , load=load5 , out=out5 );
    Register(in=in , load=load6 , out=out6 );
    Register(in=in , load=load7 , out=out7 );
    Register(in=in , load=load8 , out=out8 );

    Mux8Way16(
    a=out1 , b=out2 , c=out3 , d=out4 , 
    e=out5 , f=out6 , g=out7 , h=out8 , 
    sel=address , out=out );
}`,
    inputs: [
      { name: 'in', busWidth: 16, isInput: true },
      { name: 'load', busWidth: 1, isInput: true },
      { name: 'address', busWidth: 3, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['DMux8Way', 'Register', 'Mux8Way16'],
    usedIn: ['RAM64'],
    parts: [],
    defaultInputs: { in: 123, load: 1, address: 2 }
  },

  RAM64: {
    id: 'RAM64',
    name: 'RAM64',
    category: 'project3',
    categoryName: 'Project 3: Sequential Logic',
    summary: '64-word Memory built from 8 RAM8 modules.',
    description: 'Higher address bits address[3..5] select which RAM8 block; lower bits address[0..2] select register inside that RAM8 block.',
    hdl: `CHIP RAM64 {
    IN in[16], load, address[6];
    OUT out[16];

    PARTS:
    DMux8Way(in=load , sel=address[3..5] ,
    a=load1 , b=load2 , c=load3 , d=load4 , 
    e=load5 , f=load6 , g=load7 , h=load8 );

    RAM8(in=in , load=load1 , address=address[0..2] , out=out1 );
    // ... 8 RAM8 blocks ...
    Mux8Way16(sel=address[3..5] , out=out );
}`,
    inputs: [
      { name: 'in', busWidth: 16, isInput: true },
      { name: 'load', busWidth: 1, isInput: true },
      { name: 'address', busWidth: 6, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['DMux8Way', 'RAM8', 'Mux8Way16'],
    usedIn: ['RAM512'],
    parts: [],
    defaultInputs: { in: 999, load: 1, address: 12 }
  },

  RAM512: {
    id: 'RAM512',
    name: 'RAM512',
    category: 'project3',
    categoryName: 'Project 3: Sequential Logic',
    summary: '512-word Memory built from 8 RAM64 modules.',
    description: 'Hierarchical composition: address[6..8] selects RAM64 block, address[0..5] addresses memory cell.',
    hdl: `CHIP RAM512 {
    IN in[16], load, address[9];
    OUT out[16];

    PARTS:
    DMux8Way(in=load , sel=address[6..8] , ...);
    RAM64(in=in , load=load1 , address=address[0..5] , out=out1 );
    // ... 8 RAM64 blocks ...
    Mux8Way16(sel=address[6..8] , out=out );
}`,
    inputs: [
      { name: 'in', busWidth: 16, isInput: true },
      { name: 'load', busWidth: 1, isInput: true },
      { name: 'address', busWidth: 9, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['DMux8Way', 'RAM64', 'Mux8Way16'],
    usedIn: ['RAM4K'],
    parts: [],
    defaultInputs: { in: 42, load: 1, address: 256 }
  },

  RAM4K: {
    id: 'RAM4K',
    name: 'RAM4K',
    category: 'project3',
    categoryName: 'Project 3: Sequential Logic',
    summary: '4096-word Memory built from 8 RAM512 modules.',
    description: 'address[9..11] selects RAM512 block; address[0..8] selects word within block.',
    hdl: `CHIP RAM4K {
    IN in[16], load, address[12];
    OUT out[16];

    PARTS:
    DMux8Way(in=load , sel=address[9..11] , ...);
    RAM512(in=in , load=load1 , address=address[0..8] , out=out1 );
    // ... 8 RAM512 blocks ...
    Mux8Way16(sel=address[9..11] , out=out );
}`,
    inputs: [
      { name: 'in', busWidth: 16, isInput: true },
      { name: 'load', busWidth: 1, isInput: true },
      { name: 'address', busWidth: 12, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['DMux8Way', 'RAM512', 'Mux8Way16'],
    usedIn: ['RAM16K'],
    parts: [],
    defaultInputs: { in: 100, load: 1, address: 1024 }
  },

  RAM16K: {
    id: 'RAM16K',
    name: 'RAM16K',
    category: 'project3',
    categoryName: 'Project 3: Sequential Logic',
    summary: '16,384-word Main Memory module.',
    description: 'Built from 4 RAM4K blocks using DMux4Way and Mux4Way16 with address[12..13]. Provides main data storage for the Hack Computer.',
    hdl: `CHIP RAM16K {
    IN in[16], load, address[14];
    OUT out[16];

    PARTS:
    DMux4Way(in=load , sel=address[12..13] , 
    a=load1 , b=load2 , c=load3 , d=load4 );
    
    RAM4K(in=in , load=load1 , address=address[0..11] , out=out1 );
    RAM4K(in=in , load=load2 , address=address[0..11] , out=out2 );
    RAM4K(in=in , load=load3 , address=address[0..11] , out=out3 );
    RAM4K(in=in , load=load4 , address=address[0..11] , out=out4 );

    Mux4Way16(
    a=out1 , b=out2 , c=out3 , d=out4 , 
    sel=address[12..13] , out=out );
}`,
    inputs: [
      { name: 'in', busWidth: 16, isInput: true },
      { name: 'load', busWidth: 1, isInput: true },
      { name: 'address', busWidth: 14, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['DMux4Way', 'RAM4K', 'Mux4Way16'],
    usedIn: ['Memory'],
    parts: [],
    defaultInputs: { in: 50, load: 1, address: 0 }
  },

  PC: {
    id: 'PC',
    name: 'PC',
    category: 'project3',
    categoryName: 'Project 3: Sequential Logic',
    summary: 'Program Counter: controls program flow in CPU.',
    description: '16-bit register with priority logic: reset (highest priority) -> load -> inc (increment). Keeps track of the address of the instruction being executed.',
    hdl: `CHIP PC {
    IN in[16],load,inc,reset;
    OUT out[16];

    PARTS:
	Inc16(in=oo,out=incd);

	Mux16(a=oo,b=incd,sel=inc,out=o);

	Mux16(a=o,b=in,sel=load,out=uu);

	Mux16(a=uu,b[0..15]=false,sel=reset,out=this);
	
	Register(in=this,load=true,out=out,out=oo);
	

}`,
    inputs: [
      { name: 'in', busWidth: 16, isInput: true },
      { name: 'load', busWidth: 1, isInput: true },
      { name: 'inc', busWidth: 1, isInput: true },
      { name: 'reset', busWidth: 1, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['Register', 'Inc16', 'Mux16'],
    usedIn: ['CPU'],
    parts: [
      { name: 'Inc16', type: 'Inc16', connections: [{ pin: 'in', target: 'oo' }, { pin: 'out', target: 'incd' }] },
      { name: 'Mux1', type: 'Mux16', connections: [{ pin: 'a', target: 'oo' }, { pin: 'b', target: 'incd' }, { pin: 'sel', target: 'inc' }, { pin: 'out', target: 'o' }] },
      { name: 'Mux2', type: 'Mux16', connections: [{ pin: 'a', target: 'o' }, { pin: 'b', target: 'in' }, { pin: 'sel', target: 'load' }, { pin: 'out', target: 'uu' }] },
      { name: 'Mux3', type: 'Mux16', connections: [{ pin: 'a', target: 'uu' }, { pin: 'b', target: 'false' }, { pin: 'sel', target: 'reset' }, { pin: 'out', target: 'this' }] },
      { name: 'Register', type: 'Register', connections: [{ pin: 'in', target: 'this' }, { pin: 'load', target: 'true' }, { pin: 'out', target: 'out' }] }
    ],
    defaultInputs: { in: 100, inc: 1, load: 0, reset: 0 }
  },

  // Project 5
  Memory: {
    id: 'Memory',
    name: 'Memory',
    category: 'project5',
    categoryName: 'Project 5: Computer Architecture',
    summary: 'Unified Address Space containing RAM16K, Screen, and Keyboard.',
    description: 'Maps address space 0x0000..0x3FFF to RAM16K, 0x4000..0x5FFF to Screen memory map, and 0x6000 to Keyboard register using address bits 13..14.',
    hdl: `CHIP Memory {
    IN in[16], load, address[15];
    OUT out[16];

    PARTS:
	DMux4Way(in=load, sel=address[13..14], a=loadram1, b=loadram2, c=loadscreen, d=loadkbd);
	Or(a=loadram1, b=loadram2, out=loadram);
    RAM16K(in=in, load=loadram, address=address[0..13], out=ramout);
    Screen(in=in, load=loadscreen, address=address[0..12], out=scrout);
    Keyboard(out=kbout);
    Mux4Way16(a=ramout, b=ramout, c=scrout, d=kbout, sel=address[13..14], out=out);
}`,
    inputs: [
      { name: 'in', busWidth: 16, isInput: true },
      { name: 'load', busWidth: 1, isInput: true },
      { name: 'address', busWidth: 15, isInput: true }
    ],
    outputs: [{ name: 'out', busWidth: 16, isInput: false }],
    dependencies: ['DMux4Way', 'Or', 'RAM16K', 'Mux4Way16'],
    usedIn: ['Computer'],
    parts: [],
    defaultInputs: { in: 777, load: 1, address: 10 }
  },

  CPU: {
    id: 'CPU',
    name: 'CPU',
    category: 'project5',
    categoryName: 'Project 5: Computer Architecture',
    summary: 'The Hack Central Processing Unit.',
    description: 'Decodes 16-bit A/C instructions, executes calculations via ALU, updates A and D Registers, reads/writes Memory, and updates Program Counter based on jump conditions.',
    hdl: `CHIP CPU {
    IN  inM[16],         // Memory value input (M = RAM[A])
        instruction[16], // Instruction for execution
        reset;           // Signal to reset program counter

    OUT outM[16],        // M value output
        writeM,          // Write to M?
        addressM[15],    // Address in data memory
        pc[15];          // Address of next instruction

    PARTS:
    // A-Register Mux & Register
    Mux16(a=instruction, b=ALUoutput, sel=instruction[15], out=AregisterIN);
    Not(in=instruction[15], out=Ainstruction);
    Or(a=Ainstruction, b=instruction[5], out=loadA);
    Register(in=AregisterIN, load=loadA, out=AregisterOUT, out[0..14]=addressM);

    // D-Register
    And(a=instruction[15], b=instruction[4], out=loadD);
    Register(in=ALUoutput, load=loadD, out=DregisterOUT);

    // ALU input 2 Mux (A or M)
    Mux16(a=AregisterOUT, b=inM, sel=instruction[12], out=ALUinput2);

    // Core ALU Computation
    ALU(x=DregisterOUT, y=ALUinput2,
        zx=instruction[11], nx=instruction[10],
        zy=instruction[9],  ny=instruction[8],
        f=instruction[7],   no=instruction[6],
        out=ALUoutput, out=outM, zr=zr, ng=ng);

    // Jump Decoder Logic & PC Update
    // ... evaluates JGT, JEQ, JGE, JLT, JNE, JLE, JMP ...
    PC(in=AregisterOUT, load=loadPC, inc=incPC, reset=reset, out[0..14]=pc);
    And(a=instruction[15], b=instruction[3], out=writeM);
}`,
    inputs: [
      { name: 'inM', busWidth: 16, isInput: true },
      { name: 'instruction', busWidth: 16, isInput: true },
      { name: 'reset', busWidth: 1, isInput: true }
    ],
    outputs: [
      { name: 'outM', busWidth: 16, isInput: false },
      { name: 'writeM', busWidth: 1, isInput: false },
      { name: 'addressM', busWidth: 15, isInput: false },
      { name: 'pc', busWidth: 15, isInput: false }
    ],
    dependencies: ['Mux16', 'Not', 'Or', 'And', 'Register', 'ALU', 'PC'],
    usedIn: ['Computer'],
    parts: [],
    defaultInputs: { inM: 0, instruction: 0b0000000000000101, reset: 0 } // @5
  },

  Computer: {
    id: 'Computer',
    name: 'Computer',
    category: 'project5',
    categoryName: 'Project 5: Computer Architecture',
    summary: 'The Complete Hack Computer (Harvard Architecture).',
    description: 'Combines the Hack CPU, ROM32K (instruction memory), and Memory (data RAM + Screen + Keyboard) into a unified 16-bit Harvard architecture computer platform.',
    hdl: `CHIP Computer {
    IN reset;

    PARTS:
    CPU(inM=inM , instruction=instruction , reset=reset , 
    outM=outM , writeM=writeM , addressM=addressM , 
    pc=programCounter);

    ROM32K(address=programCounter , out=instruction );

    Memory(in=outM , load=writeM , address=addressM , out=inM );
}`,
    inputs: [{ name: 'reset', busWidth: 1, isInput: true }],
    outputs: [],
    dependencies: ['CPU', 'Memory'],
    usedIn: [],
    parts: [
      { name: 'CPU_inst', type: 'CPU', connections: [{ pin: 'inM', target: 'inM' }, { pin: 'instruction', target: 'instruction' }, { pin: 'reset', target: 'reset' }] },
      { name: 'Memory_inst', type: 'Memory', connections: [{ pin: 'in', target: 'outM' }, { pin: 'load', target: 'writeM' }, { pin: 'address', target: 'addressM' }, { pin: 'out', target: 'inM' }] }
    ],
    defaultInputs: { reset: 0 }
  }
};
