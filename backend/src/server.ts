import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.js';
import { getDb } from './database/db.js';
import { eventBus } from './core/events.js';
import { binanceService } from './market-data/binance.js';
import { candleStore } from './market-data/candleStore.js';
import { strategyRegistry } from './strategies/index.js';
import { masterOpportunityManager } from './risk/masterOpportunity.js';
import { executionEngine } from './execution/executionEngine.js';
import { watchAndMonitoringService } from './agents/operations/watchAndMonitor.js';
import { notifySignal, notifyInfo, isTelegramConfigured } from './notifications/telegram.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Mount API router
app.use('/api', apiRouter);

const server = http.createServer(app);

// Setup WebSocket Server for real-time frontend updates
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  console.log(`[WebSocket] Client connected. Total clients: ${clients.size}`);

  ws.send(JSON.stringify({
    type: 'CONNECTION_READY',
    timestamp: Date.now(),
    message: 'ApexCrypto Real-Time Gateway Active'
  }));

  ws.on('close', () => {
    clients.delete(ws);
  });
});

function broadcast(type: string, data: any) {
  const payload = JSON.stringify({ type, data, timestamp: Date.now() });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Forward all System Event Bus events to WebSocket clients
eventBus.subscribe('*', (ev) => {
  broadcast(ev.event_type, ev);
});

// Autonomous 24H Scanner Loop
async function startAutomatedScannerLoop() {
  // Core symbols — always monitored
  const coreSymbols = [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT',
    'AVAXUSDT', 'LINKUSDT', 'BNBUSDT', 'ADAUSDT', 'NEARUSDT'
  ];

  // Dynamically fetch top Binance gainers and add to watchlist
  let symbols = [...coreSymbols];
  try {
    const topGainers = await binanceService.getTopGainers(40);
    const gainersSymbols = topGainers
      .map(t => t.symbol)
      .filter(s => !symbols.includes(s) && s.endsWith('USDT'));
    symbols = [...symbols, ...gainersSymbols].slice(0, 50); // Cap at 50 symbols
  } catch (e) {
    console.warn('[Scanner] Could not fetch top gainers, using core symbols only');
  }

  console.log(`[ScannerLoop] Starting 24h Autonomous Market Surveillance on ${symbols.length} symbols`);
  if (isTelegramConfigured()) {
    notifyInfo(`🚀 ApexCrypto Pro started.\n📊 Monitoring ${symbols.length} symbols\n7 Strategies active`).catch(() => {});
  }

  // Connect Binance WebSocket for live streaming
  binanceService.connectWebSocket(symbols, ['15m', '30m', '1h', '1d']);
  binanceService.setCandleListener((symbol, timeframe, candle) => {
    candleStore.updateCandle(symbol, timeframe, candle);
    executionEngine.updateMarketPrice(symbol, candle.close);
  });

  // Pre-seed initial candle history
  for (const sym of symbols) {
    try {
      const k1h = await binanceService.fetchKlines(sym, '1h', 50);
      const k1d = await binanceService.fetchKlines(sym, '1d', 30);
      const k30m = await binanceService.fetchKlines(sym, '30m', 50);
      const k15m = await binanceService.fetchKlines(sym, '15m', 50);

      k1h.forEach(c => candleStore.updateCandle(sym, '1h', c));
      k1d.forEach(c => candleStore.updateCandle(sym, '1d', c));
      k30m.forEach(c => candleStore.updateCandle(sym, '30m', c));
      k15m.forEach(c => candleStore.updateCandle(sym, '15m', c));
    } catch (e: any) {
      console.warn(`[Scanner] Initial seed error for ${sym}:`, e.message);
    }
  }

  // Periodic strategy evaluation loop (every 15 seconds)
  setInterval(async () => {
    try {
      watchAndMonitoringService.recordScanCycle(symbols.length);

      for (const sym of symbols) {
        const stratSignals = await strategyRegistry.evaluateAllStrategiesForSymbol(sym);
        const validSignals = stratSignals.filter(s => s.signalValid);

        if (validSignals.length > 0) {
          console.log(`[Scanner] Found ${validSignals.length} valid signals for ${sym}:`, validSignals.map(s => s.strategyName).join(', '));

          // 1. Create / Aggregate into Master Opportunity (Duplicate signal guard)
          const opportunity = masterOpportunityManager.processStrategySignals(stratSignals, 0);

          if (opportunity && opportunity.risk_status === 'PENDING_RISK') {
            // 2. Risk Engine Evaluation
            const activePositions = executionEngine.getOpenPositions();
            const hasExisting = activePositions.some(p => p.symbol === sym);

            const approved = await masterOpportunityManager.evaluateRiskForOpportunity(
              opportunity,
              activePositions.length,
              hasExisting
            );

            // 2b. Telegram signal notification (fire-and-forget)
            if (approved) {
              const sig = validSignals[0];
              notifySignal(sym, sig.strategyName, sig.entryPrice, sig.targetPrice).catch(() => {});
            }

            // 3. Execution Pipeline (Paper or Live)
            if (approved) {
              await executionEngine.executeOpportunity(opportunity);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('[ScannerLoop] Error in scan cycle:', err.message);
    }
  }, 15000);
}

server.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(` ApexCrypto Pro Server running on http://localhost:${PORT}`);
  console.log(` WebSocket Gateway at ws://localhost:${PORT}/ws`);
  console.log(`=======================================================`);

  // Initialize DB and run scanner
  await getDb();
  startAutomatedScannerLoop();
});
