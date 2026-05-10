import { create } from 'zustand';
import type { GridConfig, GridStrategy } from '../types/grid';

export interface GridStrategyItem {
  id: string;
  symbol: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  totalInvestment: number;
  profit: number;
  profitPercent: number;
  grids: number;
  config?: GridConfig;
  createdAt: number;
}

interface GridState {
  strategies: GridStrategyItem[];
  selectedStrategyId: string | null;
  editingConfig: GridConfig | null;
  isCreating: boolean;
}

interface GridActions {
  createStrategy: (config: GridConfig) => string;
  updateStrategy: (id: string, updates: Partial<GridStrategyItem>) => void;
  deleteStrategy: (id: string) => void;
  toggleStrategyStatus: (id: string) => void;
  setSelectedStrategy: (id: string | null) => void;
  setEditingConfig: (config: GridConfig | null) => void;
  setIsCreating: (isCreating: boolean) => void;
  getStrategyById: (id: string) => GridStrategyItem | undefined;
}

export const useGridStore = create<GridState & GridActions>((set, get) => ({
  strategies: [
    {
      id: '1',
      symbol: '510300',
      name: '沪深300网格',
      status: 'active',
      totalInvestment: 50000,
      profit: 2850.32,
      profitPercent: 5.70,
      grids: 15,
      createdAt: Date.now() - 86400000 * 7,
    },
    {
      id: '2',
      symbol: '159915',
      name: '创业板网格',
      status: 'paused',
      totalInvestment: 30000,
      profit: 1250.18,
      profitPercent: 4.17,
      grids: 10,
      createdAt: Date.now() - 86400000 * 3,
    },
  ],
  selectedStrategyId: null,
  editingConfig: null,
  isCreating: false,

  createStrategy: (config) => {
    const id = `strategy_${Date.now()}`;
    const newStrategy: GridStrategyItem = {
      id,
      symbol: config.symbol,
      name: config.name,
      status: 'active',
      totalInvestment: config.totalFund,
      profit: 0,
      profitPercent: 0,
      grids: config.gridCount,
      config,
      createdAt: Date.now(),
    };
    set(state => ({
      strategies: [...state.strategies, newStrategy],
      isCreating: false
    }));
    return id;
  },

  updateStrategy: (id, updates) => {
    set(state => ({
      strategies: state.strategies.map(s =>
        s.id === id ? { ...s, ...updates } : s
      )
    }));
  },

  deleteStrategy: (id) => {
    set(state => ({
      strategies: state.strategies.filter(s => s.id !== id),
      selectedStrategyId: state.selectedStrategyId === id ? null : state.selectedStrategyId
    }));
  },

  toggleStrategyStatus: (id) => {
    set(state => ({
      strategies: state.strategies.map(s =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
          : s
      )
    }));
  },

  setSelectedStrategy: (id) => set({ selectedStrategyId: id }),
  setEditingConfig: (config) => set({ editingConfig: config }),
  setIsCreating: (isCreating) => set({ isCreating }),

  getStrategyById: (id) => {
    return get().strategies.find(s => s.id === id);
  },
}));
