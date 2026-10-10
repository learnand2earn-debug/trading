# Admin Panel & Visual Rule Builder Guide

## Visual Strategy Rule Builder

The Visual Rule Builder generates machine-readable conditions for strategy execution without arbitrary code execution vulnerabilities.
Supported predicates:
- `IF [Indicator] [Operator] [Value]`
- `AND [Indicator] [Operator] [Value]`
- `THEN [Action]`

## Ambiguous Source Rules Management

When handwritten trading notes are mathematically ambiguous, the system records them in `strategy_rules` with `is_ambiguous = true` and presents a selection dropdown in Admin:
1. **Price Action Liquidity Tolerance**: Choice of distance threshold.
2. **Gainers Post-Pump Seller Activity**: Seller volume turnover vs Fibonacci depth.
3. **Hidden Bullish 10-Candle Drop**: Downward drop threshold.
4. **ICT Trendline Crossing**: Breakout above line vs support bounce off line.
