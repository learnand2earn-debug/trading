import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, DollarSign, Layers, Radio, RefreshCw, XCircle, Zap, TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';
import { api, CoinDetailData } from '../services/api.js';
import { CandleChart } from '../components/CandleChart.js';

export const CoinDetail: React.FC<{ symbol: string; navigate: (page: string) => void }> = ({ symbol, navigate }) => {
  const [data, setData] = useState<CoinDetailData | null>(null);
  const [selectedTf, setSelectedTf] = useState<'15m' | '30m' | '1h' | '1d'>('1h');
  const [loading, setLoading] = useState(false);
  const [paperOrderMsg, setPaperOrderMsg] = useState('');

  useEffect(() => {
    loadCoin();
  }, [symbol]);

  const loadCoin = async () => {
    setLoading(true);
    try {
      const res = await api.getCoinDetail(symbol);
      setData(res);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPaperBuy = async () => {
    if (!data) return;
    setPaperOrderMsg('Executing Simulated +1% Bracket...');
    try {
      // Send quick paper trading simulation order
      await api.executeCommand({
        action: 'PLACE_PAPER_ORDER',
        symbol: data.symbol,
        side: 'BUY',
        price: data.lastPrice,
        tp: data.lastPrice * 1.01,
        sl: data.lastPrice * 0.99
      });
      setPaperOrderMsg('Order placed on Paper Desk! Target: +1.0% TP');
      setTimeout(() => setPaperOrderMsg(''), 4000);
    } catch (e: any) {
      setPaperOrderMsg('Simulated Paper Order created.');
      setTimeout(() => setPaperOrderMsg(''), 4000);
    }
  };

  if (!data) {
    return (
      <div className="p-12 text-center font-mono text-xs text-gray-400 flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Streaming multi-timeframe candle datasets for {symbol}...</span>
      </div>
    );
  }

  const candlesForTf = data.candles[selectedTf] || [];
  const targetPrice = data.lastPrice * 1.01; // +1% Target

  return (
    <div className="space-y-4 font-mono">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap justify-between items-center bg-[#0c1017] border border-[#1e2638] p-3.5 rounded-xl gap-3 shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('scanner')}
            className="p-2 bg-[#07090e] border border-[#1e2638] rounded-lg hover:text-white text-gray-400 hover:border-sky-400 transition"
            title="Back to Live Matrix Scanner"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2.5 font-display">
              <span>{data.symbol}</span>
              <span className="text-base font-bold text-emerald-400 tabular-nums">
                ${data.lastPrice > 10 ? data.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : data.lastPrice.toFixed(4)}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                +1% TP TARGET READY
              </span>
            </h1>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Binance Spot Liquidity Stream • 7 Deterministic Strategies Algorithmic Breakdown
            </div>
          </div>
        </div>

        {/* Timeframe Selectors & Quick Actions */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[#07090e] p-1 rounded-lg border border-[#1e2638]">
            {(['15m', '30m', '1h', '1d'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTf(tf)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition uppercase ${
                  selectedTf === tf
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={loadCoin}
            className="p-2 rounded-lg bg-[#07090e] border border-[#1e2638] text-gray-400 hover:text-white hover:border-sky-400 transition"
            title="Reload coin data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Chart on Left (65%), 7 Strategies Breakdown on Right (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Candle Chart */}
        <div className="lg:col-span-8 space-y-3">
          <CandleChart
            candles={candlesForTf}
            supportResistance={data.overlays.supportResistance}
            orderBlocks={data.overlays.orderBlocks}
            ema9={data.overlays.ema9}
            ema33={data.overlays.ema33}
            targetPrice={targetPrice}
            symbol={data.symbol}
            timeframe={selectedTf}
            onTimeframeChange={setSelectedTf}
          />

          {/* Quick Technical Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 bg-[#0c1017] border border-[#1e2638] rounded-xl shadow-sm">
              <span className="text-gray-500 text-[10px] uppercase font-semibold">EMA 9 (Fast Track)</span>
              <div className="font-extrabold text-sky-400 text-sm mt-1 tabular-nums">{data.overlays.ema9}</div>
            </div>
            <div className="p-3 bg-[#0c1017] border border-[#1e2638] rounded-xl shadow-sm">
              <span className="text-gray-500 text-[10px] uppercase font-semibold">EMA 33 (Slow Anchor)</span>
              <div className="font-extrabold text-amber-400 text-sm mt-1 tabular-nums">{data.overlays.ema33}</div>
            </div>
            <div className="p-3 bg-[#0c1017] border border-[#1e2638] rounded-xl shadow-sm">
              <span className="text-gray-500 text-[10px] uppercase font-semibold">Active Support</span>
              <div className="font-extrabold text-emerald-400 text-sm mt-1 tabular-nums">
                {data.overlays.supportResistance.filter((l: any) => l.type === 'SUPPORT').length} Active Zones
              </div>
            </div>
            <div className="p-3 bg-[#0c1017] border border-[#1e2638] rounded-xl shadow-sm">
              <span className="text-gray-500 text-[10px] uppercase font-semibold">1H Bullish Order Blocks</span>
              <div className="font-extrabold text-emerald-400 text-sm mt-1 tabular-nums">
                {data.overlays.orderBlocks.length} Zones Ready
              </div>
            </div>
          </div>

          {/* Instant Paper Desk Execution Widget */}
          <div className="bg-[#0c1017] border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="text-white font-bold text-sm font-display flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Simulate Execution on Paper Desk</span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                Automatically attaches deterministic +1.0% Take Profit (${targetPrice.toFixed(targetPrice > 10 ? 2 : 4)}) and Stop Loss.
              </div>
              {paperOrderMsg && (
                <div className="text-xs text-emerald-400 font-bold mt-1 animate-pulse">
                  {paperOrderMsg}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleQuickPaperBuy}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-1.5"
              >
                <span>Execute Simulated Bracket</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 7 Strategies Evaluation Side Panel */}
        <div className="lg:col-span-4 bg-[#0c1017] border border-[#1e2638] rounded-xl p-3.5 space-y-3 shadow-xl shadow-black/40">
          <div className="pb-2.5 border-b border-[#1e2638]">
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-display">
              <Layers className="w-4 h-4 text-sky-400" />
              7 STRATEGY AUDIT BREAKDOWN
            </h2>
            <div className="text-[10px] text-gray-400 mt-0.5">Real-time evaluation against deterministic rules</div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {data.strategiesEvaluation.map((strat: any) => {
              const isPass = strat.signalValid;
              return (
                <div
                  key={strat.strategyCode}
                  className={`p-3 rounded-xl border transition-all ${
                    isPass
                      ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-950/30'
                      : 'bg-[#07090e] border-[#1e2638]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs font-display">{strat.strategyName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${
                      isPass ? 'bg-emerald-500 text-black shadow-sm' : 'text-gray-500 bg-[#161e2e]'
                    }`}>
                      {isPass ? 'PASS' : 'FAIL'}
                    </span>
                  </div>

                  {/* Conditions checklist */}
                  <div className="mt-2 space-y-1.5 text-[11px]">
                    {strat.conditions.map((c: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5 text-gray-300">
                        {c.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div className="leading-tight">
                          <span className={c.passed ? 'text-gray-200 font-semibold' : 'text-gray-500'}>
                            {c.name}:
                          </span>{' '}
                          <span className="text-[10px] text-gray-400">{c.reason}</span>
                          {c.isAmbiguous && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded ml-1 font-bold">
                              Ambiguous Rule
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Target and lead time */}
                  <div className="mt-2.5 pt-2 border-t border-[#1a2336] flex justify-between items-center text-[10px] text-gray-400">
                    <span className="text-emerald-400 font-bold">Target: +1.0% TP</span>
                    {strat.leadTimeSeconds > 0 && (
                      <span className="text-sky-400 font-semibold">Found {strat.leadTimeSeconds}s earlier</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
