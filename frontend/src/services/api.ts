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
  ictEligible: boolean;
  matchedStrategies: string[];
  signalState: string;
  leadTimeSeconds: number;
  dataAgeSeconds: number;
}

export interface CoinDetailData {
  symbol: string;
  lastPrice: number;
  change24h: number;
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

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
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
}

export const api = {
  async getLiveOverview(): Promise<LiveOverviewResponse> {
    const res = await fetch('/api/market/live-overview');
    return res.json();
  },

  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  async getScanner(): Promise<{ rows: ScannerRow[]; timestamp: number }> {
    const res = await fetch('/api/market/scanner');
    return res.json();
  },

  async getCoinDetail(symbol: string): Promise<CoinDetailData> {
    const res = await fetch(`/api/market/coin/${symbol}`);
    return res.json();
  },

  async getSignals() {
    const res = await fetch('/api/signals');
    return res.json();
  },

  async getPaperTrading() {
    const res = await fetch('/api/paper-trading');
    return res.json();
  },

  async closePaperPosition(id: string) {
    const res = await fetch(`/api/paper-trading/close/${id}`, { method: 'POST' });
    return res.json();
  },

  async getRiskSettings() {
    const res = await fetch('/api/risk/settings');
    return res.json();
  },

  async updateRiskSettings(cfg: any) {
    const res = await fetch('/api/risk/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg)
    });
    return res.json();
  },

  async toggleKillSwitch(action: 'HALT' | 'RESET') {
    const res = await fetch('/api/risk/kill-switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    return res.json();
  },

  async setTradingMode(mode: 'ANALYSIS' | 'PAPER' | 'LIVE') {
    const res = await fetch('/api/trading-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    return res.json();
  },

  async getAgents(): Promise<{ agents: AgentData[] }> {
    const res = await fetch('/api/agents');
    return res.json();
  },

  async controlAgent(id: string, action: 'start' | 'stop' | 'pause' | 'resume' | 'restart') {
    const res = await fetch(`/api/agents/${id}/${action}`, { method: 'POST' });
    return res.json();
  },

  async parseCommand(prompt: string) {
    const res = await fetch('/api/command-center/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    return res.json();
  },

  async executeCommand(command: any) {
    const res = await fetch('/api/command-center/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    return res.json();
  },

  async runBacktest(strategyCode: string, symbol: string) {
    const res = await fetch('/api/backtests/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategyCode, symbol })
    });
    return res.json();
  },

  async createReplay(symbol: string, timeframe: string) {
    const res = await fetch('/api/replay/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol, timeframe })
    });
    return res.json();
  },

  async stepReplay(sessionId: string, action: string) {
    const res = await fetch(`/api/replay/${sessionId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    return res.json();
  },

  async get24hStats() {
    const res = await fetch('/api/monitoring/24h-stats');
    return res.json();
  },

  async getNotifications() {
    const res = await fetch('/api/notifications');
    return res.json();
  },

  async markNotificationsRead() {
    const res = await fetch('/api/notifications/mark-read', { method: 'POST' });
    return res.json();
  },

  async getJournal() {
    const res = await fetch('/api/journal');
    return res.json();
  },

  async connectBinance(apiKey: string, apiSecret: string) {
    const res = await fetch('/api/live-trading/connect', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ apiKey, apiSecret })
    });
    return res.json();
  },

  async disconnectBinance() {
    const res = await fetch('/api/live-trading/disconnect', {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getLiveAccountBalance() {
    const res = await fetch('/api/live-trading/account', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getLiveStatus() {
    const res = await fetch('/api/live-trading/status', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Auth & User Access Management
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: UserProfile; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async register(username: string, email: string, password: string): Promise<{ success: boolean; token?: string; user?: UserProfile; error?: string }> {
    const res = await fetch('/api/auth/register', {
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
  },

  async getMe(): Promise<UserMeResponse> {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getUsers(): Promise<{ users: UserProfile[] }> {
    const res = await fetch('/api/auth/users', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async createUser(user: { username: string; email: string; password: string; role: 'ADMIN' | 'USER' }) {
    const res = await fetch('/api/auth/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user)
    });
    return res.json();
  },

  async toggleUserStatus(id: string, status: 'active' | 'suspended') {
    const res = await fetch(`/api/auth/users/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async deleteUser(id: string) {
    const res = await fetch(`/api/auth/users/${id}`, {
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
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.port === '5173' ? 'localhost:4000' : window.location.host;
    const url = `${protocol}//${host}/ws`;

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
