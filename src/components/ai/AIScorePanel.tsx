import { motion } from 'framer-motion';
import { Brain, TrendingUp, Activity, BarChart3, RefreshCw } from 'lucide-react';
import type { AIScore, RiskScore, AIExecutionPlan } from '../../types/ai';
import { RISK_LEVEL_COLORS } from '../../types/ai';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface AIScorePanelProps {
  plan: AIExecutionPlan;
}

function ScoreBar({ score, label, color = 'blue' }: { score: number; label: string; color?: 'blue' | 'green' | 'red' | 'gold' }) {
  const colorClasses = {
    blue: 'from-finance-blue to-finance-blue/70',
    green: 'from-finance-green to-finance-green/70',
    red: 'from-finance-red to-finance-red/70',
    gold: 'from-finance-gold to-finance-gold/70',
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-mono font-semibold text-white">{score}</span>
      </div>
      <div className="h-2 bg-finance-bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
      </div>
    </div>
  );
}

export function AIScorePanel({ plan }: AIScorePanelProps) {
  const { aiScore, riskScore, confidence } = plan;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'green';
    if (score >= 50) return 'blue';
    if (score >= 30) return 'gold';
    return 'red';
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-finance-blue/20 rounded-xl">
            <Brain className="w-5 h-5 text-finance-blue" />
          </div>
          <h3 className="font-semibold text-white">AI评分</h3>
        </div>
        <Badge variant="blue">置信度 {confidence}%</Badge>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-finance-border)"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={aiScore.overall >= 70 ? 'var(--color-finance-green)' : aiScore.overall >= 50 ? 'var(--color-finance-blue)' : aiScore.overall >= 30 ? 'var(--color-finance-gold)' : 'var(--color-finance-red)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283"
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (aiScore.overall / 100) * 283 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-mono text-white">{aiScore.overall}</span>
            <span className="text-xs text-gray-400">综合</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">分项评分</h4>
        <ScoreBar score={aiScore.trend} label="趋势" color={getScoreColor(aiScore.trend)} />
        <ScoreBar score={aiScore.volatility} label="波动率" color={getScoreColor(aiScore.volatility)} />
        <ScoreBar score={aiScore.volume} label="成交量" color={getScoreColor(aiScore.volume)} />
        <ScoreBar score={aiScore.momentum} label="动量" color={getScoreColor(aiScore.momentum)} />
        <ScoreBar score={aiScore.meanReversion} label="均值回归" color={getScoreColor(aiScore.meanReversion)} />
      </div>

      <div className="border-t border-finance-border pt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          风险评分
        </h4>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">综合风险</span>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold font-mono ${RISK_LEVEL_COLORS[riskScore.level]}`}>
              {riskScore.overall}
            </span>
            <Badge variant={riskScore.level === 'low' ? 'green' : riskScore.level === 'medium' ? 'gold' : riskScore.level === 'high' ? 'red' : 'red'}>
              {riskScore.level === 'low' ? '低' : riskScore.level === 'medium' ? '中' : riskScore.level === 'high' ? '高' : '极高'}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>波动风险</span>
            <span className="font-mono">{riskScore.volatilityRisk}</span>
          </div>
          <div className="flex justify-between">
            <span>回撤风险</span>
            <span className="font-mono">{riskScore.drawdownRisk}</span>
          </div>
          <div className="flex justify-between">
            <span>流动性</span>
            <span className="font-mono">{riskScore.liquidityRisk}</span>
          </div>
          <div className="flex justify-between">
            <span>趋势风险</span>
            <span className="font-mono">{riskScore.trendRisk}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
