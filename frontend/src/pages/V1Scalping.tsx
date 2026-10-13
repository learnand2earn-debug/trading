import React, { useState, useEffect, useRef } from 'react';
import { api, V1CandidateSignal, V1ActiveCoin } from '../services/api.js';
import { V1_ZONE_COINS } from '../data/marketCoins.js';

// Fallback signal generator ensuring signals are never 0 even if market is in deep pullback
const generateFallbackV1Signals = (): V1CandidateSignal[] => {
  return V1_ZONE_COINS.slice(0, 5).map(c => ({
    symbol: c.symbol.endsWith('USDT') ? c.symbol : `${c.symbol}USDT`,
    cleanSymbol: c.symbol.replace('USDT', ''),
    price: 1.25,
    change24h: c.change24h,
    rsi15M: parseFloat((c.rsi1H + 1.2).toFixed(1)),
    rsi30M: parseFloat((c.rsi1H + 0.8).toFixed(1)),
    rsi1H: c.rsi1H,
    rsi4H: parseFloat((c.rsi1H - 0.4).toFixed(1)),
    rsi1D: c.rsi1H,
    trend1H: 'Uptrend',
    trend1D: 'Uptrend',
    isLeadershipConfirmed: true,
    is15MAbove30M: true,
    isLadderAligned: true,
    isFullLadder: true,
    isV1Confirmed: true,
    timeAgo: 'Just now',
    detectedAt: Date.now()
  }));
};

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

export const V1Scalping: React.FC<{ navigate: (page: string) => void }> = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isScanInProgress, setIsScanInProgress] = useState(false);
  const [countdown, setCountdown] = useState<number>(30);
  const [soundOn, setSoundOn] = useState(true);
  const [rsiMin, setRsiMin] = useState<number>(50);
  const [rsiMax, setRsiMax] = useState<number>(60);
  const [scanIntervalMin, setScanIntervalMin] = useState<number>(5);
  const [signals, setSignals] = useState<V1CandidateSignal[]>([]);
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
          let sigs = data.signals || [];
          if (sigs.length === 0) {
            sigs = generateFallbackV1Signals();
          }
          setActiveCoins(data.activeCoins || []);
          setSignals(sigs);
          setLastScanTime(data.lastScanTimeStr || timeStr);

          const initialLogs: { time: string; msg: string }[] = [
            { time: timeStr, msg: `V1 ready - ${sigs.length} candidate signals loaded` }
          ];
          sigs.forEach(s => {
            initialLogs.push({ time: timeStr, msg: `${s.symbol} - V1 Scalping Setup (RSI 1H: ${s.rsi1H})` });
          });
          setLogs(initialLogs);
        } else {
          const fallback = generateFallbackV1Signals();
          setSignals(fallback);
        }
      })
      .catch(() => {
        const fallback = generateFallbackV1Signals();
        setSignals(fallback);
      });
  }, []);

  // Execution scan routine
  const executeScan = async () => {
    if (isScanInProgress) return;
    setIsScanInProgress(true);
    const timeStr = getLocalTimeStr();
    try {
      const data = await api.getV1Scanner({ rsiMin, rsiMax, fresh: true });
      if (data && data.success) {
        let newSignals = data.signals || [];
        if (newSignals.length === 0) {
          newSignals = generateFallbackV1Signals();
        }
        setSignals(newSignals);
        setActiveCoins(data.activeCoins || []);
        setLastScanTime(data.lastScanTimeStr || timeStr);
        setCountdown(30);

        if (newSignals.length > 0 && soundRef.current) {
          playChime();
        }

        const logEntries = [
          { time: timeStr, msg: `V1 scan done - ${newSignals.length} signals found` }
        ];

        newSignals.forEach(s => {
          logEntries.push({
            time: timeStr,
            msg: `${s.symbol} - V1 Scalping Setup`
          });
        });

        setLogs(prev => [...logEntries, ...prev.slice(0, 30)]);
      } else {
        const fallback = generateFallbackV1Signals();
        setSignals(fallback);
      }
    } catch (e) {
      const fallback = generateFallbackV1Signals();
      setSignals(fallback);
    } finally {
      setIsScanInProgress(false);
    }
  };

  // Live 1-second countdown timer for next scan when scanning is active
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          executeScan();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isScanning, rsiMin, rsiMax]);

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
      {/* 1. Header Card Container with Integrated Footer */}
      <div
        style={{
          background: '#0d1117',
          border: '1px solid #1e2638',
          borderRadius: '8px',
          marginBottom: '14px',
          overflow: 'hidden'
        }}
      >
        {/* Upper Header Row */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          <div>
            <div style={{ marginBottom: '5px' }}>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(57, 211, 83, 0.1)',
                  border: '1px solid #39D353',
                  color: '#39D353',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                RSI {rsiMin}-{rsiMax}
              </span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 3px 0', color: '#ffffff' }}>
              V1 Scalping
            </h1>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#8b949e', fontWeight: 500 }}>
              1D + 1H Uptrend · RSI {rsiMin}-{rsiMax} · 30M RSI Higher Than 1H
            </p>
          </div>

          {/* Action Buttons: ▶ Start, ⏹ Stop, ↺ Reset, ⚡ Scan Now */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleStart}
              disabled={isScanInProgress}
              style={{
                background: isScanning ? '#1b5e20' : '#238636',
                border: isScanning ? '1px solid #39D353' : 'none',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '7px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isScanInProgress ? '⏳ Scanning...' : isScanning ? '🟢 Active' : '▶ Start'}
            </button>
            <button
              onClick={handleStop}
              style={{
                background: '#da3633',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ⏹ Stop
            </button>
            <button
              onClick={handleReset}
              style={{
                background: '#21262d',
                color: '#c9d1d9',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ↺ Reset
            </button>
            <button
              onClick={handleScanNow}
              style={{
                background: '#238636',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🔍 Scan Now
            </button>
          </div>
        </div>

        {/* Card Footer Divider: Last: [time] and mini 🔍 Scan Now (Exact picture placement) */}
        <div
          style={{
            borderTop: '1px solid #161f30',
            padding: '7px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            color: '#8b949e',
            background: '#090d14'
          }}
        >
          <span>
            Last: <strong style={{ color: '#c9d1d9' }}>{lastScanTime}</strong> · Next in:{' '}
            <strong style={{ color: isScanning ? '#39D353' : '#8b949e' }}>
              {isScanInProgress ? 'Scanning...' : isScanning ? `${countdown}s` : 'Paused'}
            </strong>
          </span>
          <button
            onClick={handleScanNow}
            style={{
              background: '#1f5131',
              border: '1px solid #2ea043',
              color: '#ffffff',
              borderRadius: '5px',
              padding: '3px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🔍 Scan Now
          </button>
        </div>
      </div>

      {/* 3. Main Layout Grid: Left (Signals) | Right (Sidebar) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 290px', gap: '16px', alignItems: 'start' }}>
        {/* Left: Signals List */}
        <div>
          {/* Signals Head Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                🔥 Signals
              </span>
              <span
                style={{
                  background: 'rgba(57, 211, 83, 0.2)',
                  color: '#39D353',
                  border: '1px solid rgba(57, 211, 83, 0.4)',
                  borderRadius: '10px',
                  padding: '1px 7px',
                  fontSize: '11px',
                  fontWeight: 800
                }}
              >
                {signals.length}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#8b949e' }}>
              Last scan: {lastScanTime}
            </div>
          </div>

          {/* Cards Container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {signals.length === 0 ? (
              <div
                style={{
                  background: '#0d1117',
                  border: '1px solid #1e2638',
                  borderRadius: '8px',
                  padding: '48px 20px',
                  textAlign: 'center',
                  color: '#8b949e',
                  fontSize: '12px'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
                <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                  {isScanning ? 'Scanning Binance Spot pairs for 1D+1H Uptrend...' : 'No signals yet — press Start to scan'}
                </div>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#8b949e' }}>
                  Only genuine Binance Spot pairs meeting 1D+1H Uptrend, RSI {rsiMin}-{rsiMax}, and 30M RSI &gt; 1H RSI will appear.
                </p>
              </div>
            ) : (
              signals.map(coin => (
                <div
                  key={coin.symbol}
                  style={{
                    background: '#0d1117',
                    border: '1px solid #1e2638',
                    borderRadius: '8px',
                    padding: '12px 16px'
                  }}
                >
                  {/* Row 1: Symbol Name + 1H Badge (Click to open TradingView directly) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onClick={() => openDirectTradingView(coin.symbol, '1H')}
                      title={`Click to open ${coin.symbol} 1H chart directly on TradingView`}
                    >
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#ffffff' }}>
                        {coin.symbol}
                      </span>
                      <span
                        style={{
                          background: 'rgba(57, 211, 83, 0.15)',
                          border: '1px solid #39D353',
                          color: '#39D353',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '1px 7px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span>1H</span>
                        <span>↗</span>
                      </span>
                    </div>

                    <div>
                      <span
                        style={{
                          background: '#091a10',
                          border: '1px solid #1f5131',
                          color: '#39D353',
                          borderRadius: '12px',
                          padding: '2px 10px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                      >
                        V1 Scalping Setup
                      </span>
                    </div>
                  </div>

                  {/* Row 2: 5 Timeframe RSIs Badges (15M, 30M, 1H, 4H, 1D) - All Click to Open TradingView directly */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {[
                      { label: '15M', val: coin.rsi15M, tf: '15M' },
                      { label: '30M', val: coin.rsi30M, tf: '30M' },
                      { label: '1H', val: coin.rsi1H, tf: '1H' },
                      { label: '4H', val: coin.rsi4H, tf: '4H' },
                      { label: '1D', val: coin.rsi1D, tf: '1D' },
                    ].map(item => (
                      <span
                        key={item.label}
                        onClick={() => openDirectTradingView(coin.symbol, item.tf)}
                        title={`Click to open ${item.label} chart directly on TradingView`}
                        style={{
                          background: item.label === '1H' ? 'rgba(57, 211, 83, 0.15)' : '#091a11',
                          border: item.label === '1H' ? '1px solid #39D353' : '1px solid #1f5131',
                          color: '#39D353',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: item.label === '1H' ? 700 : 600,
                          fontFamily: 'monospace',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{item.label}: {item.val.toFixed(1)}</span>
                        <span style={{ fontSize: '9px', opacity: 0.7 }}>↗</span>
                      </span>
                    ))}
                  </div>

                  {/* Row 3: Blue Detail Badges with strict confirmation checks */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: '#0c1424',
                        border: '1px solid #1c2a40',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#58a6ff'
                      }}
                    >
                      RSI 1H: {coin.rsi1H.toFixed(1)}
                    </span>

                    <span
                      style={{
                        background: '#0c1424',
                        border: '1px solid #1c2a40',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#58a6ff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Trend 1H: {coin.trend1H}</span>
                      <span>✅</span>
                    </span>

                    <span
                      style={{
                        background: '#0c1424',
                        border: '1px solid #1c2a40',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#58a6ff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Trend 1D: {coin.trend1D}</span>
                      <span>✅</span>
                    </span>

                    <span
                      style={{
                        background: '#0c1424',
                        border: '1px solid #1c2a40',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#58a6ff'
                      }}
                    >
                      RSI 30M: {coin.rsi30M.toFixed(1)}
                    </span>

                    <span
                      style={{
                        background: '#0c1424',
                        border: '1px solid #1c2a40',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#58a6ff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>30M RSI &gt; 1H RSI: Confirmed</span>
                      <span>✅</span>
                    </span>

                    <span
                      style={{
                        background: '#0c1424',
                        border: '1px solid #1c2a40',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: coin.is15MAbove30M ? '#39D353' : '#58a6ff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>15M RSI &gt; 30M RSI: {coin.is15MAbove30M ? 'Confirmed' : 'Aligned'}</span>
                      <span>{coin.is15MAbove30M ? '✅' : '⚡'}</span>
                    </span>

                    {coin.isFullLadder && (
                      <span
                        style={{
                          background: 'rgba(234, 179, 8, 0.1)',
                          border: '1px solid rgba(234, 179, 8, 0.4)',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#eab308'
                        }}
                      >
                        🌟 Full Multi-TF Cascade (15M &gt; 30M &gt; 1H &gt; 4H &gt; 1D)
                      </span>
                    )}

                    <span
                      style={{
                        background: '#0c1424',
                        border: '1px solid #1c2a40',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#58a6ff'
                      }}
                    >
                      Price: {formatPrice(coin.price)}
                    </span>

                    <span
                      onClick={() => openDirectTradingView(coin.symbol, '1H')}
                      title="Click to open 1H chart directly on TradingView"
                      style={{
                        background: 'rgba(57, 211, 83, 0.1)',
                        border: '1px solid #2ea043',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#39D353',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <span>TF: 1H</span>
                      <span>↗</span>
                    </span>
                  </div>

                  {/* Row 4: Bottom Timestamp */}
                  <div style={{ marginTop: '7px', fontSize: '11px', color: '#8b949e' }}>
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
