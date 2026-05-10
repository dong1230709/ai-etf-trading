import { create } from 'zustand';
import type { AIExecutionPlan } from '../types/ai';

interface AIState {
  currentPlan: AIExecutionPlan | null;
  history: AIExecutionPlan[];
  isAnalyzing: boolean;
  lastAnalysisTime: number | null;
  watchlist: string[];
}

interface AIActions {
  setCurrentPlan: (plan: AIExecutionPlan | null) => void;
  addToHistory: (plan: AIExecutionPlan) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  clearHistory: () => void;
}

export const useAIStore = create<AIState & AIActions>((set, get) => ({
  currentPlan: null,
  history: [],
  isAnalyzing: false,
  lastAnalysisTime: null,
  watchlist: ['510300', '159915', '512880'],

  setCurrentPlan: (plan) => {
    set({ currentPlan: plan, lastAnalysisTime: Date.now() });
    if (plan) {
      get().addToHistory(plan);
    }
  },

  addToHistory: (plan) => {
    set(state => ({
      history: [plan, ...state.history].slice(0, 50)
    }));
  },

  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  addToWatchlist: (symbol) => {
    const current = get().watchlist;
    if (!current.includes(symbol)) {
      set({ watchlist: [...current, symbol] });
    }
  },

  removeFromWatchlist: (symbol) => {
    set({ watchlist: get().watchlist.filter(s => s !== symbol) });
  },

  clearHistory: () => set({ history: [] }),
}));
