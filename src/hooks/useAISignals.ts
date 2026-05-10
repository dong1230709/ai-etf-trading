import { useState, useEffect, useCallback } from 'react';

export interface AISignal {
  id: string;
  symbol: string;
  name: string;
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
  targetPrice?: number;
  stopLoss?: number;
  reason: string;
  timestamp: number;
  validUntil?: number;
  status: 'pending' | 'executed' | 'expired';
}

export interface AIAnalysis {
  symbol: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  support: number;
  resistance: number;
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
}

const mockSignals: AISignal[] = [
  {
    id: '1',
    symbol: '510300',
    name: '沪深300ETF',
    signal: 'buy',
    confidence: 85,
    targetPrice: 4.35,
    stopLoss: 4.15,
    reason: '技术指标显示超跌反弹信号，RSI低于30，MACD底部金叉',
    timestamp: Date.now() - 3600000,
    validUntil: Date.now() + 7200000,
    status: 'pending',
  },
  {
    id: '2',
    symbol: '159915',
    name: '创业板ETF',
    signal: 'hold',
    confidence: 72,
    reason: '当前价格处于震荡区间，建议观望等待突破',
    timestamp: Date.now() - 7200000,
    status: 'pending',
  },
  {
    id: '3',
    symbol: '512880',
    name: '证券ETF',
    signal: 'sell',
    confidence: 78,
    targetPrice: 1.80,
    stopLoss: 1.90,
    reason: '成交量萎缩，趋势走弱，建议减仓或止损',
    timestamp: Date.now() - 1800000,
    status: 'pending',
  },
];

export function useAISignals() {
  const [signals, setSignals] = useState<AISignal[]>(mockSignals);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const refreshSignals = useCallback(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      const updatedSignals = signals.map(signal => {
        if (signal.validUntil && Date.now() > signal.validUntil) {
          return { ...signal, status: 'expired' as const };
        }
        return signal;
      });
      
      setSignals(updatedSignals);
      setLastUpdate(Date.now());
      setIsLoading(false);
    }, 500);
  }, [signals]);

  const executeSignal = useCallback((signalId: string) => {
    setSignals(prev => 
      prev.map(signal => 
        signal.id === signalId 
          ? { ...signal, status: 'executed' as const }
          : signal
      )
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshSignals, 30000);
    return () => clearInterval(interval);
  }, [refreshSignals]);

  return {
    signals,
    isLoading,
    lastUpdate,
    refreshSignals,
    executeSignal,
  };
}

export function useAIAnalysis(symbol: string) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      setAnalysis({
        symbol,
        trend: 'bullish',
        support: 4.20,
        resistance: 4.40,
        recommendation: '逢低布局，控制仓位',
        riskLevel: 'medium',
        factors: [
          '技术面：RSI显示超卖，有反弹需求',
          '资金面：主力资金持续净流入',
          '基本面：沪深300估值处于历史低位',
        ],
      });
      setIsLoading(false);
    }, 800);
  }, [symbol]);

  return { analysis, isLoading };
}
