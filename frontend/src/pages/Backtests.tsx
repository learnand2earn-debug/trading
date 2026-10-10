import React, { useState } from 'react';
import { ArrowUpRight, BarChart3, CheckCircle2, Play, RefreshCw, TrendingUp } from 'lucide-react';
import { api } from '../services/api.js';

export const Backtests: React.FC = () => {
  const [strategy, setStrategy] = useState('V1_METHOD');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleRunBacktest = async () => {
    setLoading(true);
    try {
      const res = await api.runBacktest(strategy, symbol);
      setReport(res.report);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Configuration Panel */}
      <div className="bg-[#151a24] border border-[#232b3e] rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#232b3e]">
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              HISTORICAL BACKTESTING ENGINE
            </h1>
            <p className="text-[11px] text-gray-500">
              Walk-forward execution strictly without look-ahead bias • 1% Target Profit Model
            </p>
          </div>
          <button
            onClick={handleRunBacktest}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded flex items-center gap-2 shadow"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Simulating Historical Bars...' : 'RUN BACKTEST'}
          </button>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Strategy</label>
            <select
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
              className="w-full bg-[#0e121a] border border-[#252f44] rounded p-2 text-white text-xs focus:outline-none"
            >
              <option value="PRICE_ACTION">1. Price Action</option>
              <option value="V1_METHOD">2. V1 Method</option>
              <option value="GAINERS_METHOD">3. Gainers Method</option>
              <option value="HIDDEN_BULLISH">4. Hidden Bullish</option>
              <option value="V1_EMA">5. V1 + EMA</option>
              <option value="OB_METHOD">6. OB Method</option>
              <option value="ICT_METHOD">7. ICT Method</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Trading Pair</label>
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="w-full bg-[#0e121a] border border-[#252f44] rounded p-2 text-white text-xs focus:outline-none"
            >
              <option value="BTCUSDT">BTCUSDT</option>
              <option value="ETHUSDT">ETHUSDT</option>
              <option value="SOLUSDT">SOLUSDT</option>
              <option value="AVAXUSDT">AVAXUSDT</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Target Profit %</label>
            <input
              type="number"
              defaultValue="1.0"
              disabled
              className="w-full bg-[#0e121a] border border-[#252f44] rounded p-2 text-emerald-400 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-[10px] uppercase mb-1">Fees & Slippage</label>
            <div className="p-2 bg-[#0e121a] border border-[#252f44] rounded text-gray-300 text-xs">
              0.1% Fee + 0.05% Slip
            </div>
          </div>
        </div>
      </div>

      {/* Backtest Report Output */}
      {report && (
        <div className="space-y-4">
          {/* Performance Metrics Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#151a24] border border-[#232b3e] p-3 rounded">
              <span className="text-gray-500 text-[10px] uppercase">Win Rate</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{report.winRatePct}%</div>
              <span className="text-gray-400 text-[10px]">
                {report.winningTrades} Wins / {report.losingTrades} Losses
              </span>
            </div>

            <div className="bg-[#151a24] border border-[#232b3e] p-3 rounded">
              <span className="text-gray-500 text-[10px] uppercase">Net Profit USD</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">+${report.netPnlUSD}</div>
              <span className="text-gray-400 text-[10px]">Fees Deducted: ${report.feesUSD}</span>
            </div>

            <div className="bg-[#151a24] border border-[#232b3e] p-3 rounded">
              <span className="text-gray-500 text-[10px] uppercase">Max Drawdown</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{report.maxDrawdownPct}%</div>
              <span className="text-gray-400 text-[10px]">Controlled Risk</span>
            </div>

            <div className="bg-[#151a24] border border-[#232b3e] p-3 rounded">
              <span className="text-gray-500 text-[10px] uppercase">Consecutive Streaks</span>
              <div className="text-2xl font-bold text-white mt-1">{report.consecutiveWins} Wins</div>
              <span className="text-gray-400 text-[10px]">Max Losses in row: {report.consecutiveLosses}</span>
            </div>
          </div>

          {/* Historical Trade Breakdown Table */}
          <div className="bg-[#151a24] border border-[#232b3e] rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#232b3e]">
              <span className="font-bold text-white text-xs">SIMULATED TRADES BREAKDOWN ({report.trades.length})</span>
              <span className="text-[10px] text-gray-500">Historical Candle Simulation</span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left term-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Entry Price</th>
                    <th>Exit Price</th>
                    <th>Gross PnL</th>
                    <th>Fees</th>
                    <th>Net PnL</th>
                    <th>Exit Reason</th>
                    <th>Entry Time</th>
                  </tr>
                </thead>
                <tbody>
                  {report.trades.map((t: any, idx: number) => (
                    <tr key={idx}>
                      <td className="text-gray-500">{idx + 1}</td>
                      <td className="text-gray-200">${t.entryPrice}</td>
                      <td className="text-gray-200">${t.exitPrice}</td>
                      <td className={t.grossPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        ${t.grossPnl} ({t.grossPnlPct}%)
                      </td>
                      <td className="text-gray-500">${t.fees}</td>
                      <td className={t.netPnl >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {t.netPnl >= 0 ? '+' : ''}${t.netPnl} ({t.netPnlPct}%)
                      </td>
                      <td><span className="badge-pass">{t.reason}</span></td>
                      <td className="text-gray-500">{new Date(t.entryTime).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
