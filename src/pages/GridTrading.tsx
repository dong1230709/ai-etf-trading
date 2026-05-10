import { motion } from 'framer-motion';
import { 
  Grid3X3, 
  TrendingUp, 
  TrendingDown, 
  Pause, 
  Play, 
  Settings,
  Wallet,
  PieChart,
  Zap
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { formatCurrency, formatPercent, getChangeColor } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

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

  const totalInvestment = gridStrategies.reduce((sum, s) => sum + s.totalInvestment, 0);
  const totalProfit = gridStrategies.reduce((sum, s) => sum + s.profit, 0);
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
          <button className="btn-primary text-sm py-2">
            + 新建策略
          </button>
        </div>
      </motion.div>

      <motion.div variants={item} className="space-y-4">
        {gridStrategies.map((strategy, index) => {
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
                  <button className="btn-secondary flex-1 text-sm py-2.5 flex items-center justify-center gap-2">
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
                  <button className="btn-secondary flex-1 text-sm py-2.5 flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" />
                    参数设置
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

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
