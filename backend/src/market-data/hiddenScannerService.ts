import axios from 'axios';
import { Candle } from '../indicators/types.js';
import { calculateRSI } from '../indicators/rsi.js';
import { MASTER_COINS } from './masterCoins.js';

// Exclude tokenized equities and fiat stablecoins
const EXCLUDED_NON_CRYPTO_ASSETS = new Set([
  'NVDAB', 'TSLAB', 'AMDB', 'INTCB', 'MSTRB', 'METAB', 'MSFTB', 'PLTRB', 'QQQB', 'COINB',
  'SPYB', 'CRCLB', 'SNDKB', 'SPCXB', 'EWYB', 'LITEB', 'CBRSB', 'MUB', 'BABAB', 'AMZNB',
  'GMEB', 'PDDB', 'AMCB', 'HIMSB', 'FWDIB', 'MRNAB', 'USDE', 'USD1', 'EUR', 'FDUSD', 'TUSD', 'USDC', 'DAI'
]);

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
}

export interface HiddenActiveCoin {
  symbol: string;
  cleanSymbol: string;
  price: number;
  change24h: number;
  rsi1H: number;
  rsi30M: number;
  timeStr: string;
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
}

class HiddenScannerService {
  private validSpotSymbols: Set<string> = new Set();
  private lastExchangeInfoTime = 0;
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

  async fetchKlinesForSymbol(symbol: string): Promise<{
    candles15m: Candle[];
    candles30m: Candle[];
    candles1h: Candle[];
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
      const [k15Res, k30Res, k1hRes, k1dRes] = await Promise.all([
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
          params: { symbol, interval: '1d', limit: 100 },
          timeout: 8000
        })
      ]);

      const candles15m = parseKlines(k15Res.data);
      const candles30m = parseKlines(k30Res.data);
      const candles1h = parseKlines(k1hRes.data);
      const candles1d = parseKlines(k1dRes.data);

      const result = { candles15m, candles30m, candles1h, candles1d, fetchedAt: now };
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

    const validSpotSymbols = await this.getValidSpotSymbols();

    let rawTickers: any[] = [];
    try {
      const resp = await axios.get<any[]>('https://api.binance.com/api/v3/ticker/24hr', { timeout: 9000 });
      rawTickers = resp.data;
    } catch (err: any) {
      if (this.cachedScan) return this.cachedScan;
    }

    const spotPairs = rawTickers.filter((t: any) =>
      validSpotSymbols.has(t.symbol) &&
      parseFloat(t.quoteVolume || '0') > 50000 &&
      parseFloat(t.lastPrice || '0') > 0
    );

    const nowTimeStr = new Date(Date.now() + 2 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const candidatesForDeepScan: Array<{
      symbol: string;
      cleanSymbol: string;
      price: number;
      change24h: number;
      quoteVolume: number;
    }> = [];

    // Prioritize coins with negative to mild change (-0.5% to -8%) which often sit in 30-40 RSI
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

    // Sort candidates to prioritize dip/consolidation pairs with volume
    candidatesForDeepScan.sort((a, b) => {
      // Prioritize pairs between -10% and +2% change and higher volume
      const scoreA = (a.change24h <= 2 && a.change24h >= -12 ? 100 : 0) + Math.log10(Math.max(10, a.quoteVolume));
      const scoreB = (b.change24h <= 2 && b.change24h >= -12 ? 100 : 0) + Math.log10(Math.max(10, b.quoteVolume));
      return scoreB - scoreA;
    });

    const deepCandidates = candidatesForDeepScan.slice(0, 50);
    const confirmedSignals: HiddenCandidateSignal[] = [];
    const activeCoins: HiddenActiveCoin[] = [];

    const batchSize = 10;
    for (let i = 0; i < deepCandidates.length; i += batchSize) {
      const batch = deepCandidates.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (cand) => {
          try {
            const { candles15m, candles30m, candles1h, candles1d } =
              await this.fetchKlinesForSymbol(cand.symbol);
            if (candles1h.length < 20) return;

            // Accurate Wilder RSI with 100 candles (100% matches TradingView)
            const rsi1HResult = calculateRSI(candles1h, 14);
            const rsi1H = rsi1HResult.current;
            const prevRsi1H = rsi1HResult.previous;
            const rsi30M = candles30m.length >= 20 ? calculateRSI(candles30m, 14).current : 50;
            const rsi15M = candles15m.length >= 20 ? calculateRSI(candles15m, 14).current : 50;
            const rsi1D = candles1d.length >= 20 ? calculateRSI(candles1d, 14).current : 50;

            // 1. RSI 1H in Buying Zone [30, 40]
            const isInZone = rsi1H >= rsiMin && rsi1H <= rsiMax;

            if (isInZone) {
              activeCoins.push({
                symbol: cand.symbol,
                cleanSymbol: cand.cleanSymbol,
                price: cand.price,
                change24h: cand.change24h,
                rsi1H,
                rsi30M,
                timeStr: nowTimeStr
              });

              // 2. 1H RSI Consolidation (na up ho na down ho: diff <= 2.2 or slope FLAT)
              const rsiDiff = Math.abs(rsi1H - prevRsi1H);
              const isConsolidating = rsiDiff <= 2.2 || rsi1HResult.slope === 'FLAT';

              // 3. 30M RSI Leadership: 30M RSI above 1H RSI
              const is30MLeading = rsi30M > rsi1H;

              // Full confirmation
              const isHBConfirmed = isInZone && isConsolidating && is30MLeading;

              if (isHBConfirmed) {
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
                  detectedAt
                });
              }
            }
          } catch (e: any) {
            // Ignore single pair error
          }
        })
      );
    }

    // Sort confirmed signals by 30M leadership magnitude
    confirmedSignals.sort((a, b) => (b.rsi30M - b.rsi1H) - (a.rsi30M - a.rsi1H));
    activeCoins.sort((a, b) => a.rsi1H - b.rsi1H);

    const response: HiddenScanResponse = {
      success: true,
      totalMonitored: spotPairs.length,
      activeCount: activeCoins.length,
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

export const hiddenScannerService = new HiddenScannerService();
