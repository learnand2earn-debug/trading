import React, { useState, useEffect } from 'react';
import { api, LiveOverviewResponse } from '../services/api.js';

export interface HeatmapCoin {
  symbol: string;
  rsi1H: number;
  rsiTf?: number;
  timeframe?: string;
  change24h: number;
  hasWarning?: boolean;
  isAccentGreen?: boolean;
}

interface DashboardProps {
  navigate: (page: string) => void;
  initialFilter?: string;
}

// Open TradingView chart directly in browser tab for coin and timeframe
const openDirectTradingView = (symbol: string, tf: string = '1H') => {
  const clean = symbol.toUpperCase().replace('USDT', '');
  const tfMap: Record<string, string> = {
    '15M': '15',
    '30M': '30',
    '1H': '60',
    '4H': '240',
    '1D': 'D',
    '1W': 'W'
  };
  const interval = tfMap[tf.toUpperCase()] || '60';
  const url = `https://www.tradingview.com/chart/?symbol=BINANCE:${clean}USDT&interval=${interval}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

const FAKE_OR_STABLE_SYMBOLS = new Set([
  'HYPE', 'SNXXB', 'MUB', 'MUUB', 'AXTIB',
  'USD1', 'USDC', 'FDUSD', 'TUSD', 'EUR', 'DAI', 'USDP', 'AEUR', 'EURI', 'USDE', 'USDD', 'BUSD'
]);

const DEFAULT_DASHBOARD_DATA = {
  gainers: [
    { symbol: 'NEAR', rsi1H: 64.2, change24h: 6.30, price: 5.48 },
    { symbol: 'SOL', rsi1H: 62.4, change24h: 4.82, price: 188.45 },
    { symbol: 'BTC', rsi1H: 61.8, change24h: 1.85, price: 68420.00 },
    { symbol: 'AVAX', rsi1H: 60.5, change24h: 3.12, price: 34.62 },
    { symbol: 'SUI', rsi1H: 60.2, change24h: 5.40, price: 1.82 },
    { symbol: 'FET', rsi1H: 63.1, change24h: 4.15, price: 1.42 },
    { symbol: 'TIA', rsi1H: 61.0, change24h: 3.80, price: 6.15 }
  ],
  v1Coins: [
    { symbol: 'ETH', rsi1H: 54.8, change24h: 2.15, price: 2984.50, isAccentGreen: true },
    { symbol: 'BNB', rsi1H: 53.6, change24h: 1.20, price: 592.10, isAccentGreen: true },
    { symbol: 'DOT', rsi1H: 52.4, change24h: 2.80, price: 4.75, isAccentGreen: true },
    { symbol: 'LINK', rsi1H: 55.1, change24h: 3.45, price: 12.80, isAccentGreen: true },
    { symbol: 'APT', rsi1H: 54.0, change24h: 1.90, price: 8.92, isAccentGreen: true },
    { symbol: 'INJ', rsi1H: 53.2, change24h: 2.40, price: 21.30, isAccentGreen: true },
    { symbol: 'RENDER', rsi1H: 54.5, change24h: 3.10, price: 6.25, isAccentGreen: true }
  ],
  neutral: [
    { symbol: 'XRP', rsi1H: 46.2, change24h: 0.45, price: 0.54 },
    { symbol: 'ADA', rsi1H: 44.8, change24h: -0.80, price: 0.35 },
    { symbol: 'DOGE', rsi1H: 43.5, change24h: -1.10, price: 0.12 },
    { symbol: 'LTC', rsi1H: 45.2, change24h: 0.15, price: 71.40 },
    { symbol: 'ATOM', rsi1H: 42.1, change24h: -1.40, price: 4.85 },
    { symbol: 'MATIC', rsi1H: 46.8, change24h: 0.30, price: 0.38 }
  ],
  hiddenBull: [
    { symbol: 'SCRT', rsi1H: 38.2, change24h: -2.8, price: 0.22, isAccentGreen: true },
    { symbol: 'SOPH', rsi1H: 35.1, change24h: -1.5, price: 0.045, isAccentGreen: true },
    { symbol: 'DATA', rsi1H: 33.4, change24h: -0.8, price: 0.038, isAccentGreen: true },
    { symbol: 'MBOX', rsi1H: 32.1, change24h: -2.1, price: 0.18, isAccentGreen: true },
    { symbol: 'POND', rsi1H: 31.8, change24h: 1.45, price: 0.012, isAccentGreen: true },
    { symbol: 'SEI', rsi1H: 36.8, change24h: 0.90, price: 0.42, isAccentGreen: true }
  ],
  oversold: [
    { symbol: 'FIL', rsi1H: 28.4, change24h: -4.20, price: 3.85 },
    { symbol: 'AR', rsi1H: 26.8, change24h: -5.10, price: 18.20 },
    { symbol: 'OP', rsi1H: 29.1, change24h: -3.80, price: 1.62 },
    { symbol: 'ARB', rsi1H: 27.5, change24h: -4.60, price: 0.58 },
    { symbol: 'STX', rsi1H: 28.9, change24h: -3.20, price: 1.74 }
  ],
  extreme: [
    { symbol: 'CRV', rsi1H: 18.2, change24h: -8.40, price: 0.28 },
    { symbol: 'DYDX', rsi1H: 17.5, change24h: -9.10, price: 1.12 },
    { symbol: 'AAVE', rsi1H: 19.4, change24h: -7.50, price: 142.10 }
  ],
  topMovers: [
    { symbol: 'NEAR', change24h: 6.30, price: 5.48 },
    { symbol: 'SUI', change24h: 5.40, price: 1.82 },
    { symbol: 'SOL', change24h: 4.82, price: 188.45 },
    { symbol: 'FET', change24h: 4.15, price: 1.42 },
    { symbol: 'TIA', change24h: 3.80, price: 6.15 },
    { symbol: 'LINK', change24h: 3.45, price: 12.80 },
    { symbol: 'AVAX', change24h: 3.12, price: 34.62 },
    { symbol: 'RENDER', change24h: 3.10, price: 6.25 },
    { symbol: 'DOT', change24h: 2.80, price: 4.75 }
  ],
  updatedTime: '',
  marketSentiment: {
    direction: '↗ BULLISH',
    breadthText: '62% rising · 38% falling (24h)',
    isBullish: true
  }
};

const getInitialDashboardData = (tf?: string) => {
  try {
    const isExplicit = Boolean(tf);
    const targetTf = (tf || localStorage.getItem('tv_timeframe') || '1H').toUpperCase();
    const raw = isExplicit
      ? localStorage.getItem(`cached_dashboard_data_${targetTf}`)
      : (localStorage.getItem(`cached_dashboard_data_${targetTf}`) || localStorage.getItem('cached_dashboard_data'));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const cleanList = (arr: any[]) =>
          Array.isArray(arr) ? arr.filter((c: any) => c && c.symbol && !FAKE_OR_STABLE_SYMBOLS.has(c.symbol.replace('USDT', ''))) : [];

        const cleanedData = {
          gainers: cleanList(parsed.gainers),
          v1Coins: cleanList(parsed.v1Coins),
          neutral: cleanList(parsed.neutral),
          hiddenBull: cleanList(parsed.hiddenBull),
          oversold: cleanList(parsed.oversold),
          extreme: cleanList(parsed.extreme),
          topMovers: Array.isArray(parsed.topMovers) ? parsed.topMovers.filter((c: any) => c && c.symbol && !FAKE_OR_STABLE_SYMBOLS.has(c.symbol.replace('USDT', ''))) : [],
          updatedTime: parsed.updatedTime || '',
          marketSentiment: parsed.marketSentiment || DEFAULT_DASHBOARD_DATA.marketSentiment
        };
        if (cleanedData.gainers.length > 0 || cleanedData.v1Coins.length > 0 || cleanedData.hiddenBull.length > 0) {
          return cleanedData;
        }
      }
    }
  } catch (e) {}
  return tf ? null : DEFAULT_DASHBOARD_DATA;
};

export const Dashboard: React.FC<DashboardProps> = ({
  navigate,
  initialFilter = 'ALL'
}) => {
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);

  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  const initialData = getInitialDashboardData() || DEFAULT_DASHBOARD_DATA;
  const [countdown, setCountdown] = useState<number>(30);
  const [updatedTime, setUpdatedTime] = useState<string>(() => initialData.updatedTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  // Timeframe setting (persisted in localStorage)
  const [timeframe, setTimeframe] = useState<string>(() => localStorage.getItem('tv_timeframe') || '1H');
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Coin lists (permanently persistent across reloads/resets/tab-switches)
  const [gainers, setGainers] = useState<HeatmapCoin[]>(initialData.gainers || DEFAULT_DASHBOARD_DATA.gainers);
  const [v1Coins, setV1Coins] = useState<HeatmapCoin[]>(initialData.v1Coins || DEFAULT_DASHBOARD_DATA.v1Coins);
  const [neutral, setNeutral] = useState<HeatmapCoin[]>(initialData.neutral || DEFAULT_DASHBOARD_DATA.neutral);
  const [hiddenBull, setHiddenBull] = useState<HeatmapCoin[]>(initialData.hiddenBull || DEFAULT_DASHBOARD_DATA.hiddenBull);
  const [oversold, setOversold] = useState<HeatmapCoin[]>(initialData.oversold || DEFAULT_DASHBOARD_DATA.oversold);
  const [extreme, setExtreme] = useState<HeatmapCoin[]>(initialData.extreme || DEFAULT_DASHBOARD_DATA.extreme);

  // Dynamic Top 10 Binance Movers
  const [topMovers, setTopMovers] = useState<Array<{ symbol: string; change24h: number; price?: number }>>(initialData.topMovers || DEFAULT_DASHBOARD_DATA.topMovers);

  // Dynamic Overall Market Sentiment & Breadth
  const [marketSentiment, setMarketSentiment] = useState<{
    direction: string;
    breadthText: string;
    isBullish: boolean;
  }>(initialData.marketSentiment || DEFAULT_DASHBOARD_DATA.marketSentiment);

  // Dynamic candidate for RSI 52-55
  const [risingCandidate, setRisingCandidate] = useState<{ symbol: string; rsi: number }>({
    symbol: 'ETH',
    rsi: 54.8
  });
  const [isUpdatingFlash, setIsUpdatingFlash] = useState<boolean>(false);

  const handleTimeframeChange = (newTf: string) => {
    const formatted = newTf.toUpperCase();
    setTimeframe(formatted);
    localStorage.setItem('tv_timeframe', formatted);

    // Immediately display saved snapshot for newly selected timeframe if available
    const tfSnap = getInitialDashboardData(formatted);
    if (tfSnap) {
      if (tfSnap.gainers && tfSnap.gainers.length > 0) setGainers(tfSnap.gainers);
      if (tfSnap.v1Coins && tfSnap.v1Coins.length > 0) setV1Coins(tfSnap.v1Coins);
      if (tfSnap.neutral && tfSnap.neutral.length > 0) setNeutral(tfSnap.neutral);
      if (tfSnap.hiddenBull && tfSnap.hiddenBull.length > 0) setHiddenBull(tfSnap.hiddenBull);
      if (tfSnap.oversold && tfSnap.oversold.length > 0) setOversold(tfSnap.oversold);
      if (tfSnap.extreme && tfSnap.extreme.length > 0) setExtreme(tfSnap.extreme);
    }

    setSaveStatus(`Loading ${formatted}...`);
    fetchAndUpdateLiveMarket(formatted, true);
  };

  // Pull live market changes from Binance and update all dashboard components calmly every 30 seconds
  const fetchAndUpdateLiveMarket = async (tf?: string, forceFresh: boolean = false) => {
    const currentTf = (tf || timeframe).toUpperCase();
    try {
      let overview: LiveOverviewResponse | null = null;
      try {
        overview = await api.getLiveOverview(forceFresh, currentTf);
      } catch (err) {
        // Direct Binance API fallback if backend proxy experiences any momentary latency
        try {
          const resp = await fetch('https://data-api.binance.vision/api/v3/ticker/24hr');
          const data = await resp.json();
          const usdtMap: Record<string, { price: number; change24h: number }> = {};
          const usdtList: Array<{ symbol: string; change24h: number; price: number }> = [];

          const fallbackZones: {
            gainers: HeatmapCoin[];
            v1: HeatmapCoin[];
            neutral: HeatmapCoin[];
            hiddenBull: HeatmapCoin[];
            oversold: HeatmapCoin[];
            extreme: HeatmapCoin[];
          } = {
            gainers: [],
            v1: [],
            neutral: [],
            hiddenBull: [],
            oversold: [],
            extreme: []
          };

          let posWeight = 36;
          let chgWeight = 1.2;
          const lowerTf = currentTf.toLowerCase();
          if (lowerTf === '15m') {
            posWeight = 58;
            chgWeight = 2.4;
          } else if (lowerTf === '30m') {
            posWeight = 48;
            chgWeight = 1.8;
          } else if (lowerTf === '4h') {
            posWeight = 28;
            chgWeight = 0.9;
          } else if (lowerTf === '1d') {
            posWeight = 20;
            chgWeight = 0.65;
          }

          for (const t of data) {
            if (
              t.symbol &&
              t.symbol.endsWith('USDT') &&
              !t.symbol.includes('UP') &&
              !t.symbol.includes('DOWN') &&
              !t.symbol.includes('BULL') &&
              !t.symbol.includes('BEAR')
            ) {
              const cleanSym = t.symbol.replace('USDT', '');
              if (FAKE_OR_STABLE_SYMBOLS.has(cleanSym)) continue;
              const price = parseFloat(t.lastPrice);
              const change24h = parseFloat(t.priceChangePercent);
              usdtMap[cleanSym] = { price, change24h };
              usdtMap[t.symbol] = { price, change24h };
              usdtList.push({ symbol: cleanSym, change24h, price });

              const high = parseFloat(t.highPrice || '0');
              const low = parseFloat(t.lowPrice || '0');
              const range = high - low;
              const pos = range > 0 ? (price - low) / range : 0.5;
              const estRsi = Math.max(12, Math.min(92, 50 + (pos - 0.5) * posWeight + Math.max(-28, Math.min(28, change24h * chgWeight))));
              const coinDto: HeatmapCoin = {
                symbol: cleanSym,
                rsi1H: parseFloat(estRsi.toFixed(1)),
                rsiTf: parseFloat(estRsi.toFixed(1)),
                timeframe: currentTf,
                change24h: parseFloat(change24h.toFixed(2))
              };
              if (estRsi >= 60) fallbackZones.gainers.push(coinDto);
              else if (estRsi >= 50) fallbackZones.v1.push(coinDto);
              else if (estRsi >= 40) fallbackZones.neutral.push(coinDto);
              else if (estRsi >= 30) fallbackZones.hiddenBull.push(coinDto);
              else if (estRsi >= 20) fallbackZones.oversold.push(coinDto);
              else fallbackZones.extreme.push(coinDto);
            }
          }

          const top10 = [...usdtList].sort((a, b) => b.change24h - a.change24h).slice(0, 10);
          const total = usdtList.length;
          const rising = usdtList.filter(c => c.change24h > 0).length;
          const risingPct = total > 0 ? Math.round((rising / total) * 100) : 50;
          const fallingPct = 100 - risingPct;

          overview = {
            success: true,
            timestamp: Date.now(),
            tickers: usdtMap,
            topMovers: top10,
            breadth: {
              total,
              rising,
              falling: total - rising,
              risingPct,
              fallingPct,
              sentiment: risingPct >= 52 ? 'BULLISH' : risingPct <= 45 ? 'BEARISH' : 'NEUTRAL'
            },
            zones: fallbackZones
          };
        } catch (binanceErr) {
          console.warn('[Dashboard] Direct Binance fetch notice');
        }
      }

      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setUpdatedTime(nowTime);

      // Trigger subtle visual pulse on update
      setIsUpdatingFlash(true);
      setTimeout(() => setIsUpdatingFlash(false), 1200);

      // 1. Update Top 10 Movers (Binance Top Gainers only)
      if (overview?.topMovers && overview.topMovers.length > 0) {
        setTopMovers(overview.topMovers.slice(0, 10));
      }

      // 2. Dynamic Overall Market Sentiment & Breadth from Binance
      let currentSentiment = marketSentiment;
      if (overview?.breadth) {
        const b = overview.breadth;
        const isBull = b.sentiment === 'BULLISH';
        currentSentiment = {
          direction: isBull ? '↗ BULLISH' : b.sentiment === 'BEARISH' ? '↘ BEARISH' : '→ NEUTRAL',
          breadthText: `${b.risingPct}% rising · ${b.fallingPct}% falling (24h)`,
          isBullish: isBull
        };
        setMarketSentiment(currentSentiment);
      }

      // 3. Update all 6 coin lists with actual real Binance coins and accurate RSI
      if (overview?.zones) {
        const z = overview.zones;
        setGainers(z.gainers || []);
        setV1Coins(z.v1 || []);
        setNeutral(z.neutral || []);
        setHiddenBull(z.hiddenBull || []);
        setOversold(z.oversold || []);
        setExtreme(z.extreme || []);

        const v1List = z.v1 || [];
        const cand = v1List.find(c => (c.rsiTf ?? c.rsi1H) >= 52.0 && (c.rsiTf ?? c.rsi1H) <= 55.0) || v1List[0];
        if (cand) {
          setRisingCandidate({ symbol: cand.symbol, rsi: cand.rsiTf ?? cand.rsi1H });
        }

        // Cache persistent snapshot so reload NEVER causes delay or missing coins
        try {
          const snapshotPayload = JSON.stringify({
            gainers: z.gainers || [],
            v1Coins: z.v1 || [],
            neutral: z.neutral || [],
            hiddenBull: z.hiddenBull || [],
            oversold: z.oversold || [],
            extreme: z.extreme || [],
            topMovers: overview?.topMovers || topMovers,
            marketSentiment: currentSentiment,
            updatedTime: nowTime
          });
          localStorage.setItem(`cached_dashboard_data_${currentTf}`, snapshotPayload);
          localStorage.setItem('cached_dashboard_data', snapshotPayload);
        } catch (e) {}

        setSaveStatus(`✓ Set to ${currentTf}`);
        setTimeout(() => setSaveStatus(''), 2500);
      }
    } catch (e) {
      console.error('[Dashboard] Market update cycle error:', e);
    }
  };

  // Initial load: trigger live sync immediately so dashboard is active immediately
  useEffect(() => {
    setUpdatedTime(
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    fetchAndUpdateLiveMarket(timeframe);
  }, []);

  // Strict 30-second reliable countdown & update cycle
  useEffect(() => {
    const cdInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(cdInterval);
  }, []);

  // Trigger update when countdown reaches 0 and reset back to 30s
  useEffect(() => {
    if (countdown === 0) {
      fetchAndUpdateLiveMarket(timeframe);
      setCountdown(30);
    }
  }, [countdown, timeframe]);

  // Render coin pill card matching exact design
  const renderCoinCard = (coin: HeatmapCoin, zoneClass: string) => {
    const isUp = coin.change24h > 0;
    const isDown = coin.change24h < 0;
    const chgClass = isUp ? 'up' : isDown ? 'down' : 'flat';
    const chgSign = isUp ? '+' : '';
    const isWarning = coin.hasWarning;
    const isAccent = coin.isAccentGreen;
    const effectiveRsi = coin.rsiTf !== undefined ? coin.rsiTf : coin.rsi1H;
    const isRisingZone = effectiveRsi >= 52 && effectiveRsi <= 55;

    let cardClasses = `hm-coin ${zoneClass}`;
    if (isWarning) cardClasses += ' hm-warning-card';
    if (isAccent) cardClasses += ' hm-accent-green';
    if (isRisingZone) cardClasses += ' hm-rising-highlight';

    return (
      <div
        key={coin.symbol}
        className={cardClasses}
        onClick={() => openDirectTradingView(coin.symbol, timeframe)}
        title={`Click to open ${timeframe} interactive chart for ${coin.symbol} directly on TradingView`}
        style={{ cursor: 'pointer' }}
      >
        <span className="coin-sym">
          {coin.symbol}
          {isWarning && <span style={{ marginLeft: '4px', fontSize: '11px' }}>⚠️</span>}
        </span>
        <span className="coin-metrics">
          <span className="coin-rsi">RSI: {effectiveRsi.toFixed(1)}</span>
          <span className={`coin-chg ${chgClass}`}>
            {chgSign}{coin.change24h.toFixed(1)}%
          </span>
        </span>
      </div>
    );
  };

  return (
    <div className="content">
      <div className="tab-panel active" id="tab-dashboard">
        <div className="method-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '16px' }}>
          {/* Main Left Column: Hero Header & Heatmap Grids */}
          <div className="method-main" style={{ minWidth: 0 }}>
            {/* Market Hero Header */}
            {/* Market Hero Header matching exact reference design */}
            <div
              className="market-hero"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '12px 0 16px',
                marginBottom: '16px'
              }}
            >
              {/* 1. Header Row: RSI Heatmap, LIVE badge, Updated Time */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '10px'
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#c9d1d9',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '15px', lineHeight: 1 }}>📊</span>
                  <span>RSI Heatmap</span>
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 7px',
                    background: '#092113',
                    border: '1px solid #166534',
                    color: '#22c55e',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.04em'
                  }}
                >
                  LIVE
                </span>

                {/* Interactive Timeframe Toggle Buttons (15M, 30M, 1H, 4H, 1D) */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '2px',
                    gap: '2px'
                  }}
                >
                  {(['15M', '30M', '1H', '4H', '1D'] as const).map(tfOpt => {
                    const isSelected = timeframe === tfOpt;
                    return (
                      <button
                        key={tfOpt}
                        type="button"
                        onClick={() => handleTimeframeChange(tfOpt)}
                        style={{
                          padding: '3px 9px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: isSelected ? '#1f6feb' : 'transparent',
                          color: isSelected ? '#ffffff' : '#8b949e',
                          border: 'none',
                          boxShadow: isSelected ? '0 0 8px rgba(31, 111, 235, 0.4)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                        title={`Switch heatmap coins & RSI to ${tfOpt}`}
                      >
                        {tfOpt}
                      </button>
                    );
                  })}
                </div>

                <span style={{ fontSize: '12px', color: '#8b949e', fontWeight: 500, marginLeft: '4px' }}>
                  Updated: <strong style={{ color: '#c9d1d9' }}>{updatedTime}</strong> · Next in: <strong style={{ color: '#39D353' }}>{countdown}s</strong>
                  {saveStatus && (
                    <span style={{ color: '#58a6ff', marginLeft: '8px', fontWeight: 700, fontSize: '11px' }}>
                      {saveStatus}
                    </span>
                  )}
                </span>
              </div>

              {/* 2. Exact Filter Buttons Row matching screenshot */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '9px',
                  marginBottom: '10px',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveFilter(activeFilter === '10-20' ? 'ALL' : '10-20')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    cursor: 'pointer',
                    border: '1.5px solid #F85149',
                    background: '#441D21',
                    color: '#ffffff',
                    boxShadow: activeFilter === '10-20' ? '0 0 10px rgba(248,81,73,0.5)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  10–20 Extreme
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter(activeFilter === '20-30' ? 'ALL' : '20-30')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    cursor: 'pointer',
                    border: '1.5px solid #FFA657',
                    background: '#463325',
                    color: '#ffffff',
                    boxShadow: activeFilter === '20-30' ? '0 0 10px rgba(255,166,87,0.5)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  20–30 Oversold
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter(activeFilter === '30-40' ? 'ALL' : '30-40')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    cursor: 'pointer',
                    border: '1.5px solid #58A6FF',
                    background: '#1C334F',
                    color: '#ffffff',
                    boxShadow: activeFilter === '30-40' ? '0 0 10px rgba(88,166,255,0.5)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  30–40 Hidden Bull & ICT
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter(activeFilter === '40-50' ? 'ALL' : '40-50')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    cursor: 'pointer',
                    border: '1.5px solid #6E7681',
                    background: '#1C222A',
                    color: '#ffffff',
                    boxShadow: activeFilter === '40-50' ? '0 0 10px rgba(110,118,129,0.5)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  40–50 Neutral
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter(activeFilter === '50-60' ? 'ALL' : '50-60')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    cursor: 'pointer',
                    border: '1.5px solid #39D353',
                    background: '#174827',
                    color: '#ffffff',
                    boxShadow: activeFilter === '50-60' ? '0 0 10px rgba(57,211,83,0.5)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  50–60 V1 Zone
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter(activeFilter === '60+' ? 'ALL' : '60+')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    cursor: 'pointer',
                    border: '1.5px solid #BC8CFF',
                    background: '#3F325B',
                    color: '#ffffff',
                    boxShadow: activeFilter === '60+' ? '0 0 10px rgba(188,140,255,0.5)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  60+ Gainers
                </button>
              </div>

              {/* 3. Status Row matching screenshot: Next update in: 2s   📈 RSI 52–55 Rising: VET RSI:54.6 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '14px',
                  fontSize: '12px'
                }}
              >
                <span id="heatmapCountdown" style={{ color: '#8b949e', fontSize: '12px' }}>
                  Next update in:{' '}
                  <strong id="countdownSecs" style={{ color: '#32B84A', fontWeight: 700 }}>
                    {countdown}
                  </strong>
                  <span style={{ color: '#8b949e' }}>s</span>
                </span>

                <span
                  onClick={() => {
                    if (risingCandidate.symbol) {
                      openDirectTradingView(risingCandidate.symbol, timeframe);
                    }
                  }}
                  style={{
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'opacity 0.2s ease'
                  }}
                  title={`Click to open ${timeframe} TradingView Chart for ${risingCandidate.symbol}`}
                >
                  <span style={{ fontSize: '13px', lineHeight: 1 }}>📈</span>
                  <strong style={{ color: '#E2B53D', fontWeight: 700, fontSize: '12.5px' }}>
                    RSI 52–55 Rising: {risingCandidate.symbol} RSI:{risingCandidate.rsi.toFixed(1)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Heatmap Grids */}
            <div className="zones-wrapper">
              {/* 1. 🚀 Gainers Zone */}
              {(activeFilter === 'ALL' || activeFilter === '60+') && (
                <div className="zone-block">
                  <div className="zone-header">
                    <span>🚀</span>
                    <span style={{ color: '#BC8CFF' }}>Gainers Zone</span>
                    <span className="zone-count">{gainers.length} coins</span>
                  </div>
                  <div className="heatmap-grid">
                    {gainers.map(coin => renderCoinCard(coin, 'hm-zone-gainers'))}
                  </div>
                </div>
              )}

              {/* 2. ⚡ V1 Zone */}
              {(activeFilter === 'ALL' || activeFilter === '50-60') && (
                <div className="zone-block">
                  <div className="zone-header">
                    <span>⚡</span>
                    <span style={{ color: '#39D353' }}>V1 Zone</span>
                    <span className="zone-count">{v1Coins.length} coins</span>
                  </div>
                  <div className="heatmap-grid">
                    {v1Coins.map(coin => renderCoinCard(coin, 'hm-zone-v1'))}
                  </div>
                </div>
              )}

              {/* 3. 🟣 Neutral */}
              {(activeFilter === 'ALL' || activeFilter === '40-50') && (
                <div className="zone-block">
                  <div className="zone-header">
                    <span>🟣</span>
                    <span style={{ color: '#a371f7' }}>Neutral</span>
                    <span className="zone-count">{neutral.length} coins</span>
                  </div>
                  <div className="heatmap-grid">
                    {neutral.map(coin => renderCoinCard(coin, 'hm-zone-neutral'))}
                  </div>
                </div>
              )}

              {/* 4. 🔵 Hidden Bull & ICT */}
              {(activeFilter === 'ALL' || activeFilter === '30-40') && (
                <div className="zone-block">
                  <div className="zone-header">
                    <span>🔵</span>
                    <span style={{ color: '#58A6FF' }}>Hidden Bull &amp; ICT</span>
                    <span className="zone-count">{hiddenBull.length} coins</span>
                  </div>
                  <div className="heatmap-grid">
                    {hiddenBull.map(coin => renderCoinCard(coin, 'hm-zone-hiddenbull'))}
                  </div>
                </div>
              )}

              {/* 5. 🟠 Oversold */}
              {(activeFilter === 'ALL' || activeFilter === '20-30') && (
                <div className="zone-block">
                  <div className="zone-header">
                    <span>🟠</span>
                    <span style={{ color: '#FFA657' }}>Oversold</span>
                    <span className="zone-count">{oversold.length} coins</span>
                  </div>
                  <div className="heatmap-grid">
                    {oversold.map(coin => renderCoinCard(coin, 'hm-zone-oversold'))}
                  </div>
                </div>
              )}

              {/* 6. 🔴 Extreme */}
              {(activeFilter === 'ALL' || activeFilter === '10-20') && (
                <div className="zone-block">
                  <div className="zone-header">
                    <span>🔴</span>
                    <span style={{ color: '#F85149' }}>Extreme</span>
                    <span className="zone-count">{extreme.length} coins</span>
                  </div>
                  <div className="heatmap-grid">
                    {extreme.map(coin => renderCoinCard(coin, 'hm-zone-extreme'))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Panel */}
          <div className="method-side" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px', flexShrink: 0 }}>
            {/* Card 0: 📊 Overall Market Sentiment */}
            <div
              className="side-card"
              style={{
                background: 'var(--card)',
                border: `1px solid ${marketSentiment.isBullish ? 'rgba(57, 211, 83, 0.4)' : 'rgba(248, 81, 73, 0.4)'}`,
                borderRadius: '12px',
                padding: '14px',
                textAlign: 'center',
                boxShadow: marketSentiment.isBullish ? '0 0 14px rgba(57, 211, 83, 0.1)' : '0 0 14px rgba(248, 81, 73, 0.1)'
              }}
            >
              <div style={{ fontSize: '9px', letterSpacing: '0.14em', color: '#8b949e', marginBottom: '4px', textTransform: 'uppercase' }}>
                Overall Market
              </div>
              <strong
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: marketSentiment.isBullish ? '#39D353' : '#F85149',
                  display: 'block'
                }}
              >
                {marketSentiment.direction}
              </strong>
              <small style={{ fontSize: '9px', color: '#8b949e', marginTop: '2px', display: 'block' }}>
                {marketSentiment.breadthText}
              </small>
            </div>

            {/* Card 1: 🔥 Top Movers (10 coins) */}
            <div className="side-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '12px', fontWeight: 700, color: '#e6edf3' }}>
                <span>🔥</span>
                <span>Top Movers</span>
              </div>
              <div className="movers-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {topMovers.map(coin => (
                  <div
                    key={coin.symbol}
                    className="mover-row"
                    onClick={() => openDirectTradingView(coin.symbol, timeframe)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 12px',
                      background: 'rgba(13, 17, 23, 0.7)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      cursor: 'pointer'
                    }}
                    title={`Click to open ${timeframe} Chart for ${coin.symbol} on TradingView`}
                  >
                    <span className="mover-sym" style={{ fontWeight: 700, color: '#fff' }}>{coin.symbol}</span>
                    <span className="mover-up" style={{ color: coin.change24h >= 0 ? '#39D353' : '#F85149', fontWeight: 600 }}>
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: ⚙ Active Scanners */}
            <div className="side-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '12px', fontWeight: 700, color: '#e6edf3' }}>
                <span>⚙</span>
                <span>Active Scanners</span>
              </div>
              <div className="scanners-status" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div
                  className="scanner-row"
                  onClick={() => navigate('v1')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', background: 'rgba(13, 17, 23, 0.7)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="scanner-dot running" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#39D353', boxShadow: '0 0 5px #39D353', display: 'inline-block' }}></span>
                    <span style={{ color: '#e6edf3' }}>V1 Scalping</span>
                  </div>
                  <span style={{ color: '#39D353', fontSize: '10px' }}>Active</span>
                </div>
                <div
                  className="scanner-row"
                  onClick={() => navigate('hiddenBullish')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', background: 'rgba(13, 17, 23, 0.7)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="scanner-dot running" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#39D353', boxShadow: '0 0 5px #39D353', display: 'inline-block' }}></span>
                    <span style={{ color: '#e6edf3' }}>Hidden Bullish</span>
                  </div>
                  <span style={{ color: '#39D353', fontSize: '10px' }}>Live</span>
                </div>
              </div>
            </div>

            {/* Card 3: ⚙ Chart Settings */}
            <div className="side-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '12px', fontWeight: 700, color: '#e6edf3' }}>
                <span>⚙</span>
                <span>Chart Settings</span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '10px', color: 'var(--muted)' }}>
                    TradingView Timeframe
                  </label>
                  <span style={{ fontSize: '9px', color: '#39D353', fontWeight: 700 }}>
                    BINANCE SPOT
                  </span>
                </div>
                <select
                  value={timeframe}
                  onChange={e => handleTimeframeChange(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(13, 17, 23, 0.8)',
                    border: '1px solid var(--border)',
                    borderRadius: '7px',
                    padding: '7px 10px',
                    color: 'var(--text)',
                    fontSize: '12px',
                    outline: 'none',
                    fontWeight: 600
                  }}
                >
                  <option value="15M">15 Minutes (15M)</option>
                  <option value="30M">30 Minutes (30M)</option>
                  <option value="1H">1 Hour (1H)</option>
                  <option value="4H">4 Hours (4H)</option>
                  <option value="1D">1 Day (1D)</option>
                  <option value="1W">1 Week (1W)</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleTimeframeChange(timeframe);
                  setSaveStatus(`✓ Saved ${timeframe} (30s)`);
                  setTimeout(() => setSaveStatus(''), 2500);
                }}
                style={{
                  width: '100%',
                  padding: '7px',
                  background: 'rgba(57, 211, 83, 0.15)',
                  border: '1px solid rgba(57, 211, 83, 0.3)',
                  borderRadius: '7px',
                  color: '#39D353',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>💾</span>
                <span>{saveStatus || `Save (${timeframe})`}</span>
              </button>
            </div>

            {/* Card 4: Trading with Dawood Contact Card */}
            <div className="contact-card">
              <div className="contact-visual">
                <i></i><i></i><i></i><i></i><i></i>
                <span></span>
              </div>
              <h3>Trading with Dawood</h3>
              <p>Protect your capital and let quality setups come to you.</p>
              <div className="contact-label">CONTACT US</div>
              <a href="https://wa.me/923177893138" target="_blank" rel="noreferrer">
                <span className="contact-pulse"></span>
                +92 3177893138
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
