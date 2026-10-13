import React, { useEffect, useState } from 'react';
import {
  KeyRound,
  Users,
  Copy,
  Plus,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Settings,
  X,
  UserPlus
} from 'lucide-react';
import { api, UserProfile, LicenseInfo } from '../services/api.js';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LICENSES' | 'USERS' | 'RISK'>('LICENSES');

  // License Management State
  const [licenses, setLicenses] = useState<LicenseInfo[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(false);
  const [genDurationDays, setGenDurationDays] = useState(30);
  const [genNote, setGenNote] = useState('');
  const [genCustomKey, setGenCustomKey] = useState('');
  const [licenseMsg, setLicenseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastGeneratedKey, setLastGeneratedKey] = useState<{ key: string; days: number; note: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // User Management State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER');
  const [userMsg, setUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Risk Management State
  const [riskConfig, setRiskConfig] = useState<any>(null);
  const [riskMsg, setRiskMsg] = useState('');

  useEffect(() => {
    loadLicenses();
    loadUsers();
    loadRisk();
  }, []);

  const loadLicenses = async () => {
    setLoadingLicenses(true);
    try {
      const res = await api.getLicenses();
      if (res.success) {
        setLicenses(res.licenses || []);
      }
    } catch (e: any) {
      setLicenseMsg({ type: 'error', text: `Failed to load licenses: ${e.message}` });
    } finally {
      setLoadingLicenses(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.getUsers();
      setUsers(res.users || []);
    } catch (e: any) {
      setUserMsg({ type: 'error', text: `Failed to load users: ${e.message}` });
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadRisk = async () => {
    try {
      const res = await api.getRiskSettings();
      setRiskConfig(res.config);
    } catch (e) {
      // ignore
    }
  };

  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLicenseMsg(null);
    try {
      const res = await api.createLicense({
        durationDays: genDurationDays,
        note: genNote.trim() || undefined,
        customKey: genCustomKey.trim() || undefined
      });
      if (res.success && res.license) {
        const key = res.license.license_key;
        setLastGeneratedKey({ key, days: res.license.duration_days, note: genNote });
        setLicenseMsg({
          type: 'success',
          text: `License key generated successfully! Key: ${key} (${res.license.duration_days} days)`
        });
        setGenCustomKey('');
        setGenNote('');
        await loadLicenses();
      } else {
        setLicenseMsg({ type: 'error', text: res.error || 'Failed to generate license key' });
      }
    } catch (e: any) {
      setLicenseMsg({ type: 'error', text: e.message });
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleResetSession = async (lic: LicenseInfo) => {
    try {
      const res = await api.resetLicenseSession(lic.id);
      if (res.success) {
        setLicenseMsg({
          type: 'success',
          text: `⚡ Session reset for ${lic.license_key}. Active browser/device unlinked.`
        });
        await loadLicenses();
      }
    } catch (e: any) {
      setLicenseMsg({ type: 'error', text: e.message });
    }
  };

  const handleRevokeLicense = async (lic: LicenseInfo) => {
    if (!confirm(`Are you sure you want to revoke license ${lic.license_key}?`)) return;
    try {
      const res = await api.revokeLicense(lic.id);
      if (res.success) {
        setLicenseMsg({ type: 'success', text: `🚫 License ${lic.license_key} has been revoked.` });
        await loadLicenses();
      }
    } catch (e: any) {
      setLicenseMsg({ type: 'error', text: e.message });
    }
  };

  const handleDeleteLicense = async (lic: LicenseInfo) => {
    if (!confirm(`Permanently delete license ${lic.license_key}?`)) return;
    try {
      const res = await api.deleteLicense(lic.id);
      if (res.success) {
        setLicenseMsg({ type: 'success', text: `🗑️ License ${lic.license_key} deleted permanently.` });
        await loadLicenses();
      }
    } catch (e: any) {
      setLicenseMsg({ type: 'error', text: e.message });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) {
      setUserMsg({ type: 'error', text: 'Please fill in all username, email, and password fields.' });
      return;
    }

    try {
      const res = await api.createUser({
        username: newUsername.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole
      });

      if (res.success) {
        setUserMsg({ type: 'success', text: `✅ User "${newUsername}" created successfully!` });
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        await loadUsers();
      } else {
        setUserMsg({ type: 'error', text: res.error || 'Failed to create user' });
      }
    } catch (e: any) {
      setUserMsg({ type: 'error', text: e.message });
    }
  };

  const handleToggleUserStatus = async (user: UserProfile) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await api.toggleUserStatus(user.id, nextStatus);
      if (res.success) {
        setUserMsg({ type: 'success', text: `User "${user.username}" status changed to ${nextStatus}.` });
        await loadUsers();
      } else {
        setUserMsg({ type: 'error', text: res.error || 'Status change failed' });
      }
    } catch (e: any) {
      setUserMsg({ type: 'error', text: e.message });
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (!confirm(`Are you sure you want to permanently delete user "${user.username}"?`)) {
      return;
    }
    try {
      const res = await api.deleteUser(user.id);
      if (res.success) {
        setUserMsg({ type: 'success', text: `🗑️ User "${user.username}" deleted successfully.` });
        await loadUsers();
      } else {
        setUserMsg({ type: 'error', text: res.error || 'Delete failed' });
      }
    } catch (e: any) {
      setUserMsg({ type: 'error', text: e.message });
    }
  };

  const handleSaveRisk = async () => {
    if (!riskConfig) return;
    try {
      await api.updateRiskSettings(riskConfig);
      setRiskMsg('Risk settings saved successfully.');
      setTimeout(() => setRiskMsg(''), 3000);
    } catch (e: any) {
      setRiskMsg(`Error: ${e.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 16px', color: '#e6edf3', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d1522 0%, #080c14 100%)',
          border: '1px solid #1c2a42',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🛡️</span>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
              ADMIN CONTROL PANEL
            </h1>
            <span
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              Super Admin
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#8b949e' }}>
            Generate customer license keys, add/remove members, and control trading access.
          </p>
        </div>

        {/* Primary Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: '#06090e', padding: '4px', borderRadius: '8px', border: '1px solid #162032' }}>
          <button
            onClick={() => setActiveTab('LICENSES')}
            style={{
              background: activeTab === 'LICENSES' ? '#22c55e' : 'transparent',
              color: activeTab === 'LICENSES' ? '#000000' : '#8b949e',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🔑</span>
            <span>License Keys</span>
          </button>

          <button
            onClick={() => setActiveTab('USERS')}
            style={{
              background: activeTab === 'USERS' ? '#38bdf8' : 'transparent',
              color: activeTab === 'USERS' ? '#000000' : '#8b949e',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>👥</span>
            <span>Add / Remove Users</span>
          </button>

          <button
            onClick={() => setActiveTab('RISK')}
            style={{
              background: activeTab === 'RISK' ? '#f59e0b' : 'transparent',
              color: activeTab === 'RISK' ? '#000000' : '#8b949e',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>⚙️</span>
            <span>System Settings</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LICENSE KEY GENERATOR                              */}
      {/* ========================================================= */}
      {activeTab === 'LICENSES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Notification Messages */}
          {licenseMsg && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: licenseMsg.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${licenseMsg.type === 'success' ? '#22c55e' : '#ef4444'}`,
                color: licenseMsg.type === 'success' ? '#4ade80' : '#f87171',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{licenseMsg.text}</span>
              <button
                onClick={() => setLicenseMsg(null)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
              >
                ×
              </button>
            </div>
          )}

          {/* Quick Copy Box for Last Generated Key */}
          {lastGeneratedKey && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(6, 78, 59, 0.4))',
                border: '1px solid #22c55e',
                borderRadius: '10px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ color: '#4ade80', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎉 Ready to Give to Customer:
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'monospace', color: '#ffffff', letterSpacing: '1px', marginTop: '2px' }}>
                  {lastGeneratedKey.key}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>
                  Validity: <strong style={{ color: '#ffffff' }}>{lastGeneratedKey.days} Days</strong>
                  {lastGeneratedKey.note && ` · Customer: ${lastGeneratedKey.note}`}
                </div>
              </div>

              <button
                onClick={() => handleCopyKey(lastGeneratedKey.key)}
                style={{
                  background: copiedKey === lastGeneratedKey.key ? '#15803d' : '#22c55e',
                  color: '#000000',
                  fontWeight: 800,
                  fontSize: '13px',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)'
                }}
              >
                <Copy style={{ width: '16px', height: '16px' }} />
                <span>{copiedKey === lastGeneratedKey.key ? 'COPIED TO CLIPBOARD!' : 'COPY LICENSE KEY'}</span>
              </button>
            </div>
          )}

          {/* Generator Form Card */}
          <div
            style={{
              background: '#0c121d',
              border: '1px solid #1a2538',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound style={{ width: '18px', height: '18px', color: '#22c55e' }} />
                GENERATE NEW LICENSE KEY
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#8b949e' }}>
                Select duration, write customer note, and generate a secure 1-device license key.
              </p>
            </div>

            <form onSubmit={handleGenerateLicense} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Validity Duration
                </label>
                <select
                  value={genDurationDays}
                  onChange={(e) => setGenDurationDays(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: '#06090e',
                    border: '1px solid #233148',
                    color: '#ffffff',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <option value={7}>7 Days (Trial)</option>
                  <option value={30}>30 Days (1 Month)</option>
                  <option value={60}>60 Days (2 Months)</option>
                  <option value={90}>90 Days (3 Months)</option>
                  <option value={180}>180 Days (6 Months)</option>
                  <option value={365}>365 Days (1 Year VIP)</option>
                  <option value={3650}>Lifetime VIP Access (10 Years)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Customer Name / Note (e.g. WhatsApp)
                </label>
                <input
                  type="text"
                  value={genNote}
                  onChange={(e) => setGenNote(e.target.value)}
                  placeholder="e.g. Ali Hassan (+92 316 4404787)"
                  style={{
                    width: '100%',
                    background: '#06090e',
                    border: '1px solid #233148',
                    color: '#ffffff',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Custom Key Code (Optional)
                </label>
                <input
                  type="text"
                  value={genCustomKey}
                  onChange={(e) => setGenCustomKey(e.target.value.toUpperCase())}
                  placeholder="Leave blank to auto-generate"
                  style={{
                    width: '100%',
                    background: '#06090e',
                    border: '1px solid #233148',
                    color: '#ffffff',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    textTransform: 'uppercase',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loadingLicenses}
                  style={{
                    width: '100%',
                    background: '#22c55e',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 16px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)',
                    transition: 'opacity 0.15s ease'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  <span>Generate Key</span>
                </button>
              </div>
            </form>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#0b1018', border: '1px solid #1c2738', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '11px', color: '#8b949e', fontWeight: 600 }}>Total Issued Keys</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>{licenses.length}</div>
            </div>
            <div style={{ background: '#0b1018', border: '1px solid #1c2738', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '11px', color: '#8b949e', fontWeight: 600 }}>Active & Valid</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#22c55e', marginTop: '4px' }}>
                {licenses.filter(l => l.status === 'active' && !l.isExpired).length}
              </div>
            </div>
            <div style={{ background: '#0b1018', border: '1px solid #1c2738', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '11px', color: '#8b949e', fontWeight: 600 }}>Devices Currently Online</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                {licenses.filter(l => l.isOnline).length}
              </div>
            </div>
            <div style={{ background: '#0b1018', border: '1px solid #1c2738', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '11px', color: '#8b949e', fontWeight: 600 }}>Expired / Revoked</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
                {licenses.filter(l => l.status !== 'active' || l.isExpired).length}
              </div>
            </div>
          </div>

          {/* Licenses Table */}
          <div style={{ background: '#0c121d', border: '1px solid #1a2538', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a2538', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>ALL ISSUED LICENSES</span>
              <button
                onClick={loadLicenses}
                style={{ background: 'transparent', border: '1px solid #233148', color: '#94a3b8', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
              >
                Refresh List
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#070a10', color: '#8b949e', borderBottom: '1px solid #162030' }}>
                    <th style={{ padding: '12px 16px' }}>License Key</th>
                    <th style={{ padding: '12px 16px' }}>Customer / Note</th>
                    <th style={{ padding: '12px 16px' }}>Duration</th>
                    <th style={{ padding: '12px 16px' }}>Device Session</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#8b949e' }}>
                        No license keys created yet. Generate one above to give access to users.
                      </td>
                    </tr>
                  ) : (
                    licenses.map(lic => {
                      const isExpired = lic.isExpired;
                      const isActive = lic.status === 'active' && !isExpired;

                      return (
                        <tr key={lic.id} style={{ borderBottom: '1px solid #131a26' }}>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#ffffff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{lic.license_key}</span>
                              <button
                                onClick={() => handleCopyKey(lic.license_key)}
                                title="Copy key"
                                style={{
                                  background: copiedKey === lic.license_key ? '#22c55e' : '#162032',
                                  color: copiedKey === lic.license_key ? '#000000' : '#38bdf8',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '2px 6px',
                                  cursor: 'pointer',
                                  fontSize: '10px',
                                  fontWeight: 700
                                }}
                              >
                                {copiedKey === lic.license_key ? '✓ Copied' : 'Copy'}
                              </button>
                            </div>
                          </td>

                          <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                            {lic.note || <span style={{ color: '#64748b' }}>None</span>}
                          </td>

                          <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                            <div>{lic.duration_days} Days</div>
                            {lic.expires_at && (
                              <div style={{ fontSize: '10px', color: '#64748b' }}>
                                Exp: {new Date(lic.expires_at).toLocaleDateString()}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            {lic.isOnline ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#38bdf8', fontSize: '11px', fontWeight: 600 }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
                                Connected ({lic.current_ip || 'Device'})
                              </span>
                            ) : lic.active_session_id ? (
                              <span style={{ color: '#94a3b8', fontSize: '11px' }}>Bound to device</span>
                            ) : (
                              <span style={{ color: '#64748b', fontSize: '11px' }}>Unassigned</span>
                            )}
                          </td>

                          <td style={{ padding: '12px 16px' }}>
                            {isActive ? (
                              <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                                ACTIVE
                              </span>
                            ) : isExpired ? (
                              <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                                EXPIRED
                              </span>
                            ) : (
                              <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                                REVOKED
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                onClick={() => handleResetSession(lic)}
                                title="Disconnect current device so customer can log in on another phone/PC"
                                style={{
                                  background: '#162032',
                                  border: '1px solid #28374f',
                                  color: '#38bdf8',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <RotateCcw style={{ width: '12px', height: '12px' }} />
                                <span>Reset Device</span>
                              </button>

                              {isActive && (
                                <button
                                  onClick={() => handleRevokeLicense(lic)}
                                  title="Block customer access immediately"
                                  style={{
                                    background: '#281318',
                                    border: '1px solid #5a1e24',
                                    color: '#f87171',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Revoke
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteLicense(lic)}
                                title="Permanently delete license"
                                style={{
                                  background: '#201014',
                                  border: '1px solid #451b22',
                                  color: '#ef4444',
                                  padding: '4px 6px',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 style={{ width: '13px', height: '13px' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: USER MANAGEMENT (ADD & REMOVE USERS)               */}
      {/* ========================================================= */}
      {activeTab === 'USERS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Notification Messages */}
          {userMsg && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: userMsg.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${userMsg.type === 'success' ? '#22c55e' : '#ef4444'}`,
                color: userMsg.type === 'success' ? '#4ade80' : '#f87171',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{userMsg.text}</span>
              <button
                onClick={() => setUserMsg(null)}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
              >
                ×
              </button>
            </div>
          )}

          {/* Add New User Card */}
          <div
            style={{
              background: '#0c121d',
              border: '1px solid #1a2538',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
                ADD NEW MEMBER / USER
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#8b949e' }}>
                Create a login account for a user or admin.
              </p>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. dawood_trader"
                  style={{
                    width: '100%',
                    background: '#06090e',
                    border: '1px solid #233148',
                    color: '#ffffff',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. client@example.com"
                  style={{
                    width: '100%',
                    background: '#06090e',
                    border: '1px solid #233148',
                    color: '#ffffff',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    background: '#06090e',
                    border: '1px solid #233148',
                    color: '#ffffff',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'USER')}
                  style={{
                    width: '100%',
                    background: '#06090e',
                    border: '1px solid #233148',
                    color: '#ffffff',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <option value="USER">USER (Regular Member)</option>
                  <option value="ADMIN">ADMIN (Full Admin Access)</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loadingUsers}
                  style={{
                    width: '100%',
                    background: '#38bdf8',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 16px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
                    transition: 'opacity 0.15s ease'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>

          {/* Users Table */}
          <div style={{ background: '#0c121d', border: '1px solid #1a2538', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a2538', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>REGISTERED USERS & MEMBERS</span>
              <button
                onClick={loadUsers}
                style={{ background: 'transparent', border: '1px solid #233148', color: '#94a3b8', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
              >
                Refresh List
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#070a10', color: '#8b949e', borderBottom: '1px solid #162030' }}>
                    <th style={{ padding: '12px 16px' }}>Username</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Role</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#8b949e' }}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #131a26' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#ffffff' }}>
                          {u.username}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              background: u.role === 'ADMIN' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                              color: u.role === 'ADMIN' ? '#38bdf8' : '#94a3b8',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              background: u.status === 'suspended' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                              color: u.status === 'suspended' ? '#f87171' : '#22c55e',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            {u.status === 'suspended' ? 'SUSPENDED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              style={{
                                background: u.status === 'suspended' ? '#14532d' : '#281318',
                                border: '1px solid transparent',
                                color: u.status === 'suspended' ? '#4ade80' : '#f87171',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="Permanently remove user"
                              style={{
                                background: '#3b0d11',
                                border: '1px solid #7f1d1d',
                                color: '#ef4444',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Trash2 style={{ width: '13px', height: '13px' }} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SYSTEM SETTINGS                                    */}
      {/* ========================================================= */}
      {activeTab === 'RISK' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {riskMsg && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid #22c55e', color: '#4ade80', fontSize: '13px', fontWeight: 600 }}>
              {riskMsg}
            </div>
          )}

          <div style={{ background: '#0c121d', border: '1px solid #1a2538', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
              PLATFORM RISK CONTROLS & EMERGENCY KILL SWITCH
            </h2>

            {riskConfig ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Max Open Positions
                    </label>
                    <input
                      type="number"
                      value={riskConfig.maxOpenPositions || 3}
                      onChange={(e) => setRiskConfig({ ...riskConfig, maxOpenPositions: Number(e.target.value) })}
                      style={{ width: '100%', background: '#06090e', border: '1px solid #233148', color: '#ffffff', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Daily Drawdown Limit (%)
                    </label>
                    <input
                      type="number"
                      value={riskConfig.dailyDrawdownLimit || 5}
                      onChange={(e) => setRiskConfig({ ...riskConfig, dailyDrawdownLimit: Number(e.target.value) })}
                      style={{ width: '100%', background: '#06090e', border: '1px solid #233148', color: '#ffffff', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Max Account Leverage
                    </label>
                    <input
                      type="number"
                      value={riskConfig.maxAccountLeverage || 5}
                      onChange={(e) => setRiskConfig({ ...riskConfig, maxAccountLeverage: Number(e.target.value) })}
                      style={{ width: '100%', background: '#06090e', border: '1px solid #233148', color: '#ffffff', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <button
                    onClick={handleSaveRisk}
                    style={{
                      background: '#f59e0b',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Save Risk Configuration
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: '#8b949e', fontSize: '12px' }}>Loading system configuration...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
