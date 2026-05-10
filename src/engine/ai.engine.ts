// AI Engine核心引擎

import type {
  AIScore,
  RiskScore,
  MarketStateResult,
  MarketState,
  VolatilityAnalysis,
  TechnicalIndicators,
  AIExecutionPlan,
  PricePoint,
  AIEngineConfig,
} from '../types/ai';
import { DEFAULT_AI_CONFIG, MARKET_STATE_LABELS } from '../types/ai';
import type { StockQuoteWithValidation } from '../types/quote';

// 历史数据存储（模拟）
const priceHistory: Record<string, PricePoint[]> = {};

/**
 * 生成模拟历史数据（基于当前价格）
 */
function generateHistoricalData(
  currentPrice: number,
  symbol: string,
  lookback: number = 60
): PricePoint[] {
  if (priceHistory[symbol]) {
    return priceHistory[symbol];
  }

  const points: PricePoint[] = [];
  const now = Date.now();
  let price = currentPrice * 0.95;

  for (let i = lookback - 1; i >= 0; i--) {
    const volatility = 0.015;
    const trend = (currentPrice - price) / lookback * 0.5;
    const randomChange = (Math.random() - 0.5) * volatility * price;
    
    price = price + trend + randomChange;
    price = Math.max(price, currentPrice * 0.8);
    
    const volume = 1000000 + Math.random() * 5000000;
    
    points.push({
      price,
      volume,
      timestamp: now - i * 60000,
    });
  }

  points.push({
    price: currentPrice,
    volume: 1500000,
    timestamp: now,
  });

  priceHistory[symbol] = points;
  return points;
}

/**
 * 更新历史数据
 */
function updateHistoricalData(symbol: string, price: number, volume: number) {
  const history = priceHistory[symbol] || [];
  const now = Date.now();

  history.push({
    price,
    volume,
    timestamp: now,
  });

  if (history.length > 100) {
    history.shift();
  }

  priceHistory[symbol] = history;
}

/**
 * 计算移动平均线
 */
function calculateMA(prices: number[], period: number): number {
  if (prices.length < period) {
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  }
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * 计算RSI
 */
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) {
    return 50;
  }

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) {
    return 100;
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return rsi;
}

/**
 * 计算MACD
 */
function calculateMACD(prices: number[]): {
  macd: number;
  signal: number;
  histogram: number;
} {
  if (prices.length < 35) {
    return { macd: 0, signal: 0, histogram: 0 };
  }

  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;

  const macdLine: number[] = [];
  for (let i = 0; i < 26; i++) {
    const slice = prices.slice(0, prices.length - 26 + i + 1);
    const e12 = calculateEMA(slice, 12);
    const e26 = calculateEMA(slice, 26);
    macdLine.push(e12 - e26);
  }
  const signal = calculateEMA(macdLine, 9);

  return {
    macd,
    signal,
    histogram: macd - signal,
  };
}

/**
 * 计算EMA
 */
function calculateEMA(prices: number[], period: number): number {
  const k = 2 / (period + 1);
  let ema = prices[0];

  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return ema;
}

/**
 * 计算布林带
 */
function calculateBollinger(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): {
  upper: number;
  middle: number;
  lower: number;
  width: number;
} {
  if (prices.length < period) {
    const price = prices[prices.length - 1];
    return {
      upper: price * 1.02,
      middle: price,
      lower: price * 0.98,
      width: 0.04,
    };
  }

  const slice = prices.slice(-period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;

  const variance = slice.reduce((sum, price) => {
    return sum + Math.pow(price - sma, 2);
  }, 0) / period;
  const standardDeviation = Math.sqrt(variance);

  const upper = sma + standardDeviation * stdDev;
  const lower = sma - standardDeviation * stdDev;
  const width = (upper - lower) / sma;

  return { upper, middle: sma, lower, width };
}

/**
 * 计算ATR
 */
function calculateATR(prices: number[], highs: number[], lows: number[], period: number = 14): number {
  if (prices.length < period + 1) {
    return prices[prices.length - 1] * 0.015;
  }

  const trValues: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const high = highs[i] || prices[i] * 1.01;
    const low = lows[i] || prices[i] * 0.99;
    const prevClose = prices[i - 1];

    const tr1 = high - low;
    const tr2 = Math.abs(high - prevClose);
    const tr3 = Math.abs(low - prevClose);

    trValues.push(Math.max(tr1, tr2, tr3));
  }

  return calculateMA(trValues, period);
}

/**
 * 计算技术指标
 */
function calculateTechnicalIndicators(
  history: PricePoint[],
  currentQuote?: StockQuoteWithValidation
): TechnicalIndicators {
  const prices = history.map(p => p.price);
  const highs = history.map(p => p.price * 1.005);
  const lows = history.map(p => p.price * 0.995);

  const ma5 = calculateMA(prices, 5);
  const ma10 = calculateMA(prices, 10);
  const ma20 = calculateMA(prices, 20);
  const ma60 = calculateMA(prices, Math.min(60, prices.length));
  const rsi = calculateRSI(prices, 14);
  const macd = calculateMACD(prices);
  const bollinger = calculateBollinger(prices, 20);
  const atr = calculateATR(prices, highs, lows, 14);

  return {
    ma5,
    ma10,
    ma20,
    ma60,
    rsi,
    macd,
    bollinger,
    atr,
  };
}

/**
 * 计算波动率
 */
function calculateVolatility(history: PricePoint[]): VolatilityAnalysis {
  const prices = history.map(p => p.price);

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  const annualizedVolatility = stdDev * Math.sqrt(252);

  const bollinger = calculateBollinger(prices);
  const highs = history.map(p => p.price * 1.01);
  const lows = history.map(p => p.price * 0.99);
  const atr = calculateATR(prices, highs, lows, 14);

  const historicalAvg = 0.15;
  const volatilityRatio = annualizedVolatility / historicalAvg;

  const priceChanges = prices.slice(-10).map((p, i) => i > 0 ? Math.abs(p - prices[prices.length - 10 + i - 1]) : 0);
  const upCount = priceChanges.filter((_, i) => i > 0 && prices[prices.length - 10 + i] > prices[prices.length - 10 + i - 1]).length;
  const trendStrength = Math.abs(upCount - (priceChanges.length - upCount - 1)) / (priceChanges.length - 1);

  return {
    currentVolatility: annualizedVolatility * 100,
    historicalAvg: historicalAvg * 100,
    volatilityRatio,
    atrValue: atr,
    bollingerWidth: bollinger.width * 100,
    trendStrength,
  };
}

/**
 * 识别市场状态
 */
function identifyMarketState(
  history: PricePoint[],
  indicators: TechnicalIndicators,
  volatility: VolatilityAnalysis,
  quote?: StockQuoteWithValidation
): MarketStateResult {
  const prices = history.map(p => p.price);
  const currentPrice = prices[prices.length - 1];

  const recentPrices = prices.slice(-20);
  const avg20 = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const recent10 = prices.slice(-10);
  const avg10 = recent10.reduce((a, b) => a + b, 0) / recent10.length;
  const recent5 = prices.slice(-5);
  const avg5 = recent5.reduce((a, b) => a + b, 0) / recent5.length;

  const upDays = prices.slice(-10).filter((p, i) => i > 0 && p > prices[prices.length - 10 + i - 1]).length;

  let state: MarketState = 'low_range_shock';
  let confidence = 50;
  const reasons: string[] = [];

  const changePercent = quote?.changePercent || 0;
  const rsi = indicators.rsi;
  const bollingerWidth = volatility.bollingerWidth;

  if (changePercent <= -3) {
    state = 'sharp_drop_panic';
    confidence = 90;
    reasons.push(`单日跌幅 ${changePercent.toFixed(2)}%，市场恐慌`);
    if (bollingerWidth > 5) {
      reasons.push('波动率显著放大');
    }
  } else if (volatility.currentVolatility > 40 || bollingerWidth > 6) {
    state = 'high_vol_risk';
    confidence = 85;
    reasons.push(`波动率 ${volatility.currentVolatility.toFixed(1)}%，处于高位`);
    reasons.push(`布林带宽度 ${bollingerWidth.toFixed(1)}%`);
  } else if (avg5 > avg10 && avg10 > avg20 && upDays >= 7) {
    state = 'trending_up';
    confidence = 80;
    reasons.push(`5日/10日/20日均线向上发散`);
    reasons.push(`近10日 ${upDays} 日上涨`);
    if (rsi > 50 && rsi < 70) {
      reasons.push(`RSI ${rsi.toFixed(0)}，趋势健康`);
    }
  } else if (currentPrice > avg20 * 1.02 && Math.abs(avg5 - avg10) / avg10 < 0.01) {
    state = 'high_range_shock';
    confidence = 75;
    reasons.push(`价格高于20日均线 ${((currentPrice / avg20 - 1) * 100).toFixed(1)}%`);
    reasons.push(`短期均线走平，震荡特征`);
  } else if (currentPrice < avg20 * 0.98) {
    state = 'low_range_shock';
    confidence = 70;
    reasons.push(`价格低于20日均线 ${((1 - currentPrice / avg20) * 100).toFixed(1)}%`);
    reasons.push(`处于相对低位区域`);
  } else {
    state = 'low_range_shock';
    confidence = 60;
    reasons.push(`震荡整理中，无明确趋势`);
  }

  if (rsi > 70) {
    reasons.push(`RSI ${rsi.toFixed(0)}，超买区域`);
  } else if (rsi < 30) {
    reasons.push(`RSI ${rsi.toFixed(0)}，超卖区域`);
  }

  return {
    state,
    confidence,
    reasons,
    duration: 30,
  };
}

/**
 * 计算AI评分
 */
function calculateAIScore(
  history: PricePoint[],
  indicators: TechnicalIndicators,
  volatility: VolatilityAnalysis,
  marketState: MarketStateResult,
  quote?: StockQuoteWithValidation
): AIScore {
  const prices = history.map(p => p.price);
  const currentPrice = prices[prices.length - 1];

  let trendScore = 50;
  const ma5 = indicators.ma5;
  const ma10 = indicators.ma10;
  const ma20 = indicators.ma20;
  
  if (ma5 > ma10 && ma10 > ma20) {
    trendScore = 70 + (currentPrice - ma20) / ma20 * 200;
  } else if (ma5 < ma10 && ma10 < ma20) {
    trendScore = 30 - (ma20 - currentPrice) / ma20 * 200;
  }
  
  if (indicators.macd.macd > indicators.macd.signal) {
    trendScore += 10;
  }
  trendScore = Math.max(0, Math.min(100, trendScore));

  let volatilityScore = 50;
  const volRatio = volatility.volatilityRatio;
  if (volRatio < 0.8) {
    volatilityScore = 70;
  } else if (volRatio > 1.5) {
    volatilityScore = 30;
  } else {
    volatilityScore = 50 + (1.2 - volRatio) * 50;
  }
  volatilityScore = Math.max(0, Math.min(100, volatilityScore));

  let volumeScore = 50;
  const recentVolumes = history.slice(-10).map(p => p.volume);
  const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  const currentVolume = history[history.length - 1].volume;
  
  if (currentVolume > avgVolume * 1.3) {
    volumeScore = 65;
  } else if (currentVolume < avgVolume * 0.7) {
    volumeScore = 35;
  }
  volumeScore = Math.max(0, Math.min(100, volumeScore));

  let momentumScore = 50;
  const rsi = indicators.rsi;
  if (rsi > 40 && rsi < 60) {
    momentumScore = 70;
  } else if (rsi > 60 && rsi < 75) {
    momentumScore = 75;
  } else if (rsi > 75) {
    momentumScore = 40;
  } else if (rsi < 30) {
    momentumScore = 60;
  } else if (rsi < 40) {
    momentumScore = 45;
  }

  let meanReversionScore = 50;
  const bollinger = indicators.bollinger;
  const positionInBand = (currentPrice - bollinger.lower) / (bollinger.upper - bollinger.lower);
  
  if (positionInBand < 0.25) {
    meanReversionScore = 75;
  } else if (positionInBand > 0.75) {
    meanReversionScore = 35;
  } else {
    meanReversionScore = 50 + (0.5 - positionInBand) * 40;
  }
  meanReversionScore = Math.max(0, Math.min(100, meanReversionScore));

  const overall = (
    trendScore * 0.25 +
    volatilityScore * 0.20 +
    volumeScore * 0.15 +
    momentumScore * 0.20 +
    meanReversionScore * 0.20
  );

  return {
    overall: Math.round(overall),
    trend: Math.round(trendScore),
    volatility: Math.round(volatilityScore),
    volume: Math.round(volumeScore),
    momentum: Math.round(momentumScore),
    meanReversion: Math.round(meanReversionScore),
  };
}

/**
 * 计算风险评分
 */
function calculateRiskScore(
  history: PricePoint[],
  indicators: TechnicalIndicators,
  volatility: VolatilityAnalysis,
  marketState: MarketStateResult,
  quote?: StockQuoteWithValidation
): RiskScore {
  const prices = history.map(p => p.price);
  const currentPrice = prices[prices.length - 1];

  let volatilityRisk = 30;
  const volPercent = volatility.currentVolatility;
  if (volPercent > 40) {
    volatilityRisk = 85;
  } else if (volPercent > 30) {
    volatilityRisk = 70;
  } else if (volPercent > 20) {
    volatilityRisk = 50;
  } else if (volPercent > 15) {
    volatilityRisk = 35;
  }

  let drawdownRisk = 30;
  const maxPrice = Math.max(...prices.slice(-30));
  const drawdown = (maxPrice - currentPrice) / maxPrice * 100;
  
  if (drawdown > 15) {
    drawdownRisk = 75;
  } else if (drawdown > 10) {
    drawdownRisk = 55;
  } else if (drawdown > 5) {
    drawdownRisk = 40;
  }

  const rsi = indicators.rsi;
  let trendRisk = 30;
  if (rsi > 75) {
    trendRisk = 65;
  } else if (rsi < 25) {
    trendRisk = 55;
  } else if (marketState.state === 'sharp_drop_panic') {
    trendRisk = 80;
  } else if (marketState.state === 'high_vol_risk') {
    trendRisk = 70;
  }

  let liquidityRisk = 20;
  const recentVolumes = history.slice(-10).map(p => p.volume);
  const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  const currentVolume = history[history.length - 1].volume;
  
  if (currentVolume < avgVolume * 0.5) {
    liquidityRisk = 50;
  }

  let systemicRisk = 30;
  if (marketState.state === 'sharp_drop_panic') {
    systemicRisk = 70;
  } else if (marketState.state === 'high_vol_risk') {
    systemicRisk = 55;
  }

  const overall = (
    volatilityRisk * 0.30 +
    drawdownRisk * 0.20 +
    liquidityRisk * 0.15 +
    systemicRisk * 0.20 +
    trendRisk * 0.15
  );

  let level: 'low' | 'medium' | 'high' | 'extreme' = 'low';
  if (overall > 80) {
    level = 'extreme';
  } else if (overall > 60) {
    level = 'high';
  } else if (overall > 40) {
    level = 'medium';
  }

  return {
    overall: Math.round(overall),
    volatilityRisk: Math.round(volatilityRisk),
    drawdownRisk: Math.round(drawdownRisk),
    liquidityRisk: Math.round(liquidityRisk),
    systemicRisk: Math.round(systemicRisk),
    trendRisk: Math.round(trendRisk),
    level,
  };
}

/**
 * 生成AI执行计划
 */
function generateExecutionPlan(
  symbol: string,
  name: string,
  history: PricePoint[],
  aiScore: AIScore,
  riskScore: RiskScore,
  marketState: MarketStateResult,
  volatility: VolatilityAnalysis,
  indicators: TechnicalIndicators,
  quote?: StockQuoteWithValidation
): AIExecutionPlan {
  const currentPrice = history[history.length - 1].price;

  let suggestion: 'buy' | 'sell' | 'hold' | 'reduce' | 'add' = 'hold';
  let suggestionText = '';

  if (marketState.state === 'sharp_drop_panic' && aiScore.meanReversion > 70) {
    suggestion = 'buy';
    suggestionText = '急跌后出现超卖，可考虑分批建仓';
  } else if (marketState.state === 'trending_up' && aiScore.trend > 60 && riskScore.overall < 60) {
    suggestion = 'add';
    suggestionText = '趋势向上，可适当加仓';
  } else if (aiScore.overall < 30 && riskScore.overall > 60) {
    suggestion = 'reduce';
    suggestionText = '评分较低风险较高，建议减仓控制风险';
  } else if (aiScore.overall > 70 && riskScore.overall < 40) {
    suggestion = 'buy';
    suggestionText = 'AI评分良好，可考虑建仓';
  } else if (aiScore.overall < 30 && aiScore.trend < 30) {
    suggestion = 'sell';
    suggestionText = '趋势走弱，建议卖出';
  } else {
    suggestion = 'hold';
    suggestionText = '市场震荡中，建议持有观望';
  }

  let basePosition = 0.3;
  let gridPosition = 0.5;
  let maxPosition = 0.8;
  let positionText = '';

  if (riskScore.level === 'low') {
    basePosition = 0.4;
    gridPosition = 0.5;
    maxPosition = 0.9;
    positionText = '风险较低，可适度增加仓位';
  } else if (riskScore.level === 'medium') {
    basePosition = 0.3;
    gridPosition = 0.4;
    maxPosition = 0.7;
    positionText = '中等风险，保持适中仓位';
  } else if (riskScore.level === 'high') {
    basePosition = 0.2;
    gridPosition = 0.3;
    maxPosition = 0.5;
    positionText = '风险较高，降低仓位';
  } else {
    basePosition = 0.1;
    gridPosition = 0.2;
    maxPosition = 0.3;
    positionText = '极高风险，严格控制仓位';
  }

  let gridCount = 10;
  let spacingPercent = 1.5;
  let spacingType: 'arithmetic' | 'geometric' = 'geometric';
  let allocationType: 'fixed' | 'pyramid' | 'percentage' = 'pyramid';
  let gridText = '';

  if (marketState.state === 'high_vol_risk' || volatility.currentVolatility > 30) {
    gridCount = 15;
    spacingPercent = 2.0;
    gridText = '高波动环境，增加网格数量和间距';
  } else if (marketState.state === 'trending_up') {
    gridCount = 8;
    spacingPercent = 1.2;
    gridText = '趋势行情，减少网格数量避免踏空';
  } else if (marketState.state === 'low_range_shock') {
    gridCount = 12;
    spacingPercent = 1.0;
    allocationType = 'fixed';
    gridText = '低位震荡，密集网格捕捉波动';
  } else {
    gridText = '标准网格配置';
  }

  const upperPrice = currentPrice * (1 + spacingPercent * gridCount / 100 * 0.5);
  const lowerPrice = currentPrice * (1 - spacingPercent * gridCount / 100 * 0.5);

  const executionSteps = [];

  if (suggestion === 'buy' || suggestion === 'add') {
    executionSteps.push({
      type: 'now' as const,
      action: 'buy',
      description: `当前价格 ${currentPrice.toFixed(3)}，可买入底仓`,
      priority: 1,
    });
    executionSteps.push({
      type: 'price' as const,
      price: currentPrice * 0.98,
      action: 'buy',
      description: `跌破 ${(currentPrice * 0.98).toFixed(3)} 可加仓`,
      priority: 2,
    });
  } else if (suggestion === 'sell' || suggestion === 'reduce') {
    executionSteps.push({
      type: 'now' as const,
      action: 'sell',
      description: `当前价格 ${currentPrice.toFixed(3)}，可减仓`,
      priority: 1,
    });
  }

  executionSteps.push({
    type: 'price' as const,
    price: upperPrice,
    action: 'sell',
    description: `触及上沿 ${upperPrice.toFixed(3)} 可止盈`,
    priority: 3,
  });

  executionSteps.push({
    type: 'price' as const,
    price: lowerPrice,
    action: 'buy',
    description: `触及下沿 ${lowerPrice.toFixed(3)} 可加仓`,
    priority: 3,
  });

  let confidence = 70;
  if (marketState.confidence > 80) {
    confidence = 85;
  } else if (marketState.confidence < 60) {
    confidence = 55;
  }

  return {
    id: `${symbol}-${Date.now()}`,
    symbol,
    name,
    timestamp: Date.now(),
    suggestion,
    suggestionText,
    aiScore,
    riskScore,
    marketState,
    volatilityAnalysis: volatility,
    positionAdvice: {
      basePosition,
      gridPosition,
      maxPosition,
      positionText,
    },
    gridAdvice: {
      gridCount,
      spacingType,
      spacingPercent,
      upperPrice,
      lowerPrice,
      allocationType,
      gridText,
    },
    executionSteps,
    confidence,
    validUntil: Date.now() + 3600000,
  };
}

/**
 * AI Engine主类
 */
export class AIEngine {
  config: AIEngineConfig;

  constructor(config: AIEngineConfig = DEFAULT_AI_CONFIG as AIEngineConfig) {
    this.config = config;
  }

  analyze(
    symbol: string,
    name: string,
    quote?: StockQuoteWithValidation
  ): AIExecutionPlan {
    const currentPrice = quote?.price || 4.0;
    
    if (quote) {
      updateHistoricalData(symbol, quote.price, quote.volume);
    }

    const history = generateHistoricalData(currentPrice, symbol, this.config.lookbackPeriods);
    const indicators = calculateTechnicalIndicators(history, quote);
    const volatility = calculateVolatility(history);
    const marketState = identifyMarketState(history, indicators, volatility, quote);
    const aiScore = calculateAIScore(history, indicators, volatility, marketState, quote);
    const riskScore = calculateRiskScore(history, indicators, volatility, marketState, quote);

    return generateExecutionPlan(
      symbol,
      name,
      history,
      aiScore,
      riskScore,
      marketState,
      volatility,
      indicators,
      quote
    );
  }

  getVolatilityAnalysis(
    symbol: string,
    quote?: StockQuoteWithValidation
  ): VolatilityAnalysis {
    const currentPrice = quote?.price || 4.0;
    const history = generateHistoricalData(currentPrice, symbol, this.config.lookbackPeriods);
    return calculateVolatility(history);
  }

  getMarketState(
    symbol: string,
    quote?: StockQuoteWithValidation
  ): MarketStateResult {
    const currentPrice = quote?.price || 4.0;
    const history = generateHistoricalData(currentPrice, symbol, this.config.lookbackPeriods);
    const indicators = calculateTechnicalIndicators(history, quote);
    const volatility = calculateVolatility(history);
    return identifyMarketState(history, indicators, volatility, quote);
  }
}

export const aiEngine = new AIEngine();
