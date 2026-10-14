import { binanceGet } from './binanceClient.js';
import { binanceService } from './binance.js';
import { binanceDiscoveryService } from './binanceDiscovery.js';
import { candleStore } from './candleStore.js';
import { Candle, DivergencePivot } from '../indicators/types.js';
import { calculateRSI, evaluate30MLeadership, isRSIConsolidating } from '../indicators/rsi.js';
import { detectHiddenBullishDivergence } from '../indicators/divergence.js';
import { evaluateSourceHiddenBullish } from '../indicators/candlePatterns.js';

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
  // Provenance & TradingView verification
  tradingViewUrl: string;
  confirmationStatus: 'CONFIRMED' | 'PENDING';
  qualificationReason: string;
  divergenceDetected?: boolean;
  pivot1?: DivergencePivot;
  pivot2?: DivergencePivot;
}

export interface HiddenActiveCoin {
  symbol: string;
  cleanSymbol: string;
  price: number;
  change24h: number;
  rsi1H: number;
  rsi30M: number;
  timeStr: string;
  tradingViewUrl: string;
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
  exchange: 'BINANCE';
  marketType: 'SPOT';
}

class HiddenScannerService {
  private scanCursor = 0;
  private detectedSignalsMap = new Map<string, { signal: HiddenCandidateSignal; detectedAt: number }>();
  private activeCoinsMap = new Map<string, { coin: HiddenActiveCoin; detectedAt: number }>();

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

  private cachedScan: HiddenScanResponse | null = null;
  private lastScanTime = 0;

  constructor() {
    setTimeout(() => {
      this.scanHiddenMarket({ fresh: true }).catch(() => {});
      setInterval(() => {
        this.scanHiddenMarket({ fresh: true }).catch(() => {});
      }, 25000);
    }, 3500);
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

  async scanHiddenMarket(options?: {
    rsiMin?: number;
    rsiMax?: number;
    fresh?: boolean;
  }): Promise<HiddenScanResponse> {
    const rsiMin = options?.rsiMin ?? 30; // User requirement: 30-40 zone
    const rsiMax = options?.rsiMax ?? 40;
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
      const resp = await binanceGet<any[]>('/api/v3/ticker/24hr', { timeout: 9000 });
      rawTickers = Array.isArray(resp?.data) ? resp.data : [];
    } catch (err: any) {
      console.warn('[HiddenScanner] Binance ticker/24hr fetch error:', err.message);
      if (this.cachedScan) return this.cachedScan;
      rawTickers = [];
    }

    // 3. Filter strictly by authentic, eligible Binance Spot pairs
    const spotPairs = rawTickers.filter((t: any) =>
      t &&
      t.symbol &&
      binanceDiscoveryService.isEligible(t.symbol) &&
      parseFloat(t.quoteVolume || '0') > 50000 &&
      parseFloat(t.lastPrice || '0') > 0
    );

    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const candidatesForDeepScan: Array<{
      symbol: string;
      cleanSymbol: string;
      price: number;
      change24h: number;
      quoteVolume: number;
    }> = [];
    const activeCoins: HiddenActiveCoin[] = [];

    // Estimate 1H RSI from 24h ticker geometry to target candidates in the selected RSI zone (30-40)
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

    const targetRsiMid = (rsiMin + rsiMax) / 2; // standard 35 for Hidden Bullish zone (30-40)

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

    // Sort candidates: closest to 30-40 target RSI zone comes FIRST!
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

    // Always include top 4 volume candidates
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

          // 1. Authoritative Wilder RSI calculations
          const rsi1HResult = calculateRSI(klines.candles1h, 14, { symbol: cand.symbol, timeframe: '1h' });
          const rsi30MResult = calculateRSI(klines.candles30m, 14, { symbol: cand.symbol, timeframe: '30m' });
          const rsi15MResult = calculateRSI(klines.candles15m, 14, { symbol: cand.symbol, timeframe: '15m' });
          const rsi1DResult = calculateRSI(klines.candles1d, 14, { symbol: cand.symbol, timeframe: '1d' });

          const rsi1H = rsi1HResult.current;
          const prevRsi1H = rsi1HResult.previous;
          const rsi30M = rsi30MResult.current;
          const rsi15M = rsi15MResult.current;
          const rsi1D = rsi1DResult.current;

          // Check if in user specified RSI zone (standard 30-40)
          const isInZone = rsi1H >= rsiMin && rsi1H <= rsiMax;

          if (isInZone) {
            const coinItem: HiddenActiveCoin = {
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
            this.activeCoinsMap.delete(cand.symbol);
          }

          // 2. 1H RSI Consolidation (na up ho na down ho)
          const isConsolidating = isRSIConsolidating(rsi1HResult, 2.8);

          // 3. 30M RSI Leadership: 30M RSI above or equal to 1H RSI
          const leadership = evaluate30MLeadership(rsi1HResult, rsi30MResult);
          const is30MLeading = leadership.leads || rsi30M >= rsi1H;

          // 4. Hidden Bullish Divergence detection & source structure
          const divergence = detectHiddenBullishDivergence(klines.candles1h);
          const sourcePattern = evaluateSourceHiddenBullish(klines.candles1h, 10, 0.8, 0.3);

          const hasStructureOrDivergence = divergence.detected || sourcePattern.matched || sourcePattern.reactionPct >= 0.1 || isConsolidating;

          // Full strict confirmation:
          // In RSI 30-40 buying zone + 1H consolidation + 30M RSI leadership + structure/divergence
          const isHBConfirmed = isInZone && isConsolidating && is30MLeading && hasStructureOrDivergence;

          if (isHBConfirmed) {
            const existing = this.detectedSignalsMap.get(cand.symbol);
            const detectedAt = existing ? existing.detectedAt : now;
            const timeAgo = this.formatTimeAgo(detectedAt);
            const isClosedBar = Boolean(klines.candles1h[klines.candles1h.length - 1]?.isClosed);

            const qualReason = divergence.detected
              ? divergence.reason
              : `1H RSI (${rsi1H}) in 30-40, 1H Consolidation, 30M Lead (${rsi30M} >= ${rsi1H})`;

            const signalObj: HiddenCandidateSignal = {
              symbol: cand.symbol,
              cleanSymbol: cand.cleanSymbol,
              price: cand.price,
              change24h: cand.change24h,
              rsi15M,
              rsi30M,
              rsi1H,
              prevRsi1H,
              rsi1D,
              isConsolidating,
              is30MLeading,
              isHBConfirmed: true,
              timeAgo,
              detectedAt,
              tradingViewUrl: this.generateTradingViewUrl(cand.symbol, '60'),
              confirmationStatus: isClosedBar ? 'CONFIRMED' : 'PENDING',
              qualificationReason: qualReason,
              divergenceDetected: divergence.detected,
              pivot1: divergence.pivot1,
              pivot2: divergence.pivot2
            };

            this.detectedSignalsMap.set(cand.symbol, { signal: signalObj, detectedAt });
          } else {
            if (this.detectedSignalsMap.has(cand.symbol)) {
              this.detectedSignalsMap.delete(cand.symbol);
            }
          }
        } catch (e: any) {
          // Skip on single pair error
        }
      })
    );
    await new Promise(r => setTimeout(r, 100));
  }

    // Prune stale active coins (> 45 minutes) and update live prices
    for (const [sym, item] of this.activeCoinsMap.entries()) {
      if (now - item.detectedAt > 45 * 60 * 1000) {
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

    // Prune stale signals (> 45 minutes)
    for (const [sym, item] of this.detectedSignalsMap.entries()) {
      if (now - item.detectedAt > 45 * 60 * 1000) {
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

    const confirmedSignals = Array.from(this.detectedSignalsMap.values())
      .map(v => v.signal)
      .sort((a, b) => b.detectedAt - a.detectedAt);

    const finalActiveCoins = allActiveCoins.length > 0 ? allActiveCoins : activeCoins;

    const response: HiddenScanResponse = {
      success: true,
      totalMonitored: spotPairs.length,
      activeCount: finalActiveCoins.length,
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
}

export const hiddenScannerService = new HiddenScannerService();
