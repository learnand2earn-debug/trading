import { Candle, DivergencePivot, HiddenBullishDivergenceResult } from './types.js';
import { calculateRSI } from './rsi.js';
import { evaluateSourceHiddenBullish } from './candlePatterns.js';

export interface DivergenceDetectionConfig {
  leftBars: number;
  rightBars: number;
  minBarDistance: number;
  maxBarDistance: number;
  lookbackBars: number;
}

export const defaultDivergenceConfig: DivergenceDetectionConfig = {
  leftBars: 3,
  rightBars: 2,
  minBarDistance: 4,
  maxBarDistance: 45,
  lookbackBars: 60
};

/**
 * Detects Hidden Bullish Divergence on Binance candles:
 * - Higher Low in Price (Low2 > Low1)
 * - Lower Low in RSI (Rsi2 < Rsi1)
 *
 * Uses strictly closed, confirmed pivot swing lows (delay = rightBars)
 * without future-candle lookahead bias.
 */
export function detectHiddenBullishDivergence(
  candles: Candle[],
  config: DivergenceDetectionConfig = defaultDivergenceConfig
): HiddenBullishDivergenceResult {
  // Source drop structure calculation for comparison/confluence
  const sourcePattern = evaluateSourceHiddenBullish(candles, 10, 0.8, 0.3);

  if (candles.length < config.lookbackBars) {
    return {
      detected: false,
      isConfirmed: false,
      confirmationDelayBars: config.rightBars,
      reason: 'Insufficient candle history for divergence detection',
      sourceStructureMatched: sourcePattern.matched,
      downwardPct: sourcePattern.downwardPct,
      reactionPct: sourcePattern.reactionPct
    };
  }

  // 1. Calculate authoritative Wilder RSI across all candles
  const rsiResult = calculateRSI(candles, 14);
  const rsiHistory = rsiResult.history; // aligned with candles starting from index 14

  // Offset between candles array and rsiHistory array:
  // rsiHistory[0] corresponds to candle[14]
  const rsiOffset = 14;

  const confirmedPivots: DivergencePivot[] = [];

  // 2. Identify confirmed swing low pivots in Price and RSI
  // A swing low at candle 'i' is confirmed only when candle 'i + rightBars' is closed
  const maxEvalIndex = candles.length - config.rightBars;

  for (let i = Math.max(rsiOffset + config.leftBars, candles.length - config.lookbackBars); i < maxEvalIndex; i++) {
    const candidateCandle = candles[i];
    const candidateRsiIndex = i - rsiOffset;

    if (candidateRsiIndex < 0 || candidateRsiIndex >= rsiHistory.length) continue;
    const candidateRsi = rsiHistory[candidateRsiIndex];

    let isPriceLow = true;
    for (let j = i - config.leftBars; j <= i + config.rightBars; j++) {
      if (j === i) continue;
      if (candles[j].low < candidateCandle.low) {
        isPriceLow = false;
        break;
      }
    }

    if (isPriceLow) {
      confirmedPivots.push({
        index: i,
        timestamp: candidateCandle.openTime,
        price: candidateCandle.low,
        rsi: candidateRsi,
        isConfirmed: true
      });
    }
  }

  // 3. Search for Hidden Bullish Divergence between the two most recent confirmed swing lows
  if (confirmedPivots.length >= 2) {
    const p2 = confirmedPivots[confirmedPivots.length - 1]; // Most recent swing low
    const p1 = confirmedPivots[confirmedPivots.length - 2]; // Preceding swing low

    const barDistance = p2.index - p1.index;

    if (barDistance >= config.minBarDistance && barDistance <= config.maxBarDistance) {
      // Hidden Bullish: Price Higher Low (Low2 > Low1) AND RSI Lower Low (Rsi2 < Rsi1)
      const isPriceHigherLow = p2.price > p1.price * 1.0005; // clear higher low
      const isRsiLowerLow = p2.rsi < p1.rsi - 0.4; // clear lower low in RSI

      if (isPriceHigherLow && isRsiLowerLow) {
        const p1Time = new Date(p1.timestamp).toISOString().slice(11, 16);
        const p2Time = new Date(p2.timestamp).toISOString().slice(11, 16);

        return {
          detected: true,
          pivot1: p1,
          pivot2: p2,
          priceLow1: p1.price,
          priceLow2: p2.price,
          rsiLow1: p1.rsi,
          rsiLow2: p2.rsi,
          isConfirmed: true,
          confirmationDelayBars: config.rightBars,
          reason: `Hidden Bullish Divergence: Price Higher Low (${p1.price} at ${p1Time} -> ${p2.price} at ${p2Time}) with RSI Lower Low (${p1.rsi} -> ${p2.rsi})`,
          sourceStructureMatched: sourcePattern.matched,
          downwardPct: sourcePattern.downwardPct,
          reactionPct: sourcePattern.reactionPct
        };
      }
    }
  }

  // If classic two-pivot divergence not formed, check if source pattern structure matched
  return {
    detected: false,
    isConfirmed: false,
    confirmationDelayBars: config.rightBars,
    reason: `No confirmed divergence. Pivots found: ${confirmedPivots.length}. Source drop=${sourcePattern.downwardPct}%, reaction=${sourcePattern.reactionPct}%`,
    sourceStructureMatched: sourcePattern.matched,
    downwardPct: sourcePattern.downwardPct,
    reactionPct: sourcePattern.reactionPct
  };
}
