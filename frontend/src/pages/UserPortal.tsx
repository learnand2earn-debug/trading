import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Eye,
  EyeOff,
  HelpCircle,
  Key,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  Zap
} from 'lucide-react';
import { api, UserMeResponse, UserProfile } from '../services/api.js';

interface Balance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export const UserPortal: React.FC<{
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}> = ({ currentUser, onOpenAuth }) => {
  const [meData, setMeData] = useState<UserMeResponse | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warn'>('success');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const data = await api.getMe();
      setMeData(data);
      if (data.binance.isConnected) {
        loadBalances();
      }
    } catch (e) {
      // ignore
    }
  };

  const loadBalances = async () => {
    setLoadingBalances(true);
    try {
      const res = await api.getLiveAccountBalance();
      if (res.balances) {
        setBalances(res.balances);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoadingBalances(false);
    }
  };

  const showMsg = (msg: string, type: 'success' | 'error' | 'warn' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 7000);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !apiSecret) {
      showMsg('Both API Key and Secret are required.', 'error');
      return;
    }

    setConnecting(true);
    try {
      const res = await api.connectBinance(apiKey, apiSecret);
      if (res.success) {
        showMsg(`Binance successfully connected! (${res.environment})`, 'success');
        setApiKey('');
        setApiSecret('');
        await loadUserData();
      } else {
        showMsg(res.error || 'Connection failed. Please check your Binance API key.', 'error');
      }
    } catch (err: any) {
      showMsg(err.message || 'Failed to communicate with trading engine', 'error');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect and delete your Binance API credentials?')) {
      return;
    }

    setDisconnecting(true);
    try {
      const res = await api.disconnectBinance();
      if (res.success) {
        showMsg('Binance credentials revoked and deleted safely.', 'warn');
        setBalances([]);
        await loadUserData();
      } else {
        showMsg(res.error || 'Failed to disconnect', 'error');
      }
    } catch (err: any) {
      showMsg(err.message, 'error');
    } finally {
      setDisconnecting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-[#121722] border border-[#232b3e] rounded-xl p-8 text-center max-w-lg mx-auto font-mono my-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Client Portal Access</h2>
        <p className="text-xs text-gray-400">
          Please log in to your account to manage your self-serve Binance API connection and portfolio.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs transition"
        >
          Sign In to Your Portal
        </button>
      </div>
    );
  }

  const isConnected = meData?.binance?.isConnected ?? false;
  const isTestnet = meData?.binance?.isTestnet ?? true;

  return (
    <div className="space-y-6 font-mono text-xs max-w-6xl mx-auto">
      {/* Top Banner: User Identity */}
      <div className="bg-gradient-to-r from-[#141b27] via-[#10141d] to-[#141b27] border border-[#232b3e] rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-base shadow-inner">
            {currentUser.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-wide">
                CLIENT PORTAL: <span className="text-blue-400">{currentUser.username}</span>
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                currentUser.role === 'ADMIN'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {currentUser.role}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Email: <span className="text-gray-200">{currentUser.email}</span> • Self-Serve Binance API Bridge
            </p>
          </div>
        </div>

        {/* Connection Status Badge */}
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold ${
            isConnected
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isConnected ? 'BINANCE CONNECTED' : 'BINANCE NOT ATTACHED'}</span>
          </div>
        </div>
      </div>

      {/* Alert Notification Toast */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs transition animate-in fade-in duration-200 ${
          messageType === 'success'
            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
            : messageType === 'warn'
            ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
            : 'bg-red-950/60 border-red-500/50 text-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {messageType === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {messageType === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            {messageType === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-gray-400 hover:text-white ml-2 text-sm font-bold">×</button>
        </div>
      )}

      {/* Main Grid: Self-Serve Connector + Balances / Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Connector Card (7 cols) */}
        <div className="lg:col-span-7 bg-[#121722] border border-[#232b3e] rounded-xl p-5 space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-[#232b3e]">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Attach Your Binance Account</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showGuide ? 'Hide Guide' : 'How to get Binance API Key?'}
            </button>
          </div>

          {/* Guide Dropdown */}
          {showGuide && (
            <div className="bg-[#0b0f16] border border-blue-500/30 rounded-lg p-4 space-y-2 text-[11px] text-gray-300">
              <div className="font-bold text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Safe 3-Step Setup on Binance:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>Log in to Binance.com → Profile Icon → <strong>API Management</strong>.</li>
                <li>Click <strong>Create API</strong> (System generated). Give it a label (e.g. "ApexPortal").</li>
                <li>In permissions, enable <strong className="text-emerald-400">Enable Spot & Margin Trading</strong>.</li>
                <li><strong className="text-red-400">DO NOT</strong> enable "Enable Withdrawals" (Withdrawals are strictly blocked by our platform).</li>
                <li>Copy the <strong>API Key</strong> and <strong>Secret Key</strong> and paste them below.</li>
              </ol>
            </div>
          )}

          {/* Connected State View */}
          {isConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#0c1017] border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your Binance Key is Active & Encrypted</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                    AES-256-GCM
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-[#121722] p-2 rounded border border-[#232b3e]">
                    <div className="text-gray-500 text-[10px]">Masked API Key</div>
                    <div className="font-mono text-white mt-0.5">{meData?.binance?.maskedApiKey || '****'}</div>
                  </div>
                  <div className="bg-[#121722] p-2 rounded border border-[#232b3e]">
                    <div className="text-gray-500 text-[10px]">Environment</div>
                    <div className="font-mono text-white mt-0.5">
                      {isTestnet ? 'BINANCE TESTNET' : 'BINANCE PRODUCTION'}
                    </div>
                  </div>
                </div>

                {meData?.binance?.lastValidatedAt && (
                  <div className="text-[10px] text-gray-500">
                    Last validated: {new Date(meData.binance.lastValidatedAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={loadBalances}
                  disabled={loadingBalances}
                  className="flex-1 py-2.5 rounded-lg bg-[#182030] hover:bg-[#202b40] text-gray-200 border border-[#2c3852] font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loadingBalances ? 'animate-spin' : ''}`} />
                  Refresh Balances
                </button>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="px-4 py-2.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/40 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Disconnect Key
                </button>
              </div>
            </div>
          ) : (
            /* Disconnected / New Connection Form */
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-gray-300 text-[11px] font-semibold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  Binance API Key
                </label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value.trim())}
                  placeholder="Paste your 64-character Binance API Key"
                  className="w-full bg-[#0b0f16] border border-[#252f44] focus:border-blue-500 rounded-lg px-3 py-2 text-white font-mono text-xs placeholder-gray-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-gray-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Binance API Secret
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-gray-400 hover:text-gray-200 flex items-center gap-1 text-[10px]"
                  >
                    {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showSecret ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showSecret ? 'text' : 'password'}
                  required
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value.trim())}
                  placeholder="Paste your Binance Secret Key"
                  className="w-full bg-[#0b0f16] border border-[#252f44] focus:border-emerald-500 rounded-lg px-3 py-2 text-white font-mono text-xs placeholder-gray-600 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-[#0d121c] border border-[#1e273b] rounded-lg text-[11px] text-gray-400 space-y-1">
                <div className="flex items-center gap-1 text-gray-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Safety Verification:
                </div>
                <div>• Credentials are validated against Binance live before storing.</div>
                <div>• Zero withdrawal permission is enforced. Any withdrawal-enabled key is rejected.</div>
                <div>• Your secret key is stored with military-grade AES-256-GCM encryption.</div>
              </div>

              <button
                type="submit"
                disabled={connecting}
                className={`w-full py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                  connecting
                    ? 'bg-blue-800 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950'
                }`}
              >
                {connecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validating & Encrypting...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Connect & Activate Binance Account</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Live Portfolio Balances & Safety Checks (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real-time Balances Card */}
          <div className="bg-[#121722] border border-[#232b3e] rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#232b3e]">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Your Binance Balances</h2>
              </div>
              {isConnected && (
                <button
                  onClick={loadBalances}
                  disabled={loadingBalances}
                  className="p-1 rounded text-gray-400 hover:text-white"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingBalances ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {!isConnected ? (
              <div className="text-center py-8 text-gray-500 space-y-2">
                <Lock className="w-8 h-8 mx-auto text-gray-600" />
                <div>Attach your Binance key to view your live account balances and portfolio equity.</div>
              </div>
            ) : balances.length === 0 ? (
              <div className="text-center py-8 text-gray-500 space-y-1">
                {loadingBalances ? (
                  <div className="flex items-center justify-center gap-2 text-blue-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Fetching live balances...</span>
                  </div>
                ) : (
                  <div>No significant crypto or USDT balances detected on this account.</div>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {balances.map((b) => (
                  <div
                    key={b.asset}
                    className="p-2.5 rounded-lg bg-[#0d121c] border border-[#1e273b] flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-white font-mono">{b.asset}</div>
                      <div className="text-[10px] text-gray-500">Free: {b.free.toFixed(4)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400 font-mono">{b.total.toFixed(4)}</div>
                      <div className="text-[10px] text-gray-500">Locked: {b.locked.toFixed(4)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Safety Features */}
          <div className="bg-[#121722] border border-[#232b3e] rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              PORTAL SECURITY & PERMISSIONS
            </h3>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded bg-[#0d121c] border border-[#1e273b]">
                <span className="text-gray-300">Zero Withdrawal Enforced</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#0d121c] border border-[#1e273b]">
                <span className="text-gray-300">AES-256-GCM Encrypted at Rest</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#0d121c] border border-[#1e273b]">
                <span className="text-gray-300">Client Account Isolation</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Isolated
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
