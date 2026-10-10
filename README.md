# ApexCrypto Pro: Autonomous Crypto Trading Automation & Strategy Platform

A complete, production-grade cryptocurrency trading automation platform built from scratch with deterministic source trading methodology, an autonomous 34-agent system, real-time market scanner, backtesting, historical replay, trade journal, and financial terminal interface.

---

## Key Capabilities

1. **The 7 Source Trading Strategies**:
   - **Strategy 1: Price Action**: 1D Uptrend/Sideways, 1H Support/Resistance, CoinGlass Liquidity Heatmap, 1H RSI (25–40), 30M RSI Leadership, +1% Target.
   - **Strategy 2: V1 Method**: 1D Mandatory UP, 1H Up/Sideways, RSI Cross 54 from below, Smoothed Heiken Ashi V1 (Green/Transparent), 30M RSI Leadership, +1% Target.
   - **Strategy 3: Gainers Method**: Binance Top 7 Gainers, 3 quote pairs (USDT/USDC/FDUSD), ~40% pump, post-pump health, not new/delisting, *"Monitoring mai na ho"* (strictly NOT under monitoring), +1% Target.
   - **Strategy 4: Hidden Bullish**: Custom source 10-candle downward drop and upward reaction (explicitly distinct from textbook divergence), RSI 25–40, 30M Leadership, +1% Target.
   - **Strategy 5: V1 + EMA**: V1 conditions + EMA 9 (Blue) / EMA 33 (Yellow) Bullish Cross, EMA 9 Retest (Cross retest or wick touch while above), +1% Target.
   - **Strategy 6: OB Method**: Valid Bullish Order Block (3+ consecutive green candles pump preceded by red candle), 1H identification, 15M retest confirmation, +1% Target.
   - **Strategy 7: ICT Method**: 1H RSI (30–40), Current Green / Previous Red candle relationship, 2–3 green candles with ~1% pump, Trendline condition (ambiguous selector), 1H trend cannot be sideways, +1% Target.

2. **Autonomous Multi-Agent Architecture (34 Dedicated Agents)**:
   - Data Agents: Binance, CoinGlass, Data Validation
   - Analysis Agents: Trend, Market Structure, RSI, EMA, V1, Liquidity, Order Block, ICT Structure
   - Strategy Agents: Price Action, V1, Gainers, Hidden Bullish, V1 + EMA, OB, ICT
   - Decision Agents: Confluence, Risk, Signal
   - Execution Agents: Paper Trading, Binance Execution, Position Monitor, Exit
   - Intelligence Agents: Command Agent (NLP parser), Explanation Agent, Research Agent
   - Operations Agents: Notification, Journal, Backtest, Replay, Performance, Health/Monitoring

3. **Master Opportunity & Duplicate Signal Protection**:
   - Aggregates multi-strategy confluence on the same coin to prevent duplicate entries.

4. **Central Risk Engine & Emergency Kill Switch**:
   - Enforces max position size, max simultaneous positions, daily loss limit, symbol cooldowns, data freshness checks (> 60s stale data rejected).
   - Prominent "KILL ALL TRADING" button halts all activity instantly.

5. **Security & Live Trading Safeguards**:
   - Live trading locked by default behind confirmation modals, API validation, and risk parameters.
   - AES-256-GCM encryption for API credentials at rest.
   - **Zero withdrawal permissions requested or allowed**.

6. **PostgreSQL Persistence**:
   - 44+ normalized tables with dual compatibility (embedded PGlite WASM engine for zero-configuration local runs, standard PostgreSQL for production).

7. **Financial Terminal UI**:
   - Dark theme terminal layout, real-time WebSocket updates, multi-timeframe charts (15M, 30M, 1H, 1D), S/R overlays, EMA 9/33 lines, Bullish OB zones, 17-column market scanner.

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+ (Node.js 24 recommended)
- npm 10+

### 2. Installation
```bash
# Clone or navigate to the repository
cd c:/Users/Admin/Desktop/Trading

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend API & Real-time Scanner (Port 4000)
cd backend
npm run dev

# Terminal 2: Frontend Financial Terminal (Port 5173)
cd frontend
npm run dev
```

Open your browser at `http://localhost:5173` to access the terminal.

---

## Running Verification Tests

To run the complete automated test suite (Unit Tests for all 7 strategies, RSI, EMA, V1, Order Blocks, Risk Engine, Kill Switch, and End-to-End Execution Simulation):

```bash
cd backend
npm run test
```

---

## Production Deployment with Docker Compose

```bash
docker-compose up -d --build
```
This launches:
- `postgres`: PostgreSQL 16 database with auto-migrated schema
- `redis`: Redis 7 cache & event message broker
- `backend`: Production Node.js backend container on port 4000
- `frontend`: Production Nginx web server on port 80

---

## Documentation Directory

- [Architecture Overview](file:///c:/Users/Admin/Desktop/Trading/docs/ARCHITECTURE.md)
- [Database Schema (44+ Tables)](file:///c:/Users/Admin/Desktop/Trading/docs/DATABASE.md)
- [API Endpoints & WebSockets](file:///c:/Users/Admin/Desktop/Trading/docs/API.md)
- [34 Autonomous Agents Reference](file:///c:/Users/Admin/Desktop/Trading/docs/AGENTS.md)
- [The 7 Source Strategies Reference](file:///c:/Users/Admin/Desktop/Trading/docs/STRATEGIES.md)
- [Security & Encryption Architecture](file:///c:/Users/Admin/Desktop/Trading/docs/SECURITY.md)
- [Production Deployment Guide](file:///c:/Users/Admin/Desktop/Trading/docs/DEPLOYMENT.md)
- [Backtesting & Historical Replay](file:///c:/Users/Admin/Desktop/Trading/docs/BACKTESTING.md)
- [Trading Modes (Analysis, Paper, Live)](file:///c:/Users/Admin/Desktop/Trading/docs/TRADING_MODES.md)
- [Admin & Visual Rule Builder Guide](file:///c:/Users/Admin/Desktop/Trading/docs/ADMIN_GUIDE.md)
