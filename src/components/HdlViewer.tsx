import React, { useState } from 'react';
import { Copy, Check, Code2 } from 'lucide-react';

interface HdlViewerProps {
  chipName: string;
  hdl: string;
  categoryName: string;
}

export const HdlViewer: React.FC<HdlViewerProps> = ({ chipName, hdl, categoryName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hdl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = hdl.split('\n');

  return (
    <div className="bg-[#0c121d] rounded-xl border border-white/10 shadow-xl overflow-hidden font-mono text-xs">
      {/* Code Header */}
      <div className="bg-[#080c14] px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-semibold">{chipName}.hdl</span>
          <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
            {categoryName}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#111827] hover:bg-white/10 text-slate-300 hover:text-white text-[11px] transition-colors border border-white/10"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy HDL</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto text-slate-300 leading-relaxed font-mono">
        <pre className="text-xs">
          {lines.map((line, idx) => {
            // Simple syntax highlighting matching theme
            const isComment = line.trim().startsWith('//');
            const isChipDef = line.includes('CHIP');
            const isParts = line.includes('PARTS:');
            const isInOut = line.includes('IN ') || line.includes('OUT ');

            return (
              <div key={idx} className="flex hover:bg-white/5 rounded px-1">
                <span className="w-8 text-slate-600 select-none text-right pr-3 font-mono text-[11px]">
                  {idx + 1}
                </span>
                <span
                  className={
                    isComment
                      ? 'text-slate-500 italic'
                      : isChipDef
                      ? 'text-purple-400 font-bold'
                      : isParts
                      ? 'text-yellow-200 font-bold'
                      : isInOut
                      ? 'text-cyan-400'
                      : 'text-slate-300'
                  }
                >
                  {line}
                </span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
};
