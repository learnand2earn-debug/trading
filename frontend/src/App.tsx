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
import { api, getAuthToken, UserProfile, wsManager } from './services/api.js';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState('v1');
  const [tradingMode, setTradingMode] = useState<'ANALYSIS' | 'PAPER' | 'LIVE'>('ANALYSIS');
  const [isEmergencyHalted, setIsEmergencyHalted] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

    // Restore authenticated session if token present
    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then(data => {
          if (data && data.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {
          api.logout();
        });
    }

    // Initial fetch of risk & settings
    api.getRiskSettings().then(res => {
      setIsEmergencyHalted(res.isEmergencyHalted);
      setTradingMode(res.mode || 'ANALYSIS');
    }).catch(() => {});

    return () => unsub();
  }, []);

  const handleModeChange = async (mode: 'ANALYSIS' | 'PAPER' | 'LIVE') => {
    setTradingMode(mode);
    await api.setTradingMode(mode);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const renderContent = () => {
    if (currentRoute === 'v1' || currentRoute === 'dashboard') {
      return <V1Scalping navigate={setCurrentRoute} />;
    }
    if (currentRoute === 'hiddenBullish') {
      return <HiddenBullish navigate={setCurrentRoute} />;
    }
    if (currentRoute === 'orderBlock') {
      return <OrderBlock navigate={setCurrentRoute} />;
    }

    // Fallback if navigating to coin detail or other preserved page
    if (currentRoute.startsWith('coin/')) {
      return <CoinDetail symbol={currentRoute.replace('coin/', '')} navigate={setCurrentRoute} />;
    }

    return <V1Scalping navigate={setCurrentRoute} />;
  };

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
    </div>
  );
};
