// 腾讯财经数据源适配器

import { 
  StockQuote, 
  DataSource, 
  FetchResult,
  DataSourceAdapter 
} from '../../types/quote';

/**
 * 腾讯财经API适配器
 * 使用代理 API: /api/tencent/q=sh510300,sz159915
 */
export class TencentAdapter implements DataSourceAdapter {
  name: DataSource = 'tencent';
  
  normalizeSymbol(symbol: string): string {
    if (/^\d{6}$/.test(symbol)) {
      const prefixes: Record<string, string> = {
        '000': 'sz', '001': 'sz', '002': 'sz', '003': 'sz',
        '300': 'sz', '301': 'sz',
        '600': 'sh', '601': 'sh', '603': 'sh', '605': 'sh',
        '688': 'sh',
      };
      
      const prefix = symbol.substring(0, 3);
      const market = prefixes[prefix] || (parseInt(symbol) >= 500000 ? 'sh' : 'sz');
      
      return `${market}${symbol}`;
    }
    
    if (/^(sh|sz)\d{6}$/.test(symbol)) {
      return symbol;
    }
    
    return symbol;
  }

  async fetchQuote(symbol: string): Promise<FetchResult<StockQuote>> {
    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      // 使用代理URL
      const url = `/api/tencent/q=${normalizedSymbol}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const text = await response.text();
      return this.parseResponse(symbol, text);
    } catch (error) {
      return {
        success: false,
        error: {
          symbol,
          source: 'tencent',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async fetchQuotes(symbols: string[]): Promise<FetchResult<StockQuote>[]> {
    try {
      const normalizedSymbols = symbols.map(s => this.normalizeSymbol(s));
      // 使用代理URL
      const url = `/api/tencent/q=${normalizedSymbols.join(',')}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const text = await response.text();
      return this.parseBatchResponse(symbols, text);
    } catch (error) {
      return symbols.map(symbol => ({
        success: false,
        error: {
          symbol,
          source: 'tencent' as DataSource,
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    }
  }

  private parseResponse(symbol: string, text: string): FetchResult<StockQuote> {
    try {
      const cleanText = text.trim();
      
      if (!cleanText.includes('="') || cleanText.includes('="",')) {
        return {
          success: false,
          error: {
            symbol,
            source: 'tencent',
            message: 'Invalid data format'
          }
        };
      }

      const match = cleanText.match(/="([^"]*)"/);
      if (!match || !match[1]) {
        return {
          success: false,
          error: {
            symbol,
            source: 'tencent',
            message: 'Failed to parse quote data'
          }
        };
      }

      const data = match[1].split('~');
      
      if (data.length < 50) {
        return {
          success: false,
          error: {
            symbol,
            source: 'tencent',
            message: `Insufficient data fields: ${data.length}`
          }
        };
      }

      const name = data[1];
      const price = parseFloat(data[3]) || 0;
      const prevClose = parseFloat(data[4]) || 0;
      const open = parseFloat(data[5]) || 0;
      const high = parseFloat(data[6]) || 0;
      const low = parseFloat(data[7]) || 0;
      const volume = parseInt(data[8]) || 0;
      const amount = parseFloat(data[9]) || 0;
      
      const change = price - prevClose;
      const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

      return {
        success: true,
        data: {
          symbol,
          name: name || symbol,
          price,
          change,
          changePercent,
          open,
          high,
          low,
          volume,
          amount,
          timestamp: Date.now(),
          source: 'tencent'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          symbol,
          source: 'tencent',
          message: error instanceof Error ? error.message : 'Parse error'
        }
      };
    }
  }

  private parseBatchResponse(symbols: string[], text: string): FetchResult<StockQuote>[] {
    const results: FetchResult<StockQuote>[] = [];
    const lines = text.trim().split('\n');
    
    symbols.forEach((symbol, index) => {
      if (index < lines.length) {
        const result = this.parseResponse(symbol, lines[index]);
        results.push(result);
      } else {
        results.push({
          success: false,
          error: {
            symbol,
            source: 'tencent',
            message: 'No data returned'
          }
        });
      }
    });
    
    return results;
  }
}

export const tencentAdapter = new TencentAdapter();
