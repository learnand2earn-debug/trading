import { Candle, EMAResult } from './types.js';

export function calculateEMA(values: number[], length: number): number[] {
  if (values.length === 0) return [];
  if (values.length < length) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return new Array(values.length).fill(avg);
  }

  const k = 2 / (length + 1);
  const emaArray: number[] = [];

  // Initial SMA
  let sum = 0;
  for (let i = 0; i < length; i++) {
    sum += values[i];
  }
  let prevEma = sum / length;
  for (let i = 0; i < length - 1; i++) {
    emaArray.push(prevEma);
  }
  emaArray.push(prevEma);

  for (let i = length; i < values.length; i++) {
    const currentEma = values[i] * k + prevEma * (1 - k);
    emaArray.push(currentEma);
    prevEma = currentEma;
  }

  return emaArray;
}

export function evaluateEMA9EMA33(candles: Candle[]): EMAResult {
  if (candles.length < 35) {
    return {
      ema9: 0,
      ema33: 0,
      isBullishCross: false,
      isAboveBoth: false,
      retestDetected: false
    };
  }

  const closes = candles.map(c => c.close);
  const ema9Series = calculateEMA(closes, 9);
  const ema33Series = calculateEMA(closes, 33);

  const len = closes.length;
  const curr9 = ema9Series[len - 1];
  const curr33 = ema33Series[len - 1];
  const prev9 = ema9Series[len - 2];
  const prev33 = ema33Series[len - 2];

  // Bullish cross: EMA 9 crosses EMA 33 from below
  const isBullishCross = prev9 <= prev33 && curr9 > curr33;

  const currentCandle = candles[len - 1];
  const prevCandle = candles[len - 2];
  const isAboveBoth = currentCandle.close > curr9 && currentCandle.close > curr33;

  // Retest Detection:
  // Tolerance band around EMA9: 0.2%
  const tolerance = curr9 * 0.0025;
  const ema9High = curr9 + tolerance;
  const ema9Low = curr9 - tolerance;

  // Check touch on current or previous candle
  const currTouched = currentCandle.low <= ema9High && currentCandle.high >= ema9Low;
  const prevTouched = prevCandle ? (prevCandle.low <= ema9High && prevCandle.high >= ema9Low) : false;

  const isGreenReaction = currentCandle.close >= currentCandle.open;

  let retestDetected = false;
  let retestType: 'CROSS_RETEST' | 'WICK_TOUCH_ABOVE' | undefined;

  if ((currTouched || prevTouched) && isGreenReaction) {
    if (isBullishCross || (prev9 > prev33 && ema9Series[len - 4] <= ema33Series[len - 4])) {
      retestDetected = true;
      retestType = 'CROSS_RETEST';
    } else if (prevCandle.close > prev9 && currentCandle.low <= curr9 && currentCandle.close > curr9) {
      retestDetected = true;
      retestType = 'WICK_TOUCH_ABOVE';
    }
  }

  return {
    ema9: parseFloat(curr9.toFixed(6)),
    ema33: parseFloat(curr33.toFixed(6)),
    isBullishCross,
    isAboveBoth,
    retestDetected,
    retestType
  };
}
