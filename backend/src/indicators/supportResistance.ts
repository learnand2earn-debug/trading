import { Candle, SupportResistanceLevel } from './types.js';

export function calculateSupportResistance(
  candles: Candle[],
  leftBars: number = 3,
  rightBars: number = 2
): SupportResistanceLevel[] {
  if (candles.length < leftBars + rightBars + 1) return [];

  const levels: SupportResistanceLevel[] = [];
  const currentPrice = candles[candles.length - 1].close;

  // Find swing highs (resistance) and swing lows (support)
  for (let i = leftBars; i < candles.length - rightBars; i++) {
    const target = candles[i];
    let isSwingHigh = true;
    let isSwingLow = true;

    for (let j = i - leftBars; j <= i + rightBars; j++) {
      if (j === i) continue;
      if (candles[j].high >= target.high) isSwingHigh = false;
      if (candles[j].low <= target.low) isSwingLow = false;
    }

    if (isSwingHigh) {
      const zoneBuffer = target.high * 0.003;
      levels.push({
        id: `sr-res-${target.openTime}`,
        type: 'RESISTANCE',
        price: target.high,
        zoneLow: target.high - zoneBuffer,
        zoneHigh: target.high + zoneBuffer,
        touches: 1,
        timestamp: target.openTime,
        status: currentPrice > target.high ? 'BROKEN' : 'VALID'
      });
    }

    if (isSwingLow) {
      const zoneBuffer = target.low * 0.003;
      levels.push({
        id: `sr-sup-${target.openTime}`,
        type: 'SUPPORT',
        price: target.low,
        zoneLow: target.low - zoneBuffer,
        zoneHigh: target.low + zoneBuffer,
        touches: 1,
        timestamp: target.openTime,
        status: currentPrice < target.low ? 'BROKEN' : 'VALID'
      });
    }
  }

  // Deduplicate / cluster nearby levels (within 0.4%)
  const clustered: SupportResistanceLevel[] = [];
  for (const level of levels) {
    const existing = clustered.find(
      c => c.type === level.type && Math.abs(c.price - level.price) / level.price < 0.005
    );
    if (existing) {
      existing.touches += 1;
      existing.zoneLow = Math.min(existing.zoneLow, level.zoneLow);
      existing.zoneHigh = Math.max(existing.zoneHigh, level.zoneHigh);
      existing.price = (existing.price + level.price) / 2;
    } else {
      clustered.push({ ...level });
    }
  }

  return clustered.sort((a, b) => b.price - a.price);
}

export function isPriceNearValidSupport(
  currentPrice: number,
  levels: SupportResistanceLevel[],
  maxDistancePct: number = 1.0
): { near: boolean; level?: SupportResistanceLevel; distancePct: number } {
  const validSupports = levels.filter(l => l.type === 'SUPPORT' && l.status === 'VALID');
  if (validSupports.length === 0) {
    return { near: false, distancePct: 999 };
  }

  // Find closest support below or touching current price
  let closest: SupportResistanceLevel | null = null;
  let minDistance = 999;

  for (const sup of validSupports) {
    const dist = ((currentPrice - sup.price) / sup.price) * 100;
    // Price should be just above or in the support zone
    if (currentPrice >= sup.zoneLow && dist < minDistance) {
      minDistance = Math.abs(dist);
      closest = sup;
    }
  }

  if (closest && minDistance <= maxDistancePct) {
    return { near: true, level: closest, distancePct: minDistance };
  }

  return { near: false, distancePct: minDistance };
}
