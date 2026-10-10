import { Candle, V1ColorState, V1Result } from './types.js';
import { calculateEMA } from './ema.js';

/**
 * Smoothed Heiken Ashi Candles V1 Implementation
 * Reproduces the Red / Transparent / Green state progression.
 */
export function calculateV1SmoothedHeikenAshi(candles: Candle[], smoothingLength: number = 10): V1Result {
  if (candles.length < smoothingLength + 5) {
    return {
      state: 'TRANSPARENT',
      haOpen: 0,
      haHigh: 0,
      haLow: 0,
      haClose: 0,
      smoothedOpen: 0,
      smoothedClose: 0
    };
  }

  // 1. Initial smoothing of regular OHLC
  const opens = calculateEMA(candles.map(c => c.open), smoothingLength);
  const highs = calculateEMA(candles.map(c => c.high), smoothingLength);
  const lows = calculateEMA(candles.map(c => c.low), smoothingLength);
  const closes = calculateEMA(candles.map(c => c.close), smoothingLength);

  // 2. Heiken Ashi transformation on smoothed values
  const haOpens: number[] = [];
  const haCloses: number[] = [];
  const haHighs: number[] = [];
  const haLows: number[] = [];

  for (let i = 0; i < candles.length; i++) {
    const haClose = (opens[i] + highs[i] + lows[i] + closes[i]) / 4;
    let haOpen = 0;
    if (i === 0) {
      haOpen = (opens[i] + closes[i]) / 2;
    } else {
      haOpen = (haOpens[i - 1] + haCloses[i - 1]) / 2;
    }
    const haHigh = Math.max(highs[i], haOpen, haClose);
    const haLow = Math.min(lows[i], haOpen, haClose);

    haOpens.push(haOpen);
    haCloses.push(haClose);
    haHighs.push(haHigh);
    haLows.push(haLow);
  }

  // 3. Second smoothing pass (Smoothed Heiken Ashi V1)
  const smoothedHaOpens = calculateEMA(haOpens, smoothingLength);
  const smoothedHaCloses = calculateEMA(haCloses, smoothingLength);

  const lastIdx = candles.length - 1;
  const currOpen = smoothedHaOpens[lastIdx];
  const currClose = smoothedHaCloses[lastIdx];
  const currHigh = haHighs[lastIdx];
  const currLow = haLows[lastIdx];

  const bodySize = Math.abs(currClose - currOpen);
  const totalRange = Math.max(0.000001, currHigh - currLow);
  const bodyRatio = bodySize / totalRange;

  let state: V1ColorState = 'TRANSPARENT';

  // If body is very small (< 18% of candle range), it represents neutral/transparent state
  if (bodyRatio < 0.18) {
    state = 'TRANSPARENT';
  } else if (currClose > currOpen) {
    state = 'GREEN';
  } else {
    state = 'RED';
  }

  return {
    state,
    haOpen: parseFloat(currOpen.toFixed(6)),
    haHigh: parseFloat(currHigh.toFixed(6)),
    haLow: parseFloat(currLow.toFixed(6)),
    haClose: parseFloat(currClose.toFixed(6)),
    smoothedOpen: parseFloat(currOpen.toFixed(6)),
    smoothedClose: parseFloat(currClose.toFixed(6))
  };
}
