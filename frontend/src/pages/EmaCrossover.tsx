import React, { useState, useEffect } from 'react';
import { api, ScannerRow } from '../services/api.js';
import { TradingViewModal } from '../components/TradingViewModal.js';

export const EmaCrossover: React.FC<{ navigate: (page: string) => void }> = ({ navigate }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [fastEma, setFastEma] = useState(9);
  const [slowEma, setSlowEma] = useState(33);
  const [timeframe, setTimeframe] = useState('1h');
  const [soundOn, setSoundOn] = useState(true);
  const [signals, setSignals] = useState<ScannerRow[]>([]);
  const [activeCoins, setActiveCoins] = useState<ScannerRow[]>([]);
  const [logs, setLogs] = useState<{ time: string; msg: string }[]>([]);
  const [statusLabel, setStatusLabel] = useState('Idle');
  const [progressWidth, setProgressWidth] = useState('0%');
  const [selectedChartCoin, setSelectedChartCoin] = useState<string | null>(null);

  useEffect(() => {
    api.getScanner().then(data => {
      const rows = data.rows || [];
      const emaMatches = rows.filter(r => (r.ema9 > r.ema33));
      setActiveCoins(emaMatches);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let timer: any;
    if (isScanning) {
      setStatusLabel(`Scanning pairs for ${timeframe.toUpperCase()} EMA ${fastEma}/${slowEma} crossover...`);
      setProgressWidth('30%');

      const runScan = async () => {
        setProgressWidth('75%');
        try {
          const data = await api.getScanner();
          const rows = data.rows || [];
          const matched = rows.filter(r => (r.ema9 > r.ema33));
          setActiveCoins(matched);
          const sigs = matched.filter(r => r.signalState === 'ACTIVE_SIGNAL' || (r.trend1H === 'UPTREND' && r.ema9 > r.ema33));
          setSignals(sigs);
          setProgressWidth('100%');
          setTimeout(() => setProgressWidth('0%'), 1200);
          setStatusLabel(`Active · Monitoring ${matched.length} crossover candidates`);
          setLogs(prev => [
            { time: new Date().toLocaleTimeString(), msg: `Checked pairs for EMA ${fastEma}/${slowEma}. Found ${matched.length} candidates.` },
            ...prev.slice(0, 15)
          ]);
        } catch (e) {
          setStatusLabel('Error scanning crossover');
        }
      };

      runScan();
      timer = setInterval(runScan, 30000);
    } else {
      setStatusLabel('Idle');
      setProgressWidth('0%');
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isScanning, fastEma, slowEma, timeframe]);

  return (
    <div className="content">
      <div className="tab-panel active" id="tab-emaCrossover">
        <div className="method-layout">
          {/* Main Left: Header, Scanbar, Signals */}
          <div className="method-main">
            <div className="method-header ema-header">
              <div>
                <span className="method-badge ema-badge">
                  <span id="emaSummary">EMA {fastEma} / {slowEma} · {timeframe.toUpperCase()}</span>
                </span>
                <h2>EMA Crossover</h2>
                <p>Bullish crossover confirmed on a closed candle</p>
              </div>
              <div className="method-btns">
                <button className="btn-start" onClick={() => setIsScanning(true)}>▶ Start</button>
                <button className="btn-stop" onClick={() => setIsScanning(false)}>⏹ Stop</button>
                <button
                  className="btn-reset"
                  onClick={() => {
                    setIsScanning(false);
                    setSignals([]);
                    setProgressWidth('0%');
                    setStatusLabel('Idle');
                  }}
                >
                  ↺ Reset
                </button>
              </div>
            </div>

            <div className="scanbar-wrap">
              <div className="scanbar" id="sb-emaCrossover" style={{ width: progressWidth, background: '#58A6FF' }}></div>
              <span id="sblabel-emaCrossover">{statusLabel}</span>
            </div>

            <div className="signals-box">
              <div className="signals-head">
                <span>🚨 Signals <span className="sig-count" id="cnt-emaCrossover">{signals.length}</span></span>
                <span className="last-scan" id="ls-emaCrossover">
                  {isScanning ? 'Auto scan active' : ''}
                </span>
              </div>

              <div className="signals-list" id="sig-emaCrossover">
                {signals.length === 0 ? (
                  <div className="no-sig" style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '13px' }}>
                    No signals yet — press Start to scan
                  </div>
                ) : (
                  signals.map(coin => (
                    <div
                      key={coin.symbol}
                      className="sig-card emaCrossover"
                      style={{ borderLeft: '3px solid #58A6FF', margin: '8px 0', padding: '12px 16px', background: 'var(--card)', borderRadius: '8px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', cursor: 'pointer' }} onClick={() => setSelectedChartCoin(coin.symbol)}>
                          {coin.symbol} ↗ <span style={{ fontSize: '10px', color: '#58A6FF' }}>1H</span>
                        </span>
                        <span style={{ background: 'rgba(88,166,255,.2)', color: '#58A6FF', border: '1px solid rgba(88,166,255,.4)', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                          BULLISH CROSS
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                        <span>Price: ${coin.price}</span>
                        <span>EMA9: {coin.ema9}</span>
                        <span>EMA33: {coin.ema33}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Side Right: Settings, Rules, Logs, Active Coins */}
          <div className="method-side">
            <div className="side-card ema-side">
              <h4>⚙️ EMA Settings</h4>
              <div className="form-group">
                <label style={{ color: '#39d353' }}>Fast EMA — Green</label>
                <input id="ema-fast" type="number" min="2" max="199" value={fastEma} onChange={e => setFastEma(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label style={{ color: '#f85149' }}>Slow EMA — Red</label>
                <input id="ema-slow" type="number" min="3" max="200" value={slowEma} onChange={e => setSlowEma(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Timeframe</label>
                <select id="ema-timeframe" value={timeframe} onChange={e => setTimeframe(e.target.value)}>
                  <option value="5m">5M</option>
                  <option value="15m">15M</option>
                  <option value="30m">30M</option>
                  <option value="1h">1H</option>
                  <option value="4h">4H</option>
                  <option value="1d">1D</option>
                </select>
              </div>
              <div className="sound-toggle">
                <label>🔊 Sound</label>
                <label className="toggle">
                  <input type="checkbox" id="emaCrossover-sound" checked={soundOn} onChange={e => setSoundOn(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>
              <button
                className="save-btn ema-save"
                onClick={() => setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `EMA settings saved: ${fastEma}/${slowEma} on ${timeframe.toUpperCase()}` }, ...prev])}
              >
                💾 Save
              </button>
            </div>

            <div className="side-card rules-card">
              <h4>📋 Method Rules</h4>
              <ul>
                <li>Fast EMA crosses from below to above Slow EMA</li>
                <li>Closed-candle confirmation only</li>
                <li>All available USDT Spot pairs checked sequentially</li>
                <li>One alert per crossover, timeframe and period settings</li>
              </ul>
            </div>

            <div className="side-card logs-card">
              <h4>📜 Logs</h4>
              <div className="logs-wrap" id="logs-emaCrossover" style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '11px', color: 'var(--muted)' }}>
                {logs.length === 0 ? (
                  <div style={{ color: 'var(--dim)', padding: '6px 0' }}>No logs yet</div>
                ) : (
                  logs.map((l, i) => (
                    <div key={i} style={{ padding: '2px 0' }}>
                      <span style={{ color: 'var(--dim)' }}>[{l.time}]</span> {l.msg}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="side-card" style={{ borderColor: 'rgba(46,160,67,.3)' }}>
              <h4 style={{ color: '#2EA043' }}>🟢 Active Coins — EMA Crossover</h4>
              <div id="active-coins-emaCrossover">
                {activeCoins.length === 0 ? (
                  <div style={{ color: 'var(--dim)', fontSize: '11px', padding: '6px 0' }}>No active coins</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {activeCoins.slice(0, 15).map(c => (
                      <span
                        key={c.symbol}
                        onClick={() => setSelectedChartCoin(c.symbol)}
                        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}
                      >
                        {c.symbol.replace('USDT', '')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedChartCoin && (
        <TradingViewModal
          symbol={selectedChartCoin}
          isOpen={true}
          onClose={() => setSelectedChartCoin(null)}
        />
      )}
    </div>
  );
};
