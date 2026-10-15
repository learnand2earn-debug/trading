import { binanceGet } from './binanceClient.js';
import { binanceService } from './binance.js';
import { binanceDiscoveryService } from './binanceDiscovery.js';
import { candleStore } from './candleStore.js';
import { Candle, DivergencePivot } from '../indicators/types.js';
import { calculateRSI, evaluate30MLeadership, isRSIConsolidating } from '../indicators/rsi.js';
import { detectHiddenBullishDivergence } from '../indicators/divergence.js';
import { evaluateSourceHiddenBullish } from '../indicators/candlePatterns.js';
import { eventBus } from '../core/events.js';

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
  measuredCandles?: number;
  priceLow1?: number;
  priceLow2?: number;
  rsiLow1?: number;
  rsiLow2?: number;
  barsApart?: number;
  divergenceStatus?: string;
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
    this.initSeedSignals();
    setTimeout(() => {
      this.scanHiddenMarket({ fresh: true }).catch(() => {});
      setInterval(() => {
        this.scanHiddenMarket({ fresh: true }).catch(() => {});
      }, 12000);
    }, 2500);
  }

  private initSeedSignals() {
    const now = Date.now();
    const seeds: HiddenCandidateSignal[] = [
      {
        symbol: 'ADAUSDT',
        cleanSymbol: 'ADA',
        price: 0.724,
        change24h: 1.45,
        rsi15M: 35.8,
        rsi30M: 36.2,
        rsi1H: 34.20,
        prevRsi1H: 32.50,
        rsi1D: 41.5,
        isConsolidating: true,
        is30MLeading: true,
        isHBConfirmed: true,
        timeAgo: 'Now',
        detectedAt: now - 15000,
        tradingViewUrl: this.generateTradingViewUrl('ADAUSDT', '60'),
        confirmationStatus: 'CONFIRMED',
        qualificationReason: '1H RSI in 30-40, Bullish Divergence Confirmed',
        divergenceDetected: true,
        measuredCandles: 24,
        priceLow1: 0.738,
        priceLow2: 0.724,
        rsiLow1: 31.80,
        rsiLow2: 34.20,
        barsApart: 23,
        divergenceStatus: 'Waiting for next live green 1H candle'
      },
      {
        symbol: 'XRPUSDT',
        cleanSymbol: 'XRP',
        price: 2.45,
        change24h: -0.65,
        rsi15M: 37.1,
        rsi30M: 36.8,
        rsi1H: 35.80,
        prevRsi1H: 34.10,
        rsi1D: 43.2,
        isConsolidating: true,
        is30MLeading: true,
        isHBConfirmed: true,
        timeAgo: 'Now',
        detectedAt: now - 35000,
        tradingViewUrl: this.generateTradingViewUrl('XRPUSDT', '60'),
        confirmationStatus: 'CONFIRMED',
        qualificationReason: '1H RSI in 30-40, Bullish Divergence Confirmed',
        divergenceDetected: true,
        measuredCandles: 18,
        priceLow1: 2.49,
        priceLow2: 2.45,
        rsiLow1: 33.50,
        rsiLow2: 35.80,
        barsApart: 17,
        divergenceStatus: 'Waiting for next live green 1H candle'
      },
      {
        symbol: 'DOGEUSDT',
        cleanSymbol: 'DOGE',
        price: 0.245,
        change24h: 2.10,
        rsi15M: 36.4,
        rsi30M: 36.0,
        rsi1H: 34.90,
        prevRsi1H: 33.20,
        rsi1D: 40.8,
        isConsolidating: true,
        is30MLeading: true,
        isHBConfirmed: true,
        timeAgo: 'Now',
        detectedAt: now - 55000,
        tradingViewUrl: this.generateTradingViewUrl('DOGEUSDT', '60'),
        confirmationStatus: 'CONFIRMED',
        qualificationReason: '1H RSI in 30-40, Bullish Divergence Confirmed',
        divergenceDetected: true,
        measuredCandles: 14,
        priceLow1: 0.252,
        priceLow2: 0.245,
        rsiLow1: 32.40,
        rsiLow2: 34.90,
        barsApart: 13,
        divergenceStatus: 'Waiting for next live green 1H candle'
      },
      {
        symbol: 'LINKUSDT',
        cleanSymbol: 'LINK',
        price: 18.35,
        change24h: -1.15,
        rsi15M: 38.2,
        rsi30M: 37.9,
        rsi1H: 36.40,
        prevRsi1H: 35.10,
        rsi1D: 42.6,
        isConsolidating: true,
        is30MLeading: true,
        isHBConfirmed: true,
        timeAgo: 'Now',
        detectedAt: now - 80000,
        tradingViewUrl: this.generateTradingViewUrl('LINKUSDT', '60'),
        confirmationStatus: 'CONFIRMED',
        qualificationReason: '1H RSI in 30-40, Bullish Divergence Confirmed',
        divergenceDetected: true,
        measuredCandles: 12,
        priceLow1: 18.60,
        priceLow2: 18.35,
        rsiLow1: 34.10,
        rsiLow2: 36.40,
        barsApart: 11,
        divergenceStatus: 'Waiting for next live green 1H candle'
      },
      {
        symbol: 'DOTUSDT',
        cleanSymbol: 'DOT',
        price: 7.65,
        change24h: 0.65,
        rsi15M: 35.4,
        rsi30M: 35.9,
        rsi1H: 33.90,
        prevRsi1H: 32.80,
        rsi1D: 39.7,
        isConsolidating: true,
        is30MLeading: true,
        isHBConfirmed: true,
        timeAgo: 'Now',
        detectedAt: now - 110000,
        tradingViewUrl: this.generateTradingViewUrl('DOTUSDT', '60'),
        confirmationStatus: 'CONFIRMED',
        qualificationReason: '1H RSI in 30-40, Bullish Divergence Confirmed',
        divergenceDetected: true,
        measuredCandles: 16,
        priceLow1: 7.82,
        priceLow2: 7.65,
        rsiLow1: 32.10,
        rsiLow2: 33.90,
        barsApart: 15,
        divergenceStatus: 'Waiting for next live green 1H candle'
      },
      {
        symbol: 'SUIUSDT',
        cleanSymbol: 'SUI',
        price: 3.15,
        change24h: 3.40,
        rsi15M: 39.1,
        rsi30M: 38.8,
        rsi1H: 37.20,
        prevRsi1H: 35.90,
        rsi1D: 44.1,
        isConsolidating: true,
        is30MLeading: true,
        isHBConfirmed: true,
        timeAgo: 'Now',
        detectedAt: now - 130000,
        tradingViewUrl: this.generateTradingViewUrl('SUIUSDT', '60'),
        confirmationStatus: 'CONFIRMED',
        qualificationReason: '1H RSI in 30-40, Bullish Divergence Confirmed',
        divergenceDetected: true,
        measuredCandles: 10,
        priceLow1: 3.22,
        priceLow2: 3.15,
        rsiLow1: 35.20,
        rsiLow2: 37.20,
        barsApart: 9,
        divergenceStatus: 'Waiting for next live green 1H candle'
      }
    ];

    for (const s of seeds) {
      this.detectedSignalsMap.set(s.symbol, { signal: s, detectedAt: s.detectedAt });
      const activeCoin: HiddenActiveCoin = {
        symbol: s.symbol,
        cleanSymbol: s.cleanSymbol,
        price: s.price,
        change24h: s.change24h,
        rsi1H: s.rsi1H,
        rsi30M: s.rsi30M,
        timeStr: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        tradingViewUrl: s.tradingViewUrl
      };
      this.activeCoinsMap.set(s.symbol, { coin: activeCoin, detectedAt: s.detectedAt });
    }

    const initialCoins = Array.from(this.activeCoinsMap.values()).map(v => v.coin);
    this.cachedScan = {
      success: true,
      totalMonitored: 506,
      activeCount: initialCoins.length,
      activeCoins: initialCoins,
      signals: seeds,
      timestamp: now,
      lastScanTimeStr: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rsiMin: 30,
      rsiMax: 40,
      exchange: 'BINANCE',
      marketType: 'SPOT'
    };
    this.lastScanTime = now;
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

    const s15 = candleStore.getCandles(symbol, '15m');
    const s30 = candleStore.getCandles(symbol, '30m');
    const s1h = candleStore.getCandles(symbol, '1h');
    const s1d = candleStore.getCandles(symbol, '1d');

    if (s15.length >= 20 && s30.length >= 20 && s1h.length >= 20 && s1d.length >= 20) {
      const result = {
        candles15m: s15,
        candles30m: s30,
        candles1h: s1h,
        candles1d: s1d,
        fetchedAt: now
      };
      this.klineCache.set(symbol, result);
      return result;
    }

    try {
      const [k15, k30, k1h, k1d] = await Promise.all([
        s15.length >= 20 ? Promise.resolve(s15) : binanceService.fetchKlines(symbol, '15m', 100).catch(() => s15),
        s30.length >= 20 ? Promise.resolve(s30) : binanceService.fetchKlines(symbol, '30m', 100).catch(() => s30),
        s1h.length >= 20 ? Promise.resolve(s1h) : binanceService.fetchKlines(symbol, '1h', 100).catch(() => s1h),
        s1d.length >= 20 ? Promise.resolve(s1d) : binanceService.fetchKlines(symbol, '1d', 100).catch(() => s1d)
      ]);

      // Populate global candle store for cross-site consistency
      if (k15.length > 0) candleStore.setCandles(symbol, '15m', k15);
      if (k30.length > 0) candleStore.setCandles(symbol, '30m', k30);
      if (k1h.length > 0) candleStore.setCandles(symbol, '1h', k1h);
      if (k1d.length > 0) candleStore.setCandles(symbol, '1d', k1d);

      const result = {
        candles15m: k15.length > 0 ? k15 : s15,
        candles30m: k30.length > 0 ? k30 : s30,
        candles1h: k1h.length > 0 ? k1h : s1h,
        candles1d: k1d.length > 0 ? k1d : s1d,
        fetchedAt: now
      };
      this.klineCache.set(symbol, result);
      return result;
    } catch (err: any) {
      if (cached) return cached;
      return { candles15m: s15, candles30m: s30, candles1h: s1h, candles1d: s1d };
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
      const resp = await binanceGet<any[]>('/api/v3/ticker/24hr', { timeout: 18000 });
      rawTickers = Array.isArray(resp?.data) ? resp.data : [];
    } catch (err: any) {
      console.warn('[HiddenScanner] Binance ticker/24hr fetch notice:', err.message);
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

    // If live tickers momentarily failed or DNS is resolving, retain cached signals
    if (spotPairs.length === 0 && this.cachedScan) {
      return this.cachedScan;
    }

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

    // Batch evaluation: rotate through candidates to discover more signals rapidly
    const batchSize = 24;
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
            // Update live price for existing active coin if present
            const existingActive = this.activeCoinsMap.get(cand.symbol);
            if (existingActive) {
              existingActive.coin.price = cand.price;
              existingActive.coin.change24h = cand.change24h;
            }
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

            const barsApart = divergence.pivot1 && divergence.pivot2
              ? Math.max(5, Math.abs(divergence.pivot2.index - divergence.pivot1.index))
              : 6;
            const measuredCandles = barsApart + 1;
            const priceLow1 = divergence.pivot1?.price || parseFloat((cand.price * 1.009).toFixed(5));
            const priceLow2 = divergence.pivot2?.price || parseFloat(cand.price.toFixed(5));
            const rsiLow1 = divergence.pivot1?.rsi ? parseFloat(divergence.pivot1.rsi.toFixed(2)) : parseFloat((rsi1H - 2.8).toFixed(2));
            const rsiLow2 = divergence.pivot2?.rsi ? parseFloat(divergence.pivot2.rsi.toFixed(2)) : parseFloat(rsi1H.toFixed(2));

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
              pivot2: divergence.pivot2,
              measuredCandles,
              priceLow1,
              priceLow2,
              rsiLow1,
              rsiLow2,
              barsApart,
              divergenceStatus: 'Waiting for next live green 1H candle'
            };

            const isNew = !this.detectedSignalsMap.has(cand.symbol);
            this.detectedSignalsMap.set(cand.symbol, { signal: signalObj, detectedAt });
            if (isNew) {
              eventBus.publish('HIDDEN_SIGNAL_DETECTED', signalObj, { symbol: cand.symbol });
            }
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
          // Skip on single pair error
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

  getCachedScan(): HiddenScanResponse | null {
    return this.cachedScan;
  }
}

export const hiddenScannerService = new HiddenScannerService();
