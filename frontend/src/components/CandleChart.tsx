import React, { useRef, useState } from 'react';
import { Maximize2, TrendingUp, Zap } from 'lucide-react';

interface CandleData {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandleChartProps {
  candles: CandleData[];
  supportResistance?: Array<{ price: number; type: string; status: string; zoneLow: number; zoneHigh: number }>;
  orderBlocks?: Array<{ low: number; high: number; type: string; status: string }>;
  ema9?: number;
  ema33?: number;
  targetPrice?: number;
  symbol: string;
  timeframe: string;
  onTimeframeChange?: (tf: '15m' | '30m' | '1h' | '1d') => void;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  candles,
  supportResistance = [],
  orderBlocks = [],
  ema9,
  ema33,
  targetPrice,
  symbol,
  timeframe,
  onTimeframeChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  if (!candles || candles.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center bg-[#0c1017] border border-[#1e2638] rounded-xl text-gray-400 font-mono text-xs gap-2">
        <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></div>
        <span>Connecting to real-time market stream for {symbol} ({timeframe})...</span>
      </div>
    );
  }

  // Find min and max for chart scaling
  const visible = candles.slice(-55);
  const minPrice = Math.min(...visible.map(c => c.low));
  const maxPrice = Math.max(...visible.map(c => c.high));
  const priceRange = Math.max(0.0001, maxPrice - minPrice);

  const maxVolume = Math.max(...visible.map(c => c.volume || 1));

  const chartHeight = 340;
  const chartWidth = 780;
  const candleAreaHeight = chartHeight - 50;
  const rightAxisWidth = 65;
  const plotWidth = chartWidth - rightAxisWidth;

  const candleSlotWidth = plotWidth / visible.length;
  const candleWidth = Math.max(3, Math.min(10, candleSlotWidth - 3));

  const getY = (price: number) => {
    return candleAreaHeight - ((price - minPrice) / priceRange) * (candleAreaHeight - 40) - 20;
  };

  const lastCandle = visible[visible.length - 1];
  const lastPrice = lastCandle?.close || 0;
  const isUpSession = lastCandle ? lastCandle.close >= lastCandle.open : true;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const candleIndex = Math.floor((x / plotWidth) * visible.length);

    if (candleIndex >= 0 && candleIndex < visible.length) {
      setHoveredCandle(visible[candleIndex]);
      setMousePos({ x, y });
    }
  };

  return (
    <div className="bg-[#0c1017]/95 border border-[#1e2638] rounded-xl p-3.5 relative font-mono text-xs select-none shadow-xl shadow-black/40">
      {/* Chart Top Header & HUD */}
      <div className="flex flex-wrap justify-between items-center mb-2 pb-2.5 border-b border-[#182030] gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm text-white tracking-wide font-display">{symbol}</span>
            <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded text-[10px] font-bold border border-sky-500/30">
              BINANCE SPOT
            </span>
          </div>

          {/* Timeframe switchers */}
          {onTimeframeChange && (
            <div className="flex items-center bg-[#07090e] p-0.5 rounded-lg border border-[#1e2638] text-[10px]">
              {(['15m', '30m', '1h', '1d'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => onTimeframeChange(tf)}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    timeframe === tf
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Target Price chip */}
          {targetPrice && (
            <div className="hidden sm:flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-emerald-400 font-bold text-[10px]">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>+1.0% TP: ${targetPrice.toFixed(targetPrice > 10 ? 2 : 4)}</span>
            </div>
          )}
        </div>

        {/* OHLC Bar */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          {hoveredCandle ? (
            <div className="text-gray-400 flex gap-2.5">
              <span>O: <strong className="text-gray-200">{hoveredCandle.open}</strong></span>
              <span>H: <strong className="text-emerald-400">{hoveredCandle.high}</strong></span>
              <span>L: <strong className="text-rose-400">{hoveredCandle.low}</strong></span>
              <span>C: <strong className="text-white font-bold">{hoveredCandle.close}</strong></span>
              <span className="text-[10px] text-gray-500">Vol: {hoveredCandle.volume?.toFixed(1) || 0}</span>
            </div>
          ) : (
            <div className="text-gray-400 flex gap-3">
              <span>LAST: <strong className={`font-bold ${isUpSession ? 'text-emerald-400' : 'text-rose-400'}`}>${lastPrice > 50 ? lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : lastPrice.toFixed(4)}</strong></span>
              {ema9 && <span className="text-sky-400">EMA9: {ema9}</span>}
              {ema33 && <span className="text-amber-400">EMA33: {ema33}</span>}
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas for Candles, Volume, and Technical Overlays */}
      <div ref={containerRef} className="relative overflow-hidden rounded-lg bg-[#080b11]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-80 cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setHoveredCandle(null);
            setMousePos(null);
          }}
        >
          <defs>
            <linearGradient id="volGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="volRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
            const price = minPrice + priceRange * ratio;
            const y = getY(price);
            return (
              <g key={idx}>
                <line x1="0" y1={y} x2={plotWidth} y2={y} stroke="#141c2c" strokeDasharray="3,3" />
                <text x={plotWidth + 8} y={y + 3} fill="#64748b" fontSize="9.5" fontFamily="JetBrains Mono">
                  {price.toFixed(price > 100 ? 1 : 4)}
                </text>
              </g>
            );
          })}

          {/* Volume bars in lower section */}
          {visible.map((c, i) => {
            const x = i * candleSlotWidth + (candleSlotWidth - candleWidth) / 2;
            const isGreen = c.close >= c.open;
            const volHeight = Math.max(2, ((c.volume || 1) / maxVolume) * 45);
            const volY = chartHeight - volHeight - 10;

            return (
              <rect
                key={`vol-${i}`}
                x={x}
                y={volY}
                width={candleWidth}
                height={volHeight}
                fill={isGreen ? 'url(#volGreen)' : 'url(#volRed)'}
                rx="1"
              />
            );
          })}

          {/* Support & Resistance Overlays */}
          {supportResistance.map((sr, idx) => {
            const y = getY(sr.price);
            const isSupport = sr.type === 'SUPPORT';
            return (
              <g key={`sr-${idx}`}>
                <line
                  x1="0"
                  y1={y}
                  x2={plotWidth}
                  y2={y}
                  stroke={isSupport ? '#10b981' : '#ef4444'}
                  strokeWidth="1.2"
                  strokeDasharray="4,4"
                  opacity="0.65"
                />
                <rect
                  x="8"
                  y={y - 14}
                  width="110"
                  height="14"
                  fill={isSupport ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                  rx="3"
                />
                <text
                  x="12"
                  y={y - 3}
                  fill={isSupport ? '#34d399' : '#f87171'}
                  fontSize="8.5"
                  fontWeight="bold"
                >
                  {sr.type} (${sr.price.toFixed(sr.price > 10 ? 2 : 4)})
                </text>
              </g>
            );
          })}

          {/* Bullish Order Block Zone Overlay */}
          {orderBlocks.map((ob, idx) => {
            const yTop = getY(ob.high);
            const yBottom = getY(ob.low);
            const height = Math.max(4, yBottom - yTop);
            return (
              <g key={`ob-${idx}`}>
                <rect
                  x="0"
                  y={yTop}
                  width={plotWidth}
                  height={height}
                  fill="rgba(16, 185, 129, 0.12)"
                  stroke="rgba(16, 185, 129, 0.45)"
                  strokeWidth="1"
                  strokeDasharray="3,2"
                />
                <text x="8" y={yTop + 11} fill="#10b981" fontSize="8.5" fontWeight="bold">
                  BULLISH OB [{ob.low.toFixed(2)} - {ob.high.toFixed(2)}]
                </text>
              </g>
            );
          })}

          {/* Candlesticks rendering */}
          {visible.map((c, i) => {
            const x = i * candleSlotWidth + (candleSlotWidth - candleWidth) / 2;
            const isGreen = c.close >= c.open;
            const bodyTop = getY(Math.max(c.open, c.close));
            const bodyBottom = getY(Math.min(c.open, c.close));
            const bodyHeight = Math.max(2, bodyBottom - bodyTop);
            const wickX = x + candleWidth / 2;
            const wickTop = getY(c.high);
            const wickBottom = getY(c.low);
            const color = isGreen ? '#10b981' : '#f43f5e';

            return (
              <g
                key={i}
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredCandle(c)}
              >
                {/* Candle Wick */}
                <line x1={wickX} y1={wickTop} x2={wickX} y2={wickBottom} stroke={color} strokeWidth="1" opacity="0.9" />
                {/* Candle Body */}
                <rect
                  x={x}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  rx="1.5"
                />
              </g>
            );
          })}

          {/* Target Price Line */}
          {targetPrice && (
            <g>
              <line
                x1="0"
                y1={getY(targetPrice)}
                x2={plotWidth}
                y2={getY(targetPrice)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
              <rect
                x={plotWidth}
                y={getY(targetPrice) - 8}
                width={rightAxisWidth}
                height="16"
                fill="#10b981"
                rx="3"
              />
              <text x={plotWidth + 4} y={getY(targetPrice) + 4} fill="#000000" fontSize="9" fontWeight="bold">
                +1% TP
              </text>
            </g>
          )}

          {/* Current Live Price Horizontal Line & Tag */}
          <g>
            <line
              x1="0"
              y1={getY(lastPrice)}
              x2={plotWidth}
              y2={getY(lastPrice)}
              stroke={isUpSession ? '#10b981' : '#f43f5e'}
              strokeWidth="1.2"
              strokeDasharray="2,2"
              opacity="0.8"
            />
            <rect
              x={plotWidth}
              y={getY(lastPrice) - 9}
              width={rightAxisWidth}
              height="18"
              fill={isUpSession ? '#10b981' : '#f43f5e'}
              rx="3"
            />
            <text
              x={plotWidth + 4}
              y={getY(lastPrice) + 3.5}
              fill="#ffffff"
              fontSize="9"
              fontWeight="bold"
              fontFamily="JetBrains Mono"
            >
              ${lastPrice > 100 ? lastPrice.toFixed(1) : lastPrice.toFixed(3)}
            </text>
          </g>

          {/* Interactive Crosshair when hovered */}
          {mousePos && hoveredCandle && (
            <g>
              <line
                x1={mousePos.x}
                y1="0"
                x2={mousePos.x}
                y2={candleAreaHeight}
                stroke="#475569"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <line
                x1="0"
                y1={mousePos.y}
                x2={plotWidth}
                y2={mousePos.y}
                stroke="#475569"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
