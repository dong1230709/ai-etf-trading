// 网格引擎核心类型定义

export interface GridConfig {
  symbol: string;
  name: string;
  gridCount: number;
  upperPrice: number;
  lowerPrice: number;
  spacingType: 'arithmetic' | 'geometric' | 'custom';
  spacingPercent: number;
  fundMode: 'fixed' | 'pyramid' | 'percentage';
  totalFund: number;
  buyEnabled: boolean;
  sellEnabled: boolean;
  autoRebalance: boolean;
}

export interface GridLevel {
  level: number;
  price: number;
  upperPrice: number;
  lowerPrice: number;
  fundAmount: number;
  position: number;
  avgCost: number;
  status: 'idle' | 'buy' | 'sell' | 'filled';
  buyPrice?: number;
  sellPrice?: number;
}

export interface GridStrategy {
  config: GridConfig;
  grids: GridLevel[];
  totalInvested: number;
  totalPosition: number;
  avgCost: number;
  totalProfit: number;
  profitPercent: number;
  potentialProfit: number;
}

export interface SimulationConfig {
  startPrice: number;
  endPrice: number;
  volatility: number;
  steps: number;
  simulateCount: number;
}

export interface SimulationResult {
  pricePath: number[];
  trades: SimulatedTrade[];
  profit: number;
  profitPercent: number;
  maxProfit: number;
  minProfit: number;
  avgProfit: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface SimulatedTrade {
  step: number;
  price: number;
  action: 'buy' | 'sell';
  quantity: number;
  amount: number;
  gridLevel: number;
}

export interface AIRecommendation {
  suggestedGridCount: number;
  suggestedSpacing: number;
  suggestedSpacingType: 'arithmetic' | 'geometric' | 'custom';
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  reasons: string[];
}

export type FundMode = 'fixed' | 'pyramid' | 'percentage';
export type SpacingType = 'arithmetic' | 'geometric' | 'custom';
export type GridStatus = 'idle' | 'buy' | 'sell' | 'filled';
export type RiskLevel = 'low' | 'medium' | 'high';

export const PRESET_GRIDS = [5, 10, 15, 20, 30] as const;
export const SPACING_PRESETS = {
  tight: 0.5,
  normal: 1.0,
  wide: 2.0,
  veryWide: 3.0,
} as const;
