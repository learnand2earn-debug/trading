import { Candle } from '../indicators/types.js';
import { eventBus } from '../core/events.js';

export interface SymbolMarketData {
  symbol: string;
  candles15m: Candle[];
  candles30m: Candle[];
  candles1h: Candle[];
  candles4h?: Candle[];
  candles1d: Candle[];
  candles1w?: Candle[];
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
        candles4h: [],
        candles1d: [],
        candles1w: [],
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

  getCandles(symbol: string, timeframe: string): Candle[] {
    const data = this.get(symbol);
    if (!data) return [];
    const tf = timeframe.toLowerCase();
    if (tf === '15m') return data.candles15m || [];
    if (tf === '30m') return data.candles30m || [];
    if (tf === '1h') return data.candles1h || [];
    if (tf === '4h') return data.candles4h || [];
    if (tf === '1d') return data.candles1d || [];
    if (tf === '1w') return data.candles1w || [];
    return [];
  }

  setCandles(symbol: string, timeframe: string, candles: Candle[]) {
    const data = this.getOrCreate(symbol);
    if (!candles || candles.length === 0) return;
    const tf = timeframe.toLowerCase();

    // Deduplicate candles by openTime and sort chronologically
    const timeMap = new Map<number, Candle>();
    for (const c of candles) {
      timeMap.set(c.openTime, c);
    }
    const sorted = Array.from(timeMap.values()).sort((a, b) => a.openTime - b.openTime);
    const trimmed = sorted.length > 500 ? sorted.slice(-500) : sorted;

    if (tf === '15m') data.candles15m = trimmed;
    else if (tf === '30m') data.candles30m = trimmed;
    else if (tf === '1h') data.candles1h = trimmed;
    else if (tf === '4h') data.candles4h = trimmed;
    else if (tf === '1d') data.candles1d = trimmed;
    else if (tf === '1w') data.candles1w = trimmed;
    else return;

    const lastCandle = trimmed[trimmed.length - 1];
    if (lastCandle) {
      data.lastPrice = lastCandle.close;
      data.lastUpdated = Date.now();
    }
  }

  hasCandles(symbol: string, timeframe: string, minCount: number = 20): boolean {
    const candles = this.getCandles(symbol, timeframe);
    return Boolean(candles && candles.length >= minCount);
  }

  isFresh(symbol: string, maxAgeMs: number = 45000): boolean {
    const data = this.get(symbol);
    if (!data) return false;
    return (Date.now() - data.lastUpdated) < maxAgeMs;
  }

  updateCandle(symbol: string, timeframe: string, candle: Candle) {
    const data = this.getOrCreate(symbol);
    data.lastPrice = candle.close;
    data.lastUpdated = Date.now();

    const tf = timeframe.toLowerCase();
    let targetArray: Candle[] = [];
    if (tf === '15m') targetArray = data.candles15m;
    else if (tf === '30m') targetArray = data.candles30m;
    else if (tf === '1h') targetArray = data.candles1h;
    else if (tf === '4h') {
      if (!data.candles4h) data.candles4h = [];
      targetArray = data.candles4h;
    } else if (tf === '1d') targetArray = data.candles1d;
    else if (tf === '1w') {
      if (!data.candles1w) data.candles1w = [];
      targetArray = data.candles1w;
    } else return;

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
      targetArray.sort((a, b) => a.openTime - b.openTime);
      // Keep max 500 candles in memory per timeframe for authoritative Wilder RMA warm-up
      if (targetArray.length > 500) {
        targetArray.splice(0, targetArray.length - 500);
      }
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
