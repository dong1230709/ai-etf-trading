import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Lock,
  BarChart3
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { formatCurrency, formatPercent, getChangeColor, getRiskColor, getRiskBg } from '../utils/format';
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

export const RiskCenter = () => {
  const { riskMetrics, portfolio } = useAppStore();

  const overallRiskScore = Math.round(
    riskMetrics.reduce((sum, m) => sum + (m.value / m.max) * 25, 0)
  );

  const getRiskLevel = (score: number): { text: string; color: 'green' | 'gold' | 'red'; icon: typeof Shield } => {
    if (score < 40) return { text: '低风险', color: 'green', icon: Shield };
    if (score < 70) return { text: '中风险', color: 'gold', icon: AlertTriangle };
    return { text: '高风险', color: 'red', icon: Activity };
  };

  const getRiskBgByColor = (color: 'green' | 'gold' | 'red'): string => {
    const map: Record<'green' | 'gold' | 'red', string> = {
      green: 'bg-finance-green',
      gold: 'bg-finance-gold',
      red: 'bg-finance-red',
    };
    return map[color];
  };

  const riskLevel = getRiskLevel(overallRiskScore);
  const RiskIcon = riskLevel.icon;

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
            <Shield className="w-6 h-6 text-finance-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">风险中心</h1>
            <p className="text-sm text-gray-400">全方位风险监控与预警</p>
          </div>
        </div>
      </motion.header>

      <motion.div variants={item}>
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">综合风险评分</p>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold font-mono text-white">
                  {overallRiskScore}
                </span>
                <span className="text-lg text-gray-400">/100</span>
              </div>
            </div>
            <div className={`p-3 rounded-2xl bg-finance-${riskLevel.color}/20`}>
              <RiskIcon className={`w-8 h-8 text-finance-${riskLevel.color}`} />
            </div>
          </div>

          <div className="h-3 bg-finance-bg-secondary rounded-full overflow-hidden mb-2">
            <motion.div
              className={`h-full ${getRiskBgByColor(riskLevel.color)}`}
              initial={{ width: 0 }}
              animate={{ width: `${overallRiskScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Badge variant={riskLevel.color as 'green' | 'red' | 'blue' | 'gold'}>
              {riskLevel.text}
            </Badge>
            <span className="text-sm text-gray-400">基于 {riskMetrics.length} 项指标</span>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="mb-4">
        <h2 className="text-lg font-semibold text-white">风险指标详情</h2>
      </motion.div>

      <motion.div variants={item} className="space-y-3 mb-6">
        {riskMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">{metric.label}</span>
                <Badge variant={metric.status === 'safe' ? 'green' : 
                               metric.status === 'warning' ? 'gold' : 'red'}>
                  {metric.status === 'safe' ? '安全' : 
                   metric.status === 'warning' ? '注意' : '危险'}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-end gap-2 mb-1">
                    <span className={`text-2xl font-bold font-mono ${getRiskColor(metric.status)}`}>
                      {metric.value}
                    </span>
                    <span className="text-sm text-gray-400 mb-0.5">/{metric.max}</span>
                  </div>
                  <div className="h-2 bg-finance-bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${getRiskBg(metric.status)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(metric.value / metric.max) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getRiskColor(metric.status)}`}>
                    {((metric.value / metric.max) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item} className="mb-4">
        <h2 className="text-lg font-semibold text-white">风险控制建议</h2>
      </motion.div>

      <motion.div variants={item} className="space-y-3">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-finance-green/20 rounded-xl">
              <TrendingUp className="w-5 h-5 text-finance-green" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white mb-1">仓位控制良好</p>
              <p className="text-xs text-gray-400">
                当前仓位风险处于安全区间，建议维持现有策略
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-finance-gold/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-finance-gold" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white mb-1">注意回撤风险</p>
              <p className="text-xs text-gray-400">
                回撤控制指标接近警戒线，建议设置止损点
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-finance-blue/20 rounded-xl">
              <Lock className="w-5 h-5 text-finance-blue" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white mb-1">设置止损保护</p>
              <p className="text-xs text-gray-400">
                为防止极端行情，建议设置5%-8%的止损线
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item} className="mt-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">风险模拟测试</h3>
            <Badge variant="blue">
              <BarChart3 className="w-3 h-3 mr-1" />
              回测引擎
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-3 bg-finance-bg-secondary rounded-xl">
              <p className="text-xs text-gray-400 mb-1">最大回撤</p>
              <p className="text-lg font-bold font-mono text-finance-red">
                -{formatPercent(portfolio.totalProfitPercent * 0.3)}
              </p>
            </div>
            <div className="text-center p-3 bg-finance-bg-secondary rounded-xl">
              <p className="text-xs text-gray-400 mb-1">夏普比率</p>
              <p className="text-lg font-bold font-mono text-finance-green">1.85</p>
            </div>
          </div>

          <button className="btn-primary w-full">
            运行风险模拟
          </button>
        </Card>
      </motion.div>
    </motion.div>
  );
};
