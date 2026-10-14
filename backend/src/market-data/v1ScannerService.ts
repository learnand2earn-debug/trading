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
      const resp = await binanceGet<any[]>('/api/v3/ticker/24hr', { timeout: 9000 });
      rawTickers = resp.data || [];
    } catch (err: any) {
      console.warn('[V1Scanner] Binance ticker/24hr fetch error:', err.message);
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
    const activeCoins: V1ActiveCoin[] = [];
    const candidatesForDeepScan: Array<{
      symbol: string;
      cleanSymbol: string;
      price: number;
      change24h: number;
      quoteVolume: number;
    }> = [];

    // Ticker screen: coins with positive or consolidating 24h momentum
    for (const t of spotPairs) {
      const clean = t.symbol.replace('USDT', '');
      const price = parseFloat(t.lastPrice);
      const change24h = parseFloat(t.priceChangePercent);
      const quoteVolume = parseFloat(t.quoteVolume || '0');

      // Tickers with healthy volume and positive trend momentum are scanned
      if (change24h > -8.0) {
        candidatesForDeepScan.push({
          symbol: t.symbol,
          cleanSymbol: clean,
          price,
          change24h,
          quoteVolume
        });
      }
    }

    // Sort candidates by 24h change descending
    candidatesForDeepScan.sort((a, b) => b.change24h - a.change24h);

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
            // If previously detected but conditions broke, remove signal
            if (this.detectedSignalsMap.has(cand.symbol)) {
              this.detectedSignalsMap.delete(cand.symbol);
            }
          }
        } catch (e: any) {
          // Log and skip on error
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

    // Sort signals by detection time descending
    const confirmedSignals = Array.from(this.detectedSignalsMap.values())
      .map(v => v.signal)
      .sort((a, b) => b.detectedAt - a.detectedAt);

    const response: V1ScanResponse = {
      success: true,
      totalMonitored: spotPairs.length,
      v1ZoneCount: activeCoins.length,
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

export const v1ScannerService = new V1ScannerService();
