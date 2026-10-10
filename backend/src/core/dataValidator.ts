import { Candle } from '../indicators/types.js';

export type ValidationStatus = 'PASS' | 'FAIL' | 'NOT_EVALUATED' | 'DATA_STALE' | 'ERROR';

export interface ValidationCheckResult {
  status: ValidationStatus;
  errors: string[];
  warnings: string[];
  dataAgeSeconds: number;
}

export class DataValidationAgent {
  private maxStalenessSeconds = 60;

  setMaxStaleness(seconds: number) {
    this.maxStalenessSeconds = seconds;
  }

  validateCandleSeries(candles: Candle[], timeframe: string): ValidationCheckResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const now = Date.now();

    if (!candles || candles.length === 0) {
      return {
        status: 'FAIL',
        errors: ['Candle series is empty'],
        warnings: [],
        dataAgeSeconds: 9999
      };
    }

    const lastCandle = candles[candles.length - 1];
    const dataAgeSeconds = Math.max(0, Math.floor((now - lastCandle.closeTime) / 1000));

    // 1. Check OHLC validity for each candle
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      if (isNaN(c.open) || isNaN(c.high) || isNaN(c.low) || isNaN(c.close) || isNaN(c.volume)) {
        errors.push(`Candle at idx ${i} has NaN or corrupted numerical values`);
        break;
      }
      if (c.high < c.low) {
        errors.push(`Candle at idx ${i} has invalid range (high ${c.high} < low ${c.low})`);
      }
      if (c.open > c.high || c.open < c.low) {
        errors.push(`Candle at idx ${i} open price outside [low, high]`);
      }
      if (c.close > c.high || c.close < c.low) {
        errors.push(`Candle at idx ${i} close price outside [low, high]`);
      }
      if (c.openTime > now + 60000) {
        errors.push(`Candle at idx ${i} has future timestamp (${c.openTime} > ${now})`);
      }
      if (i > 0) {
        const prev = candles[i - 1];
        if (c.openTime <= prev.openTime) {
          errors.push(`Candle series out of order or duplicate at idx ${i} (openTime ${c.openTime} <= ${prev.openTime})`);
        }
      }
    }

    // 2. Staleness check
    // If timeframe is 1h, candles close hourly. If closeTime is older than expected interval + buffer
    const timeframeMultiplier = timeframe === '15m' ? 900 : timeframe === '30m' ? 1800 : timeframe === '1h' ? 3600 : 86400;
    const allowedAge = timeframeMultiplier + this.maxStalenessSeconds;

    if (dataAgeSeconds > allowedAge) {
      warnings.push(`Data is aging or stale (age: ${dataAgeSeconds}s > allowed: ${allowedAge}s)`);
      if (dataAgeSeconds > allowedAge * 2) {
        return {
          status: 'DATA_STALE',
          errors,
          warnings,
          dataAgeSeconds
        };
      }
    }

    if (errors.length > 0) {
      return {
        status: 'FAIL',
        errors,
        warnings,
        dataAgeSeconds
      };
    }

    return {
      status: 'PASS',
      errors: [],
      warnings,
      dataAgeSeconds
    };
  }

  validateCoinGlassLiquidity(freshnessStatus: string, dataAgeSeconds: number): ValidationCheckResult {
    if (freshnessStatus === 'DATA_UNAVAILABLE') {
      return {
        status: 'FAIL',
        errors: ['CoinGlass liquidity data unavailable'],
        warnings: [],
        dataAgeSeconds
      };
    }
    if (freshnessStatus === 'DATA_STALE' || dataAgeSeconds > 300) {
      return {
        status: 'DATA_STALE',
        errors: ['CoinGlass liquidity heatmap is stale'],
        warnings: [`Age: ${dataAgeSeconds}s`],
        dataAgeSeconds
      };
    }
    return {
      status: 'PASS',
      errors: [],
      warnings: [],
      dataAgeSeconds
    };
  }
}

export const dataValidationAgent = new DataValidationAgent();
