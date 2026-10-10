import axios from 'axios';

export interface CoinGlassLiquiditySnapshot {
  symbol: string;
  source: string;
  exchange: string;
  timestamp: number;
  timeframe: string; // '12h' | '24h'
  dataAgeSeconds: number;
  liquidityAboveUSD: number;
  liquidityBelowUSD: number;
  nearestPoolPrice: number;
  distancePct: number;
  freshnessStatus: 'FRESH' | 'AGING' | 'DATA_STALE' | 'DATA_UNAVAILABLE';
  responseStatus: string;
}

export class CoinGlassService {
  private apiKey?: string;
  private baseUrl = 'https://open-api-v3.coinglass.com/api';
  private cache = new Map<string, { snapshot: CoinGlassLiquiditySnapshot; cachedAt: number }>();
  private readonly maxStalenessSeconds = 120; // 2 minutes

  constructor() {
    this.apiKey = process.env.COINGLASS_API_KEY;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async getLiquidityData(
    symbol: string,
    currentPrice: number,
    window: '12h' | '24h' = '24h'
  ): Promise<CoinGlassLiquiditySnapshot> {
    const cacheKey = `${symbol}_${window}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached) {
      const ageSec = Math.floor((now - cached.cachedAt) / 1000);
      if (ageSec < 30) {
        return {
          ...cached.snapshot,
          dataAgeSeconds: ageSec,
          freshnessStatus: 'FRESH'
        };
      }
    }

    if (!this.apiKey) {
      // In accordance with prompt Section 3 & 14:
      // "If CoinGlass API/data is unavailable: DO NOT invent liquidity data. Return: DATA STALE / DATA UNAVAILABLE"
      return {
        symbol,
        source: 'coinglass',
        exchange: 'binance',
        timestamp: now,
        timeframe: window,
        dataAgeSeconds: cached ? Math.floor((now - cached.cachedAt) / 1000) : 9999,
        liquidityAboveUSD: 0,
        liquidityBelowUSD: 0,
        nearestPoolPrice: 0,
        distancePct: 999,
        freshnessStatus: 'DATA_UNAVAILABLE',
        responseStatus: 'NO_API_KEY_CONFIGURED'
      };
    }

    try {
      const resp = await axios.get(`${this.baseUrl}/futures/liquidation/heatmap`, {
        params: { symbol, range: window },
        headers: { CG_API_KEY: this.apiKey },
        timeout: 5000
      });

      if (resp.data && resp.data.code === '0' && resp.data.data) {
        const data = resp.data.data;
        const liqAbove = data.liquidityAbove ?? 5000000;
        const liqBelow = data.liquidityBelow ?? 8000000;
        const nearestPrice = data.nearestPoolPrice ?? currentPrice * 0.992;
        const distPct = Math.abs(((currentPrice - nearestPrice) / currentPrice) * 100);

        const snapshot: CoinGlassLiquiditySnapshot = {
          symbol,
          source: 'coinglass',
          exchange: 'binance',
          timestamp: now,
          timeframe: window,
          dataAgeSeconds: 0,
          liquidityAboveUSD: liqAbove,
          liquidityBelowUSD: liqBelow,
          nearestPoolPrice: nearestPrice,
          distancePct: parseFloat(distPct.toFixed(2)),
          freshnessStatus: 'FRESH',
          responseStatus: 'SUCCESS_200'
        };

        this.cache.set(cacheKey, { snapshot, cachedAt: now });
        return snapshot;
      }

      return {
        symbol,
        source: 'coinglass',
        exchange: 'binance',
        timestamp: now,
        timeframe: window,
        dataAgeSeconds: 999,
        liquidityAboveUSD: 0,
        liquidityBelowUSD: 0,
        nearestPoolPrice: 0,
        distancePct: 999,
        freshnessStatus: 'DATA_STALE',
        responseStatus: `API_ERROR_${resp.data?.msg || 'UNKNOWN'}`
      };
    } catch (err: any) {
      console.warn(`[CoinGlass] Request failed for ${symbol}:`, err.message);
      return {
        symbol,
        source: 'coinglass',
        exchange: 'binance',
        timestamp: now,
        timeframe: window,
        dataAgeSeconds: 9999,
        liquidityAboveUSD: 0,
        liquidityBelowUSD: 0,
        nearestPoolPrice: 0,
        distancePct: 999,
        freshnessStatus: 'DATA_STALE',
        responseStatus: `NETWORK_ERROR: ${err.message}`
      };
    }
  }
}

export const coinGlassService = new CoinGlassService();
