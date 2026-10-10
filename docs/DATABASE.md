# Database Architecture & Schema Reference

The platform utilizes a normalized PostgreSQL database schema with 44+ tables.
It supports:
1. Native PostgreSQL via standard connection string (`DATABASE_URL`).
2. Embedded in-process PostgreSQL via `@electric-sql/pglite` (WASM) for zero-dependency local development.

## Core Table Groups

### 1. Identity & Security
- `users`: User credentials, roles, and timestamps.
- `roles`: Role definitions (ADMIN, USER, VIEWER).
- `permissions`: Granular resource-action access mappings.
- `api_credentials`: AES-256-GCM encrypted exchange API keys.
- `audit_logs`: Immutable audit trails for all critical admin actions and risk updates.

### 2. Market Data
- `exchanges`: Exchange definitions and endpoints.
- `symbols`: Trading symbol metadata (tick size, min order).
- `trading_pairs`: Multi-pair mappings (e.g. USDT, USDC, FDUSD).
- `candles`: Multi-timeframe OHLCV candles (15m, 30m, 1h, 1d).
- `market_snapshots`: 24-hour ticker statistics.
- `liquidity_snapshots`: CoinGlass liquidity heatmaps and zones.
- `data_quality_events`: Data validation events (stale data, missing candles).

### 3. Technical Analysis
- `trend_analysis`: 1D and 1H trend states (UPTREND, DOWNTREND, SIDEWAYS).
- `support_resistance`: 1H S/R price zones, touches, validity status.
- `rsi_values`: Wilder's RSI calculations across timeframes.
- `ema_values`: EMA 9 and EMA 33 calculations.
- `v1_values`: Smoothed Heiken Ashi V1 state machine (GREEN, TRANSPARENT, RED).
- `order_blocks`: Bullish Order Block zones, status, and retests.
- `ict_analysis`: Sequence and trendline evaluations for Strategy 7.

### 4. Strategies & Decisions
- `strategies`: Strategy metadata for all 7 strategies.
- `strategy_versions`: Immutable strategy definitions and versions (e.g. v1.0).
- `strategy_rules`: Machine-readable rules and ambiguous rule tags.
- `strategy_parameters`: Configurable numerical parameters.
- `strategy_signals`: Generated trade signals with deterministic explanations.
- `master_opportunities`: Central opportunities aggregating multi-strategy confluence.
- `risk_checks`: Detailed validation audit for each opportunity.

### 5. Execution & Trade Journal
- `orders`: Paper and live orders.
- `order_events`: Lifecycle events (FILLED, CANCELLED, REJECTED).
- `positions`: Open simulated/live positions with unrealized PnL.
- `trades`: Closed trade history.
- `trade_exits`: Partial or full exit records.
- `trade_journal`: Immutable snapshot of indicators, decisions, and source conditions at time of trade.

### 6. Testing & Operations
- `backtests`: Historical backtest runs and performance summaries.
- `backtest_trades`: Individual simulated historical trades.
- `replay_sessions`: Candle-by-candle replay session states.
- `agents`: Metadata and heartbeat states for all 34 agents.
- `agent_runs`: Agent execution logs.
- `agent_logs`: Real-time agent log stream.
- `agent_events`: Structured event payloads.
- `notifications`: Multi-channel notifications.
- `system_settings`: Central risk and platform configurations.
- `health_checks`: Observability telemetry.
