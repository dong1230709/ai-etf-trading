// Dashboard页面 - 集成实时行情

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  Wallet,
  PieChart,
  Activity,
  ChevronRight,
  Grid3X3,
  Bot,
  Shield,
  Bell,
  RefreshCw,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useMarketStore, Position as MarketPosition } from '../stores/marketStore';
import { useQuotes } from '../hooks/useQuote';
import { formatCurrency, formatPercent, getChangeColor, getChangeBg } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const debug = (message: string, ...args: any[]) => {
  console.log(`[DEBUG-Dashboard] ${message}`, ...args);
};

export function Dashboard() {
  const navigate = useNavigate();
  const { portfolio } = useAppStore();
  const { positions, updatePosition } = useMarketStore();
  
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>('');
  const [editAvgPrice, setEditAvgPrice] = useState<string>('');

  const {
    dataMap: marketDataMap,
    isLoading: marketLoading,
    refresh: refreshMarket,
    lastUpdate: marketLastUpdate
  } = useQuotes({
    initialSymbols: ['000001', '399001', '399006', '000300'],
    autoRefresh: true,
    refreshInterval: 5000
  });

  const {
    dataMap: etfDataMap,
    isLoading: etfLoading,
    refresh: refreshETF
  } = useQuotes({
    initialSymbols: ['510300', '159915', '512880'],
    autoRefresh: true,
    refreshInterval: 5000
  });

  const calculateRealProfit = () => {
    let totalProfit = 0;
    positions.forEach(position => {
      const realData = etfDataMap[position.symbol];
      if (realData) {
        const currentValue = realData.price * position.quantity;
        const costValue = position.avgPrice * position.quantity;
        totalProfit += currentValue - costValue;
      }
    });
    return totalProfit;
  };

  const realProfit = calculateRealProfit();
  const totalInvestment = positions.reduce((sum, p) => sum + (p.quantity * p.avgPrice), 0);
  const realProfitPercent = totalInvestment > 0 ? (realProfit / totalInvestment) * 100 : 0;

  const startEditPosition = (position: MarketPosition) => {
    debug('startEditPosition', position);
    setEditingPositionId(position.id);
    setEditQuantity(position.quantity.toString());
    setEditAvgPrice(position.avgPrice.toString());
  };

  const saveEditPosition = (id: string) => {
    debug('saveEditPosition', id, { quantity: editQuantity, avgPrice: editAvgPrice });
    const quantity = parseFloat(editQuantity);
    const avgPrice = parseFloat(editAvgPrice);
    if (!isNaN(quantity) && !isNaN(avgPrice)) {
      updatePosition(id, { quantity, avgPrice });
      setEditingPositionId(null);
    }
  };

  const cancelEditPosition = () => {
    debug('cancelEditPosition');
    setEditingPositionId(null);
  };

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={item} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-400">实时收益</p>
            <h1 className="text-3xl font-bold font-mono text-white">
              {formatCurrency(realProfit)}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={realProfit >= 0 ? 'green' : 'red'}>
              {realProfit >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {formatPercent(realProfitPercent)}
            </Badge>
            <button 
              onClick={() => {
                debug('refresh all clicked');
                refreshMarket();
                refreshETF();
              }}
              className="p-2 hover:bg-finance-card-hover rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">总资产</span>
            </div>
            <p className="text-xl font-bold font-mono text-white">
              {formatCurrency(portfolio.totalValue)}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">累计收益</span>
            </div>
            <p className={`text-xl font-bold font-mono ${getChangeColor(portfolio.totalProfit)}`}>
              {formatCurrency(portfolio.totalProfit)}
            </p>
            <p className={`text-xs font-mono ${getChangeColor(portfolio.totalProfitPercent)}`}>
              {formatPercent(portfolio.totalProfitPercent)}
            </p>
          </Card>
        </div>
      </motion.header>

      <motion.div variants={item} className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">市场指数</h2>
          <div className="flex items-center gap-2">
            {marketLastUpdate && (
              <span className="text-xs text-gray-400">
                {new Date(marketLastUpdate).toLocaleTimeString()}
              </span>
            )}
            <button 
              onClick={() => {
                debug('refresh market clicked');
                refreshMarket();
              }}
              className="text-sm text-finance-blue flex items-center gap-1"
            >
              刷新
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3 min-w-max">
          {marketLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card min-w-[160px]">
                <div className="h-4 w-20 skeleton rounded mb-2" />
                <div className="h-6 w-28 skeleton rounded mb-1" />
                <div className="h-4 w-24 skeleton rounded" />
              </div>
            ))
          ) : (
            Object.values(marketDataMap).map((data, i) => {
              const isPositive = data.change >= 0;
              return (
                <motion.div
                  key={data.symbol}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="card min-w-[160px]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">{data.name}</span>
                    <div className={`p-1 rounded ${getChangeBg(data.change)}`}>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-finance-green" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-finance-red" />
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold font-mono text-white mb-1">
                    {data.price.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-sm font-mono ${getChangeColor(data.change)}`}>
                    {isPositive ? '+' : ''}{data.change.toFixed(2)} ({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)
                  </p>
                  {data.validationWarning && (
                    <p className="text-xs text-finance-gold mt-1">⚠️ 数据差异</p>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-4">
        <h2 className="text-lg font-semibold text-white">快捷入口</h2>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-6">
        <Card 
          className="p-4 cursor-pointer" 
          onClick={() => {
            debug('navigate to /grid');
            navigate('/grid');
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-finance-blue/20 rounded-xl">
              <Grid3X3 className="w-5 h-5 text-finance-blue" />
            </div>
            <span className="font-medium text-white">网格交易</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">自动化的价格区间套利</p>
          <div className="flex items-center justify-between">
            <Badge variant="blue">2个策略</Badge>
            <ArrowUpRight className="w-4 h-4 text-gray-500" />
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer" 
          onClick={() => {
            debug('navigate to /ai-plan');
            navigate('/ai-plan');
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-finance-green/20 rounded-xl">
              <Bot className="w-5 h-5 text-finance-green" />
            </div>
            <span className="font-medium text-white">AI计划</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">智能信号量化决策</p>
          <div className="flex items-center justify-between">
            <Badge variant="green">2个信号</Badge>
            <ArrowUpRight className="w-4 h-4 text-gray-500" />
          </div>
        </Card>

        <Card 
          className="p-4 cursor-pointer" 
          onClick={() => {
            debug('navigate to /risk');
            navigate('/risk');
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-finance-gold/20 rounded-xl">
              <Shield className="w-5 h-5 text-finance-gold" />
            </div>
            <span className="font-medium text-white">风险中心</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">全方位风险监控预警</p>
          <div className="flex items-center justify-between">
            <Badge variant="gold">4项指标</Badge>
            <ArrowUpRight className="w-4 h-4 text-gray-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-finance-red/20 rounded-xl">
              <Bell className="w-5 h-5 text-finance-red" />
            </div>
            <span className="font-medium text-white">提醒</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">重要消息通知</p>
          <div className="flex items-center justify-between">
            <Badge variant="red">3条未读</Badge>
            <ArrowUpRight className="w-4 h-4 text-gray-500" />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">我的持仓</h2>
        <button className="text-sm text-finance-blue flex items-center gap-1">
          全部持仓
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        {positions.map((position, index) => {
          const realData = etfDataMap[position.symbol];
          const currentPrice = realData?.price || position.currentPrice;
          const currentValue = currentPrice * position.quantity;
          const costValue = position.avgPrice * position.quantity;
          const profit = currentValue - costValue;
          const profitPercent = costValue > 0 ? (profit / costValue) * 100 : 0;
          const isPositive = profit >= 0;
          const isEditing = editingPositionId === position.id;

          return (
            <motion.div
              key={position.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-finance-blue/20 rounded-xl flex items-center justify-center">
                      <PieChart className="w-5 h-5 text-finance-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{position.name}</h3>
                      <p className="text-xs text-gray-400">{position.symbol}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        debug('edit position clicked');
                        startEditPosition(position);
                      }}
                      className="p-1 hover:bg-finance-card-hover rounded"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <div className="text-right">
                      <p className="font-bold font-mono text-white">
                        {formatCurrency(currentValue)}
                      </p>
                      <p className={`text-xs font-mono ${getChangeColor(profitPercent)}`}>
                        {formatPercent(profitPercent)}
                      </p>
                    </div>
                  </div>
                </div>

                {realData && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-finance-green/20 text-finance-green rounded">
                      现价: ¥{realData.price.toFixed(3)}
                    </span>
                    <span className={`text-xs ${getChangeColor(realData.changePercent)}`}>
                      {realData.changePercent >= 0 ? '+' : ''}{realData.changePercent.toFixed(2)}%
                    </span>
                    {realData.validationWarning && (
                      <span className="text-xs text-finance-gold">⚠️</span>
                    )}
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-3 p-3 bg-finance-bg-secondary rounded-xl">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">持仓数量</p>
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => {
                            debug('edit quantity changed', e.target.value);
                            setEditQuantity(e.target.value);
                          }}
                          className="w-full bg-finance-card border border-finance-border rounded-lg px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">成本价</p>
                        <input
                          type="number"
                          step="0.001"
                          value={editAvgPrice}
                          onChange={(e) => {
                            debug('edit avg price changed', e.target.value);
                            setEditAvgPrice(e.target.value);
                          }}
                          className="w-full bg-finance-card border border-finance-border rounded-lg px-3 py-2 text-white font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          debug('cancel edit clicked');
                          cancelEditPosition();
                        }}
                        className="flex-1 py-2 bg-finance-card-hover rounded-lg text-gray-300 flex items-center justify-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        取消
                      </button>
                      <button
                        onClick={() => {
                          debug('save edit clicked');
                          saveEditPosition(position.id);
                        }}
                        className="flex-1 py-2 bg-finance-blue rounded-lg text-white flex items-center justify-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 p-3 bg-finance-bg-secondary rounded-xl">
                    <div>
                      <p className="text-xs text-gray-400">持仓数量</p>
                      <p className="text-sm font-mono text-white">{position.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">成本价</p>
                      <p className="text-sm font-mono text-white">¥{position.avgPrice.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">浮动盈亏</p>
                      <p className={`text-sm font-mono ${getChangeColor(profit)}`}>
                        {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={item} className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          📊 数据来源: 新浪财经 · 腾讯财经 · 东方财富
        </p>
        <p className="text-xs text-gray-600 mt-1">
          每5秒自动刷新 · 价格差异超0.5%会有提示
        </p>
      </motion.div>
    </motion.div>
  );
}
