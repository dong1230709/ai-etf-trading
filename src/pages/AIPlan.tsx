import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  TrendingUp, 
  Clock,
  Zap,
  Brain,
  RefreshCw
} from 'lucide-react';
import { useQuote } from '../hooks/useQuote';
import { aiEngine } from '../engine/ai.engine';
import type { AIExecutionPlan } from '../types/ai';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AIScorePanel } from '../components/ai/AIScorePanel';
import { MarketStatePanel } from '../components/ai/MarketStatePanel';
import { ExecutionPlanPanel } from '../components/ai/ExecutionPlanPanel';

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

const SYMBOL = '510300';
const NAME = '沪深300ETF';

export const AIPlan = () => {
  const { data: quote, isLoading, refresh, lastUpdate } = useQuote(SYMBOL, { autoRefresh: true });
  const [plan, setPlan] = useState<AIExecutionPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'score' | 'market' | 'plan'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    runAnalysis();
  }, [quote?.price]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = aiEngine.analyze(SYMBOL, NAME, quote);
      setPlan(analysis);
    } catch (error) {
      console.error('AI分析失败:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefresh = async () => {
    await refresh();
    await runAnalysis();
  };

  return (
    <motion.div
      className="min-h-screen pb-24 px-4 pt-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={item} className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-finance-blue/20 rounded-xl">
              <Bot className="w-6 h-6 text-finance-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI 交易引擎</h1>
              <p className="text-sm text-gray-400">智能分析，量化决策</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading || isAnalyzing}
            className="p-2 bg-finance-bg-secondary rounded-xl text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {quote && (
          <div className="mt-4 p-4 bg-finance-bg-secondary rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">{NAME}</p>
                <p className="text-2xl font-bold font-mono text-white">¥{quote.price.toFixed(3)}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-mono ${quote.change >= 0 ? 'text-finance-green' : 'text-finance-red'}`}>
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(3)}
                </p>
                <p className={`text-sm font-mono ${quote.change >= 0 ? 'text-finance-green' : 'text-finance-red'}`}>
                  {quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                </p>
              </div>
            </div>
            {lastUpdate && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                更新于 {new Date(lastUpdate).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </motion.header>

      {plan && (
        <>
          <motion.div variants={item} className="mb-6">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {[
                { key: 'overview' as const, label: '概览', icon: Zap },
                { key: 'score' as const, label: '评分', icon: Brain },
                { key: 'market' as const, label: '状态', icon: TrendingUp },
                { key: 'plan' as const, label: '计划', icon: Clock }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-finance-blue text-white'
                        : 'bg-finance-bg-secondary text-gray-400 hover:bg-finance-border'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={item} className="space-y-4">
            {activeTab === 'overview' && (
              <>
                <AIScorePanel plan={plan} />
                <MarketStatePanel plan={plan} />
                <ExecutionPlanPanel plan={plan} />
              </>
            )}

            {activeTab === 'score' && <AIScorePanel plan={plan} />}
            {activeTab === 'market' && <MarketStatePanel plan={plan} />}
            {activeTab === 'plan' && <ExecutionPlanPanel plan={plan} />}
          </motion.div>

          <motion.div variants={item} className="mt-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-finance-blue/20 rounded-xl">
                  <Brain className="w-5 h-5 text-finance-blue" />
                </div>
                <h3 className="font-semibold text-white">AI 引擎特点</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-finance-green/20 rounded-lg flex-shrink-0">
                    <Zap className="w-4 h-4 text-finance-green" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">实时分析</p>
                    <p className="text-xs text-gray-400">
                      基于实时行情数据，持续计算技术指标和市场状态
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-finance-gold/20 rounded-lg flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-finance-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">多因子评分</p>
                    <p className="text-xs text-gray-400">
                      趋势、波动率、成交量、动量、均值回归五维综合评估
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-finance-blue/20 rounded-lg flex-shrink-0">
                    <Clock className="w-4 h-4 text-finance-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">可执行计划</p>
                    <p className="text-xs text-gray-400">
                      提供具体的仓位建议、网格参数和执行步骤
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}

      {!plan && isAnalyzing && (
        <motion.div variants={item} className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-finance-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">AI 分析中...</p>
        </motion.div>
      )}
    </motion.div>
  );
};
