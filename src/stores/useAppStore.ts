import { create } from 'zustand';
import type { Portfolio, Position, MarketIndex, GridStrategy, AIPlan, RiskMetric } from '../types';

interface AppState {
  theme: 'dark' | 'light';
  activeTab: string;
  portfolio: Portfolio;
  positions: Position[];
  marketIndices: MarketIndex[];
  gridStrategies: GridStrategy[];
  aiPlans: AIPlan[];
  riskMetrics: RiskMetric[];
}

interface AppActions {
  setActiveTab: (tab: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const mockPortfolio: Portfolio = {
  totalValue: 125680.42,
  todayProfit: 2156.78,
  todayProfitPercent: 1.75,
  totalProfit: 18650.32,
  totalProfitPercent: 17.42,
};

const mockPositions: Position[] = [
  {
    id: '1',
    symbol: '510300',
    name: '沪深300ETF',
    quantity: 10000,
    avgPrice: 4.125,
    currentPrice: 4.285,
    profit: 1600.0,
    profitPercent: 3.88,
  },
  {
    id: '2',
    symbol: '159915',
    name: '创业板ETF',
    quantity: 5000,
    avgPrice: 2.340,
    currentPrice: 2.418,
    profit: 390.0,
    profitPercent: 3.33,
  },
  {
    id: '3',
    symbol: '512880',
    name: '证券ETF',
    quantity: 8000,
    avgPrice: 1.892,
    currentPrice: 1.856,
    profit: -288.0,
    profitPercent: -1.90,
  },
];

const mockMarketIndices: MarketIndex[] = [
  { symbol: '000001', name: '上证指数', price: 3156.28, change: 42.36, changePercent: 1.36 },
  { symbol: '399001', name: '深证成指', price: 10565.82, change: 128.54, changePercent: 1.23 },
  { symbol: '399006', name: '创业板', price: 2156.38, change: 35.82, changePercent: 1.69 },
  { symbol: '000300', name: '沪深300', price: 3695.42, change: 56.78, changePercent: 1.56 },
];

const mockGridStrategies: GridStrategy[] = [
  {
    id: '1',
    symbol: '510300',
    name: '沪深300网格',
    status: 'active',
    totalInvestment: 50000,
    profit: 2850.32,
    profitPercent: 5.70,
    grids: 15,
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
  },
];

const mockAiPlans: AIPlan[] = [
  {
    id: '1',
    title: '沪深300逢低加仓',
    description: '当价格回调至4.1以下时，建议分批建仓',
    signal: 'buy',
    confidence: 85,
    status: 'pending',
    createdAt: '2024-01-15 09:30',
  },
  {
    id: '2',
    title: '创业板高抛低吸',
    description: '2.35-2.45区间内进行高抛低吸操作',
    signal: 'hold',
    confidence: 72,
    status: 'active',
    createdAt: '2024-01-15 10:15',
  },
];

const mockRiskMetrics: RiskMetric[] = [
  { label: '仓位风险', value: 65, max: 100, status: 'safe' },
  { label: '杠杆使用', value: 25, max: 100, status: 'safe' },
  { label: '回撤控制', value: 82, max: 100, status: 'warning' },
  { label: '流动性风险', value: 15, max: 100, status: 'safe' },
];

export const useAppStore = create<AppState & AppActions>((set) => ({
  theme: 'dark',
  activeTab: 'dashboard',
  portfolio: mockPortfolio,
  positions: mockPositions,
  marketIndices: mockMarketIndices,
  gridStrategies: mockGridStrategies,
  aiPlans: mockAiPlans,
  riskMetrics: mockRiskMetrics,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setTheme: (theme) => set({ theme }),
}));
