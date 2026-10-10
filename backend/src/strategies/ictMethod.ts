import { Candle } from '../indicators/types.js';
import { calculateRSI } from '../indicators/rsi.js';
import { detectTrend } from '../indicators/trend.js';
import { evaluateSourceICTPattern } from '../indicators/candlePatterns.js';
import { StrategyConditionCheck, StrategySignalResult } from './types.js';

export interface ICTMethodConfig {
  rsiMin: number;
  rsiMax: number;
  greenCandleCount: 2 | 3;
  pumpPctTarget: number;
  trendlineInterpretation: 'BREAKOUT' | 'BOUNCE';
  targetPct: number;
}

export const defaultICTConfig: ICTMethodConfig = {
  rsiMin: 30,
  rsiMax: 40,
  greenCandleCount: 2,
  pumpPctTarget: 0.8, // ~1% pump
  trendlineInterpretation: 'BREAKOUT',
  targetPct: 1.0
};

export function evaluateICTMethod(
  symbol: string,
  candles1H: Candle[],
  leadTimeSeconds: number = 0,
  config: ICTMethodConfig = defaultICTConfig
): StrategySignalResult {
  const conditions: StrategyConditionCheck[] = [];
  const currentPrice = candles1H.length > 0 ? candles1H[candles1H.length - 1].close : 0;

  // Condition 1: 1H Trend MUST NOT BE SIDEWAYS (Source requirement: Up or Down only, Sideways = reject)
  const trend1H = detectTrend(candles1H, 20);
  const trendNotSideways = trend1H.direction !== 'SIDEWAYS';
  conditions.push({
    name: '1H Trend State (Non-Sideways Filter)',
    category: 'SOURCE_RULE',
    passed: trendNotSideways,
    actualValue: trend1H.direction,
    requiredCondition: 'UPTREND or DOWNTREND (Sideways strictly rejected by source)',
    reason: trendNotSideways ? `1H Trend is ${trend1H.direction}` : '1H Trend is SIDEWAYS (Rejected by ICT source rules)'
  });

  // Condition 2: 1H RSI in Zone 30-40
  const rsi1H = calculateRSI(candles1H, 14);
  const rsiValid = rsi1H.current >= config.rsiMin && rsi1H.current <= config.rsiMax;
  conditions.push({
    name: '1H RSI Zone [30, 40]',
    category: 'SOURCE_RULE',
    passed: rsiValid,
    actualValue: rsi1H.current,
    requiredCondition: `RSI between ${config.rsiMin} and ${config.rsiMax}`,
    reason: rsiValid ? `1H RSI (${rsi1H.current}) within zone [${config.rsiMin}, ${config.rsiMax}]` : `1H RSI (${rsi1H.current}) outside [${config.rsiMin}, ${config.rsiMax}]`
  });

  // Condition 3: Candle Relationship (Current Green, Preceding Red)
  const pattern = evaluateSourceICTPattern(candles1H, rsi1H.current, {
    rsiMin: config.rsiMin,
    rsiMax: config.rsiMax,
    greenCount: config.greenCandleCount,
    pumpPctTarget: config.pumpPctTarget,
    trendlineInterpretation: config.trendlineInterpretation
  });

  const candleRelPassed = pattern.currIsGreen && pattern.prevIsRed;
  conditions.push({
    name: 'Candle Color Relationship (Curr Green / Prev Red)',
    category: 'SOURCE_RULE',
    passed: candleRelPassed,
    actualValue: `Curr: ${pattern.currIsGreen ? 'GREEN' : 'RED'}, Prev: ${pattern.prevIsRed ? 'RED' : 'GREEN'}`,
    requiredCondition: 'Current candle green and immediate prior candle red',
    reason: candleRelPassed ? 'Candle sequence matches source relationship' : 'Candle relationship invalid'
  });

  // Condition 4: Backward Green Candles Sequence & ~1% Pump
  const greenSeqPassed = pattern.greenCandleCount >= config.greenCandleCount && pattern.pumpPct >= config.pumpPctTarget;
  conditions.push({
    name: `Green Candle Sequence & ~1% Pump (${config.greenCandleCount} Bars)`,
    category: 'SOURCE_RULE',
    passed: greenSeqPassed,
    actualValue: `${pattern.greenCandleCount} green bars, pump: +${pattern.pumpPct}%`,
    requiredCondition: `${config.greenCandleCount} green candles with ~1% pump`,
    reason: greenSeqPassed ? `Sequence verified (+${pattern.pumpPct}%)` : `Sequence incomplete: count=${pattern.greenCandleCount}, pump=${pattern.pumpPct}%`
  });

  // Condition 5: Trend Line Condition (Ambiguous Source Rule)
  // Source notes: "trend line between candle points and checking whether candles cross it"
  conditions.push({
    name: 'Trend Line Interaction',
    category: 'SOURCE_RULE',
    isAmbiguous: true,
    selectedInterpretation: config.trendlineInterpretation === 'BREAKOUT' ? 'Breakout above descending trendline' : 'Support bounce off ascending trendline',
    passed: pattern.trendlinePassed,
    actualValue: pattern.trendlinePassed ? 'PASSED' : 'NOT_CONFIRMED',
    requiredCondition: `Trendline condition via interpretation: ${config.trendlineInterpretation}`,
    reason: pattern.trendlinePassed ? `Trendline ${config.trendlineInterpretation} confirmed` : 'Trendline condition not satisfied'
  });

  const signalValid = conditions.every(c => c.passed);
  const targetPrice = currentPrice * (1 + config.targetPct / 100);

  const explanation = `
WHY THIS SIGNAL ${signalValid ? 'EXISTS' : 'IS REJECTED'}:
1. 1H Trend (No Sideways): ${trend1H.direction} -> ${trendNotSideways ? 'PASS' : 'FAIL (Sideways rejected)'}
2. 1H RSI [30, 40]: ${rsi1H.current} -> ${rsiValid ? 'PASS' : 'FAIL'}
3. Curr Green / Prev Red: -> ${candleRelPassed ? 'PASS' : 'FAIL'}
4. Green Pump Sequence: ${pattern.greenCandleCount} bars (+${pattern.pumpPct}%) -> ${greenSeqPassed ? 'PASS' : 'FAIL'}
5. Trendline Interpretation [${config.trendlineInterpretation}]: -> ${pattern.trendlinePassed ? 'PASS (Ambiguous rule)' : 'FAIL'}
Final Decision: ${signalValid ? 'VALID SIGNAL (+1% Target)' : 'REJECTED'}
  `.trim();

  return {
    strategyCode: 'ICT_METHOD',
    strategyName: 'ICT Method',
    version: 'v1.0',
    symbol,
    signalValid,
    signalType: signalValid ? 'LONG' : 'NONE',
    entryPrice: currentPrice,
    targetPrice: parseFloat(targetPrice.toFixed(6)),
    stopLossPrice: currentPrice * 0.988,
    conditions,
    indicatorsSnapshot: {
      trend1H: trend1H.direction,
      rsi1H: rsi1H.current,
      prevRed: pattern.prevIsRed,
      currGreen: pattern.currIsGreen,
      greenCount: pattern.greenCandleCount,
      pumpPct: pattern.pumpPct,
      selectedTrendlineInterpretation: config.trendlineInterpretation
    },
    explanation,
    evaluatedAt: Date.now(),
    leadTimeSeconds
  };
}
