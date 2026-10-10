import { Candle } from '../indicators/types.js';
import { detectTrend } from '../indicators/trend.js';
import { calculateSupportResistance, isPriceNearValidSupport } from '../indicators/supportResistance.js';
import { calculateRSI, evaluate30MLeadership, isRSIInZone } from '../indicators/rsi.js';
import { CoinGlassLiquiditySnapshot } from '../market-data/coinglass.js';
import { StrategyConditionCheck, StrategySignalResult } from './types.js';

export interface PriceActionConfig {
  rsiMin: number;
  rsiMax: number;
  maxSupportDistancePct: number;
  targetPct: number;
  allowDowntrendConfluence?: boolean;
}

export const defaultPriceActionConfig: PriceActionConfig = {
  rsiMin: 25,
  rsiMax: 40,
  maxSupportDistancePct: 1.2,
  targetPct: 1.0,
  allowDowntrendConfluence: false
};

export function evaluatePriceAction(
  symbol: string,
  candles1D: Candle[],
  candles1H: Candle[],
  candles30M: Candle[],
  liquidity: CoinGlassLiquiditySnapshot,
  leadTimeSeconds: number = 0,
  config: PriceActionConfig = defaultPriceActionConfig
): StrategySignalResult {
  const conditions: StrategyConditionCheck[] = [];
  const currentPrice = candles1H.length > 0 ? candles1H[candles1H.length - 1].close : 0;

  // Step 1: 1D Trend (Source: Uptrend OR Sideways)
  const trend1D = detectTrend(candles1D, 20);
  const trend1DValid = trend1D.direction === 'UPTREND' || trend1D.direction === 'SIDEWAYS' || Boolean(config.allowDowntrendConfluence && trend1D.direction === 'DOWNTREND');
  conditions.push({
    name: '1D Trend Check',
    category: 'SOURCE_RULE',
    passed: trend1DValid,
    actualValue: trend1D.direction,
    requiredCondition: 'UPTREND or SIDEWAYS',
    reason: `1D Trend is ${trend1D.direction} (confidence: ${trend1D.strength}%)`
  });

  // Step 2: 1H Support & Resistance
  const srLevels = calculateSupportResistance(candles1H);
  const supportCheck = isPriceNearValidSupport(currentPrice, srLevels, config.maxSupportDistancePct);
  conditions.push({
    name: '1H Support Interaction',
    category: 'SOURCE_RULE',
    passed: supportCheck.near,
    actualValue: supportCheck.level ? `${supportCheck.level.price.toFixed(4)} (dist: ${supportCheck.distancePct.toFixed(2)}%)` : 'NONE',
    requiredCondition: `Price bouncing near valid support <= ${config.maxSupportDistancePct}%`,
    reason: supportCheck.near ? `Price at valid support level: ${supportCheck.level?.price.toFixed(4)}` : 'No valid 1H support level within tolerance'
  });

  // Step 3: CoinGlass Liquidity
  const isLiquidityAvailable = liquidity.freshnessStatus === 'FRESH' || liquidity.freshnessStatus === 'AGING';
  const hasLiquiditySupport = liquidity.liquidityBelowUSD > 0 || isLiquidityAvailable;
  conditions.push({
    name: 'CoinGlass Liquidity Heatmap',
    category: 'SOURCE_RULE',
    passed: isLiquidityAvailable && hasLiquiditySupport,
    actualValue: `${liquidity.freshnessStatus} (Above: $${(liquidity.liquidityAboveUSD/1e6).toFixed(2)}M, Below: $${(liquidity.liquidityBelowUSD/1e6).toFixed(2)}M)`,
    requiredCondition: 'Liquidity data FRESH/AGING and zone confirmed',
    reason: isLiquidityAvailable ? 'CoinGlass liquidity verified' : 'DATA STALE / DATA UNAVAILABLE'
  });

  // Step 4: 1H RSI Buying Zone (Source: 25-40)
  const rsi1H = calculateRSI(candles1H, 14);
  const rsiInZone = isRSIInZone(rsi1H.current, config.rsiMin, config.rsiMax);
  conditions.push({
    name: '1H RSI Buying Zone',
    category: 'SOURCE_RULE',
    passed: rsiInZone,
    actualValue: rsi1H.current,
    requiredCondition: `RSI in [${config.rsiMin}, ${config.rsiMax}]`,
    reason: rsiInZone ? `1H RSI (${rsi1H.current}) in buying zone` : `1H RSI (${rsi1H.current}) outside zone [${config.rsiMin}, ${config.rsiMax}]`
  });

  // Step 5: 30M RSI Leadership
  const rsi30M = calculateRSI(candles30M, 14);
  const leadership = evaluate30MLeadership(rsi1H, rsi30M);
  conditions.push({
    name: '30M RSI Leadership',
    category: 'SOURCE_RULE',
    passed: leadership.leads,
    actualValue: `30M: ${rsi30M.current} (${rsi30M.slope}) vs 1H: ${rsi1H.current}`,
    requiredCondition: '30M RSI positively leading 1H RSI',
    reason: leadership.reason
  });

  const signalValid = conditions.every(c => c.passed);
  const targetPrice = currentPrice * (1 + config.targetPct / 100);

  const explanation = `
WHY THIS SIGNAL ${signalValid ? 'EXISTS' : 'IS REJECTED'}:
1. 1D Trend: ${trend1D.direction} -> ${trend1DValid ? 'PASS' : 'FAIL'}
2. 1H Support: ${supportCheck.near ? 'PASS' : 'FAIL'} (dist: ${supportCheck.distancePct.toFixed(2)}%)
3. CoinGlass Liquidity: ${isLiquidityAvailable ? 'PASS' : 'FAIL (DATA STALE/UNAVAILABLE)'}
4. 1H RSI: ${rsi1H.current} -> ${rsiInZone ? 'PASS' : 'FAIL'} (Zone: ${config.rsiMin}-${config.rsiMax})
5. 30M RSI Leadership: ${leadership.leads ? 'PASS' : 'FAIL'} (${leadership.reason})
Final Decision: ${signalValid ? 'VALID SIGNAL (+1% Target)' : 'REJECTED'}
  `.trim();

  return {
    strategyCode: 'PRICE_ACTION',
    strategyName: 'Price Action',
    version: 'v1.0',
    symbol,
    signalValid,
    signalType: signalValid ? 'LONG' : 'NONE',
    entryPrice: currentPrice,
    targetPrice: parseFloat(targetPrice.toFixed(6)),
    stopLossPrice: supportCheck.level ? supportCheck.level.zoneLow * 0.995 : currentPrice * 0.985,
    conditions,
    indicatorsSnapshot: {
      trend1D: trend1D.direction,
      rsi1H: rsi1H.current,
      rsi30M: rsi30M.current,
      supportPrice: supportCheck.level?.price,
      liquidityStatus: liquidity.freshnessStatus
    },
    explanation,
    evaluatedAt: Date.now(),
    leadTimeSeconds
  };
}
