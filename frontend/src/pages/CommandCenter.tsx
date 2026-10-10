import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, CornerDownLeft, Play, ShieldCheck, Terminal } from 'lucide-react';
import { api } from '../services/api.js';

export const CommandCenter: React.FC<{ navigate: (page: string) => void }> = ({ navigate }) => {
  const [prompt, setPrompt] = useState('');
  const [parsed, setParsed] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const sampleCommands = [
    'Scan Binance now',
    'Find coins matching Price Action',
    'Find all coins matching V1',
    'Show current OB setups',
    'Show active signals',
    'Compare all seven strategies',
    'Pause live trading',
    'Show today trades'
  ];

  const handleParse = async (textToParse?: string) => {
    const text = textToParse || prompt;
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.parseCommand(text);
      setParsed(res.command);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!parsed) return;
    setLoading(true);
    try {
      const res = await api.executeCommand(parsed);
      setResult(res);
    } catch (e: any) {
      setResult({ success: false, message: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 font-mono text-xs">
      {/* Header */}
      <div className="bg-[#151a24] border border-[#232b3e] p-4 rounded-lg">
        <h1 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          AI COMMAND CENTER TERMINAL
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Natural-language orchestration translated into safe, structured API calls behind the Central Risk Engine
        </p>
      </div>

      {/* Interactive Input Terminal */}
      <div className="bg-[#11151e] border border-[#232b3e] rounded-lg p-4 space-y-3">
        <label className="block text-gray-400 text-[11px] uppercase tracking-wider">Type Command in Natural Language</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleParse()}
            placeholder="e.g. Find coins matching Price Action, or Scan Binance now..."
            className="flex-1 bg-[#090c12] border border-[#20283b] rounded p-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleParse()}
            disabled={loading || !prompt}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded flex items-center gap-1.5"
          >
            Translate <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Sample Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] text-gray-500">Quick Samples:</span>
          {sampleCommands.map(cmd => (
            <button
              key={cmd}
              onClick={() => {
                setPrompt(cmd);
                handleParse(cmd);
              }}
              className="px-2 py-0.5 rounded bg-[#182030] hover:bg-[#202b40] text-gray-300 text-[10px] border border-[#26334a]"
            >
              "{cmd}"
            </button>
          ))}
        </div>
      </div>

      {/* Parsed Command Structured Review */}
      {parsed && (
        <div className="bg-[#151a24] border border-blue-500/40 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-[#232b3e]">
            <span className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              STRUCTURED VALIDATION AUDIT
            </span>
            <span className="badge-info">ACTION: {parsed.action_type}</span>
          </div>

          <div className="space-y-1 text-gray-300 text-[11px]">
            <div>Explanation: <span className="text-white">{parsed.explanation}</span></div>
            <div>Safe to Execute: <span className="text-emerald-400 font-bold">YES (Bypasses Live Risk until confirmed)</span></div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleExecute}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded flex items-center gap-2 shadow"
            >
              <Play className="w-3.5 h-3.5" />
              Confirm & Execute Action
            </button>
          </div>
        </div>
      )}

      {/* Command Output Result */}
      {result && (
        <div className="bg-[#151a24] border border-[#232b3e] rounded-lg p-4 space-y-3">
          <div className="font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            EXECUTION RESULT: {result.message}
          </div>

          <pre className="p-3 bg-[#0c1017] border border-[#1e273b] rounded text-[11px] text-gray-300 overflow-x-auto max-h-60">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
