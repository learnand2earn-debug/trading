import { Candle, RSIResult } from './types.js';

export function calculateRSI(candles: Candle[], period: number = 14): RSIResult {
  if (candles.length < period + 1) {
    return {
      current: 50,
      previous: 50,
      slope: 'FLAT',
      history: []
    };
  }

  const closes = candles.map(c => c.close);
  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] >= 0) gains += changes[i];
    else losses += Math.abs(changes[i]);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const rsiHistory: number[] = [];
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsiHistory.push(100 - (100 / (1 + rs)));

  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    rsiHistory.push(parseFloat(rsi.toFixed(2)));
  }

  const current = rsiHistory[rsiHistory.length - 1] ?? 50;
  const previous = rsiHistory[rsiHistory.length - 2] ?? current;

  let slope: 'RISING' | 'FALLING' | 'FLAT' = 'FLAT';
  if (current > previous + 0.1) slope = 'RISING';
  else if (current < previous - 0.1) slope = 'FALLING';

  return {
    current,
    previous,
    slope,
    history: rsiHistory
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
 * Example in handwritten notes: 1H RSI is ~53 and 30M RSI progresses upward (e.g. 54 -> 55 -> 56).
 */
export function evaluate30MLeadership(
  rsi1H: RSIResult,
  rsi30M: RSIResult,
  options?: { requireHigherThan1H?: boolean; minPositiveBars?: number }
): { leads: boolean; reason: string } {
  const minBars = options?.minPositiveBars ?? 2;
  const hist30M = rsi30M.history.slice(-minBars - 1);

  if (hist30M.length < minBars + 1) {
    return { leads: false, reason: 'Insufficient 30M RSI history to verify leadership' };
  }

  // Check upward progression over the recent 30M bars
  let isProgressingUp = true;
  for (let i = 1; i < hist30M.length; i++) {
    if (hist30M[i] <= hist30M[i - 1]) {
      isProgressingUp = false;
      break;
    }
  }

  const isLeadingLevel = rsi30M.current >= rsi1H.current;
  const isRising = rsi30M.slope === 'RISING';

  if (isProgressingUp || (isRising && isLeadingLevel)) {
    return {
      leads: true,
      reason: `30M RSI (${rsi30M.current}) positively leading 1H RSI (${rsi1H.current}) with upward progression`
    };
  }

  return {
    leads: false,
    reason: `30M RSI (${rsi30M.current}) does not show positive leadership over 1H RSI (${rsi1H.current})`
  };
}
