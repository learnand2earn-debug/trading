import { StrategySignalResult } from '../strategies/types.js';
import { getDb } from '../database/db.js';
import { eventBus } from '../core/events.js';

export interface RiskConfig {
  maxPositionSizeUSD: number;
  maxSimultaneousTrades: number;
  dailyLossLimitPct: number;
  cooldownMinutes: number;
  maxDataStalenessSeconds: number;
  allowMultipleStrategyEntriesOnSameCoin: boolean;
}

export const defaultRiskConfig: RiskConfig = {
  maxPositionSizeUSD: 500,
  maxSimultaneousTrades: 3,
  dailyLossLimitPct: 3.0,
  cooldownMinutes: 15,
  maxDataStalenessSeconds: 60,
  allowMultipleStrategyEntriesOnSameCoin: false
};

export interface RiskCheckReport {
  approved: boolean;
  checksPassed: string[];
  checksFailed: string[];
  reason: string;
  sourceLabel: 'ENGINEERING_RISK_DEFAULTS';
}

export class CentralRiskEngine {
  private config: RiskConfig = { ...defaultRiskConfig };
  private isEmergencyHalted: boolean = false;
  private isLiveTradingPaused: boolean = false;
  private currentMode: 'ANALYSIS' | 'PAPER' | 'LIVE' = 'ANALYSIS';
  private modeManuallySet: boolean = false;
  private cooldowns = new Map<string, number>(); // symbol -> cooldown expiry timestamp

  constructor() {
    this.initSettings();
  }

  private async initSettings() {
    try {
      const db = await getDb();
      const res = await db.query('SELECT key, value FROM system_settings');
      for (const row of res.rows) {
        const val = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
        if (row.key === 'RISK_MAX_POSITION_USD') this.config.maxPositionSizeUSD = Number(val.value);
        if (row.key === 'RISK_MAX_SIMULTANEOUS_TRADES') this.config.maxSimultaneousTrades = Number(val.value);
        if (row.key === 'RISK_DAILY_LOSS_LIMIT_PCT') this.config.dailyLossLimitPct = Number(val.value);
        if (row.key === 'RISK_COOLDOWN_MINUTES') this.config.cooldownMinutes = Number(val.value);
        if (row.key === 'EMERGENCY_KILL_SWITCH') this.isEmergencyHalted = Boolean(val.value);
        if (row.key === 'TRADING_MODE' && !this.modeManuallySet) this.currentMode = val.value;
      }
    } catch (e) {
      // fallback to memory defaults
    }
  }

  getTradingMode(): 'ANALYSIS' | 'PAPER' | 'LIVE' {
    return this.currentMode;
  }

  setTradingMode(mode: 'ANALYSIS' | 'PAPER' | 'LIVE') {
    this.currentMode = mode;
    this.modeManuallySet = true;
  }

  isEmergencyKillActive(): boolean {
    return this.isEmergencyHalted;
  }

  triggerEmergencyKillAllTrading(actor: string = 'admin'): void {
    this.isEmergencyHalted = true;
    console.warn(`[EMERGENCY] KILL ALL TRADING ACTIVATED BY ${actor}`);
    eventBus.publish('EMERGENCY_STOP', { actor, timestamp: Date.now() }, { source: 'RiskEngine' });
  }

  resetEmergencyHalt(): void {
    this.isEmergencyHalted = false;
    console.log('[EMERGENCY] Emergency halt cleared by admin.');
  }

  async validateSignal(
    signal: StrategySignalResult,
    dataAgeSeconds: number = 0,
    activePositionsCount: number = 0,
    hasExistingPositionOnCoin: boolean = false
  ): Promise<RiskCheckReport> {
    const checksPassed: string[] = [];
    const checksFailed: string[] = [];

    // 1. Emergency Kill Switch
    if (this.isEmergencyHalted) {
      checksFailed.push('EMERGENCY_KILL_SWITCH_ACTIVE: All trading is halted');
    } else {
      checksPassed.push('Emergency kill switch is inactive');
    }

    // 2. Trading Mode
    if (this.currentMode === 'ANALYSIS') {
      checksPassed.push('Analysis Mode: Signal logged, orders bypassed safely');
    } else if (this.currentMode === 'LIVE' && this.isLiveTradingPaused) {
      checksFailed.push('LIVE_TRADING_PAUSED: Live orders temporarily paused');
    } else {
      checksPassed.push(`Trading mode ${this.currentMode} active`);
    }

    // 3. Max Simultaneous Positions
    if (activePositionsCount >= this.config.maxSimultaneousTrades) {
      checksFailed.push(`MAX_POSITIONS_REACHED: Currently ${activePositionsCount} open (limit: ${this.config.maxSimultaneousTrades})`);
    } else {
      checksPassed.push(`Positions capacity available (${activePositionsCount}/${this.config.maxSimultaneousTrades})`);
    }

    // 4. Duplicate Position Protection (Master Opportunity guard)
    if (hasExistingPositionOnCoin && !this.config.allowMultipleStrategyEntriesOnSameCoin) {
      checksFailed.push(`DUPLICATE_POSITION_PREVENTED: Coin ${signal.symbol} already has active trade`);
    } else {
      checksPassed.push('Duplicate coin position check passed');
    }

    // 5. Data Freshness Guard
    if (dataAgeSeconds > this.config.maxDataStalenessSeconds) {
      checksFailed.push(`DATA_STALE: Data age ${dataAgeSeconds}s exceeds max allowed ${this.config.maxDataStalenessSeconds}s`);
    } else {
      checksPassed.push(`Data is fresh (${dataAgeSeconds}s)`);
    }

    // 6. Per-Symbol Cooldown Guard
    const cooldownExpiry = this.cooldowns.get(signal.symbol);
    if (cooldownExpiry && Date.now() < cooldownExpiry) {
      const remainingMin = Math.ceil((cooldownExpiry - Date.now()) / 60000);
      checksFailed.push(`SYMBOL_COOLDOWN_ACTIVE: ${signal.symbol} cooling down for ${remainingMin} more mins`);
    } else {
      checksPassed.push('Symbol cooldown check passed');
    }

    const approved = checksFailed.length === 0;
    const reason = approved
      ? 'All engineering risk parameters passed'
      : `Risk rejection: ${checksFailed.join('; ')}`;

    return {
      approved,
      checksPassed,
      checksFailed,
      reason,
      sourceLabel: 'ENGINEERING_RISK_DEFAULTS'
    };
  }

  setSymbolCooldown(symbol: string) {
    const expiry = Date.now() + this.config.cooldownMinutes * 60000;
    this.cooldowns.set(symbol, expiry);
  }

  getConfig(): RiskConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<RiskConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

export const riskEngine = new CentralRiskEngine();
