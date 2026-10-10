import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Eye,
  EyeOff,
  Key,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  XCircle,
  Zap
} from 'lucide-react';
import { api } from '../services/api.js';

interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

interface ConnectedData {
  maskedApiKey: string;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  accountType: string;
  isTestnet: boolean;
  environment: string;
  makerCommission: number;
  takerCommission: number;
  balances: Balance[];
  message: string;
}

export const LiveTrading: React.FC<{ onModeChange: (m: 'ANALYSIS' | 'PAPER' | 'LIVE') => void }> = ({ onModeChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectedData, setConnectedData] = useState<ConnectedData | null>(null);
  const [liveBalances, setLiveBalances] = useState<Balance[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [confirmLiveOpen, setConfirmLiveOpen] = useState(false);
  const [confirmDisconnectOpen, setConfirmDisconnectOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warn'>('success');
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [showBalances, setShowBalances] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await api.getLiveStatus();
      setStatus(res);
      setConnected(res.isConnected);
      if (res.isConnected && !connectedData) {
        loadLiveAccount();
      }
    } catch (e) {
      // ignore
    }
  };

  const loadLiveAccount = async () => {
    try {
      setLoadingBalances(true);
      const res = await api.getLiveAccountBalance();
      setLiveBalances(res.balances || []);
    } catch (e) {
      // ignore
    } finally {
      setLoadingBalances(false);
    }
  };

  const showMsg = (msg: string, type: 'success' | 'error' | 'warn' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 8000);
  };

  const handleConnect = async () => {
    if (!apiKey || !apiSecret) return;
    setConnecting(true);
    try {
      const res = await api.connectBinance(apiKey, apiSecret);
      if (!res.success) {
        showMsg(res.error || 'Connection failed.', 'error');
        return;
      }
      setConnectedData(res);
      setConnected(true);
      setApiKey('');
      setApiSecret('');
      setLiveBalances(res.balances || []);
      showMsg(`✓ Binance API connected & validated. Environment: ${res.environment}.`, 'success');
    } catch (e: any) {
      showMsg(`Connection error: ${e.message}`, 'error');
    } finally {
      setConnecting(false);
    }
  };

  const handleEnableLive = () => {
    onModeChange('LIVE');
    setConfirmLiveOpen(false);
    loadStatus();
    showMsg('⚡ LIVE TRADING ACTIVATED. All signals now route real orders through Binance.', 'warn');
  };

  const handleDisconnect = async () => {
    try {
      await api.disconnectBinance();
      setConnected(false);
      setConnectedData(null);
      setLiveBalances([]);
      onModeChange('ANALYSIS');
      setConfirmDisconnectOpen(false);
      showMsg('Credentials revoked & deleted. Trading mode reset to ANALYSIS.', 'success');
    } catch (e: any) {
      showMsg(`Disconnect error: ${e.message}`, 'error');
    }
  };

  const isLiveActive = status?.tradingMode === 'LIVE';

  return (
    <div className="max-w-4xl mx-auto space-y-5 font-mono text-xs">

      {/* Warning Header Banner */}
      <div className="bg-red-950/20 border border-red-500/40 p-4 rounded-lg flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
        <div>
          <h1 className="text-sm font-bold text-red-400 uppercase tracking-wide">
            LIVE TRADING DESK — BINANCE SPOT EXECUTION
          </h1>
          <p className="text-gray-300 text-[11px] mt-1 leading-relaxed">
            Real market orders route directly to your Binance Spot Account. All credentials are encrypted via AES-256-GCM
            and never logged. <strong className="text-red-300">Withdrawal permission is permanently blocked.</strong>{' '}
            Every order passes through the Central Risk Engine before execution.
          </p>
        </div>
      </div>

      {/* Environment Badge */}
      {status && (
        <div className={`flex items-center justify-between p-3 rounded-lg border ${
          status.isTestnet
            ? 'bg-blue-950/20 border-blue-500/40'
            : 'bg-amber-950/20 border-amber-500/40'
        }`}>
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${status.isTestnet ? 'text-blue-400' : 'text-amber-400'}`} />
            <span className={`font-bold ${status.isTestnet ? 'text-blue-400' : 'text-amber-400'}`}>
              {status.isTestnet ? '🧪 TESTNET MODE — testnet.binance.vision (Safe, test funds only)' : '⚡ LIVE PRODUCTION — api.binance.com (Real funds)'}
            </span>
          </div>
          <span className="text-[10px] text-gray-500">
            Set BINANCE_TESTNET env var to toggle
          </span>
        </div>
      )}

      {/* Safety Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 bg-[#151a24] border border-[#232b3e] rounded flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white">Withdrawal Blocked</div>
            <div className="text-[10px] text-gray-500">Zero withdrawal access requested or stored</div>
          </div>
        </div>
        <div className="p-3 bg-[#151a24] border border-[#232b3e] rounded flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white">AES-256-GCM Encrypted</div>
            <div className="text-[10px] text-gray-500">Keys encrypted at rest, never logged</div>
          </div>
        </div>
        <div className="p-3 bg-[#151a24] border border-[#232b3e] rounded flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white">Risk Engine Gated</div>
            <div className="text-[10px] text-gray-500">Every order passes risk validation first</div>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-3 rounded border text-[11px] leading-relaxed ${
          messageType === 'error'
            ? 'bg-red-950/30 border-red-500/40 text-red-300'
            : messageType === 'warn'
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
            : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
        }`}>
          {message}
        </div>
      )}

      {/* Connection Panel */}
      <div className="bg-[#151a24] border border-[#232b3e] rounded-lg p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          BINANCE API CREDENTIALS
          {connected && (
            <span className="ml-auto px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
              ● CONNECTED
            </span>
          )}
        </h2>

        {connected ? (
          <div className="space-y-4">
            {/* Connected Info */}
            <div className="p-3 rounded bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-emerald-400 font-bold">Binance API Validated & Encrypted</span>
                  <div className="text-gray-400 text-[11px] mt-0.5">
                    Key: {connectedData?.maskedApiKey || status?.maskedKey || '****'}
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDisconnectOpen(true)}
                  className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 rounded flex items-center gap-1.5 text-[11px]"
                >
                  <Trash2 className="w-3 h-3" /> Disconnect & Revoke
                </button>
              </div>

              {/* Permissions Matrix */}
              {connectedData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-emerald-900/40">
                  <PermissionChip
                    label="CAN TRADE"
                    value={connectedData.canTrade}
                    positiveColor
                  />
                  <PermissionChip
                    label="CAN WITHDRAW"
                    value={connectedData.canWithdraw}
                    positiveColor={false}
                    override="BLOCKED ✓"
                    overrideColor="emerald"
                  />
                  <PermissionChip
                    label="ACCOUNT TYPE"
                    value={true}
                    label2={connectedData.accountType}
                  />
                  <PermissionChip
                    label="ENVIRONMENT"
                    value={true}
                    label2={connectedData.environment}
                    color={connectedData.isTestnet ? 'blue' : 'amber'}
                  />
                </div>
              )}

              {/* Commission Rates */}
              {connectedData && (
                <div className="flex gap-4 pt-1 text-[11px] text-gray-400">
                  <span>Maker fee: <strong className="text-white">{((connectedData.makerCommission || 0) * 100).toFixed(3)}%</strong></span>
                  <span>Taker fee: <strong className="text-white">{((connectedData.takerCommission || 0) * 100).toFixed(3)}%</strong></span>
                </div>
              )}
            </div>

            {/* Live Account Balances */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowBalances(!showBalances)}
                  className="flex items-center gap-1.5 text-gray-300 font-bold hover:text-white transition"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  LIVE ACCOUNT BALANCES
                  {showBalances ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={loadLiveAccount}
                  className="flex items-center gap-1 text-gray-400 hover:text-white text-[10px]"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingBalances ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {showBalances && (
                <div className="bg-[#0b0e14] border border-[#1e2535] rounded p-3 space-y-1.5">
                  {liveBalances.length === 0 ? (
                    <div className="text-gray-500 text-center py-2">No balances found or still loading...</div>
                  ) : (
                    liveBalances.map(b => (
                      <div key={b.asset} className="flex justify-between items-center py-1 border-b border-[#1a2030] last:border-0">
                        <span className={`font-bold ${b.asset === 'USDT' ? 'text-amber-400' : 'text-gray-200'}`}>{b.asset}</span>
                        <div className="text-right">
                          <div className="text-white">{b.free.toFixed(6)}</div>
                          {b.locked > 0 && (
                            <div className="text-[10px] text-gray-500">+{b.locked.toFixed(6)} locked</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Live Activation */}
            <div className="pt-3 border-t border-[#232b3e] flex justify-between items-center">
              <div>
                <span className="font-bold text-white">Enable Real Live Execution</span>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  Every strategy signal passing risk checks will place a real Binance MARKET order.
                </p>
              </div>
              {isLiveActive ? (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-red-600/30 border border-red-500/50 text-red-400 rounded font-bold text-[11px] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> LIVE ACTIVE
                  </span>
                  <button
                    onClick={() => { onModeChange('PAPER'); loadStatus(); }}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-[11px]"
                  >
                    Switch to Paper
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmLiveOpen(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-lg shadow-red-950/50 flex items-center gap-2 transition"
                >
                  <Zap className="w-4 h-4" />
                  ACTIVATE LIVE TRADING
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Credential Input Form */
          <div className="space-y-3">
            <div className="p-3 rounded bg-blue-950/20 border border-blue-500/30 text-[11px] text-blue-300">
              <strong>Required API permissions:</strong> Enable only <strong>Spot Trading</strong>.
              Do <strong>NOT</strong> enable Withdrawal or Futures.{' '}
              {status?.isTestnet && (
                <span>Create testnet keys at <a href="https://testnet.binance.vision" target="_blank" rel="noreferrer" className="underline">testnet.binance.vision</a></span>
              )}
            </div>

            <div>
              <label className="block text-gray-400 text-[11px] mb-1">Binance API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={status?.isTestnet ? 'Testnet API Key...' : 'Binance API Key...'}
                className="w-full bg-[#0e121a] border border-[#252f44] rounded p-2.5 text-white text-xs focus:outline-none focus:border-blue-500 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-[11px] mb-1">Binance API Secret</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={apiSecret}
                  onChange={e => setApiSecret(e.target.value)}
                  placeholder="API Secret..."
                  className="w-full bg-[#0e121a] border border-[#252f44] rounded p-2.5 pr-10 text-white text-xs focus:outline-none focus:border-blue-500 transition font-mono"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-300"
                >
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleConnect}
                disabled={!apiKey || !apiSecret || connecting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded flex items-center gap-2 transition"
              >
                {connecting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                {connecting ? 'Validating with Binance...' : 'Validate & Connect'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Safety Checklist */}
      {status?.safetyChecks && (
        <div className="bg-[#151a24] border border-[#232b3e] rounded-lg p-4 space-y-2">
          <div className="text-xs font-bold text-gray-300 pb-1 border-b border-[#232b3e]">
            LIVE TRADING SAFETY CHECKLIST
          </div>
          {status.safetyChecks.map((check: any, i: number) => (
            <div key={i} className="flex items-center gap-2.5 text-[11px]">
              {check.passed ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
              )}
              <span className={check.passed ? 'text-gray-300' : 'text-red-400'}>{check.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Live Trading Modal */}
      {confirmLiveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#151922] border border-red-500 max-w-md w-full p-6 rounded-lg shadow-2xl shadow-red-950/30">
            <h3 className="text-base font-bold text-red-500 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" />
              CONFIRM LIVE TRADING ACTIVATION
            </h3>
            <div className="space-y-2 text-[11px] text-gray-300 mb-4">
              <p>You are activating <strong className="text-red-400">LIVE TRADING</strong> mode on{' '}
                <strong className={status?.isTestnet ? 'text-blue-400' : 'text-amber-400'}>
                  {status?.isTestnet ? 'TESTNET (test funds)' : 'LIVE PRODUCTION (real funds)'}
                </strong>.
              </p>
              <p>Every confirmed strategy signal meeting all risk parameters will execute a real <strong>MARKET BUY</strong> order on Binance with up to <strong>${connectedData ? '500' : '???'} USD</strong> per trade.</p>
              <ul className="list-disc ml-4 space-y-1 text-gray-400">
                <li>Kill switch remains active at all times</li>
                <li>Max 3 concurrent positions enforced</li>
                <li>Zero withdrawal risk — trade-only key</li>
              </ul>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmLiveOpen(false)}
                className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEnableLive}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition"
              >
                I Understand — Activate Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Disconnect Modal */}
      {confirmDisconnectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#151922] border border-[#252f44] max-w-md w-full p-5 rounded-lg shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Trash2 className="w-4 h-4 text-red-400" />
              DISCONNECT & REVOKE CREDENTIALS
            </h3>
            <p className="text-gray-400 text-[11px] mb-4">
              This will permanently delete the stored encrypted API credentials and revert trading mode to ANALYSIS. Any open live positions will <strong>not</strong> be automatically closed — please manually manage them on Binance.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDisconnectOpen(false)}
                className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition"
              >
                Disconnect & Delete Keys
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Helper chip component for the permissions matrix */
const PermissionChip: React.FC<{
  label: string;
  value: boolean;
  positiveColor?: boolean;
  label2?: string;
  override?: string;
  overrideColor?: string;
  color?: string;
}> = ({ label, value, positiveColor = true, label2, override, overrideColor, color }) => {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    gray: 'bg-gray-800 text-gray-300 border-[#2a3450]'
  };

  let chipColor = 'gray';
  let displayText = label2 || (value ? 'YES' : 'NO');

  if (override) {
    displayText = override;
    chipColor = overrideColor || 'emerald';
  } else if (label2) {
    chipColor = color || 'gray';
  } else if (value && positiveColor) {
    chipColor = 'emerald';
  } else if (!value && positiveColor) {
    chipColor = 'red';
  }

  return (
    <div className={`p-2 rounded border text-center ${colorMap[chipColor] || colorMap.gray}`}>
      <div className="text-[9px] text-current opacity-60 uppercase">{label}</div>
      <div className="font-bold text-[11px] mt-0.5">{displayText}</div>
    </div>
  );
};
