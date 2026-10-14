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
        binanceService.fetchKlines(symbol, '15m', 500),
        binanceService.fetchKlines(symbol, '30m', 500),
        binanceService.fetchKlines(symbol, '1h', 500),
        binanceService.fetchKlines(symbol, '1d', 500)
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
      rawTickers = resp.data || [];
    } catch (err: any) {
      console.warn('[HiddenScanner] Binance ticker/24hr fetch error:', err.message);
      if (this.cachedScan) return this.cachedScan;
      rawTickers = [];
    }

    // 3. Filter strictly by authentic, eligible Binance Spot pairs
    const spotPairs = rawTickers.filter((t: any) =>
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

    // Tickers with dip or pullback momentum are prime candidates for Hidden Bullish 30-40 RSI
    for (const t of spotPairs) {
      const clean = t.symbol.replace('USDT', '');
      const price = parseFloat(t.lastPrice);
      const change24h = parseFloat(t.priceChangePercent);
      const quoteVolume = parseFloat(t.quoteVolume || '0');

      // Tickers that are either in mild dip or consolidating are screened
      if (change24h <= 4.0 && change24h >= -22.0) {
        candidatesForDeepScan.push({
          symbol: t.symbol,
          cleanSymbol: clean,
          price,
          change24h,
          quoteVolume
        });
      }
    }

    // Batch evaluation: rotate through candidates to respect rate limits
    const batchSize = 16;
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

    await Promise.all(
      deepCandidates.map(async (cand) => {
        try {
          const klines = await this.fetchKlinesForSymbol(cand.symbol);
          if (klines.candles1h.length < 20) return;

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
            activeCoins.push({
              symbol: cand.symbol,
              cleanSymbol: cand.cleanSymbol,
              price: cand.price,
              change24h: cand.change24h,
              rsi1H,
              rsi30M,
              timeStr: nowTimeStr,
              tradingViewUrl: this.generateTradingViewUrl(cand.symbol, '60')
            });
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

    const response: HiddenScanResponse = {
      success: true,
      totalMonitored: spotPairs.length,
      activeCount: activeCoins.length,
      activeCoins,
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
