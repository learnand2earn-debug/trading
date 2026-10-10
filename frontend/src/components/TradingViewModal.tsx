import React, { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface TradingViewModalProps {
  symbol: string;
  isOpen: boolean;
  timeframe?: string;
  onClose: () => void;
}

export const TradingViewModal: React.FC<TradingViewModalProps> = ({
  symbol,
  isOpen,
  timeframe = '60',
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const formattedSymbol = symbol.toUpperCase().endsWith('USDT') 
    ? `BINANCE:${symbol.toUpperCase()}` 
    : `BINANCE:${symbol.toUpperCase()}USDT`;

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
          interval: timeframe === '15M' ? '15' : timeframe === '4H' ? '240' : timeframe === '1D' ? 'D' : '60',
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
  }, [isOpen, symbol, timeframe]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[85vh] bg-[#0c1017] border border-[#30363d] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#21262d] bg-[#161b22]">
          <div className="flex items-center gap-3">
            <span className="text-xl">📈</span>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {formattedSymbol}
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {timeframe || '1H'} Timeframe
                </span>
              </h2>
              <p className="text-[11px] text-gray-400 font-mono">
                Live Binance Spot Candlesticks & Indicators
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(formattedSymbol)}&interval=${timeframe === '15M' ? '15' : '60'}`}
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
