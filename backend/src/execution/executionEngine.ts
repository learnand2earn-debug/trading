import { v4 as uuidv4 } from 'uuid';
import { MasterOpportunity } from '../risk/masterOpportunity.js';
import { riskEngine } from '../risk/riskEngine.js';
import { eventBus } from '../core/events.js';
import { getDb } from '../database/db.js';
import {
  loadStoredCredentials,
  loadAllActiveUserCredentials,
  placeLiveMarketBuy,
  placeLiveMarketSell,
  cancelAllOpenOrders,
  isTestnet
} from './binanceLiveOrders.js';
import {
  notifyTradeOpen,
  notifyTradeClose,
  notifyEmergencyStop
} from '../notifications/telegram.js';

export interface PositionRecord {
  id: string;
  userId?: string;
  symbol: string;
  mode: 'PAPER' | 'LIVE';
  strategyCode: string;
  strategyVersion: string;
  entryPrice: number;
  quantity: number;
  targetPrice: number; // +1% Target
  stopLossPrice?: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: number;
  closedAt?: number;
  explanationSnapshot: string;
  // Live trading fields
  binanceOrderId?: number;
  binanceClientOrderId?: string;
  isTestnet?: boolean;
}

export interface TradeClosedRecord {
  id: string;
  userId?: string;
  positionId: string;
  symbol: string;
  mode: 'PAPER' | 'LIVE';
  strategyCode: string;
  strategyVersion: string;
  entryTime: number;
  entryPrice: number;
  exitTime: number;
  exitPrice: number;
  quantity: number;
  grossPnl: number;
  grossPnlPct: number;
  fees: number;
  slippage: number;
  netPnl: number;
  netPnlPct: number;
  exitReason: 'TARGET_REACHED' | 'STOP_LOSS' | 'EMERGENCY_STOP' | 'MANUAL';
  explanation: string;
}

export class ExecutionEngine {
  private paperBalanceUSD = 10000.0;
  private openPositions = new Map<string, PositionRecord>();
  private closedTrades: TradeClosedRecord[] = [];
  private feeRate = 0.001; // 0.1% fee
  private slippageRate = 0.0005; // 0.05% slippage

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    eventBus.subscribe('EMERGENCY_STOP', () => {
      this.handleEmergencyHalt();
    });
  }

  getPaperBalance(): { balance: number; equity: number } {
    let unrealizedTotal = 0;
    for (const pos of this.openPositions.values()) {
      if (pos.mode === 'PAPER') {
        unrealizedTotal += pos.unrealizedPnl;
      }
    }
    return {
      balance: parseFloat(this.paperBalanceUSD.toFixed(2)),
      equity: parseFloat((this.paperBalanceUSD + unrealizedTotal).toFixed(2))
    };
  }

  getOpenPositions(): PositionRecord[] {
    return Array.from(this.openPositions.values());
  }

  getClosedTrades(): TradeClosedRecord[] {
    return this.closedTrades;
  }

  async executeOpportunity(opportunity: MasterOpportunity, modeOverride?: 'PAPER' | 'LIVE'): Promise<PositionRecord | null> {
    const mode = modeOverride || riskEngine.getTradingMode();
    if (mode === 'ANALYSIS') {
      console.log(`[Execution] In ANALYSIS mode. Signal logged for ${opportunity.symbol}, order not placed.`);
      return null;
    }

    if (riskEngine.isEmergencyKillActive()) {
      console.warn(`[Execution] Rejected order for ${opportunity.symbol}: Emergency halt active.`);
      return null;
    }

    const riskCfg = riskEngine.getConfig();
    const positionId = `pos-${uuidv4()}`;
    const clientOrderId = `apex-${positionId.slice(0, 16)}`;

    // ── LIVE MODE: Route through real Binance order for all connected user accounts ──
    if (mode === 'LIVE') {
      const activeUsers = await loadAllActiveUserCredentials();
      if (activeUsers.length === 0) {
        console.warn('[Execution] LIVE mode active, but no user has attached Binance API credentials yet. Connect Binance in My Portal.');
        return null;
      }

      let primaryPosition: PositionRecord | null = null;

      for (const account of activeUsers) {
        const userPosId = `pos-${uuidv4()}`;
        const userClientOrderId = `apex-${userPosId.slice(0, 16)}`;

        try {
          const orderResult = await placeLiveMarketBuy(
            account.creds,
            opportunity.symbol,
            riskCfg.maxPositionSizeUSD,
            userClientOrderId
          );

          const fillPrice = orderResult.avgFillPrice || opportunity.entry;
          const quantity = orderResult.executedQty;
          const targetPrice = parseFloat((fillPrice * 1.01).toFixed(6));

          const position: PositionRecord = {
            id: userPosId,
            userId: account.userId,
            symbol: opportunity.symbol,
            mode: 'LIVE',
            strategyCode: opportunity.primary_strategy_code,
            strategyVersion: 'v1.0',
            entryPrice: fillPrice,
            quantity,
            targetPrice,
            stopLossPrice: opportunity.stop_loss,
            currentPrice: fillPrice,
            unrealizedPnl: 0,
            unrealizedPnlPct: 0,
            status: 'OPEN',
            openedAt: orderResult.transactTime || Date.now(),
            explanationSnapshot: opportunity.signals[0]?.explanation || '',
            binanceOrderId: orderResult.orderId,
            binanceClientOrderId: orderResult.clientOrderId,
            isTestnet
          };

          this.openPositions.set(userPosId, position);
          eventBus.publish('ORDER_FILLED', position, { symbol: position.symbol, strategy_id: position.strategyCode });
          eventBus.publish('POSITION_UPDATED', position, { symbol: position.symbol });
          await this.persistPosition(position);

          // Telegram notification
          notifyTradeOpen(position.symbol, position.strategyCode, 'LIVE', fillPrice, targetPrice, quantity).catch(() => {});

          console.log(`[Execution] LIVE Position OPENED for user ${account.userId}: ${position.symbol} qty=${quantity} @ $${fillPrice} | OrderId: ${orderResult.orderId} [${isTestnet ? 'TESTNET' : 'LIVE'}]`);

          if (!primaryPosition) primaryPosition = position;
        } catch (err: any) {
          console.error(`[Execution] LIVE BUY order FAILED for user ${account.userId} on ${opportunity.symbol}:`, err.message);
        }
      }

      return primaryPosition;
    }

    // ── PAPER MODE: Simulated execution ──
    const positionSizeUSD = Math.min(riskCfg.maxPositionSizeUSD, this.paperBalanceUSD * 0.2);
    const simulatedFillPrice = opportunity.entry * (1 + this.slippageRate);
    const quantity = parseFloat((positionSizeUSD / simulatedFillPrice).toFixed(6));
    const targetPrice = parseFloat((simulatedFillPrice * 1.01).toFixed(6));

    const position: PositionRecord = {
      id: positionId,
      symbol: opportunity.symbol,
      mode: 'PAPER',
      strategyCode: opportunity.primary_strategy_code,
      strategyVersion: 'v1.0',
      entryPrice: simulatedFillPrice,
      quantity,
      targetPrice,
      stopLossPrice: opportunity.stop_loss,
      currentPrice: simulatedFillPrice,
      unrealizedPnl: 0,
      unrealizedPnlPct: 0,
      status: 'OPEN',
      openedAt: Date.now(),
      explanationSnapshot: opportunity.signals[0]?.explanation || ''
    };

    this.paperBalanceUSD -= positionSizeUSD;
    this.openPositions.set(positionId, position);
    eventBus.publish('ORDER_FILLED', position, { symbol: position.symbol, strategy_id: position.strategyCode });
    eventBus.publish('POSITION_UPDATED', position, { symbol: position.symbol });
    await this.persistPosition(position);

    // Telegram notification for paper trade
    notifyTradeOpen(position.symbol, position.strategyCode, 'PAPER', position.entryPrice, position.targetPrice, position.quantity).catch(() => {});

    console.log(`[Execution] PAPER Position OPENED: ${position.symbol} @ ${position.entryPrice} (+1% Target: ${position.targetPrice})`);
    return position;
  }

  async updateMarketPrice(symbol: string, currentPrice: number): Promise<void> {
    for (const [id, pos] of this.openPositions.entries()) {
      if (pos.symbol === symbol && pos.status === 'OPEN') {
        pos.currentPrice = currentPrice;
        const grossMove = (currentPrice - pos.entryPrice) * pos.quantity;
        const grossMovePct = ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100;

        pos.unrealizedPnl = parseFloat(grossMove.toFixed(4));
        pos.unrealizedPnlPct = parseFloat(grossMovePct.toFixed(2));

        // Check if +1% Target is reached
        if (currentPrice >= pos.targetPrice) {
          await this.closePosition(id, currentPrice, 'TARGET_REACHED');
        } else if (pos.stopLossPrice && currentPrice <= pos.stopLossPrice) {
          await this.closePosition(id, currentPrice, 'STOP_LOSS');
        }
      }
    }
  }

  async closePosition(positionId: string, exitPrice: number, reason: 'TARGET_REACHED' | 'STOP_LOSS' | 'EMERGENCY_STOP' | 'MANUAL') {
    const pos = this.openPositions.get(positionId);
    if (!pos || pos.status === 'CLOSED') return;

    pos.status = 'CLOSED';
    pos.closedAt = Date.now();
    this.openPositions.delete(positionId);

    let actualExitPrice = exitPrice * (1 - this.slippageRate);

    // ── LIVE MODE: Place real MARKET SELL order on Binance ──
    if (pos.mode === 'LIVE') {
      try {
        const creds = await loadStoredCredentials(pos.userId);
        if (creds && pos.quantity > 0) {
          const sellClientId = `apex-exit-${positionId.slice(0, 12)}`;
          const sellResult = await placeLiveMarketSell(creds, pos.symbol, pos.quantity, sellClientId);
          actualExitPrice = sellResult.avgFillPrice || exitPrice;
          console.log(`[Execution] LIVE SELL executed for user ${pos.userId || 'admin'}: ${pos.symbol} qty=${sellResult.executedQty} @ $${actualExitPrice} | OrderId: ${sellResult.orderId}`);
        }
      } catch (err: any) {
        console.error(`[Execution] LIVE SELL order FAILED for user ${pos.userId || 'admin'} on ${pos.symbol}:`, err.message);
        // Continue with close record even if sell fails — position is marked closed
      }
    }

    const grossPnl = (actualExitPrice - pos.entryPrice) * pos.quantity;
    const grossPnlPct = ((actualExitPrice - pos.entryPrice) / pos.entryPrice) * 100;

    const entryNotional = pos.entryPrice * pos.quantity;
    const exitNotional = actualExitPrice * pos.quantity;
    const fees = (entryNotional + exitNotional) * this.feeRate;
    const slippage = (pos.entryPrice * this.slippageRate + actualExitPrice * this.slippageRate) * pos.quantity;

    const netPnl = grossPnl - fees;
    const netPnlPct = (netPnl / entryNotional) * 100;

    if (pos.mode === 'PAPER') {
      this.paperBalanceUSD += exitNotional;
    }
    // LIVE: Real funds are managed by Binance; we just track the record

    const tradeRecord: TradeClosedRecord = {
      id: `trd-${uuidv4()}`,
      userId: pos.userId,
      positionId: pos.id,
      symbol: pos.symbol,
      mode: pos.mode,
      strategyCode: pos.strategyCode,
      strategyVersion: pos.strategyVersion,
      entryTime: pos.openedAt,
      entryPrice: pos.entryPrice,
      exitTime: Date.now(),
      exitPrice: actualExitPrice,
      quantity: pos.quantity,
      grossPnl: parseFloat(grossPnl.toFixed(4)),
      grossPnlPct: parseFloat(grossPnlPct.toFixed(2)),
      fees: parseFloat(fees.toFixed(4)),
      slippage: parseFloat(slippage.toFixed(4)),
      netPnl: parseFloat(netPnl.toFixed(4)),
      netPnlPct: parseFloat(netPnlPct.toFixed(2)),
      exitReason: reason,
      explanation: pos.explanationSnapshot
    };

    this.closedTrades.unshift(tradeRecord);
    riskEngine.setSymbolCooldown(pos.symbol);

    eventBus.publish('TARGET_REACHED', tradeRecord, { symbol: pos.symbol, strategy_id: pos.strategyCode });
    eventBus.publish('TRADE_CLOSED', tradeRecord, { symbol: pos.symbol });

    // Telegram notification for trade close
    notifyTradeClose(
      pos.symbol, pos.strategyCode, pos.mode,
      pos.entryPrice, actualExitPrice,
      tradeRecord.netPnl, tradeRecord.netPnlPct, reason
    ).catch(() => {});

    // Persist trade and trade journal record
    await this.persistTradeAndJournal(tradeRecord, pos);

    console.log(`[Execution] Trade CLOSED: ${pos.symbol} (${reason}) Net PnL: $${netPnl.toFixed(2)} (${netPnlPct.toFixed(2)}%) -> RESCANNING...`);
  }

  private async handleEmergencyHalt() {
    // Notify Telegram immediately
    notifyEmergencyStop('admin').catch(() => {});

    // Cancel any open Binance orders first for live positions
    const liveSymbols = new Set<string>();
    for (const pos of this.openPositions.values()) {
      if (pos.status === 'OPEN' && pos.mode === 'LIVE') {
        liveSymbols.add(pos.symbol);
      }
    }

    if (liveSymbols.size > 0) {
      const creds = await loadStoredCredentials();
      if (creds) {
        for (const sym of liveSymbols) {
          await cancelAllOpenOrders(creds, sym);
        }
      }
    }

    for (const [id, pos] of this.openPositions.entries()) {
      if (pos.status === 'OPEN') {
        this.closePosition(id, pos.currentPrice, 'EMERGENCY_STOP');
      }
    }
  }

  private async persistPosition(pos: PositionRecord) {
    try {
      const db = await getDb();
      await db.query(
        `INSERT INTO positions (id, symbol, mode, entry_price, quantity, target_price, current_price, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN')`,
        [pos.id, pos.symbol, pos.mode, pos.entryPrice, pos.quantity, pos.targetPrice, pos.currentPrice]
      );
    } catch (e: any) {
      console.warn('[DB] Failed to persist position:', e.message);
    }
  }

  private async persistTradeAndJournal(trade: TradeClosedRecord, pos: PositionRecord) {
    try {
      const db = await getDb();
      await db.query(
        `INSERT INTO trades (id, position_id, symbol, mode, entry_time, entry_price, exit_time, exit_price, quantity, gross_pnl, gross_pnl_pct, fees, slippage, net_pnl, net_pnl_pct, exit_reason)
         VALUES ($1, $2, $3, $4, to_timestamp($5 / 1000.0), $6, to_timestamp($7 / 1000.0), $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [trade.id, trade.positionId, trade.symbol, trade.mode, trade.entryTime, trade.entryPrice, trade.exitTime, trade.exitPrice, trade.quantity, trade.grossPnl, trade.grossPnlPct, trade.fees, trade.slippage, trade.netPnl, trade.netPnlPct, trade.exitReason]
      );

      // Section 34: Trade Journal Record with immutable snapshot
      await db.query(
        `INSERT INTO trade_journal (id, trade_id, symbol, strategy_code, strategy_version, source_rules_snapshot, indicator_values_snapshot, agent_decisions, explanation, data_freshness_snapshot)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          `jnl-${trade.id}`,
          trade.id,
          trade.symbol,
          trade.strategyCode,
          trade.strategyVersion,
          JSON.stringify({ target: '+1%', mode: trade.mode }),
          JSON.stringify({ entry: trade.entryPrice, exit: trade.exitPrice }),
          JSON.stringify({ exitReason: trade.exitReason }),
          trade.explanation,
          JSON.stringify({ freshness: 'FRESH' })
        ]
      );
    } catch (e: any) {
      console.warn('[DB] Failed to persist trade journal:', e.message);
    }
  }
}

export const executionEngine = new ExecutionEngine();
