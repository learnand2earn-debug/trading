import React, { useState } from 'react';
import { KeyRound, Lock, LogIn, Mail, Shield, User, UserPlus, X } from 'lucide-react';
import { api, UserProfile } from '../services/api.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'LOGIN') {
        const res = await api.login(username, password);
        if (res.success && res.user) {
          onSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Failed to sign in. Check username and password.');
        }
      } else {
        const res = await api.register(username, email, password);
        if (res.success && res.user) {
          onSuccess(res.user);
          onClose();
        } else {
          setError(res.error || 'Registration failed. Try a different username or email.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.login(u, p);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Quick login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#121722] border border-[#26334d] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-[#161d2b] border-b border-[#26334d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                APEX<span className="text-emerald-400">CRYPTO</span> ACCESS PORTAL
              </h2>
              <p className="text-[10px] text-gray-400">Autonomous Trading & Multi-User Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#20293d] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Login Bar */}
        <div className="p-4 bg-[#0d1118] border-b border-[#20293d] text-xs">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            Instant Demo Logins:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="px-2.5 py-2 rounded bg-[#161e2e] border border-blue-500/30 hover:border-blue-400 text-blue-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Admin (admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('trader1', 'trader123')}
              className="px-2.5 py-2 rounded bg-[#161e2e] border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Client (trader1)
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#20293d] text-xs">
          <button
            type="button"
            onClick={() => { setTab('LOGIN'); setError(''); }}
            className={`flex-1 py-3 text-center font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'LOGIN'
                ? 'text-white border-b-2 border-blue-500 bg-[#17202f]'
                : 'text-gray-400 hover:text-gray-200 bg-[#121722]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('REGISTER'); setError(''); }}
            className={`flex-1 py-3 text-center font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'REGISTER'
                ? 'text-white border-b-2 border-emerald-500 bg-[#17202f]'
                : 'text-gray-400 hover:text-gray-200 bg-[#121722]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register Portal
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-lg text-red-300 text-[11px] leading-relaxed">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or your_username"
              className="w-full bg-[#0b0f16] border border-[#26334d] focus:border-blue-500 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none"
            />
          </div>

          {tab === 'REGISTER' && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@example.com"
                className="w-full bg-[#0b0f16] border border-[#26334d] focus:border-emerald-500 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-300 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0b0f16] border border-[#26334d] focus:border-blue-500 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition mt-2 ${
              tab === 'LOGIN'
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : tab === 'LOGIN' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Enter Terminal</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Client Portal</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
