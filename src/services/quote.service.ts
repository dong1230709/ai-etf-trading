// 行情数据服务层

import {
  StockQuote,
  StockQuoteWithValidation,
  MultiSourceQuoteResult,
  QuoteError,
  DataSource,
  CacheEntry,
  ETF_LIST,
  INDEX_LIST,
  VALIDATION_CONFIG,
  CACHE_CONFIG
} from '../types/quote';
import { sinaAdapter } from './adapters/sina.adapter';
import { tencentAdapter } from './adapters/tencent.adapter';
import { eastMoneyAdapter } from './adapters/eastmoney.adapter';
import type { DataSourceAdapter } from '../types/quote';

/**
 * 行情数据服务
 * 支持多数据源校验、缓存、自动刷新
 */
class QuoteService {
  private adapters: Map<DataSource, DataSourceAdapter>;
  private cache: Map<string, CacheEntry<StockQuoteWithValidation>>;
  private fetchPromises: Map<string, Promise<MultiSourceQuoteResult>>;

  constructor() {
    this.adapters = new Map<DataSource, DataSourceAdapter>([
      ['sina', sinaAdapter as DataSourceAdapter],
      ['tencent', tencentAdapter as DataSourceAdapter],
      ['eastmoney', eastMoneyAdapter as DataSourceAdapter]
    ]);
    this.cache = new Map();
    this.fetchPromises = new Map();
  }

  /**
   * 获取单个股票的多源行情
   */
  async getQuote(symbol: string, name?: string): Promise<MultiSourceQuoteResult> {
    // 检查缓存
    const cacheKey = symbol;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        symbol,
        name: name || cached.name,
        quotes: [],
        validatedQuote: cached,
        errors: [],
        allFailed: false
      };
    }

    // 防止重复请求
    if (this.fetchPromises.has(cacheKey)) {
      return this.fetchPromises.get(cacheKey)!;
    }

    // 创建请求Promise
    const promise = this.fetchFromAllSources(symbol, name);
    this.fetchPromises.set(cacheKey, promise);

    try {
      const result = await promise;
      
      // 缓存有效数据
      if (result.validatedQuote && result.validatedQuote.isValid) {
        this.setCache(cacheKey, result.validatedQuote);
      }
      
      return result;
    } finally {
      this.fetchPromises.delete(cacheKey);
    }
  }

  /**
   * 获取多个股票的多源行情
   */
  async getQuotes(symbols: string[]): Promise<MultiSourceQuoteResult[]> {
    const results = await Promise.all(
      symbols.map(symbol => this.getQuote(symbol))
    );
    return results;
  }

  /**
   * 从所有数据源获取行情
   */
  private async fetchFromAllSources(
    symbol: string,
    name?: string
  ): Promise<MultiSourceQuoteResult> {
    // 并行从三个数据源获取
    const [sinaResult, tencentResult, eastmoneyResult] = await Promise.allSettled([
      this.fetchFromAdapter('sina', symbol),
      this.fetchFromAdapter('tencent', symbol),
      this.fetchFromAdapter('eastmoney', symbol)
    ]);

    const quotes: StockQuote[] = [];
    const errors: QuoteError[] = [];

    // 处理新浪结果
    if (sinaResult.status === 'fulfilled' && sinaResult.value.success && sinaResult.value.data) {
      quotes.push(sinaResult.value.data);
    } else if (sinaResult.status === 'rejected') {
      errors.push({
        symbol,
        source: 'sina',
        message: sinaResult.reason?.message || 'Unknown error'
      });
    } else if (sinaResult.value?.error) {
      errors.push(sinaResult.value.error);
    }

    // 处理腾讯结果
    if (tencentResult.status === 'fulfilled' && tencentResult.value.success && tencentResult.value.data) {
      quotes.push(tencentResult.value.data);
    } else if (tencentResult.status === 'rejected') {
      errors.push({
        symbol,
        source: 'tencent',
        message: tencentResult.reason?.message || 'Unknown error'
      });
    } else if (tencentResult.value?.error) {
      errors.push(tencentResult.value.error);
    }

    // 处理东方财富结果
    if (eastmoneyResult.status === 'fulfilled' && eastmoneyResult.value.success && eastmoneyResult.value.data) {
      quotes.push(eastmoneyResult.value.data);
    } else if (eastmoneyResult.status === 'rejected') {
      errors.push({
        symbol,
        source: 'eastmoney',
        message: eastmoneyResult.reason?.message || 'Unknown error'
      });
    } else if (eastmoneyResult.value?.error) {
      errors.push(eastmoneyResult.value.error);
    }

    // 所有数据源都失败
    if (quotes.length === 0) {
      return {
        symbol,
        name: name || symbol,
        quotes: [],
        validatedQuote: undefined,
        errors,
        allFailed: true
      };
    }

    // 多源数据校验
    const validatedQuote = this.validateMultipleSources(quotes, name);

    return {
      symbol,
      name: validatedQuote.name,
      quotes,
      validatedQuote,
      errors,
      allFailed: false
    };
  }

  /**
   * 从指定适配器获取数据
   */
  private async fetchFromAdapter(
    source: DataSource,
    symbol: string
  ): Promise<{ success: boolean; data?: StockQuote; error?: QuoteError }> {
    try {
      const adapter = this.adapters.get(source);
      if (!adapter) {
        throw new Error(`Adapter not found: ${source}`);
      }

      const result = await adapter.fetchQuote(symbol);
      
      if (result.success && result.data) {
        return { success: true, data: result.data };
      } else {
        return { 
          success: false, 
          error: result.error || { 
            symbol, 
            source, 
            message: 'Fetch failed' 
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          symbol,
          source,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * 多源数据校验
   * 计算价格差异，判断数据有效性
   */
  private validateMultipleSources(
    quotes: StockQuote[],
    name?: string
  ): StockQuoteWithValidation {
    if (quotes.length === 0) {
      throw new Error('No quotes to validate');
    }

    // 按价格排序，取中间值
    const sortedByPrice = [...quotes].sort((a, b) => a.price - b.price);
    const medianPrice = sortedByPrice[Math.floor(sortedByPrice.length / 2)].price;

    // 计算价格差异
    const priceDifferences = quotes.map(q => 
      Math.abs((q.price - medianPrice) / medianPrice) * 100
    );
    const maxPriceDifference = Math.max(...priceDifferences);

    // 判断是否有效
    const isValid = maxPriceDifference <= VALIDATION_CONFIG.maxPriceDifference;
    
    // 生成警告信息
    let validationWarning: string | undefined;
    if (!isValid) {
      validationWarning = `价格差异过大 (${maxPriceDifference.toFixed(2)}%)，数据可能不稳定`;
    } else if (maxPriceDifference > VALIDATION_CONFIG.warningThreshold) {
      validationWarning = `价格存在差异 (${maxPriceDifference.toFixed(2)}%)`;
    }

    // 使用最新且有效的数据
    const bestQuote = quotes[0];
    const sources = quotes.map(q => q.source);

    return {
      symbol: bestQuote.symbol,
      name: name || bestQuote.name,
      price: bestQuote.price,
      change: bestQuote.change,
      changePercent: bestQuote.changePercent,
      open: bestQuote.open,
      high: bestQuote.high,
      low: bestQuote.low,
      volume: bestQuote.volume,
      amount: bestQuote.amount,
      timestamp: Date.now(),
      sources,
      priceDifference: maxPriceDifference,
      isValid,
      validationWarning
    };
  }

  /**
   * 从缓存获取
   */
  private getFromCache(key: string): StockQuoteWithValidation | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * 设置缓存
   */
  private setCache(key: string, data: StockQuoteWithValidation): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_CONFIG.defaultTTL
    });
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 获取ETF列表
   */
  getETFList() {
    return ETF_LIST;
  }

  /**
   * 获取指数列表
   */
  getIndexList() {
    return INDEX_LIST;
  }

  /**
   * 获取缓存状态
   */
  getCacheStatus() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// 导出单例
export const quoteService = new QuoteService();
