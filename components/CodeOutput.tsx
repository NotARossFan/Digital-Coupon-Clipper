import React, { useState } from 'react';
import { ScriptResponse } from '../types';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeOutputProps {
  data: ScriptResponse | null;
  isLoading: boolean;
}

const CodeOutput: React.FC<CodeOutputProps> = ({ data, isLoading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (data?.script) {
      navigator.clipboard.writeText(data.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-slate-900 rounded-xl p-6 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-indigo-300 font-mono text-sm">Analyzing DOM structure...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400">
        <Terminal className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-center text-sm">Upload a screenshot or paste HTML<br/>to generate your automation script.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-xs text-slate-400 font-mono">automation_script.js</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-grow font-mono text-sm text-slate-300">
        <pre className="whitespace-pre-wrap break-all text-indigo-300">
            {data.script}
        </pre>
      </div>

      {/* Info Footer */}
      <div className="bg-slate-950 px-4 py-3 text-xs border-t border-slate-800">
        <div className="flex justify-between items-start mb-2">
           <span className="text-slate-500 uppercase tracking-wider font-bold">Strategy</span>
           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
               data.confidence === 'High' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'
           }`}>
               {data.confidence} Confidence
           </span>
        </div>
        <p className="text-slate-400 leading-relaxed">{data.explanation}</p>
        <div className="mt-3 pt-3 border-t border-slate-900">
           <p className="text-slate-500 mb-1">Target Selectors:</p>
           <div className="flex flex-wrap gap-2">
             {data.targetSelectors.map((sel, idx) => (
                 <span key={idx} className="bg-slate-800 text-indigo-400 px-2 py-1 rounded font-mono">{sel}</span>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CodeOutput;