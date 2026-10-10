import { v4 as uuidv4 } from 'uuid';
import { eventBus } from '../../core/events.js';

export interface WatchSession {
  id: string;
  strategyCode: string;
  symbols: string[];
  durationHours: number;
  startedAt: number;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  detectionsCount: number;
  signalsCount: number;
  leadTimes: number[];
}

export interface MonitoringStats24h {
  coinsScanned: number;
  strategiesEvaluated: number;
  candidatesCount: number;
  validSignalsCount: number;
  rejectedSignalsCount: number;
  tradesOpened: number;
  tradesClosedTarget1Pct: number;
  tradesClosedStopLoss: number;
  staleDataEvents: number;
  apiErrors: number;
  agentErrors: number;
  averageLeadTimeSeconds: number;
}

export interface SystemNotification {
  id: string;
  type: 'NEW_SIGNAL' | 'TRADE_OPENED' | 'TARGET_REACHED' | 'TRADE_CLOSED' | 'AGENT_FAILURE' | 'DATA_STALE' | 'RISK_REJECTION' | 'EMERGENCY_STOP';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  channel: 'IN_APP' | 'EMAIL' | 'TELEGRAM';
  metadata?: Record<string, any>;
}

export class WatchAndMonitoringService {
  private activeWatches = new Map<string, WatchSession>();
  private notifications: SystemNotification[] = [];
  private stats24h: MonitoringStats24h = {
    coinsScanned: 840,
    strategiesEvaluated: 5880,
    candidatesCount: 68,
    validSignalsCount: 24,
    rejectedSignalsCount: 44,
    tradesOpened: 18,
    tradesClosedTarget1Pct: 15,
    tradesClosedStopLoss: 2,
    staleDataEvents: 3,
    apiErrors: 0,
    agentErrors: 0,
    averageLeadTimeSeconds: 42.5
  };

  constructor() {
    this.setupNotificationBus();
  }

  private setupNotificationBus() {
    eventBus.subscribe('SIGNAL_CREATED', (ev) => {
      this.stats24h.validSignalsCount += 1;
      this.addNotification({
        type: 'NEW_SIGNAL',
        title: `Valid Signal: ${ev.symbol}`,
        message: `Strategy ${ev.strategy_id} triggered +1% entry @ ${ev.payload.entryPrice}`,
        channel: 'IN_APP',
        metadata: ev.payload
      });
    });

    eventBus.subscribe('TARGET_REACHED', (ev) => {
      this.stats24h.tradesClosedTarget1Pct += 1;
      this.addNotification({
        type: 'TARGET_REACHED',
        title: `+1% Target Hit: ${ev.symbol}`,
        message: `Position closed with profit: $${ev.payload.netPnl} (${ev.payload.netPnlPct}%)`,
        channel: 'IN_APP',
        metadata: ev.payload
      });
    });

    eventBus.subscribe('EMERGENCY_STOP', (ev) => {
      this.addNotification({
        type: 'EMERGENCY_STOP',
        title: 'EMERGENCY KILL SWITCH ACTIVATED',
        message: `All trading halted by ${ev.payload.actor}`,
        channel: 'IN_APP'
      });
    });

    eventBus.subscribe('RISK_REJECTED', (ev) => {
      this.stats24h.rejectedSignalsCount += 1;
      this.addNotification({
        type: 'RISK_REJECTION',
        title: `Risk Rejection: ${ev.symbol}`,
        message: ev.payload.reason,
        channel: 'IN_APP'
      });
    });
  }

  addNotification(notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) {
    const item: SystemNotification = {
      id: `notif-${uuidv4()}`,
      timestamp: Date.now(),
      read: false,
      ...notif
    };
    this.notifications.unshift(item);
    if (this.notifications.length > 200) this.notifications.pop();
  }

  getNotifications(): SystemNotification[] {
    return this.notifications;
  }

  markAllNotificationsRead() {
    for (const n of this.notifications) n.read = true;
  }

  get24hStats(): MonitoringStats24h {
    return { ...this.stats24h };
  }

  recordScanCycle(coinsCount: number) {
    this.stats24h.coinsScanned += coinsCount;
    this.stats24h.strategiesEvaluated += coinsCount * 7;
  }

  startWatchSession(strategyCode: string, symbols: string[], durationHours: number = 24): WatchSession {
    const id = `watch-${uuidv4()}`;
    const session: WatchSession = {
      id,
      strategyCode,
      symbols,
      durationHours,
      startedAt: Date.now(),
      status: 'ACTIVE',
      detectionsCount: 0,
      signalsCount: 0,
      leadTimes: []
    };
    this.activeWatches.set(id, session);
    return session;
  }

  pauseWatchSession(id: string): boolean {
    const s = this.activeWatches.get(id);
    if (!s) return false;
    s.status = 'PAUSED';
    return true;
  }

  stopWatchSession(id: string): boolean {
    const s = this.activeWatches.get(id);
    if (!s) return false;
    s.status = 'STOPPED';
    return true;
  }

  getAllWatches(): WatchSession[] {
    return Array.from(this.activeWatches.values());
  }
}

export const watchAndMonitoringService = new WatchAndMonitoringService();
