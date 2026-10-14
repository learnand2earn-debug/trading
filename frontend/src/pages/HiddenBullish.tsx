import React, { useState, useEffect, useRef } from 'react';
import { api, HiddenCandidateSignal, HiddenActiveCoin } from '../services/api.js';

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

export const HiddenBullish: React.FC<{ navigate: (page: string) => void }> = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [isScanInProgress, setIsScanInProgress] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string>(() => getLocalTimeStr());
  const [soundOn, setSoundOn] = useState(true);
  const [rsiMin, setRsiMin] = useState<number>(30); // User requirement: 30
  const [rsiMax, setRsiMax] = useState<number>(40); // User requirement: 40
  const [signals, setSignals] = useState<HiddenCandidateSignal[]>([]);
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
        const confirmedSigs = data.signals || [];
        const activeList = data.activeCoins || [];

        setProgressWidth('100%');

        setSignals(prevSignals => {
          if (confirmedSigs.length === 0) {
            return prevSignals; // Retain existing signals
          }
          const prevMap = new Map(prevSignals.map(s => [s.symbol, s]));
          const freshAlerts = confirmedSigs.filter(s => !prevMap.has(s.symbol) || s.timeAgo === 'just now');

          if (freshAlerts.length > 0) {
            if (soundRef.current) playChime();
            const freshLogs = freshAlerts.slice(0, 5).map(s => ({
              time: timeStr,
              msg: `🚨 Fresh Signal: ${s.symbol} confirmed - 1H Consolidation + 30M Lead`
            }));
            setLogs(prev => [...freshLogs, ...prev.slice(0, 35)]);
          } else {
            setLogs(prev => [
              {
                time: timeStr,
                msg: `Scanned ${activeList.length} candidates in RSI ${rsiMin}-${rsiMax}, ${confirmedSigs.length} active buy setups.`
              },
              ...prev.slice(0, 35)
            ]);
          }

          // Merge: update existing, append new
          for (const s of confirmedSigs) {
            prevMap.set(s.symbol, s);
          }
          return Array.from(prevMap.values()).sort((a, b) => (b.detectedAt || 0) - (a.detectedAt || 0));
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

  // When countdown hits 0, trigger scan and reset to 30s
  useEffect(() => {
    if (!isScanning) return;
    if (countdown === 0) {
      executeScan();
      setCountdown(30);
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
            <div
              className="method-header"
              style={{
                background: 'linear-gradient(135deg, rgba(88,166,255,.08), var(--card))',
                borderLeft: '3px solid #58A6FF'
              }}
            >
              <div>
                <span
                  className="method-badge"
                  style={{
                    background: 'rgba(88,166,255,.15)',
                    color: '#58A6FF',
                    border: '1px solid rgba(88,166,255,.3)'
                  }}
                >
                  RSI {rsiMin}–{rsiMax} · 1H Consolidation + 30M Lead
                </span>
                <h2 style={{ color: '#58A6FF' }}>Hidden Bullish</h2>
                <p>1H RSI {rsiMin}–{rsiMax} Consolidation (Na Up Na Down) · 30M RSI Leading 1H RSI · +1% TP Target</p>
              </div>
              <div className="method-btns">
                <button
                  className="btn-start"
                  onClick={handleStart}
                  disabled={isScanInProgress}
                  style={{
                    background: isScanning ? 'rgba(88,166,255,.28)' : 'rgba(88,166,255,.15)',
                    color: '#58A6FF',
                    borderColor: isScanning ? '#58A6FF' : 'rgba(88,166,255,.3)'
                  }}
                >
                  {isScanInProgress ? '⏳ Scanning...' : isScanning ? '🟢 Active' : '▶ Start'}
                </button>
                <button className="btn-stop" onClick={handleStop}>⏹ Stop</button>
                <button className="btn-reset" onClick={handleReset}>↺ Reset</button>
              </div>
            </div>

            <div className="scanbar-wrap">
              <div
                className="scanbar"
                id="sb-hiddenBull"
                style={{ width: progressWidth, background: '#58A6FF', transition: 'width 0.4s ease' }}
              ></div>
              <span id="sblabel-hiddenBull" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{statusLabel}</span>
                <span style={{ color: '#8b949e', fontSize: '10px' }}>
                  · Next update: <strong style={{ color: isScanning ? '#58A6FF' : '#8b949e' }}>{isScanInProgress ? 'Scanning...' : isScanning ? `${countdown}s` : 'Paused'}</strong>
                </span>
              </span>
            </div>

            <div className="signals-box">
              <div className="signals-head">
                <span>
                  🚨 Signals{' '}
                  <span
                    className="sig-count"
                    style={{ background: 'rgba(88,166,255,.2)', color: '#58A6FF' }}
                  >
                    {signals.length}
                  </span>
                </span>
                <span className="last-scan">
                  Last scan: <strong style={{ color: '#c9d1d9' }}>{lastScanTime}</strong> · Next in:{' '}
                  <strong style={{ color: isScanning ? '#58A6FF' : '#8b949e' }}>
                    {isScanInProgress ? 'Scanning...' : isScanning ? `${countdown}s` : 'Paused'}
                  </strong>
                </span>
              </div>

              <div className="signals-list" id="sig-hiddenBull">
                {signals.length === 0 ? (
                  <div className="no-sig" style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '13px' }}>
                    {isScanning ? `Surveilling pairs for RSI ${rsiMin}–${rsiMax} consolidation (na up na down) & 30M leadership...` : 'No signals yet — press Start to scan'}
                  </div>
                ) : (
                  signals.map(coin => (
                    <div
                      key={coin.symbol}
                      className="sig-card hiddenBullish"
                      style={{
                        borderLeft: '3px solid #58A6FF',
                        margin: '8px 0',
                        padding: '12px 16px',
                        background: 'var(--card)',
                        borderRadius: '8px',
                        transition: 'transform 0.2s ease, border-color 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{ fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={() => openDirectTradingView(coin.symbol, '1H')}
                            title={`Click to open 1H Chart for ${coin.symbol} directly on TradingView`}
                          >
                            <span style={{ color: '#e6edf3' }}>{coin.symbol}</span>
                            <span style={{ color: '#58A6FF' }}>↗</span>
                            <span style={{ fontSize: '10px', color: '#58A6FF', background: 'rgba(88,166,255,.15)', padding: '1px 5px', borderRadius: '4px' }}>
                              1H Consolidation + 30M Lead
                            </span>
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <a
                            href={`https://www.tradingview.com/chart/?symbol=BINANCE:${coin.cleanSymbol || coin.symbol.replace('USDT', '')}USDT&interval=60`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#161b22',
                              border: '1px solid #30363d',
                              color: '#58a6ff',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Open directly in TradingView.com (1H chart)"
                          >
                            <span>TradingView 1H</span>
                            <span>↗</span>
                          </a>

                          <span
                            style={{
                              background: 'rgba(88,166,255,.15)',
                              color: '#58A6FF',
                              border: '1px solid rgba(88,166,255,.3)',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            RSI {rsiMin}–{rsiMax} CONFIRMED
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                        <span>Price: <strong style={{ color: '#e6edf3' }}>${formatPrice(coin.price)}</strong></span>
                        <span
                          onClick={() => openDirectTradingView(coin.symbol, '1H')}
                          title="Click to open 1H chart directly on TradingView"
                          style={{ cursor: 'pointer', background: 'rgba(88,166,255,.1)', padding: '2px 6px', borderRadius: '4px' }}
                        >
                          1H RSI: <strong style={{ color: '#58A6FF' }}>{coin.rsi1H.toFixed(1)}</strong> ↗
                        </span>
                        <span
                          onClick={() => openDirectTradingView(coin.symbol, '30M')}
                          title="Click to open 30M chart directly on TradingView"
                          style={{ cursor: 'pointer', background: 'rgba(57,211,83,.1)', padding: '2px 6px', borderRadius: '4px' }}
                        >
                          30M RSI: <strong style={{ color: '#39D353' }}>{coin.rsi30M.toFixed(1)}</strong> ↗
                        </span>
                        <span>
                          1H State: <strong style={{ color: '#58A6FF' }}>Consolidation (Flat) ✅</strong>
                        </span>
                        <span>
                          30M Lead: <strong style={{ color: '#39D353' }}>Above 1H (+{(coin.rsi30M - coin.rsi1H).toFixed(1)} pts) ✅</strong>
                        </span>
                        <span style={{ color: coin.change24h >= 0 ? '#39D353' : '#F85149' }}>
                          24h: {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                        </span>
                        <span>Target: <strong style={{ color: '#39D353' }}>+1.00%</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
