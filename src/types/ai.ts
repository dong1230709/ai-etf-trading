// AI Engine类型定义

import type { StockQuoteWithValidation } from './quote';

// 市场状态类型
export type MarketState = 
  | 'trending_up'        // 趋势上涨
  | 'high_range_shock'   // 高位震荡
  | 'low_range_shock'    // 低位震荡
  | 'sharp_drop_panic'   // 急跌恐慌
  | 'high_vol_risk';     // 高波动风险

// 风险等级
export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

// AI评分结果
export interface AIScore {
  overall: number;              // 综合评分 0-100
  trend: number;                // 趋势评分
  volatility: number;           // 波动率评分
  volume: number;               // 成交量评分
  momentum: number;             // 动量评分
  meanReversion: number;        // 均值回归评分
}

// 波动率分析
export interface VolatilityAnalysis {
  currentVolatility: number;    // 当前波动率
  historicalAvg: number;        // 历史平均
  volatilityRatio: number;      // 波动率比值
  atrValue: number;             // ATR值
  bollingerWidth: number;       // 布林带宽度
  impliedVolatility?: number;   // 隐含波动率
  trendStrength: number;        // 趋势强度
}

// 市场状态识别结果
export interface MarketStateResult {
  state: MarketState;
  confidence: number;           // 识别置信度
  reasons: string[];            // 识别依据
  duration: number;             // 状态持续时间估计
}

// 风险评分
export interface RiskScore {
  overall: number;              // 综合风险 0-100
  volatilityRisk: number;       // 波动风险
  drawdownRisk: number;         // 回撤风险
  liquidityRisk: number;        // 流动性风险
  systemicRisk: number;         // 系统性风险
  trendRisk: number;            // 趋势风险
  level: RiskLevel;
}

// AI执行计划
export interface AIExecutionPlan {
  id: string;
  symbol: string;
  name: string;
  timestamp: number;
  
  // AI建议
  suggestion: 'buy' | 'sell' | 'hold' | 'reduce' | 'add';
  suggestionText: string;
  
  // 评分
  aiScore: AIScore;
  riskScore: RiskScore;
  
  // 市场状态
  marketState: MarketStateResult;
  volatilityAnalysis: VolatilityAnalysis;
  
  // 仓位建议
  positionAdvice: {
    basePosition: number;       // 底仓建议比例 0-1
    gridPosition: number;       // 网格仓位建议 0-1
    maxPosition: number;        // 最大仓位 0-1
    positionText: string;
  };
  
  // 网格建议
  gridAdvice: {
    gridCount: number;
    spacingType: 'arithmetic' | 'geometric';
    spacingPercent: number;
    upperPrice: number;
    lowerPrice: number;
    allocationType: 'fixed' | 'pyramid' | 'percentage';
    gridText: string;
  };
  
  // 执行步骤
  executionSteps: {
    type: 'now' | 'price' | 'time';
    price?: number;
    time?: Date;
    action: string;
    description: string;
    priority: number;
  }[];
  
  // 置信度
  confidence: number;
  
  // 有效期
  validUntil: number;
}

// 历史价格点（用于分析）
export interface PricePoint {
  price: number;
  volume: number;
  timestamp: number;
}

// 技术指标
export interface TechnicalIndicators {
  ma5: number;
  ma10: number;
  ma20: number;
  ma60: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    width: number;
  };
  atr: number;
}

// AI引擎配置
export interface AIEngineConfig {
  volatilityWindow: number;     // 波动率窗口大小
  trendWindow: number;          // 趋势窗口大小
  lookbackPeriods: number;      // 回顾周期数
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

// 默认配置
export const DEFAULT_AI_CONFIG: AIEngineConfig = {
  volatilityWindow: 20,
  trendWindow: 10,
  lookbackPeriods: 60,
  riskTolerance: 'moderate',
};

// 市场状态显示文本
export const MARKET_STATE_LABELS: Record<MarketState, string> = {
  trending_up: '趋势上涨',
  high_range_shock: '高位震荡',
  low_range_shock: '低位震荡',
  sharp_drop_panic: '急跌恐慌',
  high_vol_risk: '高波动风险',
};

// 风险等级颜色
export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: 'text-finance-green',
  medium: 'text-finance-gold',
  high: 'text-finance-red',
  extreme: 'text-red-500',
};

// 建议图标颜色
export const SUGGESTION_COLORS: Record<AIExecutionPlan['suggestion'], string> = {
  buy: 'text-finance-green bg-finance-green/20',
  sell: 'text-finance-red bg-finance-red/20',
  hold: 'text-finance-gold bg-finance-gold/20',
  reduce: 'text-orange-400 bg-orange-400/20',
  add: 'text-finance-blue bg-finance-blue/20',
};

export const SUGGESTION_LABELS: Record<AIExecutionPlan['suggestion'], string> = {
  buy: '买入',
  sell: '卖出',
  hold: '持有',
  reduce: '减仓',
  add: '加仓',
};
