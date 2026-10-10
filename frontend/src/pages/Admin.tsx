import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Key,
  Plus,
  Save,
  Settings,
  ShieldAlert,
  Sliders,
  Trash2,
  UserPlus,
  Users,
  Wrench,
  X
} from 'lucide-react';
import { api, UserProfile } from '../services/api.js';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STRATEGIES' | 'RISK' | 'RULES' | 'USERS' | 'AUDIT'>('STRATEGIES');
  const [riskConfig, setRiskConfig] = useState<any>(null);
  const [saveMessage, setSaveMessage] = useState('');

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
  }, []);

  useEffect(() => {
    if (activeTab === 'USERS') {
      loadUsers();
    }
  }, [activeTab]);

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
        <div className="flex items-center gap-1.5">
          {(['STRATEGIES', 'RISK', 'RULES', 'USERS', 'AUDIT'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded font-bold transition text-[11px] ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#0e121a] text-gray-400 border border-[#252f44]'
              }`}
            >
              {tab === 'USERS' ? 'USERS & ACCESS' : tab}
            </button>
          ))}
        </div>
      </div>

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
