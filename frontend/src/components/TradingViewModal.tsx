import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface TradingViewModalProps {
  symbol: string;
  isOpen: boolean;
  timeframe?: string;
  onClose: () => void;
  onTimeframeChange?: (tf: string) => void;
}

const TIMEFRAMES = [
  { label: '15M', interval: '15' },
  { label: '30M', interval: '30' },
  { label: '1H', interval: '60' },
  { label: '4H', interval: '240' },
  { label: '1D', interval: 'D' },
  { label: '1W', interval: 'W' }
];

const mapInterval = (tf: string): string => {
  const upper = (tf || '1H').toUpperCase();
  if (upper === '15M' || upper === '15') return '15';
  if (upper === '30M' || upper === '30') return '30';
  if (upper === '1H' || upper === '60') return '60';
  if (upper === '4H' || upper === '240') return '240';
  if (upper === '1D' || upper === 'D') return 'D';
  if (upper === '1W' || upper === 'W') return 'W';
  return '60';
};

export const TradingViewModal: React.FC<TradingViewModalProps> = ({
  symbol,
  isOpen,
  timeframe = '1H',
  onClose,
  onTimeframeChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTf, setActiveTf] = useState<string>(timeframe);

  // Keep activeTf synced with timeframe prop
  useEffect(() => {
    if (timeframe) {
      setActiveTf(timeframe.toUpperCase());
    }
  }, [timeframe]);

  const rawClean = symbol.toUpperCase().replace('USDT', '');
  const formattedSymbol = `BINANCE:${rawClean}USDT`;
  const currentInterval = mapInterval(activeTf);

  const handleSelectTf = (tfLabel: string) => {
    setActiveTf(tfLabel);
    if (onTimeframeChange) {
      onTimeframeChange(tfLabel);
    }
  };

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: formattedSymbol,
          interval: currentInterval,
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#080c14',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: 'tradingview_widget_container',
          backgroundColor: '#080c14',
          gridColor: '#161b22',
          studies: [
            'RSI@tv-basicstudies',
            'MASimple@tv-basicstudies'
          ]
        });
      }
    };
    containerRef.current.appendChild(script);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, symbol, activeTf, currentInterval]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[88vh] bg-[#0c1017] border border-[#30363d] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-[#21262d] bg-[#161b22] gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">📈</span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {formattedSymbol}
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  BINANCE SPOT ONLY
                </span>
              </h2>
              <p className="text-[11px] text-gray-400 font-mono">
                Real-time Binance Candles & Indicators
              </p>
            </div>
          </div>

          {/* Interactive Timeframe Pill Selector */}
          <div className="flex items-center gap-1.5 bg-[#080c14] p-1 rounded-lg border border-[#30363d]">
            {TIMEFRAMES.map(tf => {
              const isSelected = activeTf === tf.label;
              return (
                <button
                  key={tf.label}
                  type="button"
                  onClick={() => handleSelectTf(tf.label)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#238636] text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(formattedSymbol)}&interval=${currentInterval}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-gray-300 hover:text-white text-xs font-semibold transition"
            >
              <span>Open in TradingView</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-rose-500/20 transition"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative flex-1 w-full bg-[#080c14]" ref={containerRef}>
          <div id="tradingview_widget_container" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};
