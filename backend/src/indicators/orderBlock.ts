import { Candle, OrderBlockZone } from './types.js';

export function detectSourceBullishOrderBlocks(
  candles: Candle[],
  minConsecutiveGreen: number = 3,
  minPumpPct: number = 0.8
): OrderBlockZone[] {
  if (candles.length < minConsecutiveGreen + 2) return [];

  const orderBlocks: OrderBlockZone[] = [];

  for (let i = 1; i <= candles.length - minConsecutiveGreen; i++) {
    // Check if candle at i-1 is RED
    const prevCandle = candles[i - 1];
    const isRed = prevCandle.close < prevCandle.open;
    if (!isRed) continue;

    // Check if subsequent minConsecutiveGreen candles are ALL GREEN
    let allGreen = true;
    let sequencePumpPct = 0;
    const seqStartOpen = candles[i].open;
    let seqEndClose = candles[i].close;

    for (let g = 0; g < minConsecutiveGreen; g++) {
      const c = candles[i + g];
      if (c.close <= c.open) {
        allGreen = false;
        break;
      }
      seqEndClose = c.close;
    }

    if (!allGreen) continue;

    sequencePumpPct = ((seqEndClose - seqStartOpen) / seqStartOpen) * 100;
    if (sequencePumpPct < minPumpPct) continue;

    // Valid Bullish Order Block formation from the red candle zone
    const obLow = Math.min(prevCandle.low, prevCandle.close);
    const obHigh = Math.max(prevCandle.high, prevCandle.open);

    const ob: OrderBlockZone = {
      id: `ob-bull-${prevCandle.openTime}`,
      type: 'BULLISH',
      low: obLow,
      high: obHigh,
      sourceCandleTime: prevCandle.openTime,
      pumpGreenCandles: minConsecutiveGreen,
      formationTime: candles[i + minConsecutiveGreen - 1].closeTime,
      status: 'UNTESTED',
      retestCount: 0
    };

    // Check if subsequent candles touched or invalidated the OB
    for (let k = i + minConsecutiveGreen; k < candles.length; k++) {
      const testCandle = candles[k];
      if (testCandle.low <= ob.high && testCandle.low >= ob.low) {
        ob.status = 'TESTED';
        ob.retestCount += 1;
      } else if (testCandle.close < ob.low) {
        ob.status = 'BROKEN';
      }
    }

    orderBlocks.push(ob);
  }

  return orderBlocks;
}

export function checkOBRetestConfirmation(
  currentCandle: Candle,
  ob: OrderBlockZone
): { isConfirmed: boolean; reason: string } {
  if (ob.status === 'BROKEN') {
    return { isConfirmed: false, reason: 'Order block was invalidated/broken by close below low' };
  }

  const touched = currentCandle.low <= ob.high && currentCandle.high >= ob.low;
  const closedBullish = currentCandle.close > currentCandle.open && currentCandle.close >= ob.high * 0.999;

  if (touched && closedBullish) {
    return {
      isConfirmed: true,
      reason: `Candle touched OB zone [${ob.low.toFixed(4)}, ${ob.high.toFixed(4)}] and closed bullish`
    };
  }

  return { isConfirmed: false, reason: 'Candle has not confirmed OB zone bounce' };
}
