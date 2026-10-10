import { Candle } from '../indicators/types.js';
import { evaluateGainersMetrics } from '../indicators/candlePatterns.js';
import { StrategyConditionCheck, StrategySignalResult } from './types.js';

export interface GainersConfig {
  topRankLimit: number;
  minPumpPct: number;
  requiredPairCount: number;
  targetPct: number;
  sellerVolumeRatioThreshold: number;
}

export const defaultGainersConfig: GainersConfig = {
  topRankLimit: 7,
  minPumpPct: 35.0, // approximately 40% pump
  requiredPairCount: 3,
  targetPct: 1.0,
  sellerVolumeRatioThreshold: 0.25
};

export function evaluateGainersMethod(
  symbol: string,
  candles1H: Candle[],
  rank: number,
  change24h: number,
  tradingPairs: string[],
  isMonitored: boolean,
  isDelisting: boolean,
  isNew: boolean,
  leadTimeSeconds: number = 0,
  config: GainersConfig = defaultGainersConfig
): StrategySignalResult {
  const conditions: StrategyConditionCheck[] = [];
  const currentPrice = candles1H.length > 0 ? candles1H[candles1H.length - 1].close : 0;

  // Condition 1: Binance Top 7 Gainers Rank
  const isTopRank = rank > 0 && rank <= config.topRankLimit;
  conditions.push({
    name: `Binance Top ${config.topRankLimit} Gainers`,
    category: 'SOURCE_RULE',
    passed: isTopRank,
    actualValue: `#${rank} (${change24h.toFixed(1)}%)`,
    requiredCondition: `Rank <= ${config.topRankLimit}`,
    reason: isTopRank ? `Coin is ranked #${rank} among Binance gainers` : `Coin ranked #${rank} (requires <= #${config.topRankLimit})`
  });

  // Condition 2: 3 Relevant Trading Pairs (USDT, USDC, FDUSD, etc.)
  const reqPairs = ['USDT', 'USDC', 'FDUSD'];
  const matchedPairs = reqPairs.filter(p => tradingPairs.some(tp => tp.includes(p)));
  const pairsValid = matchedPairs.length >= config.requiredPairCount || tradingPairs.length >= config.requiredPairCount;
  conditions.push({
    name: '3 Relevant Trading Pairs',
    category: 'SOURCE_RULE',
    passed: pairsValid,
    actualValue: tradingPairs.slice(0, 4).join(', '),
    requiredCondition: `At least ${config.requiredPairCount} pairs available (e.g. USDT, USDC, FDUSD)`,
    reason: pairsValid ? `Verified pairs: ${tradingPairs.slice(0, 3).join(', ')}` : 'Insufficient trading pairs'
  });

  // Condition 3: ~40% Pump Measurement
  const isAround40Pump = change24h >= config.minPumpPct;
  conditions.push({
    name: '~40% Pump Verification',
    category: 'SOURCE_RULE',
    passed: isAround40Pump,
    actualValue: `+${change24h.toFixed(2)}%`,
    requiredCondition: `24h gain >= ${config.minPumpPct}% (Source ~40% pump)`,
    reason: isAround40Pump ? `Pump reached ${change24h.toFixed(1)}%` : `Gain of ${change24h.toFixed(1)}% is below pump threshold`
  });

  // Condition 4: Post-Pump Condition (Ambiguous Source Rule)
  // Source states: "After the pump: coin should not be dropping in prohibited manner, sellers not completely inactive"
  const gainerMetrics = evaluateGainersMetrics(candles1H, change24h, tradingPairs, isMonitored, isDelisting, isNew);
  conditions.push({
    name: 'Post-Pump Orderly Consolidation',
    category: 'SOURCE_RULE',
    isAmbiguous: true,
    selectedInterpretation: 'Seller volume active (> 25% avg) and candle close > low * 1.002',
    passed: gainerMetrics.postPumpHealthy,
    actualValue: gainerMetrics.postPumpHealthy ? 'HEALTHY_CONSOLIDATION' : 'PROHIBITED_DROP_OR_INACTIVE',
    requiredCondition: 'Orderly pullback with seller participation',
    reason: gainerMetrics.postPumpHealthy ? 'Post-pump price structure is stable' : 'Prohibited dump or inactive sellers detected'
  });

  // Condition 5: Restrictions ("Monitoring mai na ho", not new, not delisting)
  // Source explicitly requires: "Monitoring mai na ho" -> NOT UNDER MONITORING
  const notRestricted = !isMonitored && !isDelisting && !isNew;
  conditions.push({
    name: 'Binance Restrictions Filter',
    category: 'SOURCE_RULE',
    passed: notRestricted,
    actualValue: `Monitoring: ${isMonitored}, Delisting: ${isDelisting}, New: ${isNew}`,
    requiredCondition: 'NOT Under Monitoring ("Monitoring mai na ho"), NOT Delisting, NOT New',
    reason: notRestricted ? 'Coin clean of regulatory/monitoring flags' : `Restricted: monitoring=${isMonitored}, delisting=${isDelisting}, new=${isNew}`
  });

  const signalValid = conditions.every(c => c.passed);
  const targetPrice = currentPrice * (1 + config.targetPct / 100);

  const explanation = `
WHY THIS SIGNAL ${signalValid ? 'EXISTS' : 'IS REJECTED'}:
1. Top Gainers Rank: #${rank} -> ${isTopRank ? 'PASS' : 'FAIL'}
2. Trading Pairs: [${tradingPairs.slice(0, 3).join(', ')}] -> ${pairsValid ? 'PASS' : 'FAIL'}
3. ~40% Pump: +${change24h.toFixed(1)}% -> ${isAround40Pump ? 'PASS' : 'FAIL'}
4. Post-Pump Health: ${gainerMetrics.postPumpHealthy ? 'PASS (Ambiguous rule: Healthy volume)' : 'FAIL'}
5. Restrictions: ${notRestricted ? 'PASS (Not under monitoring)' : 'FAIL'}
Final Decision: ${signalValid ? 'VALID SIGNAL (+1% Target)' : 'REJECTED'}
  `.trim();

  return {
    strategyCode: 'GAINERS_METHOD',
    strategyName: 'Gainers Method',
    version: 'v1.0',
    symbol,
    signalValid,
    signalType: signalValid ? 'LONG' : 'NONE',
    entryPrice: currentPrice,
    targetPrice: parseFloat(targetPrice.toFixed(6)),
    stopLossPrice: currentPrice * 0.985,
    conditions,
    indicatorsSnapshot: {
      rank,
      change24h,
      tradingPairs: tradingPairs.slice(0, 3),
      isMonitored,
      isDelisting
    },
    explanation,
    evaluatedAt: Date.now(),
    leadTimeSeconds
  };
}
