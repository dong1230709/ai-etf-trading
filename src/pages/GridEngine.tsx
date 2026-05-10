// 专业网格引擎主页面

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Settings, Play, Pause, Brain, BarChart3, ArrowLeft, Check, Zap, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuotes } from '../hooks/useQuote';
import { gridEngine } from '../engine/grid.engine';
import type { GridConfig, GridStrategy, AIRecommendation } from '../types/grid';
import { useGridStore } from '../stores/gridStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { GridConfigPanel, GridStats } from '../components/grid/GridConfigPanel';
import { GridVisualization, GridProfitChart, GridList } from '../components/grid/GridVisualization';
import { SimulationPanel } from '../components/grid/SimulationPanel';
import { AIRecommendationPanel } from '../components/grid/AIRecommendationPanel';

type TabType = 'config' | 'visualize' | 'simulate' | 'ai';

// 调试日志函数
const debug = (message: string, ...args: any[]) => {
  console.log(`[DEBUG-GridEngine] ${message}`, ...args);
};

export function GridEngine() {
  const navigate = useNavigate();
  const { createStrategy } = useGridStore();

  const [selectedSymbol, setSelectedSymbol] = useState('510300');
  const [config, setConfig] = useState<GridConfig | null>(null);
  const [strategy, setStrategy] = useState<GridStrategy | null>(null);
  const [aiRecommendation, setAIRecommendation] = useState<AIRecommendation | null>(null);
  const [isAIRecommending, setIsAIRecommending] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('config');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const { dataMap, isLoading, lastUpdate, refresh } = useQuotes({
    initialSymbols: [selectedSymbol],
    autoRefresh: true,
    refreshInterval: 5000
  });

  const currentQuote = dataMap[selectedSymbol];
  const currentPrice = currentQuote?.price || 4.285;

  useEffect(() => {
    debug('Initializing GridEngine with symbol', selectedSymbol);
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
      debug('Initial config set', initialConfig);
      setConfig(initialConfig);
    }
  }, [currentQuote, currentPrice, selectedSymbol]);

  useEffect(() => {
    if (config) {
      debug('Calculating strategy with config', config);
      const newStrategy = gridEngine.calculateStrategy(config);
      debug('Strategy calculated', newStrategy);
      setStrategy(newStrategy);
    }
  }, [config]);

  const handleConfigChange = (newConfig: GridConfig, newStrategy: GridStrategy) => {
    debug('handleConfigChange called', { newConfig, newStrategy });
    setConfig(newConfig);
    setStrategy(newStrategy);
  };

  const handleAIRecommend = () => {
    debug('handleAIRecommend called');
    setIsAIRecommending(true);
    
    setTimeout(() => {
      debug('Getting AI recommendation...');
      const recommendation = gridEngine.getAIRecommendation(
        selectedSymbol,
        currentPrice,
        15
      );
      debug('AI recommendation received', recommendation);
      setAIRecommendation(recommendation);
      setIsAIRecommending(false);
    }, 1500);
  };

  const handleApplyAIRecommendation = (updates: Partial<GridConfig>) => {
    debug('handleApplyAIRecommendation called with updates', updates);
    if (config) {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
    }
  };

  const handleSaveStrategy = () => {
    debug('handleSaveStrategy called');
    if (config) {
      const strategyId = createStrategy(config);
      debug('Strategy saved with ID', strategyId);
      setShowSaveModal(false);
      // 成功保存后导航到网格交易页面
      setTimeout(() => {
        navigate('/grid');
      }, 500);
    }
  };

  if (isLoading && !config) {
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
        {/* 头部 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => {
              debug('Back button clicked');
              navigate('/grid');
            }}
            className="p-2 hover:bg-finance-card-hover rounded-lg"
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </button>
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
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-gray-400">{currentQuote.name}</p>
                  <p className="text-xs text-gray-500">{selectedSymbol}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    debug('Refresh button clicked');
                    refresh();
                  }}
                  className="p-2 hover:bg-finance-card-hover rounded-lg"
                >
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
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
            </div>
            {lastUpdate && (
              <p className="text-xs text-gray-500 mt-2">
                最后更新: {new Date(lastUpdate).toLocaleTimeString()}
              </p>
            )}
          </Card>
        )}

        {/* 切换标的 */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400">选择标的</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { symbol: '510300', name: '沪深300' },
              { symbol: '159915', name: '创业板' },
              { symbol: '512880', name: '证券ETF' },
            ].map(item => (
              <button
                key={item.symbol}
                onClick={() => {
                  debug('Symbol selected', item.symbol);
                  setSelectedSymbol(item.symbol);
                }}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  selectedSymbol === item.symbol
                    ? 'bg-finance-blue text-white'
                    : 'bg-finance-card text-gray-300 hover:bg-finance-card-hover'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </Card>

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
                onClick={() => {
                  debug('Tab selected', tab.key);
                  setActiveTab(tab.key);
                }}
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

            {/* 保存策略按钮 */}
            <button
              onClick={() => {
                debug('Save strategy button clicked');
                setShowSaveModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-finance-green to-finance-blue rounded-xl text-white font-bold hover:opacity-90 transition-opacity"
            >
              <Zap className="w-5 h-5" />
              保存并运行策略
            </button>
          </div>
        )}

        {activeTab === 'visualize' && strategy && config && (
          <div className="space-y-4">
            <GridVisualization 
              grids={strategy.grids}
              currentPrice={currentPrice}
              config={{
                upperPrice: config.upperPrice || currentPrice * 1.1,
                lowerPrice: config.lowerPrice || currentPrice * 0.9,
              }}
            />
            <GridProfitChart strategy={strategy} />
            <GridList 
              grids={strategy.grids} 
              currentPrice={currentPrice} 
            />
          </div>
        )}

        {activeTab === 'simulate' && config && (
          <div className="space-y-4">
            <SimulationPanel config={config} currentPrice={currentPrice} />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
            <AIRecommendationPanel
              recommendation={aiRecommendation}
              isLoading={isAIRecommending}
              onApply={handleApplyAIRecommendation}
              onRefresh={handleAIRecommend}
            />
          </div>
        )}
      </motion.div>

      {/* 保存策略确认弹窗 */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSaveModal(false)}
          />
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="relative w-full max-w-md bg-finance-card border border-finance-border rounded-t-3xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">保存策略</h3>
              <p className="text-sm text-gray-400">
                确认保存当前配置并开始运行网格策略？
              </p>
            </div>

            {config && (
              <div className="bg-finance-bg-secondary rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">标的</span>
                  <span className="text-white font-mono">{config.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">网格数</span>
                  <span className="text-white font-mono">{config.gridCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">总资金</span>
                  <span className="text-white font-mono">¥{config.totalFund.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  debug('Cancel save clicked');
                  setShowSaveModal(false);
                }}
                className="flex-1 py-3 bg-finance-bg-secondary rounded-xl text-gray-300 font-medium hover:bg-finance-card-hover transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  debug('Confirm save clicked');
                  handleSaveStrategy();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-finance-blue to-finance-green rounded-xl text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                确认保存
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
