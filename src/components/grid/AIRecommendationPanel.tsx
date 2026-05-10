// AI推荐面板组件

import { motion } from 'framer-motion';
import { Brain, TrendingUp, Shield, Target } from 'lucide-react';
import type { AIRecommendation, GridConfig } from '../../types/grid';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface AIRecommendationPanelProps {
  recommendation: AIRecommendation | null;
  onApply: (config: Partial<GridConfig>) => void;
  isLoading?: boolean;
}

export function AIRecommendationPanel({ 
  recommendation, 
  onApply,
  isLoading 
}: AIRecommendationPanelProps) {
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-finance-blue/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-finance-blue animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI分析中...</h3>
            <p className="text-xs text-gray-400">正在分析市场波动率</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-finance-bg-secondary rounded skeleton" />
          <div className="h-8 bg-finance-bg-secondary rounded skeleton" />
          <div className="h-8 bg-finance-bg-secondary rounded skeleton" />
        </div>
      </Card>
    );
  }

  if (!recommendation) {
    return (
      <Card className="p-4">
        <div className="text-center py-6">
          <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            点击上方"AI智能推荐"按钮
          </p>
          <p className="text-gray-500 text-xs mt-1">
            获取基于波动率的个性化网格参数
          </p>
        </div>
      </Card>
    );
  }

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'low': return 'green';
      case 'medium': return 'gold';
      case 'high': return 'red';
      default: return 'blue';
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'low': return '低风险';
      case 'medium': return '中风险';
      case 'high': return '高风险';
      default: return level;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-finance-blue to-finance-green flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">AI智能推荐</h3>
              <Badge variant={getRiskBadgeVariant(recommendation.riskLevel)}>
                {getRiskText(recommendation.riskLevel)}
              </Badge>
            </div>
            <p className="text-xs text-gray-400">
              置信度 {recommendation.confidence}%
            </p>
          </div>
        </div>

        {/* 推荐参数 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-finance-bg-secondary rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-finance-blue" />
              <span className="text-xs text-gray-400">推荐网格数</span>
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {recommendation.suggestedGridCount}格
            </p>
          </div>

          <div className="p-3 bg-finance-bg-secondary rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-finance-green" />
              <span className="text-xs text-gray-400">预期收益</span>
            </div>
            <p className="text-2xl font-bold font-mono text-finance-green">
              {recommendation.expectedReturn.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* 间距推荐 */}
        <div className="p-3 bg-finance-bg-secondary rounded-xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">推荐网格间距</span>
            <Badge variant="blue">{recommendation.suggestedSpacingType}</Badge>
          </div>
          <p className="text-lg font-bold font-mono text-white">
            {recommendation.suggestedSpacing.toFixed(2)}%
          </p>
        </div>

        {/* 推荐理由 */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">推荐理由</h4>
          <div className="space-y-2">
            {recommendation.reasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2"
              >
                <span className="text-finance-blue mt-1">•</span>
                <p className="text-sm text-gray-400">{reason}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 应用按钮 */}
        <button
          onClick={() => onApply({
            gridCount: recommendation.suggestedGridCount,
            spacingType: recommendation.suggestedSpacingType,
            spacingPercent: recommendation.suggestedSpacing,
          })}
          className="w-full py-3 bg-gradient-to-r from-finance-blue to-finance-green rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
        >
          应用AI推荐参数
        </button>

        {/* 风险提示 */}
        <div className="mt-4 p-3 bg-finance-gold/10 border border-finance-gold/30 rounded-xl">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-finance-gold flex-shrink-0 mt-0.5" />
            <p className="text-xs text-finance-gold">
              AI推荐仅供参考，实际参数应根据个人风险承受能力和市场判断进行调整
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
