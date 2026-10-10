import { Candle } from '../indicators/types.js';
import { calculateRSI } from '../indicators/rsi.js';
import { evaluateEMA9EMA33 } from '../indicators/ema.js';
import { calculateV1SmoothedHeikenAshi } from '../indicators/v1.js';
import { detectTrend } from '../indicators/trend.js';

export interface ReplayState {
  sessionId: string;
  symbol: string;
  timeframe: string;
  currentIndex: number;
  totalCandles: number;
  status: 'PLAYING' | 'PAUSED' | 'FINISHED';
  currentCandle?: Candle;
  visibleCandles: Candle[];
  indicators: {
    rsi14: number;
    ema9: number;
    ema33: number;
    v1State: string;
    trend: string;
  };
}

export class ReplaySession {
  private allCandles: Candle[] = [];
  private currentIndex: number = 35;
  private status: 'PLAYING' | 'PAUSED' | 'FINISHED' = 'PAUSED';

  constructor(
    public readonly sessionId: string,
    public readonly symbol: string,
    public readonly timeframe: string,
    candles: Candle[]
  ) {
    this.allCandles = candles;
    this.currentIndex = Math.min(35, candles.length - 1);
  }

  getState(): ReplayState {
    const visible = this.allCandles.slice(0, this.currentIndex + 1);
    const curr = visible[visible.length - 1];

    const rsi = calculateRSI(visible, 14);
    const ema = evaluateEMA9EMA33(visible);
    const v1 = calculateV1SmoothedHeikenAshi(visible);
    const trend = detectTrend(visible, 20);

    return {
      sessionId: this.sessionId,
      symbol: this.symbol,
      timeframe: this.timeframe,
      currentIndex: this.currentIndex,
      totalCandles: this.allCandles.length,
      status: this.status,
      currentCandle: curr,
      visibleCandles: visible.slice(-100), // return last 100 visible for chart rendering
      indicators: {
        rsi14: rsi.current,
        ema9: ema.ema9,
        ema33: ema.ema33,
        v1State: v1.state,
        trend: trend.direction
      }
    };
  }

  nextCandle(): ReplayState {
    if (this.currentIndex < this.allCandles.length - 1) {
      this.currentIndex += 1;
    } else {
      this.status = 'FINISHED';
    }
    return this.getState();
  }

  fastForward(steps: number = 5): ReplayState {
    this.currentIndex = Math.min(this.allCandles.length - 1, this.currentIndex + steps);
    if (this.currentIndex >= this.allCandles.length - 1) {
      this.status = 'FINISHED';
    }
    return this.getState();
  }

  reset(): ReplayState {
    this.currentIndex = Math.min(35, this.allCandles.length - 1);
    this.status = 'PAUSED';
    return this.getState();
  }

  play(): ReplayState {
    this.status = 'PLAYING';
    return this.getState();
  }

  pause(): ReplayState {
    this.status = 'PAUSED';
    return this.getState();
  }
}

export const activeReplaySessions = new Map<string, ReplaySession>();
