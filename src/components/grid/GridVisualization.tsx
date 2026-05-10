// 网格可视化组件

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { GridLevel, GridStrategy } from '../../types/grid';

interface GridVisualizationProps {
  grids: GridLevel[];
  currentPrice: number;
  config: {
    upperPrice: number;
    lowerPrice: number;
  };
}

export function GridVisualization({ grids, currentPrice, config }: GridVisualizationProps) {
  const { upperPrice, lowerPrice } = config;
  const priceRange = upperPrice - lowerPrice;

  const getGridColor = (grid: GridLevel) => {
    if (grid.status === 'filled') return 'bg-finance-green';
    if (grid.status === 'buy') return 'bg-finance-blue';
    if (grid.status === 'sell') return 'bg-finance-red';
    return 'bg-finance-border';
  };

  const getGridPosition = (price: number) => {
    return ((price - lowerPrice) / priceRange) * 100;
  };

  return (
    <div className="card p-4">
      <h3 className="font-semibold text-white mb-4">网格可视化</h3>
      
      {/* 价格区间 */}
      <div className="relative h-64 mb-4">
        {/* 价格标签 */}
        <div className="absolute top-0 left-0 text-xs text-gray-400">
          最高 ¥{upperPrice.toFixed(3)}
        </div>
        <div className="absolute bottom-0 left-0 text-xs text-gray-400">
          最低 ¥{lowerPrice.toFixed(3)}
        </div>

        {/* 网格区域 */}
        <div className="absolute inset-0 flex flex-col justify-between py-6">
          {grids.slice().reverse().map((grid, index) => {
            const position = getGridPosition(grid.price);
            const isActive = currentPrice >= grid.lowerPrice && currentPrice < grid.upperPrice;
            
            return (
              <motion.div
                key={grid.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative h-8 flex items-center ${
                  isActive ? 'bg-finance-blue/20 border border-finance-blue' : ''
                }`}
              >
                <div className={`w-1 h-full ${getGridColor(grid)} rounded-r`} />
                <div className="flex-1 px-3 flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-300">
                    #{grid.level} ¥{grid.price.toFixed(3)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ¥{grid.fundAmount.toLocaleString()}
                  </span>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 w-4 h-4 bg-finance-blue rounded-full"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 当前价格线 */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-finance-gold"
          style={{ top: `${getGridPosition(currentPrice)}%` }}
        >
          <span className="absolute -top-6 right-0 text-sm font-bold text-finance-gold">
            现价 ¥{currentPrice.toFixed(3)}
          </span>
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-finance-border rounded" />
          <span className="text-gray-400">空闲</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-finance-blue rounded" />
          <span className="text-gray-400">待买入</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-finance-green rounded" />
          <span className="text-gray-400">已触发</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-finance-red rounded" />
          <span className="text-gray-400">待卖出</span>
        </div>
      </div>
    </div>
  );
}

interface GridProfitChartProps {
  strategy: GridStrategy;
}

export function GridProfitChart({ strategy }: GridProfitChartProps) {
  const maxProfit = strategy.potentialProfit;
  const gridProfits = strategy.grids.map((grid, index) => {
    const profitIfSellAtUpper = (grid.upperPrice - grid.avgCost) * grid.position;
    return profitIfSellAtUpper;
  });

  return (
    <div className="card p-4">
      <h3 className="font-semibold text-white mb-4">收益分布</h3>
      
      <div className="space-y-2">
        {gridProfits.map((profit, index) => {
          const percent = maxProfit > 0 ? (profit / maxProfit) * 100 : 0;
          const isPositive = profit >= 0;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <span className="w-8 text-xs text-gray-400 font-mono">
                #{strategy.grids.length - index}
              </span>
              <div className="flex-1 h-6 bg-finance-bg-secondary rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.abs(percent)}%` }}
                  transition={{ delay: index * 0.05 }}
                  className={`h-full flex items-center px-2 ${
                    isPositive ? 'bg-finance-green/50' : 'bg-finance-red/50'
                  }`}
                  style={{ 
                    marginLeft: percent < 0 ? 'auto' : 0,
                    justifyContent: percent < 0 ? 'flex-end' : 'flex-start'
                  }}
                >
                  <span className="text-xs text-white font-mono">
                    {profit >= 0 ? '+' : ''}{profit.toFixed(0)}
                  </span>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-finance-border flex items-center justify-between">
        <span className="text-sm text-gray-400">潜在总收益</span>
        <span className="text-lg font-bold font-mono text-finance-green">
          ¥{strategy.potentialProfit.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

interface GridListProps {
  grids: GridLevel[];
  currentPrice: number;
}

export function GridList({ grids, currentPrice }: GridListProps) {
  const getStatusIcon = (status: GridLevel['status']) => {
    switch (status) {
      case 'filled':
        return <TrendingUp className="w-4 h-4 text-finance-green" />;
      case 'buy':
        return <DollarSign className="w-4 h-4 text-finance-blue" />;
      case 'sell':
        return <TrendingDown className="w-4 h-4 text-finance-red" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-500" />;
    }
  };

  const getStatusText = (status: GridLevel['status']) => {
    switch (status) {
      case 'filled':
        return '已触发';
      case 'buy':
        return '待买入';
      case 'sell':
        return '待卖出';
      default:
        return '空闲';
    }
  };

  const getStatusBadge = (status: GridLevel['status']) => {
    switch (status) {
      case 'filled':
        return 'badge-green';
      case 'buy':
        return 'badge-blue';
      case 'sell':
        return 'badge-red';
      default:
        return '';
    }
  };

  return (
    <div className="card p-4">
      <h3 className="font-semibold text-white mb-4">网格详情</h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
        {grids.map((grid) => {
          const isActive = currentPrice >= grid.lowerPrice && currentPrice < grid.upperPrice;
          
          return (
            <motion.div
              key={grid.level}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: grid.level * 0.03 }}
              className={`p-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-finance-blue/10 border border-finance-blue/30' 
                  : 'bg-finance-bg-secondary'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(grid.status)}
                  <span className="text-sm font-medium text-white">
                    网格 #{grid.level}
                  </span>
                </div>
                <span className={`badge ${getStatusBadge(grid.status)}`}>
                  {getStatusText(grid.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">价格区间</span>
                  <span className="font-mono text-white">
                    {grid.lowerPrice.toFixed(3)} - {grid.upperPrice.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">资金</span>
                  <span className="font-mono text-white">
                    ¥{grid.fundAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">持仓</span>
                  <span className="font-mono text-white">
                    {grid.position.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">成本</span>
                  <span className="font-mono text-white">
                    ¥{grid.avgCost.toFixed(3)}
                  </span>
                </div>
              </div>

              {isActive && (
                <div className="mt-2 pt-2 border-t border-finance-blue/30">
                  <span className="text-xs text-finance-blue">
                    📍 当前价格在此区间内
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
