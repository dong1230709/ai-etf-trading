export const formatCurrency = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercent = (value: number, decimals: number = 2): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

export const formatPrice = (value: number): string => {
  return value.toFixed(3);
};

export const formatQuantity = (value: number): string => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万`;
  }
  return value.toString();
};

export const getChangeColor = (value: number): string => {
  if (value > 0) return 'text-finance-green';
  if (value < 0) return 'text-finance-red';
  return 'text-gray-400';
};

export const getChangeBg = (value: number): string => {
  if (value > 0) return 'bg-finance-green-muted';
  if (value < 0) return 'bg-finance-red-muted';
  return 'bg-gray-500/20';
};

export const getRiskColor = (status: 'safe' | 'warning' | 'danger'): string => {
  switch (status) {
    case 'safe':
      return 'text-finance-green';
    case 'warning':
      return 'text-finance-gold';
    case 'danger':
      return 'text-finance-red';
    default:
      return 'text-gray-400';
  }
};

export const getRiskBg = (status: 'safe' | 'warning' | 'danger'): string => {
  switch (status) {
    case 'safe':
      return 'bg-finance-green';
    case 'warning':
      return 'bg-finance-gold';
    case 'danger':
      return 'bg-finance-red';
    default:
      return 'bg-gray-400';
  }
};
