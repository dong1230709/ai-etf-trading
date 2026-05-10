// 行情数据模型

export interface StockQuote {
  symbol: string;           // 股票代码，如 '510300'
  name: string;             // 股票名称
  price: number;            // 当前价格
  change: number;           // 涨跌额
  changePercent: number;    // 涨跌幅 %
  open: number;             // 开盘价
  high: number;             // 最高价
  low: number;              // 最低价
  volume: number;           // 成交量
  amount: number;           // 成交额
  timestamp: number;        // 数据时间戳
  source: DataSource;       // 数据来源
}

export type DataSource = 'sina' | 'tencent' | 'eastmoney';

export interface StockQuoteWithValidation {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
  timestamp: number;
  sources: DataSource[];
  priceDifference: number;      // 价格差异百分比
  isValid: boolean;             // 是否通过校验
  validationWarning?: string;   // 校验警告信息
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;           // 成交量（万手）
  amount: number;           // 成交额（亿元）
}

export interface FetchQuoteOptions {
  symbol: string;
  name?: string;
}

export interface FetchMultipleQuotesOptions {
  symbols: string[];
  names?: Record<string, string>;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface QuoteError {
  symbol: string;
  source: DataSource;
  message: string;
  code?: string;
}

export interface FetchResult<T> {
  success: boolean;
  data?: T;
  error?: QuoteError;
}

export interface MultiSourceQuoteResult {
  symbol: string;
  name: string;
  quotes: StockQuote[];
  validatedQuote?: StockQuoteWithValidation;
  errors: QuoteError[];
  allFailed: boolean;
}

// 数据源接口
export interface DataSourceAdapter {
  name: DataSource;
  fetchQuote: (symbol: string) => Promise<FetchResult<StockQuote>>;
  fetchQuotes: (symbols: string[]) => Promise<FetchResult<StockQuote>[]>;
  normalizeSymbol: (symbol: string) => string;
}

// ETF和指数列表
export const ETF_LIST = [
  { symbol: '510300', name: '沪深300ETF' },
  { symbol: '159915', name: '创业板ETF' },
  { symbol: '512880', name: '证券ETF' },
  { symbol: '510500', name: '中证500ETF' },
  { symbol: '159901', name: '深证100ETF' },
  { symbol: '510050', name: '上证50ETF' },
] as const;

export const INDEX_LIST = [
  { symbol: '000001', name: '上证指数' },
  { symbol: '399001', name: '深证成指' },
  { symbol: '399006', name: '创业板指' },
  { symbol: '000300', name: '沪深300' },
  { symbol: '000016', name: '上证50' },
  { symbol: '000905', name: '中证500' },
] as const;

// 缓存配置
export const CACHE_CONFIG = {
  defaultTTL: 30000,        // 默认缓存时间 30秒
  minTTL: 10000,           // 最小缓存时间 10秒
  maxTTL: 60000,           // 最大缓存时间 60秒
};

// 自动刷新配置
export const REFRESH_CONFIG = {
  interval: 5000,           // 刷新间隔 5秒
  maxRetries: 3,           // 最大重试次数
  retryDelay: 1000,        // 重试延迟 1秒
};

// 价格差异阈值
export const VALIDATION_CONFIG = {
  maxPriceDifference: 0.5,   // 最大价格差异百分比 0.5%
  warningThreshold: 0.3,   // 警告阈值 0.3%
};
