import { binanceGet } from './binanceClient.js';
import { binanceService } from './binance.js';
import { binanceDiscoveryService } from './binanceDiscovery.js';
import { candleStore } from './candleStore.js';
import { Candle } from '../indicators/types.js';
import { calculateRSI, evaluate30MLeadership } from '../indicators/rsi.js';
import { calculateEMA } from '../indicators/ema.js';
import { calculateV1SmoothedHeikenAshi } from '../indicators/v1.js';
import { detectTrend } from '../indicators/trend.js';

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
  is15MAbove30M: boolean;
  isLadderAligned: boolean;
  isFullLadder: boolean;
  isV1Confirmed: boolean;
  timeAgo: string;
  detectedAt: number;
  // Provenance & TradingView verification
  tradingViewUrl: string;
  confirmationStatus: 'CONFIRMED' | 'PENDING';
  qualificationReason: string;
}

export interface V1ActiveCoin {
  symbol: string;
  cleanSymbol: string;
  price: number;
  change24h: number;
  rsi1H: number;
  rsi30M: number;
  timeStr: string;
  tradingViewUrl: string;
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
  exchange: 'BINANCE';
  marketType: 'SPOT';
}

class V1ScannerService {
  private scanCursor = 0;
  private detectedSignalsMap = new Map<string, { signal: V1CandidateSignal; detectedAt: number }>();
  private activeCoinsMap = new Map<string, { coin: V1ActiveCoin; detectedAt: number }>();

  // Cached Kline Data per symbol with TTL
  private klineCache = new Map<
    string,
    {
      candles15m: Candle[];
      candles30m: Candle[];
      candles1h: Candle[];
      candles1d: Candle[];
      fetchedAt: number;
    }
  >();

  private cachedScan: V1ScanResponse | null = null;
  private lastScanTime = 0;

  constructor() {
    // Background polling for fresh market data
    setTimeout(() => {
      this.scanV1Market({ fresh: true }).catch(() => {});
      setInterval(() => {
        this.scanV1Market({ fresh: true }).catch(() => {});
      }, 25000);
    }, 3000);
  }

  generateTradingViewUrl(symbol: string, interval: string = '60'): string {
    const formatted = symbol.toUpperCase().endsWith('USDT')
      ? symbol.toUpperCase()
      : `${symbol.toUpperCase()}USDT`;
    return `https://www.tradingview.com/chart/?symbol=BINANCE%3A${formatted}&interval=${interval}`;
  }

  async fetchKlinesForSymbol(symbol: string): Promise<{
    candles15m: Candle[];
    candles30m: Candle[];
    candles1h: Candle[];
    candles1d: Candle[];
  }> {
    const now = Date.now();
    const cached = this.klineCache.get(symbol);
    if (cached && now - cached.fetchedAt < 45000) {
      return cached;
    }

    try {
      const [k15, k30, k1h, k1d] = await Promise.all([
        binanceService.fetchKlines(symbol, '15m', 100),
        binanceService.fetchKlines(symbol, '30m', 100),
        binanceService.fetchKlines(symbol, '1h', 100),
        binanceService.fetchKlines(symbol, '1d', 100)
      ]);

      // Populate global candle store for cross-site consistency
      candleStore.setCandles(symbol, '15m', k15);
      candleStore.setCandles(symbol, '30m', k30);
      candleStore.setCandles(symbol, '1h', k1h);
      candleStore.setCandles(symbol, '1d', k1d);

      const result = {
        candles15m: k15,
        candles30m: k30,
        candles1h: k1h,
        candles1d: k1d,
        fetchedAt: now
      };
      this.klineCache.set(symbol, result);
      return result;
    } catch (err: any) {
      if (cached) return cached;
      return { candles15m: [], candles30m: [], candles1h: [], candles1d: [] };
    }
  }

  formatTimeAgo(detectedAt: number): string {
    const diffSec = Math.floor((Date.now() - detectedAt) / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}h ago`;
  }

  async scanV1Market(options?: {
    rsiMin?: number;
    rsiMax?: number;
    rsiLevel?: number;
    fresh?: boolean;
  }): Promise<V1ScanResponse> {
    const rsiMin = options?.rsiMin ?? (options?.rsiLevel ? options.rsiLevel - 4 : 50);
    const rsiMax = options?.rsiMax ?? 60;
    const fresh = options?.fresh ?? false;
    const now = Date.now();

    if (!fresh && this.cachedScan && now - this.lastScanTime < 15000 && this.cachedScan.rsiMin === rsiMin && this.cachedScan.rsiMax === rsiMax) {
      return this.cachedScan;
    }

    // 1. Ensure dynamic Binance symbol discovery is initialized
    await binanceDiscoveryService.refreshEligibleSymbols();

    // 2. Fetch live 24hr tickers from official Binance Spot API
    let rawTickers: any[] = [];
    try {
      const resp = await binanceGet<any[]>('/api/v3/ticker/24hr', { timeout: 18000 });
      rawTickers = Array.isArray(resp?.data) ? resp.data : [];
    } catch (err: any) {
      console.warn('[V1Scanner] Binance ticker/24hr fetch notice:', err.message);
      if (this.cachedScan && this.cachedScan.activeCoins && this.cachedScan.activeCoins.length > 0) {
        return this.cachedScan;
      }
      rawTickers = [];
    }

    // 3. Filter strictly by authentic, eligible Binance Spot pairs
    const spotPairs = rawTickers.filter((t: any) =>
      t &&
      t.symbol &&
      binanceDiscoveryService.isEligible(t.symbol) &&
      parseFloat(t.quoteVolume || '0') > 30000 &&
      parseFloat(t.lastPrice || '0') > 0
    );

    // If live tickers momentarily failed but we have a cached scan, retain it
    if (spotPairs.length === 0 && this.cachedScan && this.cachedScan.activeCoins && this.cachedScan.activeCoins.length > 0) {
      return this.cachedScan;
    }

    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const activeCoins: V1ActiveCoin[] = [];
    const candidatesForDeepScan: Array<{
      symbol: string;
      cleanSymbol: string;
      price: number;
      change24h: number;
      quoteVolume: number;
    }> = [];

    // Estimate 1H RSI from 24h ticker geometry to target candidates in the selected RSI zone
    const estimateRsi = (t: any): number => {
      const lastPrice = parseFloat(t.lastPrice || '0');
      const high = parseFloat(t.highPrice || '0');
      const low = parseFloat(t.lowPrice || '0');
      const change24h = parseFloat(t.priceChangePercent || '0');
      const range = high - low;
      const pos = range > 0 ? (lastPrice - low) / range : 0.5;
      const bonus = Math.max(-28, Math.min(28, change24h * 0.65));
      return Math.max(12, Math.min(94, 32 + pos * 36 + bonus));
    };

    const targetRsiMid = (rsiMin + rsiMax) / 2; // standard 55 for V1 zone (50-60)

    for (const t of spotPairs) {
      const clean = t.symbol.replace('USDT', '');
      const price = parseFloat(t.lastPrice);
      const change24h = parseFloat(t.priceChangePercent);
      const quoteVolume = parseFloat(t.quoteVolume || '0');
      const estRsi = estimateRsi(t);
      const dist = Math.abs(estRsi - targetRsiMid);

      candidatesForDeepScan.push({
        symbol: t.symbol,
        cleanSymbol: clean,
        price,
        change24h,
        quoteVolume,
        dist
      } as any);
    }

    // Sort candidates: closest to target RSI zone comes FIRST!
    candidatesForDeepScan.sort((a: any, b: any) => a.dist - b.dist);

    // Batch evaluation: rotate through candidates to respect rate limits
    const batchSize = 12;
    const totalCandidates = candidatesForDeepScan.length;
    const startIdx = totalCandidates > 0 ? this.scanCursor % totalCandidates : 0;
    this.scanCursor = (startIdx + batchSize) % (totalCandidates || 1);

    let deepCandidates = candidatesForDeepScan.slice(startIdx, startIdx + batchSize);
    if (deepCandidates.length < batchSize && totalCandidates > batchSize) {
      deepCandidates = deepCandidates.concat(candidatesForDeepScan.slice(0, batchSize - deepCandidates.length));
    }

    // Always include top 4 volume candidates (BTC, ETH, SOL, BNB)
    const topVolumeCandidates = [...candidatesForDeepScan].sort((a, b) => b.quoteVolume - a.quoteVolume).slice(0, 4);
    for (const topCand of topVolumeCandidates) {
      if (!deepCandidates.some(c => c.symbol === topCand.symbol)) {
        deepCandidates.push(topCand);
      }
    }

    // Evaluate candidates in paced chunks of 4 to prevent network queue congestion
    for (let i = 0; i < deepCandidates.length; i += 4) {
      const chunk = deepCandidates.slice(i, i + 4);
      await Promise.all(
        chunk.map(async (cand) => {
          try {
            const klines = await this.fetchKlinesForSymbol(cand.symbol);
            if (!klines.candles1h || klines.candles1h.length < 15) return;

            // 1. Authoritative Multi-Timeframe Wilder RSIs
            const rsi1HResult = calculateRSI(klines.candles1h, 14, { symbol: cand.symbol, timeframe: '1h' });
            const rsi30MResult = calculateRSI(klines.candles30m, 14, { symbol: cand.symbol, timeframe: '30m' });
            const rsi15MResult = calculateRSI(klines.candles15m, 14, { symbol: cand.symbol, timeframe: '15m' });
            const rsi1DResult = calculateRSI(klines.candles1d, 14, { symbol: cand.symbol, timeframe: '1d' });

            const rsi1H = rsi1HResult.current;
            const rsi30M = rsi30MResult.current;
            const rsi15M = rsi15MResult.current;
            const rsi1D = rsi1DResult.current;

          // 2. Trend detection
          const trend1DResult = detectTrend(klines.candles1d, 20);
          const trend1HResult = detectTrend(klines.candles1h, 20);

          const trend1H: 'Uptrend' | 'Downtrend' | 'Sideways' =
            trend1HResult.direction === 'UPTREND' ? 'Uptrend' : trend1HResult.direction === 'DOWNTREND' ? 'Downtrend' : 'Sideways';
          const trend1D: 'Uptrend' | 'Downtrend' | 'Sideways' =
            trend1DResult.direction === 'UPTREND' ? 'Uptrend' : trend1DResult.direction === 'DOWNTREND' ? 'Downtrend' : 'Sideways';

          // 3. Multi-timeframe RSI Leadership & Alignment
          const leadership = evaluate30MLeadership(rsi1HResult, rsi30MResult);
          const isLeadershipConfirmed = leadership.leads || rsi30M >= rsi1H;
          const is15MAbove30M = rsi15M >= rsi30M;
          const isLadderAligned = rsi15M >= (rsi30M - 0.5) && rsi30M >= (rsi1H - 0.5);
          const isFullLadder = rsi15M > rsi30M && rsi30M > rsi1H;

          // 4. V1 Indicator State
          const v1State = calculateV1SmoothedHeikenAshi(klines.candles1h);
          const isV1ColorOk = v1State.state === 'GREEN' || v1State.state === 'TRANSPARENT';

          // 5. RSI 1H in selected zone [rsiMin, rsiMax] (Standard 50-60)
          const isRsiInRange = rsi1H >= rsiMin && rsi1H <= rsiMax;

          // If in V1 active zone, add to active coins
          if (isRsiInRange) {
            const coinItem: V1ActiveCoin = {
              symbol: cand.symbol,
              cleanSymbol: cand.cleanSymbol,
              price: cand.price,
              change24h: cand.change24h,
              rsi1H,
              rsi30M,
              timeStr: nowTimeStr,
              tradingViewUrl: this.generateTradingViewUrl(cand.symbol, '60')
            };
            activeCoins.push(coinItem);
            this.activeCoinsMap.set(cand.symbol, { coin: coinItem, detectedAt: now });
          } else {
            // Update live price for existing active coin if present
            const existingActive = this.activeCoinsMap.get(cand.symbol);
            if (existingActive) {
              existingActive.coin.price = cand.price;
              existingActive.coin.change24h = cand.change24h;
            }
          }

          // 6. Strict V1 Confirmation:
          // - 1D Trend is Uptrend
          // - 1H Trend is Uptrend
          // - 1H RSI is in 50-60 range
          // - 30M RSI Leadership confirmed
          // - V1 State is GREEN or TRANSPARENT
          const isV1Confirmed = isRsiInRange && trend1D === 'Uptrend' && trend1H === 'Uptrend' && isLeadershipConfirmed && isV1ColorOk;

          if (isV1Confirmed) {
            const existing = this.detectedSignalsMap.get(cand.symbol);
            const detectedAt = existing ? existing.detectedAt : now;
            const timeAgo = this.formatTimeAgo(detectedAt);
            const isClosedBar = Boolean(klines.candles1h[klines.candles1h.length - 1]?.isClosed);

            const signalObj: V1CandidateSignal = {
              symbol: cand.symbol,
              cleanSymbol: cand.cleanSymbol,
              price: cand.price,
              change24h: cand.change24h,
              rsi15M,
              rsi30M,
              rsi1H,
              rsi1D,
              trend1H,
              trend1D,
              isLeadershipConfirmed,
              is15MAbove30M,
              isLadderAligned,
              isFullLadder,
              isV1Confirmed: true,
              timeAgo,
              detectedAt,
              tradingViewUrl: this.generateTradingViewUrl(cand.symbol, '60'),
              confirmationStatus: isClosedBar ? 'CONFIRMED' : 'PENDING',
              qualificationReason: `1D+1H Uptrend, 1H RSI (${rsi1H}) in 50-60, 30M RSI (${rsi30M}) Leading, V1 ${v1State.state}`
            };

            this.detectedSignalsMap.set(cand.symbol, { signal: signalObj, detectedAt });
          } else {
            // Retain previously detected signals and update their live price (do not discard valid setups)
            const existingSig = this.detectedSignalsMap.get(cand.symbol);
            if (existingSig) {
              existingSig.signal.price = cand.price;
              existingSig.signal.change24h = cand.change24h;
              existingSig.signal.timeAgo = this.formatTimeAgo(existingSig.detectedAt);
            }
          }
        } catch (e: any) {
          // Log and skip on error
        }
      })
    );
    await new Promise(r => setTimeout(r, 100));
  }

    // Prune stale active coins (> 90 minutes) and update live prices
    for (const [sym, item] of this.activeCoinsMap.entries()) {
      if (now - item.detectedAt > 90 * 60 * 1000) {
        this.activeCoinsMap.delete(sym);
      } else {
        const curTicker = spotPairs.find((t: any) => t.symbol === sym);
        if (curTicker) {
          item.coin.price = parseFloat(curTicker.lastPrice);
          item.coin.change24h = parseFloat(curTicker.priceChangePercent);
        }
      }
    }

    const allActiveCoins = Array.from(this.activeCoinsMap.values())
      .map(v => v.coin)
      .sort((a, b) => b.change24h - a.change24h);

    // Prune stale signals (> 90 minutes)
    for (const [sym, item] of this.detectedSignalsMap.entries()) {
      if (now - item.detectedAt > 90 * 60 * 1000) {
        this.detectedSignalsMap.delete(sym);
      } else {
        item.signal.timeAgo = this.formatTimeAgo(item.detectedAt);
        const curTicker = spotPairs.find((t: any) => t.symbol === sym);
        if (curTicker) {
          item.signal.price = parseFloat(curTicker.lastPrice);
          item.signal.change24h = parseFloat(curTicker.priceChangePercent);
        }
      }
    }

    // Sort signals by detection time descending
    const confirmedSignals = Array.from(this.detectedSignalsMap.values())
      .map(v => v.signal)
      .sort((a, b) => b.detectedAt - a.detectedAt);

    const finalActiveCoins = allActiveCoins.length > 0 ? allActiveCoins : activeCoins;

    const response: V1ScanResponse = {
      success: true,
      totalMonitored: spotPairs.length,
      v1ZoneCount: finalActiveCoins.length,
      activeCoins: finalActiveCoins,
      signals: confirmedSignals,
      timestamp: now,
      lastScanTimeStr: nowTimeStr,
      rsiMin,
      rsiMax,
      exchange: 'BINANCE',
      marketType: 'SPOT'
    };

    this.cachedScan = response;
    this.lastScanTime = now;

    return response;
  }

  getCachedScan(): V1ScanResponse | null {
    return this.cachedScan;
  }
}

export const v1ScannerService = new V1ScannerService();
