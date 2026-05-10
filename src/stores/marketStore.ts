import { create } from 'zustand';
import type { StockQuoteWithValidation } from '../types/quote';

export interface Position {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

interface MarketState {
  watchlist: string[];
  marketData: Record<string, StockQuoteWithValidation>;
  selectedMarket: string | null;
  refreshInterval: number;
  lastUpdate: number | null;
  positions: Position[];
}

interface MarketActions {
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  updateMarketData: (symbol: string, data: StockQuoteWithValidation) => void;
  setSelectedMarket: (symbol: string | null) => void;
  setRefreshInterval: (interval: number) => void;
  clearMarketData: () => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  addPosition: (position: Position) => void;
  removePosition: (id: string) => void;
}

// 调试日志函数
const debug = (message: string, ...args: any[]) => {
  console.log(`[DEBUG-Market] ${message}`, ...args);
};

export const useMarketStore = create<MarketState & MarketActions>((set, get) => ({
  watchlist: ['510300', '159915', '512880', '000001', '399001', '399006', '000300'],
  marketData: {},
  selectedMarket: null,
  refreshInterval: 5000,
  lastUpdate: null,
  positions: [
    {
      id: '1',
      symbol: '510300',
      name: '沪深300ETF',
      quantity: 10000,
      avgPrice: 4.250,
      currentPrice: 4.320,
    },
    {
      id: '2',
      symbol: '159915',
      name: '创业板ETF',
      quantity: 5000,
      avgPrice: 2.850,
      currentPrice: 2.900,
    },
  ],

  addToWatchlist: (symbol) => {
    debug('addToWatchlist', symbol);
    const current = get().watchlist;
    if (!current.includes(symbol)) {
      set({ watchlist: [...current, symbol] });
    }
  },

  removeFromWatchlist: (symbol) => {
    debug('removeFromWatchlist', symbol);
    const current = get().watchlist;
    set({ watchlist: current.filter(s => s !== symbol) });
  },

  updateMarketData: (symbol, data) => {
    debug('updateMarketData', symbol, data);
    set(state => ({
      marketData: {
        ...state.marketData,
        [symbol]: data
      },
      lastUpdate: Date.now()
    }));
  },

  setSelectedMarket: (symbol) => {
    debug('setSelectedMarket', symbol);
    set({ selectedMarket: symbol });
  },

  setRefreshInterval: (interval) => {
    debug('setRefreshInterval', interval);
    set({ refreshInterval: interval });
  },

  clearMarketData: () => {
    debug('clearMarketData');
    set({ marketData: {} });
  },

  updatePosition: (id, updates) => {
    debug('updatePosition', id, updates);
    set(state => ({
      positions: state.positions.map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
    }));
  },

  addPosition: (position) => {
    debug('addPosition', position);
    set(state => ({
      positions: [...state.positions, position]
    }));
  },

  removePosition: (id) => {
    debug('removePosition', id);
    set(state => ({
      positions: state.positions.filter(p => p.id !== id)
    }));
  },
}));
