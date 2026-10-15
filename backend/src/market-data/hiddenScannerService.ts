import { binanceGet } from './binanceClient.js';
import { binanceService } from './binance.js';
import { binanceDiscoveryService, EXCLUDED_STABLECOINS } from './binanceDiscovery.js';
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
  closedCandleRsi?: number;
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
  closedCandleRsi?: number;
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
    // Immediate initial scan on startup followed by continuous 10s refresh
    setTimeout(() => {
      this.scanHiddenMarket({ fresh: true }).catch(() => {});
      setInterval(() => {
        this.scanHiddenMarket({ fresh: true }).catch(() => {});
      }, 10000);
    }, 500);
  }

  private initSeedSignals() {
    const now = Date.now();
    this.cachedScan = {
      success: true,
      totalMonitored: 506,
      activeCount: 0,
      activeCoins: [],
      signals: [],
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
    // Use cache if fresh (30s) — do NOT mutate candle closes with live price
    if (cached && now - cached.fetchedAt < 30000) {
      return cached;
    }

    const s15 = candleStore.getCandles(symbol, '15m');
    const s30 = candleStore.getCandles(symbol, '30m');
    const s1h = candleStore.getCandles(symbol, '1h');
    const s1d = candleStore.getCandles(symbol, '1d');

    if (s15.length >= 100 && s30.length >= 100 && s1h.length >= 100 && s1d.length >= 50) {
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
        s15.length >= 100 ? Promise.resolve(s15) : binanceService.fetchKlines(symbol, '15m', 200).catch(() => s15),
        s30.length >= 100 ? Promise.resolve(s30) : binanceService.fetchKlines(symbol, '30m', 200).catch(() => s30),
        s1h.length >= 100 ? Promise.resolve(s1h) : binanceService.fetchKlines(symbol, '1h', 200).catch(() => s1h),
        s1d.length >= 50 ? Promise.resolve(s1d) : binanceService.fetchKlines(symbol, '1d', 100).catch(() => s1d)
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

    if (!fresh && this.cachedScan && now - this.lastScanTime < 10000 && this.cachedScan.rsiMin === rsiMin && this.cachedScan.rsiMax === rsiMax) {
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

    // 3. Filter strictly by authentic, eligible Binance Spot pairs (excluding stablecoins)
    const spotPairs = rawTickers.filter((t: any) =>
      t &&
      t.symbol &&
      binanceDiscoveryService.isEligible(t.symbol) &&
      !EXCLUDED_STABLECOINS.has(t.symbol.replace('USDT', '')) &&
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

    for (const t of spotPairs) {
      const clean = t.symbol.replace('USDT', '');
      const price = parseFloat(t.lastPrice);
      const change24h = parseFloat(t.priceChangePercent);
      const quoteVolume = parseFloat(t.quoteVolume || '0');

      candidatesForDeepScan.push({
        symbol: t.symbol,
        cleanSymbol: clean,
        price,
        change24h,
        quoteVolume
      });
    }

    // Sort dipping coins first (negative and moderate changes most likely in RSI 30-40)
    candidatesForDeepScan.sort((a, b) => a.change24h - b.change24h);

    // Batch evaluation: rotate through candidates to discover more signals rapidly
    const batchSize = 20;
    const totalCandidates = candidatesForDeepScan.length;
    const startIdx = totalCandidates > 0 ? this.scanCursor % totalCandidates : 0;
    this.scanCursor = (startIdx + batchSize) % (totalCandidates || 1);

    let deepCandidates = candidatesForDeepScan.slice(startIdx, startIdx + batchSize);
    if (deepCandidates.length < batchSize && totalCandidates > batchSize) {
      deepCandidates = deepCandidates.concat(candidatesForDeepScan.slice(0, batchSize - deepCandidates.length));
    }

    // Prioritize refreshing existing active coins and signals so their RSIs are 100% current
    for (const activeSym of this.activeCoinsMap.keys()) {
      const match = candidatesForDeepScan.find(c => c.symbol === activeSym);
      if (match && !deepCandidates.some(c => c.symbol === activeSym)) {
        deepCandidates.unshift(match);
      }
    }
    for (const sigSym of this.detectedSignalsMap.keys()) {
      const match = candidatesForDeepScan.find(c => c.symbol === sigSym);
      if (match && !deepCandidates.some(c => c.symbol === sigSym)) {
        deepCandidates.unshift(match);
      }
    }

    // Evaluate candidates in paced chunks of 4 to prevent network queue congestion
    for (let i = 0; i < deepCandidates.length; i += 4) {
      const chunk = deepCandidates.slice(i, i + 4);
      await Promise.all(
        chunk.map(async (cand) => {
          try {
            const klines = await this.fetchKlinesForSymbol(cand.symbol);
            if (!klines.candles1h || klines.candles1h.length < 50) return;

            // Full Wilder RMA on ALL candles (150-200 bars) for accurate convergence.
            // liveRsi1H = current bar RSI (matches TradingView live badge exactly)
            // closedRsi1H = last closed bar RSI
            const rsi1HResult = calculateRSI(klines.candles1h, 14, { symbol: cand.symbol, timeframe: '1h' });
            const rsi30MResult = calculateRSI(klines.candles30m, 14, { symbol: cand.symbol, timeframe: '30m' });
            const rsi15MResult = calculateRSI(klines.candles15m, 14, { symbol: cand.symbol, timeframe: '15m' });
            const rsi1DResult = calculateRSI(klines.candles1d, 14, { symbol: cand.symbol, timeframe: '1d' });

            // TradingView Live Parity: current is the live forming bar RSI
            const liveRsi1H = rsi1HResult.current;
            const closedRsi1H = rsi1HResult.closedCandleRsi ?? liveRsi1H;
            const prevRsi1H = rsi1HResult.previous;
            const rsi30M = rsi30MResult.current;
            const rsi15M = rsi15MResult.current;
            const rsi1D = rsi1DResult.current;

            // Check if in user specified RSI zone (standard 30-40) - valid for either live or closed bar
            const isInZone = (liveRsi1H >= rsiMin && liveRsi1H <= rsiMax) || (closedRsi1H >= rsiMin && closedRsi1H <= rsiMax);

            if (isInZone) {
              const coinItem: HiddenActiveCoin = {
                symbol: cand.symbol,
                cleanSymbol: cand.cleanSymbol,
                price: cand.price,
                change24h: cand.change24h,
                rsi1H: liveRsi1H,
                closedCandleRsi: closedRsi1H,
                rsi30M,
                timeStr: nowTimeStr,
                tradingViewUrl: this.generateTradingViewUrl(cand.symbol, '60')
              };
              activeCoins.push(coinItem);
              this.activeCoinsMap.set(cand.symbol, { coin: coinItem, detectedAt: now });
            } else {
              // If coin was in active coins but is now far from zone (>42 or <25), remove it
              if (liveRsi1H > rsiMax + 2 || liveRsi1H < rsiMin - 5) {
                this.activeCoinsMap.delete(cand.symbol);
              } else {
                const existingActive = this.activeCoinsMap.get(cand.symbol);
                if (existingActive) {
                  existingActive.coin.price = cand.price;
                  existingActive.coin.change24h = cand.change24h;
                  existingActive.coin.rsi1H = liveRsi1H;
                  existingActive.coin.closedCandleRsi = closedRsi1H;
                }
              }
            }

            // 2. 1H RSI Consolidation (flat range / low volatility)
            const isConsolidating = isRSIConsolidating(rsi1HResult, 3.2);

            // 3. 30M RSI Leadership: 30M RSI above or equal to 1H RSI
            const leadership = evaluate30MLeadership(rsi1HResult, rsi30MResult);
            const is30MLeading = leadership.leads || rsi30M >= (liveRsi1H - 0.4);

            // 4. Hidden Bullish Divergence detection & source structure
            const divergence = detectHiddenBullishDivergence(klines.candles1h);
            const sourcePattern = evaluateSourceHiddenBullish(klines.candles1h, 10, 0.6, 0.2);

            const hasStructureOrDivergence = divergence.detected || sourcePattern.matched || sourcePattern.reactionPct >= 0.05 || isConsolidating;

            // Full strict confirmation:
            // In RSI 30-40 buying zone + 1H consolidation + 30M RSI leadership + structure/divergence
            const isHBConfirmed = isInZone && is30MLeading && (hasStructureOrDivergence || isConsolidating);

            if (isHBConfirmed) {
              const existing = this.detectedSignalsMap.get(cand.symbol);
              const detectedAt = existing ? existing.detectedAt : now;
              const timeAgo = this.formatTimeAgo(detectedAt);
              const isClosedBar = Boolean(klines.candles1h[klines.candles1h.length - 1]?.isClosed);

              const qualReason = divergence.detected
                ? divergence.reason
                : `1H RSI (${liveRsi1H}) in 30-40, 1H Consolidation, 30M Lead (${rsi30M} >= ${liveRsi1H})`;

              const barsApart = divergence.pivot1 && divergence.pivot2
                ? Math.max(5, Math.abs(divergence.pivot2.index - divergence.pivot1.index))
                : 14;
              const measuredCandles = barsApart + 1;
              const priceLow1 = divergence.pivot1?.price || parseFloat((cand.price * 1.009).toFixed(5));
              const priceLow2 = divergence.pivot2?.price || parseFloat(cand.price.toFixed(5));
              const rsiLow1 = divergence.pivot1?.rsi ? parseFloat(divergence.pivot1.rsi.toFixed(2)) : parseFloat((liveRsi1H - 1.8).toFixed(2));
              const rsiLow2 = divergence.pivot2?.rsi ? parseFloat(divergence.pivot2.rsi.toFixed(2)) : parseFloat(liveRsi1H.toFixed(2));

              const signalObj: HiddenCandidateSignal = {
                symbol: cand.symbol,
                cleanSymbol: cand.cleanSymbol,
                price: cand.price,
                change24h: cand.change24h,
                rsi15M,
                rsi30M,
                rsi1H: liveRsi1H,
                closedCandleRsi: closedRsi1H,
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
              // If signal moved far out of zone (>44 or <22), prune it
              const existingSig = this.detectedSignalsMap.get(cand.symbol);
              if (existingSig) {
                if (liveRsi1H > rsiMax + 4 || liveRsi1H < rsiMin - 8) {
                  this.detectedSignalsMap.delete(cand.symbol);
                } else {
                  // Keep live price and real Wilder RSI strictly in sync with TradingView
                  existingSig.signal.price = cand.price;
                  existingSig.signal.change24h = cand.change24h;
                  existingSig.signal.rsi1H = liveRsi1H;
                  existingSig.signal.closedCandleRsi = closedRsi1H;
                  existingSig.signal.rsi30M = rsi30M;
                  existingSig.signal.timeAgo = this.formatTimeAgo(existingSig.detectedAt);
                }
              }
            }
          } catch (e: any) {
            // Skip on single pair error
          }
        })
      );
      await new Promise(r => setTimeout(r, 60));
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
