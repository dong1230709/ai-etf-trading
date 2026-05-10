import { useState, useEffect, useCallback, useRef } from 'react';

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export function useMarketData(symbols: string[], updateInterval: number = 5000) {
  const [data, setData] = useState<Record<string, MarketData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const newData: Record<string, MarketData> = {};
      
      symbols.forEach(symbol => {
        const basePrice = getBasePrice(symbol);
        const volatility = getVolatility(symbol);
        const randomChange = (Math.random() - 0.5) * volatility;
        
        const existing = data[symbol];
        const prevPrice = existing?.price || basePrice;
        const newPrice = prevPrice * (1 + randomChange / 100);
        
        newData[symbol] = {
          symbol,
          name: getSymbolName(symbol),
          price: newPrice,
          change: newPrice - basePrice,
          changePercent: ((newPrice - basePrice) / basePrice) * 100,
          volume: Math.floor(Math.random() * 10000000),
          timestamp: Date.now(),
        };
      });

      setData(newData);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to fetch market data');
      setIsLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    fetchData();
    
    intervalRef.current = window.setInterval(fetchData, updateInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, updateInterval]);

  return { data, isLoading, error, refresh: fetchData };
}

function getBasePrice(symbol: string): number {
  const prices: Record<string, number> = {
    '000001': 3156.28,
    '399001': 10565.82,
    '399006': 2156.38,
    '000300': 3695.42,
    '510300': 4.285,
    '159915': 2.418,
    '512880': 1.856,
  };
  return prices[symbol] || 100;
}

function getVolatility(symbol: string): number {
  const volatilities: Record<string, number> = {
    '000001': 0.5,
    '399001': 0.6,
    '399006': 0.8,
    '000300': 0.4,
    '510300': 0.3,
    '159915': 0.5,
    '512880': 0.7,
  };
  return volatilities[symbol] || 0.5;
}

function getSymbolName(symbol: string): string {
  const names: Record<string, string> = {
    '000001': '上证指数',
    '399001': '深证成指',
    '399006': '创业板',
    '000300': '沪深300',
    '510300': '沪深300ETF',
    '159915': '创业板ETF',
    '512880': '证券ETF',
  };
  return names[symbol] || symbol;
}
