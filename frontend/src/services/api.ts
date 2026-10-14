export interface ScannerRow {
  symbol: string;
  price: number;
  change24h: number;
  trend1D: string;
  trend1H: string;
  rsi30M: number;
  rsi1H: number;
  ema9: number;
  ema33: number;
  v1State: string;
  liquidityStatus: string;
  liquidityDistancePct: number;
  support: number;
  resistance: number;
  orderBlocksCount: number;
  obLow?: number;
  obHigh?: number;
  obStatus?: string;
  isOBConfirmed?: boolean;
  isV1Confirmed?: boolean;
  isHBConfirmed?: boolean;
  ictEligible: boolean;
  matchedStrategies: string[];
  signalState: string;
  leadTimeSeconds: number;
  dataAgeSeconds: number;
}

export interface V1CandidateSignal {
  symbol: string;
  cleanSymbol: string;
  price: number;
  change24h: number;
  rsi15M: number;
  rsi30M: number;
  rsi1H: number;
  rsi4H?: number;
  rsi1D: number;
  trend1H: 'Uptrend' | 'Downtrend' | 'Sideways';
  trend1D: 'Uptrend' | 'Downtrend' | 'Sideways';
  isLeadershipConfirmed: boolean;
  is15MAbove30M?: boolean;
  isLadderAligned?: boolean;
  isFullLadder?: boolean;
  isV1Confirmed: boolean;
  timeAgo: string;
  detectedAt: number;
  tradingViewUrl?: string;
  confirmationStatus?: 'CONFIRMED' | 'PENDING';
  qualificationReason?: string;
}

export interface V1ActiveCoin {
  symbol: string;
  cleanSymbol: string;
  price: number;
  change24h: number;
  rsi1H: number;
  rsi30M: number;
  timeStr: string;
  tradingViewUrl?: string;
}

export interface V1ScanResponse {
  success: boolean;
  totalMonitored: number;
  v1ZoneCount: number;
  activeCoins: V1ActiveCoin[];
  signals: V1CandidateSignal[];
  timestamp: number;
  lastScanTimeStr: string;
  rsiMin: number;
  rsiMax: number;
  exchange?: string;
  marketType?: string;
}

export interface HiddenCandidateSignal {
  symbol: string;
  cleanSymbol: string;
  price: number;
  change24h: number;
  rsi15M: number;
  rsi30M: number;
  rsi1H: number;
  prevRsi1H: number;
  rsi1D: number;
  isConsolidating: boolean;
  is30MLeading: boolean;
  isHBConfirmed: boolean;
  timeAgo: string;
  detectedAt: number;
  tradingViewUrl?: string;
  confirmationStatus?: 'CONFIRMED' | 'PENDING';
  qualificationReason?: string;
  divergenceDetected?: boolean;
  pivot1?: any;
  pivot2?: any;
}

export interface HiddenActiveCoin {
  symbol: string;
  cleanSymbol: string;
  price: number;
  change24h: number;
  rsi1H: number;
  rsi30M: number;
  timeStr: string;
  tradingViewUrl?: string;
}

export interface HiddenScanResponse {
  success: boolean;
  totalMonitored: number;
  activeCount: number;
  activeCoins: HiddenActiveCoin[];
  signals: HiddenCandidateSignal[];
  timestamp: number;
  lastScanTimeStr: string;
  rsiMin: number;
  rsiMax: number;
  exchange?: string;
  marketType?: string;
}

export interface CoinDetailData {
  symbol: string;
  cleanSymbol?: string;
  exchange?: string;
  marketType?: string;
  lastPrice: number;
  change24h: number;
  tradingViewUrl?: string;
  rsi1h?: any;
  rsi30m?: any;
  rsi15m?: any;
  rsi1d?: any;
  divergence?: any;
  candles: {
    '15m': any[];
    '30m': any[];
    '1h': any[];
    '1d': any[];
  };
  overlays: {
    supportResistance: any[];
    orderBlocks: any[];
    ema9: number;
    ema33: number;
    liquiditySnapshot: any;
  };
  strategiesEvaluation: any[];
}

export interface AgentData {
  id: string;
  name: string;
  category: string;
  status: string;
  isEnabled: boolean;
  version: string;
  currentTask: string;
  processedCount: number;
  errorCount: number;
  latencyMs: number;
  lastHeartbeat: number;
  lastSuccessfulJob?: number;
  lastErrorMessage?: string;
  logs: Array<{ timestamp: number; level: string; message: string }>;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  status?: string;
  created_at?: string;
  binance_connected?: boolean;
  binance_last_connected?: string;
}

export interface UserMeResponse {
  user: UserProfile;
  binance: {
    isConnected: boolean;
    maskedApiKey: string | null;
    lastValidatedAt: string | null;
    isTestnet: boolean;
  };
}

const TOKEN_KEY = 'apex_auth_token';
const SESSION_ID_KEY = 'scalppro_session_id';
const LICENSE_KEY_KEY = 'scalppro_license_key';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_ID_KEY);
}

export function setSessionId(sessionId: string | null) {
  if (sessionId) {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  } else {
    localStorage.removeItem(SESSION_ID_KEY);
  }
}

export function getStoredLicenseKey(): string | null {
  return localStorage.getItem(LICENSE_KEY_KEY);
}

export function setStoredLicenseKey(key: string | null) {
  if (key) {
    localStorage.setItem(LICENSE_KEY_KEY, key);
  } else {
    localStorage.removeItem(LICENSE_KEY_KEY);
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const sessionId = getSessionId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (sessionId) {
    headers['x-session-id'] = sessionId;
  }
  return headers;
}

export interface LicenseInfo {
  id: string;
  license_key: string;
  assigned_username?: string;
  assigned_user_id?: string;
  note?: string;
  duration_days: number;
  status: 'active' | 'expired' | 'revoked';
  active_session_id?: string;
  current_ip?: string;
  last_active_at?: string;
  expires_at?: string;
  created_at: string;
  isOnline?: boolean;
  isExpired?: boolean;
}


export interface LiveOverviewResponse {
  success: boolean;
  cached?: boolean;
  timestamp: number;
  tickers: Record<string, { price: number; change24h: number }>;
  topMovers: Array<{ symbol: string; change24h: number; price: number }>;
  breadth: {
    total: number;
    rising: number;
    falling: number;
    risingPct: number;
    fallingPct: number;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  };
  zones?: {
    gainers: any[];
    v1: any[];
    neutral: any[];
    hiddenBull: any[];
    oversold: any[];
    extreme: any[];
  };
}

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const url = input.startsWith('http') ? input : `${API_BASE}${input.startsWith('/') ? input : `/${input}`}`;
  return fetch(url, init);
}

export const api = {
  async getLiveOverview(fresh?: boolean, timeframe?: string): Promise<LiveOverviewResponse> {
    const params = new URLSearchParams();
    if (fresh) params.set('fresh', '1');
    if (timeframe) params.set('timeframe', timeframe);
    params.set('t', Date.now().toString());
    const query = `?${params.toString()}`;
    const res = await apiFetch(`/api/market/live-overview${query}`);
    return res.json();
  },

  async getHealth() {
    const res = await apiFetch('/api/health');
    return res.json();
  },

  async getScanner(fresh?: boolean): Promise<{ rows: ScannerRow[]; timestamp: number }> {
    const query = fresh ? `?fresh=1&t=${Date.now()}` : '';
    const res = await apiFetch(`/api/market/scanner${query}`);
    return res.json();
  },

  async getV1Scanner(options?: {
    rsiMin?: number;
    rsiMax?: number;
    fresh?: boolean;
  }): Promise<V1ScanResponse> {
    const params = new URLSearchParams();
    if (options?.rsiMin !== undefined) params.set('rsiMin', options.rsiMin.toString());
    if (options?.rsiMax !== undefined) params.set('rsiMax', options.rsiMax.toString());
    if (options?.fresh) params.set('fresh', '1');
    params.set('t', Date.now().toString());
    const res = await apiFetch(`/api/market/v1-scanner?${params.toString()}`);
    return res.json();
  },

  async getHiddenScanner(options?: {
    rsiMin?: number;
    rsiMax?: number;
    fresh?: boolean;
  }): Promise<HiddenScanResponse> {
    const params = new URLSearchParams();
    if (options?.rsiMin !== undefined) params.set('rsiMin', options.rsiMin.toString());
    if (options?.rsiMax !== undefined) params.set('rsiMax', options.rsiMax.toString());
    if (options?.fresh) params.set('fresh', '1');
    params.set('t', Date.now().toString());
    const res = await apiFetch(`/api/market/hidden-scanner?${params.toString()}`);
    return res.json();
  },

  async getCoinDetail(symbol: string): Promise<CoinDetailData> {
    const res = await apiFetch(`/api/market/coin/${symbol}`);
    return res.json();
  },

  async getSignals() {
    const res = await apiFetch('/api/signals');
    return res.json();
  },

  async getPaperTrading() {
    const res = await apiFetch('/api/paper-trading');
    return res.json();
  },

  async closePaperPosition(id: string) {
    const res = await apiFetch(`/api/paper-trading/close/${id}`, { method: 'POST' });
    return res.json();
  },

  async getRiskSettings() {
    const res = await apiFetch('/api/risk/settings');
    return res.json();
  },

  async updateRiskSettings(cfg: any) {
    const res = await apiFetch('/api/risk/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    });
    return res.json();
  },

  async toggleKillSwitch(action: 'HALT' | 'RESET') {
    const res = await apiFetch('/api/risk/kill-switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    return res.json();
  },

  async setTradingMode(mode: 'ANALYSIS' | 'PAPER' | 'LIVE') {
    const res = await apiFetch('/api/trading-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    return res.json();
  },

  async getAgents(): Promise<{ agents: AgentData[] }> {
    const res = await apiFetch('/api/agents');
    return res.json();
  },

  async controlAgent(id: string, action: 'start' | 'stop' | 'pause' | 'resume' | 'restart') {
    const res = await apiFetch(`/api/agents/${id}/${action}`, { method: 'POST' });
    return res.json();
  },

  async parseCommand(prompt: string) {
    const res = await apiFetch('/api/command-center/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    return res.json();
  },

  async executeCommand(command: any) {
    const res = await apiFetch('/api/command-center/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    return res.json();
  },

  async runBacktest(strategyCode: string, symbol: string) {
    const res = await apiFetch('/api/backtests/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategyCode, symbol })
    });
    return res.json();
  },

  async createReplay(symbol: string, timeframe: string) {
    const res = await apiFetch('/api/replay/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, timeframe })
    });
    return res.json();
  },

  async stepReplay(sessionId: string, action: string) {
    const res = await apiFetch(`/api/replay/${sessionId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    return res.json();
  },

  async get24hStats() {
    const res = await apiFetch('/api/monitoring/24h-stats');
    return res.json();
  },

  async getNotifications() {
    const res = await apiFetch('/api/notifications');
    return res.json();
  },

  async markNotificationsRead() {
    const res = await apiFetch('/api/notifications/mark-read', { method: 'POST' });
    return res.json();
  },

  async getJournal() {
    const res = await apiFetch('/api/journal');
    return res.json();
  },

  async connectBinance(apiKey: string, apiSecret: string) {
    const res = await apiFetch('/api/live-trading/connect', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ apiKey, apiSecret })
    });
    return res.json();
  },

  async disconnectBinance() {
    const res = await apiFetch('/api/live-trading/disconnect', {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getLiveAccountBalance() {
    const res = await apiFetch('/api/live-trading/account', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getLiveStatus() {
    const res = await apiFetch('/api/live-trading/status', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Auth & User Access Management
  async login(username: string, password: string, licenseKey?: string): Promise<{ success: boolean; token?: string; sessionId?: string; licenseKey?: string; user?: UserProfile; error?: string }> {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, licenseKey })
    });
    const data = await res.json();
    if (data.success && data.token) {
      setAuthToken(data.token);
      if (data.sessionId) setSessionId(data.sessionId);
      if (data.licenseKey) setStoredLicenseKey(data.licenseKey);
    }
    return data;
  },

  async register(username: string, email: string, password: string): Promise<{ success: boolean; token?: string; user?: UserProfile; error?: string }> {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  logout() {
    setAuthToken(null);
    setSessionId(null);
  },

  async validateSession(): Promise<{ valid: boolean; code?: string; error?: string; role?: string; expiresAt?: string; licenseKey?: string }> {
    try {
      const res = await apiFetch('/api/auth/validate-session', {
        headers: getAuthHeaders()
      });
      return res.json();
    } catch (e: any) {
      return { valid: false, error: e.message };
    }
  },

  async getMe(): Promise<UserMeResponse> {
    const res = await apiFetch('/api/auth/me', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getUsers(): Promise<{ users: UserProfile[] }> {
    const res = await apiFetch('/api/auth/users', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async createUser(user: { username: string; email: string; password: string; role: 'ADMIN' | 'USER' }) {
    const res = await apiFetch('/api/auth/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user)
    });
    return res.json();
  },

  async toggleUserStatus(id: string, status: 'active' | 'suspended') {
    const res = await apiFetch(`/api/auth/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async deleteUser(id: string) {
    const res = await apiFetch(`/api/auth/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Admin License Management
  async getLicenses(): Promise<{ success: boolean; licenses: LicenseInfo[]; error?: string }> {
    const res = await apiFetch('/api/admin/licenses', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async createLicense(data: { durationDays: number; note?: string; customKey?: string }): Promise<{ success: boolean; license?: LicenseInfo; error?: string }> {
    const res = await apiFetch('/api/admin/licenses', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async resetLicenseSession(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await apiFetch(`/api/admin/licenses/${id}/reset-session`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async revokeLicense(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await apiFetch(`/api/admin/licenses/${id}/revoke`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async deleteLicense(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const res = await apiFetch(`/api/admin/licenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

// Real-Time WebSocket Client
class WebSocketManager {
  private ws: WebSocket | null = null;
  private listeners: Array<(msg: any) => void> = [];

  connect() {
    let url: string;
    const envWs = import.meta.env.VITE_WS_URL;
    if (envWs) {
      url = envWs;
    } else if (API_BASE && API_BASE.startsWith('http')) {
      try {
        const parsed = new URL(API_BASE);
        const wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
        url = `${wsProto}//${parsed.host}/ws`;
      } catch (e) {
        url = `/ws`;
      }
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.port === '5173' ? 'localhost:4000' : window.location.host;
      url = `${protocol}//${host}/ws`;
    }

    try {
      this.ws = new WebSocket(url);

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          for (const cb of this.listeners) {
            cb(parsed);
          }
        } catch (e) {
          // ignore
        }
      };

      this.ws.onclose = () => {
        setTimeout(() => this.connect(), 4000);
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (e) {
      setTimeout(() => this.connect(), 4000);
    }
  }

  subscribe(cb: (msg: any) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }
}

export const wsManager = new WebSocketManager();
