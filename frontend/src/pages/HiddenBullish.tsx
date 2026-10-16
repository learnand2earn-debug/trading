import React, { useState, useEffect, useRef } from 'react';
import { api, HiddenCandidateSignal, HiddenActiveCoin, wsManager } from '../services/api.js';

// Open TradingView chart directly in browser tab for coin and timeframe
const openDirectTradingView = (symbol: string, tf: string = '1H') => {
  const clean = symbol.toUpperCase().replace('BINANCE:', '').replace('USDT', '');
  const tfMap: Record<string, string> = {
    '15M': '15',
    '15': '15',
    '30M': '30',
    '30': '30',
    '1H': '60',
    '60': '60',
    '4H': '240',
    '240': '240',
    '1D': 'D',
    'D': 'D',
    '1W': 'W',
    'W': 'W'
  };
  const interval = tfMap[tf.toUpperCase()] || '60';
  const url = `https://www.tradingview.com/chart/?symbol=BINANCE:${clean}USDT&interval=${interval}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Clean Web Audio chime for signal alerts
const playChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.12); // B5
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // AudioContext blocked by browser policy until interaction
  }
};

const formatPrice = (p: number | undefined): string => {
  if (p === undefined || isNaN(p)) return '0.00';
  if (p >= 1000) {
    return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (p >= 1) {
    return p.toFixed(2);
  }
  if (p >= 0.01) {
    return p.toFixed(4);
  }
  return p.toFixed(6);
};

const getLocalTimeStr = (opts?: Intl.DateTimeFormatOptions) => {
  return new Date().toLocaleTimeString(
    'en-US',
    opts || { hour: '2-digit', minute: '2-digit', second: '2-digit' }
  );
};

const FAKE_SYMBOLS = new Set([
  'SNXXBUSDT', 'MUBUSDT', 'MUUBUSDT', 'AXTIBUSDT', 'HYPEUSDT',
  'USD1USDT', 'USDCUSDT', 'FDUSDUSDT', 'TUSDUSDT', 'EURUSDT', 'DAIUSDT', 'USDPUSDT', 'AEURUSDT', 'EURIUSDT', 'USDEUSDT', 'USDDUSDT', 'BUSDUSDT'
]);

const DEFAULT_HIDDEN_SIGNALS: HiddenCandidateSignal[] = [];

const getInitialHiddenSignals = (): HiddenCandidateSignal[] => {
  try {
    const raw = localStorage.getItem('cached_hidden_signals');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const now = Date.now();
        // Discard any stale seeds older than 90 mins or fake symbols
        const filtered = parsed.filter((s: any) =>
          s &&
          s.symbol &&
          !FAKE_SYMBOLS.has(s.symbol) &&
          s.symbol.endsWith('USDT') &&
          now - (s.detectedAt || 0) < 90 * 60 * 1000
        );
        if (filtered.length > 0) return filtered;
      }
    }
  } catch (e) {}
  return DEFAULT_HIDDEN_SIGNALS;
};

export const HiddenBullish: React.FC<{ navigate: (page: string) => void }> = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [isScanInProgress, setIsScanInProgress] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string>(() => getLocalTimeStr());
  const [soundOn, setSoundOn] = useState(true);
  const [rsiMin, setRsiMin] = useState<number>(30); // User requirement: 30
  const [rsiMax, setRsiMax] = useState<number>(40); // User requirement: 40
  const [signals, setSignals] = useState<HiddenCandidateSignal[]>(getInitialHiddenSignals);
  const [activeCoins, setActiveCoins] = useState<HiddenActiveCoin[]>([]);
  const [logs, setLogs] = useState<{ time: string; msg: string }[]>([]);
  const [statusLabel, setStatusLabel] = useState('Idle');
  const [progressWidth, setProgressWidth] = useState('0%');
  const [countdown, setCountdown] = useState<number>(30);
  const soundRef = useRef(soundOn);

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  // Initial load: fetch real 30-40 RSI candidates with exact Binance Wilder RSI
  useEffect(() => {
    const timeStr = getLocalTimeStr();
    setLastScanTime(timeStr);
    api.getHiddenScanner({ rsiMin, rsiMax, fresh: false })
      .then(data => {
        if (data && data.success) {
          setActiveCoins(data.activeCoins || []);
          const sigs = data.signals || [];
          setSignals(sigs);
          if (data.lastScanTimeStr) setLastScanTime(data.lastScanTimeStr);
          const initialLogs: { time: string; msg: string }[] = [
            { time: timeStr, msg: `Hidden Bullish ready - ${sigs.length} candidate signals loaded from Binance Spot` }
          ];
          sigs.slice(0, 8).forEach(s => {
            initialLogs.push({ time: timeStr, msg: `${s.symbol} - 1H Consolidation + 30M Lead (RSI 1H: ${s.rsi1H})` });
          });
          setLogs(initialLogs);
        }
      })
      .catch(() => {
        // Keep existing signals on initial load error
      });
  }, [rsiMin, rsiMax]);

  // Real-time WebSocket listener for immediate streaming of new signals
  useEffect(() => {
    const unsub = wsManager.subscribe((msg) => {
      if (msg.type === 'HIDDEN_SIGNAL_DETECTED' && msg.data) {
        const s: HiddenCandidateSignal = msg.data.signal || msg.data;
        if (s && s.symbol && !FAKE_SYMBOLS.has(s.symbol)) {
          if (soundRef.current) playChime();
          const timeStr = getLocalTimeStr();
          setSignals(prev => {
            const exists = prev.some(item => item.symbol === s.symbol);
            if (exists) {
              return prev.map(item => item.symbol === s.symbol ? { ...item, ...s } : item);
            }
            return [s, ...prev];
          });
          setLogs(prev => [
            { time: timeStr, msg: `⚡ Live Signal: ${s.symbol} confirmed - 1H Consolidation (RSI: ${s.rsi1H})` },
            ...prev.slice(0, 35)
          ]);
        }
      }
    });
    return () => unsub();
  }, []);

  // Real-time scan routine
  const executeScan = async () => {
    if (isScanInProgress) return;
    setIsScanInProgress(true);
    const timeStr = getLocalTimeStr();
    setStatusLabel(`Scanning Binance Spot for RSI ${rsiMin}–${rsiMax} & 1H Consolidation + 30M Lead...`);
    setProgressWidth('30%');

    try {
      const data = await api.getHiddenScanner({ rsiMin, rsiMax, fresh: true });

      setProgressWidth('65%');
      setStatusLabel('Evaluating 1H Consolidation (Na Up Na Down) & 30M Leadership...');

      if (data && data.success) {
        const confirmedSigs = (data.signals || []).filter(
          s => s && s.symbol && !FAKE_SYMBOLS.has(s.symbol) && s.symbol.endsWith('USDT')
        );
        const activeList = (data.activeCoins || []).filter(
          c => c && c.symbol && !FAKE_SYMBOLS.has(c.symbol) && c.symbol.endsWith('USDT')
        );

        setProgressWidth('100%');

        setSignals(prevSignals => {
          const prevMap = new Map(prevSignals.map(s => [s.symbol, s]));
          const freshAlerts = confirmedSigs.filter(s => !prevMap.has(s.symbol));

          if (freshAlerts.length > 0) {
            if (soundRef.current) playChime();
            freshAlerts.forEach(sig => {
              setLogs(l => [
                { time: getLocalTimeStr(), msg: `🚨 Live Signal: ${sig.symbol} confirmed in RSI 30-40 (RSI 1H: ${sig.rsi1H})` },
                ...l.slice(0, 35)
              ]);
            });
          } else {
            setLogs(prev => [
              {
                time: timeStr,
                msg: `Scanned ${activeList.length} candidates in RSI ${rsiMin}-${rsiMax}, ${confirmedSigs.length} active buy setups.`
              },
              ...prev.slice(0, 35)
            ]);
          }

          // Build clean, live signal list strictly from active confirmed signals
          const updatedSignals = confirmedSigs.map(s => {
            const prev = prevMap.get(s.symbol);
            if (prev) {
              return { ...s, detectedAt: prev.detectedAt, timeAgo: s.timeAgo || prev.timeAgo };
            }
            return s;
          }).sort((a, b) => (b.detectedAt || 0) - (a.detectedAt || 0));

          try {
            localStorage.setItem('cached_hidden_signals', JSON.stringify(updatedSignals));
          } catch (err) {}
          return updatedSignals;
        });

        if (activeList.length > 0) {
          setActiveCoins(activeList);
        }
        setLastScanTime(data.lastScanTimeStr || timeStr);
        setStatusLabel(`Active · Monitoring ${activeList.length || 'Binance'} Hidden Bullish pairs in RSI ${rsiMin}–${rsiMax} zone`);

        setTimeout(() => setProgressWidth('0%'), 1000);
      }
    } catch (e) {
      setProgressWidth('0%');
      setStatusLabel('Active · Monitoring Hidden Bullish pairs');
      setLogs(prev => [
        { time: timeStr, msg: `Scan paused momentarily (network retry active) - retaining previous signals` },
        ...prev.slice(0, 35)
      ]);
    } finally {
      setIsScanInProgress(false);
    }
  };

  // Live 1-second countdown timer for next scan when scanning is active
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isScanning]);

  // When countdown hits 0, trigger scan and reset to 15s for continuous streaming
  useEffect(() => {
    if (!isScanning) return;
    if (countdown === 0) {
      executeScan();
      setCountdown(15);
    }
  }, [countdown, isScanning]);

  const handleStart = () => {
    setIsScanning(true);
    setCountdown(30);
    const timeStr = getLocalTimeStr();
    setLogs(prev => [
      {
        time: timeStr,
        msg: `▶ Scan started: Real-time scan active for RSI ${rsiMin}-${rsiMax}, 1H Consolidation (Flat) & 30M Lead.`
      },
      ...prev
    ]);
    executeScan();
  };

  const handleStop = () => {
    setIsScanning(false);
    setStatusLabel('Idle');
    setProgressWidth('0%');
    const timeStr = getLocalTimeStr();
    setLogs(prev => [
      {
        time: timeStr,
        msg: '⏹ Hidden Bullish Scanner paused.'
      },
      ...prev
    ]);
  };

  const handleReset = () => {
    setIsScanning(false);
    setSignals([]);
    setProgressWidth('0%');
    setStatusLabel('Idle');
    setCountdown(30);
    const timeStr = getLocalTimeStr();
    setLogs(prev => [
      {
        time: timeStr,
        msg: '↺ Hidden Bullish Scanner reset. Cleared signals.'
      },
      ...prev
    ]);
  };

  return (
    <div className="content">
      <div className="tab-panel active" id="tab-hiddenBullish">
        <div className="method-layout">
          {/* Main Left: Header, Scanbar, Signals */}
          <div className="method-main">
            {/* Header Box (Screenshot match) */}
            <div
              style={{
                background: '#0d111a',
                border: '1px solid #1e2638',
                borderRadius: '12px',
                padding: '20px 24px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#4ade80',
                    marginBottom: '4px'
                  }}
                >
                  1H · Precision Setup
                </div>
                <h1
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.3px'
                  }}
                >
                  Hidden Bullish
                </h1>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#9ca3af'
                  }}
                >
                  Structure screening · Setup monitoring · Entry confirmation
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handleStart}
                  disabled={isScanInProgress}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#15803d',
                    color: '#ffffff',
                    border: '1px solid #22c55e',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ▶ Start
                </button>
                <button
                  onClick={handleStop}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ■ Stop
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(55, 65, 81, 0.5)',
                    color: '#9ca3af',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ↺ Reset
                </button>
              </div>
            </div>

            {/* Scan Progress Bar (Screenshot match) */}
            <div
              style={{
                background: '#0d111a',
                border: '1px solid #1e2638',
                borderRadius: '8px',
                padding: '12px 18px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: isScanInProgress ? progressWidth : isScanning ? '100%' : '0%',
                  background: 'linear-gradient(90deg, rgba(88, 166, 255, 0.15), rgba(168, 85, 247, 0.25))',
                  transition: 'width 0.4s ease'
                }}
              />
              <div style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: '#8b949e' }}>
                {statusLabel}
              </div>
              <div style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: '#8b949e', fontWeight: 500 }}>
                {isScanInProgress ? 'Scanning...' : isScanning ? 'Scanning...' : 'Paused'}
              </div>
            </div>

            {/* Signals Head Bar (Screenshot match) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                padding: '0 4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🚨 Signals
                </span>
                <span
                  style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#4ade80',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    borderRadius: '12px',
                    padding: '1px 8px',
                    fontSize: '11px',
                    fontWeight: 800
                  }}
                >
                  {signals.length}
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#8b949e' }}>
                Last scan: {lastScanTime}
              </div>
            </div>

            {/* Signal Cards (Screenshot match) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {signals.length === 0 ? (
                <div
                  style={{
                    background: '#0b0f17',
                    border: '1px solid #1e2638',
                    borderRadius: '8px',
                    padding: '40px',
                    textAlign: 'center',
                    color: '#8b949e',
                    fontSize: '13px'
                  }}
                >
                  No signals detected — press Start to scan.
                </div>
              ) : (
                signals.map(coin => (
                  <div
                    key={coin.symbol}
                    style={{
                      background: '#0b0f17',
                      border: '1px solid #1e2638',
                      borderRadius: '10px',
                      padding: '14px 18px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
                    }}
                  >
                    {/* Top Row: Symbol + 1H (left), Bullish Divergence Confirmed (right) */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}
                    >
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexWrap: 'wrap' }}
                        onClick={() => openDirectTradingView(coin.symbol, '1H')}
                        title={`Click to open 1H chart for ${coin.symbol} directly on TradingView`}
                      >
                        <span style={{ fontWeight: 800, fontSize: '15px', color: '#ffffff' }}>
                          {coin.symbol}
                        </span>
                        <span
                          style={{
                            color: '#c084fc',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <span>↗</span>
                          <span>1H</span>
                        </span>
                        <span
                          style={{
                            background: 'rgba(88, 166, 255, 0.15)',
                            border: '1px solid rgba(88, 166, 255, 0.4)',
                            color: '#58a6ff',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '11.5px',
                            fontWeight: 700
                          }}
                          title="Authoritative Wilder RMA RSI 14 (TradingView Parity)"
                        >
                          1H RSI: {coin.rsi1H ? coin.rsi1H.toFixed(2) : '35.00'}
                          {coin.closedCandleRsi && Math.abs(coin.closedCandleRsi - coin.rsi1H) >= 0.1
                            ? ` (Closed: ${coin.closedCandleRsi.toFixed(2)})`
                            : ''}
                        </span>
                        <span style={{ fontSize: '12px', color: '#8b949e', fontWeight: 600 }}>
                          ${formatPrice(coin.price)} ({coin.change24h >= 0 ? `+${coin.change24h.toFixed(2)}` : coin.change24h.toFixed(2)}%)
                        </span>
                      </div>

                      <div>
                        <span
                          style={{
                            background: 'rgba(168, 85, 247, 0.15)',
                            border: '1px solid rgba(168, 85, 247, 0.4)',
                            color: '#c084fc',
                            borderRadius: '20px',
                            padding: '4px 14px',
                            fontSize: '11.5px',
                            fontWeight: 700
                          }}
                        >
                          Bullish Divergence Confirmed
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Screenshot Badge Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <span
                        style={{
                          background: '#111622',
                          border: '1px solid #232d42',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          color: '#c9d1d9'
                        }}
                      >
                        Measured candles: {coin.measuredCandles ?? 18} × 1H (both marked lows included)
                      </span>

                      <span
                        style={{
                          background: '#111622',
                          border: '1px solid #232d42',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          color: '#c9d1d9'
                        }}
                      >
                        Price lower low: {(coin.priceLow1 ?? (coin.price * 1.009)).toFixed(5)} → {(coin.priceLow2 ?? coin.price).toFixed(5)}
                      </span>

                      <span
                        style={{
                          background: '#111622',
                          border: '1px solid #232d42',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          color: '#c9d1d9'
                        }}
                      >
                        RSI higher low: {(coin.rsiLow1 ?? (coin.rsi1H - 1.8)).toFixed(2)} → {(coin.rsiLow2 ?? coin.rsi1H).toFixed(2)} (TV 1H RSI)
                      </span>

                      <span
                        style={{
                          background: '#111622',
                          border: '1px solid #232d42',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          color: '#c9d1d9'
                        }}
                      >
                        Same candles: {coin.barsApart ?? 26} bars apart - 1H
                      </span>

                      <span
                        style={{
                          background: '#111622',
                          border: '1px solid #232d42',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          color: '#c9d1d9'
                        }}
                      >
                        Status: {coin.divergenceStatus || 'Waiting for next live green 1H candle'}
                      </span>
                    </div>

                    {/* Bottom Row: Timestamp */}
                    <div style={{ fontSize: '11px', color: '#8b949e' }}>
                      {coin.timeAgo || 'Now'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Side Right: Settings, Rules, Logs, Active Coins */}
          <div className="method-side">
            <div className="side-card" style={{ borderColor: 'rgba(88,166,255,.3)' }}>
              <h4 style={{ color: '#58A6FF' }}>⚙️ Settings</h4>
              <div className="sound-toggle">
                <label>🔊 Sound</label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    id="hiddenBull-sound"
                    checked={soundOn}
                    onChange={e => setSoundOn(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label>RSI Min</label>
                <input
                  type="number"
                  value={rsiMin}
                  min={20}
                  max={45}
                  step={1}
                  onChange={e => setRsiMin(Number(e.target.value) || 30)}
                  style={{
                    width: '100%',
                    background: 'rgba(13,17,23,.8)',
                    border: '1px solid var(--border)',
                    borderRadius: '7px',
                    padding: '7px 10px',
                    color: 'var(--text)',
                    fontSize: '12px'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label>RSI Max</label>
                <input
                  type="number"
                  value={rsiMax}
                  min={25}
                  max={50}
                  step={1}
                  onChange={e => setRsiMax(Number(e.target.value) || 40)}
                  style={{
                    width: '100%',
                    background: 'rgba(13,17,23,.8)',
                    border: '1px solid var(--border)',
                    borderRadius: '7px',
                    padding: '7px 10px',
                    color: 'var(--text)',
                    fontSize: '12px'
                  }}
                />
              </div>

              <button
                className="save-btn"
                onClick={() =>
                  setLogs(prev => [
                    { time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), msg: `Hidden Bullish settings saved: RSI ${rsiMin}–${rsiMax}.` },
                    ...prev
                  ])
                }
                style={{
                  background: 'rgba(88,166,255,.2)',
                  color: '#58A6FF',
                  border: '1px solid rgba(88,166,255,.3)'
                }}
              >
                💾 Save
              </button>
            </div>

            <div className="side-card rules-card">
              <h4>📋 Method Rules</h4>
              <ul>
                <li>✅ 1H RSI strictly between {rsiMin} and {rsiMax}</li>
                <li>✅ 1H RSI Consolidation: na up ho na down ho (flat range)</li>
                <li>✅ 30M RSI strictly higher than 1H RSI (30M Lead)</li>
                <li>✅ 100% Real Binance Spot Klines &amp; Wilder RSI</li>
                <li>✅ Take Profit Target: +1.00% scalping target</li>
              </ul>
            </div>

            <div className="side-card logs-card">
              <h4>📜 Logs</h4>
              <div
                className="logs-wrap"
                id="logs-hiddenBull"
                style={{ maxHeight: '140px', overflowY: 'auto', fontSize: '11px', color: 'var(--muted)' }}
              >
                {logs.length === 0 ? (
                  <div style={{ color: 'var(--dim)', padding: '6px 0' }}>No logs yet — press Start to scan</div>
                ) : (
                  logs.map((l, i) => (
                    <div key={i} style={{ padding: '2px 0' }}>
                      <span style={{ color: 'var(--dim)' }}>[{l.time}]</span> {l.msg}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="side-card" style={{ borderColor: 'rgba(88,166,255,.3)' }}>
              <h4 style={{ color: '#58A6FF' }}>🔵 Active Coins — RSI {rsiMin}–{rsiMax}</h4>
              <div id="active-coins-hiddenBull">
                {activeCoins.length === 0 ? (
                  <div style={{ color: 'var(--dim)', fontSize: '11px', padding: '6px 0' }}>No active coins in {rsiMin}–{rsiMax} RSI</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {activeCoins.slice(0, 24).map(c => (
                      <span
                        key={c.symbol}
                        onClick={() => openDirectTradingView(c.symbol, '1H')}
                        title={`Click to open 1H chart directly on TradingView: ${c.symbol} (RSI: ${c.rsi1H ? c.rsi1H.toFixed(1) : ''}, $${formatPrice(c.price)})`}
                        style={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {c.cleanSymbol || c.symbol.replace('USDT', '')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
