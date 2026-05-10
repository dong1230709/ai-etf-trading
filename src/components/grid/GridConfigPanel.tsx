// 网格配置面板组件

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, Brain, TrendingUp, ChevronDown } from 'lucide-react';
import type { GridConfig, GridStrategy, AIRecommendation, FundMode, SpacingType } from '../../types/grid';
import { gridEngine } from '../../engine/grid.engine';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface GridConfigPanelProps {
  symbol: string;
  name: string;
  currentPrice: number;
  onConfigChange: (config: GridConfig, strategy: GridStrategy) => void;
  onAIRecommend: () => void;
}

export function GridConfigPanel({
  symbol,
  name,
  currentPrice,
  onConfigChange,
  onAIRecommend
}: GridConfigPanelProps) {
  const [config, setConfig] = useState<GridConfig>({
    symbol,
    name,
    gridCount: 10,
    upperPrice: currentPrice * 1.1,
    lowerPrice: currentPrice * 0.9,
    spacingType: 'geometric',
    spacingPercent: 1.0,
    fundMode: 'fixed',
    totalFund: 100000,
    buyEnabled: true,
    sellEnabled: true,
    autoRebalance: false,
  });

  const [strategy, setStrategy] = useState<GridStrategy | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 监听价格变化
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      upperPrice: currentPrice * 1.1,
      lowerPrice: currentPrice * 0.9,
    }));
  }, [currentPrice]);

  // 计算策略
  useEffect(() => {
    const newStrategy = gridEngine.calculateStrategy(config);
    setStrategy(newStrategy);
    onConfigChange(config, newStrategy);
  }, [config, currentPrice]);

  const updateConfig = (updates: Partial<GridConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-4">
      {/* 基础配置 */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-finance-blue" />
            <h3 className="font-semibold text-white">网格配置</h3>
          </div>
          <Badge variant="blue">{name}</Badge>
        </div>

        {/* 网格数量 */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">网格数量</label>
          <div className="grid grid-cols-5 gap-2">
            {[5, 10, 15, 20, 30].map(count => (
              <button
                key={count}
                onClick={() => updateConfig({ gridCount: count })}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  config.gridCount === count
                    ? 'bg-finance-blue text-white'
                    : 'bg-finance-bg-secondary text-gray-300 hover:bg-finance-card-hover'
                }`}
              >
                {count}格
              </button>
            ))}
          </div>
        </div>

        {/* 价格区间 */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">
            价格区间（当前价: ¥{currentPrice.toFixed(3)}）
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs text-gray-500 mb-1 block">上限价格</span>
              <input
                type="number"
                value={config.upperPrice.toFixed(3)}
                onChange={e => updateConfig({ upperPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-finance-bg-secondary border border-finance-border rounded-lg px-3 py-2 text-white font-mono text-sm"
              />
            </div>
            <div>
              <span className="text-xs text-gray-500 mb-1 block">下限价格</span>
              <input
                type="number"
                value={config.lowerPrice.toFixed(3)}
                onChange={e => updateConfig({ lowerPrice: parseFloat(e.target.value) || 0 })}
                className="w-full bg-finance-bg-secondary border border-finance-border rounded-lg px-3 py-2 text-white font-mono text-sm"
              />
            </div>
          </div>
          {/* 快捷设置 */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => updateConfig({
                upperPrice: currentPrice * 1.05,
                lowerPrice: currentPrice * 0.95
              })}
              className="text-xs text-finance-blue hover:underline"
            >
              ±5%
            </button>
            <button
              onClick={() => updateConfig({
                upperPrice: currentPrice * 1.10,
                lowerPrice: currentPrice * 0.90
              })}
              className="text-xs text-finance-blue hover:underline"
            >
              ±10%
            </button>
            <button
              onClick={() => updateConfig({
                upperPrice: currentPrice * 1.15,
                lowerPrice: currentPrice * 0.85
              })}
              className="text-xs text-finance-blue hover:underline"
            >
              ±15%
            </button>
          </div>
        </div>

        {/* 间距类型 */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">间距类型</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: 'arithmetic' as SpacingType, label: '算术', desc: '固定价差' },
              { type: 'geometric' as SpacingType, label: '几何', desc: '固定%' },
              { type: 'custom' as SpacingType, label: '自定义', desc: '手动设置' },
            ].map(item => (
              <button
                key={item.type}
                onClick={() => updateConfig({ spacingType: item.type })}
                className={`p-3 rounded-lg text-center transition-all ${
                  config.spacingType === item.type
                    ? 'bg-finance-blue/20 border border-finance-blue'
                    : 'bg-finance-bg-secondary border border-finance-border'
                }`}
              >
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 间距百分比 */}
        {config.spacingType !== 'arithmetic' && (
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">
              间距百分比: {config.spacingPercent.toFixed(1)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={config.spacingPercent}
              onChange={e => updateConfig({ spacingPercent: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1%</span>
              <span>紧密</span>
              <span>正常</span>
              <span>宽松</span>
              <span>5%</span>
            </div>
          </div>
        )}

        {/* 资金模式 */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">资金模式</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: 'fixed' as FundMode, label: '固定', icon: '💰', desc: '平均分配' },
              { mode: 'pyramid' as FundMode, label: '金字塔', icon: '📈', desc: '两端多' },
              { mode: 'percentage' as FundMode, label: '百分比', icon: '📊', desc: '自定义' },
            ].map(item => (
              <button
                key={item.mode}
                onClick={() => updateConfig({ fundMode: item.mode })}
                className={`p-3 rounded-lg text-center transition-all ${
                  config.fundMode === item.mode
                    ? 'bg-finance-green/20 border border-finance-green'
                    : 'bg-finance-bg-secondary border border-finance-border'
                }`}
              >
                <div className="text-lg mb-1">{item.icon}</div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 总资金 */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">
            总资金: ¥{config.totalFund.toLocaleString()}
          </label>
          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={config.totalFund}
            onChange={e => updateConfig({ totalFund: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1万</span>
            <span>10万</span>
            <span>50万</span>
            <span>100万</span>
          </div>
        </div>

        {/* 高级设置 */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
          高级设置
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-4 space-y-3 pt-4 border-t border-finance-border"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">启用买入网格</span>
              <button
                onClick={() => updateConfig({ buyEnabled: !config.buyEnabled })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  config.buyEnabled ? 'bg-finance-green' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  config.buyEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">启用卖出网格</span>
              <button
                onClick={() => updateConfig({ sellEnabled: !config.sellEnabled })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  config.sellEnabled ? 'bg-finance-red' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  config.sellEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
                style={{ transform: config.sellEnabled ? 'translateX(24px)' : 'translateX(2px)' }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">自动再平衡</span>
              <button
                onClick={() => updateConfig({ autoRebalance: !config.autoRebalance })}
                className={`w-12 h-6 rounded-full transition-colors ${
                  config.autoRebalance ? 'bg-finance-blue' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  config.autoRebalance ? 'translate-x-6' : 'translate-x-0.5'
                }`}
                style={{ transform: config.autoRebalance ? 'translateX(24px)' : 'translateX(2px)' }}
                />
              </button>
            </div>
          </motion.div>
        )}
      </Card>

      {/* AI推荐按钮 */}
      <Card className="p-4">
        <button
          onClick={onAIRecommend}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-finance-blue to-finance-green rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Brain className="w-5 h-5" />
          AI智能推荐参数
        </button>
      </Card>
    </div>
  );
}

interface GridStatsProps {
  strategy: GridStrategy | null;
}

export function GridStats({ strategy }: GridStatsProps) {
  if (!strategy) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-finance-green" />
        <h3 className="font-semibold text-white">策略统计</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-finance-bg-secondary rounded-xl">
          <p className="text-xs text-gray-400 mb-1">总投入</p>
          <p className="text-lg font-bold font-mono text-white">
            ¥{strategy.totalInvested.toLocaleString()}
          </p>
        </div>

        <div className="p-3 bg-finance-bg-secondary rounded-xl">
          <p className="text-xs text-gray-400 mb-1">总持仓</p>
          <p className="text-lg font-bold font-mono text-white">
            {strategy.totalPosition.toFixed(2)}
          </p>
        </div>

        <div className="p-3 bg-finance-bg-secondary rounded-xl">
          <p className="text-xs text-gray-400 mb-1">平均成本</p>
          <p className="text-lg font-bold font-mono text-white">
            ¥{strategy.avgCost.toFixed(3)}
          </p>
        </div>

        <div className="p-3 bg-finance-bg-secondary rounded-xl">
          <p className="text-xs text-gray-400 mb-1">潜在收益</p>
          <p className="text-lg font-bold font-mono text-finance-green">
            ¥{strategy.potentialProfit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-finance-blue/10 border border-finance-blue/30 rounded-xl">
        <p className="text-sm text-finance-blue">
          💡 潜在收益基于价格波动到上下限的假设，实际收益会因市场波动而变化
        </p>
      </div>
    </Card>
  );
}
