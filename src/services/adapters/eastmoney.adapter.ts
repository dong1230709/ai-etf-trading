// 东方财富数据源适配器

import { 
  StockQuote, 
  DataSource, 
  FetchResult,
  DataSourceAdapter 
} from '../../types/quote';

/**
 * 东方财富API适配器
 * 使用代理 API: /api/eastmoney/api/qt/stock/get
 */
export class EastMoneyAdapter implements DataSourceAdapter {
  name: DataSource = 'eastmoney';
  
  normalizeSymbol(symbol: string): string {
    if (/^\d{6}$/.test(symbol)) {
      const prefix = symbol.substring(0, 3);
      const marketMap: Record<string, string> = {
        '000': '0', '001': '0', '002': '0', '003': '0',
        '300': '0', '301': '0',
        '600': '1', '601': '1', '603': '1', '605': '1',
        '688': '1',
      };
      
      const market = marketMap[prefix] || (parseInt(symbol) >= 500000 ? '1' : '0');
      return `${market}.${symbol}`;
    }
    
    return symbol;
  }

  async fetchQuote(symbol: string): Promise<FetchResult<StockQuote>> {
    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      // 使用代理URL
      const url = `/api/eastmoney/api/qt/stock/get?secid=${normalizedSymbol}&fields=f43,f44,f45,f46,f47,f48,f57,f58,f169,f170`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const json = await response.json();
      return this.parseResponse(symbol, json);
    } catch (error) {
      return {
        success: false,
        error: {
          symbol,
          source: 'eastmoney',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async fetchQuotes(symbols: string[]): Promise<FetchResult<StockQuote>[]> {
    try {
      const normalizedSymbols = symbols.map(s => this.normalizeSymbol(s));
      const secids = normalizedSymbols.join(',');
      // 使用代理URL
      const url = `/api/eastmoney/api/qt/ulist.np/get?fltt=2&invt=2&fields=f12,f14,f2,f3,f4,f5,f6,f7,f8,f9,f10,f15,f16,f17,f18,f43,f44,f45,f46,f47,f48&secids=${secids}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const json = await response.json();
      return this.parseBatchResponse(symbols, json);
    } catch (error) {
      return symbols.map(symbol => ({
        success: false,
        error: {
          symbol,
          source: 'eastmoney' as DataSource,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  }

  private parseResponse(symbol: string, json: any): FetchResult<StockQuote> {
    try {
      if (!json.data) {
        return {
          success: false,
          error: {
            symbol,
            source: 'eastmoney',
            message: 'No data returned'
          }
        };
      }

      const data = json.data;
      
      return {
        success: true,
        data: {
          symbol,
          name: data.f58 || symbol,
          price: (data.f43 || 0) / 100,
          change: (data.f4 || 0) / 100,
          changePercent: (data.f3 || 0) / 100,
          open: (data.f46 || 0) / 100,
          high: (data.f44 || 0) / 100,
          low: (data.f45 || 0) / 100,
          volume: data.f47 || 0,
          amount: data.f48 || 0,
          timestamp: Date.now(),
          source: 'eastmoney'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          symbol,
          source: 'eastmoney',
          message: error instanceof Error ? error.message : 'Parse error'
        }
      };
    }
  }

  private parseBatchResponse(symbols: string[], json: any): FetchResult<StockQuote>[] {
    const results: FetchResult<StockQuote>[] = [];
    
    try {
      const dataList = json.data?.diff || [];
      
      symbols.forEach((symbol) => {
        const data = dataList.find((item: any) => item.f12 === symbol);
        
        if (data) {
          results.push({
            success: true,
            data: {
              symbol: data.f12 || symbol,
              name: data.f14 || symbol,
              price: (data.f2 || 0) / 100,
              change: (data.f4 || 0) / 100,
              changePercent: (data.f3 || 0) / 100,
              open: (data.f15 || 0) / 100,
              high: (data.f16 || 0) / 100,
              low: (data.f17 || 0) / 100,
              volume: data.f47 || 0,
              amount: data.f48 || 0,
              timestamp: Date.now(),
              source: 'eastmoney'
            }
          });
        } else {
          results.push({
            success: false,
            error: {
              symbol,
              source: 'eastmoney',
              message: 'Symbol not found in response'
            }
          });
        }
      });
    } catch (error) {
      symbols.forEach(symbol => {
        results.push({
          success: false,
          error: {
            symbol,
            source: 'eastmoney',
            message: error instanceof Error ? error.message : 'Parse error'
          }
        });
      });
    }
    
    return results;
  }
}

export const eastMoneyAdapter = new EastMoneyAdapter();
