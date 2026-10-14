import { Candle, ICTPatternResult } from './types.js';

/**
 * Strategy 4 — Source Hidden Bullish Pattern
 * NOT textbook divergence!
 * Inspects previous ~10 candles for downward movement structure followed by upward reaction.
 */
export function evaluateSourceHiddenBullish(
  candles: Candle[],
  lookback: number = 10,
  minDownwardPct: number = 0.8,
  minUpwardReactionPct: number = 0.3
): { matched: boolean; downwardPct: number; reactionPct: number; reason: string } {
  if (candles.length < lookback + 2) {
    return { matched: false, downwardPct: 0, reactionPct: 0, reason: 'Insufficient candle history' };
  }

  const window = candles.slice(-lookback - 1);
  const current = window[window.length - 1];

  // Find the highest high in the first 70% of the window
  const splitIdx = Math.floor(window.length * 0.7);
  const earlyWindow = window.slice(0, splitIdx);
  const peak = Math.max(...earlyWindow.map(c => c.high));

  // Find lowest trough between peak and current candle
  const lateWindow = window.slice(splitIdx - 1, -1);
  const trough = Math.min(...lateWindow.map(c => c.low));

  const downwardPct = ((peak - trough) / peak) * 100;
  const reactionPct = ((current.close - trough) / trough) * 100;

  const hasDownwardStructure = downwardPct >= minDownwardPct;
  const hasUpwardReaction = reactionPct >= minUpwardReactionPct && current.close >= current.open;

  if (hasDownwardStructure && hasUpwardReaction) {
    return {
      matched: true,
      downwardPct: parseFloat(downwardPct.toFixed(2)),
      reactionPct: parseFloat(reactionPct.toFixed(2)),
      reason: `Source 10-candle downward drop (-${downwardPct.toFixed(2)}%) followed by bullish upward reaction (+${reactionPct.toFixed(2)}%)`
    };
  }

  return {
    matched: false,
    downwardPct: parseFloat(downwardPct.toFixed(2)),
    reactionPct: parseFloat(reactionPct.toFixed(2)),
    reason: `Pattern not matched: downward=${downwardPct.toFixed(2)}% (need >=${minDownwardPct}%), reaction=${reactionPct.toFixed(2)}%`
  };
}

/**
 * Strategy 7 — Source ICT Pattern
 * 1H RSI: 30-40
 * Current candle green, previous candle red
 * 2 or 3 green candles with ~1% pump pattern
 * Trendline cross/bounce condition (marked ambiguous)
 */
export function evaluateSourceICTPattern(
  candles: Candle[],
  rsi1H: number,
  options?: {
    rsiMin?: number;
    rsiMax?: number;
    greenCount?: 2 | 3;
    pumpPctTarget?: number;
    trendlineInterpretation?: 'BREAKOUT' | 'BOUNCE';
  }
): ICTPatternResult {
  const rsiMin = options?.rsiMin ?? 30;
  const rsiMax = options?.rsiMax ?? 40;
  const reqGreenCount = options?.greenCount ?? 2;
  const pumpTarget = options?.pumpPctTarget ?? 0.8; // ~1% pump
  const interpretation = options?.trendlineInterpretation ?? 'BREAKOUT';

  if (candles.length < 10) {
    return {
      rsiValid: false,
      prevIsRed: false,
      currIsGreen: false,
      greenCandleCount: 0,
      pumpPct: 0,
      trendlinePassed: false,
      trend1HValid: false
    };
  }

  const curr = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  const currIsGreen = curr.close > curr.open;
  const prevIsRed = prev.close < prev.open;
  const rsiValid = rsi1H >= rsiMin && rsi1H <= rsiMax;

  // Check green candles sequence before the red candle
  let greenCountFound = 0;
  let pumpStart = 0;
  let pumpEnd = 0;

  for (let i = candles.length - 3; i >= Math.max(0, candles.length - 8); i--) {
    const c = candles[i];
    if (c.close > c.open) {
      greenCountFound++;
      if (pumpEnd === 0) pumpEnd = c.close;
      pumpStart = c.open;
      if (greenCountFound >= reqGreenCount) break;
    } else {
      // red candle interrupted before reaching required green count
      if (greenCountFound > 0) break;
    }
  }

  const pumpPct = pumpStart > 0 ? ((pumpEnd - pumpStart) / pumpStart) * 100 : 0;
  const pumpConditionMet = pumpPct >= pumpTarget * 0.7; // approximately 1% pump

  // Trendline evaluation based on interpretation
  let trendlinePassed = false;
  if (interpretation === 'BREAKOUT') {
    trendlinePassed = curr.close > Math.max(prev.high, candles[candles.length - 3].high);
  } else {
    // BOUNCE
    trendlinePassed = curr.low >= prev.low && currIsGreen;
  }

  return {
    rsiValid,
    prevIsRed,
    currIsGreen,
    greenCandleCount: greenCountFound,
    pumpPct: parseFloat(pumpPct.toFixed(2)),
    trendlinePassed,
    trend1HValid: true // will be checked against 1H trend (not sideways)
  };
}

/**
 * Strategy 3 — Gainers Method Calculations
 * Calculates ~40% pump, post-pump seller activity, and coin restrictions.
 */
export function evaluateGainersMetrics(
  candles: Candle[],
  dailyChangePct: number,
  tradingPairs: string[],
  isMonitored: boolean,
  isDelisting: boolean,
  isNew: boolean
): {
  isTopGainerEligible: boolean;
  pumpPct: number;
  pairsValid: boolean;
  notRestricted: boolean;
  postPumpHealthy: boolean;
  explanation: string;
} {
  // Required pairs: coin must trade against 3 relevant pairs (e.g. USDT, USDC, FDUSD)
  const reqPairs = ['USDT', 'USDC', 'FDUSD'];
  const matchingPairs = reqPairs.filter(rp => tradingPairs.some(tp => tp.includes(rp)));
  const pairsValid = matchingPairs.length >= 3 || tradingPairs.length >= 3;

  // Source condition: "Monitoring mai na ho" -> isMonitored must be FALSE
  const notRestricted = !isMonitored && !isDelisting && !isNew;

  // 40% pump calculation over 24h or recent candles
  const pumpPct = dailyChangePct;
  const isAround40Pump = pumpPct >= 32.0; // approximately 40% pump

  // Post-pump condition: coin should not be dumping parabolically, sellers not completely inactive
  if (!candles || candles.length < 5) {
    return {
      isTopGainerEligible: false,
      pumpPct: parseFloat((pumpPct || 0).toFixed(2)),
      pairsValid,
      notRestricted,
      postPumpHealthy: false,
      explanation: `Gainers Check: Insufficient 1H candle history (${candles ? candles.length : 0}/5 candles)`
    };
  }

  const last5 = candles.slice(-5);
  const avgVolume = last5.reduce((s, c) => s + (c?.volume || 0), 0) / 5;
  const lastCandle = last5[last5.length - 1];
  const lastVolume = lastCandle?.volume || 0;
  const lastClose = lastCandle?.close || 0;
  const lastLow = lastCandle?.low || 0;
  const sellersActive = lastVolume >= avgVolume * 0.3; // seller/buyer turnover active
  const notCrashing = lastClose >= lastLow * 1.002;

  const postPumpHealthy = sellersActive && notCrashing;
  const isTopGainerEligible = isAround40Pump && pairsValid && notRestricted && postPumpHealthy;

  return {
    isTopGainerEligible,
    pumpPct: parseFloat(pumpPct.toFixed(2)),
    pairsValid,
    notRestricted,
    postPumpHealthy,
    explanation: `Gainers Check: Pump = ${pumpPct.toFixed(1)}% (approx 40%), Pairs = [${tradingPairs.slice(0, 3).join(', ')}], Restricted = ${!notRestricted} (Monitoring: ${isMonitored}), PostPump = ${postPumpHealthy}`
  };
}
