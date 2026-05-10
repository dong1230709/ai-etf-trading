// 行情显示组件

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import type { StockQuoteWithValidation } from '../../types/quote';

interface QuoteCardProps {
  data: StockQuoteWithValidation;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function QuoteCard({ data, onRefresh, isRefreshing }: QuoteCardProps) {
  const isPositive = data.change >= 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isPositive ? 'bg-finance-green/20' : 'bg-finance-red/20'}`}>
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-finance-green" />
            ) : (
              <TrendingDown className="w-5 h-5 text-finance-red" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">{data.name}</h3>
            <p className="text-xs text-gray-400">{data.symbol}</p>
          </div>
        </div>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-finance-card-hover rounded-lg transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold font-mono text-white">
          {data.price.toFixed(3)}
        </span>
        <span className={`text-sm font-mono ${isPositive ? 'text-finance-green' : 'text-finance-red'}`}>
          {isPositive ? '+' : ''}{data.change.toFixed(3)}
        </span>
        <span className={`text-sm font-mono ${isPositive ? 'text-finance-green' : 'text-finance-red'}`}>
          ({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 bg-finance-bg-secondary rounded-xl mb-3">
        <div>
          <p className="text-xs text-gray-400">开盘</p>
          <p className="text-sm font-mono text-white">{data.open.toFixed(3)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">最高</p>
          <p className="text-sm font-mono text-white">{data.high.toFixed(3)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">最低</p>
          <p className="text-sm font-mono text-white">{data.low.toFixed(3)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">成交量</p>
          <p className="text-sm font-mono text-white">
            {(data.volume / 10000).toFixed(2)}万
          </p>
        </div>
      </div>

      {data.validationWarning && (
        <div className="flex items-start gap-2 p-3 bg-finance-gold/10 border border-finance-gold/30 rounded-xl mb-3">
          <AlertTriangle className="w-4 h-4 text-finance-gold flex-shrink-0 mt-0.5" />
          <p className="text-xs text-finance-gold">{data.validationWarning}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>更新: {new Date(data.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>数据源:</span>
          {data.sources.map(source => (
            <span key={source} className="px-1.5 py-0.5 bg-finance-blue/20 text-finance-blue rounded text-xs">
              {source === 'sina' ? '新浪' : source === 'tencent' ? '腾讯' : '东财'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MarketIndexCardProps {
  data: StockQuoteWithValidation;
}

export function MarketIndexCard({ data }: MarketIndexCardProps) {
  const isPositive = data.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card min-w-[160px]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{data.name}</span>
        <div className={`p-1 rounded ${isPositive ? 'bg-finance-green/20' : 'bg-finance-red/20'}`}>
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
      <p className={`text-sm font-mono ${isPositive ? 'text-finance-green' : 'text-finance-red'}`}>
        {isPositive ? '+' : ''}{data.change.toFixed(2)} ({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)
      </p>
    </motion.div>
  );
}

interface QuoteLoadingProps {
  count?: number;
}

export function QuoteLoading({ count = 1 }: QuoteLoadingProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl skeleton" />
            <div className="flex-1">
              <div className="h-5 w-24 skeleton rounded mb-2" />
              <div className="h-4 w-16 skeleton rounded" />
            </div>
          </div>
          <div className="h-8 w-32 skeleton rounded mb-3" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 skeleton rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
