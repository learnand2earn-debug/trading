import { Candle, TrendDirection, TrendResult } from './types.js';

export function detectTrend(candles: Candle[], lookback: number = 20): TrendResult {
  if (candles.length < lookback) {
    return {
      direction: 'SIDEWAYS',
      strength: 50,
      higherHighs: false,
      higherLows: false
    };
  }

  const window = candles.slice(-lookback);
  const closes = window.map(c => c.close);
  const highs = window.map(c => c.high);
  const lows = window.map(c => c.low);

  // Divide lookback into two halves to compare swing pivots
  const mid = Math.floor(window.length / 2);
  const firstHalfHigh = Math.max(...highs.slice(0, mid));
  const secondHalfHigh = Math.max(...highs.slice(mid));
  const firstHalfLow = Math.min(...lows.slice(0, mid));
  const secondHalfLow = Math.min(...lows.slice(mid));

  const higherHighs = secondHalfHigh > firstHalfHigh * 1.002;
  const higherLows = secondHalfLow > firstHalfLow * 1.002;
  const lowerHighs = secondHalfHigh < firstHalfHigh * 0.998;
  const lowerLows = secondHalfLow < firstHalfLow * 0.998;

  // Linear regression slope of close prices
  let xSum = 0;
  let ySum = 0;
  let xySum = 0;
  let xxSum = 0;
  const n = closes.length;

  for (let i = 0; i < n; i++) {
    xSum += i;
    ySum += closes[i];
    xySum += i * closes[i];
    xxSum += i * i;
  }

  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
  const avgPrice = ySum / n;
  const normalizedSlope = (slope / avgPrice) * 100; // % per bar

  const priceRange = (Math.max(...highs) - Math.min(...lows)) / avgPrice;

  let direction: TrendDirection = 'SIDEWAYS';
  let strength = 50;

  if (higherHighs && higherLows && normalizedSlope > 0.05) {
    direction = 'UPTREND';
    strength = Math.min(100, Math.round(50 + normalizedSlope * 50));
  } else if (lowerHighs && lowerLows && normalizedSlope < -0.05) {
    direction = 'DOWNTREND';
    strength = Math.min(100, Math.round(50 + Math.abs(normalizedSlope) * 50));
  } else if (priceRange < 0.04 || Math.abs(normalizedSlope) <= 0.05) {
    direction = 'SIDEWAYS';
    strength = 70; // high confidence sideways
  } else {
    direction = normalizedSlope > 0 ? 'UPTREND' : 'DOWNTREND';
    strength = 55;
  }

  return {
    direction,
    strength,
    higherHighs,
    higherLows,
    sma50Slope: normalizedSlope
  };
}
