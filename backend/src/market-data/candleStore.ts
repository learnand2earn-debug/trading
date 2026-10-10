import { Candle } from '../indicators/types.js';
import { eventBus } from '../core/events.js';

export interface SymbolMarketData {
  symbol: string;
  candles15m: Candle[];
  candles30m: Candle[];
  candles1h: Candle[];
  candles1d: Candle[];
  lastPrice: number;
  priceChange24h: number;
  lastUpdated: number;
  detectionTimestamps: Map<string, number>; // strategyCode -> timestamp when setup first observed
}

export class CandleStore {
  private store = new Map<string, SymbolMarketData>();

  getOrCreate(symbol: string): SymbolMarketData {
    let data = this.store.get(symbol);
    if (!data) {
      data = {
        symbol,
        candles15m: [],
        candles30m: [],
        candles1h: [],
        candles1d: [],
        lastPrice: 0,
        priceChange24h: 0,
        lastUpdated: Date.now(),
        detectionTimestamps: new Map()
      };
      this.store.set(symbol, data);
    }
    return data;
  }

  get(symbol: string): SymbolMarketData | undefined {
    return this.store.get(symbol);
  }

  getAllSymbols(): string[] {
    return Array.from(this.store.keys());
  }

  updateCandle(symbol: string, timeframe: string, candle: Candle) {
    const data = this.getOrCreate(symbol);
    data.lastPrice = candle.close;
    data.lastUpdated = Date.now();

    let targetArray: Candle[] = [];
    if (timeframe === '15m') targetArray = data.candles15m;
    else if (timeframe === '30m') targetArray = data.candles30m;
    else if (timeframe === '1h') targetArray = data.candles1h;
    else if (timeframe === '1d') targetArray = data.candles1d;
    else return;

    const existingIdx = targetArray.findIndex(c => c.openTime === candle.openTime);

    if (existingIdx >= 0) {
      targetArray[existingIdx] = candle;
      if (candle.isClosed) {
        eventBus.publish('CANDLE_CLOSED', { symbol, timeframe, candle }, { symbol, timeframe });
      } else {
        eventBus.publish('CANDLE_UPDATED', { symbol, timeframe, candle }, { symbol, timeframe });
      }
    } else {
      targetArray.push(candle);
      // Keep max 200 candles in memory per timeframe
      if (targetArray.length > 200) targetArray.shift();
      eventBus.publish('CANDLE_OPEN', { symbol, timeframe, candle }, { symbol, timeframe });
    }
  }

  recordEarlyDetection(symbol: string, strategyCode: string) {
    const data = this.getOrCreate(symbol);
    if (!data.detectionTimestamps.has(strategyCode)) {
      data.detectionTimestamps.set(strategyCode, Date.now());
    }
  }

  getLeadTimeSeconds(symbol: string, strategyCode: string): number {
    const data = this.store.get(symbol);
    if (!data || !data.detectionTimestamps.has(strategyCode)) {
      return 0;
    }
    const detectedAt = data.detectionTimestamps.get(strategyCode)!;
    const now = Date.now();
    const leadTime = Math.max(0, Math.round((now - detectedAt) / 1000));
    return leadTime;
  }

  set24hStats(symbol: string, lastPrice: number, change24h: number) {
    const data = this.getOrCreate(symbol);
    data.lastPrice = lastPrice;
    data.priceChange24h = change24h;
    data.lastUpdated = Date.now();
  }
}

export const candleStore = new CandleStore();
