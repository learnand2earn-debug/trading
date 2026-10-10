# The 7 Source Trading Strategies Reference

Treat the uploaded handwritten trading methodology as the **PRIMARY SOURCE OF TRUTH**.
Textbook definitions have NOT been silently substituted.

---

## Strategy 1: Price Action
- **Step 1 — 1D Trend**: Must be `UPTREND` or `SIDEWAYS`. (Downtrend is not a valid source condition; configurable only as optional confluence).
- **Step 2 — 1H Support & Resistance**: Pivot detection, clustering into zones. Valid support bounce required.
- **Step 3 — CoinGlass Liquidity**: 12h or 24h heatmap check. If unavailable or stale: returns `DATA_STALE` / `DATA_UNAVAILABLE` and halts signal.
- **Step 4 — 1H RSI**: Must be inside buying zone `[25, 40]`.
- **Step 5 — 30M RSI Leadership**: 30M RSI must positively lead/confirm 1H RSI slope.
- **Target**: +1% profit (Gross vs Net after fees).

---

## Strategy 2: V1 Method
- **1D Trend**: Mandatory `UPTREND`. (Mandatory according to source).
- **1H Trend**: `UPTREND` or `SIDEWAYS`.
- **RSI**: Upward cross through level 54 (`prev < 54 && curr >= 54`).
- **V1 Indicator**: Smoothed Heiken Ashi Candles V1. State must be `GREEN` or `TRANSPARENT`. Red is prohibited.
- **30M RSI Leadership**: Positive progression (e.g. 54 -> 55 -> 56 while 1H is ~53).
- **Target**: +1% profit.

---

## Strategy 3: Gainers Method
- **Binance Top 7 Gainers**: Focuses on top 7 gainers (configurable count).
- **Trading Pairs**: Must have 3 relevant pairs (e.g. USDT, USDC, FDUSD).
- **~40% Pump**: Explicit measurement formula displayed in explanation.
- **Post-Pump Condition**: Orderly consolidation, sellers not completely inactive (ambiguous source rule).
- **Restrictions**: Not new, not delisting, and **"Monitoring mai na ho"** (strictly **NOT under Binance monitoring** tag).
- **Target**: +1% profit. Rescan immediately after trade close.

---

## Strategy 4: Hidden Bullish
- **IMPORTANT**: Custom source definition; NOT textbook divergence!
- **1H Candle History**: Inspects previous ~10 candles for downward movement structure followed by upward price reaction.
- **RSI Buying Zone**: 1H RSI in `[25, 40]`.
- **30M RSI Leadership**: Positive slope confirmation.
- **Target**: +1% profit.

---

## Strategy 5: V1 + EMA
- **Base Conditions**: All V1 requirements active.
- **EMAs**: EMA 9 (Blue, Close) + EMA 33 (Yellow, Close).
- **EMA Bullish Cross**: EMA 9 crossing above EMA 33.
- **Retest Scenarios**:
  - *Scenario A*: Fresh cross, candle pulls back to touch EMA 9, closes bullish.
  - *Scenario B*: Price already above EMA 9, candle/wick touches EMA 9, green candle forms.
- **Target**: +1% profit.

---

## Strategy 6: OB Method (Bullish Order Block)
- **Source OB Formation**:
  1. Market makes a strong pump.
  2. 3 or more consecutive green candles.
  3. Identify red candle immediately before sequence.
  4. Red candle zone `[low, high]` becomes the Bullish Order Block.
- **Timeframes**: 1H identification, 15M confirmation/retest check.
- **Retest**: Price touches OB zone and confirms with a bullish close.
- **Target**: +1% profit.

---

## Strategy 7: ICT Method
- **1H RSI**: Buying zone `[30, 40]`.
- **Candle Relationship**: Current candle green, candle immediately prior must be red.
- **Previous Green Candles**: 2 or 3 green candles with ~1% pump pattern.
- **Trend Line Condition**: Marked as **AMBIGUOUS SOURCE RULE** with Admin selector (Breakout vs Support Bounce).
- **1H Trend**: Must be `UPTREND` or `DOWNTREND`. **Sideways is strictly rejected**.
- **Target**: +1% profit.
