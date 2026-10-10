# Backtesting & Replay Verification Reference

## Zero Look-Ahead Bias Engine

The backtesting engine walks forward strictly bar-by-bar:
- Decision at bar $T$ only has access to candle history $\le T$.
- Next bar $T+1$ open price is used for execution fill price with modeled slippage (0.05%).
- High and Low prices of subsequent bars evaluate +1% Target hit vs Stop Loss.
- Fees (0.1% maker/taker) are deducted from Gross PnL to determine Net Realized PnL.

## Candle-by-Candle Historical Replay

The `/replay` view enables stepping through historical market data bar-by-bar to observe exact indicator outputs, strategy state changes, and signal decisions for post-mortem analysis.
