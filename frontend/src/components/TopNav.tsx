import React, { useState, useEffect } from 'react';
import { UserProfile } from '../services/api.js';

interface TopNavProps {
  currentRoute: string;
  navigate: (route: string) => void;
  isEmergencyHalted: boolean;
  tradingMode: 'ANALYSIS' | 'PAPER' | 'LIVE';
  onModeChange: (mode: 'ANALYSIS' | 'PAPER' | 'LIVE') => void;
  onKillSwitchChange: (halted: boolean) => void;
  unreadNotifications: number;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentRoute,
  navigate,
  onLogout
}) => {
  const [clockText, setClockText] = useState<string>('');
  const [session, setSession] = useState<{ name: string; color: string; bg: string; border: string; timeLeft: string }>({
    name: 'London+NY ⚡',
    color: '#F85149',
    bg: 'rgba(248,81,73,.12)',
    border: 'rgba(248,81,73,.35)',
    timeLeft: '2h 18m left'
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockText(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Trading Session Calculation matching ScalpPro exactly
      const utcH = now.getUTCHours();
      const utcM = now.getUTCMinutes();
      const utcMins = utcH * 60 + utcM;

      if (utcMins >= 780 && utcMins < 960) {
        const remaining = 960 - utcMins;
        const h = Math.floor(remaining / 60);
        const m = remaining % 60;
        setSession({
          name: 'London+NY ⚡',
          color: '#F85149',
          bg: 'rgba(248,81,73,.12)',
          border: 'rgba(248,81,73,.35)',
          timeLeft: h > 0 ? `${h}h ${m}m left` : `${m}m left`
        });
      } else if (utcMins >= 780 && utcMins < 1320) {
        const remaining = 1320 - utcMins;
        const h = Math.floor(remaining / 60);
        const m = remaining % 60;
        setSession({
          name: 'New York 🗽',
          color: '#58A6FF',
          bg: 'rgba(88,166,255,.12)',
          border: 'rgba(88,166,255,.35)',
          timeLeft: h > 0 ? `${h}h ${m}m left` : `${m}m left`
        });
      } else if (utcMins >= 420 && utcMins < 960) {
        const remaining = 960 - utcMins;
        const h = Math.floor(remaining / 60);
        const m = remaining % 60;
        setSession({
          name: 'London 🇬🇧',
          color: '#39D353',
          bg: 'rgba(57,211,83,.10)',
          border: 'rgba(57,211,83,.32)',
          timeLeft: h > 0 ? `${h}h ${m}m left` : `${m}m left`
        });
      } else {
        setSession({
          name: 'Asian 🌏',
          color: '#F0C040',
          bg: 'rgba(240,192,64,.10)',
          border: 'rgba(240,192,64,.32)',
          timeLeft: 'Active'
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Top Navigation */}
      <nav className="topnav">
        <div className="nav-left">
          <span className="nav-logo" onClick={() => navigate('dashboard')} style={{ cursor: 'pointer' }}>
            📈 Trading with Dawood
          </span>
          <div className="conn-status">
            <span className="conn-dot on" id="connDot"></span>
            <span id="connText">Connected</span>
          </div>
        </div>
        <div className="nav-right">
          <div
            id="sessionBadge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid',
              marginRight: '8px',
              cursor: 'default',
              transition: 'all .3s',
              background: session.bg,
              borderColor: session.border,
              color: session.color
            }}
          >
            <span
              id="sessionDot"
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                display: 'inline-block',
                background: session.color,
                boxShadow: `0 0 5px ${session.color}`
              }}
            ></span>
            <span id="sessionName">{session.name}</span>
            <span id="sessionTime" style={{ fontSize: '10px', fontWeight: 400, opacity: 0.75 }}>
              {session.timeLeft}
            </span>
          </div>
          <span className="clock" id="clock">{clockText}</span>
          <button className="btn-logout" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      {/* Trading with Dawood Tab Bar — 1st Dashboard, then V1, Hidden Bullish, Order Block, Admin Panel */}
      <div className="tab-bar">
        <button
          className={`tab ${currentRoute === 'dashboard' ? 'active' : ''}`}
          data-tab="dashboard"
          onClick={() => navigate('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab ${currentRoute === 'v1' ? 'active' : ''}`}
          data-tab="v1"
          onClick={() => navigate('v1')}
        >
          ⚡ V1
        </button>
        <button
          className={`tab ${currentRoute === 'hiddenBullish' ? 'active' : ''}`}
          data-tab="hiddenBullish"
          onClick={() => navigate('hiddenBullish')}
        >
          🔵 Hidden Bullish
        </button>
        <button
          className={`tab ${currentRoute === 'orderBlock' ? 'active' : ''}`}
          data-tab="orderBlock"
          onClick={() => navigate('orderBlock')}
        >
          🟩 Order Block
        </button>
        <button
          className={`tab ${currentRoute === 'admin' ? 'active' : ''}`}
          data-tab="admin"
          onClick={() => navigate('admin')}
        >
          ⚙️ Admin Panel
        </button>
      </div>
    </>
  );
};
