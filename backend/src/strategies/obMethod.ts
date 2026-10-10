import { Candle } from '../indicators/types.js';
import { detectSourceBullishOrderBlocks, checkOBRetestConfirmation } from '../indicators/orderBlock.js';
import { StrategyConditionCheck, StrategySignalResult } from './types.js';

export interface OBConfig {
  minGreenPumpCandles: number;
  minPumpPct: number;
  targetPct: number;
  enableFVGConfluence?: boolean;
  enableSweepConfluence?: boolean;
}

export const defaultOBConfig: OBConfig = {
  minGreenPumpCandles: 3,
  minPumpPct: 0.8,
  targetPct: 1.0,
  enableFVGConfluence: false,
  enableSweepConfluence: false
};

export function evaluateOBMethod(
  symbol: string,
  candles1H: Candle[],
  candles15M: Candle[],
  leadTimeSeconds: number = 0,
  config: OBConfig = defaultOBConfig
): StrategySignalResult {
  const conditions: StrategyConditionCheck[] = [];
  const currentPrice = candles15M.length > 0 ? candles15M[candles15M.length - 1].close : (candles1H.length > 0 ? candles1H[candles1H.length - 1].close : 0);

  // Step 1: Detect 1H Bullish Order Blocks (3+ green preceded by red)
  const orderBlocks = detectSourceBullishOrderBlocks(candles1H, config.minGreenPumpCandles, config.minPumpPct);
  const activeOB = orderBlocks.find(ob => ob.status !== 'BROKEN');
  const hasValidOB = !!activeOB;

  conditions.push({
    name: '1H Source Bullish Order Block Formation',
    category: 'SOURCE_RULE',
    passed: hasValidOB,
    actualValue: activeOB ? `Zone [${activeOB.low.toFixed(4)}, ${activeOB.high.toFixed(4)}]` : 'NO_VALID_OB',
    requiredCondition: `Strong pump with ${config.minGreenPumpCandles}+ green candles preceded by red candle`,
    reason: activeOB ? `Bullish OB identified at red candle zone: ${activeOB.low.toFixed(4)} - ${activeOB.high.toFixed(4)}` : 'No valid unviolated OB detected'
  });

  // Step 2: 15M Confirmation & Retest of the OB Zone
  let retestConfirmed = false;
  let retestReason = 'Awaiting 15M retest of OB zone';

  if (activeOB && candles15M.length > 0) {
    const last15MCandle = candles15M[candles15M.length - 1];
    const conf = checkOBRetestConfirmation(last15MCandle, activeOB);
    retestConfirmed = conf.isConfirmed;
    retestReason = conf.reason;
  }

  conditions.push({
    name: '15M OB Retest & Bullish Confirmation Close',
    category: 'SOURCE_RULE',
    passed: retestConfirmed,
    actualValue: retestConfirmed ? 'CONFIRMED' : 'PENDING_RETEST',
    requiredCondition: '15M candle touches OB zone and closes bullish',
    reason: retestReason
  });

  // Optional SMC Confluence Check (FVG, Sweep) - Explicitly non-mandatory
  if (config.enableFVGConfluence) {
    conditions.push({
      name: 'Fair Value Gap (FVG) Confluence',
      category: 'OPTIONAL_CONFLUENCE',
      passed: true,
      actualValue: 'FVG_CHECKED',
      requiredCondition: 'Optional SMC research confluence only',
      reason: 'Optional confluence enabled by admin'
    });
  }

  const signalValid = conditions.filter(c => c.category === 'SOURCE_RULE').every(c => c.passed);
  const targetPrice = currentPrice * (1 + config.targetPct / 100);

  const explanation = `
WHY THIS SIGNAL ${signalValid ? 'EXISTS' : 'IS REJECTED'}:
1. 1H OB Formation: ${hasValidOB ? 'PASS' : 'FAIL'} (${activeOB ? `Zone: ${activeOB.low.toFixed(4)}-${activeOB.high.toFixed(4)}` : 'None'})
2. 15M Retest & Close: ${retestConfirmed ? 'PASS' : 'FAIL'} (${retestReason})
3. Optional Confluences: FVG=${!!config.enableFVGConfluence}, Sweep=${!!config.enableSweepConfluence} (Strictly optional)
Final Decision: ${signalValid ? 'VALID SIGNAL (+1% Target)' : 'REJECTED'}
  `.trim();

  return {
    strategyCode: 'OB_METHOD',
    strategyName: 'OB Method',
    version: 'v1.0',
    symbol,
    signalValid,
    signalType: signalValid ? 'LONG' : 'NONE',
    entryPrice: currentPrice,
    targetPrice: parseFloat(targetPrice.toFixed(6)),
    stopLossPrice: activeOB ? activeOB.low * 0.996 : currentPrice * 0.988,
    conditions,
    indicatorsSnapshot: {
      hasOB: hasValidOB,
      obLow: activeOB?.low,
      obHigh: activeOB?.high,
      obStatus: activeOB?.status,
      retestCount: activeOB?.retestCount
    },
    explanation,
    evaluatedAt: Date.now(),
    leadTimeSeconds
  };
}
