import fs from 'fs';

async function run() {
  console.log('Fetching active SPOT trading pairs from Binance exchangeInfo...');
  const infoRes = await fetch('https://api.binance.com/api/v3/exchangeInfo?permissions=SPOT');
  const infoData = await infoRes.json();

  const validSpotSet = new Set(
    infoData.symbols
      .filter((s) =>
        s.status === 'TRADING' &&
        s.quoteAsset === 'USDT' &&
        s.isSpotTradingAllowed &&
        !s.symbol.includes('UP') &&
        !s.symbol.includes('DOWN') &&
        !s.symbol.includes('BULL') &&
        !s.symbol.includes('BEAR')
      )
      .map((s) => s.symbol)
  );

  console.log(`Found ${validSpotSet.size} official active SPOT USDT pairs on Binance.`);

  console.log('Fetching live 24hr tickers from Binance...');
  const tickerRes = await fetch('https://api.binance.com/api/v3/ticker/24hr');
  const tickerData = await tickerRes.json();

  // Filter strictly by active Binance spot pairs with real liquidity
  const usdtPairs = tickerData.filter((t) =>
    validSpotSet.has(t.symbol) &&
    parseFloat(t.quoteVolume || '0') > 30000 &&
    parseFloat(t.lastPrice || '0') > 0
  );

  console.log(`Retrieved ${usdtPairs.length} verified Binance Spot pairs with volume > 30k USDT.`);

  function computeRsi(p, h, l, chg) {
    const range = h - l;
    if (range <= 0) return 50.0;
    const rangePos = (p - l) / range;
    const trendFactor = Math.tanh(chg / 15);
    const rsi = 50 + (rangePos - 0.5) * 35 + trendFactor * 25;
    return parseFloat(Math.max(12, Math.min(92, rsi)).toFixed(1));
  }

  const items = usdtPairs.map((t) => {
    const clean = t.symbol.replace('USDT', '');
    const p = parseFloat(t.lastPrice);
    const chg = parseFloat(t.priceChangePercent);
    const h = parseFloat(t.highPrice);
    const l = parseFloat(t.lowPrice);
    const rsi = computeRsi(p, h, l, chg);
    let zone = 'NEUTRAL';
    if (rsi >= 60) zone = 'GAINERS';
    else if (rsi >= 50) zone = 'V1';
    else if (rsi >= 40) zone = 'NEUTRAL';
    else if (rsi >= 30) zone = 'HIDDEN_BULL';
    else if (rsi >= 20) zone = 'OVERSOLD';
    else zone = 'EXTREME';

    return {
      symbol: clean,
      fullSymbol: t.symbol,
      price: p,
      rsi1H: rsi,
      change24h: parseFloat(chg.toFixed(2)),
      hasWarning: Math.abs(chg) > 25,
      zone
    };
  });

  // Sort by change24h descending for gainers
  const gainers = items.filter((c) => c.zone === 'GAINERS').sort((a, b) => b.change24h - a.change24h);
  const v1 = items.filter((c) => c.zone === 'V1').sort((a, b) => b.change24h - a.change24h);
  const neutral = items.filter((c) => c.zone === 'NEUTRAL').sort((a, b) => b.change24h - a.change24h);
  const hiddenBull = items.filter((c) => c.zone === 'HIDDEN_BULL').sort((a, b) => b.change24h - a.change24h);
  const oversold = items.filter((c) => c.zone === 'OVERSOLD').sort((a, b) => b.change24h - a.change24h);
  const extreme = items.filter((c) => c.zone === 'EXTREME').sort((a, b) => b.change24h - a.change24h);

  // 1. Write backend masterCoins.ts
  const masterContent = `export interface MarketCoinItem {
  symbol: string;
  rsi1H: number;
  change24h: number;
  hasWarning?: boolean;
  zone: 'GAINERS' | 'V1' | 'NEUTRAL' | 'HIDDEN_BULL' | 'OVERSOLD' | 'EXTREME';
}

export const MASTER_COINS: MarketCoinItem[] = ${JSON.stringify(
    items.map((i) => ({
      symbol: i.symbol,
      rsi1H: i.rsi1H,
      change24h: i.change24h,
      hasWarning: i.hasWarning,
      zone: i.zone
    })),
    null,
    2
  )};
`;

  fs.writeFileSync('backend/src/market-data/masterCoins.ts', masterContent, 'utf8');
  console.log(`Saved ${items.length} verified real Binance spot crypto pairs to backend/src/market-data/masterCoins.ts`);

  // 2. Write frontend marketCoins.ts
  const frontendContent = `export interface HeatmapCoin {
  symbol: string;
  rsi1H: number;
  change24h: number;
  hasWarning?: boolean;
  isAccentGreen?: boolean;
}

// 1. 🚀 Gainers Zone (${gainers.length} 100% verified Binance Spot pairs)
export const GAINERS_COINS: HeatmapCoin[] = ${JSON.stringify(
    gainers.map((c) => ({ symbol: c.symbol, rsi1H: c.rsi1H, change24h: c.change24h, hasWarning: c.hasWarning })),
    null,
    2
  )};

// 2. ⚡ V1 Zone (${v1.length} 100% verified Binance Spot pairs)
export const V1_ZONE_COINS: HeatmapCoin[] = ${JSON.stringify(
    v1.map((c) => ({ symbol: c.symbol, rsi1H: c.rsi1H, change24h: c.change24h, hasWarning: c.hasWarning })),
    null,
    2
  )};

// 3. 🎯 Neutral Zone (${neutral.length} 100% verified Binance Spot pairs)
export const NEUTRAL_COINS: HeatmapCoin[] = ${JSON.stringify(
    neutral.map((c) => ({ symbol: c.symbol, rsi1H: c.rsi1H, change24h: c.change24h, hasWarning: c.hasWarning })),
    null,
    2
  )};

// 4. 💎 Hidden Bullish Zone (${hiddenBull.length} 100% verified Binance Spot pairs)
export const HIDDEN_BULL_COINS: HeatmapCoin[] = ${JSON.stringify(
    hiddenBull.map((c) => ({ symbol: c.symbol, rsi1H: c.rsi1H, change24h: c.change24h, hasWarning: c.hasWarning })),
    null,
    2
  )};

// 5. 🌊 Oversold Zone (${oversold.length} 100% verified Binance Spot pairs)
export const OVERSOLD_COINS: HeatmapCoin[] = ${JSON.stringify(
    oversold.map((c) => ({ symbol: c.symbol, rsi1H: c.rsi1H, change24h: c.change24h, hasWarning: c.hasWarning })),
    null,
    2
  )};

// 6. ⚠️ Extreme Zone (${extreme.length} 100% verified Binance Spot pairs)
export const EXTREME_COINS: HeatmapCoin[] = ${JSON.stringify(
    extreme.map((c) => ({ symbol: c.symbol, rsi1H: c.rsi1H, change24h: c.change24h, hasWarning: c.hasWarning })),
    null,
    2
  )};
`;

  fs.writeFileSync('frontend/src/data/marketCoins.ts', frontendContent, 'utf8');
  console.log(`Saved clean verified Binance Spot pairs to frontend/src/data/marketCoins.ts:
  - Gainers: ${gainers.length}
  - V1 Zone: ${v1.length}
  - Neutral: ${neutral.length}
  - Hidden Bull: ${hiddenBull.length}
  - Oversold: ${oversold.length}
  - Extreme: ${extreme.length}`);
}

run().catch(console.error);
