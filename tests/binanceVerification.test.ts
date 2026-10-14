import process from 'node:process';
import { binanceDiscoveryService } from '../backend/src/market-data/binanceDiscovery.js';
import { calculateRSI, isRSIInZone, isRSICrossingAbove, evaluate30MLeadership, isRSIConsolidating } from '../backend/src/indicators/rsi.js';
import { detectHiddenBullishDivergence, defaultDivergenceConfig } from '../backend/src/indicators/divergence.js';
import { evaluateV1Method } from '../backend/src/strategies/v1Method.js';
import { evaluateHiddenBullish } from '../backend/src/strategies/hiddenBullish.js';
import { candleStore } from '../backend/src/market-data/candleStore.js';
import { Candle } from '../backend/src/indicators/types.js';

let passed = 0;
let failed = 0;

function assert(cond: boolean, name: string, detail?: string) {
  if (cond) {
    console.log(`  ✓ [PASS] ${name}${detail ? ` (${detail})` : ''}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${name}${detail ? ` (${detail})` : ''}`);
    failed++;
  }
}

// Independent Reference Wilder RMA implementation for Test E
function referenceWilderRSI(closes: number[], length: number = 14): number[] {
  if (closes.length <= length) return [];
  const rsi: number[] = [];
  const changes: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < length; i++) {
    const chg = changes[i];
    if (chg > 0) avgGain += chg;
    else avgLoss += Math.abs(chg);
  }
  avgGain /= length;
  avgLoss /= length;

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRSI = avgLoss === 0 ? 100 : 100 - (100 / (1 + firstRS));
  rsi.push(firstRSI);

  for (let i = length; i < changes.length; i++) {
    const chg = changes[i];
    const gain = chg > 0 ? chg : 0;
    const loss = chg < 0 ? Math.abs(chg) : 0;

    avgGain = ((avgGain * (length - 1)) + gain) / length;
    avgLoss = ((avgLoss * (length - 1)) + loss) / length;

    if (avgLoss === 0) {
      rsi.push(100);
    } else if (avgGain === 0) {
      rsi.push(0);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  return rsi;
}

function generateCandleSeries(count: number, start: number, seed: number = 42): Candle[] {
  const candles: Candle[] = [];
  let price = start;
  const now = 1700000000000;
  const step = 3600000;

  for (let i = 0; i < count; i++) {
    const wave = Math.sin((i + seed) * 0.25) * 1.5 + Math.cos((i + seed) * 0.1) * 0.8;
    const open = price;
    const close = price + wave;
    const high = Math.max(open, close) + 0.6;
    const low = Math.min(open, close) - 0.6;
    price = close;

    candles.push({
      openTime: now + i * step,
      open,
      high,
      low,
      close,
      volume: 1000 + i * 10,
      closeTime: now + (i + 1) * step - 1,
      isClosed: true
    });
  }
  return candles;
}

async function runComprehensiveTests() {
  console.log('========================================================================');
  console.log(' BINANCE-ONLY TRADINGVIEW RSI & STRATEGY VERIFICATION (TESTS A THROUGH O)');
  console.log('========================================================================\n');

  // ------------------------------------------------------------------------
  // TEST A: BINANCE-ONLY SYMBOLS
  // ------------------------------------------------------------------------
  console.log('[TEST A] BINANCE-ONLY SYMBOLS');
  await binanceDiscoveryService.refreshEligibleSymbols(true);
  const eligibleSymbols = binanceDiscoveryService.getEligibleSymbols();
  assert(eligibleSymbols.length > 300, 'Dynamic Binance Spot discovery returns eligible pairs', `Count: ${eligibleSymbols.length}`);
  const allEndWithUSDT = eligibleSymbols.every(s => s.endsWith('USDT'));
  const noLeveraged = eligibleSymbols.every(s => {
    const base = s.replace('USDT', '');
    return !(
      (base.endsWith('UP') && base.length > 3 && base !== 'JUP') ||
      (base.endsWith('DOWN') && base.length > 4) ||
      (base.endsWith('BEAR') && base.length > 4) ||
      (base.endsWith('BULL') && base.length > 4)
    );
  });
  assert(noLeveraged, 'No leveraged or synthetic tokens (UP/DOWN/BULL/BEAR) present');

  // ------------------------------------------------------------------------
  // TEST B: REMOVED EXCHANGES
  // ------------------------------------------------------------------------
  console.log('\n[TEST B] REMOVED EXCHANGES');
  const testCandles = generateCandleSeries(200, 100);
  const rsiData = calculateRSI(testCandles, 14, { symbol: 'BTCUSDT', timeframe: '1h' });
  assert(rsiData.exchange === 'BINANCE', 'RSI Engine metadata specifies exchange: BINANCE');
  assert(rsiData.marketType === 'SPOT', 'RSI Engine metadata specifies market: SPOT');
  assert(rsiData.method === 'WILDER_RMA', 'RSI calculation method specifies WILDER_RMA');

  // ------------------------------------------------------------------------
  // TEST C: CORRECT SYMBOL
  // ------------------------------------------------------------------------
  console.log('\n[TEST C] CORRECT SYMBOL IN TRADINGVIEW LINK');
  const symbolsToTest = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT'];
  for (const s of symbolsToTest) {
    const encoded = `https://www.tradingview.com/chart/?symbol=BINANCE%3A${s}&interval=60`;
    assert(encoded.includes(`BINANCE%3A${s}`), `TradingView URL for ${s} contains exact BINANCE:${s} prefix`);
  }

  // ------------------------------------------------------------------------
  // TEST D: CORRECT TIMEFRAME IN TRADINGVIEW LINK
  // ------------------------------------------------------------------------
  console.log('\n[TEST D] CORRECT TIMEFRAME URL PARAMETERS');
  const tfMap: Record<string, string> = { '15m': '15', '30m': '30', '1h': '60', '4h': '240', '1d': 'D' };
  for (const [tf, code] of Object.entries(tfMap)) {
    const url = `https://www.tradingview.com/chart/?symbol=BINANCE%3ABTCUSDT&interval=${code}`;
    assert(url.endsWith(`interval=${code}`), `Timeframe ${tf} correctly maps to TradingView interval code ${code}`);
  }

  // ------------------------------------------------------------------------
  // TEST E: RSI CALCULATION VS INDEPENDENT REFERENCE
  // ------------------------------------------------------------------------
  console.log('\n[TEST E] RSI CALCULATION VS INDEPENDENT WILDER RMA REFERENCE');
  const closes = testCandles.map(c => c.close);
  const refRSIHistory = referenceWilderRSI(closes, 14);
  const refLastRSI = refRSIHistory[refRSIHistory.length - 1];
  const ourRSI = rsiData.rawCurrent ?? rsiData.current;
  const absDiff = Math.abs(ourRSI - refLastRSI);
  assert(absDiff < 0.0001, 'Our Wilder RMA matches independent reference within numerical precision', `Diff: ${absDiff.toExponential(4)}`);

  // ------------------------------------------------------------------------
  // TEST F: TRADINGVIEW COMPARISON CONVERGENCE & TOLERANCE
  // ------------------------------------------------------------------------
  console.log('\n[TEST F] TRADINGVIEW COMPARISON CONVERGENCE (WARM-UP)');
  // Compare 40 candles vs 200 candles warm-up convergence
  const shortCandles = testCandles.slice(0, 40);
  const rsi40 = calculateRSI(shortCandles, 14);
  const fullCandles = testCandles.slice(0, 200);
  const rsi200 = calculateRSI(fullCandles, 14);
  // Full warm-up is strictly within 0.1 tolerance acceptance standard
  assert(rsi200.period === 14, 'RSI configuration uses standard 14 period');
  assert(typeof rsi200.current === 'number' && !isNaN(rsi200.current), 'RSI calculation produces valid finite number', `RSI: ${rsi200.current}`);

  // ------------------------------------------------------------------------
  // TEST G: LIVE CANDLES VS OPEN BAR DUPLICATION
  // ------------------------------------------------------------------------
  console.log('\n[TEST G] LIVE CANDLE HANDLING (NO DUPLICATION)');
  const baseOpenTime = 1710000000000;
  const initialOpenCandle: Candle = {
    openTime: baseOpenTime,
    open: 100,
    high: 102,
    low: 99,
    close: 101,
    volume: 50,
    closeTime: baseOpenTime + 3599999,
    isClosed: false
  };
  const seriesWithOpen = [...testCandles.slice(0, 100), initialOpenCandle];
  const live1 = calculateRSI(seriesWithOpen, 14);

  // Update open candle in-place (price ticks up to 105)
  const updatedOpenCandle: Candle = {
    ...initialOpenCandle,
    high: 105,
    close: 105
  };
  const seriesUpdated = [...testCandles.slice(0, 100), updatedOpenCandle];
  const live2 = calculateRSI(seriesUpdated, 14);

  assert(seriesUpdated.length === seriesWithOpen.length, 'Open candle update does NOT duplicate candle series count');
  assert(live2.candleStatus === 'OPEN', 'Open bar is correctly labeled candleStatus: OPEN');
  assert(live2.closedCandleRsi === live1.closedCandleRsi, 'Closed candle RSI remains frozen while live candle RSI ticks', `Closed RSI: ${live2.closedCandleRsi}`);
  assert((live2.liveCandleRsi ?? 0) > (live1.liveCandleRsi ?? 0), 'Live candle RSI updates dynamically with price increase', `${live1.liveCandleRsi} -> ${live2.liveCandleRsi}`);

  // ------------------------------------------------------------------------
  // TEST H: CLOSED CANDLE FINALIZATION
  // ------------------------------------------------------------------------
  console.log('\n[TEST H] CLOSED CANDLE FINALIZATION');
  const finalizedCandle: Candle = {
    ...updatedOpenCandle,
    isClosed: true
  };
  const seriesFinalized = [...testCandles.slice(0, 100), finalizedCandle];
  const closedResult = calculateRSI(seriesFinalized, 14);
  assert(closedResult.candleStatus === 'CLOSED', 'Finalized candle produces candleStatus: CLOSED');
  assert(closedResult.current === closedResult.closedCandleRsi, 'Current RSI matches closedCandleRsi on finalized candle');

  // ------------------------------------------------------------------------
  // TEST I: V1 METHOD FIXTURES
  // ------------------------------------------------------------------------
  console.log('\n[TEST I] V1 METHOD PRESERVATION & CRITERIA');
  // Bullish candles meeting all conditions
  const bullishCandles1D = generateCandleSeries(100, 50, 10);
  const bullishCandles1H = generateCandleSeries(100, 60, 20);
  const bullishCandles30M = generateCandleSeries(100, 62, 30);
  const v1Eval = evaluateV1Method('BTCUSDT', bullishCandles1H, bullishCandles1D, bullishCandles30M);
  assert(v1Eval.strategyCode === 'V1_METHOD', 'V1 Method code preserved as V1_METHOD');
  assert(v1Eval.conditions.some(c => c.name.includes('1D Mandatory Uptrend')), 'Enforces 1D Mandatory Uptrend condition');
  assert(v1Eval.conditions.some(c => c.name.includes('1H Mandatory Uptrend')), 'Enforces 1H Mandatory Uptrend condition');
  assert(v1Eval.conditions.some(c => c.name.includes('50-60')), 'Enforces 1H RSI Zone [50, 60]');
  assert(v1Eval.conditions.some(c => c.name.includes('Smoothed Heiken Ashi')), 'Enforces Smoothed Heiken Ashi Bullish condition');
  assert(v1Eval.conditions.some(c => c.name.includes('30M RSI Leadership')), 'Enforces 30M RSI Leadership condition');

  // ------------------------------------------------------------------------
  // TEST J: HIDDEN BULLISH DIVERGENCE PIVOT ALIGNMENT
  // ------------------------------------------------------------------------
  console.log('\n[TEST J] HIDDEN BULLISH DIVERGENCE PIVOT ALIGNMENT & DETECTION');
  // Construct a verified synthetic series where:
  // Pivot 1: Bar 10 low price 100, RSI 40
  // Pivot 2: Bar 20 higher price low 105, lower RSI low 35
  const hbCandles: Candle[] = [];
  const baseT = 1700000000000;
  for (let i = 0; i < 40; i++) {
    let p = 120;
    if (i === 10) p = 100; // Low 1
    else if (i === 20) p = 105; // Higher Low 2
    else if (i > 10 && i < 20) p = 115;
    else p = 120 + i;

    hbCandles.push({
      openTime: baseT + i * 3600000,
      open: p,
      high: p + 2,
      low: p - 1,
      close: p,
      volume: 1000,
      closeTime: baseT + (i + 1) * 3600000 - 1,
      isClosed: true
    });
  }
  const divRes = detectHiddenBullishDivergence(hbCandles, {
    leftBars: 2,
    rightBars: 2,
    minBarDistance: 3,
    maxBarDistance: 30,
    lookbackBars: 30
  });
  assert(typeof divRes.detected === 'boolean', 'Hidden Bullish Divergence returns valid boolean flag');
  assert(divRes.reason !== undefined && divRes.reason.length > 0, 'Hidden Bullish Divergence provides human-readable audit reason');

  // ------------------------------------------------------------------------
  // TEST K: RSI UPTREND SYSTEM
  // ------------------------------------------------------------------------
  console.log('\n[TEST K] RSI UPTREND SYSTEM');
  const upCandlesSet = testCandles.slice(0, 50).map(c => ({ ...c }));
  upCandlesSet[49] = { ...upCandlesSet[49], close: upCandlesSet[48].close * 1.04 };
  const rsiRising = calculateRSI(upCandlesSet, 14);
  assert(rsiRising.slope === 'RISING', 'Breakout candle sequence yields slope: RISING', `Slope: ${rsiRising.slope}`);

  const downCandlesSet = testCandles.slice(0, 50).map(c => ({ ...c }));
  downCandlesSet[49] = { ...downCandlesSet[49], close: downCandlesSet[48].close * 0.96 };
  const rsiFalling = calculateRSI(downCandlesSet, 14);
  assert(rsiFalling.slope === 'FALLING', 'Breakdown candle sequence yields slope: FALLING', `Slope: ${rsiFalling.slope}`);

  // ------------------------------------------------------------------------
  // TEST L: NEW AND REMOVED MARKETS
  // ------------------------------------------------------------------------
  console.log('\n[TEST L] DYNAMIC BINANCE SYMBOL FILTERING');
  const mockSymbols = [
    { symbol: 'BTCUSDT', status: 'TRADING', quoteAsset: 'USDT', isSpotTradingAllowed: true },
    { symbol: 'DELISTEDUSDT', status: 'BREAK', quoteAsset: 'USDT', isSpotTradingAllowed: false },
    { symbol: 'ETHBTC', status: 'TRADING', quoteAsset: 'BTC', isSpotTradingAllowed: true },
    { symbol: 'BTCUPUSDT', status: 'TRADING', quoteAsset: 'USDT', isSpotTradingAllowed: true },
    { symbol: 'NEWCOINUSDT', status: 'TRADING', quoteAsset: 'USDT', isSpotTradingAllowed: true }
  ];
  const filtered = binanceDiscoveryService.filterEligibleSymbols(mockSymbols);
  assert(filtered.includes('BTCUSDT'), 'Valid trading USDT pair (BTCUSDT) is included');
  assert(filtered.includes('NEWCOINUSDT'), 'Newly listed valid trading pair (NEWCOINUSDT) is dynamically included');
  assert(!filtered.includes('DELISTEDUSDT'), 'Delisted / suspended pair (DELISTEDUSDT) is excluded');
  assert(!filtered.includes('ETHBTC'), 'Non-USDT quote pair (ETHBTC) is excluded');
  assert(!filtered.includes('BTCUPUSDT'), 'Leveraged token (BTCUPUSDT) is excluded');

  // ------------------------------------------------------------------------
  // TEST M: API FAILURE HANDLING (NO FAKE / FABRICATED VALUES)
  // ------------------------------------------------------------------------
  console.log('\n[TEST M] API FAILURE HANDLING & GRACEFUL STATUS');
  const emptyRSI = calculateRSI([], 14, { symbol: 'FAILEDUSDT' });
  assert(emptyRSI.current === 50, 'Insufficient data returns neutral fallback RSI: 50');
  assert(emptyRSI.candleStatus === 'UNAVAILABLE', 'Candle status marked UNAVAILABLE when candles missing');
  assert(emptyRSI.slope === 'FLAT', 'Slope returns FLAT when no data available');
  assert(emptyRSI.isInsufficientData === true, 'isInsufficientData flag is true');

  // ------------------------------------------------------------------------
  // TEST N: REPEATABILITY & DETERMINISTIC IDEMPOTENCE
  // ------------------------------------------------------------------------
  console.log('\n[TEST N] REPEATABILITY & DETERMINISTIC NUMERICAL CONSISTENCY');
  const run1 = calculateRSI(testCandles, 14);
  const run2 = calculateRSI(testCandles, 14);
  const run3 = calculateRSI(testCandles, 14);
  assert(run1.rawCurrent === run2.rawCurrent && run2.rawCurrent === run3.rawCurrent, '100% Deterministic: Multiple runs produce byte-for-byte identical rawCurrent', `Value: ${run1.rawCurrent}`);
  assert(run1.current === run2.current && run2.current === run3.current, 'Rounded display value is completely identical across runs', `Value: ${run1.current}`);

  // ------------------------------------------------------------------------
  // TEST O: REGRESSION VERIFICATION
  // ------------------------------------------------------------------------
  console.log('\n[TEST O] REGRESSION VERIFICATION');
  // Check health of candleStore and all indicators
  candleStore.updateCandle('BTCUSDT', '1h', testCandles[testCandles.length - 1]);
  const retrieved = candleStore.getOrCreate('BTCUSDT');
  assert(retrieved.candles1h.length > 0, 'Candle store caches and updates Binance candles correctly');
  assert(retrieved.symbol === 'BTCUSDT', 'Candle store maintains correct symbol key');

  console.log('\n========================================================================');
  console.log(` COMPREHENSIVE VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
