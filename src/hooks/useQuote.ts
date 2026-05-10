// 行情数据Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { quoteService } from '../services/quote.service';
import type { StockQuoteWithValidation, MultiSourceQuoteResult } from '../types/quote';
import { REFRESH_CONFIG } from '../types/quote';

interface UseQuoteOptions {
  /** 是否自动刷新 */
  autoRefresh?: boolean;
  /** 刷新间隔(ms) */
  refreshInterval?: number;
  /** 初始数据是否缓存 */
  useCache?: boolean;
}

interface UseQuoteResult {
  /** 行情数据 */
  data: StockQuoteWithValidation | null;
  /** 原始多源数据 */
  multiSourceData: MultiSourceQuoteResult | null;
  /** 加载状态 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 手动刷新 */
  refresh: () => Promise<void>;
  /** 最后更新时间 */
  lastUpdate: number | null;
  /** 是否正在刷新 */
  isRefreshing: boolean;
}

/**
 * 获取单个股票行情
 */
export function useQuote(
  symbol: string,
  options: UseQuoteOptions = {}
): UseQuoteResult {
  const {
    autoRefresh = true,
    refreshInterval = REFRESH_CONFIG.interval,
    useCache = true
  } = options;

  const [data, setData] = useState<StockQuoteWithValidation | null>(null);
  const [multiSourceData, setMultiSourceData] = useState<MultiSourceQuoteResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // 获取行情数据
  const fetchData = useCallback(async () => {
    if (!symbol) return;

    try {
      setIsRefreshing(true);
      const result = await quoteService.getQuote(symbol);
      
      if (mountedRef.current) {
        if (result.allFailed) {
          setError('所有数据源均获取失败');
          setData(null);
        } else {
          setError(null);
          setData(result.validatedQuote || null);
        }
        setMultiSourceData(result);
        setLastUpdate(Date.now());
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : '获取行情失败');
        setIsLoading(false);
      }
    } finally {
      if (mountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [symbol]);

  // 初始化和清理
  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh && symbol) {
      intervalRef.current = window.setInterval(() => {
        fetchData();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, symbol, fetchData]);

  return {
    data,
    multiSourceData,
    isLoading,
    error,
    refresh: fetchData,
    lastUpdate,
    isRefreshing
  };
}

// 多股票行情Hook
interface UseQuotesOptions extends UseQuoteOptions {
  /** 初始股票列表 */
  initialSymbols?: string[];
}

interface UseQuotesResult {
  /** 行情数据映射 */
  dataMap: Record<string, StockQuoteWithValidation>;
  /** 加载状态 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 手动刷新 */
  refresh: () => Promise<void>;
  /** 最后更新时间 */
  lastUpdate: number | null;
  /** 所有股票列表 */
  symbols: string[];
  /** 添加股票 */
  addSymbol: (symbol: string) => void;
  /** 移除股票 */
  removeSymbol: (symbol: string) => void;
}

export function useQuotes(options: UseQuotesOptions = {}): UseQuotesResult {
  const {
    autoRefresh = true,
    refreshInterval = REFRESH_CONFIG.interval,
    initialSymbols = []
  } = options;

  const [symbols, setSymbols] = useState<string[]>(initialSymbols);
  const [dataMap, setDataMap] = useState<Record<string, StockQuoteWithValidation>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // 获取行情数据
  const fetchData = useCallback(async () => {
    if (symbols.length === 0) return;

    try {
      const results = await quoteService.getQuotes(symbols);
      
      if (mountedRef.current) {
        const newMap: Record<string, StockQuoteWithValidation> = {};
        let hasError = false;

        results.forEach(result => {
          if (result.allFailed) {
            hasError = true;
          } else if (result.validatedQuote) {
            newMap[result.symbol] = result.validatedQuote;
          }
        });

        setDataMap(newMap);
        setError(hasError ? '部分数据获取失败' : null);
        setLastUpdate(Date.now());
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : '获取行情失败');
        setIsLoading(false);
      }
    }
  }, [symbols]);

  // 初始化和清理
  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh && symbols.length > 0) {
      intervalRef.current = window.setInterval(fetchData, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, symbols.length, fetchData]);

  // 添加股票
  const addSymbol = useCallback((symbol: string) => {
    setSymbols(prev => {
      if (prev.includes(symbol)) return prev;
      return [...prev, symbol];
    });
  }, []);

  // 移除股票
  const removeSymbol = useCallback((symbol: string) => {
    setSymbols(prev => prev.filter(s => s !== symbol));
    setDataMap(prev => {
      const newMap = { ...prev };
      delete newMap[symbol];
      return newMap;
    });
  }, []);

  return {
    dataMap,
    isLoading,
    error,
    refresh: fetchData,
    lastUpdate,
    symbols,
    addSymbol,
    removeSymbol
  };
}

// 市场指数Hook
export function useMarketIndices(autoRefresh = true) {
  return useQuotes({
    autoRefresh,
    initialSymbols: ['000001', '399001', '399006', '000300']
  });
}

// ETF行情Hook
export function useETFs(autoRefresh = true) {
  return useQuotes({
    autoRefresh,
    initialSymbols: ['510300', '159915', '512880']
  });
}
