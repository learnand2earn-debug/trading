import { v4 as uuidv4 } from 'uuid';
import { Candle } from '../indicators/types.js';
import { evaluatePriceAction } from '../strategies/priceAction.js';
import { evaluateV1Method } from '../strategies/v1Method.js';
import { evaluateGainersMethod } from '../strategies/gainersMethod.js';
import { evaluateHiddenBullish } from '../strategies/hiddenBullish.js';
import { evaluateV1Ema } from '../strategies/v1Ema.js';
import { evaluateOBMethod } from '../strategies/obMethod.js';
import { evaluateICTMethod } from '../strategies/ictMethod.js';
import { StrategySignalResult } from '../strategies/types.js';
import { CoinGlassLiquiditySnapshot } from '../market-data/coinglass.js';

export interface BacktestRequest {
  strategyCode: string;
  strategyVersion?: string;
  symbol: string;
  initialBalanceUSD?: number;
  positionSizeUSD?: number;
  targetPct?: number; // default 1.0%
  feePct?: number; // default 0.1%
  slippagePct?: number; // default 0.05%
  candles1D: Candle[];
  candles1H: Candle[];
  candles30M: Candle[];
  candles15M: Candle[];
}

export interface BacktestTradeResult {
  entryIndex: number;
  entryTime: number;
  entryPrice: number;
  exitTime: number;
  exitPrice: number;
  grossPnl: number;
  grossPnlPct: number;
  fees: number;
  netPnl: number;
  netPnlPct: number;
  reason: 'TARGET_REACHED' | 'STOP_LOSS' | 'TIME_EXIT';
  strategyCode: string;
  strategyVersion: string;
}

export interface BacktestReport {
  id: string;
  strategyCode: string;
  strategyVersion: string;
  symbol: string;
  initialBalance: number;
  finalBalance: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  grossPnlUSD: number;
  netPnlUSD: number;
  feesUSD: number;
  maxDrawdownPct: number;
  avgHoldingBars: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  trades: BacktestTradeResult[];
}

export class BacktestEngine {
  runBacktest(req: BacktestRequest): BacktestReport {
    const initialBalance = req.initialBalanceUSD ?? 10000;
    const posSize = req.positionSizeUSD ?? 500;
    const targetPct = req.targetPct ?? 1.0;
    const feeRate = (req.feePct ?? 0.1) / 100;
    const slipRate = (req.slippagePct ?? 0.05) / 100;

    let balance = initialBalance;
    let peakBalance = initialBalance;
    let maxDrawdown = 0;
    const trades: BacktestTradeResult[] = [];

    let currentWinStreak = 0;
    let maxWinStreak = 0;
    let currentLossStreak = 0;
    let maxLossStreak = 0;
    let totalHoldingBars = 0;

    const candles1H = req.candles1H;
    const minLookback = 35; // minimum history required for EMAs and RSI

    // Walk forward candle-by-candle (Strictly NO look-ahead bias)
    for (let i = minLookback; i < candles1H.length - 1; i++) {
      const slice1H = candles1H.slice(0, i + 1);
      const currentTime = slice1H[slice1H.length - 1].closeTime;

      // Filter other timeframes up to currentTime
      const slice1D = req.candles1D.filter(c => c.closeTime <= currentTime);
      const slice30M = req.candles30M.filter(c => c.closeTime <= currentTime);
      const slice15M = req.candles15M.filter(c => c.closeTime <= currentTime);

      // Evaluate selected strategy using historical slice
      let signalResult: StrategySignalResult | null = null;

      if (req.strategyCode === 'PRICE_ACTION') {
        const mockLiq: CoinGlassLiquiditySnapshot = {
          symbol: req.symbol,
          source: 'coinglass',
          exchange: 'binance',
          timestamp: currentTime,
          timeframe: '24h',
          dataAgeSeconds: 0,
          liquidityAboveUSD: 5000000,
          liquidityBelowUSD: 5000000,
          nearestPoolPrice: slice1H[slice1H.length - 1].close * 0.99,
          distancePct: 1.0,
          freshnessStatus: 'FRESH',
          responseStatus: 'HISTORICAL_CACHE'
        };
        signalResult = evaluatePriceAction(req.symbol, slice1D, slice1H, slice30M, mockLiq);
      } else if (req.strategyCode === 'V1_METHOD') {
        signalResult = evaluateV1Method(req.symbol, slice1D, slice1H, slice30M);
      } else if (req.strategyCode === 'GAINERS_METHOD') {
        signalResult = evaluateGainersMethod(req.symbol, slice1H, 2, 38.5, ['USDT', 'USDC', 'FDUSD'], false, false, false);
      } else if (req.strategyCode === 'HIDDEN_BULLISH') {
        signalResult = evaluateHiddenBullish(req.symbol, slice1H, slice30M);
      } else if (req.strategyCode === 'V1_EMA') {
        signalResult = evaluateV1Ema(req.symbol, slice1D, slice1H, slice30M);
      } else if (req.strategyCode === 'OB_METHOD') {
        signalResult = evaluateOBMethod(req.symbol, slice1H, slice15M);
      } else if (req.strategyCode === 'ICT_METHOD') {
        signalResult = evaluateICTMethod(req.symbol, slice1H);
      }

      if (signalResult && signalResult.signalValid) {
        // Entry at next candle open with slippage
        const entryCandle = candles1H[i + 1];
        if (!entryCandle) break;

        const entryPrice = entryCandle.open * (1 + slipRate);
        const targetPrice = entryPrice * (1 + targetPct / 100);
        const stopLoss = signalResult.stopLossPrice ?? entryPrice * 0.988;
        const qty = posSize / entryPrice;

        // Forward simulation for this trade
        let exitPrice = 0;
        let exitTime = 0;
        let exitReason: 'TARGET_REACHED' | 'STOP_LOSS' | 'TIME_EXIT' = 'TIME_EXIT';
        let holdingBars = 0;

        for (let j = i + 1; j < Math.min(candles1H.length, i + 48); j++) {
          const testBar = candles1H[j];
          holdingBars++;

          if (testBar.high >= targetPrice) {
            exitPrice = targetPrice * (1 - slipRate);
            exitTime = testBar.closeTime;
            exitReason = 'TARGET_REACHED';
            break;
          } else if (testBar.low <= stopLoss) {
            exitPrice = stopLoss * (1 - slipRate);
            exitTime = testBar.closeTime;
            exitReason = 'STOP_LOSS';
            break;
          }
        }

        if (exitPrice === 0) {
          // Time exit at current close
          const lastBar = candles1H[Math.min(candles1H.length - 1, i + 48)];
          exitPrice = lastBar.close * (1 - slipRate);
          exitTime = lastBar.closeTime;
          exitReason = 'TIME_EXIT';
        }

        const grossPnl = (exitPrice - entryPrice) * qty;
        const grossPnlPct = ((exitPrice - entryPrice) / entryPrice) * 100;
        const fee = (entryPrice * qty + exitPrice * qty) * feeRate;
        const netPnl = grossPnl - fee;
        const netPnlPct = (netPnl / (entryPrice * qty)) * 100;

        balance += netPnl;
        if (balance > peakBalance) peakBalance = balance;
        const dd = ((peakBalance - balance) / peakBalance) * 100;
        if (dd > maxDrawdown) maxDrawdown = dd;

        if (netPnl > 0) {
          currentWinStreak++;
          currentLossStreak = 0;
          if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
        } else {
          currentLossStreak++;
          currentWinStreak = 0;
          if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
        }

        totalHoldingBars += holdingBars;

        trades.push({
          entryIndex: i + 1,
          entryTime: entryCandle.openTime,
          entryPrice: parseFloat(entryPrice.toFixed(4)),
          exitTime,
          exitPrice: parseFloat(exitPrice.toFixed(4)),
          grossPnl: parseFloat(grossPnl.toFixed(4)),
          grossPnlPct: parseFloat(grossPnlPct.toFixed(2)),
          fees: parseFloat(fee.toFixed(4)),
          netPnl: parseFloat(netPnl.toFixed(4)),
          netPnlPct: parseFloat(netPnlPct.toFixed(2)),
          reason: exitReason,
          strategyCode: req.strategyCode,
          strategyVersion: 'v1.0'
        });

        // Fast-forward i past this trade to avoid overlapping entries on same coin
        i += holdingBars;
      }
    }

    const wins = trades.filter(t => t.netPnl > 0).length;
    const losses = trades.filter(t => t.netPnl <= 0).length;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
    const grossTotal = trades.reduce((s, t) => s + t.grossPnl, 0);
    const netTotal = trades.reduce((s, t) => s + t.netPnl, 0);
    const feesTotal = trades.reduce((s, t) => s + t.fees, 0);

    return {
      id: `bkt-${uuidv4()}`,
      strategyCode: req.strategyCode,
      strategyVersion: req.strategyVersion || 'v1.0',
      symbol: req.symbol,
      initialBalance,
      finalBalance: parseFloat(balance.toFixed(2)),
      totalTrades: trades.length,
      winningTrades: wins,
      losingTrades: losses,
      winRatePct: parseFloat(winRate.toFixed(2)),
      grossPnlUSD: parseFloat(grossTotal.toFixed(2)),
      netPnlUSD: parseFloat(netTotal.toFixed(2)),
      feesUSD: parseFloat(feesTotal.toFixed(2)),
      maxDrawdownPct: parseFloat(maxDrawdown.toFixed(2)),
      avgHoldingBars: trades.length > 0 ? Math.round(totalHoldingBars / trades.length) : 0,
      consecutiveWins: maxWinStreak,
      consecutiveLosses: maxLossStreak,
      trades
    };
  }
}

export const backtestEngine = new BacktestEngine();
