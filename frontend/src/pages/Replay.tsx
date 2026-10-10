import React, { useEffect, useState } from 'react';
import { FastForward, Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { api } from '../services/api.js';
import { CandleChart } from '../components/CandleChart.js';

export const Replay: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initReplay();
  }, [symbol, timeframe]);

  const initReplay = async () => {
    setLoading(true);
    try {
      const res = await api.createReplay(symbol, timeframe);
      setSession(res.session);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!session) return;
    try {
      const res = await api.stepReplay(session.sessionId, action);
      setSession(res.session);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Header & Replay Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#151a24] border border-[#232b3e] p-3 rounded-lg gap-3">
        <div>
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-blue-400" />
            HISTORICAL CANDLE-BY-CANDLE REPLAY
          </h1>
          <p className="text-[11px] text-gray-500">Step through historical market bars for deterministic strategy verification</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction('RESET')}
            className="p-1.5 bg-[#0e121a] border border-[#252f44] rounded text-gray-400 hover:text-white"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAction(session?.status === 'PLAYING' ? 'PAUSE' : 'PLAY')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-1.5"
          >
            {session?.status === 'PLAYING' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {session?.status === 'PLAYING' ? 'PAUSE' : 'PLAY'}
          </button>
          <button
            onClick={() => handleAction('NEXT')}
            className="px-3 py-1.5 bg-[#0e121a] border border-[#252f44] text-white hover:bg-[#1a2335] rounded flex items-center gap-1.5 font-bold"
          >
            <SkipForward className="w-3.5 h-3.5" />
            NEXT BAR
          </button>
          <button
            onClick={() => handleAction('FAST_FORWARD')}
            className="px-3 py-1.5 bg-[#0e121a] border border-[#252f44] text-white hover:bg-[#1a2335] rounded flex items-center gap-1.5 font-bold"
          >
            <FastForward className="w-3.5 h-3.5" />
            +5 BARS
          </button>
        </div>
      </div>

      {session && (
        <div className="space-y-4">
          {/* Candle Chart */}
          <CandleChart
            candles={session.visibleCandles || []}
            symbol={session.symbol}
            timeframe={session.timeframe}
            ema9={session.indicators?.ema9}
            ema33={session.indicators?.ema33}
          />

          {/* Replay Indicators Telemetry Panel */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3 bg-[#151a24] border border-[#232b3e] rounded">
              <span className="text-gray-500 text-[10px] uppercase">Replay Progress</span>
              <div className="font-bold text-white mt-1">
                Bar {session.currentIndex + 1} / {session.totalCandles}
              </div>
            </div>

            <div className="p-3 bg-[#151a24] border border-[#232b3e] rounded">
              <span className="text-gray-500 text-[10px] uppercase">Wilder's RSI (14)</span>
              <div className={`font-bold mt-1 ${session.indicators?.rsi14 >= 25 && session.indicators?.rsi14 <= 40 ? 'text-emerald-400' : 'text-gray-300'}`}>
                {session.indicators?.rsi14}
              </div>
            </div>

            <div className="p-3 bg-[#151a24] border border-[#232b3e] rounded">
              <span className="text-gray-500 text-[10px] uppercase">EMA 9 / EMA 33</span>
              <div className="font-bold text-blue-400 mt-1">
                {session.indicators?.ema9} / <span className="text-amber-400">{session.indicators?.ema33}</span>
              </div>
            </div>

            <div className="p-3 bg-[#151a24] border border-[#232b3e] rounded">
              <span className="text-gray-500 text-[10px] uppercase">V1 Indicator State</span>
              <div className="mt-1">
                <span className="badge-pass">{session.indicators?.v1State}</span>
              </div>
            </div>

            <div className="p-3 bg-[#151a24] border border-[#232b3e] rounded">
              <span className="text-gray-500 text-[10px] uppercase">1H Trend State</span>
              <div className="font-bold text-emerald-400 mt-1">{session.indicators?.trend}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
