import process from 'node:process';
import { Candle } from '../backend/src/indicators/types.js';
import { calculateRSI, isRSIInZone, isRSICrossingAbove, evaluate30MLeadership } from '../backend/src/indicators/rsi.js';
import { calculateEMA, evaluateEMA9EMA33 } from '../backend/src/indicators/ema.js';
import { calculateV1SmoothedHeikenAshi } from '../backend/src/indicators/v1.js';
import { detectTrend } from '../backend/src/indicators/trend.js';
import { calculateSupportResistance, isPriceNearValidSupport } from '../backend/src/indicators/supportResistance.js';
import { detectSourceBullishOrderBlocks, checkOBRetestConfirmation } from '../backend/src/indicators/orderBlock.js';
import { evaluateSourceHiddenBullish, evaluateSourceICTPattern, evaluateGainersMetrics } from '../backend/src/indicators/candlePatterns.js';
import { evaluatePriceAction } from '../backend/src/strategies/priceAction.js';
import { evaluateV1Method } from '../backend/src/strategies/v1Method.js';
import { evaluateGainersMethod } from '../backend/src/strategies/gainersMethod.js';
import { evaluateHiddenBullish } from '../backend/src/strategies/hiddenBullish.js';
import { evaluateV1Ema } from '../backend/src/strategies/v1Ema.js';
import { evaluateOBMethod } from '../backend/src/strategies/obMethod.js';
import { evaluateICTMethod } from '../backend/src/strategies/ictMethod.js';
import { CentralRiskEngine } from '../backend/src/risk/riskEngine.js';
import { MasterOpportunityManager } from '../backend/src/risk/masterOpportunity.js';
import { ExecutionEngine } from '../backend/src/execution/executionEngine.js';
import { eventBus } from '../backend/src/core/events.js';
import { backtestEngine } from '../backend/src/backtesting/backtestEngine.js';
import { ReplaySession } from '../backend/src/backtesting/replayEngine.js';
import { CommandAgent } from '../backend/src/agents/intelligence/commandAgent.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedTests++;
  }
}

// Helper to generate simulated candles
function makeCandles(count: number, startPrice: number, trend: 'UP' | 'DOWN' | 'FLAT'): Candle[] {
  const candles: Candle[] = [];
  let price = startPrice;
  const now = Date.now();
  const step = 3600000; // 1 hour

  for (let i = 0; i < count; i++) {
    const delta = trend === 'UP' ? 1.5 : trend === 'DOWN' ? -1.5 : Math.sin(i) * 0.1;
    const open = price;
    const close = price + delta;
    const high = Math.max(open, close) + 1.0;
    const low = Math.min(open, close) - 1.0;
    price = close;

    candles.push({
      openTime: now - (count - i) * step,
      open,
      high,
      low,
      close,
      volume: 500,
      closeTime: now - (count - i) * step + step - 1,
      isClosed: true
    });
  }
  return candles;
}

async function runAllTests() {
  console.log('===============================================================');
  console.log(' APEXCRYPTO PRO VERIFICATION TEST SUITE (UNIT, INTEGRATION, E2E)');
  console.log('===============================================================');

  const { getDb } = await import('../backend/src/database/db.js');
  await getDb();

  // 1. RSI Indicator Tests
  console.log('\n[1] Testing RSI Indicator & Leadership...');
  const upCandles = makeCandles(30, 100, 'UP');
  const downCandles = makeCandles(30, 100, 'DOWN');
  const rsiUp = calculateRSI(upCandles, 14);
  const rsiDown = calculateRSI(downCandles, 14);

  assert(rsiUp.current > 60, `RSI Upward Trend should be high (>60), got ${rsiUp.current}`);
  assert(rsiDown.current < 40, `RSI Downward Trend should be low (<40), got ${rsiDown.current}`);
  assert(isRSIInZone(35, 25, 40) === true, 'RSI 35 is in buying zone [25, 40]');
  assert(isRSIInZone(45, 25, 40) === false, 'RSI 45 is outside buying zone [25, 40]');
  assert(isRSICrossingAbove(53.2, 54.5, 54) === true, 'RSI 53.2 -> 54.5 crosses 54 upward');

  const leadCheck = evaluate30MLeadership(
    { current: 53, previous: 52, slope: 'RISING', history: [50, 51, 52, 53] } as any,
    { current: 56, previous: 55, slope: 'RISING', history: [53, 54, 55, 56] } as any
  );
  assert(leadCheck.leads === true, '30M RSI (54 -> 55 -> 56) positively leads 1H RSI (~53)');

  // 2. EMA Indicator Tests
  console.log('\n[2] Testing EMA 9 & EMA 33 Engine...');
  const emaValues = calculateEMA([10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 5);
  assert(emaValues.length === 10, 'EMA array preserves length');
  assert(emaValues[9] > emaValues[0], 'EMA reflects positive price trend');

  const upCandles40 = makeCandles(45, 100, 'UP');
  const emaAnalysis = evaluateEMA9EMA33(upCandles40);
  assert(emaAnalysis.ema9 > 0 && emaAnalysis.ema33 > 0, `EMA 9 (${emaAnalysis.ema9}) and EMA 33 (${emaAnalysis.ema33}) calculated`);

  // 3. V1 Smoothed Heiken Ashi Indicator Tests
  console.log('\n[3] Testing Smoothed Heiken Ashi V1 Method Indicator...');
  const v1Up = calculateV1SmoothedHeikenAshi(upCandles, 5);
  assert(v1Up.state === 'GREEN', `Bullish series gives GREEN V1 state, got ${v1Up.state}`);
  const v1Down = calculateV1SmoothedHeikenAshi(downCandles, 5);
  assert(v1Down.state === 'RED', `Bearish series gives RED V1 state, got ${v1Down.state}`);

  // 4. Trend Detection Tests
  console.log('\n[4] Testing Multi-Timeframe Trend Detection...');
  const trendUp = detectTrend(upCandles, 20);
  assert(trendUp.direction === 'UPTREND', 'Up candles detected as UPTREND');
  const trendDown = detectTrend(downCandles, 20);
  assert(trendDown.direction === 'DOWNTREND', 'Down candles detected as DOWNTREND');
  const flatCandles = makeCandles(30, 100, 'FLAT');
  const trendFlat = detectTrend(flatCandles, 20);
  assert(trendFlat.direction === 'SIDEWAYS', 'Flat candles detected as SIDEWAYS');

  // 5. Support & Resistance Tests
  console.log('\n[5] Testing 1H Support & Resistance Detection...');
  const sr = calculateSupportResistance(flatCandles);
  assert(Array.isArray(sr), 'S/R returns levels array');
  const supCheck = isPriceNearValidSupport(100, [{ id: '1', type: 'SUPPORT', price: 99.5, zoneLow: 99.0, zoneHigh: 100.2, touches: 2, timestamp: Date.now(), status: 'VALID' }], 1.0);
  assert(supCheck.near === true, 'Support bounce proximity check passed');

  // 6. Bullish Order Block Tests (Prompt Section 8: 3+ green preceded by red)
  console.log('\n[6] Testing Bullish Order Block Formation (3+ Green preceded by Red)...');
  const obCandles: Candle[] = [
    { openTime: 1000, open: 100, high: 102, low: 98, close: 99, volume: 100, closeTime: 1999, isClosed: true }, // RED candle
    { openTime: 2000, open: 99, high: 103, low: 99, close: 102, volume: 200, closeTime: 2999, isClosed: true }, // Green 1
    { openTime: 3000, open: 102, high: 105, low: 102, close: 104, volume: 250, closeTime: 3999, isClosed: true }, // Green 2
    { openTime: 4000, open: 104, high: 108, low: 104, close: 107, volume: 300, closeTime: 4999, isClosed: true }, // Green 3
    { openTime: 5000, open: 107, high: 107, low: 100, close: 103, volume: 150, closeTime: 5999, isClosed: true } // Pullback touch
  ];
  const obs = detectSourceBullishOrderBlocks(obCandles, 3, 0.5);
  assert(obs.length === 1, 'Exactly 1 source Bullish Order Block detected');
  assert(obs[0].low === 98 && obs[0].high === 102, `OB zone matches red candle [98, 102], got [${obs[0].low}, ${obs[0].high}]`);

  // 7. Gainers Method Metrics Tests (Prompt Section 5)
  console.log('\n[7] Testing Gainers Method Metrics & Restrictions...');
  const gainerMetrics = evaluateGainersMetrics(
    flatCandles,
    42.5, // 42.5% pump (~40%)
    ['BTCUSDT', 'BTCUSDC', 'BTCFDUSD'], // 3 quote pairs
    false, // NOT under monitoring ("Monitoring mai na ho")
    false, // NOT delisting
    false  // NOT new
  );
  assert(gainerMetrics.isTopGainerEligible === true, 'Gainers metrics passed all restrictions including "Monitoring mai na ho"');

  const gainerRestricted = evaluateGainersMetrics(
    flatCandles,
    42.5,
    ['BTCUSDT', 'BTCUSDC', 'BTCFDUSD'],
    true, // Under monitoring
    false,
    false
  );
  assert(gainerRestricted.isTopGainerEligible === false, 'Gainers correctly rejects coin under Binance monitoring');

  // 8. Strategy 4 Hidden Bullish Tests (Prompt Section 6: custom 10-candle drop)
  console.log('\n[8] Testing Strategy 4 Hidden Bullish (Custom 10-candle drop structure)...');
  const hbCandles: Candle[] = [];
  let p = 110;
  for (let i = 0; i < 9; i++) {
    hbCandles.push({ openTime: i * 1000, open: p, high: p + 1, low: p - 2, close: p - 1.5, volume: 100, closeTime: (i + 1) * 1000 - 1, isClosed: true });
    p -= 1.5;
  }
  // Upward reaction
  hbCandles.push({ openTime: 9000, open: p, high: p + 2, low: p, close: p + 1.8, volume: 200, closeTime: 9999, isClosed: true });
  hbCandles.push({ openTime: 10000, open: p + 1.8, high: p + 3, low: p + 1.5, close: p + 2.5, volume: 250, closeTime: 10999, isClosed: true });
  hbCandles.push({ openTime: 11000, open: p + 2.5, high: p + 4, low: p + 2.0, close: p + 3.5, volume: 250, closeTime: 11999, isClosed: true });

  const hbPattern = evaluateSourceHiddenBullish(hbCandles, 8, 0.5, 0.2);
  assert(hbPattern.matched === true, 'Hidden Bullish 10-candle drop and reaction detected');

  // 9. Central Risk Engine & Emergency Kill Switch Tests (Prompt Section 21 & 22)
  console.log('\n[9] Testing Central Risk Engine & Emergency Kill Switch...');
  const risk = new CentralRiskEngine();
  risk.setTradingMode('PAPER');

  const mockSignal = {
    strategyCode: 'PRICE_ACTION',
    strategyName: 'Price Action',
    version: 'v1.0',
    symbol: 'BTCUSDT',
    signalValid: true,
    signalType: 'LONG' as const,
    entryPrice: 95000,
    targetPrice: 95950, // +1%
    conditions: [],
    indicatorsSnapshot: {},
    explanation: 'Test',
    evaluatedAt: Date.now(),
    leadTimeSeconds: 30
  };

  const riskPassed = await risk.validateSignal(mockSignal, 10, 1, false);
  assert(riskPassed.approved === true, 'Risk validation approved normal order');

  // Test Emergency Kill Switch
  risk.triggerEmergencyKillAllTrading('TestRunner');
  assert(risk.isEmergencyKillActive() === true, 'Emergency kill switch active');

  const riskBlocked = await risk.validateSignal(mockSignal, 10, 1, false);
  assert(riskBlocked.approved === false, 'Emergency kill switch rejects order');
  risk.resetEmergencyHalt();

  // Test Stale Data rejection (> 60s)
  const riskStale = await risk.validateSignal(mockSignal, 120, 1, false);
  assert(riskStale.approved === false, 'Risk engine rejects trade with stale data (> 60s)');

  // 10. Master Opportunity Confluence & Duplicate Protection Tests (Prompt Section 20)
  console.log('\n[10] Testing Master Opportunity Duplicate Signal Guard...');
  const mom = new MasterOpportunityManager();
  const opp1 = mom.processStrategySignals([mockSignal], 0);
  assert(opp1 !== null && opp1.symbol === 'BTCUSDT', 'Master Opportunity created for BTCUSDT');

  // Second strategy signal on same coin
  const mockSignal2 = { ...mockSignal, strategyCode: 'V1_METHOD', strategyName: 'V1 Method' };
  const opp2 = mom.processStrategySignals([mockSignal2], 0);
  assert(opp2 !== null && opp2.confluence_strategies.includes('V1_METHOD'), 'Duplicate signal aggregated into Master Opportunity confluence');

  // 11. End-to-End Execution & +1% Target Profit System Simulation (Prompt Section 10 & 11)
  console.log('\n[11] Testing End-to-End Pipeline (+1% Target Hit -> Exit -> Journal)...');
  const exec = new ExecutionEngine();
  const position = await exec.executeOpportunity(opp1!, 'PAPER');
  assert(position !== null && position.status === 'OPEN', 'Position opened at entry price');
  assert(position?.targetPrice === parseFloat((position!.entryPrice * 1.01).toFixed(6)), '+1% Target price computed accurately');

  // Simulate market price reaching +1% target
  await exec.updateMarketPrice(position!.symbol, position!.targetPrice + 1.0);
  const openPos = exec.getOpenPositions().find(p => p.id === position!.id);
  assert(!openPos, 'Position exited upon hitting +1% Target');

  const closedTrades = exec.getClosedTrades();
  assert(closedTrades.length > 0 && closedTrades[0].exitReason === 'TARGET_REACHED', 'Trade logged in closed trades with TARGET_REACHED');
  assert(closedTrades[0].netPnl > 0, `Trade achieved positive net PnL: $${closedTrades[0].netPnl}`);

  // 12. Individual 7 Strategies Comprehensive Test Suite
  console.log('\n[12] Testing All 7 Core Strategy Engines Individually...');
  const mockLiq = {
    symbol: 'BTCUSDT',
    timestamp: Date.now(),
    source: 'coinglass' as const,
    dataFreshness: 'FRESH' as const,
    heatmap24h: { nearestPoolAbovePrice: 96000, nearestPoolBelowPrice: 94000, distanceToNearestPoolPct: 0.8 },
    liquidationPools: []
  } as any;

  const paResult = evaluatePriceAction('BTCUSDT', upCandles, upCandles, upCandles, mockLiq);
  assert(paResult.strategyCode === 'PRICE_ACTION', 'Strategy 1 (Price Action) returned valid code');
  assert(paResult.targetPrice > paResult.entryPrice, 'Strategy 1 computed target price > entry price');

  const v1Result = evaluateV1Method('BTCUSDT', upCandles, upCandles, upCandles);
  assert(v1Result.strategyCode === 'V1_METHOD', 'Strategy 2 (V1 Method) returned valid code');
  assert(v1Result.conditions.some(c => c.name.includes('1D Mandatory Uptrend')), 'Strategy 2 enforces 1D mandatory UP condition');

  const gainerResult = evaluateGainersMethod('BTCUSDT', upCandles, 2, 41.5, ['BTCUSDT', 'BTCUSDC', 'BTCFDUSD'], false, false, false);
  assert(gainerResult.strategyCode === 'GAINERS_METHOD', 'Strategy 3 (Gainers Method) returned valid code');
  assert(gainerResult.conditions.some(c => c.name.includes('Binance Restrictions') || c.requiredCondition.includes('Monitoring')), 'Strategy 3 checks "Monitoring mai na ho"');

  const hbResult = evaluateHiddenBullish('BTCUSDT', hbCandles, upCandles);
  assert(hbResult.strategyCode === 'HIDDEN_BULLISH', 'Strategy 4 (Hidden Bullish) returned valid code');
  assert(hbResult.conditions.some(c => c.name.includes('10-Candle')), 'Strategy 4 enforces custom 10-candle drop structure');

  const v1EmaResult = evaluateV1Ema('BTCUSDT', upCandles, upCandles, upCandles);
  assert(v1EmaResult.strategyCode === 'V1_EMA', 'Strategy 5 (V1 + EMA) returned valid code');
  assert(v1EmaResult.conditions.some(c => c.name.includes('EMA 9')), 'Strategy 5 includes EMA 9 & EMA 33 rule');

  const obResult = evaluateOBMethod('BTCUSDT', obCandles, obCandles);
  assert(obResult.strategyCode === 'OB_METHOD', 'Strategy 6 (OB Method) returned valid code');
  assert(obResult.conditions.some(c => c.name.includes('Order Block')), 'Strategy 6 detects 3+ green pump Order Block');

  const ictResult = evaluateICTMethod('BTCUSDT', upCandles);
  assert(ictResult.strategyCode === 'ICT_METHOD', 'Strategy 7 (ICT Method) returned valid code');
  assert(ictResult.conditions.some(c => c.name.includes('Trend State') || c.requiredCondition.includes('Sideways')), 'Strategy 7 strictly checks 1H trend is NOT sideways');

  // 13. Backtesting Engine Simulation
  console.log('\n[13] Testing Backtest Engine (Zero Lookahead Simulation)...');
  const btestReport = backtestEngine.runBacktest({
    strategyCode: 'PRICE_ACTION',
    symbol: 'BTCUSDT',
    initialBalanceUSD: 10000,
    positionSizeUSD: 1000,
    targetPct: 1.0,
    feePct: 0.1,
    slippagePct: 0.05,
    candles1D: upCandles,
    candles1H: upCandles,
    candles30M: upCandles,
    candles15M: upCandles
  });
  assert(btestReport.initialBalance === 10000, 'Backtest initial balance preserved ($10,000)');
  assert(typeof btestReport.winRatePct === 'number', 'Backtest calculated win rate percentage');
  assert(typeof btestReport.netPnlUSD === 'number', 'Backtest calculated net PnL USD');

  // 14. Historical Replay Engine (Bar-by-Bar Step)
  console.log('\n[14] Testing Historical Replay Engine (Candle-by-Candle Step)...');
  const replay = new ReplaySession('sess-test-01', 'BTCUSDT', '1h', upCandles);
  const initialReplayState = replay.getState();
  assert(initialReplayState.currentIndex === 29, `Initial replay index clamped at candle count (${initialReplayState.currentIndex})`);
  assert(initialReplayState.indicators.rsi14 > 0, 'Replay calculates indicator values on active bar');

  // 15. Command Agent NLP Parsing
  console.log('\n[15] Testing Command Agent Natural Language Parsing...');
  const cmdAgent = new CommandAgent();
  const killCmd = cmdAgent.parseUserPrompt('Emergency kill switch immediately halt everything');
  assert(killCmd.action_type === 'EMERGENCY_STOP', 'Command Agent parsed "emergency kill" as EMERGENCY_STOP');

  const pauseCmd = cmdAgent.parseUserPrompt('pause live trading for now');
  assert(pauseCmd.action_type === 'PAUSE_TRADING', 'Command Agent parsed "pause live" as PAUSE_TRADING');

  const scanCmd = cmdAgent.parseUserPrompt('scan all markets for new signals');
  assert(scanCmd.action_type === 'SCAN_ALL', 'Command Agent parsed "scan all" as SCAN_ALL');

  // 16. Database Direct Persistence Verification
  console.log('\n[16] Testing Database Tables & Persistence Integrity...');
  const db = await getDb();
  const posQuery = await db.query('SELECT count(*) as count FROM positions');
  assert(Number(posQuery.rows[0].count) >= 1, `Positions persisted in DB: count = ${posQuery.rows[0].count}`);

  const tradesQuery = await db.query('SELECT count(*) as count FROM trades');
  assert(Number(tradesQuery.rows[0].count) >= 1, `Trades persisted in DB: count = ${tradesQuery.rows[0].count}`);

  const journalQuery = await db.query('SELECT count(*) as count FROM trade_journal');
  assert(Number(journalQuery.rows[0].count) >= 1, `Trade Journal records persisted: count = ${journalQuery.rows[0].count}`);

  const stratsQuery = await db.query('SELECT count(*) as count FROM strategies');
  assert(Number(stratsQuery.rows[0].count) === 7, `All 7 strategies seeded in DB: count = ${stratsQuery.rows[0].count}`);

  const agentsQuery = await db.query('SELECT count(*) as count FROM agents');
  assert(Number(agentsQuery.rows[0].count) === 34, `All 34 system agents seeded in DB: count = ${agentsQuery.rows[0].count}`);

  console.log('\n===============================================================');
  console.log(` TEST RUN COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('===============================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
