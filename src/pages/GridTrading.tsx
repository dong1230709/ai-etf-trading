import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Grid3X3, 
  TrendingUp, 
  TrendingDown, 
  Pause, 
  Play, 
  Settings,
  Wallet,
  PieChart,
  Zap,
  X,
  Plus
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { useGridStore } from '../stores/gridStore';
import { formatCurrency, formatPercent, getChangeColor } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { GridConfig } from '../types/grid';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const GridTrading = () => {
  const { gridStrategies, positions } = useAppStore();
  const { 
    strategies, 
    createStrategy, 
    toggleStrategyStatus, 
    updateStrategy,
    deleteStrategy,
    isCreating,
    setIsCreating
  } = useGridStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('510300');
  const [newName, setNewName] = useState('沪深300ETF');
  const [newGrids, setNewGrids] = useState(10);
  const [newFund, setNewFund] = useState(50000);
  const [editingStrategy, setEditingStrategy] = useState<string | null>(null);

  const handleCreateStrategy = () => {
    const config: GridConfig = {
      symbol: newSymbol,
      name: newName,
      gridCount: newGrids,
      upperPrice: 4.5,
      lowerPrice: 3.8,
      spacingType: 'geometric',
      spacingPercent: 1.0,
      fundMode: 'fixed',
      totalFund: newFund,
      buyEnabled: true,
      sellEnabled: true,
      autoRebalance: false,
    };
    createStrategy(config);
    setShowCreateModal(false);
    setNewSymbol('510300');
    setNewName('沪深300ETF');
    setNewGrids(10);
    setNewFund(50000);
  };

  const handleToggleStrategy = (id: string) => {
    toggleStrategyStatus(id);
  };

  const handleDeleteStrategy = (id: string) => {
    if (confirm('确定要删除这个策略吗？')) {
      deleteStrategy(id);
    }
  };

  const totalInvestment = strategies.reduce((sum, s) => sum + s.totalInvestment, 0);
  const totalProfit = strategies.reduce((sum, s) => sum + s.profit, 0);
  const totalProfitPercent = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-finance-green" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-finance-gold" />;
      default:
        return <Settings className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={item} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-finance-blue/20 rounded-xl">
            <Grid3X3 className="w-6 h-6 text-finance-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">网格交易</h1>
            <p className="text-sm text-gray-400">自动化的价格区间套利策略</p>
          </div>
        </div>
      </motion.header>

      <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">总投入</span>
          </div>
          <p className="text-xl font-bold font-mono text-white">
            {formatCurrency(totalInvestment)}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">累计收益</span>
          </div>
          <p className={`text-xl font-bold font-mono ${getChangeColor(totalProfit)}`}>
            {formatCurrency(totalProfit)}
          </p>
          <p className={`text-xs font-mono ${getChangeColor(totalProfitPercent)}`}>
            {formatPercent(totalProfitPercent)}
          </p>
        </Card>
      </motion.div>

      <motion.div variants={item} className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">活跃策略</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary text-sm py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建策略
          </button>
        </div>
      </motion.div>

      <motion.div variants={item} className="space-y-4">
        {strategies.map((strategy, index) => {
          const position = positions.find(p => p.symbol === strategy.symbol);
          
          return (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      strategy.status === 'active' 
                        ? 'bg-finance-green/20' 
                        : 'bg-finance-gold/20'
                    }`}>
                      <Grid3X3 className={`w-5 h-5 ${
                        strategy.status === 'active' 
                          ? 'text-finance-green' 
                          : 'text-finance-gold'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{strategy.name}</h3>
                      <p className="text-sm text-gray-400">{strategy.symbol}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(strategy.status)}
                    <Badge variant={
                      strategy.status === 'active' ? 'green' : 
                      strategy.status === 'paused' ? 'gold' : 'default'
                    }>
                      {strategy.status === 'active' ? '运行中' : 
                       strategy.status === 'paused' ? '已暂停' : '已完成'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-finance-bg-secondary rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">网格数</p>
                    <p className="text-lg font-bold font-mono text-white">
                      {strategy.grids}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-finance-bg-secondary rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">投入金额</p>
                    <p className="text-lg font-bold font-mono text-white">
                      {(strategy.totalInvestment / 10000).toFixed(1)}万
                    </p>
                  </div>
                  <div className="text-center p-3 bg-finance-bg-secondary rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">收益率</p>
                    <p className={`text-lg font-bold font-mono ${getChangeColor(strategy.profitPercent)}`}>
                      {formatPercent(strategy.profitPercent)}
                    </p>
                  </div>
                </div>

                {position && (
                  <div className="flex items-center justify-between p-3 bg-finance-bg-secondary rounded-xl mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">持仓均价</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-white">¥{position.avgPrice.toFixed(3)}</p>
                      <p className="text-xs text-gray-400">
                        现价 ¥{position.currentPrice.toFixed(3)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleToggleStrategy(strategy.id)}
                    className="btn-secondary flex-1 text-sm py-2.5 flex items-center justify-center gap-2"
                  >
                    {strategy.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4" />
                        暂停
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        启动
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setEditingStrategy(strategy.id)}
                    className="btn-secondary flex-1 text-sm py-2.5 flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    参数设置
                  </button>
                  <button 
                    onClick={() => handleDeleteStrategy(strategy.id)}
                    className="btn-secondary px-3 py-2.5 text-finance-red hover:bg-finance-red/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 创建策略模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="relative w-full max-w-md bg-finance-card border border-finance-border rounded-t-3xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">新建网格策略</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-finance-bg-secondary rounded-lg"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">ETF代码</label>
                <input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="w-full bg-finance-bg-secondary border border-finance-border rounded-lg px-4 py-3 text-white font-mono"
                  placeholder="例如：510300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">策略名称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-finance-bg-secondary border border-finance-border rounded-lg px-4 py-3 text-white"
                  placeholder="例如：沪深300网格"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  网格数量: {newGrids}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[5, 10, 15, 20, 30].map(count => (
                    <button
                      key={count}
                      onClick={() => setNewGrids(count)}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        newGrids === count
                          ? 'bg-finance-blue text-white'
                          : 'bg-finance-bg-secondary text-gray-300 hover:bg-finance-card-hover'
                      }`}
                    >
                      {count}格
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  投入资金: ¥{newFund.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="10000"
                  value={newFund}
                  onChange={(e) => setNewFund(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1万</span>
                  <span>50万</span>
                  <span>100万</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-finance-bg-secondary rounded-xl text-gray-300 font-medium hover:bg-finance-card-hover transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateStrategy}
                  className="flex-1 py-3 bg-gradient-to-r from-finance-blue to-finance-green rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                >
                  创建策略
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div variants={item} className="mt-6">
        <h2 className="text-lg font-semibold text-white mb-4">网格原理</h2>
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-finance-blue/20 rounded-lg">
                <Zap className="w-4 h-4 text-finance-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">价格区间划分</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  将价格区间划分为N个网格，每个网格执行一次买卖操作
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-finance-green/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-finance-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">高抛低吸</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  价格上升时卖出网格，价格下跌时买入网格，赚取波动收益
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-finance-gold/20 rounded-lg">
                <PieChart className="w-4 h-4 text-finance-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">自动执行</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  全天候自动监控价格，触发条件立即执行，无需人工干预
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
