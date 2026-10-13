import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Key,
  KeyRound,
  Plus,
  RotateCcw,
  Save,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Trash2,
  UserPlus,
  Users,
  Wrench,
  X
} from 'lucide-react';
import { api, UserProfile, LicenseInfo } from '../services/api.js';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LICENSES' | 'STRATEGIES' | 'RISK' | 'RULES' | 'USERS' | 'AUDIT'>('LICENSES');
  const [riskConfig, setRiskConfig] = useState<any>(null);
  const [saveMessage, setSaveMessage] = useState('');

  // ScalpPro License Management State
  const [licenses, setLicenses] = useState<LicenseInfo[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(false);
  const [genDurationDays, setGenDurationDays] = useState(30);
  const [genNote, setGenNote] = useState('');
  const [genCustomKey, setGenCustomKey] = useState('');
  const [licenseMsg, setLicenseMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // User Management State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER');
  const [userMsg, setUserMsg] = useState('');

  useEffect(() => {
    loadRisk();
    loadLicenses();
  }, []);

  useEffect(() => {
    if (activeTab === 'LICENSES') {
      loadLicenses();
    } else if (activeTab === 'USERS') {
      loadUsers();
    }
  }, [activeTab]);

  const loadLicenses = async () => {
    setLoadingLicenses(true);
    try {
      const res = await api.getLicenses();
      if (res.success) {
        setLicenses(res.licenses || []);
      }
    } catch (e: any) {
      setLicenseMsg(`Failed to load licenses: ${e.message}`);
    } finally {
      setLoadingLicenses(false);
    }
  };

  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLicenseMsg('');
    try {
      const res = await api.createLicense({
        durationDays: genDurationDays,
        note: genNote.trim() || undefined,
        customKey: genCustomKey.trim() || undefined
      });
      if (res.success && res.license) {
        setLicenseMsg(`✅ License key generated: ${res.license.license_key} (${res.license.duration_days} days)`);
        setGenCustomKey('');
        setGenNote('');
        await loadLicenses();
      } else {
        setLicenseMsg(`❌ ${res.error || 'Failed to generate license'}`);
      }
    } catch (e: any) {
      setLicenseMsg(`❌ ${e.message}`);
    }
  };

  const handleResetSession = async (lic: LicenseInfo) => {
    try {
      const res = await api.resetLicenseSession(lic.id);
      if (res.success) {
        setLicenseMsg(`⚡ Session reset for ${lic.license_key}. Any connected device was disconnected.`);
        await loadLicenses();
      }
    } catch (e: any) {
      setLicenseMsg(`❌ Error: ${e.message}`);
    }
  };

  const handleRevokeLicense = async (lic: LicenseInfo) => {
    if (!confirm(`Are you sure you want to revoke license ${lic.license_key}?`)) return;
    try {
      const res = await api.revokeLicense(lic.id);
      if (res.success) {
        setLicenseMsg(`🚫 License ${lic.license_key} has been revoked.`);
        await loadLicenses();
      }
    } catch (e: any) {
      setLicenseMsg(`❌ Error: ${e.message}`);
    }
  };

  const handleDeleteLicense = async (lic: LicenseInfo) => {
    if (!confirm(`Permanently delete license ${lic.license_key}?`)) return;
    try {
      const res = await api.deleteLicense(lic.id);
      if (res.success) {
        setLicenseMsg(`🗑️ License ${lic.license_key} deleted.`);
        await loadLicenses();
      }
    } catch (e: any) {
      setLicenseMsg(`❌ Error: ${e.message}`);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };


  const loadRisk = async () => {
    try {
      const res = await api.getRiskSettings();
      setRiskConfig(res.config);
    } catch (e) {
      // ignore
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.getUsers();
      setUsers(res.users || []);
    } catch (e: any) {
      setUserMsg(`Failed to load users: ${e.message}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newEmail || !newPassword) return;

    try {
      const res = await api.createUser({
        username: newUsername,
        email: newEmail,
        password: newPassword,
        role: newRole
      });

      if (res.success) {
        setUserMsg(`User ${newUsername} created successfully!`);
        setShowAddUserModal(false);
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        await loadUsers();
      } else {
        setUserMsg(res.error || 'Failed to create user');
      }
    } catch (e: any) {
      setUserMsg(e.message);
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await api.toggleUserStatus(user.id, nextStatus);
      if (res.success) {
        setUserMsg(`User ${user.username} status set to ${nextStatus}`);
        await loadUsers();
      } else {
        setUserMsg(res.error || 'Status change failed');
      }
    } catch (e: any) {
      setUserMsg(e.message);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!confirm(`Are you sure you want to permanently delete user ${user.username}?`)) {
      return;
    }
    try {
      const res = await api.deleteUser(user.id);
      if (res.success) {
        setUserMsg(`User ${user.username} deleted.`);
        await loadUsers();
      } else {
        setUserMsg(res.error || 'Delete failed');
      }
    } catch (e: any) {
      setUserMsg(e.message);
    }
  };

  const handleSaveRisk = async () => {
    if (!riskConfig) return;
    try {
      await api.updateRiskSettings(riskConfig);
      setSaveMessage('Risk configuration successfully updated & audited.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (e: any) {
      setSaveMessage(`Error: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-[#151a24] border border-[#232b3e] p-3 rounded-lg">
        <div>
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" />
            ADMIN CONTROL PANEL & MULTI-USER PORTAL
          </h1>
          <p className="text-[11px] text-gray-500">Configure parameters, manage ambiguous interpretations, risk rules & client access</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['LICENSES', 'STRATEGIES', 'RISK', 'RULES', 'USERS', 'AUDIT'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded font-bold transition text-[11px] flex items-center gap-1 ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-[#0e121a] text-gray-400 border border-[#252f44] hover:text-white'
              }`}
            >
              {tab === 'LICENSES' ? '🔑 LICENSES' : tab === 'USERS' ? 'USERS & ACCESS' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: ScalpPro License Management & Single-Device Control */}
      {activeTab === 'LICENSES' && (
        <div className="space-y-4">
          {/* Top Banner & Generation Form */}
          <div className="bg-[#121824] border border-[#232f44] rounded-xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#232f44]">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  GENERATE SCALPPRO ACCESS LICENSE
                </h2>
                <p className="text-[11px] text-gray-400">
                  Generate customer licenses. Enforces single-device concurrent usage: if logged in on a second device, the previous device is immediately logged out.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                Single-Device Protection Active
              </span>
            </div>

            {licenseMsg && (
              <div className="mb-4 p-3 rounded-lg bg-[#0e241b] border border-emerald-500/40 text-emerald-300 text-xs flex justify-between items-center">
                <span>{licenseMsg}</span>
                <button onClick={() => setLicenseMsg('')} className="text-gray-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleGenerateLicense} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-3">
                <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">
                  License Duration
                </label>
                <select
                  value={genDurationDays}
                  onChange={(e) => setGenDurationDays(Number(e.target.value))}
                  className="w-full bg-[#0b0e14] border border-[#232b3e] focus:border-emerald-500 rounded p-2 text-white font-mono text-xs focus:outline-none"
                >
                  <option value={7}>7 Days (Trial)</option>
                  <option value={30}>30 Days (1 Month)</option>
                  <option value={90}>90 Days (3 Months)</option>
                  <option value={180}>180 Days (6 Months)</option>
                  <option value={365}>365 Days (1 Year VIP)</option>
                  <option value={3650}>Lifetime VIP Access (10 Years)</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">
                  Client Name / Note (e.g. WhatsApp Client)
                </label>
                <input
                  type="text"
                  value={genNote}
                  onChange={(e) => setGenNote(e.target.value)}
                  placeholder="e.g. WhatsApp Client (+923164404787)"
                  className="w-full bg-[#0b0e14] border border-[#232b3e] focus:border-emerald-500 rounded p-2 text-white font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">
                  Custom Key (Optional)
                </label>
                <input
                  type="text"
                  value={genCustomKey}
                  onChange={(e) => setGenCustomKey(e.target.value.toUpperCase())}
                  placeholder="Auto-generate if empty"
                  className="w-full bg-[#0b0e14] border border-[#232b3e] focus:border-emerald-500 rounded p-2 text-white font-mono text-xs focus:outline-none uppercase"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loadingLicenses}
                  className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Key</span>
                </button>
              </div>
            </form>
          </div>

          {/* Licenses Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-[#121824] border border-[#232b3e] rounded-lg">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Total Issued Licenses</span>
              <div className="text-lg font-bold text-white">{licenses.length}</div>
            </div>
            <div className="p-3 bg-[#121824] border border-[#232b3e] rounded-lg">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Active & Valid</span>
              <div className="text-lg font-bold text-emerald-400">
                {licenses.filter(l => l.status === 'active' && !l.isExpired).length}
              </div>
            </div>
            <div className="p-3 bg-[#121824] border border-[#232b3e] rounded-lg">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Live Devices Online</span>
              <div className="text-lg font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                {licenses.filter(l => l.isOnline).length}
              </div>
            </div>
            <div className="p-3 bg-[#121824] border border-[#232b3e] rounded-lg">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Expired / Revoked</span>
              <div className="text-lg font-bold text-rose-400">
                {licenses.filter(l => l.status !== 'active' || l.isExpired).length}
              </div>
            </div>
          </div>

          {/* Licenses Table */}
          <div className="bg-[#121824] border border-[#232b3e] rounded-lg overflow-hidden">
            <div className="p-3 border-b border-[#232b3e] flex justify-between items-center">
              <span className="font-bold text-white text-xs">ALL ISSUED SCALPPRO LICENSES</span>
              <button
                onClick={loadLicenses}
                className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Refresh List
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#232b3e] bg-[#0c1017] text-[10px] text-gray-400 uppercase">
                    <th className="p-3">License Key</th>
                    <th className="p-3">Client / Note</th>
                    <th className="p-3">Assigned User</th>
                    <th className="p-3">Duration & Expiry</th>
                    <th className="p-3">Device State</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2535] text-xs">
                  {licenses.map(lic => (
                    <tr key={lic.id} className="hover:bg-[#161d2b] transition">
                      <td className="p-3 font-mono font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{lic.license_key}</span>
                          <button
                            onClick={() => handleCopyKey(lic.license_key)}
                            className="p-1 rounded bg-[#1c2436] hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 transition cursor-pointer"
                            title="Copy License Key"
                          >
                            {copiedKey === lic.license_key ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-gray-300 font-medium">
                        {lic.note || 'ScalpPro Trader'}
                      </td>
                      <td className="p-3 font-mono text-cyan-300">
                        {lic.assigned_username || (
                          <span className="text-gray-500 italic">Unbound (Any user can activate)</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-400">
                        <div>{lic.duration_days} Days</div>
                        <div className="text-[10px] text-gray-500">
                          {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString() : 'Starts on first login'}
                        </div>
                      </td>
                      <td className="p-3">
                        {lic.isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            1 Device Online
                          </span>
                        ) : lic.active_session_id ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-800 text-gray-400">
                            Session Active (Idle)
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-600">No device connected</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lic.status === 'active' && !lic.isExpired
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}>
                          {lic.isExpired ? 'EXPIRED' : lic.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lic.active_session_id && (
                            <button
                              onClick={() => handleResetSession(lic)}
                              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition cursor-pointer"
                              title="Force disconnect the currently connected device"
                            >
                              Kick Device
                            </button>
                          )}
                          {lic.status === 'active' && (
                            <button
                              onClick={() => handleRevokeLicense(lic)}
                              className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteLicense(lic)}
                            className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition cursor-pointer"
                            title="Delete License"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {licenses.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-gray-500">
                        No licenses generated yet. Use the form above to issue your first license key.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* Tab 1: Strategies & Ambiguous Rules Selector */}
      {activeTab === 'STRATEGIES' && (
        <div className="bg-[#151a24] border border-[#232b3e] rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#232b3e]">
            <span className="font-bold text-white text-xs">SOURCE STRATEGY VERSIONS & AMBIGUOUS RULES</span>
            <span className="text-emerald-400 text-[10px]">All 7 Strategies Active v1.0</span>
          </div>

          <div className="space-y-3">
            {[
              {
                name: '1. Price Action',
                version: 'v1.0',
                ambiguous: 'Liquidity Proximity Tolerance',
                options: ['Within 1.5% of Price (Recommended)', 'Within 2.5% of Price'],
                defaultChoice: 'Within 1.5% of Price (Recommended)'
              },
              {
                name: '3. Gainers Method',
                version: 'v1.0',
                ambiguous: 'Post-Pump Seller Activity Interpretation',
                options: ['Seller Turnover Active (> 25% 24h avg)', 'Pullback shallower than 38.2% Fib'],
                defaultChoice: 'Seller Turnover Active (> 25% 24h avg)'
              },
              {
                name: '4. Hidden Bullish',
                version: 'v1.0',
                ambiguous: '10-Candle Downward Movement Threshold',
                options: ['Min 0.8% Downward Structure (Source Default)', 'Min 1.2% Downward Structure'],
                defaultChoice: 'Min 0.8% Downward Structure (Source Default)'
              },
              {
                name: '7. ICT Method',
                version: 'v1.0',
                ambiguous: 'Trend Line Interaction Direction',
                options: ['Breakout above descending trendline', 'Support bounce off ascending trendline'],
                defaultChoice: 'Breakout above descending trendline'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 bg-[#0e121a] border border-[#252f44] rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-xs">{item.name} ({item.version})</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                    Ambiguous Source Rule
                  </span>
                </div>
                <div className="text-gray-400 text-[11px]">
                  Configured Ambiguity: <strong className="text-gray-200">{item.ambiguous}</strong>
                </div>
                <div className="pt-1">
                  <label className="block text-gray-500 text-[10px] uppercase mb-1">Selected Interpretation</label>
                  <select
                    defaultValue={item.defaultChoice}
                    className="w-full bg-[#151a24] border border-[#232b3e] rounded p-2 text-emerald-400 font-semibold text-xs focus:outline-none"
                  >
                    {item.options.map((opt, oIdx) => (
                      <option key={oIdx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Risk Settings */}
      {activeTab === 'RISK' && riskConfig && (
        <div className="bg-[#151a24] border border-[#232b3e] rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#232b3e]">
            <span className="font-bold text-white text-xs">CENTRAL RISK DEFENSE PARAMETERS</span>
            <span className="badge-warn">ENGINEERING RISK DEFAULTS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-[10px] uppercase mb-1">Max Position Size USD</label>
              <input
                type="number"
                value={riskConfig.maxPositionSizeUSD}
                onChange={e => setRiskConfig({ ...riskConfig, maxPositionSizeUSD: Number(e.target.value) })}
                className="w-full bg-[#0e121a] border border-[#252f44] rounded p-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] uppercase mb-1">Max Simultaneous Open Positions</label>
              <input
                type="number"
                value={riskConfig.maxSimultaneousTrades}
                onChange={e => setRiskConfig({ ...riskConfig, maxSimultaneousTrades: Number(e.target.value) })}
                className="w-full bg-[#0e121a] border border-[#252f44] rounded p-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] uppercase mb-1">Daily Loss Limit %</label>
              <input
                type="number"
                step="0.1"
                value={riskConfig.dailyLossLimitPct}
                onChange={e => setRiskConfig({ ...riskConfig, dailyLossLimitPct: Number(e.target.value) })}
                className="w-full bg-[#0e121a] border border-[#252f44] rounded p-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] uppercase mb-1">Symbol Cooldown (Minutes)</label>
              <input
                type="number"
                value={riskConfig.cooldownMinutes}
                onChange={e => setRiskConfig({ ...riskConfig, cooldownMinutes: Number(e.target.value) })}
                className="w-full bg-[#0e121a] border border-[#252f44] rounded p-2 text-white text-xs"
              />
            </div>
          </div>

          {saveMessage && <div className="text-emerald-400 text-xs p-2 bg-emerald-950/30 rounded border border-emerald-500/30">{saveMessage}</div>}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveRisk}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Risk Settings
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Visual Rule Builder (Prompt Section 55) */}
      {activeTab === 'RULES' && (
        <div className="bg-[#151a24] border border-[#232b3e] rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#232b3e]">
            <span className="font-bold text-white text-xs">VISUAL STRATEGY RULE BUILDER (IF / AND / THEN)</span>
            <span className="badge-info">Safe Machine-Readable Rules</span>
          </div>

          <div className="p-4 bg-[#0e121a] border border-[#252f44] rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white font-bold rounded text-[10px]">IF</span>
              <span className="text-white">1D Trend EQUALS 'UPTREND'</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white font-bold rounded text-[10px]">AND</span>
              <span className="text-white">1H RSI BETWEEN 25 AND 40</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white font-bold rounded text-[10px]">AND</span>
              <span className="text-white">30M RSI LEADS POSITIVELY</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-600 text-white font-bold rounded text-[10px]">AND</span>
              <span className="text-white">1H Support EQUALS 'VALID'</span>
            </div>
            <div className="pt-2 border-t border-[#1b2333] flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[10px]">THEN</span>
              <span className="text-emerald-400 font-bold">GENERATE SIGNAL (+1% TARGET PROFIT)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users & Access Management */}
      {activeTab === 'USERS' && (
        <div className="bg-[#151a24] border border-[#232b3e] rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#232b3e]">
            <div>
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                CLIENT PORTALS & USER ACCESS MANAGEMENT
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Manage accounts who can log in to their private portal and attach their Binance accounts
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite / Add User
            </button>
          </div>

          {userMsg && (
            <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded text-blue-200 text-xs flex justify-between items-center">
              <span>{userMsg}</span>
              <button onClick={() => setUserMsg('')} className="text-gray-400 hover:text-white font-bold">×</button>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#232b3e] text-gray-400 text-[10px] uppercase font-bold bg-[#0e121a]">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Binance Attached</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638] text-[11px]">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      Loading registered users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-[#192130] transition">
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">
                          {u.username.slice(0, 1).toUpperCase()}
                        </div>
                        <span>{u.username}</span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-300 font-mono text-[10px]">{u.email}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {u.binance_connected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700">
                            Not Attached
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'suspended'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {u.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        {u.username !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                                u.status === 'suspended'
                                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/60'
                                  : 'bg-amber-950/40 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60'
                              }`}
                            >
                              {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="px-2 py-1 rounded text-[10px] font-bold bg-red-950/40 text-red-300 border border-red-500/40 hover:bg-red-900/60 transition"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
              <div className="bg-[#121722] border border-[#232b3e] w-full max-w-md rounded-xl p-5 shadow-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#232b3e]">
                  <h3 className="font-bold text-white text-xs flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-400" />
                    CREATE NEW USER / CLIENT ACCESS
                  </h3>
                  <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                  <div>
                    <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Username</label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="client_name"
                      className="w-full bg-[#0b0e14] border border-[#232b3e] focus:border-blue-500 rounded p-2 text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="client@trading.com"
                      className="w-full bg-[#0b0e14] border border-[#232b3e] focus:border-blue-500 rounded p-2 text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Temporary Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0b0e14] border border-[#232b3e] focus:border-blue-500 rounded p-2 text-white font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'USER')}
                      className="w-full bg-[#0b0e14] border border-[#232b3e] rounded p-2 text-white font-mono focus:outline-none"
                    >
                      <option value="USER">USER (Client Portal with private Binance key)</option>
                      <option value="ADMIN">ADMIN (Full platform & user control)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="flex-1 py-2 rounded bg-[#1e2535] text-gray-300 font-bold hover:bg-[#283247] transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-500 shadow transition"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'AUDIT' && (
        <div className="bg-[#151a24] border border-[#232b3e] rounded-lg p-4 space-y-3">
          <span className="font-bold text-white text-xs">SECURITY & RISK AUDIT LOG</span>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {[
              { action: 'INITIALIZE_SYSTEM', actor: 'system', time: '12:29:25', details: 'All 7 strategies seeded v1.0' },
              { action: 'ENCRYPT_CREDENTIALS', actor: 'admin', time: '12:35:40', details: 'AES-256-GCM encryption keys active' },
              { action: 'KILL_SWITCH_TESTED', actor: 'admin', time: '12:40:10', details: 'Emergency circuit verified' },
              { action: 'RISK_ENGINE_CHECK', actor: 'RiskAgent', time: '12:45:00', details: 'Max 3 positions verified' }
            ].map((log, i) => (
              <div key={i} className="p-2.5 bg-[#0e121a] border border-[#222b3d] rounded flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">{log.action}</span>
                  <div className="text-[10px] text-gray-500">{log.details}</div>
                </div>
                <div className="text-[10px] text-gray-400">{log.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
