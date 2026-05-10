// 专业网格引擎主页面

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Settings, Play, Pause, Brain, BarChart3 } from 'lucide-react';
import { useQuotes } from '../hooks/useQuote';
import { gridEngine } from '../engine/grid.engine';
import type { GridConfig, GridStrategy, AIRecommendation } from '../types/grid';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { GridConfigPanel, GridStats } from '../components/grid/GridConfigPanel';
import { GridVisualization, GridProfitChart, GridList } from '../components/grid/GridVisualization';
import { SimulationPanel } from '../components/grid/SimulationPanel';
import { AIRecommendationPanel } from '../components/grid/AIRecommendationPanel';

type TabType = 'config' | 'visualize' | 'simulate' | 'ai';

export function GridEngine() {
  const [selectedSymbol] = useState('510300');
  const [config, setConfig] = useState<GridConfig | null>(null);
  const [strategy, setStrategy] = useState<GridStrategy | null>(null);
  const [aiRecommendation, setAIRecommendation] = useState<AIRecommendation | null>(null);
  const [isAIRecommending, setIsAIRecommending] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('config');

  const { dataMap, isLoading, lastUpdate } = useQuotes({
    initialSymbols: [selectedSymbol],
    autoRefresh: true,
    refreshInterval: 5000
  });

  const currentQuote = dataMap[selectedSymbol];
  const currentPrice = currentQuote?.price || 4.285;

  useEffect(() => {
    if (currentQuote) {
      const initialConfig: GridConfig = {
        symbol: selectedSymbol,
        name: currentQuote.name || '沪深300ETF',
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
      };
      setConfig(initialConfig);
    }
  }, [currentQuote, currentPrice, selectedSymbol]);

  useEffect(() => {
    if (config) {
      const newStrategy = gridEngine.calculateStrategy(config);
      setStrategy(newStrategy);
    }
  }, [config]);

  const handleConfigChange = (newConfig: GridConfig, newStrategy: GridStrategy) => {
    setConfig(newConfig);
    setStrategy(newStrategy);
  };

  const handleAIRecommend = () => {
    setIsAIRecommending(true);
    
    setTimeout(() => {
      const recommendation = gridEngine.getAIRecommendation(
        selectedSymbol,
        currentPrice,
        15
      );
      setAIRecommendation(recommendation);
      setIsAIRecommending(false);
    }, 1500);
  };

  const handleApplyAIRecommendation = (updates: Partial<GridConfig>) => {
    if (config) {
      setConfig({ ...config, ...updates });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 px-4 pt-6">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full skeleton" />
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-finance-blue to-finance-green rounded-2xl">
            <Grid3X3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">专业网格引擎</h1>
            <p className="text-sm text-gray-400">超级网格交易系统</p>
          </div>
        </div>

        {/* 当前行情 */}
        {currentQuote && (
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{currentQuote.name}</p>
                <p className="text-xs text-gray-500">{selectedSymbol}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono text-white">
                  ¥{currentPrice.toFixed(3)}
                </p>
                <p className={`text-sm font-mono ${
                  currentQuote.change >= 0 ? 'text-finance-green' : 'text-finance-red'
                }`}>
                  {currentQuote.change >= 0 ? '+' : ''}{currentQuote.change.toFixed(3)} 
                  ({currentQuote.change >= 0 ? '+' : ''}{currentQuote.changePercent.toFixed(2)}%)
                </p>
              </div>
            </div>
            {lastUpdate && (
              <p className="text-xs text-gray-500 mt-2">
                最后更新: {new Date(lastUpdate).toLocaleTimeString()}
              </p>
            )}
          </Card>
        )}

        {/* Tab导航 */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {[
            { key: 'config' as TabType, label: '配置', icon: Settings },
            { key: 'visualize' as TabType, label: '可视化', icon: Grid3X3 },
            { key: 'simulate' as TabType, label: '模拟', icon: BarChart3 },
            { key: 'ai' as TabType, label: 'AI推荐', icon: Brain },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-finance-blue text-white'
                    : 'bg-finance-card text-gray-400 hover:bg-finance-card-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 内容区域 */}
        {activeTab === 'config' && config && (
          <div className="space-y-4">
            <GridConfigPanel
              symbol={selectedSymbol}
              name={currentQuote?.name || '沪深300ETF'}
              currentPrice={currentPrice}
              onConfigChange={handleConfigChange}
              onAIRecommend={handleAIRecommend}
            />
            
            {strategy && <GridStats strategy={strategy} />}
            
            {strategy && (
              <GridList 
                grids={strategy.grids} 
                currentPrice={currentPrice} 
              />
            )}
          </div>
        )}

        {activeTab === 'visualize' && strategy && (
          <div className="space-y-4">
            <GridVisualization 
              grids={strategy.grids}
              currentPrice={currentPrice}
              config={{
                upperPrice: config?.upperPrice || currentPrice * 1.1,
                lowerPrice: config?.lowerPrice || currentPrice * 0.9,
              }}
            />
            
            <GridProfitChart strategy={strategy} />
          </div>
        )}

        {activeTab === 'simulate' && config && (
          <SimulationPanel 
            config={config}
            currentPrice={currentPrice}
          />
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
            <AIRecommendationPanel
              recommendation={aiRecommendation}
              onApply={handleApplyAIRecommendation}
              isLoading={isAIRecommending}
            />

            {!aiRecommendation && !isAIRecommending && (
              <Card className="p-4">
                <button
                  onClick={handleAIRecommend}
                  className="w-full py-3 bg-gradient-to-r from-finance-blue to-finance-green rounded-xl text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Brain className="w-5 h-5" />
                  获取AI推荐
                </button>
              </Card>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
