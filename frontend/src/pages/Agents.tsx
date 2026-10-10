import React, { useEffect, useState } from 'react';
import { Cpu, Pause, Play, RefreshCw, RotateCcw, Square } from 'lucide-react';
import { api, AgentData } from '../services/api.js';

export const Agents: React.FC = () => {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAgentLogs, setSelectedAgentLogs] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAgents();
    const interval = setInterval(loadAgents, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      const res = await api.getAgents();
      setAgents(res.agents || []);
    } catch (e) {
      // ignore
    }
  };

  const handleAction = async (id: string, action: 'start' | 'stop' | 'pause' | 'resume' | 'restart') => {
    await api.controlAgent(id, action);
    loadAgents();
  };

  const categories = ['ALL', 'DATA', 'ANALYSIS', 'STRATEGY', 'DECISION', 'EXECUTION', 'INTELLIGENCE', 'OPERATIONS'];

  const filtered = agents.filter(a => selectedCategory === 'ALL' || a.category === selectedCategory);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#151a24] border border-[#232b3e] p-3 rounded-lg gap-3">
        <div>
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            AGENT CONTROL CENTER (34 AUTONOMOUS AGENTS)
          </h1>
          <p className="text-[11px] text-gray-500">Observable, independently controllable services</p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#0e121a] text-gray-400 border border-[#252f44]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(ag => {
          const isRunning = ag.status === 'RUNNING';
          return (
            <div key={ag.id} className="bg-[#151a24] border border-[#232b3e] rounded-lg p-3.5 space-y-2.5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-white text-xs">{ag.name}</span>
                  <div className="text-[10px] text-gray-500">{ag.category} • v{ag.version}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  isRunning ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'
                }`}>
                  {ag.status}
                </span>
              </div>

              <div className="space-y-1 text-[10px] text-gray-400">
                <div className="flex justify-between">
                  <span>Processed:</span>
                  <strong className="text-gray-200">{ag.processedCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <strong className="text-blue-400">{ag.latencyMs}ms</strong>
                </div>
                <div className="flex justify-between">
                  <span>Heartbeat:</span>
                  <span className="text-gray-500">{new Date(ag.lastHeartbeat).toLocaleTimeString()}</span>
                </div>
                <div className="text-[10px] text-gray-500 truncate mt-1">
                  Task: {ag.currentTask}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-[#1e273a]">
                {isRunning ? (
                  <>
                    <button
                      onClick={() => handleAction(ag.id, 'pause')}
                      className="px-2 py-1 bg-[#0e121a] hover:bg-amber-600/20 text-amber-400 border border-[#252f44] rounded text-[10px] flex items-center gap-1"
                    >
                      <Pause className="w-3 h-3" /> Pause
                    </button>
                    <button
                      onClick={() => handleAction(ag.id, 'stop')}
                      className="px-2 py-1 bg-[#0e121a] hover:bg-red-600/20 text-red-400 border border-[#252f44] rounded text-[10px] flex items-center gap-1"
                    >
                      <Square className="w-3 h-3" /> Stop
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleAction(ag.id, 'start')}
                    className="px-2 py-1 bg-[#0e121a] hover:bg-emerald-600/20 text-emerald-400 border border-[#252f44] rounded text-[10px] flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Start
                  </button>
                )}
                <button
                  onClick={() => handleAction(ag.id, 'restart')}
                  className="px-2 py-1 bg-[#0e121a] hover:text-white text-gray-400 border border-[#252f44] rounded text-[10px] flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Restart
                </button>
                <button
                  onClick={() => setSelectedAgentLogs(ag)}
                  className="px-2 py-1 bg-[#0e121a] hover:text-white text-blue-400 border border-[#252f44] rounded text-[10px] ml-auto"
                >
                  Logs
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logs Modal */}
      {selectedAgentLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#151922] border border-[#252f44] rounded-lg max-w-lg w-full p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#232b3e]">
              <span className="font-bold text-white text-xs">{selectedAgentLogs.name} — Activity Logs</span>
              <button onClick={() => setSelectedAgentLogs(null)} className="text-gray-400 hover:text-white text-sm">✕</button>
            </div>
            <div className="bg-[#0b0e14] p-3 rounded max-h-64 overflow-y-auto space-y-1.5 text-[11px] font-mono">
              {selectedAgentLogs.logs.map((l, i) => (
                <div key={i} className="text-gray-300">
                  <span className="text-gray-500">[{new Date(l.timestamp).toLocaleTimeString()}]</span>{' '}
                  <span className={l.level === 'ERROR' ? 'text-red-400' : 'text-emerald-400'}>[{l.level}]</span>{' '}
                  {l.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
