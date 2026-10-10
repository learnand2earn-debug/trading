import React, { useState } from 'react';
import {
  Layers,
  X,
  Search,
  Radio,
  LineChart,
  Zap,
  Cpu,
  Terminal,
  TrendingUp,
  RotateCcw,
  FileText,
  Settings,
  Shield,
  UserCheck
} from 'lucide-react';

interface EnterpriseDrawerProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const EnterpriseDrawer: React.FC<EnterpriseDrawerProps> = ({ currentRoute, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const tools = [
    { id: 'scanner', label: 'Market Matrix Scanner (7 Strategies)', icon: Search, badge: 'Core' },
    { id: 'signals', label: 'Live Signals Radar (+1% TP)', icon: Radio, badge: 'Signals' },
    { id: 'paper-trading', label: 'Paper Trading Desk', icon: LineChart, badge: 'Desk' },
    { id: 'live-trading', label: 'Live Binance Trading Desk', icon: Zap, badge: 'Execution' },
    { id: 'agents', label: '34 Autonomous Trading Agents', icon: Cpu, badge: 'AI Agents' },
    { id: 'command-center', label: 'AI Natural Language Terminal', icon: Terminal, badge: 'Terminal' },
    { id: 'backtests', label: 'Algorithmic Strategy Backtests', icon: TrendingUp, badge: 'Quant' },
    { id: 'replay', label: 'Market Replay Simulator', icon: RotateCcw, badge: 'Replay' },
    { id: 'journal', label: 'Automated Trade Journal', icon: FileText, badge: 'Journal' },
    { id: 'admin', label: 'Rules Engine & System Config', icon: Settings, badge: 'Admin' },
    { id: 'health', label: 'System Health & Watchdog', icon: Shield, badge: 'Safety' },
    { id: 'user-portal', label: 'User Portal & Binance Keys', icon: UserCheck, badge: 'Security' }
  ];

  return (
    <>
      {/* Floating Launcher Pill (Bottom Right Corner) */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d1117] hover:bg-[#161b22] text-[#e6edf3] border border-[#30363d] hover:border-[#39D353] shadow-2xl transition-all duration-200 text-xs font-mono font-bold group"
          title="Open Enterprise Trading Engine Tools"
        >
          <Layers className="w-3.5 h-3.5 text-[#39D353] group-hover:rotate-12 transition-transform" />
          <span>⚡ Enterprise Tools</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#39D353]/20 text-[#39D353]">
            12
          </span>
        </button>
      </div>

      {/* Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm h-full bg-[#0d1117] border-l border-[#30363d] flex flex-col shadow-2xl p-4 font-mono text-xs overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <div>
                  <h3 className="font-bold text-white uppercase tracking-wider">Enterprise Tools</h3>
                  <p className="text-[10px] text-gray-400">All 12 Autonomous Trading Subsystems</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#21262d]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 mt-3 flex-1">
              {tools.map(tool => {
                const Icon = tool.icon;
                const isActive = currentRoute === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      navigate(tool.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition ${
                      isActive
                        ? 'bg-[#161b22] text-[#39D353] border border-[#39D353]/50 font-bold'
                        : 'text-gray-300 hover:text-white hover:bg-[#161b22] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="leading-tight">{tool.label}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#21262d] text-gray-400">
                      {tool.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#30363d] mt-auto">
              <button
                onClick={() => {
                  navigate('dashboard');
                  setIsOpen(false);
                }}
                className="w-full py-2 bg-[#39D353] hover:bg-[#2ea843] text-[#080c14] font-bold rounded-lg transition text-center"
              >
                Return to ScalpPro Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
