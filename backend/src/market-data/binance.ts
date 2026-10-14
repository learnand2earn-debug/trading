import WebSocket from 'ws';
import { Candle } from '../indicators/types.js';
import { binanceGet } from './binanceClient.js';
import { binanceDiscoveryService } from './binanceDiscovery.js';

export interface BinanceTicker24h {
  symbol: string;
  priceChangePercent: number;
  lastPrice: number;
  volume: number;
  quoteVolume: number;
  highPrice: number;
  lowPrice: number;
}

export class BinanceMarketDataService {
  private wsBaseUrl = 'wss://data-stream.binance.vision/ws';
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private onCandleCallback?: (symbol: string, timeframe: string, candle: Candle) => void;

  constructor(options?: { wsUrl?: string }) {
    if (options?.wsUrl) this.wsBaseUrl = options.wsUrl;
  }

  setCandleListener(cb: (symbol: string, timeframe: string, candle: Candle) => void) {
    this.onCandleCallback = cb;
  }

  async getTopGainers(limit: number = 7): Promise<BinanceTicker24h[]> {
    try {
      const resp = await binanceGet<any[]>('/api/v3/ticker/24hr', { timeout: 8000 });
      const rawTickers = resp.data || [];

      // Ensure discovery has loaded eligible pairs
      await binanceDiscoveryService.refreshEligibleSymbols();

      const usdtPairs: BinanceTicker24h[] = [];

      for (const t of rawTickers) {
        if (!t.symbol || !binanceDiscoveryService.isEligible(t.symbol)) {
          continue;
        }

        const quoteVol = parseFloat(t.quoteVolume || '0');
        if (quoteVol < 10000) {
          continue; // skip completely illiquid pairs
        }

        usdtPairs.push({
          symbol: t.symbol,
          priceChangePercent: parseFloat(t.priceChangePercent || '0'),
          lastPrice: parseFloat(t.lastPrice || '0'),
          volume: parseFloat(t.volume || '0'),
          quoteVolume: quoteVol,
          highPrice: parseFloat(t.highPrice || '0'),
          lowPrice: parseFloat(t.lowPrice || '0')
        });
      }

      usdtPairs.sort((a, b) => b.priceChangePercent - a.priceChangePercent);
      return usdtPairs.slice(0, limit);
    } catch (err: any) {
      console.warn('[BinanceService] Failed to fetch 24hr tickers from Binance:', err.message);
      // Strictly NO mock fallback - return empty array
      return [];
    }
  }

  async fetchKlines(symbol: string, interval: string, limit: number = 150): Promise<Candle[]> {
    try {
      const resp = await binanceGet<any[]>('/api/v3/klines', {
        params: { symbol, interval, limit: Math.min(Math.max(limit, 80), 200) },
        timeout: 15000
      });

      if (!Array.isArray(resp.data)) {
        throw new Error(`Invalid klines response for ${symbol}`);
      }

      return resp.data.map((k: any, idx: number, arr: any[]) => {
        const isLast = idx === arr.length - 1;
        const now = Date.now();
        const closeTime = Number(k[6]);
        // Candle is closed if closeTime has elapsed or is not the last open bar
        const isClosed = !isLast || now >= closeTime;

        return {
          openTime: Number(k[0]),
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
          closeTime,
          isClosed
        };
      });
    } catch (err: any) {
      console.error(`[BinanceService] Klines fetch failed for ${symbol} ${interval}:`, err.message);
      // Strictly NO simulated klines fallback
      throw err;
    }
  }

  connectWebSocket(symbols: string[], intervals: string[] = ['15m', '30m', '1h', '1d']) {
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
    }

    if (symbols.length === 0) return;

    const streams = symbols
      .slice(0, 20) // batch top symbols for WS connection
      .flatMap(sym => intervals.map(int => `${sym.toLowerCase()}@kline_${int}`))
      .join('/');

    const streamUrl = `${this.wsBaseUrl}/${streams}`;
    console.log(`[BinanceWS] Connecting stream: ${streamUrl.slice(0, 60)}...`);

    try {
      this.ws = new WebSocket(streamUrl);

      this.ws.on('open', () => {
        this.isConnected = true;
        console.log('[BinanceWS] Connected successfully.');
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.e === 'kline') {
            const k = parsed.k;
            const candle: Candle = {
              openTime: k.t,
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v),
              closeTime: k.T,
              isClosed: Boolean(k.x) // k.x is true when candle officially closes
            };

            if (this.onCandleCallback) {
              this.onCandleCallback(parsed.s, k.i, candle);
            }
          }
        } catch (e) {
          // ignore parsing noise
        }
      });

      this.ws.on('error', (err: any) => {
        console.warn('[BinanceWS] Error:', err.message);
        this.reconnect(symbols, intervals);
      });

      this.ws.on('close', () => {
        this.isConnected = false;
        console.warn('[BinanceWS] Closed, scheduling reconnect...');
        this.reconnect(symbols, intervals);
      });
    } catch (err: any) {
      console.warn('[BinanceWS] Connection failure:', err.message);
      this.reconnect(symbols, intervals);
    }
  }

  private reconnect(symbols: string[], intervals: string[]) {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connectWebSocket(symbols, intervals);
    }, 5000);
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const binanceService = new BinanceMarketDataService();
