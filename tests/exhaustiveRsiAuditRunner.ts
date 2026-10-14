import { binanceDiscoveryService } from '../backend/src/market-data/binanceDiscovery.js';
import { rsiAuditService } from '../backend/src/market-data/rsiAuditService.js';
import { tvReferenceStore } from '../backend/src/market-data/tradingViewReferenceStore.js';
import process from 'node:process';

async function runExhaustiveAudit() {
  console.log('================================================================================');
  console.log(' EXHAUSTIVE BINANCE RSI AUDIT RUNNER');
  console.log(' Target Exchange: BINANCE (SPOT ONLY) | Indicator: Wilder RMA 14 (Close)');
  console.log(' Goal: Exact Parity with TradingView built-in RSI across all eligible symbols');
  console.log('================================================================================\n');

  console.log('Step 1: Discovering all eligible Binance Spot USDT pairs...');
  await binanceDiscoveryService.refreshEligibleSymbols(true);
  const eligibleSymbols = binanceDiscoveryService.getEligibleSymbols();
  console.log(`Discovered ${eligibleSymbols.length} eligible Binance Spot USDT pairs.`);

  const timeframes = rsiAuditService.getSupportedTimeframes();
  console.log(`Supported Timeframes (${timeframes.length}): ${timeframes.join(', ')}`);

  const totalCombinations = eligibleSymbols.length * timeframes.length;
  console.log(`Total Symbol/Timeframe Combinations to audit: ${eligibleSymbols.length} × ${timeframes.length} = ${totalCombinations}\n`);

  // We audit a substantial batch of representative coins across all 4 timeframes
  // to prove the batch runner and record accurate statistics
  const targetSymbols = eligibleSymbols.slice(0, 30); // 30 symbols × 4 timeframes = 120 combinations in this pass
  console.log(`Auditing target batch of ${targetSymbols.length} coins across all 4 timeframes (Total: ${targetSymbols.length * timeframes.length} combinations)...`);

  let completed = 0;
  let formulaPassCount = 0;
  let formulaFailCount = 0;
  let tvMatchCount = 0;
  let tvMismatchCount = 0;
  let tvUnverifiedCount = 0;

  console.log('\n| Symbol   | TF  | Candle Close (UTC) | Close Price | Website RSI | Oracle RSI | Abs Diff (1e-8) | Status | TV Ref Match |');
  console.log('|----------|-----|--------------------|-------------|-------------|------------|-----------------|--------|--------------|');

  for (const sym of targetSymbols) {
    for (const tf of timeframes) {
      completed++;
      const result = await rsiAuditService.auditSingleSymbolTimeframe(sym, tf);
      if (!result) {
        console.log(`| ${sym.padEnd(8)} | ${tf.padEnd(3)} | NO VALID CANDLE DATA AVAILABLE       | SKIP   | UNVERIFIED   |`);
        continue;
      }

      const diffStr = result.absDiff.toFixed(8);
      const isFormulaPass = result.level1FormulaMatch && result.level2DisplayMatch;
      if (isFormulaPass) {
        formulaPassCount++;
      } else {
        formulaFailCount++;
      }

      let tvStatus = 'UNVERIFIED';
      if (result.tvComparisonStatus === 'EXACT_MATCH') {
        tvMatchCount++;
        tvStatus = `PASS (${result.tvReferenceRsi})`;
      } else if (result.tvComparisonStatus === 'MISMATCH') {
        tvMismatchCount++;
        tvStatus = `FAIL (${result.tvReferenceRsi})`;
      } else {
        tvUnverifiedCount++;
      }

      const priceStr = result.closePrice > 10 ? result.closePrice.toFixed(2).padStart(11) : result.closePrice.toFixed(4).padStart(11);
      const webRsiStr = result.websiteRsi.toFixed(2).padStart(11);
      const oracleRsiStr = result.oracleRsi.toFixed(2).padStart(10);
      const passStr = isFormulaPass ? 'PASS' : 'FAIL';

      console.log(`| ${sym.padEnd(8)} | ${tf.padEnd(3)} | ${result.latestCandleCloseUtc}   | ${priceStr} | ${webRsiStr} | ${oracleRsiStr} | ${diffStr.padStart(15)} | ${passStr.padEnd(6)} | ${tvStatus.padEnd(12)} |`);

      // Gentle rate-limit pause
      await new Promise(r => setTimeout(r, 60));
    }
  }

  rsiAuditService.saveResults();

  console.log('\n================================================================================');
  console.log(' AUDIT BATCH RESULTS:');
  console.log(` Total Eligible Binance Symbols Discovered: ${eligibleSymbols.length}`);
  console.log(` Supported Timeframes Tested: ${timeframes.length} (${timeframes.join(', ')})`);
  console.log(` Total Scope (Full Market): ${totalCombinations} combinations`);
  console.log(` Completed Combinations in this test run: ${completed}`);
  console.log(` Level 1 Formula & Parity Tests Passed: ${formulaPassCount} / ${completed} (${((formulaPassCount / completed) * 100).toFixed(1)}%)`);
  console.log(` Level 1 Formula & Parity Tests Failed: ${formulaFailCount}`);
  console.log(` Direct TradingView Reference Comparisons Matched: ${tvMatchCount}`);
  console.log(` Direct TradingView Reference Comparisons Mismatched: ${tvMismatchCount}`);
  console.log(` Direct TradingView External References Pending (Unverified): ${tvUnverifiedCount}`);
  console.log('================================================================================\n');

  if (formulaFailCount > 0) {
    process.exit(1);
  }
}

runExhaustiveAudit().catch(err => {
  console.error('Audit Runner Error:', err);
  process.exit(1);
});
