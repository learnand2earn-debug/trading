import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Phone,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  Activity,
  BarChart2,
  Shield,
  Wifi,
  Clock
} from 'lucide-react';
import { api, UserProfile, getStoredLicenseKey } from '../services/api.js';
import {
  GAINERS_COINS,
  V1_ZONE_COINS,
  NEUTRAL_COINS,
  HIDDEN_BULL_COINS,
  OVERSOLD_COINS,
  EXTREME_COINS
} from '../data/marketCoins.js';

interface ScalpProLoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  sessionKickMessage?: string | null;
}

const FEATURES = [
  '30-Minute Momentum Confirmation Scanner',
  '1D & 1H Bullish Trend Alignment',
  '100-Candle Wilder RMA RSI Engine',
  '15M > 30M > 1H Positive RSI Leadership',
  'Hidden Bullish RSI Consolidation Scanner',
  'Instant Direct TradingView Chart Launch',
  'Single-Device Hardware-Locked Session Security',
  'Binance Multi-Coin Real-Time 24/7 Scanner',
  'Live Market Structure & Support Filter',
  'Automated VIP Strategy Signal Engine',
  'Anti-Concurrent License Invalidation Protocol',
  'ScalpPro Hub Real-Time WhatsApp Broadcast'
];

// Live stats from coin data
const TOTAL_COINS = GAINERS_COINS.length + V1_ZONE_COINS.length + NEUTRAL_COINS.length + HIDDEN_BULL_COINS.length + OVERSOLD_COINS.length + EXTREME_COINS.length;
const V1_ZONE_COUNT = V1_ZONE_COINS.length;
const HIDDEN_BULL_COUNT = HIDDEN_BULL_COINS.length;
const GAINERS_COUNT = GAINERS_COINS.length;

const STAT_CARDS = [
  { label: 'Coins Monitored', value: String(TOTAL_COINS), icon: '🪙', color: '#34d399' },
  { label: 'V1 Zone Active', value: String(V1_ZONE_COUNT), icon: '⚡', color: '#22c55e' },
  { label: 'Hidden Bullish', value: String(HIDDEN_BULL_COUNT), icon: '🔵', color: '#60a5fa' },
  { label: 'Top Gainers', value: String(GAINERS_COUNT), icon: '🚀', color: '#a78bfa' },
  { label: 'Market Status', value: 'LIVE', icon: '📡', color: '#34d399' },
  { label: 'Scanners Online', value: '2 / 2', icon: '🟢', color: '#4ade80' },
];

export const ScalpProLogin: React.FC<ScalpProLoginProps> = ({
  onLoginSuccess,
  sessionKickMessage
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [featureIndex, setFeatureIndex] = useState(4);
  const [progress, setProgress] = useState(35);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const savedKey = getStoredLicenseKey();
    if (savedKey) setLicenseKey(savedKey);
  }, []);

  useEffect(() => {
    const tick = () => setCurrentTime(new Date(Date.now() + 2 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setFeatureIndex(prev => (prev + 1) % FEATURES.length);
          return 0;
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!username.trim()) { setErrorMessage('Please enter your username.'); return; }
    if (!password) { setErrorMessage('Please enter your password.'); return; }
    setLoading(true);
    try {
      const res = await api.login(username.trim(), password, licenseKey.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Login failed. Check credentials or license key.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px', borderRadius: '10px',
    background: 'rgba(4,12,8,0.8)',
    border: '1px solid rgba(52,211,153,0.28)',
    color: '#e2fef0', fontSize: '13px',
    outline: 'none', transition: 'border-color 0.2s',
    fontFamily: 'inherit'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '9px', letterSpacing: '1.8px',
    fontWeight: 700, color: '#4b7a5f', textTransform: 'uppercase', marginBottom: '6px'
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: 'linear-gradient(145deg, #071410 0%, #050e0b 40%, #0a1c10 70%, #071410 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex', flexDirection: 'column',
      padding: '20px 16px', boxSizing: 'border-box',
      overflowX: 'hidden', overflowY: 'auto',
      position: 'relative'
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'fixed', top: '25%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '700px', height: '500px', borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(22,163,74,0.10) 0%, transparent 70%)'
      }} />

      {/* ====== TOP STATUS BAR ====== */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px', position: 'relative', zIndex: 10,
        maxWidth: '1140px', margin: '0 auto 16px', width: '100%'
      }}>
        {/* Brand name top-left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 14px rgba(34,197,94,0.45)'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>Trading with Dawood</div>
            <div style={{ fontSize: '9px', color: '#34d399', letterSpacing: '0.5px' }}>Smart Binance Coin Finder</div>
          </div>
        </div>

        {/* Right: Time + Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'rgba(10,28,18,0.85)', border: '1px solid rgba(52,211,153,0.3)',
            borderRadius: '20px', padding: '4px 12px', fontSize: '11px', color: '#34d399', fontWeight: 700
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', display: 'inline-block' }} />
            LIVE
          </div>
          <div style={{
            background: 'rgba(10,28,18,0.85)', border: '1px solid rgba(52,211,153,0.22)',
            borderRadius: '20px', padding: '4px 12px', fontSize: '11px', color: '#6ee7b7', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '5px'
          }}>
            <Clock size={11} color="#34d399" />
            {currentTime}
          </div>
        </div>
      </div>

      {/* ====== LIVE DASHBOARD STATS ROW ====== */}
      <div style={{
        maxWidth: '1140px', margin: '0 auto 18px', width: '100%',
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px',
        position: 'relative', zIndex: 10
      }}>
        {STAT_CARDS.map((stat, i) => (
          <div key={i} style={{
            padding: '12px 10px', borderRadius: '12px', textAlign: 'center',
            background: 'rgba(8, 22, 14, 0.9)',
            border: `1px solid rgba(${stat.color === '#34d399' ? '52,211,153' : stat.color === '#60a5fa' ? '96,165,250' : stat.color === '#a78bfa' ? '167,139,250' : '74,222,128'},0.32)`,
            boxShadow: `0 0 16px rgba(${stat.color === '#34d399' ? '52,211,153' : '74,222,128'},0.07)`,
          }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: stat.color, lineHeight: 1.1 }}>{stat.value}</div>
            <div style={{ fontSize: '9px', color: '#4b7a5f', fontWeight: 600, marginTop: '3px', letterSpacing: '0.4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ====== WHATSAPP BANNER ====== */}
      <div style={{ maxWidth: '1140px', margin: '0 auto 18px', width: '100%', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderRadius: '14px',
          background: 'rgba(8, 22, 14, 0.9)',
          border: '1px solid rgba(52,211,153,0.42)',
          boxShadow: '0 0 22px rgba(52,211,153,0.1)',
        }}>
          <button onClick={() => setFeatureIndex(p => (p - 1 + FEATURES.length) % FEATURES.length)} style={{
            width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer', flexShrink: 0,
            background: 'rgba(10,30,18,0.9)', border: '1px solid rgba(52,211,153,0.35)',
            color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}><ChevronLeft size={15} /></button>

          <a href="https://wa.me/923164404787" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
            color: '#f0fdf4', fontWeight: 600, fontSize: '13px', textAlign: 'center'
          }}>
            <span style={{ fontSize: '15px' }}>📢</span>
            <span>Follow the <strong>Trading with Dawood</strong> Hub</span>
            <span style={{ color: '#fbbf24' }}>⭐</span>
            <span>channel on WhatsApp</span>
            <ExternalLink size={12} color="#34d399" />
          </a>

          <button onClick={() => setFeatureIndex(p => (p + 1) % FEATURES.length)} style={{
            width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer', flexShrink: 0,
            background: 'rgba(10,30,18,0.9)', border: '1px solid rgba(52,211,153,0.35)',
            color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}><ChevronRight size={15} /></button>
        </div>
      </div>

      {/* ====== CENTER 3-COLUMN ====== */}
      <div style={{
        maxWidth: '1140px', margin: '0 auto', width: '100%',
        display: 'grid', gridTemplateColumns: '1fr 1.7fr 1fr', gap: '22px',
        alignItems: 'center', position: 'relative', zIndex: 10, flex: 1, paddingBottom: '18px'
      }}>

        {/* LEFT: NEED HELP */}
        <div style={{
          padding: '26px 20px', borderRadius: '18px', textAlign: 'center',
          background: 'rgba(7, 19, 12, 0.92)',
          border: '1px solid rgba(52,211,153,0.35)',
          boxShadow: '0 0 28px rgba(52,211,153,0.08)',
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '2px', fontWeight: 700, color: '#4b7a5f', marginBottom: '8px', textTransform: 'uppercase' }}>
            NEED HELP?
          </div>
          <div style={{ fontSize: '12px', color: '#a7f3d0', fontWeight: 500, marginBottom: '16px', lineHeight: 1.6 }}>
            Login or Technical Support
          </div>
          <a href="https://wa.me/923164404787" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '9px', textDecoration: 'none',
            color: '#34d399', fontWeight: 800, fontSize: '14px'
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Phone size={14} color="#34d399" />
            </div>
            +923164404787
          </a>

          {/* Scanner statuses */}
          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(40,80,55,0.5)', paddingTop: '16px', textAlign: 'left' }}>
            <div style={{ fontSize: '9px', color: '#4b7a5f', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>Scanner Status</div>
            {[
              { name: 'V1 Scalping', status: 'Active', on: true },
              { name: 'Hidden Bullish', status: 'Live', on: true },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.on ? '#22c55e' : '#4b5563', boxShadow: s.on ? '0 0 5px #22c55e' : 'none', display: 'inline-block' }} />
                  <span style={{ fontSize: '10px', color: s.on ? '#d1fae5' : '#6b7280' }}>{s.name}</span>
                </div>
                <span style={{ fontSize: '9px', color: s.on ? '#22c55e' : '#4b5563', fontWeight: 700 }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: LOGIN FORM */}
        <div style={{
          borderRadius: '22px',
          background: 'rgba(6, 17, 11, 0.95)',
          border: '1px solid rgba(36,72,50,0.8)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.6), 0 0 50px rgba(52,211,153,0.05)',
          padding: '36px 32px',
        }}>
          {/* Brand header inside form */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '60px', height: '60px', margin: '0 auto 12px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #34d399, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 35px rgba(52,211,153,0.45), 0 0 70px rgba(16,185,129,0.2)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
              Trading with Dawood
            </h1>
            <p style={{ fontSize: '11px', color: '#6ee7b7', margin: 0, letterSpacing: '0.5px' }}>
              Smart Binance Coin Finder
            </p>
          </div>

          {/* Kick message */}
          {sessionKickMessage && (
            <div style={{
              marginBottom: '18px', padding: '12px 14px', borderRadius: '10px',
              background: 'rgba(120,53,15,0.35)', border: '1px solid rgba(245,158,11,0.45)',
              color: '#fde68a', fontSize: '11px', display: 'flex', alignItems: 'flex-start', gap: '10px'
            }}>
              <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ lineHeight: 1.6 }}>{sessionKickMessage}</span>
            </div>
          )}

          {/* Error */}
          {errorMessage && (
            <div style={{
              marginBottom: '18px', padding: '12px 14px', borderRadius: '10px',
              background: 'rgba(127,29,29,0.35)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5', fontSize: '11px', display: 'flex', alignItems: 'flex-start', gap: '10px'
            }}>
              <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
              <span style={{ lineHeight: 1.6 }}>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>USERNAME</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter username" autoComplete="username" required
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#34d399')}
                onBlur={e => (e.target.style.borderColor = 'rgba(52,211,153,0.28)')} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter password" autoComplete="current-password" required
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#34d399')}
                onBlur={e => (e.target.style.borderColor = 'rgba(52,211,153,0.28)')} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>LICENSE KEY</label>
              <input type="text" value={licenseKey} onChange={e => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="Admin can leave this empty"
                style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '1px', fontSize: '12px' }}
                onFocus={e => (e.target.style.borderColor = '#34d399')}
                onBlur={e => (e.target.style.borderColor = 'rgba(52,211,153,0.28)')} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: '11px', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#14532d' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff', fontWeight: 900, fontSize: '14px', letterSpacing: '0.3px',
              boxShadow: loading ? 'none' : '0 0 30px rgba(34,197,94,0.55), 0 4px 18px rgba(22,163,74,0.35)',
              transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              {loading
                ? <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : <><Shield size={15} /> Sign In Securely</>
              }
            </button>
          </form>

          {/* Quick fills */}
          <div style={{
            marginTop: '16px', paddingTop: '14px',
            borderTop: '1px solid rgba(30,60,40,0.7)',
            display: 'flex', justifyContent: 'space-between'
          }}>
            <button onClick={() => { setUsername('admin'); setPassword('admin123'); setLicenseKey(''); setErrorMessage(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#34d399', fontSize: '10px', fontFamily: 'monospace', textDecoration: 'underline' }}>
              Admin Quick Fill
            </button>
            <button onClick={() => { setUsername('Dawood'); setPassword('dawood12345'); setLicenseKey('SP-031300-DA5B9B-D2D427-FFF0E6-49D3E5'); setErrorMessage(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6ee7b7', fontSize: '10px', fontFamily: 'monospace', textDecoration: 'underline' }}>
              Dawood Quick Fill
            </button>
          </div>
        </div>

        {/* RIGHT: GET ACCESS */}
        <div style={{
          padding: '26px 20px', borderRadius: '18px', textAlign: 'center',
          background: 'rgba(7, 19, 12, 0.92)',
          border: '1px solid rgba(52,211,153,0.35)',
          boxShadow: '0 0 28px rgba(52,211,153,0.08)',
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '2px', fontWeight: 700, color: '#4b7a5f', marginBottom: '8px', textTransform: 'uppercase' }}>
            GET ACCESS
          </div>
          <div style={{ fontSize: '12px', color: '#a7f3d0', fontWeight: 500, marginBottom: '16px', lineHeight: 1.6 }}>
            License & Subscription
          </div>
          <a href="https://wa.me/923164404787" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '9px', textDecoration: 'none',
            color: '#34d399', fontWeight: 800, fontSize: '14px'
          }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Phone size={14} color="#34d399" />
            </div>
            +923164404787
          </a>

          {/* Market Heatmap mini preview */}
          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(40,80,55,0.5)', paddingTop: '16px', textAlign: 'left' }}>
            <div style={{ fontSize: '9px', color: '#4b7a5f', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>RSI Market Zones</div>
            {[
              { label: '🚀 Gainers (RSI 60+)', count: GAINERS_COUNT, color: '#a78bfa' },
              { label: '⚡ V1 Zone (RSI 50-60)', count: V1_ZONE_COUNT, color: '#22c55e' },
              { label: '⚖️ Neutral (RSI 40-50)', count: NEUTRAL_COINS.length, color: '#60a5fa' },
              { label: '🔵 Hidden Bull (30-40)', count: HIDDEN_BULL_COUNT, color: '#38bdf8' },
              { label: '🟠 Oversold (20-30)', count: OVERSOLD_COINS.length, color: '#fb923c' },
              { label: '🔴 Extreme (10-20)', count: EXTREME_COINS.length, color: '#f87171' },
            ].map((z, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>{z.label}</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: z.color }}>{z.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== FEATURE TICKER ====== */}
      <div style={{ maxWidth: '1140px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
        <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#4b7a5f', marginBottom: '9px' }}>
          Explore Trading with Dawood Features
        </p>
        <div style={{
          position: 'relative', borderRadius: '14px', overflow: 'hidden',
          background: 'rgba(8, 22, 14, 0.9)',
          border: '1px solid rgba(52,211,153,0.38)',
          padding: '13px 18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                background: 'rgba(12,36,22,0.9)', border: '1px solid rgba(52,211,153,0.38)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Zap size={14} color="#34d399" />
              </div>
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '13px' }}>
                {FEATURES[featureIndex]}
              </span>
            </div>
            <span style={{ color: '#22c55e', fontFamily: 'monospace', fontWeight: 700, fontSize: '12px', letterSpacing: '1px', flexShrink: 0 }}>
              {String(featureIndex + 1).padStart(2, '0')} / {String(FEATURES.length).padStart(2, '0')}
            </span>
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, height: '2px',
            background: 'linear-gradient(90deg, #22c55e, #34d399)',
            width: `${progress}%`, transition: 'width 0.1s linear',
            boxShadow: '0 0 8px rgba(34,197,94,0.7)'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(110,231,183,0.2); }
      `}</style>
    </div>
  );
};
