import fs from 'fs';

async function run() {
  const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
  const data = await res.json();
  const usdtPairs = data.filter((t) => 
    t.symbol &&
    t.symbol.endsWith('USDT') &&
    !t.symbol.includes('UP') &&
    !t.symbol.includes('DOWN') &&
    !t.symbol.includes('BULL') &&
    !t.symbol.includes('BEAR') &&
    parseFloat(t.quoteVolume || '0') > 30000
  );

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
      rsi1H: rsi,
      change24h: parseFloat(chg.toFixed(2)),
      hasWarning: Math.abs(chg) > 25,
      zone
    };
  });

  const content = `export interface MarketCoinItem {
  symbol: string;
  rsi1H: number;
  change24h: number;
  hasWarning?: boolean;
  zone: 'GAINERS' | 'V1' | 'NEUTRAL' | 'HIDDEN_BULL' | 'OVERSOLD' | 'EXTREME';
}

export const MASTER_COINS: MarketCoinItem[] = ${JSON.stringify(items, null, 2)};
`;

  fs.writeFileSync('backend/src/market-data/masterCoins.ts', content, 'utf8');
  console.log(`Saved ${items.length} verified real Binance spot crypto pairs to masterCoins.ts`);
}

run().catch(console.error);
