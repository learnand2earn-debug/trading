import { candleStore } from '../market-data/candleStore.js';
import { coinGlassService } from '../market-data/coinglass.js';
import { evaluatePriceAction } from './priceAction.js';
import { evaluateV1Method } from './v1Method.js';
import { evaluateGainersMethod } from './gainersMethod.js';
import { evaluateHiddenBullish } from './hiddenBullish.js';
import { evaluateV1Ema } from './v1Ema.js';
import { evaluateOBMethod } from './obMethod.js';
import { evaluateICTMethod } from './ictMethod.js';
import { StrategySignalResult } from './types.js';

export class StrategyRegistry {
  async evaluateAllStrategiesForSymbol(symbol: string): Promise<StrategySignalResult[]> {
    const data = candleStore.getOrCreate(symbol);
    const results: StrategySignalResult[] = [];

    // 1. Price Action
    const liquidity = await coinGlassService.getLiquidityData(symbol, data.lastPrice, '24h');
    const leadPA = candleStore.getLeadTimeSeconds(symbol, 'PRICE_ACTION');
    const paResult = evaluatePriceAction(symbol, data.candles1d, data.candles1h, data.candles30m, liquidity, leadPA);
    results.push(paResult);

    // 2. V1 Method
    const leadV1 = candleStore.getLeadTimeSeconds(symbol, 'V1_METHOD');
    const v1Result = evaluateV1Method(symbol, data.candles1d, data.candles1h, data.candles30m, leadV1);
    results.push(v1Result);

    // 3. Gainers Method
    const leadGainers = candleStore.getLeadTimeSeconds(symbol, 'GAINERS_METHOD');
    const pairs = ['USDT', 'USDC', 'FDUSD'];
    const gainersResult = evaluateGainersMethod(
      symbol,
      data.candles1h,
      3, // rank (default demo/eval)
      data.priceChange24h,
      pairs,
      false, // isMonitored: false (monitoring mai na ho)
      false, // isDelisting: false
      false, // isNew: false
      leadGainers
    );
    results.push(gainersResult);

    // 4. Hidden Bullish
    const leadHB = candleStore.getLeadTimeSeconds(symbol, 'HIDDEN_BULLISH');
    const hbResult = evaluateHiddenBullish(symbol, data.candles1h, data.candles30m, leadHB);
    results.push(hbResult);

    // 5. V1 + EMA
    const leadV1Ema = candleStore.getLeadTimeSeconds(symbol, 'V1_EMA');
    const v1EmaResult = evaluateV1Ema(symbol, data.candles1d, data.candles1h, data.candles30m, leadV1Ema);
    results.push(v1EmaResult);

    // 6. OB Method
    const leadOB = candleStore.getLeadTimeSeconds(symbol, 'OB_METHOD');
    const obResult = evaluateOBMethod(symbol, data.candles1h, data.candles15m, leadOB);
    results.push(obResult);

    // 7. ICT Method
    const leadICT = candleStore.getLeadTimeSeconds(symbol, 'ICT_METHOD');
    const ictResult = evaluateICTMethod(symbol, data.candles1h, leadICT);
    results.push(ictResult);

    return results;
  }
}

export const strategyRegistry = new StrategyRegistry();
