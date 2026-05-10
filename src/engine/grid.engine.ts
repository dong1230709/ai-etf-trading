// 网格引擎核心计算模块

import type { 
  GridConfig, 
  GridLevel, 
  GridStrategy,
  SimulationConfig,
  SimulationResult,
  SimulatedTrade,
  AIRecommendation,
  FundMode,
  SpacingType
} from '../types/grid';

/**
 * 网格引擎核心类
 * 提供网格生成，资金计算、收益分析等功能
 */
export class GridEngine {
  /**
   * 根据配置生成网格层级
   */
  static generateGrids(config: GridConfig): GridLevel[] {
    const grids: GridLevel[] = [];
    const { gridCount, upperPrice, lowerPrice, spacingType, spacingPercent } = config;

    // 根据间距类型计算每个网格的价格区间
    const priceStep = this.calculatePriceStep(upperPrice, lowerPrice, gridCount, spacingType, spacingPercent);

    for (let i = 0; i < gridCount; i++) {
      const lower = lowerPrice + i * priceStep;
      const upper = lower + priceStep;
      const price = (lower + upper) / 2; // 中间价

      grids.push({
        level: i + 1,
        price,
        upperPrice: upper,
        lowerPrice: lower,
        fundAmount: 0,
        position: 0,
        avgCost: 0,
        status: 'idle',
        buyPrice: lower,
        sellPrice: upper,
      });
    }

    return grids;
  }

  /**
   * 计算价格步进
   */
  static calculatePriceStep(
    upperPrice: number,
    lowerPrice: number,
    gridCount: number,
    spacingType: SpacingType,
    spacingPercent?: number
  ): number {
    if (spacingType === 'arithmetic') {
      // 算术间距：固定价格差
      return (upperPrice - lowerPrice) / gridCount;
    } else if (spacingType === 'geometric') {
      // 几何间距：固定百分比
      const ratio = Math.pow(upperPrice / lowerPrice, 1 / gridCount);
      return ratio;
    } else {
      // 自定义百分比
      const percent = (spacingPercent || 1) / 100;
      return percent;
    }
  }

  /**
   * 根据资金模式分配资金
   */
  static allocateFunds(config: GridConfig, grids: GridLevel[]): GridLevel[] {
    const { totalFund, fundMode } = config;
    
    if (fundMode === 'fixed') {
      // 固定金额：每格平均分配
      const perGridFund = totalFund / grids.length;
      return grids.map(grid => ({
        ...grid,
        fundAmount: perGridFund,
      }));
    } else if (fundMode === 'pyramid') {
      // 递增加仓：两端多，中间少（U型）
      return this.allocatePyramidFunds(grids, totalFund);
    } else {
      // 百分比分配：两端10%，中间平均
      return this.allocatePercentageFunds(grids, totalFund);
    }
  }

  /**
   * 分配金字塔资金（U型）
   */
  private static allocatePyramidFunds(grids: GridLevel[], totalFund: number): GridLevel[] {
    const n = grids.length;
    const mid = Math.floor(n / 2);
    
    // 计算每个网格的权重（两端权重高）
    const weights: number[] = [];
    for (let i = 0; i < n; i++) {
      const distFromCenter = Math.abs(i - mid);
      const maxDist = mid;
      weights.push(1 + (maxDist - distFromCenter) / maxDist);
    }
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    return grids.map((grid, i) => ({
      ...grid,
      fundAmount: (weights[i] / totalWeight) * totalFund,
    }));
  }

  /**
   * 分配百分比资金
   */
  private static allocatePercentageFunds(grids: GridLevel[], totalFund: number): GridLevel[] {
    const n = grids.length;
    
    // 两端各占15%，中间平均分配
    const edgePercent = 0.15;
    const middlePercent = (1 - 2 * edgePercent) / (n - 2);
    
    return grids.map((grid, i) => {
      let percent: number;
      if (i === 0 || i === n - 1) {
        percent = edgePercent;
      } else {
        percent = middlePercent;
      }
      
      return {
        ...grid,
        fundAmount: totalFund * percent,
      };
    });
  }

  /**
   * 计算完整网格策略
   */
  static calculateStrategy(config: GridConfig): GridStrategy {
    let grids = this.generateGrids(config);
    grids = this.allocateFunds(config, grids);
    
    // 计算持仓和成本
    let totalInvested = 0;
    let totalPosition = 0;
    
    grids.forEach(grid => {
      const position = grid.fundAmount / grid.price;
      const invested = grid.fundAmount;
      
      grid.position = position;
      grid.avgCost = grid.price;
      totalInvested += invested;
      totalPosition += position;
    });
    
    const avgCost = totalInvested / totalPosition;
    
    // 计算潜在收益（假设价格波动到上下限）
    const upperGrid = grids[grids.length - 1];
    const lowerGrid = grids[0];
    
    const sellAllProfit = totalPosition * (upperGrid.price - avgCost);
    const buyAllLoss = totalPosition * (avgCost - lowerGrid.price);
    const potentialProfit = sellAllProfit + buyAllLoss;
    
    const profitPercent = avgCost > 0 ? (potentialProfit / totalInvested) * 100 : 0;
    
    return {
      config,
      grids,
      totalInvested,
      totalPosition,
      avgCost,
      totalProfit: 0,
      profitPercent,
      potentialProfit,
    };
  }

  /**
   * 模拟网格交易
   */
  static simulate(config: GridConfig, simulationConfig: SimulationConfig): SimulationResult {
    const { startPrice, endPrice, volatility, steps, simulateCount } = simulationConfig;
    
    // 生成价格路径
    const pricePath = this.generatePricePath(startPrice, endPrice, volatility, steps);
    
    // 模拟交易
    const trades: SimulatedTrade[] = [];
    const gridCount = config.gridCount;
    const upperPrice = config.upperPrice;
    const lowerPrice = config.lowerPrice;
    
    let totalProfit = 0;
    let totalPosition = 0;
    let avgCost = 0;
    let maxProfit = 0;
    let minProfit = 0;
    let currentProfit = 0;
    
    const priceStep = (upperPrice - lowerPrice) / gridCount;
    
    pricePath.forEach((price, step) => {
      // 确定当前价格属于哪个网格
      const gridLevel = Math.min(
        Math.max(Math.floor((price - lowerPrice) / priceStep), 0),
        gridCount - 1
      );
      
      if (config.buyEnabled && price <= lowerPrice + gridLevel * priceStep) {
        // 买入
        const buyAmount = config.totalFund / gridCount;
        const buyQuantity = buyAmount / price;
        
        trades.push({
          step,
          price,
          action: 'buy',
          quantity: buyQuantity,
          amount: buyAmount,
          gridLevel: gridLevel + 1,
        });
        
        totalPosition += buyQuantity;
        avgCost = (avgCost * (totalPosition - buyQuantity) + buyAmount) / totalPosition;
      }
      
      if (config.sellEnabled && price >= lowerPrice + (gridLevel + 1) * priceStep && totalPosition > 0) {
        // 卖出
        const sellQuantity = totalPosition * 0.1; // 每次卖出10%
        
        trades.push({
          step,
          price,
          action: 'sell',
          quantity: sellQuantity,
          amount: sellQuantity * price,
          gridLevel: gridLevel + 1,
        });
        
        currentProfit += sellQuantity * (price - avgCost);
        totalPosition -= sellQuantity;
      }
      
      if (currentProfit > maxProfit) maxProfit = currentProfit;
      if (currentProfit < minProfit) minProfit = currentProfit;
    });
    
    // 计算统计指标
    const finalValue = totalPosition * pricePath[pricePath.length - 1];
    const profit = finalValue - config.totalFund + currentProfit;
    const profitPercent = (profit / config.totalFund) * 100;
    const avgProfit = profit / simulateCount;
    
    // 计算夏普比率（简化）
    const returns = trades.filter(t => t.action === 'sell').map(t => {
      const buyTrade = trades.find(b => b.step < t.step && b.action === 'buy');
      return buyTrade ? (t.price - buyTrade.price) / buyTrade.price : 0;
    });
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const variance = returns.length > 0 
      ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length 
      : 0;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;
    
    const winTrades = returns.filter(r => r > 0);
    const winRate = returns.length > 0 ? (winTrades.length / returns.length) * 100 : 0;
    
    return {
      pricePath,
      trades,
      profit,
      profitPercent,
      maxProfit,
      minProfit,
      avgProfit,
      winRate,
      sharpeRatio,
      maxDrawdown: Math.abs(minProfit),
    };
  }

  /**
   * 生成模拟价格路径
   */
  private static generatePricePath(
    startPrice: number,
    endPrice: number,
    volatility: number,
    steps: number
  ): number[] {
    const path: number[] = [startPrice];
    const dailyReturn = (endPrice / startPrice - 1) / steps;
    const dailyVolatility = volatility / Math.sqrt(365) / 100;
    
    for (let i = 1; i <= steps; i++) {
      const randomShock = (Math.random() - 0.5) * 2 * dailyVolatility;
      const price = path[i - 1] * (1 + dailyReturn + randomShock);
      path.push(Math.max(price, endPrice * 0.8)); // 防止跌太多
    }
    
    return path;
  }

  /**
   * AI推荐最优网格参数
   */
  static getAIRecommendation(
    symbol: string,
    currentPrice: number,
    historicalVolatility: number
  ): AIRecommendation {
    // 基于波动率计算推荐
    const volatility = historicalVolatility || 15; // 默认15%年化波动率
    
    // 推荐网格数（波动率越高，网格越多）
    let suggestedGridCount: number;
    let riskLevel: 'low' | 'medium' | 'high';
    
    if (volatility < 10) {
      suggestedGridCount = 10;
      riskLevel = 'low';
    } else if (volatility < 20) {
      suggestedGridCount = 15;
      riskLevel = 'medium';
    } else {
      suggestedGridCount = 20;
      riskLevel = 'high';
    }
    
    // 推荐间距（根据网格数和价格范围）
    const suggestedSpacing = (volatility / suggestedGridCount) * 1.5;
    
    // 预期收益（简化计算）
    const expectedReturn = (volatility * 0.3) / suggestedGridCount;
    
    // 推荐理由
    const reasons: string[] = [];
    
    if (volatility < 10) {
      reasons.push('波动率较低，适合稳健策略');
      reasons.push('建议使用标准网格捕获区间收益');
    } else if (volatility < 20) {
      reasons.push('波动率适中，适合平衡策略');
      reasons.push('建议使用中等密度网格');
    } else {
      reasons.push('波动率较高，适合激进策略');
      reasons.push('建议使用高密度网格捕捉波动');
    }
    
    reasons.push(`推荐网格数：${suggestedGridCount}格`);
    reasons.push(`预期收益率：${expectedReturn.toFixed(2)}%/月`);
    
    // 置信度（基于历史数据可用性）
    const confidence = historicalVolatility ? 85 : 65;
    
    return {
      suggestedGridCount,
      suggestedSpacing,
      suggestedSpacingType: 'geometric',
      expectedReturn,
      riskLevel,
      confidence,
      reasons,
    };
  }

  /**
   * 实时更新网格状态
   */
  static updateGridStatus(
    grids: GridLevel[],
    currentPrice: number,
    config: GridConfig
  ): GridLevel[] {
    return grids.map(grid => {
      let status: GridLevel['status'] = 'idle';
      
      if (config.buyEnabled && currentPrice <= grid.lowerPrice) {
        status = 'buy';
      } else if (config.sellEnabled && currentPrice >= grid.upperPrice) {
        status = 'sell';
      }
      
      if (grid.position > 0) {
        status = 'filled';
      }
      
      return { ...grid, status };
    });
  }
}

// 导出工具函数
export const gridEngine = {
  generateGrids: GridEngine.generateGrids,
  calculateStrategy: GridEngine.calculateStrategy,
  simulate: GridEngine.simulate,
  getAIRecommendation: GridEngine.getAIRecommendation,
  updateGridStatus: GridEngine.updateGridStatus,
};
