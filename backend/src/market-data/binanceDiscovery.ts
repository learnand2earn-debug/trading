import { binanceGet, isBinanceCircuitBreakerActive } from './binanceClient.js';
import { SEED_BINANCE_SYMBOLS } from './seedSymbols.js';

export interface BinanceSymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
  isSpotTradingAllowed: boolean;
  orderTypes: string[];
}

export interface ExclusionDiagnostic {
  symbol: string;
  reason: string;
  timestamp: number;
}

// Official Binance Monitoring Tag symbols (tokens monitored by Binance with warning badge)
export const BINANCE_MONITORING_SYMBOLS = new Set([
  'GNS', 'FTT', 'DODO', 'VELODROME', 'ARK', 'HEI', 'SYN', 'RESOLV', 'QUICK',
  'STX', 'AVA', 'CVC', 'WIF', 'BICO', 'SCR', 'TLM', 'QKC', 'GLMR', 'MOVE',
  'JASMY', 'ACT', 'QI', 'TOWNS', 'RARE', 'EPIC', 'GTC', 'PORTAL', 'LSK',
  'COOKIE', 'NOM', 'MOVR', 'AWE', 'SOPH', 'BLUR', 'LUNC', 'USTC', 'WRX', 'AKRO'
]);

// Stablecoins and fiat pegged assets to exclude from trading scanners
export const EXCLUDED_STABLECOINS = new Set([
  'USDC', 'FDUSD', 'TUSD', 'USD1', 'EUR', 'BUSD', 'DAI', 'USDP', 'AEUR', 'EURI', 'USDE', 'USDD'
]);

class BinanceDiscoveryService {
  private eligibleSymbols = new Map<string, BinanceSymbolInfo>();
  private eligibleSymbolSet = new Set<string>();
  private exclusionDiagnostics: ExclusionDiagnostic[] = [];
  private lastFetchTime = 0;
  private readonly cacheTtlMs = 60 * 60 * 1000; // 1 hour TTL
  private fetchPromise: Promise<BinanceSymbolInfo[]> | null = null;
  private targetQuoteAsset = 'USDT';

  constructor() {
    // 1. Immediately populate from verified 506 Binance Spot seed symbols
    this.loadSeedSymbols();

    // 2. Delayed background check to refresh exchangeInfo (only when circuit breaker is inactive)
    setTimeout(() => {
      this.refreshEligibleSymbols().catch(err => {
        console.warn('[BinanceDiscovery] Initial discovery background notice:', err.message);
      });
    }, 10000);
  }

  private loadSeedSymbols() {
    const now = Date.now();
    for (const s of SEED_BINANCE_SYMBOLS) {
      if (
        s.quoteAsset === this.targetQuoteAsset &&
        s.status === 'TRADING' &&
        s.isSpotTradingAllowed &&
        !EXCLUDED_STABLECOINS.has(s.baseAsset)
      ) {
        const info: BinanceSymbolInfo = {
          symbol: s.symbol,
          baseAsset: s.baseAsset,
          quoteAsset: s.quoteAsset,
          status: s.status,
          isSpotTradingAllowed: s.isSpotTradingAllowed,
          orderTypes: ['LIMIT', 'MARKET', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT_LIMIT']
        };
        this.eligibleSymbols.set(s.symbol, info);
        this.eligibleSymbolSet.add(s.symbol);
      }
    }
    this.lastFetchTime = now;
    console.log(`[BinanceDiscovery] Pre-loaded ${this.eligibleSymbols.size} verified Binance Spot ${this.targetQuoteAsset} pairs from seed cache.`);
  }

  setQuoteAsset(quoteAsset: string) {
    this.targetQuoteAsset = quoteAsset.toUpperCase();
    this.lastFetchTime = 0; // invalidate cache
    this.loadSeedSymbols();
  }

  getQuoteAsset(): string {
    return this.targetQuoteAsset;
  }

  async refreshEligibleSymbols(force: boolean = false): Promise<BinanceSymbolInfo[]> {
    const now = Date.now();
    if (!force && this.eligibleSymbols.size > 0 && (now - this.lastFetchTime < this.cacheTtlMs)) {
      return Array.from(this.eligibleSymbols.values());
    }

    if (isBinanceCircuitBreakerActive()) {
      return Array.from(this.eligibleSymbols.values());
    }

    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this.doFetchSymbols();
    try {
      return await this.fetchPromise;
    } finally {
      this.fetchPromise = null;
    }
  }

  private async doFetchSymbols(): Promise<BinanceSymbolInfo[]> {
    if (isBinanceCircuitBreakerActive()) {
      console.log(`[BinanceDiscovery] Circuit breaker active. Serving ${this.eligibleSymbols.size} seed/cached pairs.`);
      return Array.from(this.eligibleSymbols.values());
    }

    try {
      const now = Date.now();
      console.log(`[BinanceDiscovery] Fetching exchangeInfo from Binance Spot API for ${this.targetQuoteAsset} pairs...`);
      const resp = await binanceGet<{ symbols: any[] }>('/api/v3/exchangeInfo', { timeout: 12000 });
      const rawSymbols = resp.data?.symbols || [];

      const newEligible = new Map<string, BinanceSymbolInfo>();
      const newSet = new Set<string>();
      const diagnostics: ExclusionDiagnostic[] = [];

      for (const s of rawSymbols) {
        const symbol = String(s.symbol || '').toUpperCase();
        const base = String(s.baseAsset || '').toUpperCase();
        const quote = String(s.quoteAsset || '').toUpperCase();
        const status = String(s.status || '').toUpperCase();
        const spotAllowed = Boolean(s.isSpotTradingAllowed);

        // Filter 1: Quote Asset match
        if (quote !== this.targetQuoteAsset) {
          continue; // skip other quote assets without logging to avoid filling logs
        }

        // Filter 2: Status check
        if (status !== 'TRADING') {
          diagnostics.push({ symbol, reason: `Status is ${status} (expected TRADING)`, timestamp: now });
          continue;
        }

        // Filter 3: Spot trading allowed check
        if (!spotAllowed) {
          diagnostics.push({ symbol, reason: 'isSpotTradingAllowed is false', timestamp: now });
          continue;
        }

        // Filter 4: Leveraged tokens (UP/DOWN/BEAR/BULL) - preserving legitimate coins like JUP (Jupiter)
        const isLeveraged =
          (base.endsWith('UP') && base.length > 3 && base !== 'JUP') ||
          (base.endsWith('DOWN') && base.length > 4) ||
          (base.endsWith('BEAR') && base.length > 4) ||
          (base.endsWith('BULL') && base.length > 4);
        if (isLeveraged) {
          diagnostics.push({ symbol, reason: 'Leveraged token excluded', timestamp: now });
          continue;
        }

        // Filter 5: Stablecoin and fiat pegged pairs excluded from scanner
        if (EXCLUDED_STABLECOINS.has(base)) {
          diagnostics.push({ symbol, reason: 'Stablecoin excluded from trading scan', timestamp: now });
          continue;
        }

        const info: BinanceSymbolInfo = {
          symbol,
          baseAsset: base,
          quoteAsset: quote,
          status,
          isSpotTradingAllowed: spotAllowed,
          orderTypes: s.orderTypes || []
        };

        newEligible.set(symbol, info);
        newSet.add(symbol);
      }

      if (newEligible.size > 0) {
        this.eligibleSymbols = newEligible;
        this.eligibleSymbolSet = newSet;
        this.exclusionDiagnostics = diagnostics.slice(-100); // keep latest 100 diagnostics
        this.lastFetchTime = now;
        console.log(`[BinanceDiscovery] Successfully discovered ${this.eligibleSymbols.size} eligible Binance ${this.targetQuoteAsset} Spot pairs.`);
      }

      return Array.from(this.eligibleSymbols.values());
    } catch (err: any) {
      console.warn(`[BinanceDiscovery] Notice: Could not refresh exchangeInfo from Binance API (${err.message}). Serving ${this.eligibleSymbols.size} cached/seed symbols.`);
      // Never throw — always return the existing populated symbols (from seed cache or prior fetch)
      return Array.from(this.eligibleSymbols.values());
    }
  }

  filterEligibleSymbols(rawSymbols: any[]): string[] {
    const valid: string[] = [];
    for (const s of rawSymbols) {
      const symbol = String(s.symbol || '').toUpperCase();
      const base = String(s.baseAsset || (s.symbol ? s.symbol.replace(this.targetQuoteAsset, '') : '')).toUpperCase();
      const quote = String(s.quoteAsset || this.targetQuoteAsset).toUpperCase();
      const status = String(s.status || '').toUpperCase();
      const spotAllowed = s.isSpotTradingAllowed !== false;

      if (quote !== this.targetQuoteAsset) continue;
      if (status !== 'TRADING') continue;
      if (!spotAllowed) continue;
      if (
        (base.endsWith('UP') && base.length > 3 && base !== 'JUP') ||
        (base.endsWith('DOWN') && base.length > 4) ||
        (base.endsWith('BEAR') && base.length > 4) ||
        (base.endsWith('BULL') && base.length > 4)
      ) continue;
      valid.push(symbol);
    }
    return valid;
  }

  isMonitored(symbol: string): boolean {
    const base = symbol.toUpperCase().replace(this.targetQuoteAsset, '');
    return BINANCE_MONITORING_SYMBOLS.has(base);
  }

  isEligible(symbol: string): boolean {
    const formatted = symbol.toUpperCase().endsWith(this.targetQuoteAsset)
      ? symbol.toUpperCase()
      : `${symbol.toUpperCase()}${this.targetQuoteAsset}`;
    return this.eligibleSymbolSet.has(formatted);
  }

  getEligibleSymbols(): string[] {
    return Array.from(this.eligibleSymbolSet);
  }

  getEligibleSymbolCount(): number {
    return this.eligibleSymbolSet.size;
  }

  getExclusionDiagnostics(): ExclusionDiagnostic[] {
    return this.exclusionDiagnostics;
  }

  getLastUpdateTime(): number {
    return this.lastFetchTime;
  }
}

export const binanceDiscoveryService = new BinanceDiscoveryService();
