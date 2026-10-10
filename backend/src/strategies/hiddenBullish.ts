import { Candle } from '../indicators/types.js';
import { calculateRSI, evaluate30MLeadership, isRSIInZone } from '../indicators/rsi.js';
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
  rsiMin: 25,
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

  // Condition 1: 1H Candle History ~10 candles downward drop (Custom Source Rule, NOT textbook divergence)
  const patternResult = evaluateSourceHiddenBullish(
    candles1H,
    config.lookbackCandles,
    config.minDownwardPct,
    config.minReactionPct
  );

  conditions.push({
    name: '1H ~10-Candle Downward Structure',
    category: 'SOURCE_RULE',
    isAmbiguous: true,
    selectedInterpretation: `Lookback ${config.lookbackCandles} bars with min drop ${config.minDownwardPct}%`,
    passed: patternResult.matched,
    actualValue: `Drop: -${patternResult.downwardPct}%`,
    requiredCondition: `Downward movement over ~${config.lookbackCandles} candles (Custom Source Rule - NOT textbook divergence)`,
    reason: patternResult.reason
  });

  // Condition 2: Upward Reaction Detected from Lower Point
  const reactionPassed = patternResult.reactionPct >= config.minReactionPct;
  conditions.push({
    name: 'Upward Reaction from Trough',
    category: 'SOURCE_RULE',
    passed: reactionPassed,
    actualValue: `+${patternResult.reactionPct}%`,
    requiredCondition: `Bullish bounce >= ${config.minReactionPct}%`,
    reason: reactionPassed ? `Upward bounce of +${patternResult.reactionPct}% confirmed` : 'Insufficient upward reaction'
  });

  // Condition 3: 1H RSI in Buying Zone 25-40
  const rsi1H = calculateRSI(candles1H, 14);
  const rsiInZone = isRSIInZone(rsi1H.current, config.rsiMin, config.rsiMax);
  conditions.push({
    name: '1H RSI Buying Zone [25, 40]',
    category: 'SOURCE_RULE',
    passed: rsiInZone,
    actualValue: rsi1H.current,
    requiredCondition: `RSI between ${config.rsiMin} and ${config.rsiMax}`,
    reason: rsiInZone ? `1H RSI (${rsi1H.current}) is within buying zone` : `1H RSI (${rsi1H.current}) is outside buying zone`
  });

  // Condition 4: 30M RSI Leadership
  const rsi30M = calculateRSI(candles30M, 14);
  const leadership = evaluate30MLeadership(rsi1H, rsi30M);
  conditions.push({
    name: '30M RSI Leadership',
    category: 'SOURCE_RULE',
    passed: leadership.leads,
    actualValue: `30M: ${rsi30M.current} vs 1H: ${rsi1H.current}`,
    requiredCondition: '30M RSI positively leading 1H RSI',
    reason: leadership.reason
  });

  const signalValid = conditions.every(c => c.passed);
  const targetPrice = currentPrice * (1 + config.targetPct / 100);

  const explanation = `
WHY THIS SIGNAL ${signalValid ? 'EXISTS' : 'IS REJECTED'}:
[NOTE: THIS IS THE CUSTOM HANDWRITTEN SOURCE METHODOLOGY, NOT TEXTBOOK DIVERGENCE]
1. 10-Candle Downward Structure: -${patternResult.downwardPct}% -> ${patternResult.matched ? 'PASS' : 'FAIL'}
2. Upward Bounce: +${patternResult.reactionPct}% -> ${reactionPassed ? 'PASS' : 'FAIL'}
3. RSI Buying Zone: ${rsi1H.current} -> ${rsiInZone ? 'PASS' : 'FAIL'} (Zone: ${config.rsiMin}-${config.rsiMax})
4. 30M RSI Leadership: ${leadership.leads ? 'PASS' : 'FAIL'} (${leadership.reason})
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
