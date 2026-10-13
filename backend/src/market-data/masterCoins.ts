export interface MarketCoinItem {
  symbol: string;
  rsi1H: number;
  change24h: number;
  hasWarning?: boolean;
  zone: 'GAINERS' | 'V1' | 'NEUTRAL' | 'HIDDEN_BULL' | 'OVERSOLD' | 'EXTREME';
}

export const MASTER_COINS: MarketCoinItem[] = [
  {
    "symbol": "BTC",
    "rsi1H": 57.7,
    "change24h": 0.35,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ETH",
    "rsi1H": 45.6,
    "change24h": 0.27,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BNB",
    "rsi1H": 51.3,
    "change24h": 0.02,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NEO",
    "rsi1H": 66.9,
    "change24h": 5.67,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LTC",
    "rsi1H": 46.6,
    "change24h": -0.39,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "QTUM",
    "rsi1H": 59.5,
    "change24h": 4.25,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ADA",
    "rsi1H": 36.2,
    "change24h": -2.59,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "XRP",
    "rsi1H": 45.3,
    "change24h": -0.49,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "TUSD",
    "rsi1H": 32.4,
    "change24h": -0.04,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "IOTA",
    "rsi1H": 64.9,
    "change24h": 0.78,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "XLM",
    "rsi1H": 65.1,
    "change24h": 0.41,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ONT",
    "rsi1H": 35.7,
    "change24h": -1.55,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "TRX",
    "rsi1H": 42.1,
    "change24h": -0.24,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ETC",
    "rsi1H": 48.9,
    "change24h": 0.48,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "VET",
    "rsi1H": 65.9,
    "change24h": 2.13,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "USDC",
    "rsi1H": 59.1,
    "change24h": 0.01,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "LINK",
    "rsi1H": 45.1,
    "change24h": -0.35,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ONG",
    "rsi1H": 43.1,
    "change24h": 0.92,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "HOT",
    "rsi1H": 36.1,
    "change24h": -0.71,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ZIL",
    "rsi1H": 42.7,
    "change24h": -0.03,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ZRX",
    "rsi1H": 46.6,
    "change24h": 0.63,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "FET",
    "rsi1H": 63.6,
    "change24h": 1.64,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BAT",
    "rsi1H": 67.8,
    "change24h": 10.3,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ZEC",
    "rsi1H": 54.9,
    "change24h": 0.29,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "IOST",
    "rsi1H": 54.5,
    "change24h": 1.64,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CELR",
    "rsi1H": 42.3,
    "change24h": -0.57,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "DASH",
    "rsi1H": 59.7,
    "change24h": 0.25,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "THETA",
    "rsi1H": 42,
    "change24h": -0.66,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ENJ",
    "rsi1H": 41.1,
    "change24h": -1.94,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ATOM",
    "rsi1H": 67.2,
    "change24h": 4.88,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TFUEL",
    "rsi1H": 55.7,
    "change24h": 1.33,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ONE",
    "rsi1H": 34.2,
    "change24h": -1.35,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ALGO",
    "rsi1H": 64.4,
    "change24h": 3.74,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "DOGE",
    "rsi1H": 42.8,
    "change24h": -0.52,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "DUSK",
    "rsi1H": 71.3,
    "change24h": 7.32,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ANKR",
    "rsi1H": 39.8,
    "change24h": -1.44,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "WIN",
    "rsi1H": 58.5,
    "change24h": 2.42,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MTL",
    "rsi1H": 67.9,
    "change24h": 1.43,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CVC",
    "rsi1H": 46,
    "change24h": 0.12,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "CHZ",
    "rsi1H": 50.1,
    "change24h": -0.45,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BAND",
    "rsi1H": 72,
    "change24h": 6.08,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "XTZ",
    "rsi1H": 63.2,
    "change24h": 2.37,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "RVN",
    "rsi1H": 23,
    "change24h": -10.15,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "HBAR",
    "rsi1H": 48.2,
    "change24h": -0.79,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "STX",
    "rsi1H": 26.9,
    "change24h": -3.83,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "KAVA",
    "rsi1H": 44.8,
    "change24h": -0.81,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ARPA",
    "rsi1H": 48.2,
    "change24h": -0.74,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "IOTX",
    "rsi1H": 36.8,
    "change24h": -0.81,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "RLC",
    "rsi1H": 69.9,
    "change24h": 8.64,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BCH",
    "rsi1H": 51.4,
    "change24h": -0.11,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "FTT",
    "rsi1H": 67.3,
    "change24h": 3.7,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "EUR",
    "rsi1H": 48.5,
    "change24h": 0.03,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "OGN",
    "rsi1H": 28.3,
    "change24h": -4.22,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "LSK",
    "rsi1H": 30,
    "change24h": -4.01,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BNT",
    "rsi1H": 45.2,
    "change24h": -0.06,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MBL",
    "rsi1H": 68.2,
    "change24h": 27.82,
    "hasWarning": true,
    "zone": "GAINERS"
  },
  {
    "symbol": "COTI",
    "rsi1H": 45.6,
    "change24h": 0.38,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SOL",
    "rsi1H": 43.6,
    "change24h": -0.25,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "CTSI",
    "rsi1H": 44.7,
    "change24h": 3.37,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "HIVE",
    "rsi1H": 56.2,
    "change24h": 1.65,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CHR",
    "rsi1H": 42.7,
    "change24h": -1.03,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "KNC",
    "rsi1H": 45.5,
    "change24h": -0.36,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "COMP",
    "rsi1H": 59.8,
    "change24h": 0.56,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SC",
    "rsi1H": 42.8,
    "change24h": 0.61,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ZEN",
    "rsi1H": 62.8,
    "change24h": 0.82,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SNX",
    "rsi1H": 41.5,
    "change24h": -0.17,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "VTHO",
    "rsi1H": 61.6,
    "change24h": 0.28,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "DGB",
    "rsi1H": 35.4,
    "change24h": -3.83,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "DCR",
    "rsi1H": 30.6,
    "change24h": -3.09,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "MANA",
    "rsi1H": 58.8,
    "change24h": 0,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "YFI",
    "rsi1H": 50.1,
    "change24h": 0.5,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "JST",
    "rsi1H": 30.9,
    "change24h": -1.61,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "CRV",
    "rsi1H": 67.2,
    "change24h": 2.12,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SAND",
    "rsi1H": 40,
    "change24h": -3.26,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "NMR",
    "rsi1H": 50.1,
    "change24h": -0.22,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "DOT",
    "rsi1H": 41.5,
    "change24h": -1.28,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "LUNA",
    "rsi1H": 49.6,
    "change24h": -1.05,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "RSR",
    "rsi1H": 60.3,
    "change24h": 1.57,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PAXG",
    "rsi1H": 65.4,
    "change24h": 0.1,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TRB",
    "rsi1H": 54.6,
    "change24h": 0.68,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SUSHI",
    "rsi1H": 52.3,
    "change24h": 0.04,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "KSM",
    "rsi1H": 63.8,
    "change24h": 1.6,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "EGLD",
    "rsi1H": 32.6,
    "change24h": -2.06,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "DIA",
    "rsi1H": 38,
    "change24h": -2.85,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "RUNE",
    "rsi1H": 49,
    "change24h": -0.58,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "UMA",
    "rsi1H": 48.5,
    "change24h": 1.21,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BEL",
    "rsi1H": 65.8,
    "change24h": 3.57,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "UNI",
    "rsi1H": 48.3,
    "change24h": -0.46,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SUN",
    "rsi1H": 35.2,
    "change24h": -0.3,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "AVAX",
    "rsi1H": 67.7,
    "change24h": 0.73,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "XVS",
    "rsi1H": 36.5,
    "change24h": -0.74,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "AAVE",
    "rsi1H": 34.3,
    "change24h": -2.85,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "NEAR",
    "rsi1H": 65.8,
    "change24h": 1.18,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "FIL",
    "rsi1H": 46.9,
    "change24h": -1.38,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "INJ",
    "rsi1H": 64.7,
    "change24h": 5.53,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AUDIO",
    "rsi1H": 45.5,
    "change24h": 0.42,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "CTK",
    "rsi1H": 51,
    "change24h": 0.61,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AXS",
    "rsi1H": 54.8,
    "change24h": -0.48,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "STRAX",
    "rsi1H": 44.3,
    "change24h": 2.3,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ROSE",
    "rsi1H": 75,
    "change24h": 9.48,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AVA",
    "rsi1H": 27,
    "change24h": -3.75,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "SKL",
    "rsi1H": 41.9,
    "change24h": -2.18,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "GRT",
    "rsi1H": 69.7,
    "change24h": 2.37,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "JUV",
    "rsi1H": 31.7,
    "change24h": -2.11,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "PSG",
    "rsi1H": 37,
    "change24h": -1.51,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "1INCH",
    "rsi1H": 42.3,
    "change24h": -0.51,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "OG",
    "rsi1H": 44.9,
    "change24h": 0.21,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ATM",
    "rsi1H": 54.4,
    "change24h": -0.1,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ASR",
    "rsi1H": 50.6,
    "change24h": -0.23,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CELO",
    "rsi1H": 66,
    "change24h": 2.72,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "RIF",
    "rsi1H": 40.3,
    "change24h": 0.24,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "CKB",
    "rsi1H": 89.9,
    "change24h": 38.41,
    "hasWarning": true,
    "zone": "GAINERS"
  },
  {
    "symbol": "TWT",
    "rsi1H": 33.6,
    "change24h": -2.01,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "DODO",
    "rsi1H": 53.2,
    "change24h": 1.51,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CAKE",
    "rsi1H": 61.7,
    "change24h": 1.44,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ACM",
    "rsi1H": 34.6,
    "change24h": -1.05,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ALICE",
    "rsi1H": 50.7,
    "change24h": 0.52,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CFX",
    "rsi1H": 83.7,
    "change24h": 25.12,
    "hasWarning": true,
    "zone": "GAINERS"
  },
  {
    "symbol": "TKO",
    "rsi1H": 38.3,
    "change24h": -0.69,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "PUNDIX",
    "rsi1H": 67.7,
    "change24h": 1.84,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TLM",
    "rsi1H": 37.3,
    "change24h": -1.92,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BAR",
    "rsi1H": 40.7,
    "change24h": -0.35,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SLP",
    "rsi1H": 41.4,
    "change24h": -1.07,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SHIB",
    "rsi1H": 46.6,
    "change24h": -0.55,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ICP",
    "rsi1H": 57.7,
    "change24h": 1.45,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AR",
    "rsi1H": 59.1,
    "change24h": 1.2,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MASK",
    "rsi1H": 67.8,
    "change24h": 2.56,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LPT",
    "rsi1H": 55.2,
    "change24h": -0.11,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "XVG",
    "rsi1H": 41.9,
    "change24h": 0.24,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "GTC",
    "rsi1H": 28.5,
    "change24h": -7.49,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "PHA",
    "rsi1H": 39.5,
    "change24h": -3.45,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "DEXE",
    "rsi1H": 48.9,
    "change24h": 1.02,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "C98",
    "rsi1H": 65.8,
    "change24h": -0.06,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "QNT",
    "rsi1H": 45.8,
    "change24h": -2.71,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "FLOW",
    "rsi1H": 47.5,
    "change24h": 1.98,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MINA",
    "rsi1H": 36.5,
    "change24h": -0.94,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "RAY",
    "rsi1H": 39,
    "change24h": -2.36,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "QUICK",
    "rsi1H": 29.7,
    "change24h": -2.16,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "REQ",
    "rsi1H": 50.6,
    "change24h": 0.37,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "WAXP",
    "rsi1H": 37.5,
    "change24h": -1.2,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "GNO",
    "rsi1H": 35.7,
    "change24h": -1.03,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "XEC",
    "rsi1H": 50.2,
    "change24h": 0.14,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "DYDX",
    "rsi1H": 43.7,
    "change24h": -0.63,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "GALA",
    "rsi1H": 58.6,
    "change24h": 0.5,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ILV",
    "rsi1H": 46.2,
    "change24h": -1.25,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "YGG",
    "rsi1H": 46.5,
    "change24h": 0.36,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "FIDA",
    "rsi1H": 37,
    "change24h": -2.72,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "AGLD",
    "rsi1H": 41.1,
    "change24h": 0.35,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "RAD",
    "rsi1H": 37,
    "change24h": -0.97,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "RARE",
    "rsi1H": 48.8,
    "change24h": 0.56,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "LAZIO",
    "rsi1H": 53.6,
    "change24h": -0.48,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ADX",
    "rsi1H": 36,
    "change24h": -3.51,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "AUCTION",
    "rsi1H": 63.4,
    "change24h": 1.34,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MOVR",
    "rsi1H": 33.2,
    "change24h": -3.56,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "CITY",
    "rsi1H": 36.5,
    "change24h": -1.13,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ENS",
    "rsi1H": 42.1,
    "change24h": -2.68,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "QI",
    "rsi1H": 44.1,
    "change24h": -1.84,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "PORTO",
    "rsi1H": 40,
    "change24h": -1.5,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "POWR",
    "rsi1H": 50.8,
    "change24h": -0.49,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "JASMY",
    "rsi1H": 53.6,
    "change24h": 2.19,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AMP",
    "rsi1H": 44.3,
    "change24h": -0.31,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SANTOS",
    "rsi1H": 37.8,
    "change24h": -2.1,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BICO",
    "rsi1H": 27.1,
    "change24h": -5.02,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "FLUX",
    "rsi1H": 31.7,
    "change24h": -3.54,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "CVX",
    "rsi1H": 52.4,
    "change24h": -0.67,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "PEOPLE",
    "rsi1H": 50.6,
    "change24h": -0.12,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SPELL",
    "rsi1H": 38.8,
    "change24h": -0.42,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "JOE",
    "rsi1H": 40.7,
    "change24h": -2.54,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ACH",
    "rsi1H": 65.3,
    "change24h": 5.44,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "IMX",
    "rsi1H": 41.6,
    "change24h": -1.61,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "GLMR",
    "rsi1H": 40.1,
    "change24h": -0.61,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "API3",
    "rsi1H": 53.3,
    "change24h": -0.78,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BTTC",
    "rsi1H": 72.1,
    "change24h": 2.78,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "XNO",
    "rsi1H": 44.3,
    "change24h": -0.58,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "WOO",
    "rsi1H": 59.2,
    "change24h": 1.93,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ALPINE",
    "rsi1H": 39.9,
    "change24h": -0.82,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "T",
    "rsi1H": 39.1,
    "change24h": 0.93,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ASTR",
    "rsi1H": 51.9,
    "change24h": 0.42,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "GMT",
    "rsi1H": 37.8,
    "change24h": -1.26,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "APE",
    "rsi1H": 53.8,
    "change24h": 3.05,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "STEEM",
    "rsi1H": 47.9,
    "change24h": -0.08,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "NEXO",
    "rsi1H": 43.2,
    "change24h": 0,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "LDO",
    "rsi1H": 49.5,
    "change24h": -1.31,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "OP",
    "rsi1H": 61.7,
    "change24h": 3.61,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LUNC",
    "rsi1H": 55,
    "change24h": 0.29,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "GMX",
    "rsi1H": 32.8,
    "change24h": -2,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "POLYX",
    "rsi1H": 62.9,
    "change24h": 1.47,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "APT",
    "rsi1H": 70.9,
    "change24h": 6.8,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "OSMO",
    "rsi1H": 65.7,
    "change24h": 4.96,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MAGIC",
    "rsi1H": 78.8,
    "change24h": 16.12,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "RPL",
    "rsi1H": 29.7,
    "change24h": -2.53,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "GNS",
    "rsi1H": 38.7,
    "change24h": -2.01,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "SYN",
    "rsi1H": 55,
    "change24h": 2.96,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SSV",
    "rsi1H": 49.8,
    "change24h": 0.87,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "LQTY",
    "rsi1H": 41.9,
    "change24h": -1.12,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "USTC",
    "rsi1H": 42.9,
    "change24h": -1.1,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "GAS",
    "rsi1H": 44.7,
    "change24h": 0.88,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "GLM",
    "rsi1H": 36.4,
    "change24h": -1.41,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "PROM",
    "rsi1H": 44.2,
    "change24h": -0.59,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "QKC",
    "rsi1H": 41.2,
    "change24h": 0.45,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ID",
    "rsi1H": 39.9,
    "change24h": -0.8,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ARB",
    "rsi1H": 66.1,
    "change24h": 6.25,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "WBTC",
    "rsi1H": 56.6,
    "change24h": 0.35,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "EDU",
    "rsi1H": 56.6,
    "change24h": 3.86,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SUI",
    "rsi1H": 42,
    "change24h": -1.22,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "PEPE",
    "rsi1H": 57,
    "change24h": 0,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "FLOKI",
    "rsi1H": 45.8,
    "change24h": -0.69,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MAV",
    "rsi1H": 41.8,
    "change24h": -4.01,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "PENDLE",
    "rsi1H": 45.4,
    "change24h": 1.22,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ARKM",
    "rsi1H": 61.8,
    "change24h": 3.24,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "WBETH",
    "rsi1H": 45.6,
    "change24h": 0.27,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "WLD",
    "rsi1H": 64.1,
    "change24h": 3.01,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "FDUSD",
    "rsi1H": 58.8,
    "change24h": 0.02,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SEI",
    "rsi1H": 53.6,
    "change24h": 0.81,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CYBER",
    "rsi1H": 42.9,
    "change24h": 0.86,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ARK",
    "rsi1H": 26.5,
    "change24h": -4.91,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "IQ",
    "rsi1H": 47.3,
    "change24h": 2.38,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "TIA",
    "rsi1H": 76.1,
    "change24h": 19.12,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MEME",
    "rsi1H": 40.4,
    "change24h": -0.53,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ORDI",
    "rsi1H": 45.9,
    "change24h": 0.23,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BEAMX",
    "rsi1H": 63.8,
    "change24h": 2.56,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BLUR",
    "rsi1H": 56.2,
    "change24h": 2.95,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "JTO",
    "rsi1H": 62,
    "change24h": 3.63,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "1000SATS",
    "rsi1H": 50.6,
    "change24h": 1.09,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BONK",
    "rsi1H": 66.4,
    "change24h": 1.47,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ACE",
    "rsi1H": 33.8,
    "change24h": -1.69,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "AI",
    "rsi1H": 45.8,
    "change24h": 0.95,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "XAI",
    "rsi1H": 44.7,
    "change24h": -1.07,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MANTA",
    "rsi1H": 59.8,
    "change24h": 8.05,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ALT",
    "rsi1H": 43.3,
    "change24h": 0.13,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "PYTH",
    "rsi1H": 33.9,
    "change24h": -2.38,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "RONIN",
    "rsi1H": 60,
    "change24h": 4.43,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "DYM",
    "rsi1H": 60.9,
    "change24h": 3.02,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PIXEL",
    "rsi1H": 28.7,
    "change24h": -7.03,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "STRK",
    "rsi1H": 82.4,
    "change24h": 50.81,
    "hasWarning": true,
    "zone": "GAINERS"
  },
  {
    "symbol": "PORTAL",
    "rsi1H": 45,
    "change24h": -0.9,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "AXL",
    "rsi1H": 66.1,
    "change24h": 3.91,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "WIF",
    "rsi1H": 63.8,
    "change24h": 0.88,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "METIS",
    "rsi1H": 71.5,
    "change24h": 5.39,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AEVO",
    "rsi1H": 48.9,
    "change24h": 0.15,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BOME",
    "rsi1H": 61.4,
    "change24h": 5.98,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ETHFI",
    "rsi1H": 73.8,
    "change24h": 5.77,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ENA",
    "rsi1H": 66.5,
    "change24h": 2.45,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "W",
    "rsi1H": 36.8,
    "change24h": -1.59,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "TNSR",
    "rsi1H": 54.8,
    "change24h": 1.35,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SAGA",
    "rsi1H": 35.9,
    "change24h": -0.86,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "TAO",
    "rsi1H": 68.9,
    "change24h": 1.81,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "REZ",
    "rsi1H": 46.2,
    "change24h": 0.26,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BB",
    "rsi1H": 52,
    "change24h": 3.9,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NOT",
    "rsi1H": 48.6,
    "change24h": 0.64,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "IO",
    "rsi1H": 68.2,
    "change24h": 5.94,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ZK",
    "rsi1H": 74.1,
    "change24h": 12.46,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LISTA",
    "rsi1H": 46.5,
    "change24h": -0.49,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ZRO",
    "rsi1H": 59.7,
    "change24h": 3.9,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "G",
    "rsi1H": 34.9,
    "change24h": -1.39,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BANANA",
    "rsi1H": 45.5,
    "change24h": -0.86,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "RENDER",
    "rsi1H": 50.8,
    "change24h": 0.47,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "DOGS",
    "rsi1H": 40.1,
    "change24h": -0.14,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "EURI",
    "rsi1H": 55.9,
    "change24h": 0.06,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "POL",
    "rsi1H": 51.6,
    "change24h": 0.82,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NEIRO",
    "rsi1H": 37.4,
    "change24h": -1.89,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "TURBO",
    "rsi1H": 35.8,
    "change24h": -0.9,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "1MBABYDOGE",
    "rsi1H": 53.1,
    "change24h": 0.36,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CATI",
    "rsi1H": 54.5,
    "change24h": 0.45,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "HMSTR",
    "rsi1H": 37.2,
    "change24h": -1.16,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "EIGEN",
    "rsi1H": 76.2,
    "change24h": 9.11,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SCR",
    "rsi1H": 44.2,
    "change24h": -1.02,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BNSOL",
    "rsi1H": 44.2,
    "change24h": -0.32,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "LUMIA",
    "rsi1H": 69.4,
    "change24h": 17.94,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "KAIA",
    "rsi1H": 28,
    "change24h": -4.99,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "COW",
    "rsi1H": 49.1,
    "change24h": 0.07,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "CETUS",
    "rsi1H": 41.4,
    "change24h": -0.15,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "PNUT",
    "rsi1H": 49.8,
    "change24h": 0.6,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ACT",
    "rsi1H": 57.2,
    "change24h": 7.75,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "USUAL",
    "rsi1H": 36.3,
    "change24h": -0.72,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "THE",
    "rsi1H": 35.3,
    "change24h": -2.02,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ORCA",
    "rsi1H": 23.5,
    "change24h": -7.22,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "MOVE",
    "rsi1H": 55.3,
    "change24h": 1.96,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ME",
    "rsi1H": 40.3,
    "change24h": -0.92,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "VELODROME",
    "rsi1H": 73.3,
    "change24h": 7.89,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "VANA",
    "rsi1H": 61.8,
    "change24h": 1.6,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "1000CAT",
    "rsi1H": 42.4,
    "change24h": -1.07,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "PENGU",
    "rsi1H": 33.9,
    "change24h": -2.04,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BIO",
    "rsi1H": 68.6,
    "change24h": 3.4,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AIXBT",
    "rsi1H": 46.8,
    "change24h": 0.33,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "CGPT",
    "rsi1H": 38.4,
    "change24h": 0.13,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "COOKIE",
    "rsi1H": 43.1,
    "change24h": 0.68,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "S",
    "rsi1H": 83.8,
    "change24h": 16.05,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SOLV",
    "rsi1H": 58.3,
    "change24h": 2.26,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TRUMP",
    "rsi1H": 45.4,
    "change24h": -0.64,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ANIME",
    "rsi1H": 51,
    "change24h": 0.63,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BERA",
    "rsi1H": 44.6,
    "change24h": 0.91,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "1000CHEEMS",
    "rsi1H": 45.6,
    "change24h": 1.16,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "TST",
    "rsi1H": 38.5,
    "change24h": -1.28,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "LAYER",
    "rsi1H": 41.9,
    "change24h": 1.36,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "HEI",
    "rsi1H": 30.6,
    "change24h": -1.86,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "KAITO",
    "rsi1H": 43.7,
    "change24h": 0.67,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SHELL",
    "rsi1H": 38.4,
    "change24h": -1.12,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "RED",
    "rsi1H": 48.8,
    "change24h": -0.93,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "GPS",
    "rsi1H": 33.2,
    "change24h": -1.14,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "EPIC",
    "rsi1H": 50.2,
    "change24h": 0.89,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BMT",
    "rsi1H": 26.3,
    "change24h": -4.43,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "FORM",
    "rsi1H": 61.4,
    "change24h": 0.83,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "XUSD",
    "rsi1H": 58.8,
    "change24h": 0.02,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NIL",
    "rsi1H": 77.7,
    "change24h": 9.81,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PARTI",
    "rsi1H": 58,
    "change24h": 0.88,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MUBARAK",
    "rsi1H": 38.9,
    "change24h": -4.13,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "TUT",
    "rsi1H": 38.2,
    "change24h": -1.97,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BROCCOLI714",
    "rsi1H": 37.8,
    "change24h": -2.18,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BANANAS31",
    "rsi1H": 50.8,
    "change24h": -0.12,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "GUN",
    "rsi1H": 39,
    "change24h": -1.36,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BABY",
    "rsi1H": 32.7,
    "change24h": -3.78,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ONDO",
    "rsi1H": 46.3,
    "change24h": -1.64,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BIGTIME",
    "rsi1H": 35.4,
    "change24h": -1.75,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "VIRTUAL",
    "rsi1H": 50.8,
    "change24h": 0.3,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "KERNEL",
    "rsi1H": 39.4,
    "change24h": -0.79,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "WCT",
    "rsi1H": 44.2,
    "change24h": -0.97,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "HYPER",
    "rsi1H": 64.6,
    "change24h": 2.84,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "INIT",
    "rsi1H": 56.4,
    "change24h": 0.33,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SIGN",
    "rsi1H": 50.1,
    "change24h": -0.39,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "STO",
    "rsi1H": 39.5,
    "change24h": 0,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "KMNO",
    "rsi1H": 48.6,
    "change24h": 1.59,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SXT",
    "rsi1H": 41.4,
    "change24h": -0.32,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "NXPC",
    "rsi1H": 40.6,
    "change24h": -1,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "AWE",
    "rsi1H": 56.3,
    "change24h": 1.74,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "HAEDAL",
    "rsi1H": 48.1,
    "change24h": 0.46,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "USD1",
    "rsi1H": 43.6,
    "change24h": -0.01,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "HUMA",
    "rsi1H": 61,
    "change24h": 1.21,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "A",
    "rsi1H": 38.6,
    "change24h": -1.16,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "SOPH",
    "rsi1H": 33.8,
    "change24h": -2.47,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "RESOLV",
    "rsi1H": 35.2,
    "change24h": -2.93,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "HOME",
    "rsi1H": 40.1,
    "change24h": -0.87,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SPK",
    "rsi1H": 49.6,
    "change24h": 0.91,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "NEWT",
    "rsi1H": 58.4,
    "change24h": 0.35,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SAHARA",
    "rsi1H": 53.6,
    "change24h": 0.23,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "LA",
    "rsi1H": 49.9,
    "change24h": 2.59,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ERA",
    "rsi1H": 30.4,
    "change24h": -7.24,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "C",
    "rsi1H": 60.9,
    "change24h": 1.71,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TREE",
    "rsi1H": 46,
    "change24h": -1.52,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "TOWNS",
    "rsi1H": 40.8,
    "change24h": -1.24,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "PROVE",
    "rsi1H": 51.6,
    "change24h": 0.65,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BFUSD",
    "rsi1H": 36.8,
    "change24h": -0.03,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "PLUME",
    "rsi1H": 76.3,
    "change24h": 7.3,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "DOLO",
    "rsi1H": 55,
    "change24h": 0.22,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MITO",
    "rsi1H": 46.4,
    "change24h": 0.67,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "WLFI",
    "rsi1H": 52.8,
    "change24h": 0.17,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SOMI",
    "rsi1H": 50.9,
    "change24h": 0.29,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "OPEN",
    "rsi1H": 47.9,
    "change24h": -0.63,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "USDE",
    "rsi1H": 44.2,
    "change24h": 0.01,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "LINEA",
    "rsi1H": 72.4,
    "change24h": 5.58,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "HOLO",
    "rsi1H": 52,
    "change24h": -0.65,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "PUMP",
    "rsi1H": 58.6,
    "change24h": 0.73,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AVNT",
    "rsi1H": 67.3,
    "change24h": 4.13,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ZKC",
    "rsi1H": 45.6,
    "change24h": -0.24,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SKY",
    "rsi1H": 51.9,
    "change24h": 0.16,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BARD",
    "rsi1H": 43.7,
    "change24h": 0.24,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "0G",
    "rsi1H": 50.8,
    "change24h": 1.94,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "HEMI",
    "rsi1H": 61.5,
    "change24h": 0.34,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "XPL",
    "rsi1H": 57.9,
    "change24h": 0.73,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MIRA",
    "rsi1H": 60.4,
    "change24h": 0.3,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "FF",
    "rsi1H": 52.4,
    "change24h": 0.65,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "EDEN",
    "rsi1H": 59.3,
    "change24h": 1.98,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NOM",
    "rsi1H": 50.2,
    "change24h": -0.4,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "2Z",
    "rsi1H": 63.8,
    "change24h": 1.46,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MORPHO",
    "rsi1H": 49.5,
    "change24h": 0.54,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ASTER",
    "rsi1H": 46.3,
    "change24h": 0.4,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "WAL",
    "rsi1H": 50.5,
    "change24h": 4.07,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "EUL",
    "rsi1H": 50.5,
    "change24h": 1.17,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ENSO",
    "rsi1H": 43.2,
    "change24h": 1.16,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "YB",
    "rsi1H": 51.1,
    "change24h": 4.24,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ZBT",
    "rsi1H": 56,
    "change24h": 0.12,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TURTLE",
    "rsi1H": 30.3,
    "change24h": -4.3,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "GIGGLE",
    "rsi1H": 46.5,
    "change24h": -0.83,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "F",
    "rsi1H": 59.9,
    "change24h": 1.18,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "KITE",
    "rsi1H": 34.4,
    "change24h": -2.32,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "MMT",
    "rsi1H": 29,
    "change24h": -4.7,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "SAPIEN",
    "rsi1H": 39.9,
    "change24h": -1.27,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ALLO",
    "rsi1H": 33.9,
    "change24h": -2.03,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BANK",
    "rsi1H": 53.5,
    "change24h": 3.19,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MET",
    "rsi1H": 37.6,
    "change24h": -1.98,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "AT",
    "rsi1H": 57.5,
    "change24h": 0.86,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BREV",
    "rsi1H": 38.7,
    "change24h": -0.8,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "币安人生",
    "rsi1H": 76.9,
    "change24h": 8.23,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ZKP",
    "rsi1H": 47.9,
    "change24h": 0.83,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "U",
    "rsi1H": 50,
    "change24h": -0.02,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "FRAX",
    "rsi1H": 70.2,
    "change24h": 8.57,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "FOGO",
    "rsi1H": 47.2,
    "change24h": 1.49,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "RLUSD",
    "rsi1H": 67.5,
    "change24h": 0.02,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SENT",
    "rsi1H": 69.9,
    "change24h": 13.92,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ZAMA",
    "rsi1H": 38.2,
    "change24h": -0.07,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ESP",
    "rsi1H": 31,
    "change24h": -1.27,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "MANTRA",
    "rsi1H": 60.1,
    "change24h": 1.55,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ROBO",
    "rsi1H": 59.2,
    "change24h": 1.62,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "OPN",
    "rsi1H": 46.3,
    "change24h": -0.64,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "NIGHT",
    "rsi1H": 45.5,
    "change24h": 1.55,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "CFG",
    "rsi1H": 36.9,
    "change24h": -3.11,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "KAT",
    "rsi1H": 42.3,
    "change24h": -0.43,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "XAUT",
    "rsi1H": 64.2,
    "change24h": 0.09,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "USDS",
    "rsi1H": 44.2,
    "change24h": 0.01,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "CHIP",
    "rsi1H": 80,
    "change24h": 25.83,
    "hasWarning": true,
    "zone": "GAINERS"
  },
  {
    "symbol": "MEGA",
    "rsi1H": 62.2,
    "change24h": 4.58,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AIGENSYN",
    "rsi1H": 30.5,
    "change24h": -1.78,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "GENIUS",
    "rsi1H": 49.2,
    "change24h": 0.38,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "OPG",
    "rsi1H": 42.6,
    "change24h": -1.2,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MUB",
    "rsi1H": 51.7,
    "change24h": 0.02,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CRCLB",
    "rsi1H": 52.1,
    "change24h": 0.15,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NVDAB",
    "rsi1H": 67.9,
    "change24h": 0.22,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SNDKB",
    "rsi1H": 55.5,
    "change24h": 0.73,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TSLAB",
    "rsi1H": 62.1,
    "change24h": 0.12,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SPCXB",
    "rsi1H": 67.4,
    "change24h": 0.29,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "RE",
    "rsi1H": 45.2,
    "change24h": 0.11,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "INTCB",
    "rsi1H": 61.2,
    "change24h": 0.27,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MSTRB",
    "rsi1H": 59.2,
    "change24h": 0.3,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "LITEB",
    "rsi1H": 67.8,
    "change24h": 1,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "QQQB",
    "rsi1H": 52.4,
    "change24h": 0.06,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "GRAM",
    "rsi1H": 37.5,
    "change24h": -0.69,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "CBRSB",
    "rsi1H": 66.3,
    "change24h": 0.54,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "COINB",
    "rsi1H": 64.3,
    "change24h": 0.34,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "DRAMB",
    "rsi1H": 56,
    "change24h": 0.33,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "GOOGLB",
    "rsi1H": 47.5,
    "change24h": -0.18,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SOXLB",
    "rsi1H": 47.7,
    "change24h": -0.51,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SPYB",
    "rsi1H": 59.6,
    "change24h": 0.03,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SKHYB",
    "rsi1H": 53,
    "change24h": 0.09,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AAOIB",
    "rsi1H": 65.9,
    "change24h": 1.07,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AVGOB",
    "rsi1H": 62.6,
    "change24h": 0.21,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BABAB",
    "rsi1H": 65,
    "change24h": 0.26,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "HOODB",
    "rsi1H": 63.5,
    "change24h": 0.34,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AERO",
    "rsi1H": 73.7,
    "change24h": 8.11,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AXTIB",
    "rsi1H": 35,
    "change24h": -1.57,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "CRWVB",
    "rsi1H": 55.2,
    "change24h": 0.04,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "KORUB",
    "rsi1H": 44.5,
    "change24h": -0.06,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ORCLB",
    "rsi1H": 55.5,
    "change24h": -0.11,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SNXXB",
    "rsi1H": 57,
    "change24h": 1.3,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TQQQB",
    "rsi1H": 58.8,
    "change24h": 0.31,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AAPLB",
    "rsi1H": 54.2,
    "change24h": -0.01,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SOXSB",
    "rsi1H": 55.7,
    "change24h": 0.7,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ASMLB",
    "rsi1H": 57.6,
    "change24h": 0.1,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ASTSB",
    "rsi1H": 62.4,
    "change24h": 0.55,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BMNRB",
    "rsi1H": 56.9,
    "change24h": 0.62,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MRNAB",
    "rsi1H": 56.6,
    "change24h": -0.02,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SQQQB",
    "rsi1H": 40.2,
    "change24h": -0.39,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MARSCOIN",
    "rsi1H": 38.3,
    "change24h": -0.43,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "牛来",
    "rsi1H": 40.1,
    "change24h": 0.39,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BNCB",
    "rsi1H": 54.4,
    "change24h": 0.56,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AGPUB",
    "rsi1H": 61.8,
    "change24h": 0.42,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "HYPE",
    "rsi1H": 51.7,
    "change24h": 1.38,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SECZB",
    "rsi1H": 59.8,
    "change24h": 1.26,
    "hasWarning": false,
    "zone": "V1"
  }
];
