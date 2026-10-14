export interface Candle {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  isClosed: boolean;
}

export type TrendDirection = 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';

export interface TrendResult {
  direction: TrendDirection;
  strength: number; // 0 to 100
  higherHighs: boolean;
  higherLows: boolean;
  sma50Slope?: number;
  adx?: number;
}

export interface RSIResult {
  current: number;
  previous: number;
  slope: 'RISING' | 'FALLING' | 'FLAT';
  history: number[];
  // Full numerical precision raw values (unrounded)
  rawCurrent?: number;
  rawPrevious?: number;
  // Authoritative provenance fields
  exchange: 'BINANCE';
  marketType: 'SPOT';
  symbol?: string;
  timeframe?: string;
  candleStatus: 'OPEN' | 'CLOSED' | 'UNAVAILABLE';
  period: number;
  source: 'close';
  method: 'WILDER_RMA';
  candleOpenTime?: number;
  candleCloseTime?: number;
  lastUpdated: number;
  closedCandleRsi?: number;
  liveCandleRsi?: number;
  isInsufficientData?: boolean;
}

export interface EMAResult {
  ema9: number;
  ema33: number;
  isBullishCross: boolean; // 9 crossing 33 below -> above
  isAboveBoth: boolean;
  retestDetected: boolean;
  retestType?: 'CROSS_RETEST' | 'WICK_TOUCH_ABOVE';
}

export type V1ColorState = 'GREEN' | 'TRANSPARENT' | 'RED';

export interface V1Result {
  state: V1ColorState;
  haOpen: number;
  haHigh: number;
  haLow: number;
  haClose: number;
  smoothedOpen: number;
  smoothedClose: number;
}

export interface SupportResistanceLevel {
  id: string;
  type: 'SUPPORT' | 'RESISTANCE';
  price: number;
  zoneLow: number;
  zoneHigh: number;
  touches: number;
  timestamp: number;
  status: 'VALID' | 'BROKEN' | 'UNTESTED';
  isManual?: boolean;
}

export interface OrderBlockZone {
  id: string;
  type: 'BULLISH' | 'BEARISH';
  high: number;
  low: number;
  sourceCandleTime: number;
  pumpGreenCandles: number;
  formationTime: number;
  status: 'UNTESTED' | 'TESTED' | 'BROKEN';
  retestCount: number;
}

export interface ICTPatternResult {
  rsiValid: boolean; // 30-40
  prevIsRed: boolean;
  currIsGreen: boolean;
  greenCandleCount: number; // 2 or 3
  pumpPct: number;
  trendlinePassed: boolean;
  trend1HValid: boolean; // UP or DOWN, NOT sideways
}

export interface DivergencePivot {
  index: number;
  timestamp: number;
  price: number;
  rsi: number;
  isConfirmed: boolean;
}

export interface HiddenBullishDivergenceResult {
  detected: boolean;
  pivot1?: DivergencePivot; // Earlier swing low
  pivot2?: DivergencePivot; // Recent swing low (Higher Low in Price, Lower Low in RSI)
  priceLow1?: number;
  priceLow2?: number;
  rsiLow1?: number;
  rsiLow2?: number;
  isConfirmed: boolean;
  confirmationDelayBars: number;
  reason: string;
  sourceStructureMatched: boolean;
  downwardPct: number;
  reactionPct: number;
}
