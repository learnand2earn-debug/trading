# System Architecture Specification

## Overview

The platform uses a decoupled, event-driven architecture that strictly separates **deterministic mathematical analysis** from **UI rendering** and **AI orchestration**.

```
[Binance REST & WS]     [CoinGlass Liquidity]
          │                        │
          ▼                        ▼
    [BinanceDataAgent]     [CoinGlassDataAgent]
          │                        │
          └───────────┬────────────┘
                      ▼
            [DataValidationAgent]
                      │
                      ▼ (CANDLE_CLOSED)
            [Typed System Event Bus]
                      │
     ┌────────────────┴────────────────┬─────────────────┐
     ▼                                 ▼                 ▼
[Analysis Agents 4-11]       [Strategy Agents 12-18]   [WebSocket Clients]
(Trend, RSI, EMA, V1, S/R)   (7 Source Methodologies)  (Scanner, Charts)
     │                                 │
     └────────────────┬────────────────┘
                      ▼ (STRATEGY_MATCH)
         [Master Opportunity Manager]
         (Duplicate Trade Prevention)
                      │
                      ▼
             [Central Risk Engine]
         (Max Position, Cooldown, Limits)
                      │
             ┌────────┴────────┐
             ▼                 ▼
     [Paper Trading]    [Live Binance Engine]
             │                 │
             └────────┬────────┘
                      ▼ (POSITION_UPDATED)
           [Position Monitor Agent]
                      │ (Target +1% Hit)
                      ▼
                 [Exit Agent]
                      │
                      ▼ (TRADE_CLOSED)
             [Trade Journal Agent]
                      │
                      ▼
           [PostgreSQL 44+ Tables]
```

## Key Architectural Principles

1. **Deterministic Indicators**:
   RSI, EMA, Smoothed Heiken Ashi V1, Support/Resistance, and Order Blocks are computed strictly via pure deterministic mathematics without AI approximation or hallucination.

2. **Source Fidelity**:
   The 7 strategies reflect the uploaded handwritten source of truth. Ambiguities are flagged and made configurable rather than inventing rules.

3. **Event-Driven Communication**:
   All state transitions emit typed events with correlation IDs, timestamps, and symbol references.

4. **Safety-First Live Trading**:
   Live execution is locked by default behind permissions checks, API validations, and the Emergency Kill Switch.
