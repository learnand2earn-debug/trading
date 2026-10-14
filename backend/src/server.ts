import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors({ origin: '*' }));
app.use(express.json());

// Mount API router
app.use('/api', apiRouter);

// Check for frontend static build in multiple relative locations (for unified Render deployment)
const possibleDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist')
];
const frontendDist = possibleDistPaths.find(p => fs.existsSync(p));

if (frontendDist) {
  console.log(`[Static] Serving frontend from: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // If frontend is not built, provide a helpful health landing page for root
  app.get('/', (_req, res) => {
    res.json({
      status: 'ApexCrypto Pro API & WebSocket Gateway Running',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        strategies: '/api/strategies',
        liveOverview: '/api/market/live-overview',
        websocket: '/ws'
      }
    });
  });
}

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

  // Pre-seed initial candle history with 500 authoritative candles per timeframe
  for (const sym of symbols) {
    try {
      const [k1h, k1d, k30m, k15m] = await Promise.all([
        binanceService.fetchKlines(sym, '1h', 500),
        binanceService.fetchKlines(sym, '1d', 500),
        binanceService.fetchKlines(sym, '30m', 500),
        binanceService.fetchKlines(sym, '15m', 500)
      ]);

      candleStore.setCandles(sym, '1h', k1h);
      candleStore.setCandles(sym, '1d', k1d);
      candleStore.setCandles(sym, '30m', k30m);
      candleStore.setCandles(sym, '15m', k15m);

      // Small pacing pause to respect rate limits
      await new Promise(r => setTimeout(r, 40));
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

server.listen(Number(PORT), HOST, async () => {
  console.log(`=======================================================`);
  console.log(` ApexCrypto Pro Server running on http://${HOST}:${PORT}`);
  console.log(` WebSocket Gateway at ws://${HOST}:${PORT}/ws`);
  console.log(`=======================================================`);

  // Initialize DB and run scanner
  await getDb();
  startAutomatedScannerLoop();
});
