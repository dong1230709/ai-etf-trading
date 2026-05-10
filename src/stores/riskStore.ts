import { create } from 'zustand';

export interface RiskMetricItem {
  id: string;
  label: string;
  value: number;
  max: number;
  status: 'safe' | 'warning' | 'danger';
  threshold: {
    warning: number;
    danger: number;
  };
}

interface RiskState {
  metrics: RiskMetricItem[];
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'danger';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
  }>;
  isMonitoring: boolean;
}

interface RiskActions {
  updateMetric: (id: string, value: number) => void;
  addAlert: (alert: Omit<RiskState['alerts'][0], 'id' | 'timestamp' | 'read'>) => void;
  markAlertAsRead: (id: string) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
  setIsMonitoring: (isMonitoring: boolean) => void;
}

export const useRiskStore = create<RiskState & RiskActions>((set, get) => ({
  metrics: [
    { id: 'position', label: '仓位风险', value: 65, max: 100, status: 'safe', threshold: { warning: 70, danger: 85 } },
    { id: 'leverage', label: '杠杆使用', value: 25, max: 100, status: 'safe', threshold: { warning: 50, danger: 70 } },
    { id: 'drawdown', label: '回撤控制', value: 82, max: 100, status: 'warning', threshold: { warning: 70, danger: 85 } },
    { id: 'liquidity', label: '流动性风险', value: 15, max: 100, status: 'safe', threshold: { warning: 30, danger: 50 } },
    { id: 'concentration', label: '集中度风险', value: 45, max: 100, status: 'safe', threshold: { warning: 60, danger: 80 } },
    { id: 'volatility', label: '波动率风险', value: 55, max: 100, status: 'warning', threshold: { warning: 50, danger: 70 } },
  ],
  alerts: [
    { id: '1', type: 'warning', title: '回撤接近警戒线', message: '当前回撤已达82%，请注意风险控制', timestamp: Date.now() - 3600000, read: false },
    { id: '2', type: 'info', title: '波动率上升', message: '检测到市场波动率上升，建议调整网格间距', timestamp: Date.now() - 7200000, read: false },
    { id: '3', type: 'danger', title: '高集中度警告', message: '单一ETF仓位占比过高，建议分散投资', timestamp: Date.now() - 86400000, read: true },
  ],
  isMonitoring: true,

  updateMetric: (id, value) => {
    set(state => ({
      metrics: state.metrics.map(m => {
        if (m.id !== id) return m;
        const status = value >= m.threshold.danger ? 'danger' : value >= m.threshold.warning ? 'warning' : 'safe';
        return { ...m, value, status };
      })
    }));
  },

  addAlert: (alert) => {
    const newAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
      timestamp: Date.now(),
      read: false
    };
    set(state => ({ alerts: [newAlert, ...state.alerts] }));
  },

  markAlertAsRead: (id) => {
    set(state => ({
      alerts: state.alerts.map(a => a.id === id ? { ...a, read: true } : a)
    }));
  },

  removeAlert: (id) => {
    set(state => ({ alerts: state.alerts.filter(a => a.id !== id) }));
  },

  clearAlerts: () => set({ alerts: [] }),
  setIsMonitoring: (isMonitoring) => set({ isMonitoring }),
}));
