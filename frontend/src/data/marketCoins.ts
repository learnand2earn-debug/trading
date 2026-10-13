export interface HeatmapCoin {
  symbol: string;
  rsi1H: number;
  rsiTf?: number;
  timeframe?: string;
  change24h: number;
  hasWarning?: boolean;
  isAccentGreen?: boolean;
}

// 1. 🚀 Gainers Zone (100 100% verified Binance Spot pairs)
export const GAINERS_COINS: HeatmapCoin[] = [
  {
    "symbol": "STRK",
    "rsi1H": 82.4,
    "change24h": 50.81,
    "hasWarning": true
  },
  {
    "symbol": "CKB",
    "rsi1H": 89.9,
    "change24h": 38.41,
    "hasWarning": true
  },
  {
    "symbol": "MBL",
    "rsi1H": 68.2,
    "change24h": 27.82,
    "hasWarning": true
  },
  {
    "symbol": "CHIP",
    "rsi1H": 80,
    "change24h": 25.83,
    "hasWarning": true
  },
  {
    "symbol": "CFX",
    "rsi1H": 83.7,
    "change24h": 25.12,
    "hasWarning": true
  },
  {
    "symbol": "TIA",
    "rsi1H": 76.1,
    "change24h": 19.12,
    "hasWarning": false
  },
  {
    "symbol": "LUMIA",
    "rsi1H": 69.4,
    "change24h": 17.94,
    "hasWarning": false
  },
  {
    "symbol": "MAGIC",
    "rsi1H": 78.8,
    "change24h": 16.12,
    "hasWarning": false
  },
  {
    "symbol": "S",
    "rsi1H": 83.8,
    "change24h": 16.05,
    "hasWarning": false
  },
  {
    "symbol": "SENT",
    "rsi1H": 69.9,
    "change24h": 13.92,
    "hasWarning": false
  },
  {
    "symbol": "ZK",
    "rsi1H": 74.1,
    "change24h": 12.46,
    "hasWarning": false
  },
  {
    "symbol": "BAT",
    "rsi1H": 67.8,
    "change24h": 10.3,
    "hasWarning": false
  },
  {
    "symbol": "NIL",
    "rsi1H": 77.7,
    "change24h": 9.81,
    "hasWarning": false
  },
  {
    "symbol": "ROSE",
    "rsi1H": 75,
    "change24h": 9.48,
    "hasWarning": false
  },
  {
    "symbol": "EIGEN",
    "rsi1H": 76.2,
    "change24h": 9.11,
    "hasWarning": false
  },
  {
    "symbol": "RLC",
    "rsi1H": 69.9,
    "change24h": 8.64,
    "hasWarning": false
  },
  {
    "symbol": "FRAX",
    "rsi1H": 70.2,
    "change24h": 8.57,
    "hasWarning": false
  },
  {
    "symbol": "币安人生",
    "rsi1H": 76.9,
    "change24h": 8.23,
    "hasWarning": false
  },
  {
    "symbol": "AERO",
    "rsi1H": 73.7,
    "change24h": 8.11,
    "hasWarning": false
  },
  {
    "symbol": "VELODROME",
    "rsi1H": 73.3,
    "change24h": 7.89,
    "hasWarning": false
  },
  {
    "symbol": "DUSK",
    "rsi1H": 71.3,
    "change24h": 7.32,
    "hasWarning": false
  },
  {
    "symbol": "PLUME",
    "rsi1H": 76.3,
    "change24h": 7.3,
    "hasWarning": false
  },
  {
    "symbol": "APT",
    "rsi1H": 70.9,
    "change24h": 6.8,
    "hasWarning": false
  },
  {
    "symbol": "ARB",
    "rsi1H": 66.1,
    "change24h": 6.25,
    "hasWarning": false
  },
  {
    "symbol": "BAND",
    "rsi1H": 72,
    "change24h": 6.08,
    "hasWarning": false
  },
  {
    "symbol": "BOME",
    "rsi1H": 61.4,
    "change24h": 5.98,
    "hasWarning": false
  },
  {
    "symbol": "IO",
    "rsi1H": 68.2,
    "change24h": 5.94,
    "hasWarning": false
  },
  {
    "symbol": "ETHFI",
    "rsi1H": 73.8,
    "change24h": 5.77,
    "hasWarning": false
  },
  {
    "symbol": "NEO",
    "rsi1H": 66.9,
    "change24h": 5.67,
    "hasWarning": false
  },
  {
    "symbol": "LINEA",
    "rsi1H": 72.4,
    "change24h": 5.58,
    "hasWarning": false
  },
  {
    "symbol": "INJ",
    "rsi1H": 64.7,
    "change24h": 5.53,
    "hasWarning": false
  },
  {
    "symbol": "ACH",
    "rsi1H": 65.3,
    "change24h": 5.44,
    "hasWarning": false
  },
  {
    "symbol": "METIS",
    "rsi1H": 71.5,
    "change24h": 5.39,
    "hasWarning": false
  },
  {
    "symbol": "OSMO",
    "rsi1H": 65.7,
    "change24h": 4.96,
    "hasWarning": false
  },
  {
    "symbol": "ATOM",
    "rsi1H": 67.2,
    "change24h": 4.88,
    "hasWarning": false
  },
  {
    "symbol": "MEGA",
    "rsi1H": 62.2,
    "change24h": 4.58,
    "hasWarning": false
  },
  {
    "symbol": "RONIN",
    "rsi1H": 60,
    "change24h": 4.43,
    "hasWarning": false
  },
  {
    "symbol": "AVNT",
    "rsi1H": 67.3,
    "change24h": 4.13,
    "hasWarning": false
  },
  {
    "symbol": "AXL",
    "rsi1H": 66.1,
    "change24h": 3.91,
    "hasWarning": false
  },
  {
    "symbol": "ALGO",
    "rsi1H": 64.4,
    "change24h": 3.74,
    "hasWarning": false
  },
  {
    "symbol": "FTT",
    "rsi1H": 67.3,
    "change24h": 3.7,
    "hasWarning": false
  },
  {
    "symbol": "JTO",
    "rsi1H": 62,
    "change24h": 3.63,
    "hasWarning": false
  },
  {
    "symbol": "OP",
    "rsi1H": 61.7,
    "change24h": 3.61,
    "hasWarning": false
  },
  {
    "symbol": "BEL",
    "rsi1H": 65.8,
    "change24h": 3.57,
    "hasWarning": false
  },
  {
    "symbol": "BIO",
    "rsi1H": 68.6,
    "change24h": 3.4,
    "hasWarning": false
  },
  {
    "symbol": "ARKM",
    "rsi1H": 61.8,
    "change24h": 3.24,
    "hasWarning": false
  },
  {
    "symbol": "DYM",
    "rsi1H": 60.9,
    "change24h": 3.02,
    "hasWarning": false
  },
  {
    "symbol": "WLD",
    "rsi1H": 64.1,
    "change24h": 3.01,
    "hasWarning": false
  },
  {
    "symbol": "HYPER",
    "rsi1H": 64.6,
    "change24h": 2.84,
    "hasWarning": false
  },
  {
    "symbol": "BTTC",
    "rsi1H": 72.1,
    "change24h": 2.78,
    "hasWarning": false
  },
  {
    "symbol": "CELO",
    "rsi1H": 66,
    "change24h": 2.72,
    "hasWarning": false
  },
  {
    "symbol": "MASK",
    "rsi1H": 67.8,
    "change24h": 2.56,
    "hasWarning": false
  },
  {
    "symbol": "BEAMX",
    "rsi1H": 63.8,
    "change24h": 2.56,
    "hasWarning": false
  },
  {
    "symbol": "ENA",
    "rsi1H": 66.5,
    "change24h": 2.45,
    "hasWarning": false
  },
  {
    "symbol": "XTZ",
    "rsi1H": 63.2,
    "change24h": 2.37,
    "hasWarning": false
  },
  {
    "symbol": "GRT",
    "rsi1H": 69.7,
    "change24h": 2.37,
    "hasWarning": false
  },
  {
    "symbol": "VET",
    "rsi1H": 65.9,
    "change24h": 2.13,
    "hasWarning": false
  },
  {
    "symbol": "CRV",
    "rsi1H": 67.2,
    "change24h": 2.12,
    "hasWarning": false
  },
  {
    "symbol": "PUNDIX",
    "rsi1H": 67.7,
    "change24h": 1.84,
    "hasWarning": false
  },
  {
    "symbol": "TAO",
    "rsi1H": 68.9,
    "change24h": 1.81,
    "hasWarning": false
  },
  {
    "symbol": "C",
    "rsi1H": 60.9,
    "change24h": 1.71,
    "hasWarning": false
  },
  {
    "symbol": "FET",
    "rsi1H": 63.6,
    "change24h": 1.64,
    "hasWarning": false
  },
  {
    "symbol": "KSM",
    "rsi1H": 63.8,
    "change24h": 1.6,
    "hasWarning": false
  },
  {
    "symbol": "VANA",
    "rsi1H": 61.8,
    "change24h": 1.6,
    "hasWarning": false
  },
  {
    "symbol": "RSR",
    "rsi1H": 60.3,
    "change24h": 1.57,
    "hasWarning": false
  },
  {
    "symbol": "MANTRA",
    "rsi1H": 60.1,
    "change24h": 1.55,
    "hasWarning": false
  },
  {
    "symbol": "POLYX",
    "rsi1H": 62.9,
    "change24h": 1.47,
    "hasWarning": false
  },
  {
    "symbol": "BONK",
    "rsi1H": 66.4,
    "change24h": 1.47,
    "hasWarning": false
  },
  {
    "symbol": "2Z",
    "rsi1H": 63.8,
    "change24h": 1.46,
    "hasWarning": false
  },
  {
    "symbol": "CAKE",
    "rsi1H": 61.7,
    "change24h": 1.44,
    "hasWarning": false
  },
  {
    "symbol": "MTL",
    "rsi1H": 67.9,
    "change24h": 1.43,
    "hasWarning": false
  },
  {
    "symbol": "AUCTION",
    "rsi1H": 63.4,
    "change24h": 1.34,
    "hasWarning": false
  },
  {
    "symbol": "HUMA",
    "rsi1H": 61,
    "change24h": 1.21,
    "hasWarning": false
  },
  {
    "symbol": "NEAR",
    "rsi1H": 65.8,
    "change24h": 1.18,
    "hasWarning": false
  },
  {
    "symbol": "AAOIB",
    "rsi1H": 65.9,
    "change24h": 1.07,
    "hasWarning": false
  },
  {
    "symbol": "LITEB",
    "rsi1H": 67.8,
    "change24h": 1,
    "hasWarning": false
  },
  {
    "symbol": "WIF",
    "rsi1H": 63.8,
    "change24h": 0.88,
    "hasWarning": false
  },
  {
    "symbol": "FORM",
    "rsi1H": 61.4,
    "change24h": 0.83,
    "hasWarning": false
  },
  {
    "symbol": "ZEN",
    "rsi1H": 62.8,
    "change24h": 0.82,
    "hasWarning": false
  },
  {
    "symbol": "IOTA",
    "rsi1H": 64.9,
    "change24h": 0.78,
    "hasWarning": false
  },
  {
    "symbol": "AVAX",
    "rsi1H": 67.7,
    "change24h": 0.73,
    "hasWarning": false
  },
  {
    "symbol": "ASTSB",
    "rsi1H": 62.4,
    "change24h": 0.55,
    "hasWarning": false
  },
  {
    "symbol": "CBRSB",
    "rsi1H": 66.3,
    "change24h": 0.54,
    "hasWarning": false
  },
  {
    "symbol": "AGPUB",
    "rsi1H": 61.8,
    "change24h": 0.42,
    "hasWarning": false
  },
  {
    "symbol": "XLM",
    "rsi1H": 65.1,
    "change24h": 0.41,
    "hasWarning": false
  },
  {
    "symbol": "HEMI",
    "rsi1H": 61.5,
    "change24h": 0.34,
    "hasWarning": false
  },
  {
    "symbol": "COINB",
    "rsi1H": 64.3,
    "change24h": 0.34,
    "hasWarning": false
  },
  {
    "symbol": "HOODB",
    "rsi1H": 63.5,
    "change24h": 0.34,
    "hasWarning": false
  },
  {
    "symbol": "MIRA",
    "rsi1H": 60.4,
    "change24h": 0.3,
    "hasWarning": false
  },
  {
    "symbol": "SPCXB",
    "rsi1H": 67.4,
    "change24h": 0.29,
    "hasWarning": false
  },
  {
    "symbol": "VTHO",
    "rsi1H": 61.6,
    "change24h": 0.28,
    "hasWarning": false
  },
  {
    "symbol": "INTCB",
    "rsi1H": 61.2,
    "change24h": 0.27,
    "hasWarning": false
  },
  {
    "symbol": "BABAB",
    "rsi1H": 65,
    "change24h": 0.26,
    "hasWarning": false
  },
  {
    "symbol": "NVDAB",
    "rsi1H": 67.9,
    "change24h": 0.22,
    "hasWarning": false
  },
  {
    "symbol": "AVGOB",
    "rsi1H": 62.6,
    "change24h": 0.21,
    "hasWarning": false
  },
  {
    "symbol": "TSLAB",
    "rsi1H": 62.1,
    "change24h": 0.12,
    "hasWarning": false
  },
  {
    "symbol": "PAXG",
    "rsi1H": 65.4,
    "change24h": 0.1,
    "hasWarning": false
  },
  {
    "symbol": "XAUT",
    "rsi1H": 64.2,
    "change24h": 0.09,
    "hasWarning": false
  },
  {
    "symbol": "RLUSD",
    "rsi1H": 67.5,
    "change24h": 0.02,
    "hasWarning": false
  },
  {
    "symbol": "C98",
    "rsi1H": 65.8,
    "change24h": -0.06,
    "hasWarning": false
  }
];

// 2. ⚡ V1 Zone (112 100% verified Binance Spot pairs)
export const V1_ZONE_COINS: HeatmapCoin[] = [
  {
    "symbol": "MANTA",
    "rsi1H": 59.8,
    "change24h": 8.05,
    "hasWarning": false
  },
  {
    "symbol": "ACT",
    "rsi1H": 57.2,
    "change24h": 7.75,
    "hasWarning": false
  },
  {
    "symbol": "QTUM",
    "rsi1H": 59.5,
    "change24h": 4.25,
    "hasWarning": false
  },
  {
    "symbol": "YB",
    "rsi1H": 51.1,
    "change24h": 4.24,
    "hasWarning": false
  },
  {
    "symbol": "WAL",
    "rsi1H": 50.5,
    "change24h": 4.07,
    "hasWarning": false
  },
  {
    "symbol": "BB",
    "rsi1H": 52,
    "change24h": 3.9,
    "hasWarning": false
  },
  {
    "symbol": "ZRO",
    "rsi1H": 59.7,
    "change24h": 3.9,
    "hasWarning": false
  },
  {
    "symbol": "EDU",
    "rsi1H": 56.6,
    "change24h": 3.86,
    "hasWarning": false
  },
  {
    "symbol": "BANK",
    "rsi1H": 53.5,
    "change24h": 3.19,
    "hasWarning": false
  },
  {
    "symbol": "APE",
    "rsi1H": 53.8,
    "change24h": 3.05,
    "hasWarning": false
  },
  {
    "symbol": "SYN",
    "rsi1H": 55,
    "change24h": 2.96,
    "hasWarning": false
  },
  {
    "symbol": "BLUR",
    "rsi1H": 56.2,
    "change24h": 2.95,
    "hasWarning": false
  },
  {
    "symbol": "WIN",
    "rsi1H": 58.5,
    "change24h": 2.42,
    "hasWarning": false
  },
  {
    "symbol": "SOLV",
    "rsi1H": 58.3,
    "change24h": 2.26,
    "hasWarning": false
  },
  {
    "symbol": "JASMY",
    "rsi1H": 53.6,
    "change24h": 2.19,
    "hasWarning": false
  },
  {
    "symbol": "EDEN",
    "rsi1H": 59.3,
    "change24h": 1.98,
    "hasWarning": false
  },
  {
    "symbol": "MOVE",
    "rsi1H": 55.3,
    "change24h": 1.96,
    "hasWarning": false
  },
  {
    "symbol": "0G",
    "rsi1H": 50.8,
    "change24h": 1.94,
    "hasWarning": false
  },
  {
    "symbol": "WOO",
    "rsi1H": 59.2,
    "change24h": 1.93,
    "hasWarning": false
  },
  {
    "symbol": "AWE",
    "rsi1H": 56.3,
    "change24h": 1.74,
    "hasWarning": false
  },
  {
    "symbol": "HIVE",
    "rsi1H": 56.2,
    "change24h": 1.65,
    "hasWarning": false
  },
  {
    "symbol": "IOST",
    "rsi1H": 54.5,
    "change24h": 1.64,
    "hasWarning": false
  },
  {
    "symbol": "ROBO",
    "rsi1H": 59.2,
    "change24h": 1.62,
    "hasWarning": false
  },
  {
    "symbol": "DODO",
    "rsi1H": 53.2,
    "change24h": 1.51,
    "hasWarning": false
  },
  {
    "symbol": "ICP",
    "rsi1H": 57.7,
    "change24h": 1.45,
    "hasWarning": false
  },
  {
    "symbol": "HYPE",
    "rsi1H": 51.7,
    "change24h": 1.38,
    "hasWarning": false
  },
  {
    "symbol": "TNSR",
    "rsi1H": 54.8,
    "change24h": 1.35,
    "hasWarning": false
  },
  {
    "symbol": "TFUEL",
    "rsi1H": 55.7,
    "change24h": 1.33,
    "hasWarning": false
  },
  {
    "symbol": "SNXXB",
    "rsi1H": 57,
    "change24h": 1.3,
    "hasWarning": false
  },
  {
    "symbol": "SECZB",
    "rsi1H": 59.8,
    "change24h": 1.26,
    "hasWarning": false
  },
  {
    "symbol": "AR",
    "rsi1H": 59.1,
    "change24h": 1.2,
    "hasWarning": false
  },
  {
    "symbol": "F",
    "rsi1H": 59.9,
    "change24h": 1.18,
    "hasWarning": false
  },
  {
    "symbol": "EUL",
    "rsi1H": 50.5,
    "change24h": 1.17,
    "hasWarning": false
  },
  {
    "symbol": "1000SATS",
    "rsi1H": 50.6,
    "change24h": 1.09,
    "hasWarning": false
  },
  {
    "symbol": "EPIC",
    "rsi1H": 50.2,
    "change24h": 0.89,
    "hasWarning": false
  },
  {
    "symbol": "PARTI",
    "rsi1H": 58,
    "change24h": 0.88,
    "hasWarning": false
  },
  {
    "symbol": "AT",
    "rsi1H": 57.5,
    "change24h": 0.86,
    "hasWarning": false
  },
  {
    "symbol": "POL",
    "rsi1H": 51.6,
    "change24h": 0.82,
    "hasWarning": false
  },
  {
    "symbol": "SEI",
    "rsi1H": 53.6,
    "change24h": 0.81,
    "hasWarning": false
  },
  {
    "symbol": "PUMP",
    "rsi1H": 58.6,
    "change24h": 0.73,
    "hasWarning": false
  },
  {
    "symbol": "XPL",
    "rsi1H": 57.9,
    "change24h": 0.73,
    "hasWarning": false
  },
  {
    "symbol": "SNDKB",
    "rsi1H": 55.5,
    "change24h": 0.73,
    "hasWarning": false
  },
  {
    "symbol": "SOXSB",
    "rsi1H": 55.7,
    "change24h": 0.7,
    "hasWarning": false
  },
  {
    "symbol": "TRB",
    "rsi1H": 54.6,
    "change24h": 0.68,
    "hasWarning": false
  },
  {
    "symbol": "PROVE",
    "rsi1H": 51.6,
    "change24h": 0.65,
    "hasWarning": false
  },
  {
    "symbol": "FF",
    "rsi1H": 52.4,
    "change24h": 0.65,
    "hasWarning": false
  },
  {
    "symbol": "ANIME",
    "rsi1H": 51,
    "change24h": 0.63,
    "hasWarning": false
  },
  {
    "symbol": "BMNRB",
    "rsi1H": 56.9,
    "change24h": 0.62,
    "hasWarning": false
  },
  {
    "symbol": "CTK",
    "rsi1H": 51,
    "change24h": 0.61,
    "hasWarning": false
  },
  {
    "symbol": "COMP",
    "rsi1H": 59.8,
    "change24h": 0.56,
    "hasWarning": false
  },
  {
    "symbol": "BNCB",
    "rsi1H": 54.4,
    "change24h": 0.56,
    "hasWarning": false
  },
  {
    "symbol": "ALICE",
    "rsi1H": 50.7,
    "change24h": 0.52,
    "hasWarning": false
  },
  {
    "symbol": "YFI",
    "rsi1H": 50.1,
    "change24h": 0.5,
    "hasWarning": false
  },
  {
    "symbol": "GALA",
    "rsi1H": 58.6,
    "change24h": 0.5,
    "hasWarning": false
  },
  {
    "symbol": "RENDER",
    "rsi1H": 50.8,
    "change24h": 0.47,
    "hasWarning": false
  },
  {
    "symbol": "CATI",
    "rsi1H": 54.5,
    "change24h": 0.45,
    "hasWarning": false
  },
  {
    "symbol": "ASTR",
    "rsi1H": 51.9,
    "change24h": 0.42,
    "hasWarning": false
  },
  {
    "symbol": "REQ",
    "rsi1H": 50.6,
    "change24h": 0.37,
    "hasWarning": false
  },
  {
    "symbol": "1MBABYDOGE",
    "rsi1H": 53.1,
    "change24h": 0.36,
    "hasWarning": false
  },
  {
    "symbol": "BTC",
    "rsi1H": 57.7,
    "change24h": 0.35,
    "hasWarning": false
  },
  {
    "symbol": "WBTC",
    "rsi1H": 56.6,
    "change24h": 0.35,
    "hasWarning": false
  },
  {
    "symbol": "NEWT",
    "rsi1H": 58.4,
    "change24h": 0.35,
    "hasWarning": false
  },
  {
    "symbol": "INIT",
    "rsi1H": 56.4,
    "change24h": 0.33,
    "hasWarning": false
  },
  {
    "symbol": "DRAMB",
    "rsi1H": 56,
    "change24h": 0.33,
    "hasWarning": false
  },
  {
    "symbol": "TQQQB",
    "rsi1H": 58.8,
    "change24h": 0.31,
    "hasWarning": false
  },
  {
    "symbol": "VIRTUAL",
    "rsi1H": 50.8,
    "change24h": 0.3,
    "hasWarning": false
  },
  {
    "symbol": "MSTRB",
    "rsi1H": 59.2,
    "change24h": 0.3,
    "hasWarning": false
  },
  {
    "symbol": "ZEC",
    "rsi1H": 54.9,
    "change24h": 0.29,
    "hasWarning": false
  },
  {
    "symbol": "LUNC",
    "rsi1H": 55,
    "change24h": 0.29,
    "hasWarning": false
  },
  {
    "symbol": "SOMI",
    "rsi1H": 50.9,
    "change24h": 0.29,
    "hasWarning": false
  },
  {
    "symbol": "DASH",
    "rsi1H": 59.7,
    "change24h": 0.25,
    "hasWarning": false
  },
  {
    "symbol": "SAHARA",
    "rsi1H": 53.6,
    "change24h": 0.23,
    "hasWarning": false
  },
  {
    "symbol": "DOLO",
    "rsi1H": 55,
    "change24h": 0.22,
    "hasWarning": false
  },
  {
    "symbol": "WLFI",
    "rsi1H": 52.8,
    "change24h": 0.17,
    "hasWarning": false
  },
  {
    "symbol": "SKY",
    "rsi1H": 51.9,
    "change24h": 0.16,
    "hasWarning": false
  },
  {
    "symbol": "CRCLB",
    "rsi1H": 52.1,
    "change24h": 0.15,
    "hasWarning": false
  },
  {
    "symbol": "XEC",
    "rsi1H": 50.2,
    "change24h": 0.14,
    "hasWarning": false
  },
  {
    "symbol": "ZBT",
    "rsi1H": 56,
    "change24h": 0.12,
    "hasWarning": false
  },
  {
    "symbol": "ASMLB",
    "rsi1H": 57.6,
    "change24h": 0.1,
    "hasWarning": false
  },
  {
    "symbol": "SKHYB",
    "rsi1H": 53,
    "change24h": 0.09,
    "hasWarning": false
  },
  {
    "symbol": "EURI",
    "rsi1H": 55.9,
    "change24h": 0.06,
    "hasWarning": false
  },
  {
    "symbol": "QQQB",
    "rsi1H": 52.4,
    "change24h": 0.06,
    "hasWarning": false
  },
  {
    "symbol": "SUSHI",
    "rsi1H": 52.3,
    "change24h": 0.04,
    "hasWarning": false
  },
  {
    "symbol": "CRWVB",
    "rsi1H": 55.2,
    "change24h": 0.04,
    "hasWarning": false
  },
  {
    "symbol": "SPYB",
    "rsi1H": 59.6,
    "change24h": 0.03,
    "hasWarning": false
  },
  {
    "symbol": "BNB",
    "rsi1H": 51.3,
    "change24h": 0.02,
    "hasWarning": false
  },
  {
    "symbol": "FDUSD",
    "rsi1H": 58.8,
    "change24h": 0.02,
    "hasWarning": false
  },
  {
    "symbol": "XUSD",
    "rsi1H": 58.8,
    "change24h": 0.02,
    "hasWarning": false
  },
  {
    "symbol": "MUB",
    "rsi1H": 51.7,
    "change24h": 0.02,
    "hasWarning": false
  },
  {
    "symbol": "USDC",
    "rsi1H": 59.1,
    "change24h": 0.01,
    "hasWarning": false
  },
  {
    "symbol": "MANA",
    "rsi1H": 58.8,
    "change24h": 0,
    "hasWarning": false
  },
  {
    "symbol": "PEPE",
    "rsi1H": 57,
    "change24h": 0,
    "hasWarning": false
  },
  {
    "symbol": "AAPLB",
    "rsi1H": 54.2,
    "change24h": -0.01,
    "hasWarning": false
  },
  {
    "symbol": "U",
    "rsi1H": 50,
    "change24h": -0.02,
    "hasWarning": false
  },
  {
    "symbol": "MRNAB",
    "rsi1H": 56.6,
    "change24h": -0.02,
    "hasWarning": false
  },
  {
    "symbol": "ATM",
    "rsi1H": 54.4,
    "change24h": -0.1,
    "hasWarning": false
  },
  {
    "symbol": "BCH",
    "rsi1H": 51.4,
    "change24h": -0.11,
    "hasWarning": false
  },
  {
    "symbol": "LPT",
    "rsi1H": 55.2,
    "change24h": -0.11,
    "hasWarning": false
  },
  {
    "symbol": "ORCLB",
    "rsi1H": 55.5,
    "change24h": -0.11,
    "hasWarning": false
  },
  {
    "symbol": "PEOPLE",
    "rsi1H": 50.6,
    "change24h": -0.12,
    "hasWarning": false
  },
  {
    "symbol": "BANANAS31",
    "rsi1H": 50.8,
    "change24h": -0.12,
    "hasWarning": false
  },
  {
    "symbol": "NMR",
    "rsi1H": 50.1,
    "change24h": -0.22,
    "hasWarning": false
  },
  {
    "symbol": "ASR",
    "rsi1H": 50.6,
    "change24h": -0.23,
    "hasWarning": false
  },
  {
    "symbol": "SIGN",
    "rsi1H": 50.1,
    "change24h": -0.39,
    "hasWarning": false
  },
  {
    "symbol": "NOM",
    "rsi1H": 50.2,
    "change24h": -0.4,
    "hasWarning": false
  },
  {
    "symbol": "CHZ",
    "rsi1H": 50.1,
    "change24h": -0.45,
    "hasWarning": false
  },
  {
    "symbol": "AXS",
    "rsi1H": 54.8,
    "change24h": -0.48,
    "hasWarning": false
  },
  {
    "symbol": "LAZIO",
    "rsi1H": 53.6,
    "change24h": -0.48,
    "hasWarning": false
  },
  {
    "symbol": "POWR",
    "rsi1H": 50.8,
    "change24h": -0.49,
    "hasWarning": false
  },
  {
    "symbol": "HOLO",
    "rsi1H": 52,
    "change24h": -0.65,
    "hasWarning": false
  },
  {
    "symbol": "CVX",
    "rsi1H": 52.4,
    "change24h": -0.67,
    "hasWarning": false
  },
  {
    "symbol": "API3",
    "rsi1H": 53.3,
    "change24h": -0.78,
    "hasWarning": false
  }
];

// 3. 🎯 Neutral Zone (137 100% verified Binance Spot pairs)
export const NEUTRAL_COINS: HeatmapCoin[] = [
  {
    "symbol": "CTSI",
    "rsi1H": 44.7,
    "change24h": 3.37,
    "hasWarning": false
  },
  {
    "symbol": "LA",
    "rsi1H": 49.9,
    "change24h": 2.59,
    "hasWarning": false
  },
  {
    "symbol": "IQ",
    "rsi1H": 47.3,
    "change24h": 2.38,
    "hasWarning": false
  },
  {
    "symbol": "STRAX",
    "rsi1H": 44.3,
    "change24h": 2.3,
    "hasWarning": false
  },
  {
    "symbol": "FLOW",
    "rsi1H": 47.5,
    "change24h": 1.98,
    "hasWarning": false
  },
  {
    "symbol": "KMNO",
    "rsi1H": 48.6,
    "change24h": 1.59,
    "hasWarning": false
  },
  {
    "symbol": "NIGHT",
    "rsi1H": 45.5,
    "change24h": 1.55,
    "hasWarning": false
  },
  {
    "symbol": "FOGO",
    "rsi1H": 47.2,
    "change24h": 1.49,
    "hasWarning": false
  },
  {
    "symbol": "LAYER",
    "rsi1H": 41.9,
    "change24h": 1.36,
    "hasWarning": false
  },
  {
    "symbol": "PENDLE",
    "rsi1H": 45.4,
    "change24h": 1.22,
    "hasWarning": false
  },
  {
    "symbol": "UMA",
    "rsi1H": 48.5,
    "change24h": 1.21,
    "hasWarning": false
  },
  {
    "symbol": "1000CHEEMS",
    "rsi1H": 45.6,
    "change24h": 1.16,
    "hasWarning": false
  },
  {
    "symbol": "ENSO",
    "rsi1H": 43.2,
    "change24h": 1.16,
    "hasWarning": false
  },
  {
    "symbol": "DEXE",
    "rsi1H": 48.9,
    "change24h": 1.02,
    "hasWarning": false
  },
  {
    "symbol": "AI",
    "rsi1H": 45.8,
    "change24h": 0.95,
    "hasWarning": false
  },
  {
    "symbol": "ONG",
    "rsi1H": 43.1,
    "change24h": 0.92,
    "hasWarning": false
  },
  {
    "symbol": "BERA",
    "rsi1H": 44.6,
    "change24h": 0.91,
    "hasWarning": false
  },
  {
    "symbol": "SPK",
    "rsi1H": 49.6,
    "change24h": 0.91,
    "hasWarning": false
  },
  {
    "symbol": "GAS",
    "rsi1H": 44.7,
    "change24h": 0.88,
    "hasWarning": false
  },
  {
    "symbol": "SSV",
    "rsi1H": 49.8,
    "change24h": 0.87,
    "hasWarning": false
  },
  {
    "symbol": "CYBER",
    "rsi1H": 42.9,
    "change24h": 0.86,
    "hasWarning": false
  },
  {
    "symbol": "ZKP",
    "rsi1H": 47.9,
    "change24h": 0.83,
    "hasWarning": false
  },
  {
    "symbol": "COOKIE",
    "rsi1H": 43.1,
    "change24h": 0.68,
    "hasWarning": false
  },
  {
    "symbol": "KAITO",
    "rsi1H": 43.7,
    "change24h": 0.67,
    "hasWarning": false
  },
  {
    "symbol": "MITO",
    "rsi1H": 46.4,
    "change24h": 0.67,
    "hasWarning": false
  },
  {
    "symbol": "NOT",
    "rsi1H": 48.6,
    "change24h": 0.64,
    "hasWarning": false
  },
  {
    "symbol": "ZRX",
    "rsi1H": 46.6,
    "change24h": 0.63,
    "hasWarning": false
  },
  {
    "symbol": "SC",
    "rsi1H": 42.8,
    "change24h": 0.61,
    "hasWarning": false
  },
  {
    "symbol": "PNUT",
    "rsi1H": 49.8,
    "change24h": 0.6,
    "hasWarning": false
  },
  {
    "symbol": "RARE",
    "rsi1H": 48.8,
    "change24h": 0.56,
    "hasWarning": false
  },
  {
    "symbol": "MORPHO",
    "rsi1H": 49.5,
    "change24h": 0.54,
    "hasWarning": false
  },
  {
    "symbol": "ETC",
    "rsi1H": 48.9,
    "change24h": 0.48,
    "hasWarning": false
  },
  {
    "symbol": "HAEDAL",
    "rsi1H": 48.1,
    "change24h": 0.46,
    "hasWarning": false
  },
  {
    "symbol": "QKC",
    "rsi1H": 41.2,
    "change24h": 0.45,
    "hasWarning": false
  },
  {
    "symbol": "AUDIO",
    "rsi1H": 45.5,
    "change24h": 0.42,
    "hasWarning": false
  },
  {
    "symbol": "ASTER",
    "rsi1H": 46.3,
    "change24h": 0.4,
    "hasWarning": false
  },
  {
    "symbol": "牛来",
    "rsi1H": 40.1,
    "change24h": 0.39,
    "hasWarning": false
  },
  {
    "symbol": "COTI",
    "rsi1H": 45.6,
    "change24h": 0.38,
    "hasWarning": false
  },
  {
    "symbol": "GENIUS",
    "rsi1H": 49.2,
    "change24h": 0.38,
    "hasWarning": false
  },
  {
    "symbol": "YGG",
    "rsi1H": 46.5,
    "change24h": 0.36,
    "hasWarning": false
  },
  {
    "symbol": "AGLD",
    "rsi1H": 41.1,
    "change24h": 0.35,
    "hasWarning": false
  },
  {
    "symbol": "AIXBT",
    "rsi1H": 46.8,
    "change24h": 0.33,
    "hasWarning": false
  },
  {
    "symbol": "ETH",
    "rsi1H": 45.6,
    "change24h": 0.27,
    "hasWarning": false
  },
  {
    "symbol": "WBETH",
    "rsi1H": 45.6,
    "change24h": 0.27,
    "hasWarning": false
  },
  {
    "symbol": "REZ",
    "rsi1H": 46.2,
    "change24h": 0.26,
    "hasWarning": false
  },
  {
    "symbol": "RIF",
    "rsi1H": 40.3,
    "change24h": 0.24,
    "hasWarning": false
  },
  {
    "symbol": "XVG",
    "rsi1H": 41.9,
    "change24h": 0.24,
    "hasWarning": false
  },
  {
    "symbol": "BARD",
    "rsi1H": 43.7,
    "change24h": 0.24,
    "hasWarning": false
  },
  {
    "symbol": "ORDI",
    "rsi1H": 45.9,
    "change24h": 0.23,
    "hasWarning": false
  },
  {
    "symbol": "OG",
    "rsi1H": 44.9,
    "change24h": 0.21,
    "hasWarning": false
  },
  {
    "symbol": "AEVO",
    "rsi1H": 48.9,
    "change24h": 0.15,
    "hasWarning": false
  },
  {
    "symbol": "ALT",
    "rsi1H": 43.3,
    "change24h": 0.13,
    "hasWarning": false
  },
  {
    "symbol": "CVC",
    "rsi1H": 46,
    "change24h": 0.12,
    "hasWarning": false
  },
  {
    "symbol": "RE",
    "rsi1H": 45.2,
    "change24h": 0.11,
    "hasWarning": false
  },
  {
    "symbol": "COW",
    "rsi1H": 49.1,
    "change24h": 0.07,
    "hasWarning": false
  },
  {
    "symbol": "EUR",
    "rsi1H": 48.5,
    "change24h": 0.03,
    "hasWarning": false
  },
  {
    "symbol": "USDE",
    "rsi1H": 44.2,
    "change24h": 0.01,
    "hasWarning": false
  },
  {
    "symbol": "USDS",
    "rsi1H": 44.2,
    "change24h": 0.01,
    "hasWarning": false
  },
  {
    "symbol": "NEXO",
    "rsi1H": 43.2,
    "change24h": 0,
    "hasWarning": false
  },
  {
    "symbol": "USD1",
    "rsi1H": 43.6,
    "change24h": -0.01,
    "hasWarning": false
  },
  {
    "symbol": "ZIL",
    "rsi1H": 42.7,
    "change24h": -0.03,
    "hasWarning": false
  },
  {
    "symbol": "BNT",
    "rsi1H": 45.2,
    "change24h": -0.06,
    "hasWarning": false
  },
  {
    "symbol": "KORUB",
    "rsi1H": 44.5,
    "change24h": -0.06,
    "hasWarning": false
  },
  {
    "symbol": "STEEM",
    "rsi1H": 47.9,
    "change24h": -0.08,
    "hasWarning": false
  },
  {
    "symbol": "DOGS",
    "rsi1H": 40.1,
    "change24h": -0.14,
    "hasWarning": false
  },
  {
    "symbol": "CETUS",
    "rsi1H": 41.4,
    "change24h": -0.15,
    "hasWarning": false
  },
  {
    "symbol": "SNX",
    "rsi1H": 41.5,
    "change24h": -0.17,
    "hasWarning": false
  },
  {
    "symbol": "GOOGLB",
    "rsi1H": 47.5,
    "change24h": -0.18,
    "hasWarning": false
  },
  {
    "symbol": "TRX",
    "rsi1H": 42.1,
    "change24h": -0.24,
    "hasWarning": false
  },
  {
    "symbol": "ZKC",
    "rsi1H": 45.6,
    "change24h": -0.24,
    "hasWarning": false
  },
  {
    "symbol": "SOL",
    "rsi1H": 43.6,
    "change24h": -0.25,
    "hasWarning": false
  },
  {
    "symbol": "AMP",
    "rsi1H": 44.3,
    "change24h": -0.31,
    "hasWarning": false
  },
  {
    "symbol": "BNSOL",
    "rsi1H": 44.2,
    "change24h": -0.32,
    "hasWarning": false
  },
  {
    "symbol": "SXT",
    "rsi1H": 41.4,
    "change24h": -0.32,
    "hasWarning": false
  },
  {
    "symbol": "LINK",
    "rsi1H": 45.1,
    "change24h": -0.35,
    "hasWarning": false
  },
  {
    "symbol": "BAR",
    "rsi1H": 40.7,
    "change24h": -0.35,
    "hasWarning": false
  },
  {
    "symbol": "KNC",
    "rsi1H": 45.5,
    "change24h": -0.36,
    "hasWarning": false
  },
  {
    "symbol": "LTC",
    "rsi1H": 46.6,
    "change24h": -0.39,
    "hasWarning": false
  },
  {
    "symbol": "SQQQB",
    "rsi1H": 40.2,
    "change24h": -0.39,
    "hasWarning": false
  },
  {
    "symbol": "KAT",
    "rsi1H": 42.3,
    "change24h": -0.43,
    "hasWarning": false
  },
  {
    "symbol": "UNI",
    "rsi1H": 48.3,
    "change24h": -0.46,
    "hasWarning": false
  },
  {
    "symbol": "XRP",
    "rsi1H": 45.3,
    "change24h": -0.49,
    "hasWarning": false
  },
  {
    "symbol": "LISTA",
    "rsi1H": 46.5,
    "change24h": -0.49,
    "hasWarning": false
  },
  {
    "symbol": "1INCH",
    "rsi1H": 42.3,
    "change24h": -0.51,
    "hasWarning": false
  },
  {
    "symbol": "SOXLB",
    "rsi1H": 47.7,
    "change24h": -0.51,
    "hasWarning": false
  },
  {
    "symbol": "DOGE",
    "rsi1H": 42.8,
    "change24h": -0.52,
    "hasWarning": false
  },
  {
    "symbol": "MEME",
    "rsi1H": 40.4,
    "change24h": -0.53,
    "hasWarning": false
  },
  {
    "symbol": "SHIB",
    "rsi1H": 46.6,
    "change24h": -0.55,
    "hasWarning": false
  },
  {
    "symbol": "CELR",
    "rsi1H": 42.3,
    "change24h": -0.57,
    "hasWarning": false
  },
  {
    "symbol": "RUNE",
    "rsi1H": 49,
    "change24h": -0.58,
    "hasWarning": false
  },
  {
    "symbol": "XNO",
    "rsi1H": 44.3,
    "change24h": -0.58,
    "hasWarning": false
  },
  {
    "symbol": "PROM",
    "rsi1H": 44.2,
    "change24h": -0.59,
    "hasWarning": false
  },
  {
    "symbol": "GLMR",
    "rsi1H": 40.1,
    "change24h": -0.61,
    "hasWarning": false
  },
  {
    "symbol": "DYDX",
    "rsi1H": 43.7,
    "change24h": -0.63,
    "hasWarning": false
  },
  {
    "symbol": "OPEN",
    "rsi1H": 47.9,
    "change24h": -0.63,
    "hasWarning": false
  },
  {
    "symbol": "TRUMP",
    "rsi1H": 45.4,
    "change24h": -0.64,
    "hasWarning": false
  },
  {
    "symbol": "OPN",
    "rsi1H": 46.3,
    "change24h": -0.64,
    "hasWarning": false
  },
  {
    "symbol": "THETA",
    "rsi1H": 42,
    "change24h": -0.66,
    "hasWarning": false
  },
  {
    "symbol": "FLOKI",
    "rsi1H": 45.8,
    "change24h": -0.69,
    "hasWarning": false
  },
  {
    "symbol": "ARPA",
    "rsi1H": 48.2,
    "change24h": -0.74,
    "hasWarning": false
  },
  {
    "symbol": "HBAR",
    "rsi1H": 48.2,
    "change24h": -0.79,
    "hasWarning": false
  },
  {
    "symbol": "KAVA",
    "rsi1H": 44.8,
    "change24h": -0.81,
    "hasWarning": false
  },
  {
    "symbol": "GIGGLE",
    "rsi1H": 46.5,
    "change24h": -0.83,
    "hasWarning": false
  },
  {
    "symbol": "BANANA",
    "rsi1H": 45.5,
    "change24h": -0.86,
    "hasWarning": false
  },
  {
    "symbol": "HOME",
    "rsi1H": 40.1,
    "change24h": -0.87,
    "hasWarning": false
  },
  {
    "symbol": "PORTAL",
    "rsi1H": 45,
    "change24h": -0.9,
    "hasWarning": false
  },
  {
    "symbol": "ME",
    "rsi1H": 40.3,
    "change24h": -0.92,
    "hasWarning": false
  },
  {
    "symbol": "RED",
    "rsi1H": 48.8,
    "change24h": -0.93,
    "hasWarning": false
  },
  {
    "symbol": "WCT",
    "rsi1H": 44.2,
    "change24h": -0.97,
    "hasWarning": false
  },
  {
    "symbol": "NXPC",
    "rsi1H": 40.6,
    "change24h": -1,
    "hasWarning": false
  },
  {
    "symbol": "SCR",
    "rsi1H": 44.2,
    "change24h": -1.02,
    "hasWarning": false
  },
  {
    "symbol": "CHR",
    "rsi1H": 42.7,
    "change24h": -1.03,
    "hasWarning": false
  },
  {
    "symbol": "LUNA",
    "rsi1H": 49.6,
    "change24h": -1.05,
    "hasWarning": false
  },
  {
    "symbol": "SLP",
    "rsi1H": 41.4,
    "change24h": -1.07,
    "hasWarning": false
  },
  {
    "symbol": "XAI",
    "rsi1H": 44.7,
    "change24h": -1.07,
    "hasWarning": false
  },
  {
    "symbol": "1000CAT",
    "rsi1H": 42.4,
    "change24h": -1.07,
    "hasWarning": false
  },
  {
    "symbol": "USTC",
    "rsi1H": 42.9,
    "change24h": -1.1,
    "hasWarning": false
  },
  {
    "symbol": "LQTY",
    "rsi1H": 41.9,
    "change24h": -1.12,
    "hasWarning": false
  },
  {
    "symbol": "OPG",
    "rsi1H": 42.6,
    "change24h": -1.2,
    "hasWarning": false
  },
  {
    "symbol": "SUI",
    "rsi1H": 42,
    "change24h": -1.22,
    "hasWarning": false
  },
  {
    "symbol": "TOWNS",
    "rsi1H": 40.8,
    "change24h": -1.24,
    "hasWarning": false
  },
  {
    "symbol": "ILV",
    "rsi1H": 46.2,
    "change24h": -1.25,
    "hasWarning": false
  },
  {
    "symbol": "DOT",
    "rsi1H": 41.5,
    "change24h": -1.28,
    "hasWarning": false
  },
  {
    "symbol": "LDO",
    "rsi1H": 49.5,
    "change24h": -1.31,
    "hasWarning": false
  },
  {
    "symbol": "FIL",
    "rsi1H": 46.9,
    "change24h": -1.38,
    "hasWarning": false
  },
  {
    "symbol": "PORTO",
    "rsi1H": 40,
    "change24h": -1.5,
    "hasWarning": false
  },
  {
    "symbol": "TREE",
    "rsi1H": 46,
    "change24h": -1.52,
    "hasWarning": false
  },
  {
    "symbol": "IMX",
    "rsi1H": 41.6,
    "change24h": -1.61,
    "hasWarning": false
  },
  {
    "symbol": "ONDO",
    "rsi1H": 46.3,
    "change24h": -1.64,
    "hasWarning": false
  },
  {
    "symbol": "QI",
    "rsi1H": 44.1,
    "change24h": -1.84,
    "hasWarning": false
  },
  {
    "symbol": "ENJ",
    "rsi1H": 41.1,
    "change24h": -1.94,
    "hasWarning": false
  },
  {
    "symbol": "SKL",
    "rsi1H": 41.9,
    "change24h": -2.18,
    "hasWarning": false
  },
  {
    "symbol": "JOE",
    "rsi1H": 40.7,
    "change24h": -2.54,
    "hasWarning": false
  },
  {
    "symbol": "ENS",
    "rsi1H": 42.1,
    "change24h": -2.68,
    "hasWarning": false
  },
  {
    "symbol": "QNT",
    "rsi1H": 45.8,
    "change24h": -2.71,
    "hasWarning": false
  },
  {
    "symbol": "SAND",
    "rsi1H": 40,
    "change24h": -3.26,
    "hasWarning": false
  },
  {
    "symbol": "MAV",
    "rsi1H": 41.8,
    "change24h": -4.01,
    "hasWarning": false
  }
];

// 4. 💎 Hidden Bullish Zone (84 100% verified Binance Spot pairs)
export const HIDDEN_BULL_COINS: HeatmapCoin[] = [
  {
    "symbol": "T",
    "rsi1H": 39.1,
    "change24h": 0.93,
    "hasWarning": false
  },
  {
    "symbol": "CGPT",
    "rsi1H": 38.4,
    "change24h": 0.13,
    "hasWarning": false
  },
  {
    "symbol": "STO",
    "rsi1H": 39.5,
    "change24h": 0,
    "hasWarning": false
  },
  {
    "symbol": "BFUSD",
    "rsi1H": 36.8,
    "change24h": -0.03,
    "hasWarning": false
  },
  {
    "symbol": "TUSD",
    "rsi1H": 32.4,
    "change24h": -0.04,
    "hasWarning": false
  },
  {
    "symbol": "ZAMA",
    "rsi1H": 38.2,
    "change24h": -0.07,
    "hasWarning": false
  },
  {
    "symbol": "SUN",
    "rsi1H": 35.2,
    "change24h": -0.3,
    "hasWarning": false
  },
  {
    "symbol": "SPELL",
    "rsi1H": 38.8,
    "change24h": -0.42,
    "hasWarning": false
  },
  {
    "symbol": "MARSCOIN",
    "rsi1H": 38.3,
    "change24h": -0.43,
    "hasWarning": false
  },
  {
    "symbol": "TKO",
    "rsi1H": 38.3,
    "change24h": -0.69,
    "hasWarning": false
  },
  {
    "symbol": "GRAM",
    "rsi1H": 37.5,
    "change24h": -0.69,
    "hasWarning": false
  },
  {
    "symbol": "HOT",
    "rsi1H": 36.1,
    "change24h": -0.71,
    "hasWarning": false
  },
  {
    "symbol": "USUAL",
    "rsi1H": 36.3,
    "change24h": -0.72,
    "hasWarning": false
  },
  {
    "symbol": "XVS",
    "rsi1H": 36.5,
    "change24h": -0.74,
    "hasWarning": false
  },
  {
    "symbol": "KERNEL",
    "rsi1H": 39.4,
    "change24h": -0.79,
    "hasWarning": false
  },
  {
    "symbol": "ID",
    "rsi1H": 39.9,
    "change24h": -0.8,
    "hasWarning": false
  },
  {
    "symbol": "BREV",
    "rsi1H": 38.7,
    "change24h": -0.8,
    "hasWarning": false
  },
  {
    "symbol": "IOTX",
    "rsi1H": 36.8,
    "change24h": -0.81,
    "hasWarning": false
  },
  {
    "symbol": "ALPINE",
    "rsi1H": 39.9,
    "change24h": -0.82,
    "hasWarning": false
  },
  {
    "symbol": "SAGA",
    "rsi1H": 35.9,
    "change24h": -0.86,
    "hasWarning": false
  },
  {
    "symbol": "TURBO",
    "rsi1H": 35.8,
    "change24h": -0.9,
    "hasWarning": false
  },
  {
    "symbol": "MINA",
    "rsi1H": 36.5,
    "change24h": -0.94,
    "hasWarning": false
  },
  {
    "symbol": "RAD",
    "rsi1H": 37,
    "change24h": -0.97,
    "hasWarning": false
  },
  {
    "symbol": "GNO",
    "rsi1H": 35.7,
    "change24h": -1.03,
    "hasWarning": false
  },
  {
    "symbol": "ACM",
    "rsi1H": 34.6,
    "change24h": -1.05,
    "hasWarning": false
  },
  {
    "symbol": "SHELL",
    "rsi1H": 38.4,
    "change24h": -1.12,
    "hasWarning": false
  },
  {
    "symbol": "CITY",
    "rsi1H": 36.5,
    "change24h": -1.13,
    "hasWarning": false
  },
  {
    "symbol": "GPS",
    "rsi1H": 33.2,
    "change24h": -1.14,
    "hasWarning": false
  },
  {
    "symbol": "HMSTR",
    "rsi1H": 37.2,
    "change24h": -1.16,
    "hasWarning": false
  },
  {
    "symbol": "A",
    "rsi1H": 38.6,
    "change24h": -1.16,
    "hasWarning": false
  },
  {
    "symbol": "WAXP",
    "rsi1H": 37.5,
    "change24h": -1.2,
    "hasWarning": false
  },
  {
    "symbol": "GMT",
    "rsi1H": 37.8,
    "change24h": -1.26,
    "hasWarning": false
  },
  {
    "symbol": "SAPIEN",
    "rsi1H": 39.9,
    "change24h": -1.27,
    "hasWarning": false
  },
  {
    "symbol": "ESP",
    "rsi1H": 31,
    "change24h": -1.27,
    "hasWarning": false
  },
  {
    "symbol": "TST",
    "rsi1H": 38.5,
    "change24h": -1.28,
    "hasWarning": false
  },
  {
    "symbol": "ONE",
    "rsi1H": 34.2,
    "change24h": -1.35,
    "hasWarning": false
  },
  {
    "symbol": "GUN",
    "rsi1H": 39,
    "change24h": -1.36,
    "hasWarning": false
  },
  {
    "symbol": "G",
    "rsi1H": 34.9,
    "change24h": -1.39,
    "hasWarning": false
  },
  {
    "symbol": "GLM",
    "rsi1H": 36.4,
    "change24h": -1.41,
    "hasWarning": false
  },
  {
    "symbol": "ANKR",
    "rsi1H": 39.8,
    "change24h": -1.44,
    "hasWarning": false
  },
  {
    "symbol": "PSG",
    "rsi1H": 37,
    "change24h": -1.51,
    "hasWarning": false
  },
  {
    "symbol": "ONT",
    "rsi1H": 35.7,
    "change24h": -1.55,
    "hasWarning": false
  },
  {
    "symbol": "AXTIB",
    "rsi1H": 35,
    "change24h": -1.57,
    "hasWarning": false
  },
  {
    "symbol": "W",
    "rsi1H": 36.8,
    "change24h": -1.59,
    "hasWarning": false
  },
  {
    "symbol": "JST",
    "rsi1H": 30.9,
    "change24h": -1.61,
    "hasWarning": false
  },
  {
    "symbol": "ACE",
    "rsi1H": 33.8,
    "change24h": -1.69,
    "hasWarning": false
  },
  {
    "symbol": "BIGTIME",
    "rsi1H": 35.4,
    "change24h": -1.75,
    "hasWarning": false
  },
  {
    "symbol": "AIGENSYN",
    "rsi1H": 30.5,
    "change24h": -1.78,
    "hasWarning": false
  },
  {
    "symbol": "HEI",
    "rsi1H": 30.6,
    "change24h": -1.86,
    "hasWarning": false
  },
  {
    "symbol": "NEIRO",
    "rsi1H": 37.4,
    "change24h": -1.89,
    "hasWarning": false
  },
  {
    "symbol": "TLM",
    "rsi1H": 37.3,
    "change24h": -1.92,
    "hasWarning": false
  },
  {
    "symbol": "TUT",
    "rsi1H": 38.2,
    "change24h": -1.97,
    "hasWarning": false
  },
  {
    "symbol": "MET",
    "rsi1H": 37.6,
    "change24h": -1.98,
    "hasWarning": false
  },
  {
    "symbol": "GMX",
    "rsi1H": 32.8,
    "change24h": -2,
    "hasWarning": false
  },
  {
    "symbol": "TWT",
    "rsi1H": 33.6,
    "change24h": -2.01,
    "hasWarning": false
  },
  {
    "symbol": "GNS",
    "rsi1H": 38.7,
    "change24h": -2.01,
    "hasWarning": false
  },
  {
    "symbol": "THE",
    "rsi1H": 35.3,
    "change24h": -2.02,
    "hasWarning": false
  },
  {
    "symbol": "ALLO",
    "rsi1H": 33.9,
    "change24h": -2.03,
    "hasWarning": false
  },
  {
    "symbol": "PENGU",
    "rsi1H": 33.9,
    "change24h": -2.04,
    "hasWarning": false
  },
  {
    "symbol": "EGLD",
    "rsi1H": 32.6,
    "change24h": -2.06,
    "hasWarning": false
  },
  {
    "symbol": "SANTOS",
    "rsi1H": 37.8,
    "change24h": -2.1,
    "hasWarning": false
  },
  {
    "symbol": "JUV",
    "rsi1H": 31.7,
    "change24h": -2.11,
    "hasWarning": false
  },
  {
    "symbol": "BROCCOLI714",
    "rsi1H": 37.8,
    "change24h": -2.18,
    "hasWarning": false
  },
  {
    "symbol": "KITE",
    "rsi1H": 34.4,
    "change24h": -2.32,
    "hasWarning": false
  },
  {
    "symbol": "RAY",
    "rsi1H": 39,
    "change24h": -2.36,
    "hasWarning": false
  },
  {
    "symbol": "PYTH",
    "rsi1H": 33.9,
    "change24h": -2.38,
    "hasWarning": false
  },
  {
    "symbol": "SOPH",
    "rsi1H": 33.8,
    "change24h": -2.47,
    "hasWarning": false
  },
  {
    "symbol": "ADA",
    "rsi1H": 36.2,
    "change24h": -2.59,
    "hasWarning": false
  },
  {
    "symbol": "FIDA",
    "rsi1H": 37,
    "change24h": -2.72,
    "hasWarning": false
  },
  {
    "symbol": "DIA",
    "rsi1H": 38,
    "change24h": -2.85,
    "hasWarning": false
  },
  {
    "symbol": "AAVE",
    "rsi1H": 34.3,
    "change24h": -2.85,
    "hasWarning": false
  },
  {
    "symbol": "RESOLV",
    "rsi1H": 35.2,
    "change24h": -2.93,
    "hasWarning": false
  },
  {
    "symbol": "DCR",
    "rsi1H": 30.6,
    "change24h": -3.09,
    "hasWarning": false
  },
  {
    "symbol": "CFG",
    "rsi1H": 36.9,
    "change24h": -3.11,
    "hasWarning": false
  },
  {
    "symbol": "PHA",
    "rsi1H": 39.5,
    "change24h": -3.45,
    "hasWarning": false
  },
  {
    "symbol": "ADX",
    "rsi1H": 36,
    "change24h": -3.51,
    "hasWarning": false
  },
  {
    "symbol": "FLUX",
    "rsi1H": 31.7,
    "change24h": -3.54,
    "hasWarning": false
  },
  {
    "symbol": "MOVR",
    "rsi1H": 33.2,
    "change24h": -3.56,
    "hasWarning": false
  },
  {
    "symbol": "BABY",
    "rsi1H": 32.7,
    "change24h": -3.78,
    "hasWarning": false
  },
  {
    "symbol": "DGB",
    "rsi1H": 35.4,
    "change24h": -3.83,
    "hasWarning": false
  },
  {
    "symbol": "LSK",
    "rsi1H": 30,
    "change24h": -4.01,
    "hasWarning": false
  },
  {
    "symbol": "MUBARAK",
    "rsi1H": 38.9,
    "change24h": -4.13,
    "hasWarning": false
  },
  {
    "symbol": "TURTLE",
    "rsi1H": 30.3,
    "change24h": -4.3,
    "hasWarning": false
  },
  {
    "symbol": "ERA",
    "rsi1H": 30.4,
    "change24h": -7.24,
    "hasWarning": false
  }
];

// 5. 🌊 Oversold Zone (14 100% verified Binance Spot pairs)
export const OVERSOLD_COINS: HeatmapCoin[] = [
  {
    "symbol": "QUICK",
    "rsi1H": 29.7,
    "change24h": -2.16,
    "hasWarning": false
  },
  {
    "symbol": "RPL",
    "rsi1H": 29.7,
    "change24h": -2.53,
    "hasWarning": false
  },
  {
    "symbol": "AVA",
    "rsi1H": 27,
    "change24h": -3.75,
    "hasWarning": false
  },
  {
    "symbol": "STX",
    "rsi1H": 26.9,
    "change24h": -3.83,
    "hasWarning": false
  },
  {
    "symbol": "OGN",
    "rsi1H": 28.3,
    "change24h": -4.22,
    "hasWarning": false
  },
  {
    "symbol": "BMT",
    "rsi1H": 26.3,
    "change24h": -4.43,
    "hasWarning": false
  },
  {
    "symbol": "MMT",
    "rsi1H": 29,
    "change24h": -4.7,
    "hasWarning": false
  },
  {
    "symbol": "ARK",
    "rsi1H": 26.5,
    "change24h": -4.91,
    "hasWarning": false
  },
  {
    "symbol": "KAIA",
    "rsi1H": 28,
    "change24h": -4.99,
    "hasWarning": false
  },
  {
    "symbol": "BICO",
    "rsi1H": 27.1,
    "change24h": -5.02,
    "hasWarning": false
  },
  {
    "symbol": "PIXEL",
    "rsi1H": 28.7,
    "change24h": -7.03,
    "hasWarning": false
  },
  {
    "symbol": "ORCA",
    "rsi1H": 23.5,
    "change24h": -7.22,
    "hasWarning": false
  },
  {
    "symbol": "GTC",
    "rsi1H": 28.5,
    "change24h": -7.49,
    "hasWarning": false
  },
  {
    "symbol": "RVN",
    "rsi1H": 23,
    "change24h": -10.15,
    "hasWarning": false
  }
];

// 6. ⚠️ Extreme Zone (0 100% verified Binance Spot pairs)
export const EXTREME_COINS: HeatmapCoin[] = [];
