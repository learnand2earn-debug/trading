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
    "rsi1H": 64.9,
    "change24h": 0.48,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ETH",
    "rsi1H": 61.6,
    "change24h": 0.85,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BNB",
    "rsi1H": 60.9,
    "change24h": 1.17,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "NEO",
    "rsi1H": 68.5,
    "change24h": 7.98,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LTC",
    "rsi1H": 59.9,
    "change24h": 0.66,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "QTUM",
    "rsi1H": 68.7,
    "change24h": 6.68,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ADA",
    "rsi1H": 69.5,
    "change24h": 6.46,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "XRP",
    "rsi1H": 60,
    "change24h": 1.12,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "EOS",
    "rsi1H": 44.6,
    "change24h": -0.66,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "TUSD",
    "rsi1H": 55.9,
    "change24h": 0.05,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "IOTA",
    "rsi1H": 53.3,
    "change24h": 1.98,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "XLM",
    "rsi1H": 65.7,
    "change24h": 2.12,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ONT",
    "rsi1H": 58.4,
    "change24h": 2.46,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TRX",
    "rsi1H": 34.7,
    "change24h": -0.45,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ETC",
    "rsi1H": 52.6,
    "change24h": 1.21,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ICX",
    "rsi1H": 25.4,
    "change24h": -14.96,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "NULS",
    "rsi1H": 38.9,
    "change24h": -7.19,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "VET",
    "rsi1H": 49,
    "change24h": 0.24,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "USDC",
    "rsi1H": 62.1,
    "change24h": 0.01,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LINK",
    "rsi1H": 61.6,
    "change24h": 2.13,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "WAVES",
    "rsi1H": 82.5,
    "change24h": 11.97,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ONG",
    "rsi1H": 61.2,
    "change24h": 1.06,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "HOT",
    "rsi1H": 55.1,
    "change24h": 3.67,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ZIL",
    "rsi1H": 63.3,
    "change24h": 2.24,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ZRX",
    "rsi1H": 66.9,
    "change24h": 7.58,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "FET",
    "rsi1H": 63.6,
    "change24h": 4.11,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BAT",
    "rsi1H": 36.7,
    "change24h": -0.97,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "XMR",
    "rsi1H": 71.8,
    "change24h": 4.77,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ZEC",
    "rsi1H": 57.1,
    "change24h": 0.6,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "IOST",
    "rsi1H": 67.9,
    "change24h": 4.1,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CELR",
    "rsi1H": 68.2,
    "change24h": 4.71,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "DASH",
    "rsi1H": 40.9,
    "change24h": -1.29,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "OMG",
    "rsi1H": 58,
    "change24h": -0.78,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "THETA",
    "rsi1H": 59.2,
    "change24h": 4.11,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ENJ",
    "rsi1H": 45.2,
    "change24h": 0,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MITH",
    "rsi1H": 42.8,
    "change24h": -5.22,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MATIC",
    "rsi1H": 53.9,
    "change24h": -0.29,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ATOM",
    "rsi1H": 36.2,
    "change24h": -2.45,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "TFUEL",
    "rsi1H": 64.2,
    "change24h": 1.43,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ONE",
    "rsi1H": 35.1,
    "change24h": -2.78,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "FTM",
    "rsi1H": 46.8,
    "change24h": -0.77,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ALGO",
    "rsi1H": 71.1,
    "change24h": 4.54,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "GTO",
    "rsi1H": 22.8,
    "change24h": -8.05,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "DOGE",
    "rsi1H": 61.2,
    "change24h": 1.41,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "DUSK",
    "rsi1H": 75.7,
    "change24h": 8.11,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ANKR",
    "rsi1H": 60.7,
    "change24h": 2.74,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "WIN",
    "rsi1H": 41.9,
    "change24h": 0.93,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "COS",
    "rsi1H": 55.9,
    "change24h": 4.58,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "COCOS",
    "rsi1H": 66.3,
    "change24h": 3.44,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MTL",
    "rsi1H": 55.6,
    "change24h": 0.44,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TOMO",
    "rsi1H": 69.2,
    "change24h": 3.22,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PERL",
    "rsi1H": 12.4,
    "change24h": -20.55,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "DENT",
    "rsi1H": 30.1,
    "change24h": -9.52,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "MFT",
    "rsi1H": 49.1,
    "change24h": -0.85,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "KEY",
    "rsi1H": 48.4,
    "change24h": -3.02,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "DOCK",
    "rsi1H": 31.2,
    "change24h": -6.47,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "WAN",
    "rsi1H": 31.4,
    "change24h": -2.51,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "FUN",
    "rsi1H": 34,
    "change24h": -10.94,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "CVC",
    "rsi1H": 54,
    "change24h": 2.33,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CHZ",
    "rsi1H": 56.9,
    "change24h": 1.84,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BAND",
    "rsi1H": 64.6,
    "change24h": 3.41,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BUSD",
    "rsi1H": 35.6,
    "change24h": -0.03,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BEAM",
    "rsi1H": 52.7,
    "change24h": 3.17,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "XTZ",
    "rsi1H": 63.5,
    "change24h": 1.39,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "REN",
    "rsi1H": 74.5,
    "change24h": 8.48,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "RVN",
    "rsi1H": 30.4,
    "change24h": -2.1,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "HBAR",
    "rsi1H": 60.1,
    "change24h": 1.71,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "NKN",
    "rsi1H": 61.6,
    "change24h": 2.82,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "STX",
    "rsi1H": 57.7,
    "change24h": 3.53,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "KAVA",
    "rsi1H": 61.8,
    "change24h": 0.16,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ARPA",
    "rsi1H": 58.4,
    "change24h": 8.62,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "IOTX",
    "rsi1H": 63.3,
    "change24h": 2.75,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "RLC",
    "rsi1H": 69.8,
    "change24h": 16.74,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CTXC",
    "rsi1H": 52,
    "change24h": -0.47,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BCH",
    "rsi1H": 64.2,
    "change24h": 1.63,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TROY",
    "rsi1H": 16,
    "change24h": -23.33,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "VITE",
    "rsi1H": 15.2,
    "change24h": -24.56,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "FTT",
    "rsi1H": 47.4,
    "change24h": 0.72,
    "hasWarning": false,
    "zone": "NEUTRAL"
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
    "rsi1H": 22,
    "change24h": -8.85,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "DREP",
    "rsi1H": 14.1,
    "change24h": -18.21,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "TCT",
    "rsi1H": 24.1,
    "change24h": -6.59,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "WRX",
    "rsi1H": 50.6,
    "change24h": -4.95,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BTS",
    "rsi1H": 61,
    "change24h": 0.75,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LSK",
    "rsi1H": 67.4,
    "change24h": 2.49,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BNT",
    "rsi1H": 63.5,
    "change24h": 0.93,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LTO",
    "rsi1H": 65.6,
    "change24h": 2.7,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AION",
    "rsi1H": 22.9,
    "change24h": -10.19,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "MBL",
    "rsi1H": 78.1,
    "change24h": 49.4,
    "hasWarning": true,
    "zone": "GAINERS"
  },
  {
    "symbol": "COTI",
    "rsi1H": 56.7,
    "change24h": 1.24,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "STPT",
    "rsi1H": 47.8,
    "change24h": 2.21,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "WTC",
    "rsi1H": 12,
    "change24h": -56.54,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "DATA",
    "rsi1H": 13.4,
    "change24h": -31.25,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "SOL",
    "rsi1H": 54.8,
    "change24h": 0.02,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CTSI",
    "rsi1H": 68.4,
    "change24h": 6.35,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "HIVE",
    "rsi1H": 55.3,
    "change24h": 1.09,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CHR",
    "rsi1H": 48.4,
    "change24h": 0.99,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ARDR",
    "rsi1H": 48.3,
    "change24h": -0.52,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MDT",
    "rsi1H": 35.5,
    "change24h": -4.5,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "STMX",
    "rsi1H": 46.5,
    "change24h": -2,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "KNC",
    "rsi1H": 55.7,
    "change24h": 1.25,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "REP",
    "rsi1H": 51.5,
    "change24h": -0.84,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "LRC",
    "rsi1H": 35.8,
    "change24h": -4.23,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "PNT",
    "rsi1H": 92,
    "change24h": 45.23,
    "hasWarning": true,
    "zone": "GAINERS"
  },
  {
    "symbol": "COMP",
    "rsi1H": 65.5,
    "change24h": 3.11,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SC",
    "rsi1H": 66.8,
    "change24h": 5.96,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ZEN",
    "rsi1H": 63.9,
    "change24h": 1.83,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SNX",
    "rsi1H": 63.8,
    "change24h": 3.61,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "VTHO",
    "rsi1H": 63.3,
    "change24h": 6.23,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "DGB",
    "rsi1H": 61.7,
    "change24h": 0,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "GBP",
    "rsi1H": 45.2,
    "change24h": -0.59,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SXP",
    "rsi1H": 13.3,
    "change24h": -38.89,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "MKR",
    "rsi1H": 57.2,
    "change24h": 0.76,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "DCR",
    "rsi1H": 49.1,
    "change24h": -1.14,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "STORJ",
    "rsi1H": 27.4,
    "change24h": -7.17,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "MANA",
    "rsi1H": 59.2,
    "change24h": 3.24,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AUD",
    "rsi1H": 26.9,
    "change24h": -5.75,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "YFI",
    "rsi1H": 67.5,
    "change24h": 3.55,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BAL",
    "rsi1H": 45.9,
    "change24h": -3.69,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BLZ",
    "rsi1H": 45.6,
    "change24h": 0.17,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "IRIS",
    "rsi1H": 28.2,
    "change24h": -6.46,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "KMD",
    "rsi1H": 43.9,
    "change24h": 1.88,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "JST",
    "rsi1H": 41.8,
    "change24h": -2.75,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SRM",
    "rsi1H": 31.6,
    "change24h": -5.46,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ANT",
    "rsi1H": 52,
    "change24h": -0.38,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CRV",
    "rsi1H": 50.9,
    "change24h": 0.64,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SAND",
    "rsi1H": 41.3,
    "change24h": 0.13,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "OCEAN",
    "rsi1H": 36.5,
    "change24h": -1.19,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "NMR",
    "rsi1H": 44.4,
    "change24h": -2.29,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "DOT",
    "rsi1H": 60.4,
    "change24h": 3.97,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LUNA",
    "rsi1H": 54.3,
    "change24h": 1.07,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "RSR",
    "rsi1H": 66.6,
    "change24h": 2.42,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PAXG",
    "rsi1H": 41.9,
    "change24h": -0.19,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "WNXM",
    "rsi1H": 57.2,
    "change24h": 3.2,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TRB",
    "rsi1H": 62,
    "change24h": 1.63,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SUSHI",
    "rsi1H": 69.6,
    "change24h": 3.38,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "YFII",
    "rsi1H": 60,
    "change24h": 2.3,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "KSM",
    "rsi1H": 57.2,
    "change24h": 1.81,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "EGLD",
    "rsi1H": 58.7,
    "change24h": 0.5,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "DIA",
    "rsi1H": 37.6,
    "change24h": 0.79,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "RUNE",
    "rsi1H": 54.7,
    "change24h": 1.31,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "FIO",
    "rsi1H": 40.1,
    "change24h": -4.08,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "UMA",
    "rsi1H": 37.8,
    "change24h": -0.72,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BEL",
    "rsi1H": 50.2,
    "change24h": 4.63,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "WING",
    "rsi1H": 17.1,
    "change24h": -23.29,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "UNI",
    "rsi1H": 61.4,
    "change24h": 3.15,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "NBS",
    "rsi1H": 26.6,
    "change24h": -8.79,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "OXT",
    "rsi1H": 27.7,
    "change24h": -5.05,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "SUN",
    "rsi1H": 45.2,
    "change24h": 0.12,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "AVAX",
    "rsi1H": 59.3,
    "change24h": 2.48,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "HNT",
    "rsi1H": 63.4,
    "change24h": 1.74,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "FLM",
    "rsi1H": 78.3,
    "change24h": 8.44,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ORN",
    "rsi1H": 63.8,
    "change24h": 1.64,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "UTK",
    "rsi1H": 43.6,
    "change24h": -5.02,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "XVS",
    "rsi1H": 53,
    "change24h": 1.1,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ALPHA",
    "rsi1H": 43.5,
    "change24h": -3,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "AAVE",
    "rsi1H": 50.5,
    "change24h": 1.52,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NEAR",
    "rsi1H": 81.2,
    "change24h": 13.34,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "FIL",
    "rsi1H": 49.3,
    "change24h": 2.79,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "INJ",
    "rsi1H": 77.9,
    "change24h": 9.31,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AUDIO",
    "rsi1H": 41.9,
    "change24h": -0.48,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "CTK",
    "rsi1H": 44.4,
    "change24h": 2.27,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "AKRO",
    "rsi1H": 29.6,
    "change24h": -10.57,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "AXS",
    "rsi1H": 73.1,
    "change24h": 7.06,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "HARD",
    "rsi1H": 12,
    "change24h": -40.25,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "DNT",
    "rsi1H": 27.8,
    "change24h": -6,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "STRAX",
    "rsi1H": 35.2,
    "change24h": 0.38,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "UNFI",
    "rsi1H": 40.8,
    "change24h": -0.07,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ROSE",
    "rsi1H": 63.7,
    "change24h": 0.96,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AVA",
    "rsi1H": 34.5,
    "change24h": -0.59,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "XEM",
    "rsi1H": 64.6,
    "change24h": 3.17,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SKL",
    "rsi1H": 35.4,
    "change24h": -3.67,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "GRT",
    "rsi1H": 53.6,
    "change24h": 0.67,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "JUV",
    "rsi1H": 57.9,
    "change24h": 1.22,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "PSG",
    "rsi1H": 64.6,
    "change24h": 0.87,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "1INCH",
    "rsi1H": 57.4,
    "change24h": 0.93,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "REEF",
    "rsi1H": 62.8,
    "change24h": 2.69,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "OG",
    "rsi1H": 60.8,
    "change24h": 1.49,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ATM",
    "rsi1H": 54.4,
    "change24h": 0.68,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ASR",
    "rsi1H": 66.7,
    "change24h": 0.34,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CELO",
    "rsi1H": 42.2,
    "change24h": -1.02,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "RIF",
    "rsi1H": 58.1,
    "change24h": 3.04,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BTCST",
    "rsi1H": 36.1,
    "change24h": -5.14,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "TRU",
    "rsi1H": 19.4,
    "change24h": -14.81,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "CKB",
    "rsi1H": 73.2,
    "change24h": 11.53,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TWT",
    "rsi1H": 60.6,
    "change24h": 1.06,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "FIRO",
    "rsi1H": 14.4,
    "change24h": -25,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "LIT",
    "rsi1H": 71.7,
    "change24h": 5.24,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SFP",
    "rsi1H": 62.3,
    "change24h": 3.35,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "DODO",
    "rsi1H": 74.4,
    "change24h": 4.25,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CAKE",
    "rsi1H": 54.8,
    "change24h": 0.68,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ACM",
    "rsi1H": 59.3,
    "change24h": 1.41,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BADGER",
    "rsi1H": 29.3,
    "change24h": -7.41,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "FIS",
    "rsi1H": 40.5,
    "change24h": -2.55,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "OM",
    "rsi1H": 29.2,
    "change24h": -5.11,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "POND",
    "rsi1H": 18.6,
    "change24h": -18.18,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "DEGO",
    "rsi1H": 14,
    "change24h": -36.36,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "ALICE",
    "rsi1H": 33.5,
    "change24h": -1.27,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "LINA",
    "rsi1H": 63.2,
    "change24h": 4.33,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PERP",
    "rsi1H": 65.6,
    "change24h": 4.69,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CFX",
    "rsi1H": 86.3,
    "change24h": 25.89,
    "hasWarning": true,
    "zone": "GAINERS"
  },
  {
    "symbol": "AUTO",
    "rsi1H": 21.7,
    "change24h": -7.48,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "TKO",
    "rsi1H": 57,
    "change24h": 1.96,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "PUNDIX",
    "rsi1H": 69.3,
    "change24h": 2.85,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TLM",
    "rsi1H": 54.9,
    "change24h": 2.96,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BTG",
    "rsi1H": 30.9,
    "change24h": -1.83,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "MIR",
    "rsi1H": 22.5,
    "change24h": -7.39,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "BAR",
    "rsi1H": 56.4,
    "change24h": 0.35,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "FORTH",
    "rsi1H": 16.9,
    "change24h": -19.93,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "BAKE",
    "rsi1H": 51.4,
    "change24h": 2.17,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BURGER",
    "rsi1H": 12,
    "change24h": -28.63,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "SLP",
    "rsi1H": 61.7,
    "change24h": 4.09,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SHIB",
    "rsi1H": 56.5,
    "change24h": 0.92,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ICP",
    "rsi1H": 67.8,
    "change24h": 4.04,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AR",
    "rsi1H": 52.8,
    "change24h": 1.29,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "POLS",
    "rsi1H": 36.1,
    "change24h": -2.16,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "MDX",
    "rsi1H": 70.9,
    "change24h": 13.52,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MASK",
    "rsi1H": 62.4,
    "change24h": 3.49,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LPT",
    "rsi1H": 40.9,
    "change24h": 1.5,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "XVG",
    "rsi1H": 69.9,
    "change24h": 5.41,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ATA",
    "rsi1H": 12,
    "change24h": -42.86,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "GTC",
    "rsi1H": 39,
    "change24h": 0.41,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "TORN",
    "rsi1H": 30.7,
    "change24h": -4.02,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ERN",
    "rsi1H": 70.6,
    "change24h": 5.66,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "KLAY",
    "rsi1H": 59.4,
    "change24h": 0.96,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "PHA",
    "rsi1H": 54.9,
    "change24h": 3.97,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BOND",
    "rsi1H": 70.4,
    "change24h": 4.42,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MLN",
    "rsi1H": 39.2,
    "change24h": -2.86,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "DEXE",
    "rsi1H": 59.3,
    "change24h": 1.63,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "C98",
    "rsi1H": 68.7,
    "change24h": 12.55,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CLV",
    "rsi1H": 80.8,
    "change24h": 13.97,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "QNT",
    "rsi1H": 36.6,
    "change24h": -1.19,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "FLOW",
    "rsi1H": 66.6,
    "change24h": 5.4,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TVK",
    "rsi1H": 59.9,
    "change24h": 0.04,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MINA",
    "rsi1H": 58.5,
    "change24h": 8,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "RAY",
    "rsi1H": 48,
    "change24h": -0.09,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "FARM",
    "rsi1H": 23.3,
    "change24h": -11.72,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "ALPACA",
    "rsi1H": 32.8,
    "change24h": -5.4,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "QUICK",
    "rsi1H": 38.7,
    "change24h": -0.83,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "MBOX",
    "rsi1H": 28.7,
    "change24h": -16,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "FOR",
    "rsi1H": 15.2,
    "change24h": -16.85,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "REQ",
    "rsi1H": 54,
    "change24h": 0.55,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "GHST",
    "rsi1H": 48.4,
    "change24h": 0,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "WAXP",
    "rsi1H": 57.3,
    "change24h": 1.21,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TRIBE",
    "rsi1H": 46.7,
    "change24h": -0.25,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "GNO",
    "rsi1H": 49.5,
    "change24h": 0.12,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "XEC",
    "rsi1H": 66.4,
    "change24h": 1.8,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ELF",
    "rsi1H": 70.3,
    "change24h": 8.81,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "DYDX",
    "rsi1H": 40.6,
    "change24h": -0.05,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "POLY",
    "rsi1H": 55.6,
    "change24h": 0.52,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "IDEX",
    "rsi1H": 14.3,
    "change24h": -13.85,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "VIDT",
    "rsi1H": 18.8,
    "change24h": -19.01,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "USDP",
    "rsi1H": 66.8,
    "change24h": 0.32,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "GALA",
    "rsi1H": 71,
    "change24h": 8.95,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ILV",
    "rsi1H": 53.8,
    "change24h": 2.3,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "YGG",
    "rsi1H": 53.9,
    "change24h": 3.99,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SYS",
    "rsi1H": 16.7,
    "change24h": -20.07,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "DF",
    "rsi1H": 26.6,
    "change24h": -17.59,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "FIDA",
    "rsi1H": 52.4,
    "change24h": 2.62,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "FRONT",
    "rsi1H": 63.9,
    "change24h": 1.97,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CVP",
    "rsi1H": 12,
    "change24h": -23.3,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "AGLD",
    "rsi1H": 59.2,
    "change24h": 3.25,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "RAD",
    "rsi1H": 38.2,
    "change24h": -1.55,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BETA",
    "rsi1H": 12,
    "change24h": -64,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "RARE",
    "rsi1H": 39.2,
    "change24h": -2.86,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "LAZIO",
    "rsi1H": 40.6,
    "change24h": -0.95,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "CHESS",
    "rsi1H": 19.1,
    "change24h": -16.86,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "ADX",
    "rsi1H": 53,
    "change24h": -0.14,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AUCTION",
    "rsi1H": 45.9,
    "change24h": -0.63,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "DAR",
    "rsi1H": 63.2,
    "change24h": 2.02,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BNX",
    "rsi1H": 55.6,
    "change24h": 2.81,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MOVR",
    "rsi1H": 34.2,
    "change24h": -5.52,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "CITY",
    "rsi1H": 62.9,
    "change24h": 1.43,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ENS",
    "rsi1H": 62.2,
    "change24h": 1.92,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "KP3R",
    "rsi1H": 41.3,
    "change24h": -3.91,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "QI",
    "rsi1H": 30.4,
    "change24h": -3.04,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "PORTO",
    "rsi1H": 65,
    "change24h": 1.52,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "POWR",
    "rsi1H": 38.4,
    "change24h": -2.41,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "VGX",
    "rsi1H": 59.7,
    "change24h": 1.7,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "JASMY",
    "rsi1H": 62,
    "change24h": 3.46,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AMP",
    "rsi1H": 35.3,
    "change24h": -1.54,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "PLA",
    "rsi1H": 69.1,
    "change24h": 5.53,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PYR",
    "rsi1H": 12,
    "change24h": -57.14,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "RNDR",
    "rsi1H": 61.7,
    "change24h": 2.58,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ALCX",
    "rsi1H": 30.3,
    "change24h": -5.45,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "SANTOS",
    "rsi1H": 54.8,
    "change24h": 1.75,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MC",
    "rsi1H": 50.8,
    "change24h": 2.14,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BICO",
    "rsi1H": 43,
    "change24h": 0.31,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "FLUX",
    "rsi1H": 48.7,
    "change24h": 1.45,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "FXS",
    "rsi1H": 25.5,
    "change24h": -4.81,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "VOXEL",
    "rsi1H": 47.4,
    "change24h": -3.45,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "HIGH",
    "rsi1H": 20.2,
    "change24h": -12.82,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "CVX",
    "rsi1H": 58.8,
    "change24h": 1.79,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "PEOPLE",
    "rsi1H": 62.4,
    "change24h": 2.63,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "OOKI",
    "rsi1H": 12,
    "change24h": -24.68,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "SPELL",
    "rsi1H": 58.2,
    "change24h": 0.96,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "JOE",
    "rsi1H": 43.2,
    "change24h": 0.52,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ACH",
    "rsi1H": 69,
    "change24h": 5.99,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "IMX",
    "rsi1H": 72.9,
    "change24h": 9.72,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "GLMR",
    "rsi1H": 35.7,
    "change24h": -1.23,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "LOKA",
    "rsi1H": 58.2,
    "change24h": 3.86,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SCRT",
    "rsi1H": 12,
    "change24h": -22.83,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "API3",
    "rsi1H": 30.5,
    "change24h": -3.82,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BTTC",
    "rsi1H": 67.5,
    "change24h": 0,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ACA",
    "rsi1H": 12,
    "change24h": -51.35,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "ANC",
    "rsi1H": 24.8,
    "change24h": -7.73,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "XNO",
    "rsi1H": 46.5,
    "change24h": 0,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "WOO",
    "rsi1H": 67.1,
    "change24h": 4.88,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ALPINE",
    "rsi1H": 40,
    "change24h": -1.08,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "T",
    "rsi1H": 68.4,
    "change24h": 3.03,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ASTR",
    "rsi1H": 63.7,
    "change24h": 2.33,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "NBT",
    "rsi1H": 46.1,
    "change24h": -4.54,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "GMT",
    "rsi1H": 43.3,
    "change24h": 2.68,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "KDA",
    "rsi1H": 70.7,
    "change24h": 17.65,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "APE",
    "rsi1H": 65.1,
    "change24h": 4.8,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BSW",
    "rsi1H": 40.3,
    "change24h": -8.94,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BIFI",
    "rsi1H": 15.3,
    "change24h": -13.24,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "MULTI",
    "rsi1H": 24.4,
    "change24h": -11.18,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "STEEM",
    "rsi1H": 62.7,
    "change24h": 0.34,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MOB",
    "rsi1H": 27.5,
    "change24h": -6.03,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "NEXO",
    "rsi1H": 53.2,
    "change24h": 0.24,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "REI",
    "rsi1H": 51.3,
    "change24h": 0.75,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "GAL",
    "rsi1H": 51.5,
    "change24h": 1.48,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "LDO",
    "rsi1H": 63.9,
    "change24h": 3.5,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "EPX",
    "rsi1H": 16.6,
    "change24h": -24.51,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "OP",
    "rsi1H": 70.7,
    "change24h": 11.21,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LEVER",
    "rsi1H": 20.4,
    "change24h": -17.06,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "STG",
    "rsi1H": 77.1,
    "change24h": 11.04,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LUNC",
    "rsi1H": 49.7,
    "change24h": 0.53,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "GMX",
    "rsi1H": 52.5,
    "change24h": 1.53,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NEBL",
    "rsi1H": 16.3,
    "change24h": -13.63,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "POLYX",
    "rsi1H": 68.7,
    "change24h": 3.52,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "APT",
    "rsi1H": 75.1,
    "change24h": 6.34,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "OSMO",
    "rsi1H": 35.5,
    "change24h": -1.72,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "HFT",
    "rsi1H": 52.2,
    "change24h": 6.28,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "PHB",
    "rsi1H": 12,
    "change24h": -54.55,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "HOOK",
    "rsi1H": 53.2,
    "change24h": 9.86,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MAGIC",
    "rsi1H": 22.6,
    "change24h": -8.49,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "HIFI",
    "rsi1H": 60,
    "change24h": 6.19,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "RPL",
    "rsi1H": 60.9,
    "change24h": 4.32,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PROS",
    "rsi1H": 13.6,
    "change24h": -25.9,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "AGIX",
    "rsi1H": 37.8,
    "change24h": -0.37,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "GNS",
    "rsi1H": 60.9,
    "change24h": 4.7,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SYN",
    "rsi1H": 63.8,
    "change24h": 2.08,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "VIB",
    "rsi1H": 12,
    "change24h": -63.26,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "SSV",
    "rsi1H": 63,
    "change24h": 2.37,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LQTY",
    "rsi1H": 47.4,
    "change24h": 0.17,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "AMB",
    "rsi1H": 30.8,
    "change24h": -11.11,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BETH",
    "rsi1H": 40.3,
    "change24h": -1.63,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "USTC",
    "rsi1H": 53.2,
    "change24h": -0.18,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "GAS",
    "rsi1H": 73.8,
    "change24h": 6.09,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "GLM",
    "rsi1H": 64.6,
    "change24h": 0.82,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PROM",
    "rsi1H": 32.1,
    "change24h": -1.39,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "QKC",
    "rsi1H": 55.8,
    "change24h": 1.23,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "UFT",
    "rsi1H": 12.6,
    "change24h": -23.28,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "ID",
    "rsi1H": 54,
    "change24h": 0.53,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ARB",
    "rsi1H": 67,
    "change24h": 3.4,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LOOM",
    "rsi1H": 35.3,
    "change24h": -2.03,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "OAX",
    "rsi1H": 12,
    "change24h": -21.49,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "RDNT",
    "rsi1H": 32.6,
    "change24h": -4.65,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "WBTC",
    "rsi1H": 65,
    "change24h": 0.51,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "EDU",
    "rsi1H": 70,
    "change24h": 8.01,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SUI",
    "rsi1H": 65.1,
    "change24h": 4.33,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AERGO",
    "rsi1H": 41.7,
    "change24h": -2.01,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "PEPE",
    "rsi1H": 65.2,
    "change24h": 3.06,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "FLOKI",
    "rsi1H": 49.7,
    "change24h": 1.64,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "AST",
    "rsi1H": 27.4,
    "change24h": -5.78,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "SNT",
    "rsi1H": 41.8,
    "change24h": -3.13,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "COMBO",
    "rsi1H": 12.7,
    "change24h": -16.62,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "MAV",
    "rsi1H": 55.6,
    "change24h": 6.38,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "PENDLE",
    "rsi1H": 64.1,
    "change24h": 0.94,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ARKM",
    "rsi1H": 72.7,
    "change24h": 5.75,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "WBETH",
    "rsi1H": 61.5,
    "change24h": 0.86,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "WLD",
    "rsi1H": 78.1,
    "change24h": 12.64,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "FDUSD",
    "rsi1H": 50,
    "change24h": 0,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SEI",
    "rsi1H": 65.9,
    "change24h": 3.6,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CYBER",
    "rsi1H": 32.9,
    "change24h": -5.45,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ARK",
    "rsi1H": 49.5,
    "change24h": -0.87,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "CREAM",
    "rsi1H": 87.4,
    "change24h": 65.35,
    "hasWarning": true,
    "zone": "GAINERS"
  },
  {
    "symbol": "GFT",
    "rsi1H": 17.8,
    "change24h": -14.41,
    "hasWarning": false,
    "zone": "EXTREME"
  },
  {
    "symbol": "IQ",
    "rsi1H": 40,
    "change24h": 0.36,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "NTRN",
    "rsi1H": 20,
    "change24h": -23.81,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "TIA",
    "rsi1H": 76.4,
    "change24h": 8.05,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MEME",
    "rsi1H": 67.3,
    "change24h": 3.41,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ORDI",
    "rsi1H": 67.6,
    "change24h": 4.69,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BEAMX",
    "rsi1H": 47.9,
    "change24h": -2.32,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "PIVX",
    "rsi1H": 22.1,
    "change24h": -14.91,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "VIC",
    "rsi1H": 13.3,
    "change24h": -42.96,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "BLUR",
    "rsi1H": 49.9,
    "change24h": -1.31,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "VANRY",
    "rsi1H": 12,
    "change24h": -37.13,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "AEUR",
    "rsi1H": 66.1,
    "change24h": 0.02,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "JTO",
    "rsi1H": 72.5,
    "change24h": 5.92,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "1000SATS",
    "rsi1H": 62.3,
    "change24h": 3.97,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BONK",
    "rsi1H": 64,
    "change24h": 2.09,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ACE",
    "rsi1H": 50.2,
    "change24h": -1.55,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NFP",
    "rsi1H": 12,
    "change24h": -65.85,
    "hasWarning": true,
    "zone": "EXTREME"
  },
  {
    "symbol": "AI",
    "rsi1H": 51.7,
    "change24h": 3.43,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "XAI",
    "rsi1H": 44.5,
    "change24h": 4.44,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MANTA",
    "rsi1H": 48.8,
    "change24h": 3.71,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ALT",
    "rsi1H": 55.1,
    "change24h": 3.59,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "PYTH",
    "rsi1H": 38.7,
    "change24h": -3.23,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "RONIN",
    "rsi1H": 48.9,
    "change24h": 5.79,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "DYM",
    "rsi1H": 60.8,
    "change24h": 2.7,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PIXEL",
    "rsi1H": 36,
    "change24h": 0.16,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "STRK",
    "rsi1H": 88.6,
    "change24h": 29.7,
    "hasWarning": true,
    "zone": "GAINERS"
  },
  {
    "symbol": "PORTAL",
    "rsi1H": 66,
    "change24h": 2.89,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PDA",
    "rsi1H": 36.8,
    "change24h": -5.79,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "AXL",
    "rsi1H": 62,
    "change24h": 3.45,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "WIF",
    "rsi1H": 59.7,
    "change24h": 2.78,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "METIS",
    "rsi1H": 58.8,
    "change24h": -0.3,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AEVO",
    "rsi1H": 28.8,
    "change24h": -4.47,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "BOME",
    "rsi1H": 34,
    "change24h": -1.5,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ETHFI",
    "rsi1H": 51.8,
    "change24h": -0.73,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ENA",
    "rsi1H": 64.4,
    "change24h": 3.07,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "W",
    "rsi1H": 50.8,
    "change24h": 1.32,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TNSR",
    "rsi1H": 64.5,
    "change24h": 2.18,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SAGA",
    "rsi1H": 54.9,
    "change24h": 1.88,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TAO",
    "rsi1H": 65.5,
    "change24h": 2.72,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "OMNI",
    "rsi1H": 28.3,
    "change24h": -6.51,
    "hasWarning": false,
    "zone": "OVERSOLD"
  },
  {
    "symbol": "REZ",
    "rsi1H": 56.3,
    "change24h": 0.83,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BB",
    "rsi1H": 66.1,
    "change24h": 5.96,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "NOT",
    "rsi1H": 71.2,
    "change24h": 5.02,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "IO",
    "rsi1H": 69,
    "change24h": 4.38,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ZK",
    "rsi1H": 64.8,
    "change24h": 5.51,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LISTA",
    "rsi1H": 52.9,
    "change24h": 1.11,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ZRO",
    "rsi1H": 59.4,
    "change24h": -0.35,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "G",
    "rsi1H": 73.3,
    "change24h": 4.52,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BANANA",
    "rsi1H": 46.8,
    "change24h": 0.16,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "RENDER",
    "rsi1H": 60.5,
    "change24h": 2.56,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TON",
    "rsi1H": 45.5,
    "change24h": 0.95,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "DOGS",
    "rsi1H": 60.7,
    "change24h": 1.62,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "EURI",
    "rsi1H": 51.1,
    "change24h": 0.03,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SLF",
    "rsi1H": 36.8,
    "change24h": -12.24,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "POL",
    "rsi1H": 59.7,
    "change24h": 0.63,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NEIRO",
    "rsi1H": 64.5,
    "change24h": 4.02,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TURBO",
    "rsi1H": 63.5,
    "change24h": 3.41,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "1MBABYDOGE",
    "rsi1H": 63.4,
    "change24h": 1.88,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CATI",
    "rsi1H": 40.2,
    "change24h": -1.72,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "HMSTR",
    "rsi1H": 60,
    "change24h": 2.17,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "EIGEN",
    "rsi1H": 75.9,
    "change24h": 7.06,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SCR",
    "rsi1H": 39.8,
    "change24h": -1.96,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BNSOL",
    "rsi1H": 55,
    "change24h": 0.08,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "LUMIA",
    "rsi1H": 74.4,
    "change24h": 34.48,
    "hasWarning": true,
    "zone": "GAINERS"
  },
  {
    "symbol": "KAIA",
    "rsi1H": 54.6,
    "change24h": 6.57,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "COW",
    "rsi1H": 69.6,
    "change24h": 3.54,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CETUS",
    "rsi1H": 47.8,
    "change24h": 2.54,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "PNUT",
    "rsi1H": 55.3,
    "change24h": 0.4,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ACT",
    "rsi1H": 61.5,
    "change24h": 9.65,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "USUAL",
    "rsi1H": 64,
    "change24h": 5.22,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "THE",
    "rsi1H": 64.5,
    "change24h": 3.42,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ACX",
    "rsi1H": 44.2,
    "change24h": -0.07,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ORCA",
    "rsi1H": 60,
    "change24h": 5.35,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MOVE",
    "rsi1H": 69,
    "change24h": 3.18,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ME",
    "rsi1H": 62.8,
    "change24h": 2.83,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "VELODROME",
    "rsi1H": 77.9,
    "change24h": 11.92,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "VANA",
    "rsi1H": 67.4,
    "change24h": 4.67,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "1000CAT",
    "rsi1H": 62.4,
    "change24h": 1.13,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PENGU",
    "rsi1H": 59.6,
    "change24h": 2.51,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BIO",
    "rsi1H": 67.7,
    "change24h": 3.23,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "D",
    "rsi1H": 46.6,
    "change24h": -0.43,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "AIXBT",
    "rsi1H": 67.7,
    "change24h": 4.14,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CGPT",
    "rsi1H": 74.2,
    "change24h": 5.54,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "COOKIE",
    "rsi1H": 63.9,
    "change24h": 4.16,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "S",
    "rsi1H": 65.2,
    "change24h": 1.81,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SOLV",
    "rsi1H": 70.1,
    "change24h": 3.61,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TRUMP",
    "rsi1H": 57.8,
    "change24h": 2.21,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ANIME",
    "rsi1H": 64.7,
    "change24h": 2.54,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BERA",
    "rsi1H": 70.1,
    "change24h": 3.89,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "1000CHEEMS",
    "rsi1H": 73.7,
    "change24h": 4.53,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TST",
    "rsi1H": 64,
    "change24h": 2.52,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LAYER",
    "rsi1H": 65.4,
    "change24h": 3.87,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "HEI",
    "rsi1H": 60.6,
    "change24h": 2.22,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "KAITO",
    "rsi1H": 72,
    "change24h": 3.19,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SHELL",
    "rsi1H": 63.7,
    "change24h": 2.74,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "RED",
    "rsi1H": 63.4,
    "change24h": 2.1,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "GPS",
    "rsi1H": 56.2,
    "change24h": 0.48,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "EPIC",
    "rsi1H": 46.6,
    "change24h": 0.22,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BMT",
    "rsi1H": 59.2,
    "change24h": 3.44,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "FORM",
    "rsi1H": 69.6,
    "change24h": 3.71,
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
    "rsi1H": 55.4,
    "change24h": 2.21,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "PARTI",
    "rsi1H": 56.8,
    "change24h": 0.59,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MUBARAK",
    "rsi1H": 48.5,
    "change24h": -2.07,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "TUT",
    "rsi1H": 45.8,
    "change24h": -0.4,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BROCCOLI714",
    "rsi1H": 64.2,
    "change24h": 2.56,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BANANAS31",
    "rsi1H": 60.1,
    "change24h": 1.23,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "GUN",
    "rsi1H": 67.9,
    "change24h": 4.59,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BABY",
    "rsi1H": 32.9,
    "change24h": -1.11,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ONDO",
    "rsi1H": 62.6,
    "change24h": 3.21,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BIGTIME",
    "rsi1H": 57.4,
    "change24h": 4.14,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "VIRTUAL",
    "rsi1H": 65.5,
    "change24h": 3.29,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "KERNEL",
    "rsi1H": 66.3,
    "change24h": 1.79,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "WCT",
    "rsi1H": 43.7,
    "change24h": 0.17,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "HYPER",
    "rsi1H": 54.6,
    "change24h": 0.85,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "INIT",
    "rsi1H": 73.5,
    "change24h": 7.05,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SIGN",
    "rsi1H": 69,
    "change24h": 2.43,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "STO",
    "rsi1H": 68.2,
    "change24h": 2.76,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "KMNO",
    "rsi1H": 67.4,
    "change24h": 3.61,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SXT",
    "rsi1H": 55.7,
    "change24h": 1.2,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NXPC",
    "rsi1H": 68.3,
    "change24h": 3.35,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AWE",
    "rsi1H": 67.1,
    "change24h": 5,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "HAEDAL",
    "rsi1H": 52,
    "change24h": 0.73,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "USD1",
    "rsi1H": 36.6,
    "change24h": -0.03,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "HUMA",
    "rsi1H": 30.6,
    "change24h": -4.09,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "A",
    "rsi1H": 49.5,
    "change24h": 2.35,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SOPH",
    "rsi1H": 42.1,
    "change24h": -0.55,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "RESOLV",
    "rsi1H": 63.7,
    "change24h": 3.44,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "HOME",
    "rsi1H": 52.6,
    "change24h": -0.51,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SPK",
    "rsi1H": 52.8,
    "change24h": 0.37,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NEWT",
    "rsi1H": 61.2,
    "change24h": 2.52,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SAHARA",
    "rsi1H": 71,
    "change24h": 2.67,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LA",
    "rsi1H": 62.6,
    "change24h": 5.34,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ERA",
    "rsi1H": 65.4,
    "change24h": 21.41,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "C",
    "rsi1H": 46.9,
    "change24h": -1.69,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "TREE",
    "rsi1H": 63.6,
    "change24h": 4.6,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "A2Z",
    "rsi1H": 56.8,
    "change24h": -1.18,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TOWNS",
    "rsi1H": 61.3,
    "change24h": 2.63,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PROVE",
    "rsi1H": 50.8,
    "change24h": 0.05,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BFUSD",
    "rsi1H": 52.5,
    "change24h": 0.03,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "PLUME",
    "rsi1H": 73.2,
    "change24h": 6.7,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "DOLO",
    "rsi1H": 44.5,
    "change24h": 0.33,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MITO",
    "rsi1H": 74.7,
    "change24h": 5.07,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "WLFI",
    "rsi1H": 59.5,
    "change24h": 3.64,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SOMI",
    "rsi1H": 50.9,
    "change24h": -0.63,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "OPEN",
    "rsi1H": 58.3,
    "change24h": 2.12,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "USDE",
    "rsi1H": 32.5,
    "change24h": -0.02,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "LINEA",
    "rsi1H": 66.2,
    "change24h": 3.49,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "HOLO",
    "rsi1H": 65.2,
    "change24h": 2.83,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "PUMP",
    "rsi1H": 62.3,
    "change24h": 3.36,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AVNT",
    "rsi1H": 33.7,
    "change24h": -1.84,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "ZKC",
    "rsi1H": 44.9,
    "change24h": -0.73,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SKY",
    "rsi1H": 51.7,
    "change24h": 0.14,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "BARD",
    "rsi1H": 53.5,
    "change24h": 0.73,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "0G",
    "rsi1H": 57.8,
    "change24h": 0.65,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "HEMI",
    "rsi1H": 50,
    "change24h": -0.68,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "XPL",
    "rsi1H": 71.8,
    "change24h": 4.08,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MIRA",
    "rsi1H": 53.2,
    "change24h": 0.81,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "FF",
    "rsi1H": 52.7,
    "change24h": 1.09,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "EDEN",
    "rsi1H": 57.8,
    "change24h": 1.53,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NOM",
    "rsi1H": 31.3,
    "change24h": -1.63,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "2Z",
    "rsi1H": 56.2,
    "change24h": 2.59,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MORPHO",
    "rsi1H": 65,
    "change24h": 1.13,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ASTER",
    "rsi1H": 64.4,
    "change24h": 2.48,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "WAL",
    "rsi1H": 50.4,
    "change24h": 5.42,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "EUL",
    "rsi1H": 67.2,
    "change24h": 1.95,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ENSO",
    "rsi1H": 41.2,
    "change24h": 0.21,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "YB",
    "rsi1H": 58.1,
    "change24h": 3.8,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ZBT",
    "rsi1H": 59.6,
    "change24h": 1.25,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TURTLE",
    "rsi1H": 63.2,
    "change24h": 4.32,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "GIGGLE",
    "rsi1H": 63.6,
    "change24h": 2.36,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "F",
    "rsi1H": 66.3,
    "change24h": 1.82,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "KITE",
    "rsi1H": 74.1,
    "change24h": 7.97,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MMT",
    "rsi1H": 47,
    "change24h": -0.38,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SAPIEN",
    "rsi1H": 56.5,
    "change24h": 0.42,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ALLO",
    "rsi1H": 41.9,
    "change24h": -0.64,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "BANK",
    "rsi1H": 41.3,
    "change24h": -0.7,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MET",
    "rsi1H": 56.2,
    "change24h": 3.4,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AT",
    "rsi1H": 47.4,
    "change24h": -1.95,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "KGST",
    "rsi1H": 33.5,
    "change24h": -0.01,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "BREV",
    "rsi1H": 42.3,
    "change24h": 2.68,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "币安人生",
    "rsi1H": 52.2,
    "change24h": 0.93,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ZKP",
    "rsi1H": 56.7,
    "change24h": 0.2,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "U",
    "rsi1H": 44.2,
    "change24h": -0.01,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "FRAX",
    "rsi1H": 52.6,
    "change24h": 6.1,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "FOGO",
    "rsi1H": 69.2,
    "change24h": 2.99,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "RLUSD",
    "rsi1H": 67.5,
    "change24h": 0.03,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SENT",
    "rsi1H": 45.4,
    "change24h": -3.02,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ZAMA",
    "rsi1H": 57.4,
    "change24h": 2.55,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ESP",
    "rsi1H": 65.9,
    "change24h": 3.39,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MANTRA",
    "rsi1H": 59.6,
    "change24h": 3.65,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ROBO",
    "rsi1H": 59.5,
    "change24h": 2.97,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "OPN",
    "rsi1H": 57.2,
    "change24h": 2.27,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NIGHT",
    "rsi1H": 76.2,
    "change24h": 10.86,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CFG",
    "rsi1H": 53.7,
    "change24h": 2.65,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "KAT",
    "rsi1H": 55.8,
    "change24h": 0.87,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "XAUT",
    "rsi1H": 34.1,
    "change24h": -0.27,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "USDS",
    "rsi1H": 59.6,
    "change24h": 0.1,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CHIP",
    "rsi1H": 86.9,
    "change24h": 19.14,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MEGA",
    "rsi1H": 70.5,
    "change24h": 2.67,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AIGENSYN",
    "rsi1H": 62.6,
    "change24h": 4.5,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "GENIUS",
    "rsi1H": 48.7,
    "change24h": 0.92,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "OPG",
    "rsi1H": 60.7,
    "change24h": 2.49,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MUB",
    "rsi1H": 62.5,
    "change24h": 0.25,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CRCLB",
    "rsi1H": 57.7,
    "change24h": -0.53,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "NVDAB",
    "rsi1H": 63.5,
    "change24h": 0.37,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SNDKB",
    "rsi1H": 51.1,
    "change24h": -0.56,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "TSLAB",
    "rsi1H": 40.1,
    "change24h": -0.08,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SPCXB",
    "rsi1H": 67.2,
    "change24h": 1.09,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "RE",
    "rsi1H": 69.5,
    "change24h": 2.6,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AMDB",
    "rsi1H": 53,
    "change24h": -0.1,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "INTCB",
    "rsi1H": 48.8,
    "change24h": -0.72,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MSTRB",
    "rsi1H": 66.1,
    "change24h": 0.39,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "LITEB",
    "rsi1H": 42.4,
    "change24h": -1.58,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "METAB",
    "rsi1H": 48.8,
    "change24h": -0.14,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MSFTB",
    "rsi1H": 40.6,
    "change24h": 0.15,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "PLTRB",
    "rsi1H": 65.6,
    "change24h": 1.62,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "QQQB",
    "rsi1H": 46.7,
    "change24h": 0.07,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "GRAM",
    "rsi1H": 50.2,
    "change24h": -0.41,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "CBRSB",
    "rsi1H": 61.4,
    "change24h": 0.16,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "COINB",
    "rsi1H": 47.2,
    "change24h": -0.34,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "DRAMB",
    "rsi1H": 63.4,
    "change24h": 0.66,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "GLWB",
    "rsi1H": 35.6,
    "change24h": -0.58,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "GOOGLB",
    "rsi1H": 34.3,
    "change24h": -0.29,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "NBISB",
    "rsi1H": 60,
    "change24h": 0.83,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "QCOMB",
    "rsi1H": 65.6,
    "change24h": 1.43,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SOXLB",
    "rsi1H": 53.4,
    "change24h": 0.57,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SPYB",
    "rsi1H": 48.1,
    "change24h": 0.1,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "WDCB",
    "rsi1H": 55.8,
    "change24h": -0.33,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SKHYB",
    "rsi1H": 56.2,
    "change24h": 0.04,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AAOIB",
    "rsi1H": 57.9,
    "change24h": 0.28,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ARMB",
    "rsi1H": 53.8,
    "change24h": 0.38,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AVGOB",
    "rsi1H": 64.8,
    "change24h": 0.17,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BABAB",
    "rsi1H": 34.7,
    "change24h": -0.36,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "HOODB",
    "rsi1H": 66.7,
    "change24h": 0.19,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MRVLB",
    "rsi1H": 65.8,
    "change24h": 1.36,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "TSMB",
    "rsi1H": 60.7,
    "change24h": 0.57,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "RKLBB",
    "rsi1H": 44.5,
    "change24h": 0.5,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "AERO",
    "rsi1H": 77.6,
    "change24h": 11.68,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AXTIB",
    "rsi1H": 34.9,
    "change24h": -0.6,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "CRWVB",
    "rsi1H": 55.4,
    "change24h": 0.58,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "INTWB",
    "rsi1H": 43.6,
    "change24h": -1.79,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "KORUB",
    "rsi1H": 57.1,
    "change24h": 1.06,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "MUUB",
    "rsi1H": 62.9,
    "change24h": 0.38,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "MVLLB",
    "rsi1H": 69.1,
    "change24h": 2.66,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ORCLB",
    "rsi1H": 33.7,
    "change24h": -0.87,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "SNXXB",
    "rsi1H": 47.9,
    "change24h": -1.28,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "TQQQB",
    "rsi1H": 51.9,
    "change24h": 0.26,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "AAPLB",
    "rsi1H": 41.7,
    "change24h": 0.24,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "AMATB",
    "rsi1H": 66.9,
    "change24h": 0.14,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AMZNB",
    "rsi1H": 59,
    "change24h": 0.42,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "DELLB",
    "rsi1H": 33.4,
    "change24h": -0.26,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "SMHB",
    "rsi1H": 56,
    "change24h": 0.14,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "SOXSB",
    "rsi1H": 44.2,
    "change24h": -0.72,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "ASMLB",
    "rsi1H": 61.4,
    "change24h": 0.37,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "ASTSB",
    "rsi1H": 62,
    "change24h": 3.54,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BMNRB",
    "rsi1H": 62.7,
    "change24h": 0.37,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "COHRB",
    "rsi1H": 41,
    "change24h": 0.06,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "IRENB",
    "rsi1H": 63.8,
    "change24h": 1.14,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "NFLXB",
    "rsi1H": 42,
    "change24h": -0.18,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "SMCIB",
    "rsi1H": 62.5,
    "change24h": 0.94,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "USARB",
    "rsi1H": 43.3,
    "change24h": -0.86,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MRNAB",
    "rsi1H": 62.6,
    "change24h": 1.29,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SQQQB",
    "rsi1H": 49.9,
    "change24h": -0.3,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "MARSCOIN",
    "rsi1H": 57.8,
    "change24h": 2.92,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "HIMSB",
    "rsi1H": 54.6,
    "change24h": 2.22,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "牛来",
    "rsi1H": 75.5,
    "change24h": 9.4,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "BNCB",
    "rsi1H": 63,
    "change24h": 1.52,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "AGPUB",
    "rsi1H": 68.3,
    "change24h": 1.95,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "CYPHB",
    "rsi1H": 49.3,
    "change24h": -2.29,
    "hasWarning": false,
    "zone": "NEUTRAL"
  },
  {
    "symbol": "HYPE",
    "rsi1H": 55.1,
    "change24h": 0.64,
    "hasWarning": false,
    "zone": "V1"
  },
  {
    "symbol": "ADBEB",
    "rsi1H": 34.9,
    "change24h": -0.63,
    "hasWarning": false,
    "zone": "HIDDEN_BULL"
  },
  {
    "symbol": "SHAZB",
    "rsi1H": 63.6,
    "change24h": 0.77,
    "hasWarning": false,
    "zone": "GAINERS"
  },
  {
    "symbol": "SECZB",
    "rsi1H": 41.6,
    "change24h": -1.31,
    "hasWarning": false,
    "zone": "NEUTRAL"
  }
];
