/**
 * @fileOverview Defines shared AI tools for use across different flows.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
  getStockPrice as fetchStockPriceService, 
  getMarketNews as fetchMarketNewsService 
} from '@/services/financial-data';

export const getStockPrice = ai.defineTool(
  {
    name: 'getStockPrice',
    description: 'ดูราคาหุ้นปัจจุบันของบริษัทจากสัญลักษณ์ Ticker',
    inputSchema: z.object({ ticker: z.string().describe('สัญลักษณ์ Ticker ของหุ้น') }),
    outputSchema: z.number(),
  },
  async ({ ticker }) => {
    return await fetchStockPriceService(ticker);
  }
);

export const getMarketNews = ai.defineTool(
    {
        name: 'getMarketNews',
        description: 'ดูข่าวสารล่าสุดเกี่ยวกับหุ้นหรือตลาด',
        inputSchema: z.object({ ticker: z.string().describe('สัญลักษณ์ Ticker ของหุ้น') }),
        outputSchema: z.array(z.string()),
    },
    async ({ ticker }) => {
        return await fetchMarketNewsService(ticker);
    }
);
