import { binanceGet } from './binanceClient.js';

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

/**
 * Binance Spot Liquidity Depth Service
 * Sourced directly from official Binance /api/v3/depth order book without third-party dependencies.
 */
export class CoinGlassService {
  private cache = new Map<string, { snapshot: CoinGlassLiquiditySnapshot; cachedAt: number }>();

  async getLiquidityData(
    symbol: string,
    currentPrice: number,
    window: '12h' | '24h' = '24h'
  ): Promise<CoinGlassLiquiditySnapshot> {
    const formatted = symbol.toUpperCase().endsWith('USDT') ? symbol.toUpperCase() : `${symbol.toUpperCase()}USDT`;
    const cacheKey = `${formatted}_${window}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached) {
      const ageSec = Math.floor((now - cached.cachedAt) / 1000);
      if (ageSec < 45) {
        return {
          ...cached.snapshot,
          dataAgeSeconds: ageSec,
          freshnessStatus: 'FRESH'
        };
      }
    }

    try {
      // Query official Binance Spot Order Book Depth (bids and asks)
      const resp = await binanceGet<{ bids: [string, string][]; asks: [string, string][] }>('/api/v3/depth', {
        params: { symbol: formatted, limit: 50 },
        timeout: 4000
      });

      const bids = resp.data?.bids || [];
      const asks = resp.data?.asks || [];

      let liquidityBelowUSD = 0;
      let liquidityAboveUSD = 0;
      let nearestBidPrice = currentPrice;
      let nearestAskPrice = currentPrice;

      for (const [pStr, qStr] of bids) {
        const p = parseFloat(pStr);
        const q = parseFloat(qStr);
        const usd = p * q;
        liquidityBelowUSD += usd;
        if (nearestBidPrice === currentPrice) nearestBidPrice = p;
      }

      for (const [pStr, qStr] of asks) {
        const p = parseFloat(pStr);
        const q = parseFloat(qStr);
        const usd = p * q;
        liquidityAboveUSD += usd;
        if (nearestAskPrice === currentPrice) nearestAskPrice = p;
      }

      const nearestPoolPrice = liquidityBelowUSD > liquidityAboveUSD ? nearestBidPrice : nearestAskPrice;
      const distancePct = currentPrice > 0 ? Math.abs((currentPrice - nearestPoolPrice) / currentPrice) * 100 : 0;

      const snapshot: CoinGlassLiquiditySnapshot = {
        symbol: formatted,
        source: 'binance_spot_depth',
        exchange: 'BINANCE',
        timestamp: now,
        timeframe: window,
        dataAgeSeconds: 0,
        liquidityAboveUSD: Math.round(liquidityAboveUSD),
        liquidityBelowUSD: Math.round(liquidityBelowUSD),
        nearestPoolPrice: parseFloat(nearestPoolPrice.toFixed(4)),
        distancePct: parseFloat(distancePct.toFixed(2)),
        freshnessStatus: 'FRESH',
        responseStatus: 'OK'
      };

      this.cache.set(cacheKey, { snapshot, cachedAt: now });
      return snapshot;
    } catch (err: any) {
      // Return clear status rather than inventing values
      return {
        symbol: formatted,
        source: 'binance_spot_depth',
        exchange: 'BINANCE',
        timestamp: now,
        timeframe: window,
        dataAgeSeconds: 999,
        liquidityAboveUSD: 0,
        liquidityBelowUSD: 0,
        nearestPoolPrice: currentPrice,
        distancePct: 0,
        freshnessStatus: 'DATA_UNAVAILABLE',
        responseStatus: err.message || 'API_ERROR'
      };
    }
  }
}

export const coinGlassService = new CoinGlassService();
