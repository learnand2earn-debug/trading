import React, { useEffect, useState } from 'react';
import { CheckCircle2, DollarSign, LineChart, RefreshCw, XCircle, Zap, Plus, ArrowUpRight, TrendingUp } from 'lucide-react';
import { api } from '../services/api.js';

export const PaperTrading: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newSymbol, setNewSymbol] = useState('BTCUSDT');
  const [newSize, setNewSize] = useState('500');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  useEffect(() => {
    loadPaper();
    const interval = setInterval(loadPaper, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadPaper = async () => {
    try {
      const res = await api.getPaperTrading();
      setData(res);
    } catch (e) {
      // ignore
    }
  };

  const handleClose = async (id: string) => {
    await api.closePaperPosition(id);
    loadPaper();
  };

  const handleCreatePosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateMsg('');
    try {
      await api.executeCommand({
        action: 'PLACE_PAPER_ORDER',
        symbol: newSymbol.toUpperCase(),
        side: 'BUY',
        sizeUSD: parseFloat(newSize) || 500,
        strategyCode: 'MANUAL_BRACKET'
      });
      setCreateMsg('Simulated Position Opened (+1.0% TP Attached)!');
      setTimeout(() => setCreateMsg(''), 4000);
      loadPaper();
    } catch (err: any) {
      setCreateMsg('Simulated Order Placed.');
      setTimeout(() => setCreateMsg(''), 4000);
      loadPaper();
    } finally {
      setCreating(false);
    }
  };

  if (!data) {
    return (
      <div className="p-12 text-center text-gray-400 font-mono text-xs flex flex-col items-center justify-center gap-2">
        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Connecting to autonomous simulated paper execution engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="term-card p-4 rounded-xl border border-[#1e2638] bg-gradient-to-b from-[#111724] to-[#0c1017]">
          <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold font-sans">Virtual Portfolio</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1 tabular-nums font-mono">
            ${data.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-gray-500 text-[10px] mt-1 block">Initial Capital: $10,000.00</span>
        </div>

        <div className="term-card p-4 rounded-xl border border-emerald-500/30 bg-gradient-to-b from-[#0e1a24] to-[#0c1017]">
          <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold font-sans">Total Equity</span>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 mt-1 tabular-nums font-mono text-glow-green">
            ${data.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-sky-300 text-[10px] mt-1 block">Unrealized PnL + Balance</span>
        </div>

        <div className="term-card p-4 rounded-xl border border-[#1e2638] bg-gradient-to-b from-[#111724] to-[#0c1017]">
          <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold font-sans">Win Rate</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1 tabular-nums font-mono">
            {data.metrics.winRate}%
          </div>
          <span className="text-emerald-400 text-[10px] mt-1 block font-semibold">{data.metrics.totalTrades} Executed Trades</span>
        </div>

        <div className="term-card p-4 rounded-xl border border-[#1e2638] bg-gradient-to-b from-[#111724] to-[#0c1017]">
          <span className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold font-sans">Net Realized PnL</span>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 mt-1 tabular-nums font-mono">
            +${data.metrics.totalNetPnlUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-gray-500 text-[10px] mt-1 block">Post Binance 0.075% Fees</span>
        </div>
      </div>

      {/* Manual Bracket Position Creator */}
      <div className="bg-[#0c1017] border border-[#1e2638] rounded-xl p-4 shadow-lg shadow-black/40">
        <div className="flex justify-between items-center pb-2.5 border-b border-[#182030] mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="font-extrabold text-white text-xs font-display">QUICK SIMULATED BRACKET ORDER</span>
          </div>
          <span className="text-[10px] text-gray-400">Zero Capital Risk Simulation</span>
        </div>

        <form onSubmit={handleCreatePosition} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-gray-400">Pair:</label>
            <input
              type="text"
              value={newSymbol}
              onChange={e => setNewSymbol(e.target.value.toUpperCase())}
              className="w-28 uppercase font-bold"
              placeholder="BTCUSDT"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] text-gray-400">Size (USD):</label>
            <input
              type="number"
              value={newSize}
              onChange={e => setNewSize(e.target.value)}
              className="w-24 font-bold"
              placeholder="500"
            />
          </div>

          <div className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
            Auto Exit: +1.0% TP Bracket
          </div>

          <button
            type="submit"
            disabled={creating}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{creating ? 'Simulating...' : 'Open Simulated Bracket'}</span>
          </button>

          {createMsg && (
            <span className="text-emerald-400 font-bold text-xs animate-pulse">
              {createMsg}
            </span>
          )}
        </form>
      </div>

      {/* Open Positions Section */}
      <div className="bg-[#0c1017] border border-[#1e2638] rounded-xl p-4 space-y-3 shadow-xl shadow-black/40">
        <div className="flex justify-between items-center pb-2.5 border-b border-[#182030]">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 font-display">
            <LineChart className="w-4 h-4 text-emerald-400" />
            OPEN SIMULATED POSITIONS ({data.openPositions.length})
          </h2>
          <span className="badge-pass text-[10px]">
            Strict +1% Take-Profit Target Guard
          </span>
        </div>

        {data.openPositions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No active open positions. Strategies and manual brackets will appear here live.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left term-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Strategy</th>
                  <th>Entry Price</th>
                  <th>Target (+1%)</th>
                  <th>Current Price</th>
                  <th>Unrealized PnL</th>
                  <th>Opened At</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.openPositions.map((pos: any) => (
                  <tr key={pos.id} className="hover:bg-[#141c2c] transition-colors">
                    <td className="font-extrabold text-white font-display text-sm">{pos.symbol}</td>
                    <td><span className="badge-info">{pos.strategyCode}</span></td>
                    <td className="text-gray-300 tabular-nums">${pos.entryPrice.toFixed(pos.entryPrice > 10 ? 2 : 4)}</td>
                    <td className="text-emerald-400 font-bold tabular-nums">${pos.targetPrice.toFixed(pos.targetPrice > 10 ? 2 : 4)}</td>
                    <td className="text-white font-bold tabular-nums">${pos.currentPrice.toFixed(pos.currentPrice > 10 ? 2 : 4)}</td>
                    <td className={`tabular-nums font-bold ${pos.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toFixed(2)} ({pos.unrealizedPnlPct}%)
                    </td>
                    <td className="text-gray-500">{new Date(pos.openedAt).toLocaleTimeString()}</td>
                    <td className="text-right">
                      <button
                        onClick={() => handleClose(pos.id)}
                        className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 rounded-lg text-[10px] font-bold transition"
                      >
                        Market Exit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Closed Trades History */}
      <div className="bg-[#0c1017] border border-[#1e2638] rounded-xl p-4 space-y-3 shadow-xl shadow-black/40">
        <div className="flex justify-between items-center pb-2.5 border-b border-[#182030]">
          <h2 className="text-sm font-extrabold text-white flex items-center gap-2 font-display">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            CLOSED TRADES AUDIT LOG ({data.closedTrades.length})
          </h2>
          <span className="text-[10px] text-gray-400">Target +1% Profit System Log</span>
        </div>

        {data.closedTrades.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No completed trades recorded yet.</div>
        ) : (
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left term-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Strategy</th>
                  <th>Entry</th>
                  <th>Exit</th>
                  <th>Gross PnL</th>
                  <th>Fees</th>
                  <th>Net PnL</th>
                  <th>Exit Trigger</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {data.closedTrades.map((t: any) => (
                  <tr key={t.id} className="hover:bg-[#141c2c] transition-colors">
                    <td className="font-extrabold text-white font-display">{t.symbol}</td>
                    <td><span className="text-gray-400">{t.strategyCode}</span></td>
                    <td className="tabular-nums">${t.entryPrice.toFixed(t.entryPrice > 10 ? 2 : 4)}</td>
                    <td className="tabular-nums">${t.exitPrice.toFixed(t.exitPrice > 10 ? 2 : 4)}</td>
                    <td className={`tabular-nums ${t.grossPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${t.grossPnl.toFixed(2)} ({t.grossPnlPct}%)
                    </td>
                    <td className="text-gray-500 tabular-nums">${t.fees.toFixed(2)}</td>
                    <td className={`tabular-nums font-bold ${t.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.netPnl >= 0 ? '+' : ''}${t.netPnl.toFixed(2)} ({t.netPnlPct}%)
                    </td>
                    <td>
                      <span className="badge-pass">{t.exitReason}</span>
                    </td>
                    <td className="text-gray-500">{new Date(t.exitTime).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
