import { Candle } from '../indicators/types.js';
import { evaluateEMA9EMA33 } from '../indicators/ema.js';
import { evaluateV1Method } from './v1Method.js';
import { StrategyConditionCheck, StrategySignalResult } from './types.js';

export interface V1EmaConfig {
  emaFast: number; // 9
  emaSlow: number; // 33
  targetPct: number;
}

export const defaultV1EmaConfig: V1EmaConfig = {
  emaFast: 9,
  emaSlow: 33,
  targetPct: 1.0
};

export function evaluateV1Ema(
  symbol: string,
  candles1D: Candle[],
  candles1H: Candle[],
  candles30M: Candle[],
  leadTimeSeconds: number = 0,
  config: V1EmaConfig = defaultV1EmaConfig
): StrategySignalResult {
  const currentPrice = candles1H.length > 0 ? candles1H[candles1H.length - 1].close : 0;

  // 1. Evaluate base V1 conditions
  const baseV1 = evaluateV1Method(symbol, candles1D, candles1H, candles30M, leadTimeSeconds);
  const conditions: StrategyConditionCheck[] = [...baseV1.conditions];

  // 2. Evaluate EMA 9 and EMA 33 Bullish Cross & Retest
  const emaAnalysis = evaluateEMA9EMA33(candles1H);

  const emaRelationshipValid = emaAnalysis.ema9 > emaAnalysis.ema33 || emaAnalysis.isBullishCross;
  conditions.push({
    name: 'EMA 9 / EMA 33 Bullish Relationship',
    category: 'SOURCE_RULE',
    passed: emaRelationshipValid,
    actualValue: `EMA 9: ${emaAnalysis.ema9} vs EMA 33: ${emaAnalysis.ema33} (Cross: ${emaAnalysis.isBullishCross})`,
    requiredCondition: 'EMA 9 above EMA 33 or confirmed bullish crossover',
    reason: emaRelationshipValid ? 'Bullish EMA structure confirmed' : 'EMA 9 is below EMA 33'
  });

  // 3. EMA 9 Retest (Scenario A: Cross Retest vs Scenario B: Wick Touch While Above)
  const retestPassed = emaAnalysis.retestDetected;
  const scenarioLabel = emaAnalysis.retestType === 'CROSS_RETEST'
    ? 'Scenario A: Fresh Cross Pullback & Retest'
    : emaAnalysis.retestType === 'WICK_TOUCH_ABOVE'
    ? 'Scenario B: Trend Continuation Wick Touch on EMA 9'
    : 'No Valid Retest';

  conditions.push({
    name: 'EMA 9 Retest & Bullish Reaction',
    category: 'SOURCE_RULE',
    passed: retestPassed,
    actualValue: scenarioLabel,
    requiredCondition: 'Candle touches EMA 9 with green/bullish reaction',
    reason: retestPassed ? `Confirmed: ${scenarioLabel}` : 'Candle has not touched/retested EMA 9'
  });

  const signalValid = conditions.every(c => c.passed);
  const targetPrice = currentPrice * (1 + config.targetPct / 100);

  const explanation = `
WHY THIS SIGNAL ${signalValid ? 'EXISTS' : 'IS REJECTED'}:
[V1 Method Core: ${baseV1.signalValid ? 'PASS' : 'FAIL'}]
1. 1D Trend: ${baseV1.indicatorsSnapshot.trend1D} -> ${baseV1.conditions[0].passed ? 'PASS' : 'FAIL'}
2. 1H Trend: ${baseV1.indicatorsSnapshot.trend1H} -> ${baseV1.conditions[1].passed ? 'PASS' : 'FAIL'}
3. RSI Cross: -> ${baseV1.conditions[2].passed ? 'PASS' : 'FAIL'}
4. V1 Indicator: ${baseV1.indicatorsSnapshot.v1State} -> ${baseV1.conditions[3].passed ? 'PASS' : 'FAIL'}
5. EMA 9/33 Relationship: ${emaRelationshipValid ? 'PASS' : 'FAIL'} (9: ${emaAnalysis.ema9}, 33: ${emaAnalysis.ema33})
6. EMA 9 Retest: ${retestPassed ? 'PASS' : 'FAIL'} (${scenarioLabel})
Final Decision: ${signalValid ? 'VALID SIGNAL (+1% Target)' : 'REJECTED'}
  `.trim();

  return {
    strategyCode: 'V1_EMA',
    strategyName: 'V1 + EMA',
    version: 'v1.0',
    symbol,
    signalValid,
    signalType: signalValid ? 'LONG' : 'NONE',
    entryPrice: currentPrice,
    targetPrice: parseFloat(targetPrice.toFixed(6)),
    stopLossPrice: emaAnalysis.ema33 * 0.995,
    conditions,
    indicatorsSnapshot: {
      ...baseV1.indicatorsSnapshot,
      ema9: emaAnalysis.ema9,
      ema33: emaAnalysis.ema33,
      isBullishCross: emaAnalysis.isBullishCross,
      retestType: emaAnalysis.retestType
    },
    explanation,
    evaluatedAt: Date.now(),
    leadTimeSeconds
  };
}
