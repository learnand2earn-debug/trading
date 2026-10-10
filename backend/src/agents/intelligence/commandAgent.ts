import { v4 as uuidv4 } from 'uuid';
import { riskEngine } from '../../risk/riskEngine.js';
import { executionEngine } from '../../execution/executionEngine.js';
import { strategyRegistry } from '../../strategies/index.js';
import { candleStore } from '../../market-data/candleStore.js';

export interface ParsedCommand {
  command_id: string;
  original_prompt: string;
  action_type:
    | 'SCAN_ALL'
    | 'FILTER_STRATEGY'
    | 'SHOW_SIGNALS'
    | 'SHOW_TRADES'
    | 'PAUSE_TRADING'
    | 'RESUME_TRADING'
    | 'EMERGENCY_STOP'
    | 'RUN_BACKTEST'
    | 'EXPLAIN_SIGNAL'
    | 'COMPARE_STRATEGIES'
    | 'UNKNOWN';
  parameters: Record<string, any>;
  safe_to_execute: boolean;
  requires_risk_approval: boolean;
  explanation: string;
}

export class CommandAgent {
  parseUserPrompt(prompt: string): ParsedCommand {
    const p = prompt.trim().toLowerCase();
    const command_id = `cmd-${uuidv4()}`;

    if (p.includes('kill') || p.includes('emergency') || p.includes('halt all')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'EMERGENCY_STOP',
        parameters: { actor: 'command_center' },
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Emergency stop initiated. Halts all active trading and signal generation.'
      };
    }

    if (p.includes('pause live') || p.includes('pause trading')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'PAUSE_TRADING',
        parameters: {},
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Pauses live order routing while keeping market surveillance and signals active.'
      };
    }

    if (p.includes('resume trading') || p.includes('resume live')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'RESUME_TRADING',
        parameters: {},
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Resumes live order execution.'
      };
    }

    if (p.includes('scan binance') || p.includes('scan now') || p.includes('refresh scanner') || p.includes('scan all') || p.includes('scan market')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'SCAN_ALL',
        parameters: { limit: 20 },
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Initiating full multi-timeframe scan across Binance spot pairs.'
      };
    }

    if (p.includes('price action')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'FILTER_STRATEGY',
        parameters: { strategy: 'PRICE_ACTION' },
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Filtering coins matching Strategy 1: Price Action source methodology.'
      };
    }

    if (p.includes('v1 + ema') || p.includes('v1 ema')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'FILTER_STRATEGY',
        parameters: { strategy: 'V1_EMA' },
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Filtering coins matching Strategy 5: V1 + EMA methodology.'
      };
    }

    if (p.includes('v1')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'FILTER_STRATEGY',
        parameters: { strategy: 'V1_METHOD' },
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Filtering coins matching Strategy 2: V1 Method (Smoothed Heiken Ashi V1).'
      };
    }

    if (p.includes('gainer') || p.includes('gainers')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'FILTER_STRATEGY',
        parameters: { strategy: 'GAINERS_METHOD' },
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Evaluating Top 7 Binance gainers with ~40% pump and restriction checks.'
      };
    }

    if (p.includes('hidden bullish')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'FILTER_STRATEGY',
        parameters: { strategy: 'HIDDEN_BULLISH' },
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Filtering setups matching Strategy 4: Source 10-candle drop methodology.'
      };
    }

    if (p.includes('ob') || p.includes('order block')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'FILTER_STRATEGY',
        parameters: { strategy: 'OB_METHOD' },
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Locating Bullish Order Blocks (3+ green pump preceded by red candle).'
      };
    }

    if (p.includes('ict')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'FILTER_STRATEGY',
        parameters: { strategy: 'ICT_METHOD' },
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Evaluating Strategy 7: ICT Method (RSI 30-40, non-sideways 1H trend).'
      };
    }

    if (p.includes('trades') || p.includes('today')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'SHOW_TRADES',
        parameters: {},
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Retrieving all closed and active positions from the trade journal.'
      };
    }

    if (p.includes('signals') || p.includes('active signals')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'SHOW_SIGNALS',
        parameters: {},
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Listing all verified strategy signals.'
      };
    }

    if (p.includes('compare') || p.includes('all seven') || p.includes('all 7')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'COMPARE_STRATEGIES',
        parameters: {},
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Generating side-by-side comparison of all 7 source trading strategies.'
      };
    }

    if (p.includes('backtest')) {
      return {
        command_id,
        original_prompt: prompt,
        action_type: 'RUN_BACKTEST',
        parameters: { strategy: 'PRICE_ACTION', days: 30 },
        safe_to_execute: true,
        requires_risk_approval: false,
        explanation: 'Executing historical backtesting engine with +1% profit target and fee modeling.'
      };
    }

    return {
      command_id,
      original_prompt: prompt,
      action_type: 'UNKNOWN',
      parameters: {},
      safe_to_execute: false,
      requires_risk_approval: false,
      explanation: 'Could not resolve prompt into a deterministic system action. Please select from known commands.'
    };
  }

  async executeCommand(cmd: ParsedCommand): Promise<{ success: boolean; data: any; message: string }> {
    switch (cmd.action_type) {
      case 'EMERGENCY_STOP':
        riskEngine.triggerEmergencyKillAllTrading('CommandCenter');
        return { success: true, data: { status: 'HALTED' }, message: 'EMERGENCY KILL SWITCH ACTIVATED. All trading stopped.' };

      case 'PAUSE_TRADING':
        riskEngine.setTradingMode('ANALYSIS');
        return { success: true, data: { mode: 'ANALYSIS' }, message: 'Trading switched to ANALYSIS mode (No live/paper orders).' };

      case 'RESUME_TRADING':
        riskEngine.setTradingMode('PAPER');
        return { success: true, data: { mode: 'PAPER' }, message: 'Trading resumed in PAPER mode.' };

      case 'SHOW_TRADES':
        return { success: true, data: executionEngine.getClosedTrades(), message: 'Retrieved trade records.' };

      case 'SHOW_SIGNALS':
        const symbols = candleStore.getAllSymbols().slice(0, 5);
        const signals = [];
        for (const sym of symbols) {
          const evalRes = await strategyRegistry.evaluateAllStrategiesForSymbol(sym);
          signals.push(...evalRes.filter(s => s.signalValid));
        }
        return { success: true, data: signals, message: `Found ${signals.length} valid signals.` };

      case 'COMPARE_STRATEGIES':
        return {
          success: true,
          data: [
            { id: '1', name: 'Price Action', tf: '1D/1H/30M', rsi: '25-40', target: '1%', keyRule: '1D Up/Sideways, Support + Liquidity' },
            { id: '2', name: 'V1 Method', tf: '1D/1H/30M', rsi: 'Cross 54', target: '1%', keyRule: '1D Mandatory UP, Heiken Ashi V1 Green/Trans' },
            { id: '3', name: 'Gainers Method', tf: '24h/1H', rsi: 'N/A', target: '1%', keyRule: 'Top 7 Binance, ~40% pump, 3 pairs, Not monitored' },
            { id: '4', name: 'Hidden Bullish', tf: '1H/30M', rsi: '25-40', target: '1%', keyRule: '10-candle drop structure (Not textbook divergence)' },
            { id: '5', name: 'V1 + EMA', tf: '1H/30M', rsi: 'Cross 54', target: '1%', keyRule: 'EMA 9 / EMA 33 Bullish Cross + Retest' },
            { id: '6', name: 'OB Method', tf: '1H/15M', rsi: 'N/A', target: '1%', keyRule: '3+ green pump preceded by red candle, 15M retest' },
            { id: '7', name: 'ICT Method', tf: '1H', rsi: '30-40', target: '1%', keyRule: 'Curr Green / Prev Red, ~1% pump, 1H NOT sideways' }
          ],
          message: 'All 7 strategies comparison generated.'
        };

      default:
        return { success: false, data: null, message: `Command ${cmd.action_type} executed with parameter inspection.` };
    }
  }
}

export const commandAgent = new CommandAgent();
