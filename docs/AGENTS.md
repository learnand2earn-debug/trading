# Autonomous Agent Architecture Reference (34 Agents)

The platform runs 34 dedicated, observable agents adhering to strict separation of concerns.

## 1. Data Agents (1–3)
- **Agt-1: Binance Data Agent**: Ingests public REST tickers, historical klines, and WebSocket streams.
- **Agt-2: CoinGlass Data Agent**: Queries 12h/24h liquidity heatmaps; manages `DATA_STALE` states.
- **Agt-3: Data Validation Agent**: Validates OHLC integrity, detects duplicate/missing candles, out-of-order timestamps, and flags stale data.

## 2. Analysis Agents (4–11)
- **Agt-4: Trend Agent**: Multi-timeframe trend detector (UPTREND, DOWNTREND, SIDEWAYS).
- **Agt-5: Market Structure Agent**: Analyzes swing highs, swing lows, and range expansions.
- **Agt-6: RSI Agent**: Calculates Wilder's RSI (14) and evaluates 30M leadership progression.
- **Agt-7: EMA Agent**: Calculates EMA 9 and EMA 33, detects crossovers and retest scenarios.
- **Agt-8: V1 Agent**: Manages Smoothed Heiken Ashi V1 state machine (Green, Transparent, Red).
- **Agt-9: Liquidity Agent**: Maps order book clusters and liquidity pools relative to current price.
- **Agt-10: Order Block Agent**: Identifies Bullish Order Block zones (3+ green preceded by red candle).
- **Agt-11: ICT Structure Agent**: Evaluates green/red candle sequences and trendline interactions.

## 3. Strategy Agents (12–18)
- **Agt-12: Price Action Agent**: Implements Strategy 1 source rules.
- **Agt-13: V1 Strategy Agent**: Implements Strategy 2 source rules (1D mandatory UP).
- **Agt-14: Gainers Strategy Agent**: Implements Strategy 3 source rules (~40% pump, 3 pairs, not monitored).
- **Agt-15: Hidden Bullish Agent**: Implements Strategy 4 custom 10-candle drop methodology.
- **Agt-16: V1 + EMA Agent**: Implements Strategy 5 bullish EMA cross and retest.
- **Agt-17: OB Strategy Agent**: Implements Strategy 6 1H OB identification and 15M retest confirmation.
- **Agt-18: ICT Strategy Agent**: Implements Strategy 7 non-sideways 1H trend rule.

## 4. Decision Agents (19–21)
- **Agt-19: Confluence Agent**: Detects multi-strategy confluence on candidate symbols.
- **Agt-20: Risk Agent**: Enforces position sizing, max concurrent trades, daily loss limit, and symbol cooldowns.
- **Agt-21: Signal Agent**: Formats and publishes verified signals with +1% profit targets.

## 5. Execution Agents (22–25)
- **Agt-22: Paper Trading Agent**: Executes simulated fills on paper desk.
- **Agt-23: Binance Execution Agent**: Routes live orders when live mode is safely enabled.
- **Agt-24: Position Monitor Agent**: Tracks active positions against live tick updates.
- **Agt-25: Exit Agent**: Executes exits immediately when +1% target is reached, then triggers rescan.

## 6. Intelligence Agents (26–28)
- **Agt-26: Research Agent**: Generates research proposals; sandboxed from production strategy engines.
- **Agt-27: Command Agent**: Parses natural language terminal commands into structured actions.
- **Agt-28: Explanation Agent**: Generates deterministic, step-by-step reasoning proofs for every signal.

## 7. Operations Agents (29–34)
- **Agt-29: Notification Agent**: Dispatches in-app, email, and Telegram alerts.
- **Agt-30: Journal Agent**: Permanently logs trade audit records with indicator snapshots.
- **Agt-31: Backtest Agent**: Runs historical backtests without look-ahead bias.
- **Agt-32: Replay Agent**: Coordinates candle-by-candle market replays.
- **Agt-33: Performance Agent**: Computes win rates, PnL, drawdowns, and holding times.
- **Agt-34: Health Monitoring Agent**: Observes system latencies, error counts, and heartbeats.
