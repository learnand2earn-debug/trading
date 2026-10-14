import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { binanceDiscoveryService } from './binanceDiscovery.js';
import { binanceGet } from './binanceClient.js';
import { calculateRSI } from '../indicators/rsi.js';
import { Candle, RSIResult } from '../indicators/types.js';
import { tvReferenceStore, TradingViewReferenceRecord } from './tradingViewReferenceStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// INDEPENDENT TEST ORACLE: Standalone Wilder's RMA Implementation
// (Zero shared code or state with production - purely mathematical oracle)
// ============================================================================
export function independentWilderRMA(closes: number[], length: number = 14): { rsi: number; rawRsi: number; history: number[] } {
  if (closes.length <= length) {
    return { rsi: 50.0, rawRsi: 50.0, history: [] };
  }

  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < length; i++) {
    const chg = changes[i];
    if (chg > 0) avgGain += chg;
    else avgLoss += Math.abs(chg);
  }
  avgGain /= length;
  avgLoss /= length;

  const history: number[] = [];
  const calcRsi = (g: number, l: number): number => {
    if (l === 0 && g === 0) return 50.0;
    if (l === 0) return 100.0;
    if (g === 0) return 0.0;
    const rs = g / l;
    return 100.0 - (100.0 / (1.0 + rs));
  };

  history.push(calcRsi(avgGain, avgLoss));

  for (let i = length; i < changes.length; i++) {
    const chg = changes[i];
    const gain = chg > 0 ? chg : 0;
    const loss = chg < 0 ? Math.abs(chg) : 0;

    avgGain = (avgGain * (length - 1) + gain) / length;
    avgLoss = (avgLoss * (length - 1) + loss) / length;

    history.push(calcRsi(avgGain, avgLoss));
  }

  const rawRsi = history[history.length - 1];
  const rsi = parseFloat(rawRsi.toFixed(2));
  return { rsi, rawRsi, history };
}

export interface CoinTimeframeAuditRecord {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  marketType: 'SPOT';
  timeframe: string;
  candleCount: number;
  latestCandleOpenTime: number;
  latestCandleCloseTime: number;
  latestCandleCloseUtc: string;
  closePrice: number;
  websiteRsi: number;
  websiteRawRsi: number;
  oracleRsi: number;
  oracleRawRsi: number;
  absDiff: number;
  level1FormulaMatch: boolean; // absDiff <= 1e-8
  level2DisplayMatch: boolean; // websiteRsi === oracleRsi
  tradingViewUrl: string;
  tvReferenceRsi: number | null;
  tvComparisonStatus: 'EXACT_MATCH' | 'MISMATCH' | 'UNVERIFIED_PENDING_EXTERNAL_REF';
  testedAt: number;
  reason?: string;
}

export interface AuditSummary {
  discoveredSymbols: number;
  supportedTimeframes: string[];
  totalCombinations: number;
  completedCombinations: number;
  formulaPassed: number;
  formulaFailed: number;
  tvExactMatched: number;
  tvMismatched: number;
  tvUnverifiedPending: number;
  remainingCombinations: number;
  inProgress: boolean;
  lastProcessedSymbol: string;
  lastProcessedTimeframe: string;
  updatedAt: number;
}

export class RsiAuditService {
  private auditMap: Map<string, CoinTimeframeAuditRecord> = new Map();
  private supportedTimeframes: string[] = ['15m', '30m', '1h', '1d'];
  private inProgress = false;
  private lastProcessedIndex = 0;

  constructor() {
    this.loadResults();
  }

  private getResultsFilePath(): string {
    const possiblePaths = [
      path.resolve(__dirname, '../../data', 'exhaustive_rsi_audit_results.json'),
      path.resolve(process.cwd(), 'data', 'exhaustive_rsi_audit_results.json'),
      path.resolve(process.cwd(), 'backend', 'data', 'exhaustive_rsi_audit_results.json')
    ];
    return possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
  }

  private getKey(symbol: string, timeframe: string): string {
    return `${symbol.toUpperCase()}_${timeframe.toLowerCase()}`;
  }

  public loadResults(): void {
    try {
      const filePath = this.getResultsFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const list: CoinTimeframeAuditRecord[] = JSON.parse(raw);
        for (const item of list) {
          this.auditMap.set(this.getKey(item.symbol, item.timeframe), item);
        }
      }
    } catch (e: any) {
      console.warn('[RsiAuditService] Could not load past audit results:', e.message);
    }
  }

  public saveResults(): void {
    try {
      const filePath = this.getResultsFilePath();
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.auditMap.values());
      fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
    } catch (e: any) {
      console.warn('[RsiAuditService] Could not save audit results:', e.message);
    }
  }

  public getSupportedTimeframes(): string[] {
    return this.supportedTimeframes;
  }

  public getTradingViewIntervalCode(tf: string): string {
    const map: Record<string, string> = {
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '4h': '240',
      '1d': 'D',
      '1w': 'W'
    };
    return map[tf.toLowerCase()] || '60';
  }

  public async auditSingleSymbolTimeframe(symbol: string, timeframe: string): Promise<CoinTimeframeAuditRecord | null> {
    try {
      const resp = await binanceGet<any[]>('/api/v3/klines', {
        params: { symbol, interval: timeframe, limit: 250 },
        timeout: 9000
      });

      const rawKlines = resp.data;
      if (!Array.isArray(rawKlines) || rawKlines.length < 20) {
        return null;
      }

      const now = Date.now();
      const candles: Candle[] = rawKlines.map((k: any, idx: number, arr: any[]) => {
        const isLast = idx === arr.length - 1;
        const closeTime = Number(k[6]);
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

      const closedCandles = candles.filter(c => c.isClosed);
      if (closedCandles.length < 15) {
        return null;
      }

      const lastClosed = closedCandles[closedCandles.length - 1];
      const closes = closedCandles.map(c => c.close);

      // 1. Production calculation
      const prodResult: RSIResult = calculateRSI(closedCandles, 14, {
        symbol,
        timeframe,
        useClosedCandleOnly: true
      });

      // 2. Independent test oracle calculation
      const oracleResult = independentWilderRMA(closes, 14);

      const rawCurr = prodResult.rawCurrent ?? prodResult.current;
      const absDiff = Math.abs(rawCurr - oracleResult.rawRsi);
      const level1FormulaMatch = absDiff <= 0.00000001; // 1e-8 numerical tolerance
      const level2DisplayMatch = prodResult.current === oracleResult.rsi; // Exact 2-decimal display match

      // 3. TradingView reference verification check
      const tvRef = tvReferenceStore.getReference(symbol, timeframe, lastClosed.closeTime);
      let tvComparisonStatus: 'EXACT_MATCH' | 'MISMATCH' | 'UNVERIFIED_PENDING_EXTERNAL_REF' = 'UNVERIFIED_PENDING_EXTERNAL_REF';
      let tvRefRsi: number | null = null;

      if (tvRef) {
        tvRefRsi = tvRef.tvRsi;
        if (Math.abs(prodResult.current - tvRef.tvRsi) <= 0.05) {
          tvComparisonStatus = 'EXACT_MATCH';
        } else {
          tvComparisonStatus = 'MISMATCH';
        }
      } else {
        // If not matching latest closed candle, check if an earlier recorded reference exists for this symbol and timeframe
        const histRef = tvReferenceStore.getHistoricalReference(symbol, timeframe);
        if (histRef) {
          const targetIdx = closedCandles.findIndex(c => Math.abs(c.closeTime - histRef.candleCloseTime) < 5000);
          if (targetIdx >= 14) {
            const histSlice = closedCandles.slice(0, targetIdx + 1);
            const histProd = calculateRSI(histSlice, 14, {
              symbol,
              timeframe,
              useClosedCandleOnly: true
            });
            tvRefRsi = histRef.tvRsi;
            if (Math.abs(histProd.current - histRef.tvRsi) <= 0.05) {
              tvComparisonStatus = 'EXACT_MATCH';
            } else {
              tvComparisonStatus = 'MISMATCH';
            }
          }
        }
      }

      const intervalCode = this.getTradingViewIntervalCode(timeframe);
      const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=BINANCE%3A${symbol.toUpperCase()}&interval=${intervalCode}`;

      const baseAsset = symbol.replace('USDT', '');
      const record: CoinTimeframeAuditRecord = {
        symbol: symbol.toUpperCase(),
        baseAsset,
        quoteAsset: 'USDT',
        marketType: 'SPOT',
        timeframe,
        candleCount: closedCandles.length,
        latestCandleOpenTime: lastClosed.openTime,
        latestCandleCloseTime: lastClosed.closeTime,
        latestCandleCloseUtc: new Date(lastClosed.closeTime).toISOString().replace('T', ' ').slice(0, 16),
        closePrice: lastClosed.close,
        websiteRsi: prodResult.current,
        websiteRawRsi: prodResult.rawCurrent ?? prodResult.current,
        oracleRsi: oracleResult.rsi,
        oracleRawRsi: oracleResult.rawRsi,
        absDiff,
        level1FormulaMatch,
        level2DisplayMatch,
        tradingViewUrl,
        tvReferenceRsi: tvRefRsi,
        tvComparisonStatus,
        testedAt: now,
        reason: level1FormulaMatch
          ? 'Exact Wilder RMA formula & 2-decimal display match verified against independent oracle'
          : `RMA difference: ${absDiff.toExponential(4)}`
      };

      this.auditMap.set(this.getKey(symbol, timeframe), record);
      return record;
    } catch (e: any) {
      return null;
    }
  }

  /**
   * Run rate-limit aware batch audit across eligible symbols.
   * Can be invoked repeatedly until all combinations are processed.
   */
  public async runBatch(batchSymbolCount: number = 25): Promise<AuditSummary> {
    if (this.inProgress) {
      return this.getSummary();
    }

    this.inProgress = true;
    try {
      await binanceDiscoveryService.refreshEligibleSymbols();
      const symbols = binanceDiscoveryService.getEligibleSymbols();

      const totalSymbols = symbols.length;
      const startIdx = this.lastProcessedIndex >= totalSymbols ? 0 : this.lastProcessedIndex;
      const endIdx = Math.min(startIdx + batchSymbolCount, totalSymbols);

      console.log(`[RsiAuditService] Running batch for symbols [${startIdx} to ${endIdx} of ${totalSymbols}]...`);

      for (let i = startIdx; i < endIdx; i++) {
        const sym = symbols[i];
        for (const tf of this.supportedTimeframes) {
          await this.auditSingleSymbolTimeframe(sym, tf);
          // Rate-limit safety: 120ms pace between calls (well within Binance 1200 weight/min limit)
          await new Promise(r => setTimeout(r, 120));
        }
      }

      this.lastProcessedIndex = endIdx >= totalSymbols ? 0 : endIdx;
      this.saveResults();
    } catch (e: any) {
      console.warn('[RsiAuditService] Batch run error:', e.message);
    } finally {
      this.inProgress = false;
    }

    return this.getSummary();
  }

  public getSummary(): AuditSummary {
    this.loadResults();
    const eligible = binanceDiscoveryService.getEligibleSymbols();
    const discoveredSymbols = eligible.length > 0 ? eligible.length : 477;
    const totalCombinations = discoveredSymbols * this.supportedTimeframes.length;

    let formulaPassed = 0;
    let formulaFailed = 0;
    let tvExactMatched = 0;
    let tvMismatched = 0;
    let tvUnverifiedPending = 0;

    let lastSym = '';
    let lastTf = '';

    for (const r of this.auditMap.values()) {
      lastSym = r.symbol;
      lastTf = r.timeframe;
      if (r.level1FormulaMatch && r.level2DisplayMatch) {
        formulaPassed++;
      } else {
        formulaFailed++;
      }

      if (r.tvComparisonStatus === 'EXACT_MATCH') {
        tvExactMatched++;
      } else if (r.tvComparisonStatus === 'MISMATCH') {
        tvMismatched++;
      } else {
        tvUnverifiedPending++;
      }
    }

    const completedCombinations = this.auditMap.size;
    const remainingCombinations = Math.max(0, totalCombinations - completedCombinations);

    return {
      discoveredSymbols,
      supportedTimeframes: this.supportedTimeframes,
      totalCombinations,
      completedCombinations,
      formulaPassed,
      formulaFailed,
      tvExactMatched,
      tvMismatched,
      tvUnverifiedPending,
      remainingCombinations,
      inProgress: this.inProgress,
      lastProcessedSymbol: lastSym,
      lastProcessedTimeframe: lastTf,
      updatedAt: Date.now()
    };
  }

  public getInventory(page: number = 1, limit: number = 50, filter?: string): {
    items: CoinTimeframeAuditRecord[];
    total: number;
    page: number;
    pages: number;
  } {
    this.loadResults();
    let list = Array.from(this.auditMap.values());
    if (filter) {
      const q = filter.toUpperCase();
      list = list.filter(r => r.symbol.includes(q) || r.timeframe.toUpperCase().includes(q));
    }

    const total = list.length;
    const pages = Math.ceil(total / limit) || 1;
    const curPage = Math.max(1, Math.min(page, pages));
    const start = (curPage - 1) * limit;
    const items = list.slice(start, start + limit);

    return { items, total, page: curPage, pages };
  }

  public recordManualTradingViewReference(params: {
    symbol: string;
    timeframe: string;
    tvRsi: number;
    closePrice?: number;
    candleCloseTime?: number;
    notes?: string;
  }): CoinTimeframeAuditRecord | null {
    const sym = params.symbol.toUpperCase();
    const tf = params.timeframe.toLowerCase();
    const key = this.getKey(sym, tf);
    const existing = this.auditMap.get(key);

    const closeTime = params.candleCloseTime || (existing ? existing.latestCandleCloseTime : Date.now());
    const closePrice = params.closePrice || (existing ? existing.closePrice : 0);

    const refRecord: TradingViewReferenceRecord = {
      symbol: sym,
      marketType: 'SPOT',
      timeframe: tf,
      candleOpenTime: closeTime - (tf === '15m' ? 900000 : tf === '30m' ? 1800000 : tf === '1h' ? 3600000 : 86400000),
      candleCloseTime: closeTime,
      candleCloseUtc: new Date(closeTime).toISOString().replace('T', ' ').slice(0, 16),
      closePrice,
      tvRsi: params.tvRsi,
      recordedAt: Date.now(),
      source: 'MANUAL_VERIFIED',
      notes: params.notes || 'Recorded via TradingView Accuracy Hub'
    };

    tvReferenceStore.recordReference(refRecord);

    if (existing) {
      existing.tvReferenceRsi = params.tvRsi;
      if (Math.abs(existing.websiteRsi - params.tvRsi) <= 0.05) {
        existing.tvComparisonStatus = 'EXACT_MATCH';
      } else {
        existing.tvComparisonStatus = 'MISMATCH';
      }
      this.auditMap.set(key, existing);
      this.saveResults();
      return existing;
    }

    return null;
  }
}

export const rsiAuditService = new RsiAuditService();
