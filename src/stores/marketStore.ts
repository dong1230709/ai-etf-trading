import { create } from 'zustand';
import type { StockQuoteWithValidation } from '../types/quote';

interface MarketState {
  watchlist: string[];
  marketData: Record<string, StockQuoteWithValidation>;
  selectedMarket: string | null;
  refreshInterval: number;
  lastUpdate: number | null;
}

interface MarketActions {
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  updateMarketData: (symbol: string, data: StockQuoteWithValidation) => void;
  setSelectedMarket: (symbol: string | null) => void;
  setRefreshInterval: (interval: number) => void;
  clearMarketData: () => void;
}

export const useMarketStore = create<MarketState & MarketActions>((set, get) => ({
  watchlist: ['510300', '159915', '512880', '000001', '399001', '399006', '000300'],
  marketData: {},
  selectedMarket: null,
  refreshInterval: 5000,
  lastUpdate: null,

  addToWatchlist: (symbol) => {
    const current = get().watchlist;
    if (!current.includes(symbol)) {
      set({ watchlist: [...current, symbol] });
    }
  },

  removeFromWatchlist: (symbol) => {
    const current = get().watchlist;
    set({ watchlist: current.filter(s => s !== symbol) });
  },

  updateMarketData: (symbol, data) => {
    set(state => ({
      marketData: {
        ...state.marketData,
        [symbol]: data
      },
      lastUpdate: Date.now()
    }));
  },

  setSelectedMarket: (symbol) => set({ selectedMarket: symbol }),
  setRefreshInterval: (interval) => set({ refreshInterval: interval }),
  clearMarketData: () => set({ marketData: {} }),
}));
