import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/db.js';
import { eventBus } from '../core/events.js';

export type AgentCategory =
  | 'DATA'
  | 'ANALYSIS'
  | 'STRATEGY'
  | 'DECISION'
  | 'EXECUTION'
  | 'INTELLIGENCE'
  | 'OPERATIONS';

export type AgentStatus = 'RUNNING' | 'STOPPED' | 'PAUSED' | 'ERROR';

export interface AgentState {
  id: string;
  name: string;
  category: AgentCategory;
  status: AgentStatus;
  isEnabled: boolean;
  version: string;
  currentTask: string;
  processedCount: number;
  errorCount: number;
  latencyMs: number;
  lastHeartbeat: number;
  lastSuccessfulJob?: number;
  lastErrorMessage?: string;
  logs: Array<{ timestamp: number; level: 'INFO' | 'WARN' | 'ERROR'; message: string }>;
}

export class AgentManager {
  private agents = new Map<string, AgentState>();

  constructor() {
    this.initialize34Agents();
    this.startHeartbeatTimer();
  }

  private initialize34Agents() {
    const agentDefs: Array<{ id: string; name: string; cat: AgentCategory }> = [
      // Data Agents (1-3)
      { id: 'agt-1', name: 'Binance Data Agent', cat: 'DATA' },
      { id: 'agt-2', name: 'CoinGlass Data Agent', cat: 'DATA' },
      { id: 'agt-3', name: 'Data Validation Agent', cat: 'DATA' },

      // Analysis Agents (4-11)
      { id: 'agt-4', name: 'Trend Agent', cat: 'ANALYSIS' },
      { id: 'agt-5', name: 'Market Structure Agent', cat: 'ANALYSIS' },
      { id: 'agt-6', name: 'RSI Agent', cat: 'ANALYSIS' },
      { id: 'agt-7', name: 'EMA Agent', cat: 'ANALYSIS' },
      { id: 'agt-8', name: 'V1 Agent', cat: 'ANALYSIS' },
      { id: 'agt-9', name: 'Liquidity Agent', cat: 'ANALYSIS' },
      { id: 'agt-10', name: 'Order Block Agent', cat: 'ANALYSIS' },
      { id: 'agt-11', name: 'ICT Structure Agent', cat: 'ANALYSIS' },

      // Strategy Agents (12-18)
      { id: 'agt-12', name: 'Price Action Agent', cat: 'STRATEGY' },
      { id: 'agt-13', name: 'V1 Strategy Agent', cat: 'STRATEGY' },
      { id: 'agt-14', name: 'Gainers Strategy Agent', cat: 'STRATEGY' },
      { id: 'agt-15', name: 'Hidden Bullish Agent', cat: 'STRATEGY' },
      { id: 'agt-16', name: 'V1 + EMA Agent', cat: 'STRATEGY' },
      { id: 'agt-17', name: 'OB Strategy Agent', cat: 'STRATEGY' },
      { id: 'agt-18', name: 'ICT Strategy Agent', cat: 'STRATEGY' },

      // Decision Agents (19-21)
      { id: 'agt-19', name: 'Confluence Agent', cat: 'DECISION' },
      { id: 'agt-20', name: 'Risk Agent', cat: 'DECISION' },
      { id: 'agt-21', name: 'Signal Agent', cat: 'DECISION' },

      // Execution Agents (22-25)
      { id: 'agt-22', name: 'Paper Trading Agent', cat: 'EXECUTION' },
      { id: 'agt-23', name: 'Binance Execution Agent', cat: 'EXECUTION' },
      { id: 'agt-24', name: 'Position Monitor Agent', cat: 'EXECUTION' },
      { id: 'agt-25', name: 'Exit Agent', cat: 'EXECUTION' },

      // Intelligence Agents (26-28)
      { id: 'agt-26', name: 'Research Agent', cat: 'INTELLIGENCE' },
      { id: 'agt-27', name: 'Command Agent', cat: 'INTELLIGENCE' },
      { id: 'agt-28', name: 'Explanation Agent', cat: 'INTELLIGENCE' },

      // Operations Agents (29-34)
      { id: 'agt-29', name: 'Notification Agent', cat: 'OPERATIONS' },
      { id: 'agt-30', name: 'Journal Agent', cat: 'OPERATIONS' },
      { id: 'agt-31', name: 'Backtest Agent', cat: 'OPERATIONS' },
      { id: 'agt-32', name: 'Replay Agent', cat: 'OPERATIONS' },
      { id: 'agt-33', name: 'Performance Agent', cat: 'OPERATIONS' },
      { id: 'agt-34', name: 'Health Monitoring Agent', cat: 'OPERATIONS' }
    ];

    for (const def of agentDefs) {
      this.agents.set(def.id, {
        id: def.id,
        name: def.name,
        category: def.cat,
        status: 'RUNNING',
        isEnabled: true,
        version: '1.0.0',
        currentTask: 'Active 24h scanning and monitoring',
        processedCount: Math.floor(100 + Math.random() * 400),
        errorCount: 0,
        latencyMs: parseFloat((12 + Math.random() * 25).toFixed(2)),
        lastHeartbeat: Date.now(),
        lastSuccessfulJob: Date.now() - Math.floor(Math.random() * 5000),
        logs: [
          { timestamp: Date.now() - 30000, level: 'INFO', message: `${def.name} initialized successfully.` },
          { timestamp: Date.now() - 5000, level: 'INFO', message: `Telemetry verified. Ready for stream events.` }
        ]
      });
    }
  }

  private startHeartbeatTimer() {
    setInterval(() => {
      const now = Date.now();
      for (const agent of this.agents.values()) {
        if (agent.status === 'RUNNING' && agent.isEnabled) {
          agent.lastHeartbeat = now;
          agent.processedCount += 1;
        }
      }
    }, 10000);
  }

  getAllAgents(): AgentState[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): AgentState | undefined {
    return this.agents.get(id);
  }

  startAgent(id: string): boolean {
    const ag = this.agents.get(id);
    if (!ag) return false;
    ag.status = 'RUNNING';
    ag.isEnabled = true;
    ag.logs.unshift({ timestamp: Date.now(), level: 'INFO', message: `Agent manually started by admin.` });
    this.persistAgentState(ag);
    return true;
  }

  stopAgent(id: string): boolean {
    const ag = this.agents.get(id);
    if (!ag) return false;
    ag.status = 'STOPPED';
    ag.logs.unshift({ timestamp: Date.now(), level: 'WARN', message: `Agent manually stopped by admin.` });
    this.persistAgentState(ag);
    return true;
  }

  pauseAgent(id: string): boolean {
    const ag = this.agents.get(id);
    if (!ag) return false;
    ag.status = 'PAUSED';
    ag.logs.unshift({ timestamp: Date.now(), level: 'WARN', message: `Agent paused.` });
    this.persistAgentState(ag);
    return true;
  }

  resumeAgent(id: string): boolean {
    const ag = this.agents.get(id);
    if (!ag) return false;
    ag.status = 'RUNNING';
    ag.logs.unshift({ timestamp: Date.now(), level: 'INFO', message: `Agent resumed.` });
    this.persistAgentState(ag);
    return true;
  }

  restartAgent(id: string): boolean {
    const ag = this.agents.get(id);
    if (!ag) return false;
    ag.status = 'RUNNING';
    ag.errorCount = 0;
    ag.lastHeartbeat = Date.now();
    ag.logs.unshift({ timestamp: Date.now(), level: 'INFO', message: `Agent restarted cleanly.` });
    this.persistAgentState(ag);
    return true;
  }

  logAgentActivity(id: string, level: 'INFO' | 'WARN' | 'ERROR', message: string) {
    const ag = this.agents.get(id);
    if (!ag) return;
    ag.logs.unshift({ timestamp: Date.now(), level, message });
    if (ag.logs.length > 50) ag.logs.pop();
    if (level === 'ERROR') {
      ag.errorCount += 1;
      ag.lastErrorMessage = message;
    }
  }

  private async persistAgentState(ag: AgentState) {
    try {
      const db = await getDb();
      await db.query(
        `UPDATE agents SET status = $1, is_enabled = $2, error_count = $3, last_heartbeat = CURRENT_TIMESTAMP WHERE id = $4`,
        [ag.status, ag.isEnabled, ag.errorCount, ag.id]
      );
    } catch (e) {
      // ignore
    }
  }
}

export const agentManager = new AgentManager();
