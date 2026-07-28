import React from 'react';
import { evalNand, evalNot, evalAnd, evalOr, evalXor, evalMux, evalDMux } from '../utils/logicSimulator';

interface TruthTableProps {
  chipId: string;
  currentInputs: Record<string, number | number[] | boolean>;
}

export const TruthTable: React.FC<TruthTableProps> = ({ chipId, currentInputs }) => {
  // We handle primary single-bit gates for truth tables
  if (['Nand', 'Not', 'And', 'Or', 'Xor', 'Mux', 'DMux', 'HalfAdder', 'FullAdder'].includes(chipId)) {
    let rows: { inputs: Record<string, number>; outputs: Record<string, number> }[] = [];

    if (chipId === 'Not') {
      [0, 1].forEach((inVal) => {
        rows.push({ inputs: { in: inVal }, outputs: { out: evalNot(inVal) } });
      });
    } else if (['Nand', 'And', 'Or', 'Xor'].includes(chipId)) {
      [0, 1].forEach((a) => {
        [0, 1].forEach((b) => {
          let outVal = 0;
          if (chipId === 'Nand') outVal = evalNand(a, b);
          if (chipId === 'And') outVal = evalAnd(a, b);
          if (chipId === 'Or') outVal = evalOr(a, b);
          if (chipId === 'Xor') outVal = evalXor(a, b);
          rows.push({ inputs: { a, b }, outputs: { out: outVal } });
        });
      });
    } else if (chipId === 'Mux') {
      [0, 1].forEach((a) => {
        [0, 1].forEach((b) => {
          [0, 1].forEach((sel) => {
            rows.push({ inputs: { a, b, sel }, outputs: { out: evalMux(a, b, sel) } });
          });
        });
      });
    } else if (chipId === 'DMux') {
      [0, 1].forEach((inBit) => {
        [0, 1].forEach((sel) => {
          const res = evalDMux(inBit, sel);
          rows.push({ inputs: { in: inBit, sel }, outputs: { a: res.a, b: res.b } });
        });
      });
    } else if (chipId === 'HalfAdder') {
      [0, 1].forEach((a) => {
        [0, 1].forEach((b) => {
          const sum = (a ^ b) & 1;
          const carry = (a & b) & 1;
          rows.push({ inputs: { a, b }, outputs: { sum, carry } });
        });
      });
    } else if (chipId === 'FullAdder') {
      [0, 1].forEach((a) => {
        [0, 1].forEach((b) => {
          [0, 1].forEach((c) => {
            const sum1 = (a ^ b) & 1;
            const carry1 = (a & b) & 1;
            const sum = (sum1 ^ c) & 1;
            const carry2 = (sum1 & c) & 1;
            const carry = (carry1 | carry2) & 1;
            rows.push({ inputs: { a, b, c }, outputs: { sum, carry } });
          });
        });
      });
    }

    if (rows.length === 0) return null;

    const inputKeys = Object.keys(rows[0].inputs);
    const outputKeys = Object.keys(rows[0].outputs);

    // Check if row matches current inputs
    const isRowActive = (rowInputs: Record<string, number>) => {
      return inputKeys.every((key) => {
        const currentVal = Number(currentInputs[key] ?? 0);
        return currentVal === rowInputs[key];
      });
    };

    return (
      <div className="bg-[#0c121d] rounded-xl p-4 border border-white/10 shadow-inner">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <span>Boolean Truth Table</span>
          </h4>
          <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            Active input highlighted
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-center border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                {inputKeys.map((k) => (
                  <th key={k} className="py-2 px-3 bg-[#080c14] text-slate-300 font-medium border-r border-white/10">
                    {k}
                  </th>
                ))}
                {outputKeys.map((k) => (
                  <th key={k} className="py-2 px-3 bg-[#080c14] text-cyan-400 font-medium">
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const active = isRowActive(row.inputs);
                return (
                  <tr
                    key={idx}
                    className={`border-b border-white/10 transition-colors ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border-cyan-500/40'
                        : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {inputKeys.map((k) => (
                      <td key={k} className="py-1.5 px-3 border-r border-white/10">
                        {row.inputs[k]}
                      </td>
                    ))}
                    {outputKeys.map((k) => (
                      <td key={k} className={`py-1.5 px-3 ${active ? 'text-cyan-400 font-bold' : 'text-slate-200'}`}>
                        {row.outputs[k]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};
