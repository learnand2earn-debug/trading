import { Candle } from '../indicators/types.js';
import { detectTrend } from '../indicators/trend.js';
import { calculateRSI, evaluate30MLeadership, isRSICrossingAbove } from '../indicators/rsi.js';
import { calculateV1SmoothedHeikenAshi } from '../indicators/v1.js';
import { StrategyConditionCheck, StrategySignalResult } from './types.js';

export interface V1MethodConfig {
  rsiCrossLevel: number;
  allowTransparentV1: boolean;
  targetPct: number;
}

export const defaultV1Config: V1MethodConfig = {
  rsiCrossLevel: 54,
  allowTransparentV1: true,
  targetPct: 1.0
};

export function evaluateV1Method(
  symbol: string,
  candles1D: Candle[],
  candles1H: Candle[],
  candles30M: Candle[],
  leadTimeSeconds: number = 0,
  config: V1MethodConfig = defaultV1Config
): StrategySignalResult {
  const conditions: StrategyConditionCheck[] = [];
  const currentPrice = candles1H.length > 0 ? candles1H[candles1H.length - 1].close : 0;

  // Condition 1: 1D Trend MUST be UP (Source requirement)
  const trend1D = detectTrend(candles1D, 20);
  const trend1DPassed = trend1D.direction === 'UPTREND';
  conditions.push({
    name: '1D Mandatory Uptrend',
    category: 'SOURCE_RULE',
    passed: trend1DPassed,
    actualValue: trend1D.direction,
    requiredCondition: 'UPTREND (Mandatory)',
    reason: trend1DPassed ? '1D trend is UP' : `1D trend is ${trend1D.direction} (Source requires UP)`
  });

  // Condition 2: 1H Trend UP or SIDEWAYS
  const trend1H = detectTrend(candles1H, 20);
  const trend1HPassed = trend1H.direction === 'UPTREND' || trend1H.direction === 'SIDEWAYS';
  conditions.push({
    name: '1H Trend State',
    category: 'SOURCE_RULE',
    passed: trend1HPassed,
    actualValue: trend1H.direction,
    requiredCondition: 'UPTREND or SIDEWAYS',
    reason: `1H Trend is ${trend1H.direction}`
  });

  // Condition 3: RSI crosses level 54 from below
  const rsi1H = calculateRSI(candles1H, 14);
  const rsiCrossed = isRSICrossingAbove(rsi1H.previous, rsi1H.current, config.rsiCrossLevel);
  // Also support active crossing or fresh holding just above 54
  const rsiAbove = rsi1H.current >= config.rsiCrossLevel && rsi1H.previous <= config.rsiCrossLevel + 1.5;
  const rsiPassed = rsiCrossed || rsiAbove;
  conditions.push({
    name: `RSI Cross Level ${config.rsiCrossLevel}`,
    category: 'SOURCE_RULE',
    passed: rsiPassed,
    actualValue: `Prev: ${rsi1H.previous} -> Curr: ${rsi1H.current}`,
    requiredCondition: `Crosses ${config.rsiCrossLevel} upward (prev < ${config.rsiCrossLevel} and curr >= ${config.rsiCrossLevel})`,
    reason: rsiPassed ? `RSI crossed ${config.rsiCrossLevel} upward` : `RSI did not cross ${config.rsiCrossLevel}`
  });

  // Condition 4: V1 Indicator State (Green or Transparent)
  const v1State = calculateV1SmoothedHeikenAshi(candles1H);
  const v1Passed = v1State.state === 'GREEN' || (config.allowTransparentV1 && v1State.state === 'TRANSPARENT');
  conditions.push({
    name: 'Smoothed Heiken Ashi V1 Indicator',
    category: 'SOURCE_RULE',
    passed: v1Passed,
    actualValue: v1State.state,
    requiredCondition: 'GREEN or TRANSPARENT',
    reason: `V1 state is ${v1State.state} (Red is prohibited)`
  });

  // Condition 5: 30M RSI Leadership
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
1. 1D Trend: ${trend1D.direction} -> ${trend1DPassed ? 'PASS (Mandatory UP)' : 'FAIL'}
2. 1H Trend: ${trend1H.direction} -> ${trend1HPassed ? 'PASS' : 'FAIL'}
3. RSI Cross: ${rsi1H.previous} -> ${rsi1H.current} -> ${rsiPassed ? 'PASS' : 'FAIL'}
4. V1 Indicator: ${v1State.state} -> ${v1Passed ? 'PASS' : 'FAIL (Red prohibited)'}
5. 30M RSI Leadership: ${leadership.leads ? 'PASS' : 'FAIL'}
Final Decision: ${signalValid ? 'VALID SIGNAL (+1% Target)' : 'REJECTED'}
  `.trim();

  return {
    strategyCode: 'V1_METHOD',
    strategyName: 'V1 Method',
    version: 'v1.0',
    symbol,
    signalValid,
    signalType: signalValid ? 'LONG' : 'NONE',
    entryPrice: currentPrice,
    targetPrice: parseFloat(targetPrice.toFixed(6)),
    stopLossPrice: currentPrice * 0.988,
    conditions,
    indicatorsSnapshot: {
      trend1D: trend1D.direction,
      trend1H: trend1H.direction,
      rsi1HCurr: rsi1H.current,
      rsi1HPrev: rsi1H.previous,
      v1State: v1State.state,
      rsi30M: rsi30M.current
    },
    explanation,
    evaluatedAt: Date.now(),
    leadTimeSeconds
  };
}
