// 收益模拟器组件

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import type { SimulationConfig, SimulationResult, GridConfig } from '../../types/grid';
import { gridEngine } from '../../engine/grid.engine';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface SimulationPanelProps {
  config: GridConfig;
  currentPrice: number;
}

export function SimulationPanel({ config, currentPrice }: SimulationPanelProps) {
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfig>({
    startPrice: currentPrice,
    endPrice: currentPrice * 1.2,
    volatility: 20,
    steps: 100,
    simulateCount: 1000,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = () => {
    setIsSimulating(true);
    
    // 模拟计算（使用setTimeout避免阻塞UI）
    setTimeout(() => {
      const simulationResult = gridEngine.simulate(config, simulationConfig);
      setResult(simulationResult);
      setIsSimulating(false);
    }, 100);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-finance-blue" />
            <h3 className="font-semibold text-white">收益模拟</h3>
          </div>
          <Badge variant="blue">回测引擎</Badge>
        </div>

        {/* 模拟参数 */}
        <div className="space-y-4 mb-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              模拟价格区间
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-500 mb-1 block">起始价</span>
                <input
                  type="number"
                  value={simulationConfig.startPrice}
                  onChange={e => setSimulationConfig(prev => ({
                    ...prev,
                    startPrice: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full bg-finance-bg-secondary border border-finance-border rounded-lg px-3 py-2 text-white font-mono text-sm"
                />
              </div>
              <div>
                <span className="text-xs text-gray-500 mb-1 block">目标价</span>
                <input
                  type="number"
                  value={simulationConfig.endPrice}
                  onChange={e => setSimulationConfig(prev => ({
                    ...prev,
                    endPrice: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full bg-finance-bg-secondary border border-finance-border rounded-lg px-3 py-2 text-white font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              年化波动率: {simulationConfig.volatility}%
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={simulationConfig.volatility}
              onChange={e => setSimulationConfig(prev => ({
                ...prev,
                volatility: parseInt(e.target.value)
              }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>低波动</span>
              <span>高波动</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              模拟步数: {simulationConfig.steps}
            </label>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={simulationConfig.steps}
              onChange={e => setSimulationConfig(prev => ({
                ...prev,
                steps: parseInt(e.target.value)
              }))}
              className="w-full"
            />
          </div>
        </div>

        {/* 运行按钮 */}
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="w-full flex items-center justify-center gap-2 py-3 bg-finance-blue rounded-xl text-white font-medium hover:bg-finance-blue/90 transition-colors disabled:opacity-50"
        >
          <Play className="w-5 h-5" />
          {isSimulating ? '模拟中...' : '开始模拟'}
        </button>
      </Card>

      {/* 模拟结果 */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4">
            <h3 className="font-semibold text-white mb-4">模拟结果</h3>

            {/* 价格走势图（简化） */}
            <div className="h-32 bg-finance-bg-secondary rounded-xl mb-4 p-3 overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 300 100">
                <polyline
                  fill="none"
                  stroke="var(--accent-blue)"
                  strokeWidth="2"
                  points={result.pricePath.map((price, i) => {
                    const x = (i / (result.pricePath.length - 1)) * 300;
                    const y = 100 - ((price - simulationConfig.startPrice) / (simulationConfig.endPrice - simulationConfig.startPrice)) * 100;
                    return `${x},${Math.max(0, Math.min(100, y))}`;
                  }).join(' ')}
                />
              </svg>
            </div>

            {/* 统计指标 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-finance-bg-secondary rounded-xl">
                <p className="text-xs text-gray-400 mb-1">模拟利润</p>
                <p className={`text-lg font-bold font-mono ${
                  result.profit >= 0 ? 'text-finance-green' : 'text-finance-red'
                }`}>
                  {result.profit >= 0 ? '+' : ''}¥{result.profit.toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-finance-bg-secondary rounded-xl">
                <p className="text-xs text-gray-400 mb-1">收益率</p>
                <p className={`text-lg font-bold font-mono ${
                  result.profitPercent >= 0 ? 'text-finance-green' : 'text-finance-red'
                }`}>
                  {result.profitPercent >= 0 ? '+' : ''}{result.profitPercent.toFixed(2)}%
                </p>
              </div>

              <div className="p-3 bg-finance-bg-secondary rounded-xl">
                <p className="text-xs text-gray-400 mb-1">最大利润</p>
                <p className="text-lg font-bold font-mono text-finance-green">
                  +¥{result.maxProfit.toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-finance-bg-secondary rounded-xl">
                <p className="text-xs text-gray-400 mb-1">最大亏损</p>
                <p className="text-lg font-bold font-mono text-finance-red">
                  -¥{result.minProfit.toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-finance-bg-secondary rounded-xl">
                <p className="text-xs text-gray-400 mb-1">夏普比率</p>
                <p className="text-lg font-bold font-mono text-white">
                  {result.sharpeRatio.toFixed(2)}
                </p>
              </div>

              <div className="p-3 bg-finance-bg-secondary rounded-xl">
                <p className="text-xs text-gray-400 mb-1">胜率</p>
                <p className="text-lg font-bold font-mono text-white">
                  {result.winRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* 交易记录 */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">模拟交易 ({result.trades.length}笔)</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
                {result.trades.slice(0, 10).map((trade, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs p-2 bg-finance-bg-secondary rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={trade.action === 'buy' ? 'blue' : 'red'}>
                        {trade.action === 'buy' ? '买' : '卖'}
                      </Badge>
                      <span className="text-gray-400">¥{trade.price.toFixed(3)}</span>
                    </div>
                    <div className="text-gray-400">
                      {trade.quantity.toFixed(2)}股
                    </div>
                  </div>
                ))}
                {result.trades.length > 10 && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    ...还有 {result.trades.length - 10} 笔交易
                  </p>
                )}
              </div>
            </div>

            {/* 风险提示 */}
            <div className="mt-4 p-3 bg-finance-gold/10 border border-finance-gold/30 rounded-xl">
              <p className="text-xs text-finance-gold">
                ⚠️ 模拟结果仅供参考。实际收益会受到市场波动、流动性、滑点等因素影响。
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
