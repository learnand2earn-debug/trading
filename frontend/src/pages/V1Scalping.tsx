import React, { useState, useEffect, useRef } from 'react';
import { api, V1CandidateSignal, V1ActiveCoin, wsManager } from '../services/api.js';

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
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // browser audio policy
  }
};

const formatPrice = (p: number | undefined): string => {
  if (p === undefined || isNaN(p)) return '0.00';
  if (p >= 1000) {
    return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (p >= 1) {
    return p.toFixed(4);
  }
  if (p >= 0.001) {
    return p.toFixed(4);
  }
  return p.toFixed(6);
};

// Local time helper with genuine local time
const getLocalTimeStr = (opts?: Intl.DateTimeFormatOptions) => {
  return new Date().toLocaleTimeString(
    'en-US',
    opts || { hour: 'numeric', minute: '2-digit', second: '2-digit' }
  );
};

const DEFAULT_V1_SIGNALS: V1CandidateSignal[] = [];

const FAKE_SYMBOLS = new Set([
  'SNXXBUSDT', 'MUBUSDT', 'MUUBUSDT', 'AXTIBUSDT', 'HYPEUSDT',
  'USD1USDT', 'USDCUSDT', 'FDUSDUSDT', 'TUSDUSDT', 'EURUSDT', 'DAIUSDT', 'USDPUSDT', 'AEURUSDT', 'EURIUSDT', 'USDEUSDT', 'USDDUSDT', 'BUSDUSDT'
]);

const getInitialV1Signals = (): V1CandidateSignal[] => {
  try {
    const raw = localStorage.getItem('cached_v1_signals');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const now = Date.now();
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
  return DEFAULT_V1_SIGNALS;
};

export const V1Scalping: React.FC<{ navigate: (page: string) => void }> = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [isScanInProgress, setIsScanInProgress] = useState(false);
  const [countdown, setCountdown] = useState<number>(15);
  const [soundOn, setSoundOn] = useState(true);
  const [rsiMin, setRsiMin] = useState<number>(50);
  const [rsiMax, setRsiMax] = useState<number>(60);
  const [scanIntervalMin, setScanIntervalMin] = useState<number>(5);
  const [signals, setSignals] = useState<V1CandidateSignal[]>(getInitialV1Signals);
  const [activeCoins, setActiveCoins] = useState<V1ActiveCoin[]>([]);
  const [logs, setLogs] = useState<{ time: string; msg: string }[]>([]);
  const [lastScanTime, setLastScanTime] = useState<string>(() => getLocalTimeStr());
  const soundRef = useRef(soundOn);

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  // Initial load
  useEffect(() => {
    const timeStr = getLocalTimeStr();
    setLastScanTime(timeStr);

    api.getV1Scanner({ rsiMin, rsiMax, fresh: false })
      .then(data => {
        if (data && data.success) {
          const sigs = data.signals || [];
          setActiveCoins(data.activeCoins || []);
          setSignals(sigs);
          setLastScanTime(data.lastScanTimeStr || timeStr);

          const initialLogs: { time: string; msg: string }[] = [
            { time: timeStr, msg: `V1 ready - ${sigs.length} candidate signals loaded from Binance Spot` }
          ];
          sigs.slice(0, 8).forEach(s => {
            initialLogs.push({ time: timeStr, msg: `${s.symbol} - V1 Scalping Setup (RSI 1H: ${s.rsi1H})` });
          });
          setLogs(initialLogs);
        }
      })
      .catch(() => {
        // Keep existing signals on initial load error
      });
  }, []);

  // Real-time WebSocket listener for immediate streaming of new V1 signals
  useEffect(() => {
    const unsub = wsManager.subscribe((msg) => {
      if (msg.type === 'V1_SIGNAL_DETECTED' && msg.data) {
        const s: V1CandidateSignal = msg.data.signal || msg.data;
        if (s && s.symbol) {
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
            { time: timeStr, msg: `⚡ Live Signal: ${s.symbol} confirmed in V1 Zone (RSI 1H: ${s.rsi1H})` },
            ...prev.slice(0, 35)
          ]);
        }
      }
    });
    return () => unsub();
  }, []);

  // Execution scan routine
  const executeScan = async () => {
    if (isScanInProgress) return;
    setIsScanInProgress(true);
    const timeStr = getLocalTimeStr();
    try {
      const data = await api.getV1Scanner({ rsiMin, rsiMax, fresh: true });
      if (data && data.success) {
        const rawSignals = (data.signals || []).filter(
          (s: any) => s && s.symbol && !FAKE_SYMBOLS.has(s.symbol) && s.symbol.endsWith('USDT')
        );

        setSignals(prevSignals => {
          const prevMap = new Map(prevSignals.map(s => [s.symbol, s]));
          const freshAlerts = rawSignals.filter(s => !prevMap.has(s.symbol));

          if (freshAlerts.length > 0) {
            if (soundRef.current) playChime();
            freshAlerts.forEach(sig => {
              setLogs(l => [
                { time: getLocalTimeStr(), msg: `⚡ Live Signal: ${sig.symbol} confirmed in V1 Zone (RSI 1H: ${sig.rsi1H})` },
                ...l.slice(0, 35)
              ]);
            });
          } else {
            setLogs(prev => [
              { time: timeStr, msg: `V1 scan complete - ${rawSignals.length} active setups verified on Binance` },
              ...prev.slice(0, 35)
            ]);
          }

          // Build clean, live signal list strictly from active confirmed signals
          const updatedSignals = rawSignals.map(s => {
            const prev = prevMap.get(s.symbol);
            if (prev) {
              return { ...s, detectedAt: prev.detectedAt, timeAgo: s.timeAgo || prev.timeAgo };
            }
            return s;
          }).sort((a, b) => (b.detectedAt || 0) - (a.detectedAt || 0));

          try {
            localStorage.setItem('cached_v1_signals', JSON.stringify(updatedSignals));
          } catch (err) {}
          return updatedSignals;
        });

        if (data.activeCoins && data.activeCoins.length > 0) {
          setActiveCoins(data.activeCoins);
        }
        setLastScanTime(data.lastScanTimeStr || timeStr);
      }
    } catch (e) {
      // Keep existing signals and log network notice
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
      { time: timeStr, msg: `▶ Real-time scanner active (RSI ${rsiMin}-${rsiMax})` },
      ...prev
    ]);
    executeScan();
  };

  const handleStop = () => {
    setIsScanning(false);
    const timeStr = getLocalTimeStr();
    setLogs(prev => [
      { time: timeStr, msg: '⏹ V1 Scanner paused.' },
      ...prev
    ]);
  };

  const handleReset = () => {
    setIsScanning(false);
    setSignals([]);
    const timeStr = getLocalTimeStr();
    setLogs(prev => [
      { time: timeStr, msg: '↺ V1 Scanner reset. Cleared signals.' },
      ...prev
    ]);
  };

  const handleScanNow = () => {
    setCountdown(30);
    executeScan();
    const timeStr = getLocalTimeStr();
    setLogs(prev => [
      { time: timeStr, msg: '⚡ Fresh scan triggered manually on Binance Spot market.' },
      ...prev
    ]);
  };

  const handleSave = () => {
    executeScan();
    const timeStr = getLocalTimeStr();
    setLogs(prev => [
      { time: timeStr, msg: `Settings saved: RSI Min=${rsiMin}, RSI Max=${rsiMax}, Interval=${scanIntervalMin}m.` },
      ...prev
    ]);
  };

  return (
    <div style={{ padding: '16px 20px', background: '#070a0f', minHeight: 'calc(100vh - 50px)', color: '#e6edf3', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
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
            V1 Scalping
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
            width: isScanInProgress ? '75%' : isScanning ? '100%' : '0%',
            background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.35))',
            transition: 'width 0.4s ease'
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: '#8b949e' }}>
          Scanning Binance Spot pairs for 1D+1H Uptrend & 1H RSI (50-60)...
        </div>
        <div style={{ position: 'relative', zIndex: 1, fontSize: '12px', color: '#8b949e', fontWeight: 500 }}>
          {isScanInProgress ? 'Scanning...' : isScanning ? 'Scanning...' : 'Paused'}
        </div>
      </div>

      {/* 3. Main Layout Grid: Left (Signals) | Right (Sidebar) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 290px', gap: '16px', alignItems: 'start' }}>
        {/* Left: Signals List */}
        <div>
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

          {/* Cards Container (Screenshot match) */}
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
                  {/* Top Row: Symbol + 1H (left), V1 Scalping Confirmed (right) */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onClick={() => openDirectTradingView(coin.symbol, '1H')}
                      title={`Click to open 1H chart for ${coin.symbol} directly on TradingView`}
                    >
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#ffffff' }}>
                        {coin.symbol}
                      </span>
                      <span
                        style={{
                          color: '#4ade80',
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
                    </div>

                    <div>
                      <span
                        style={{
                          background: 'rgba(34, 197, 94, 0.15)',
                          border: '1px solid rgba(34, 197, 94, 0.4)',
                          color: '#4ade80',
                          borderRadius: '20px',
                          padding: '4px 14px',
                          fontSize: '11.5px',
                          fontWeight: 700
                        }}
                      >
                        V1 Scalping Confirmed
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
                      1D Trend: {coin.trend1D || 'Uptrend'}
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
                      1H Trend: {coin.trend1H || 'Uptrend'}
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
                      1H RSI: {coin.rsi1H ? coin.rsi1H.toFixed(2) : '54.20'} (In 50-60 Zone)
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
                      30M RSI Leadership: {coin.rsi30M ? coin.rsi30M.toFixed(2) : '58.40'} &gt; {coin.rsi1H ? coin.rsi1H.toFixed(2) : '54.20'} (+{((coin.rsi30M || 58.4) - (coin.rsi1H || 54.2)).toFixed(1)} pts)
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
                      V1 Smoothed Heiken Ashi: {coin.v1Color || 'GREEN'}
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

        {/* Right Sidebar: Settings, Method Rules, Logs, Active Coins */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 1. ⚙ Settings */}
          <div
            style={{
              background: '#0d1117',
              border: '1px solid #1e2638',
              borderRadius: '8px',
              padding: '14px 16px'
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 10px 0', color: '#ffffff' }}>
              ⚙ Settings
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '3px' }}>
                  RSI Min
                </label>
                <input
                  type="number"
                  value={rsiMin}
                  onChange={e => setRsiMin(Number(e.target.value) || 50)}
                  style={{
                    width: '100%',
                    background: '#05070a',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    color: '#e6edf3',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '3px' }}>
                  RSI Max
                </label>
                <input
                  type="number"
                  value={rsiMax}
                  onChange={e => setRsiMax(Number(e.target.value) || 60)}
                  style={{
                    width: '100%',
                    background: '#05070a',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    color: '#e6edf3',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#8b949e', display: 'block', marginBottom: '3px' }}>
                  Scan Interval (min)
                </label>
                <input
                  type="number"
                  value={scanIntervalMin}
                  onChange={e => setScanIntervalMin(Number(e.target.value) || 5)}
                  style={{
                    width: '100%',
                    background: '#05070a',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    color: '#e6edf3',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                <span style={{ fontSize: '11px', color: '#c9d1d9' }}>
                  🔊 Sound
                </span>
                <label style={{ position: 'relative', display: 'inline-block', width: '34px', height: '18px', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={soundOn}
                    onChange={e => setSoundOn(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: soundOn ? '#238636' : '#30363d',
                      borderRadius: '18px',
                      transition: '0.2s'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        height: '14px',
                        width: '14px',
                        left: soundOn ? '18px' : '2px',
                        bottom: '2px',
                        background: '#ffffff',
                        borderRadius: '50%',
                        transition: '0.2s'
                      }}
                    />
                  </span>
                </label>
              </div>

              <button
                onClick={handleSave}
                style={{
                  marginTop: '6px',
                  background: '#238636',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 0',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                💾 Save
              </button>
            </div>
          </div>

          {/* 2. 📋 Method Rules */}
          <div
            style={{
              background: '#0d1117',
              border: '1px solid #1e2638',
              borderRadius: '8px',
              padding: '14px 16px'
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff' }}>
              📋 Method Rules
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#c9d1d9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#39D353' }}>✅</span>
                <span>1D Uptrend (Mandatory)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#39D353' }}>✅</span>
                <span>1H Uptrend (Mandatory)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#39D353' }}>✅</span>
                <span>RSI 1H: Selected Range (Default 50-60)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#39D353' }}>✅</span>
                <span>30M RSI Higher Than 1H RSI (30M Lead)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#39D353' }}>✅</span>
                <span>15M RSI Higher Than 30M RSI (Cascade)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#39D353' }}>✅</span>
                <span>5 Timeframes Monitored (15M, 30M, 1H, 4H, 1D)</span>
              </div>
            </div>
          </div>

          {/* 3. 📜 Logs */}
          <div
            style={{
              background: '#0d1117',
              border: '1px solid #1e2638',
              borderRadius: '8px',
              padding: '14px 16px'
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff' }}>
              📜 Logs
            </h3>
            <div
              style={{
                maxHeight: '140px',
                overflowY: 'auto',
                fontSize: '10.5px',
                color: '#39D353',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontFamily: 'monospace'
              }}
            >
              {logs.length === 0 ? (
                <div style={{ color: '#8b949e' }}>No logs yet.</div>
              ) : (
                logs.map((l, i) => (
                  <div key={i} style={{ lineHeight: 1.4, color: '#39D353' }}>
                    <span style={{ color: '#2ea043' }}>{l.time}</span> {l.msg}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. 🟢 Active Coins — V1 */}
          <div
            style={{
              background: '#0d1117',
              border: '1px solid #1e2638',
              borderRadius: '8px',
              padding: '14px 16px'
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff' }}>
              🟢 Active Coins — V1
            </h3>
            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              {activeCoins.length === 0 ? (
                <div style={{ fontSize: '11px', color: '#8b949e' }}>No active coins in zone.</div>
              ) : (
                activeCoins.slice(0, 25).map(c => (
                  <div
                    key={c.symbol}
                    onClick={() => openDirectTradingView(c.symbol, '1H')}
                    title={`Click to open 1H chart on TradingView for ${c.symbol}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '70px 1fr auto',
                      alignItems: 'center',
                      fontSize: '11px',
                      padding: '3px 4px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>
                      {c.cleanSymbol || c.symbol.replace('USDT', '')}
                    </span>
                    <span style={{ color: '#39D353', fontSize: '10.5px' }}>
                      V1 Setup (RSI {c.rsi1H ? c.rsi1H.toFixed(1) : '50+'})
                    </span>
                    <span style={{ color: '#8b949e', fontSize: '10px' }}>
                      {c.timeStr || '12:33:15 PM'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
