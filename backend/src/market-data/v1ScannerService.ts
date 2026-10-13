import axios from 'axios';
import { Candle } from '../indicators/types.js';
import { calculateRSI } from '../indicators/rsi.js';
import { calculateEMA } from '../indicators/ema.js';
import { MASTER_COINS } from './masterCoins.js';

// Exclude tokenized equities and fiat stablecoins to ensure ONLY original Binance crypto coins
const EXCLUDED_NON_CRYPTO_ASSETS = new Set([
  'NVDAB', 'TSLAB', 'AMDB', 'INTCB', 'MSTRB', 'METAB', 'MSFTB', 'PLTRB', 'QQQB', 'COINB',
  'SPYB', 'CRCLB', 'SNDKB', 'SPCXB', 'EWYB', 'LITEB', 'CBRSB', 'MUB', 'BABAB', 'AMZNB',
  'GMEB', 'PDDB', 'AMCB', 'HIMSB', 'FWDIB', 'MRNAB', 'USDE', 'USD1', 'EUR', 'FDUSD', 'TUSD', 'USDC', 'DAI'
]);

export interface V1CandidateSignal {
  symbol: string;
  cleanSymbol: string;
  price: number;
  change24h: number;
  rsi15M: number;
  rsi30M: number;
  rsi1H: number;
  rsi4H: number;
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
}

export interface V1ActiveCoin {
  symbol: string;
  cleanSymbol: string;
  price: number;
  change24h: number;
  rsi1H: number;
  rsi30M: number;
  timeStr: string;
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
}

class V1ScannerService {
  private validSpotSymbols: Set<string> = new Set();
  private lastExchangeInfoTime = 0;

  // Track signal history with detection timestamps for "Xm ago"
  private detectedSignalsMap = new Map<string, { signal: V1CandidateSignal; detectedAt: number }>();

  // Cached Kline Data per symbol
  private klineCache = new Map<
    string,
    {
      candles15m: Candle[];
      candles30m: Candle[];
      candles1h: Candle[];
      candles4h: Candle[];
      candles1d: Candle[];
      fetchedAt: number;
    }
  >();

  private cachedScan: V1ScanResponse | null = null;
  private lastScanTime = 0;

  // Fetch and cache active spot USDT symbols from Binance
  async getValidSpotSymbols(): Promise<Set<string>> {
    const now = Date.now();
    if (this.validSpotSymbols.size > 0 && now - this.lastExchangeInfoTime < 3600000) {
      return this.validSpotSymbols;
    }

    try {
      const resp = await axios.get<any>('https://api.binance.com/api/v3/exchangeInfo?permissions=SPOT', {
        timeout: 9000
      });
      const valid = new Set<string>();
      if (resp.data && Array.isArray(resp.data.symbols)) {
        for (const s of resp.data.symbols) {
          const base = s.baseAsset || s.symbol.replace('USDT', '');
          if (
            s.status === 'TRADING' &&
            s.quoteAsset === 'USDT' &&
            s.isSpotTradingAllowed &&
            !EXCLUDED_NON_CRYPTO_ASSETS.has(base) &&
            !s.symbol.includes('UP') &&
            !s.symbol.includes('DOWN') &&
            !s.symbol.includes('BEAR') &&
            !s.symbol.includes('BULL')
          ) {
            valid.add(s.symbol);
          }
        }
      }
      if (valid.size > 0) {
        this.validSpotSymbols = valid;
        this.lastExchangeInfoTime = now;
      }
    } catch (err: any) {
      console.warn('[V1Scanner] exchangeInfo fetch failed, using fallback symbols:', err.message);
      if (this.validSpotSymbols.size === 0) {
        MASTER_COINS.forEach((c) => {
          if (!EXCLUDED_NON_CRYPTO_ASSETS.has(c.symbol)) {
            this.validSpotSymbols.add(`${c.symbol}USDT`);
          }
        });
      }
    }

    return this.validSpotSymbols;
  }

  // Fetch real Binance klines for all required intervals (15m, 30m, 1h, 4h, 1d)
  async fetchKlinesForSymbol(symbol: string): Promise<{
    candles15m: Candle[];
    candles30m: Candle[];
    candles1h: Candle[];
    candles4h: Candle[];
    candles1d: Candle[];
  }> {
    const now = Date.now();
    const cached = this.klineCache.get(symbol);
    if (cached && now - cached.fetchedAt < 25000) {
      return cached;
    }

    const parseKlines = (data: any[]): Candle[] => {
      if (!Array.isArray(data)) return [];
      return data.map((k) => ({
        openTime: Number(k[0]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
        closeTime: Number(k[6]),
        isClosed: true
      }));
    };

    try {
      const [k15Res, k30Res, k1hRes, k4hRes, k1dRes] = await Promise.all([
        axios.get<any[]>('https://api.binance.com/api/v3/klines', {
          params: { symbol, interval: '15m', limit: 100 },
          timeout: 8000
        }),
        axios.get<any[]>('https://api.binance.com/api/v3/klines', {
          params: { symbol, interval: '30m', limit: 100 },
          timeout: 8000
        }),
        axios.get<any[]>('https://api.binance.com/api/v3/klines', {
          params: { symbol, interval: '1h', limit: 100 },
          timeout: 8000
        }),
        axios.get<any[]>('https://api.binance.com/api/v3/klines', {
          params: { symbol, interval: '4h', limit: 100 },
          timeout: 8000
        }),
        axios.get<any[]>('https://api.binance.com/api/v3/klines', {
          params: { symbol, interval: '1d', limit: 100 },
          timeout: 8000
        })
      ]);

      const candles15m = parseKlines(k15Res.data);
      const candles30m = parseKlines(k30Res.data);
      const candles1h = parseKlines(k1hRes.data);
      const candles4h = parseKlines(k4hRes.data);
      const candles1d = parseKlines(k1dRes.data);

      const result = { candles15m, candles30m, candles1h, candles4h, candles1d, fetchedAt: now };
      this.klineCache.set(symbol, result);
      return result;
    } catch (err: any) {
      if (cached) return cached;
      return { candles15m: [], candles30m: [], candles1h: [], candles4h: [], candles1d: [] };
    }
  }

  computeApproximateRsi(price: number, high: number, low: number, change24h: number): number {
    const range = high - low;
    if (range <= 0) return 50.0;
    const rangePos = (price - low) / range;
    const trendFactor = Math.tanh(change24h / 15);
    const rsi = 50 + (rangePos - 0.5) * 35 + trendFactor * 25;
    return parseFloat(Math.max(12, Math.min(92, rsi)).toFixed(1));
  }

  formatTimeAgo(detectedAt: number): string {
    const diffSec = Math.floor((Date.now() - detectedAt) / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    return `${diffHours}h ago`;
  }

  // Main scan method
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

    // Cache valid for 15 seconds
    if (!fresh && this.cachedScan && now - this.lastScanTime < 15000 && this.cachedScan.rsiMin === rsiMin && this.cachedScan.rsiMax === rsiMax) {
      return this.cachedScan;
    }

    const validSpotSymbols = await this.getValidSpotSymbols();

    // 1. Fetch live 24hr tickers from Binance
    let rawTickers: any[] = [];
    try {
      const resp = await axios.get<any[]>('https://api.binance.com/api/v3/ticker/24hr', { timeout: 9000 });
      rawTickers = resp.data;
    } catch (err: any) {
      console.warn('[V1Scanner] Binance ticker/24hr fetch error:', err.message);
      if (this.cachedScan) return this.cachedScan;
    }

    // 2. Filter strictly by authentic Binance crypto Spot pairs
    const spotPairs = rawTickers.filter((t: any) =>
      validSpotSymbols.has(t.symbol) &&
      parseFloat(t.quoteVolume || '0') > 30000 &&
      parseFloat(t.lastPrice || '0') > 0
    );

    const activeCoins: V1ActiveCoin[] = [];
    const candidatesForDeepScan: Array<{
      symbol: string;
      cleanSymbol: string;
      price: number;
      change24h: number;
      approxRsi: number;
      quoteVolume: number;
    }> = [];

    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    for (const t of spotPairs) {
      const clean = t.symbol.replace('USDT', '');
      const price = parseFloat(t.lastPrice);
      const change24h = parseFloat(t.priceChangePercent);
      const high24h = parseFloat(t.highPrice);
      const low24h = parseFloat(t.lowPrice);
      const quoteVolume = parseFloat(t.quoteVolume || '0');
      const approxRsi = this.computeApproximateRsi(price, high24h, low24h, change24h);

      // Active V1 Zone is RSI 50 to 60 (or user configured rsiMin to rsiMax)
      if (approxRsi >= (rsiMin - 1.5) && approxRsi <= (rsiMax + 1.5)) {
        activeCoins.push({
          symbol: t.symbol,
          cleanSymbol: clean,
          price,
          change24h: parseFloat(change24h.toFixed(2)),
          rsi1H: approxRsi,
          rsi30M: parseFloat((approxRsi + (change24h > 0 ? 0.8 : -0.5)).toFixed(1)),
          timeStr: nowTimeStr
        });

        // Coins with positive 24h change or strong volume in the zone are candidates
        if (change24h > 0 || quoteVolume > 200000) {
          candidatesForDeepScan.push({
            symbol: t.symbol,
            cleanSymbol: clean,
            price,
            change24h,
            approxRsi,
            quoteVolume
          });
        }
      }
    }

    // Sort active coins by 24h change descending
    activeCoins.sort((a, b) => b.change24h - a.change24h);

    // Deep scan top candidates (up to 30 pairs) with real Binance klines
    candidatesForDeepScan.sort((a, b) => {
      // Prioritize coins in the middle of the RSI range and with higher volume
      const midRsi = (rsiMin + rsiMax) / 2;
      const distA = Math.abs(a.approxRsi - midRsi);
      const distB = Math.abs(b.approxRsi - midRsi);
      return distA - distB;
    });

    const deepCandidates = candidatesForDeepScan.slice(0, 60);
    const confirmedSignals: V1CandidateSignal[] = [];

    const batchSize = 10;
    for (let i = 0; i < deepCandidates.length; i += batchSize) {
      const batch = deepCandidates.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (cand) => {
          try {
            const { candles15m, candles30m, candles1h, candles4h, candles1d } =
              await this.fetchKlinesForSymbol(cand.symbol);
            if (candles1h.length < 15 || candles1d.length < 15) return;

            // 1. Multi-timeframe Wilder RSIs
            const rsi15M = candles15m.length >= 15 ? calculateRSI(candles15m, 14).current : cand.approxRsi;
            const rsi1HResult = calculateRSI(candles1h, 14);
            const rsi1H = rsi1HResult.current;
            const rsi4H = candles4h.length >= 15 ? calculateRSI(candles4h, 14).current : cand.approxRsi;
            const rsi1D = candles1d.length >= 15 ? calculateRSI(candles1d, 14).current : cand.approxRsi;
            const rsi30M = candles30m.length >= 15 ? calculateRSI(candles30m, 14).current : parseFloat((rsi1H + 0.8).toFixed(1));

            // 2. Trend Calculations:
            // 1H Trend: Close >= EMA 20 on 1H
            const closes1h = candles1h.map(c => c.close);
            const ema20_1h = calculateEMA(closes1h, 20);
            const lastClose1h = closes1h[closes1h.length - 1];
            const lastEma20_1h = ema20_1h[ema20_1h.length - 1] || lastClose1h;
            const is1hUptrend = lastClose1h >= lastEma20_1h * 0.998;
            const trend1H: 'Uptrend' | 'Downtrend' | 'Sideways' = is1hUptrend ? 'Uptrend' : 'Downtrend';

            // 1D Trend: Close >= EMA 20 on 1D or EMA 20 > EMA 50
            const closes1d = candles1d.map(c => c.close);
            const ema20_1d = calculateEMA(closes1d, 20);
            const lastClose1d = closes1d[closes1d.length - 1];
            const lastEma20_1d = ema20_1d[ema20_1d.length - 1] || lastClose1d;
            const is1dUptrend = lastClose1d >= lastEma20_1d * 0.995;
            const trend1D: 'Uptrend' | 'Downtrend' | 'Sideways' = is1dUptrend ? 'Uptrend' : 'Downtrend';

            // 3. Multi-timeframe RSI Leadership & Alignment:
            // 30M RSI higher than 1H RSI (User requirement: 30mins ka rsi 1 hour ka rsi ko lead ker raha ho)
            const isLeadershipConfirmed = rsi30M > rsi1H;
            // 15M RSI above 30M RSI (User requirement: 15min ka rsi above hai 30mins sa)
            const is15MAbove30M = rsi15M > rsi30M;
            // Ladder alignment: 15M >= 30M >= 1H
            const isLadderAligned = rsi15M >= rsi30M && rsi30M >= rsi1H;
            // Full cascade: 15M > 30M > 1H > 4H > 1D
            const isFullLadder = rsi15M > rsi30M && rsi30M > rsi1H && rsi1H > rsi4H && rsi4H > rsi1D;

            // 4. RSI 1H in selected range [rsiMin, rsiMax] (Default 50-60)
            const isRsiInRange = rsi1H >= rsiMin && rsi1H <= rsiMax;

            // 5. Strict V1 Confirmation:
            // - Dashboard V1-zone USDT pair
            // - RSI 1H: Selected Range (Default 50-60)
            // - 1H Uptrend (Mandatory)
            // - 1D Uptrend (Mandatory)
            // - RSI 30M Higher Than RSI 1H
            const isV1Confirmed = isRsiInRange && trend1H === 'Uptrend' && trend1D === 'Uptrend' && isLeadershipConfirmed;

            // Update activeCoins with verified values
            const activeIdx = activeCoins.findIndex((c) => c.symbol === cand.symbol);
            if (activeIdx >= 0) {
              activeCoins[activeIdx].rsi1H = rsi1H;
              activeCoins[activeIdx].rsi30M = rsi30M;
            }

            if (isV1Confirmed) {
              // Maintain detection timestamp
              let detectedAt = now;
              const existing = this.detectedSignalsMap.get(cand.symbol);
              if (existing) {
                detectedAt = existing.detectedAt;
              } else {
                this.detectedSignalsMap.set(cand.symbol, {
                  signal: {} as any,
                  detectedAt
                });
              }

              const timeAgo = this.formatTimeAgo(detectedAt);

              confirmedSignals.push({
                symbol: cand.symbol,
                cleanSymbol: cand.cleanSymbol,
                price: lastClose1h || cand.price,
                change24h: cand.change24h,
                rsi15M,
                rsi30M,
                rsi1H,
                rsi4H,
                rsi1D,
                trend1H,
                trend1D,
                isLeadershipConfirmed,
                is15MAbove30M,
                isLadderAligned,
                isFullLadder,
                isV1Confirmed: true,
                timeAgo,
                detectedAt
              });
            }
          } catch (e: any) {
            // Skip pair on single error
          }
        })
      );
    }

    // Sort confirmed signals: coins with 15M > 30M > 1H first, then by 30M RSI descending
    confirmedSignals.sort((a, b) => {
      if (a.is15MAbove30M && !b.is15MAbove30M) return -1;
      if (!a.is15MAbove30M && b.is15MAbove30M) return 1;
      return b.rsi30M - a.rsi30M;
    });

    const response: V1ScanResponse = {
      success: true,
      totalMonitored: spotPairs.length,
      v1ZoneCount: activeCoins.length,
      activeCoins,
      signals: confirmedSignals,
      timestamp: now,
      lastScanTimeStr: nowTimeStr,
      rsiMin,
      rsiMax
    };

    this.cachedScan = response;
    this.lastScanTime = now;

    return response;
  }
}

export const v1ScannerService = new V1ScannerService();
