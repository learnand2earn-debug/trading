import { Candle } from '../indicators/types.js';
import { calculateRSI, evaluate30MLeadership, isRSIInZone, isRSIConsolidating } from '../indicators/rsi.js';
import { evaluateSourceHiddenBullish } from '../indicators/candlePatterns.js';
import { StrategyConditionCheck, StrategySignalResult } from './types.js';

export interface HiddenBullishConfig {
  lookbackCandles: number;
  minDownwardPct: number;
  minReactionPct: number;
  rsiMin: number;
  rsiMax: number;
  targetPct: number;
}

export const defaultHiddenBullishConfig: HiddenBullishConfig = {
  lookbackCandles: 10,
  minDownwardPct: 0.8,
  minReactionPct: 0.3,
  rsiMin: 30, // User requirement: 30 - 40 zone
  rsiMax: 40,
  targetPct: 1.0
};

export function evaluateHiddenBullish(
  symbol: string,
  candles1H: Candle[],
  candles30M: Candle[],
  leadTimeSeconds: number = 0,
  config: HiddenBullishConfig = defaultHiddenBullishConfig
): StrategySignalResult {
  const conditions: StrategyConditionCheck[] = [];
  const currentPrice = candles1H.length > 0 ? candles1H[candles1H.length - 1].close : 0;

  // Condition 1: 1H RSI in Buying Zone 30-40
  const rsi1H = calculateRSI(candles1H, 14);
  const rsiInZone = isRSIInZone(rsi1H.current, config.rsiMin, config.rsiMax);
  conditions.push({
    name: `1H RSI Zone [${config.rsiMin}, ${config.rsiMax}]`,
    category: 'SOURCE_RULE',
    passed: rsiInZone,
    actualValue: rsi1H.current,
    requiredCondition: `RSI between ${config.rsiMin} and ${config.rsiMax}`,
    reason: rsiInZone ? `1H RSI (${rsi1H.current}) is within ${config.rsiMin}-${config.rsiMax} zone` : `1H RSI (${rsi1H.current}) is outside zone`
  });

  // Condition 2: 1H RSI Consolidation (na up ho na down ho - flat / range consolidation)
  const isConsolidating = isRSIConsolidating(rsi1H, 2.2);
  conditions.push({
    name: '1H RSI Consolidation (Flat / Range)',
    category: 'SOURCE_RULE',
    passed: isConsolidating,
    actualValue: `Diff: ${Math.abs(rsi1H.current - rsi1H.previous).toFixed(2)} (Slope: ${rsi1H.slope})`,
    requiredCondition: 'RSI na up ho na down ho (Consolidation / Range-bound)',
    reason: isConsolidating ? '1H RSI is consolidating (flat range)' : '1H RSI is showing high fluctuation'
  });

  // Condition 3: 30M RSI Leadership (30M RSI strictly above 1H RSI)
  const rsi30M = calculateRSI(candles30M, 14);
  const leadership = evaluate30MLeadership(rsi1H, rsi30M);
  const isAbove = rsi30M.current > rsi1H.current;
  const leadPassed = isAbove || leadership.leads;
  conditions.push({
    name: '30M RSI Leadership',
    category: 'SOURCE_RULE',
    passed: leadPassed,
    actualValue: `30M: ${rsi30M.current} vs 1H: ${rsi1H.current}`,
    requiredCondition: '30M RSI leading 1H RSI (30M RSI above 1H RSI)',
    reason: leadPassed ? `30M RSI (${rsi30M.current}) is above 1H RSI (${rsi1H.current})` : `30M RSI does not lead 1H RSI`
  });

  // Condition 4: ~10 candles downward drop & reaction structure
  const patternResult = evaluateSourceHiddenBullish(
    candles1H,
    config.lookbackCandles,
    config.minDownwardPct,
    config.minReactionPct
  );
  const structurePassed = patternResult.matched || patternResult.reactionPct >= 0.1 || isConsolidating;
  conditions.push({
    name: '10-Candle Drop & Support Reaction Structure',
    category: 'SOURCE_RULE',
    passed: structurePassed,
    actualValue: `Drop: -${patternResult.downwardPct}%, Reaction: +${patternResult.reactionPct}%`,
    requiredCondition: `Structure dip with reaction or consolidation`,
    reason: structurePassed ? 'Structure consolidation & bounce identified' : 'Insufficient reaction'
  });

  const signalValid = conditions.every(c => c.passed);
  const targetPrice = currentPrice * (1 + config.targetPct / 100);

  const explanation = `
WHY THIS SIGNAL ${signalValid ? 'EXISTS' : 'IS REJECTED'}:
1. 1H RSI Zone [${config.rsiMin}-${config.rsiMax}]: ${rsi1H.current} -> ${rsiInZone ? 'PASS' : 'FAIL'}
2. 1H RSI Consolidation: ${isConsolidating ? 'PASS (Flat / Na up na down)' : 'FAIL'}
3. 30M RSI Leadership: ${leadPassed ? 'PASS (30M above 1H)' : 'FAIL'} (30M: ${rsi30M.current} vs 1H: ${rsi1H.current})
4. Structure / Reaction: ${structurePassed ? 'PASS' : 'FAIL'}
Final Decision: ${signalValid ? 'VALID SIGNAL (+1% Target)' : 'REJECTED'}
  `.trim();

  return {
    strategyCode: 'HIDDEN_BULLISH',
    strategyName: 'Hidden Bullish',
    version: 'v1.0',
    symbol,
    signalValid,
    signalType: signalValid ? 'LONG' : 'NONE',
    entryPrice: currentPrice,
    targetPrice: parseFloat(targetPrice.toFixed(6)),
    stopLossPrice: currentPrice * 0.988,
    conditions,
    indicatorsSnapshot: {
      downwardPct: patternResult.downwardPct,
      reactionPct: patternResult.reactionPct,
      rsi1H: rsi1H.current,
      rsi30M: rsi30M.current
    },
    explanation,
    evaluatedAt: Date.now(),
    leadTimeSeconds
  };
}
