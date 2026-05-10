import { motion } from 'framer-motion';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Zap,
  Target,
  Shield,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useAISignals, AISignal } from '../../hooks/useAISignals';
import { formatPercent } from '../../utils/format';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function AISignalCard({ signal, onExecute }: { signal: AISignal; onExecute?: () => void }) {
  const getSignalIcon = () => {
    switch (signal.signal) {
      case 'buy':
        return <TrendingUp className="w-5 h-5" />;
      case 'sell':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Minus className="w-5 h-5" />;
    }
  };

  const getSignalColor = () => {
    switch (signal.signal) {
      case 'buy':
        return {
          bg: 'bg-finance-green/20',
          text: 'text-finance-green',
          border: 'border-finance-green/30',
        };
      case 'sell':
        return {
          bg: 'bg-finance-red/20',
          text: 'text-finance-red',
          border: 'border-finance-red/30',
        };
      default:
        return {
          bg: 'bg-finance-gold/20',
          text: 'text-finance-gold',
          border: 'border-finance-gold/30',
        };
    }
  };

  const getSignalText = () => {
    switch (signal.signal) {
      case 'buy':
        return '买入信号';
      case 'sell':
        return '卖出信号';
      default:
        return '持有观望';
    }
  };

  const color = getSignalColor();
  const remainingTime = signal.validUntil 
    ? Math.max(0, signal.validUntil - Date.now())
    : null;
  const remainingMinutes = remainingTime ? Math.floor(remainingTime / 60000) : 0;

  return (
    <Card className={`p-4 border ${color.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${color.bg}`}>
            {getSignalIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-white">{signal.name}</h3>
            <p className="text-xs text-gray-400">{signal.symbol}</p>
          </div>
        </div>
        
        <Badge variant={
          signal.signal === 'buy' ? 'green' :
          signal.signal === 'sell' ? 'red' : 'gold'
        }>
          {getSignalText()}
        </Badge>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-300 leading-relaxed">
          {signal.reason}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-finance-bg-secondary rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-finance-blue" />
            <span className="text-xs text-gray-400">置信度</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-mono text-white">
              {signal.confidence}%
            </span>
          </div>
          <div className="mt-2 h-1.5 bg-finance-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-finance-blue to-finance-green rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${signal.confidence}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>

        <div className="p-3 bg-finance-bg-secondary rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">有效期</span>
          </div>
          <span className="text-xl font-bold font-mono text-white">
            {remainingMinutes}分钟
          </span>
        </div>
      </div>

      {signal.targetPrice && (
        <div className="flex items-center justify-between p-3 bg-finance-bg-secondary rounded-xl mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-finance-green" />
            <span className="text-sm text-gray-400">目标价</span>
          </div>
          <span className="font-mono text-finance-green">
            ¥{signal.targetPrice.toFixed(3)}
          </span>
        </div>
      )}

      {signal.stopLoss && (
        <div className="flex items-center justify-between p-3 bg-finance-bg-secondary rounded-xl mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-finance-red" />
            <span className="text-sm text-gray-400">止损价</span>
          </div>
          <span className="font-mono text-finance-red">
            ¥{signal.stopLoss.toFixed(3)}
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <button 
          className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-2"
          onClick={onExecute}
        >
          <Zap className="w-4 h-4" />
          执行信号
        </button>
        <button className="btn-secondary flex-1 text-sm py-2.5 flex items-center justify-center gap-2">
          <ChevronRight className="w-4 h-4" />
          详情
        </button>
      </div>
    </Card>
  );
}

export function AISignalsList() {
  const { signals, isLoading, refreshSignals } = useAISignals();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-finance-blue" />
          <h3 className="font-semibold text-white">AI交易信号</h3>
        </div>
        <button 
          className="p-2 hover:bg-finance-card-hover rounded-lg transition-colors"
          onClick={refreshSignals}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {signals.filter(s => s.status === 'pending').map((signal, index) => (
        <motion.div
          key={signal.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <AISignalCard signal={signal} />
        </motion.div>
      ))}
    </div>
  );
}
