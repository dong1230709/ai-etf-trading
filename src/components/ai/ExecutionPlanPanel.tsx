import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, Clock, Zap, DollarSign } from 'lucide-react';
import type { AIExecutionPlan } from '../../types/ai';
import { SUGGESTION_COLORS, SUGGESTION_LABELS } from '../../types/ai';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface ExecutionPlanPanelProps {
  plan: AIExecutionPlan;
}

export function ExecutionPlanPanel({ plan }: ExecutionPlanPanelProps) {
  const { suggestion, suggestionText, positionAdvice, gridAdvice, executionSteps } = plan;

  const getSuggestionIcon = (s: AIExecutionPlan['suggestion']) => {
    switch (s) {
      case 'buy':
      case 'add':
        return <TrendingUp className="w-5 h-5" />;
      case 'sell':
      case 'reduce':
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-finance-green/20 rounded-xl">
            <Zap className="w-5 h-5 text-finance-green" />
          </div>
          <h3 className="font-semibold text-white">执行计划</h3>
        </div>
        <div className={`p-2 rounded-xl ${SUGGESTION_COLORS[suggestion]}`}>
          {getSuggestionIcon(suggestion)}
        </div>
      </div>

      <div className="mb-4 p-3 bg-finance-bg-secondary rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={suggestion === 'buy' ? 'green' : suggestion === 'sell' ? 'red' : suggestion === 'add' ? 'blue' : suggestion === 'reduce' ? 'gold' : 'default'}>
            {SUGGESTION_LABELS[suggestion]}
          </Badge>
          <span className="text-sm font-medium text-white">AI建议</span>
        </div>
        <p className="text-sm text-gray-300">{suggestionText}</p>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          仓位建议
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-finance-bg-secondary rounded-lg">
            <span className="text-sm text-gray-400">底仓</span>
            <span className="text-sm font-mono font-semibold text-white">{(positionAdvice.basePosition * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-finance-bg-secondary rounded-lg">
            <span className="text-sm text-gray-400">网格仓位</span>
            <span className="text-sm font-mono font-semibold text-white">{(positionAdvice.gridPosition * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-finance-bg-secondary rounded-lg">
            <span className="text-sm text-gray-400">最大仓位</span>
            <span className="text-sm font-mono font-semibold text-white">{(positionAdvice.maxPosition * 100).toFixed(0)}%</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">{positionAdvice.positionText}</p>
      </div>

      <div className="mb-4 border-t border-finance-border pt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">网格建议</h4>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="p-2 bg-finance-bg-secondary rounded-lg">
            <p className="text-xs text-gray-400">网格数</p>
            <p className="text-sm font-mono text-white">{gridAdvice.gridCount}格</p>
          </div>
          <div className="p-2 bg-finance-bg-secondary rounded-lg">
            <p className="text-xs text-gray-400">间距</p>
            <p className="text-sm font-mono text-white">{gridAdvice.spacingPercent.toFixed(1)}%</p>
          </div>
          <div className="p-2 bg-finance-bg-secondary rounded-lg">
            <p className="text-xs text-gray-400">上沿</p>
            <p className="text-sm font-mono text-white">{gridAdvice.upperPrice.toFixed(3)}</p>
          </div>
          <div className="p-2 bg-finance-bg-secondary rounded-lg">
            <p className="text-xs text-gray-400">下沿</p>
            <p className="text-sm font-mono text-white">{gridAdvice.lowerPrice.toFixed(3)}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">{gridAdvice.gridText}</p>
      </div>

      <div className="border-t border-finance-border pt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          执行步骤
        </h4>
        <div className="space-y-2">
          {executionSteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-3 rounded-lg border ${step.priority === 1 ? 'border-finance-gold bg-finance-gold/5' : step.priority === 2 ? 'border-finance-blue bg-finance-blue/5' : 'border-finance-border bg-finance-bg-secondary'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.priority === 1 ? 'bg-finance-gold text-finance-bg' : step.priority === 2 ? 'bg-finance-blue text-white' : 'bg-finance-border text-gray-400'}`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={step.action === 'buy' ? 'green' : 'red'}>
                      {step.action === 'buy' ? '买入' : '卖出'}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {step.type === 'now' ? '立即' : step.type === 'price' ? `价格 ${step.price?.toFixed(3)}` : '定时'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
