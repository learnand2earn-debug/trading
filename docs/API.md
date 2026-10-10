# REST API & WebSocket Gateway Reference

Base URL: `http://localhost:4000/api`
WebSocket Gateway: `ws://localhost:4000/ws`

## Core REST Endpoints

### 1. Market & Scanner
- `GET /api/health`: Health status of database, WebSocket, memory, and agents.
- `GET /api/market/scanner`: Aggregated high-density matrix of all coins with indicators, trend, matched strategies, and lead times.
- `GET /api/market/coin/:symbol`: Multi-timeframe candles (15m, 30m, 1h, 1d), S/R overlays, EMA 9/33, OB zones, and 7-strategy evaluation panel.

### 2. Strategy & Signals
- `GET /api/signals`: Verified active and rejected strategy signals with step-by-step reasoning proofs.

### 3. Paper Trading Desk
- `GET /api/paper-trading`: Virtual balance ($10,000 USD default), equity, open positions, closed trade history, win rate.
- `POST /api/paper-trading/close/:id`: Trigger manual market exit for an open position.

### 4. Risk Engine & Emergency Controls
- `GET /api/risk/settings`: View current risk parameters.
- `POST /api/risk/settings`: Update max position size, max simultaneous trades, cooldowns.
- `POST /api/risk/kill-switch`: Activate or reset emergency kill switch (`{ "action": "HALT" | "RESET" }`).
- `POST /api/trading-mode`: Switch mode (`{ "mode": "ANALYSIS" | "PAPER" | "LIVE" }`).

### 5. Agents Control Center
- `GET /api/agents`: Retrieve status, heartbeat, latency, error count, and logs for all 34 agents.
- `POST /api/agents/:id/:action`: Agent control (`action` in `start`, `stop`, `pause`, `resume`, `restart`).

### 6. AI Command Center
- `POST /api/command-center/parse`: Parse natural language prompt into structured action.
- `POST /api/command-center/execute`: Execute validated structured action.

### 7. Backtesting & Replay
- `POST /api/backtests/run`: Run historical simulation without look-ahead bias.
- `POST /api/replay/create`: Initialize candle-by-candle replay session.
- `POST /api/replay/:id/action`: Step, play, pause, or reset replay.

### 8. Live Trading Safeguards
- `POST /api/live-trading/connect`: Securely encrypt and store Binance API keys (AES-256-GCM). Withdrawal permission strictly denied.
- `GET /api/live-trading/status`: View live trading safety checks status.

## WebSocket Real-Time Events (`/ws`)

Clients receive JSON event payloads matching Section 19:
- `MARKET_UPDATE`: Live price and 24h ticker changes.
- `CANDLE_CLOSED`: Confirmed candle close on 15m, 30m, 1h, or 1d.
- `STRATEGY_MATCH`: Strategy condition satisfied on symbol.
- `SIGNAL_CREATED`: Final trade signal generated (+1% target).
- `ORDER_FILLED`: Order fill event.
- `POSITION_UPDATED`: Real-time unrealized PnL update.
- `TARGET_REACHED`: +1% profit target reached.
- `EMERGENCY_STOP`: Emergency halt broadcast.
