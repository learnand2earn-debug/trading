import React, { useEffect, useState } from 'react';
import { TopNav } from './components/TopNav.js';
import { EnterpriseDrawer } from './components/EnterpriseDrawer.js';
import { AuthModal } from './components/AuthModal.js';
import { Dashboard } from './pages/Dashboard.js';
import { V1Scalping } from './pages/V1Scalping.js';
import { OrderBlock } from './pages/OrderBlock.js';
import { EmaCrossover } from './pages/EmaCrossover.js';
import { BinanceRiskWatch } from './pages/BinanceRiskWatch.js';
import { Scanner } from './pages/Scanner.js';
import { CoinDetail } from './pages/CoinDetail.js';
import { Signals } from './pages/Signals.js';
import { PaperTrading } from './pages/PaperTrading.js';
import { LiveTrading } from './pages/LiveTrading.js';
import { UserPortal } from './pages/UserPortal.js';
import { Backtests } from './pages/Backtests.js';
import { Replay } from './pages/Replay.js';
import { Journal } from './pages/Journal.js';
import { Agents } from './pages/Agents.js';
import { CommandCenter } from './pages/CommandCenter.js';
import { Admin } from './pages/Admin.js';
import { HiddenBullish } from './pages/HiddenBullish.js';
import { Health } from './pages/Health.js';
import { ScalpProLogin } from './components/ScalpProLogin.js';
import { api, getAuthToken, UserProfile, wsManager } from './services/api.js';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [tradingMode, setTradingMode] = useState<'ANALYSIS' | 'PAPER' | 'LIVE'>('ANALYSIS');
  const [isEmergencyHalted, setIsEmergencyHalted] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [sessionKickMessage, setSessionKickMessage] = useState<string | null>(null);

  useEffect(() => {
    // Connect real-time WebSocket
    wsManager.connect();
    const unsub = wsManager.subscribe((msg) => {
      if (msg.type === 'EMERGENCY_STOP') {
        setIsEmergencyHalted(true);
      } else if (msg.type === 'SIGNAL_CREATED' || msg.type === 'TARGET_REACHED') {
        setUnreadNotifications(prev => prev + 1);
      }
    });

    // Restore authenticated session if token present and validate session
    const token = getAuthToken();
    if (token) {
      api.validateSession()
        .then(async (sessionRes) => {
          if (sessionRes.valid) {
            const data = await api.getMe();
            if (data && data.user) {
              setCurrentUser(data.user);
            } else {
              api.logout();
              setCurrentUser(null);
            }
          } else {
            api.logout();
            setCurrentUser(null);
            if (sessionRes.code === 'SESSION_TERMINATED') {
              setSessionKickMessage('⚠️ Session Terminated: Your license was logged in from another device or browser. Only 1 device is allowed at a time.');
            }
          }
        })
        .catch(() => {
          api.logout();
          setCurrentUser(null);
        })
        .finally(() => {
          setIsCheckingAuth(false);
        });
    } else {
      setIsCheckingAuth(false);
    }

    // Initial fetch of risk & settings
    api.getRiskSettings().then(res => {
      setIsEmergencyHalted(res.isEmergencyHalted);
      setTradingMode(res.mode || 'ANALYSIS');
    }).catch(() => {});

    return () => unsub();
  }, []);

  // Real-time Single Device Session Protection (Heartbeat)
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(async () => {
      try {
        const sessionCheck = await api.validateSession();
        if (!sessionCheck.valid) {
          api.logout();
          setCurrentUser(null);
          if (sessionCheck.code === 'SESSION_TERMINATED') {
            setSessionKickMessage('⚠️ Session Terminated: Your license was logged in on another device or browser. Only 1 device is allowed at a time.');
          } else if (sessionCheck.code === 'LICENSE_EXPIRED') {
            setSessionKickMessage('⚠️ License Expired: Your subscription has expired. Please contact support to renew.');
          } else if (sessionCheck.code === 'LICENSE_REVOKED') {
            setSessionKickMessage('⚠️ License Revoked: Your license was revoked by the administrator.');
          } else {
            setSessionKickMessage('⚠️ Session expired. Please log in again.');
          }
        }
      } catch (e) {
        // network glitch, retain session until confirmed
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleModeChange = async (mode: 'ANALYSIS' | 'PAPER' | 'LIVE') => {
    setTradingMode(mode);
    await api.setTradingMode(mode);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setSessionKickMessage(null);
  };


  const renderContent = () => {
    if (currentRoute === 'dashboard') {
      return <Dashboard navigate={setCurrentRoute} />;
    }
    if (currentRoute === 'v1') {
      return <V1Scalping navigate={setCurrentRoute} />;
    }
    if (currentRoute === 'hiddenBullish') {
      return <HiddenBullish navigate={setCurrentRoute} />;
    }
    if (currentRoute === 'orderBlock') {
      return <OrderBlock navigate={setCurrentRoute} />;
    }
    if (currentRoute === 'admin') {
      return <Admin />;
    }
    if (currentRoute === 'scanner') {
      return <Scanner navigate={setCurrentRoute} />;
    }
    if (currentRoute === 'signals') {
      return <Signals navigate={setCurrentRoute} />;
    }
    if (currentRoute === 'paper-trading') {
      return <PaperTrading />;
    }
    if (currentRoute === 'live-trading') {
      return <LiveTrading onModeChange={handleModeChange} />;
    }
    if (currentRoute === 'agents') {
      return <Agents />;
    }
    if (currentRoute === 'command-center') {
      return <CommandCenter navigate={setCurrentRoute} />;
    }
    if (currentRoute === 'backtests') {
      return <Backtests />;
    }
    if (currentRoute === 'replay') {
      return <Replay />;
    }
    if (currentRoute === 'journal') {
      return <Journal />;
    }
    if (currentRoute === 'health') {
      return <Health />;
    }
    if (currentRoute === 'user-portal') {
      return <UserPortal currentUser={currentUser} onOpenAuth={() => setIsAuthModalOpen(true)} />;
    }
    if (currentRoute === 'risk-watch') {
      return <BinanceRiskWatch navigate={setCurrentRoute} />;
    }
    if (currentRoute === 'ema-crossover') {
      return <EmaCrossover navigate={setCurrentRoute} />;
    }
    if (currentRoute === 'alpha-sniper') {
      return <Scanner navigate={setCurrentRoute} />;
    }

    // Fallback if navigating to coin detail or other preserved page
    if (currentRoute.startsWith('coin/')) {
      return <CoinDetail symbol={currentRoute.replace('coin/', '')} navigate={setCurrentRoute} />;
    }

    return <Dashboard navigate={setCurrentRoute} />;
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full bg-[#070d10] flex flex-col items-center justify-center font-sans text-gray-400">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#38bdf8] via-[#6366f1] to-[#a855f7] p-0.5 shadow-[0_0_25px_rgba(56,189,248,0.3)] animate-pulse flex items-center justify-center mb-4">
          <div className="w-full h-full bg-[#0a141d] rounded-[14px] flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <p className="text-xs font-mono tracking-wider text-emerald-400">Validating Trading with Dawood Session...</p>
      </div>
    );
  }

  // Full-screen gate: Website cannot be accessed until logged in!
  if (!currentUser) {
    return (
      <ScalpProLogin
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setSessionKickMessage(null);
        }}
        sessionKickMessage={sessionKickMessage}
      />
    );
  }

  return (
    <div>
      <TopNav
        currentRoute={currentRoute}
        navigate={setCurrentRoute}
        isEmergencyHalted={isEmergencyHalted}
        tradingMode={tradingMode}
        onModeChange={handleModeChange}
        onKillSwitchChange={setIsEmergencyHalted}
        unreadNotifications={unreadNotifications}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main>
        {renderContent()}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setCurrentRoute('user-portal');
        }}
      />

      <EnterpriseDrawer
        currentRoute={currentRoute}
        navigate={setCurrentRoute}
      />
    </div>
  );
};
