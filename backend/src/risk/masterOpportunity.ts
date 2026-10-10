import { v4 as uuidv4 } from 'uuid';
import { StrategySignalResult } from '../strategies/types.js';
import { riskEngine, RiskCheckReport } from './riskEngine.js';
import { eventBus } from '../core/events.js';

export interface MasterOpportunity {
  opportunity_id: string;
  symbol: string;
  detected_at: number;
  primary_strategy_code: string;
  confluence_strategies: string[];
  signals: StrategySignalResult[];
  supporting_conditions: string[];
  conflicting_conditions: string[];
  risk_status: 'PENDING_RISK' | 'APPROVED' | 'REJECTED';
  risk_report?: RiskCheckReport;
  data_quality: 'PASS' | 'DATA_STALE' | 'FAIL';
  current_state: 'CANDIDATE' | 'CONFIRMED' | 'EXECUTING' | 'CLOSED' | 'CANCELLED';
  entry: number;
  target: number; // +1% Target
  stop_loss?: number;
  expiry: number;
}

export class MasterOpportunityManager {
  private activeOpportunities = new Map<string, MasterOpportunity>();

  processStrategySignals(signals: StrategySignalResult[], dataAgeSeconds: number = 0): MasterOpportunity | null {
    const validSignals = signals.filter(s => s.signalValid);
    if (validSignals.length === 0) return null;

    const symbol = validSignals[0].symbol;
    const existing = this.activeOpportunities.get(symbol);

    // If an opportunity exists within 5 minutes, aggregate confluence
    if (existing && Date.now() < existing.expiry) {
      for (const sig of validSignals) {
        if (!existing.confluence_strategies.includes(sig.strategyCode) && sig.strategyCode !== existing.primary_strategy_code) {
          existing.confluence_strategies.push(sig.strategyCode);
          existing.signals.push(sig);
          existing.supporting_conditions.push(...sig.conditions.map(c => `${sig.strategyCode}: ${c.name}`));
        }
      }
      return existing;
    }

    const primarySignal = validSignals[0];
    const confluence = validSignals.slice(1).map(s => s.strategyCode);

    const opportunity: MasterOpportunity = {
      opportunity_id: `opp-${uuidv4()}`,
      symbol,
      detected_at: Date.now(),
      primary_strategy_code: primarySignal.strategyCode,
      confluence_strategies: confluence,
      signals: validSignals,
      supporting_conditions: primarySignal.conditions.map(c => c.name),
      conflicting_conditions: [],
      risk_status: 'PENDING_RISK',
      data_quality: dataAgeSeconds > 60 ? 'DATA_STALE' : 'PASS',
      current_state: 'CANDIDATE',
      entry: primarySignal.entryPrice,
      target: primarySignal.targetPrice,
      stop_loss: primarySignal.stopLossPrice,
      expiry: Date.now() + 15 * 60000 // 15 minute validity
    };

    this.activeOpportunities.set(symbol, opportunity);
    eventBus.publish('STRATEGY_MATCH', opportunity, { symbol, strategy_id: primarySignal.strategyCode });
    return opportunity;
  }

  async evaluateRiskForOpportunity(
    opportunity: MasterOpportunity,
    activePositionsCount: number,
    hasExistingPosition: boolean
  ): Promise<boolean> {
    const report = await riskEngine.validateSignal(
      opportunity.signals[0],
      0,
      activePositionsCount,
      hasExistingPosition
    );

    opportunity.risk_report = report;
    if (report.approved) {
      opportunity.risk_status = 'APPROVED';
      opportunity.current_state = 'CONFIRMED';
      eventBus.publish('RISK_APPROVED', opportunity, { symbol: opportunity.symbol });
      return true;
    } else {
      opportunity.risk_status = 'REJECTED';
      opportunity.current_state = 'CANCELLED';
      eventBus.publish('RISK_REJECTED', { opportunity, reason: report.reason }, { symbol: opportunity.symbol });
      return false;
    }
  }

  getOpportunity(symbol: string): MasterOpportunity | undefined {
    return this.activeOpportunities.get(symbol);
  }

  getAllOpportunities(): MasterOpportunity[] {
    return Array.from(this.activeOpportunities.values());
  }
}

export const masterOpportunityManager = new MasterOpportunityManager();
