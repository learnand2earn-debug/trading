export type RuleCategory =
  | 'SOURCE_RULE'
  | 'CUSTOM_CONFIGURATION'
  | 'OPTIONAL_CONFLUENCE'
  | 'AI_RESEARCH_SUGGESTION'
  | 'ENGINEERING_DEFAULT';

export interface StrategyConditionCheck {
  name: string;
  category: RuleCategory;
  isAmbiguous?: boolean;
  selectedInterpretation?: string;
  passed: boolean;
  actualValue: any;
  requiredCondition: string;
  reason: string;
}

export interface StrategySignalResult {
  strategyCode: string;
  strategyName: string;
  version: string;
  symbol: string;
  signalValid: boolean;
  signalType: 'LONG' | 'NONE';
  entryPrice: number;
  targetPrice: number; // +1% Target
  stopLossPrice?: number;
  conditions: StrategyConditionCheck[];
  indicatorsSnapshot: Record<string, any>;
  explanation: string;
  evaluatedAt: number;
  leadTimeSeconds: number;
}
