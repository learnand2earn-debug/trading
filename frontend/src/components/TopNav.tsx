import React, { useState, useEffect } from 'react';

interface TopNavProps {
  currentRoute: string;
  navigate: (route: string) => void;
  isEmergencyHalted?: boolean;
  tradingMode?: 'ANALYSIS' | 'PAPER' | 'LIVE';
  onModeChange?: (mode: 'ANALYSIS' | 'PAPER' | 'LIVE') => void;
  onKillSwitchChange?: (halted: boolean) => void;
  unreadNotifications?: number;
  currentUser?: any;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentRoute,
  navigate,
  currentUser,
  onLogout
}) => {
  const [clock, setClock] = useState<string>('');
  const [sessionInfo, setSessionInfo] = useState<string>('Asian 6h 52m left');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );

      // Session calculation (UTC based Asian 00:00-09:00, London 07:00-16:00, NY 13:00-22:00)
      // With +2 min adjustment per user requirement
      const utcHours = now.getUTCHours();
      const utcMins = now.getUTCMinutes();
      if (utcHours >= 0 && utcHours < 9) {
        const totalMinutesLeft = (8 - utcHours) * 60 + (59 - utcMins) + 2;
        const leftH = Math.floor(totalMinutesLeft / 60);
        const leftM = totalMinutesLeft % 60;
        setSessionInfo(`Asian ${leftH}h ${leftM}m left`);
      } else if (utcHours >= 7 && utcHours < 16) {
        const totalMinutesLeft = (15 - utcHours) * 60 + (59 - utcMins) + 2;
        const leftH = Math.floor(totalMinutesLeft / 60);
        const leftM = totalMinutesLeft % 60;
        setSessionInfo(`London ${leftH}h ${leftM}m left`);
      } else {
        const totalMinutesLeft = (21 - utcHours) * 60 + (59 - utcMins) + 2;
        const leftH = Math.max(0, Math.floor(totalMinutesLeft / 60));
        const leftM = Math.max(0, totalMinutesLeft % 60);
        setSessionInfo(`New York ${leftH}h ${leftM}m left`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{ background: '#070a0f', borderBottom: '1px solid #161f30' }}>
      {/* ===== ROW 1: BRAND BAR MATCHING SCREENSHOT EXACTLY ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 20px',
          borderBottom: '1px solid #121824',
          background: '#05080c'
        }}
      >
        {/* Left: Brand Icon + Trading with Dawood + Lite v1.2.8 + Connected + Ultra Pro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Logo icon */}
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #22c55e, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(34,197,94,0.35)'
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>

          {/* Title: Trading with Dawood */}
          <span
            style={{
              fontWeight: 800,
              fontSize: '13.5px',
              color: '#ffffff',
              letterSpacing: '-0.2px'
            }}
          >
            Trading with Dawood
          </span>

          {/* Lite v1.2.8 */}
          <span
            style={{
              background: '#161b22',
              border: '1px solid #30363d',
              color: '#8b949e',
              fontSize: '10px',
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: '4px'
            }}
          >
            Lite v1.2.8
          </span>

          {/* Connected badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#34d399',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e'
              }}
            />
            Connected
          </span>

          {/* Ultra Pro pill */}
          <span
            style={{
              background: 'transparent',
              border: '1px solid #22c55e',
              color: '#34d399',
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '2px 9px',
              borderRadius: '5px',
              letterSpacing: '0.2px'
            }}
          >
            Ultra Pro
          </span>
        </div>

        {/* Right: Asian Session + Clock + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Asian Session Badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: '12px'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#fbbf24',
                boxShadow: '0 0 6px #fbbf24'
              }}
            />
            {sessionInfo}
          </span>

          {/* Clock */}
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 600,
              color: '#c9d1d9',
              letterSpacing: '0.5px'
            }}
          >
            {clock}
          </span>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                background: '#2a1114',
                border: '1px solid #5a1e24',
                color: '#f85149',
                padding: '3px 10px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Logout from current session"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* ===== ROW 2: NAVIGATION TABS & LICENSE BADGE ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 20px',
          background: '#070a0f'
        }}
      >
        {/* Left Tabs matching user screenshot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('dashboard')}
            style={{
              background: currentRoute === 'dashboard' ? 'rgba(57, 211, 83, 0.1)' : 'transparent',
              border: currentRoute === 'dashboard' ? '1px solid #39D353' : '1px solid transparent',
              color: currentRoute === 'dashboard' ? '#39D353' : '#8b949e',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>📊</span>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate('v1')}
            style={{
              background: currentRoute === 'v1' ? 'rgba(57, 211, 83, 0.1)' : 'transparent',
              border: currentRoute === 'v1' ? '1px solid #39D353' : '1px solid transparent',
              color: currentRoute === 'v1' ? '#39D353' : '#8b949e',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>⚡</span>
            <span>V1 Scalping</span>
          </button>

          <button
            onClick={() => navigate('hiddenBullish')}
            style={{
              background: currentRoute === 'hiddenBullish' ? 'rgba(57, 211, 83, 0.1)' : 'transparent',
              border: currentRoute === 'hiddenBullish' ? '1px solid #39D353' : '1px solid transparent',
              color: currentRoute === 'hiddenBullish' ? '#39D353' : '#8b949e',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🔵</span>
            <span>Hidden Bullish</span>
          </button>


          <button
            onClick={() => navigate('admin')}
            style={{
              background: currentRoute === 'admin' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              border: currentRoute === 'admin' ? '1px solid #38bdf8' : '1px solid transparent',
              color: currentRoute === 'admin' ? '#38bdf8' : '#8b949e',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🛡️</span>
            <span>Admin Panel</span>
          </button>
        </div>

        {/* Right Corner: License 28/30 days left badge */}
        <div>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(57, 211, 83, 0.08)',
              border: '1px solid rgba(57, 211, 83, 0.35)',
              color: '#39D353',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.2px'
            }}
          >
            License · 28 days left
          </span>
        </div>
      </div>
    </header>
  );
};
