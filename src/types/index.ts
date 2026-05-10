export interface Portfolio {
  totalValue: number;
  todayProfit: number;
  todayProfitPercent: number;
  totalProfit: number;
  totalProfitPercent: number;
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  profit: number;
  profitPercent: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface GridStrategy {
  id: string;
  symbol: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  totalInvestment: number;
  profit: number;
  profitPercent: number;
  grids: number;
}

export interface AIPlan {
  id: string;
  title: string;
  description: string;
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
  status: 'active' | 'pending' | 'executed';
  createdAt: string;
}

export interface RiskMetric {
  label: string;
  value: number;
  max: number;
  status: 'safe' | 'warning' | 'danger';
}

export interface RouteConfig {
  path: string;
  name: string;
  icon: string;
}
