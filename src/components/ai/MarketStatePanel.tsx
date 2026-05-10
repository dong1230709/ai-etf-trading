import { motion } from 'framer-motion';
import { TrendingUp, Activity, AlertTriangle, Zap, BarChart3 } from 'lucide-react';
import type { MarketStateResult, VolatilityAnalysis, AIExecutionPlan } from '../../types/ai';
import { MARKET_STATE_LABELS } from '../../types/ai';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface MarketStatePanelProps {
  plan: AIExecutionPlan;
}

export function MarketStatePanel({ plan }: MarketStatePanelProps) {
  const { marketState, volatilityAnalysis } = plan;

  const getStateIcon = (state: MarketStateResult['state']) => {
    switch (state) {
      case 'trending_up':
        return <TrendingUp className="w-5 h-5 text-finance-green" />;
      case 'high_range_shock':
      case 'low_range_shock':
        return <Activity className="w-5 h-5 text-finance-gold" />;
      case 'sharp_drop_panic':
        return <AlertTriangle className="w-5 h-5 text-finance-red" />;
      case 'high_vol_risk':
        return <Zap className="w-5 h-5 text-finance-red" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStateBadge = (state: MarketStateResult['state']) => {
    switch (state) {
      case 'trending_up':
        return 'green';
      case 'high_range_shock':
      case 'low_range_shock':
        return 'gold';
      case 'sharp_drop_panic':
      case 'high_vol_risk':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-finance-gold/20 rounded-xl">
            <Activity className="w-5 h-5 text-finance-gold" />
          </div>
          <h3 className="font-semibold text-white">市场状态</h3>
        </div>
        <Badge variant="blue">{marketState.confidence}% 置信</Badge>
      </div>

      <div className="flex items-center gap-3 mb-4 p-3 bg-finance-bg-secondary rounded-xl">
        <div className="p-2 bg-finance-bg rounded-lg">
          {getStateIcon(marketState.state)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{MARKET_STATE_LABELS[marketState.state]}</span>
            <Badge variant={getStateBadge(marketState.state)}>
              {marketState.state === 'trending_up' ? '做多' : marketState.state === 'sharp_drop_panic' || marketState.state === 'high_vol_risk' ? '规避' : '网格'}
            </Badge>
          </div>
          <p className="text-xs text-gray-400">预计持续 {marketState.duration} 分钟</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">识别依据</h4>
        <div className="space-y-2">
          {marketState.reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2 text-sm text-gray-400"
            >
              <span className="text-finance-gold mt-0.5">•</span>
              <span>{reason}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="border-t border-finance-border pt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          波动率分析
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-finance-bg-secondary rounded-xl">
            <p className="text-xs text-gray-400 mb-1">当前波动率</p>
            <p className="text-lg font-bold font-mono text-white">{volatilityAnalysis.currentVolatility.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-finance-bg-secondary rounded-xl">
            <p className="text-xs text-gray-400 mb-1">历史平均</p>
            <p className="text-lg font-bold font-mono text-white">{volatilityAnalysis.historicalAvg.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-finance-bg-secondary rounded-xl">
            <p className="text-xs text-gray-400 mb-1">波动率比</p>
            <p className={`text-lg font-bold font-mono ${volatilityAnalysis.volatilityRatio > 1.5 ? 'text-finance-red' : volatilityAnalysis.volatilityRatio < 0.8 ? 'text-finance-green' : 'text-white'}`}>
              {volatilityAnalysis.volatilityRatio.toFixed(2)}x
            </p>
          </div>
          <div className="p-3 bg-finance-bg-secondary rounded-xl">
            <p className="text-xs text-gray-400 mb-1">布林带宽度</p>
            <p className="text-lg font-bold font-mono text-white">{volatilityAnalysis.bollingerWidth.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
