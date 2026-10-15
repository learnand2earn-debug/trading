import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export type EventType =
  | 'MARKET_UPDATE'
  | 'CANDLE_OPEN'
  | 'CANDLE_UPDATED'
  | 'CANDLE_CLOSED'
  | 'TREND_DETECTED'
  | 'RSI_UPDATED'
  | 'EMA_CROSS'
  | 'LIQUIDITY_UPDATED'
  | 'OB_DETECTED'
  | 'STRATEGY_MATCH'
  | 'SIGNAL_CREATED'
  | 'RISK_APPROVED'
  | 'RISK_REJECTED'
  | 'ORDER_CREATED'
  | 'ORDER_FILLED'
  | 'POSITION_UPDATED'
  | 'TARGET_REACHED'
  | 'TRADE_CLOSED'
  | 'ERROR'
  | 'DATA_STALE'
  | 'EMERGENCY_STOP'
  | 'V1_SIGNAL_DETECTED'
  | 'HIDDEN_SIGNAL_DETECTED';

export interface SystemEvent<T = any> {
  event_id: string;
  event_type: EventType;
  agent_id?: string;
  symbol?: string;
  timeframe?: string;
  timestamp: number;
  correlation_id?: string;
  strategy_id?: string;
  payload: T;
  data_version?: string;
  source: string;
  confidence_or_status?: string;
  expiry?: number;
}

class SystemEventBus extends EventEmitter {
  private history: SystemEvent[] = [];
  private readonly maxHistory = 500;

  publish<T>(
    type: EventType,
    payload: T,
    metadata?: Partial<Omit<SystemEvent<T>, 'event_id' | 'event_type' | 'timestamp' | 'payload'>>
  ): SystemEvent<T> {
    const event: SystemEvent<T> = {
      event_id: uuidv4(),
      event_type: type,
      timestamp: Date.now(),
      source: metadata?.source || 'system',
      payload,
      ...metadata
    };

    this.history.unshift(event);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    this.emit(type, event);
    this.emit('*', event);
    return event;
  }

  subscribe<T = any>(type: EventType | '*', handler: (event: SystemEvent<T>) => void): void {
    this.on(type, handler);
  }

  unsubscribe<T = any>(type: EventType | '*', handler: (event: SystemEvent<T>) => void): void {
    this.off(type, handler);
  }

  getRecentEvents(limit: number = 50): SystemEvent[] {
    return this.history.slice(0, limit);
  }
}

export const eventBus = new SystemEventBus();
