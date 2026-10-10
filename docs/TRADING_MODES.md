# Trading Modes (Analysis, Paper, Live)

The platform supports 3 distinct operating modes:

## MODE 1: ANALYSIS (Default)
- No orders placed.
- Full market surveillance across Binance spot pairs.
- Real-time candle ingestion, technical analysis, and signal generation.
- Complete step-by-step reasoning proofs displayed in the UI.

## MODE 2: PAPER TRADING
- Virtual capital ($10,000 USD initial balance).
- Follows the identical execution pipeline as live trading.
- Automatically calculates +1% target price, fills simulated orders with slippage, monitors unrealized PnL, exits at target, and logs to the immutable trade journal.

## MODE 3: LIVE TRADING
- Strictly disabled by default.
- Requires explicit API key validation and user confirmation modal.
- Evaluates risk checks (max position size, duplicate guard, daily loss limit, cooldown).
- Routes orders directly to Binance Spot API.
- Zero withdrawal permissions requested.
