import { Candle, RSIResult } from './types.js';

export interface RSICalculationOptions {
  symbol?: string;
  timeframe?: string;
  useClosedCandleOnly?: boolean;
}

/**
 * Authoritative TradingView-Matched Wilder's RSI (RMA) Engine
 *
 * Implements TradingView's built-in default RSI:
 * - Length: 14 (or specified period)
 * - Source: Close
 * - Moving-Average: Wilder's RMA (Recursive Moving Average)
 * - Gains / Losses:
 *     Change = Close[t] - Close[t-1]
 *     Gain = max(Change, 0)
 *     Loss = max(-Change, 0)
 *     AvgGain[t] = ((AvgGain[t-1] * (Length - 1)) + Gain[t]) / Length
 *     AvgLoss[t] = ((AvgLoss[t-1] * (Length - 1)) + Loss[t]) / Length
 *     RS = AvgGain / AvgLoss
 *     RSI = 100 - (100 / (1 + RS))
 *
 * Full numerical precision is kept internally and rounded only for display.
 */
export function calculateRSI(
  candles: Candle[],
  period: number = 14,
  options?: RSICalculationOptions
): RSIResult {
  const now = Date.now();
  const symbol = options?.symbol;
  const timeframe = options?.timeframe;

  if (!candles || candles.length < period + 1) {
    return {
      current: 50,
      previous: 50,
      slope: 'FLAT',
      history: [],
      rawCurrent: 50,
      rawPrevious: 50,
      exchange: 'BINANCE',
      marketType: 'SPOT',
      symbol,
      timeframe,
      candleStatus: (!candles || candles.length === 0) ? 'UNAVAILABLE' : 'CLOSED',
      period,
      source: 'close',
      method: 'WILDER_RMA',
      lastUpdated: now,
      isInsufficientData: true
    };
  }

  const rawCandles = options?.useClosedCandleOnly
    ? candles.filter(c => c.isClosed)
    : candles;

  // Deduplicate candles by openTime and sort chronologically
  const timeMap = new Map<number, Candle>();
  for (const c of rawCandles) {
    timeMap.set(c.openTime, c);
  }
  const activeCandles = Array.from(timeMap.values()).sort((a, b) => a.openTime - b.openTime);

  if (activeCandles.length < period + 1) {
    return {
      current: 50,
      previous: 50,
      slope: 'FLAT',
      history: [],
      rawCurrent: 50,
      rawPrevious: 50,
      exchange: 'BINANCE',
      marketType: 'SPOT',
      symbol,
      timeframe,
      candleStatus: 'CLOSED',
      period,
      source: 'close',
      method: 'WILDER_RMA',
      lastUpdated: now,
      isInsufficientData: true
    };
  }

  const closes = activeCandles.map(c => c.close);
  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  // 1. Initial SMA period for Wilder RMA initialization
  let initialGain = 0;
  let initialLoss = 0;

  for (let i = 0; i < period; i++) {
    const chg = changes[i];
    if (chg >= 0) initialGain += chg;
    else initialLoss += Math.abs(chg);
  }

  let avgGain = initialGain / period;
  let avgLoss = initialLoss / period;

  const rawHistory: number[] = [];
  const roundedHistory: number[] = [];

  const computeRsiFromAverages = (gain: number, loss: number): number => {
    if (loss === 0 && gain === 0) return 50.0;
    if (loss === 0) return 100.0;
    if (gain === 0) return 0.0;
    const rs = gain / loss;
    return 100.0 - (100.0 / (1.0 + rs));
  };

  const initialRsi = computeRsiFromAverages(avgGain, avgLoss);
  rawHistory.push(initialRsi);
  roundedHistory.push(parseFloat(initialRsi.toFixed(2)));

  // 2. Wilder's Recursive Smoothing (RMA) for all remaining candles
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rsiVal = computeRsiFromAverages(avgGain, avgLoss);
    rawHistory.push(rsiVal);
    roundedHistory.push(parseFloat(rsiVal.toFixed(2)));
  }

  const rawCurrent = rawHistory[rawHistory.length - 1] ?? 50.0;
  const rawPrevious = rawHistory[rawHistory.length - 2] ?? rawCurrent;

  const current = roundedHistory[roundedHistory.length - 1] ?? 50.0;
  const previous = roundedHistory[roundedHistory.length - 2] ?? current;

  let slope: 'RISING' | 'FALLING' | 'FLAT' = 'FLAT';
  if (rawCurrent > rawPrevious + 0.05) slope = 'RISING';
  else if (rawCurrent < rawPrevious - 0.05) slope = 'FALLING';

  const lastCandle = activeCandles[activeCandles.length - 1];
  const isLastClosed = Boolean(lastCandle.isClosed);

  // Closed candle RSI vs Live candle RSI calculation
  let closedCandleRsi: number;
  let liveCandleRsi: number;

  if (isLastClosed) {
    closedCandleRsi = current;
    liveCandleRsi = current;
  } else {
    // Current is live open candle RSI, previous is last finalized closed candle RSI
    liveCandleRsi = current;
    closedCandleRsi = previous;
  }

  return {
    current,
    previous,
    slope,
    history: roundedHistory,
    rawCurrent,
    rawPrevious,
    exchange: 'BINANCE',
    marketType: 'SPOT',
    symbol,
    timeframe,
    candleStatus: isLastClosed ? 'CLOSED' : 'OPEN',
    period,
    source: 'close',
    method: 'WILDER_RMA',
    candleOpenTime: lastCandle.openTime,
    candleCloseTime: lastCandle.closeTime,
    lastUpdated: now,
    closedCandleRsi,
    liveCandleRsi,
    isInsufficientData: false
  };
}

export function isRSIInZone(rsi: number, minZone: number = 25, maxZone: number = 40): boolean {
  return rsi >= minZone && rsi <= maxZone;
}

export function isRSICrossingAbove(prevRsi: number, currRsi: number, threshold: number = 54): boolean {
  return prevRsi < threshold && currRsi >= threshold;
}

/**
 * 30M RSI Leadership Evaluation:
 * Source requirement: 1H RSI is led/confirmed by 30M RSI.
 * Checks upward progression across recent 30M bars and/or level leadership (30M RSI >= 1H RSI).
 */
export function evaluate30MLeadership(
  rsi1H: RSIResult,
  rsi30M: RSIResult,
  options?: { requireHigherThan1H?: boolean; minPositiveBars?: number }
): { leads: boolean; reason: string } {
  const minBars = options?.minPositiveBars ?? 2;
  const hist30M = rsi30M.history.slice(-minBars - 1);

  if (hist30M.length < minBars + 1) {
    const isDirectLead = rsi30M.current >= rsi1H.current;
    return {
      leads: isDirectLead,
      reason: isDirectLead
        ? `30M RSI (${rsi30M.current}) is above 1H RSI (${rsi1H.current})`
        : `30M RSI (${rsi30M.current}) does not lead 1H RSI (${rsi1H.current})`
    };
  }

  // Check upward progression over the recent 30M bars
  let isProgressingUp = true;
  for (let i = 1; i < hist30M.length; i++) {
    if (hist30M[i] <= hist30M[i - 1]) {
      isProgressingUp = false;
      break;
    }
  }

  const isLeadingLevel = rsi30M.current >= (rsi1H.current - 0.2);
  const isRising = rsi30M.slope === 'RISING';

  if (isProgressingUp || (isRising && isLeadingLevel)) {
    return {
      leads: true,
      reason: `30M RSI (${rsi30M.current}) positively leading 1H RSI (${rsi1H.current}) with upward progression`
    };
  }

  if (isLeadingLevel) {
    return {
      leads: true,
      reason: `30M RSI (${rsi30M.current}) is above 1H RSI (${rsi1H.current})`
    };
  }

  return {
    leads: false,
    reason: `30M RSI (${rsi30M.current}) does not show positive leadership over 1H RSI (${rsi1H.current})`
  };
}

/**
 * Checks if RSI is in consolidation (na up ho na down ho - flat / range-bound)
 * Diff between current and previous RSI is within threshold (e.g. <= 2.8) or slope is FLAT
 */
export function isRSIConsolidating(rsi: RSIResult, maxChange: number = 2.8): boolean {
  const diff = Math.abs(rsi.current - rsi.previous);
  return diff <= maxChange || rsi.slope === 'FLAT';
}
