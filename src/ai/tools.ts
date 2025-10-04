
/**
 * @fileOverview Defines shared AI tools for use across different flows.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
  getStockPrice as fetchStockPriceService, 
  getMarketNews as fetchMarketNewsService,
  getExchangeRate as fetchExchangeRateService,
  getGoldPrice as fetchGoldPriceService
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

export const getExchangeRateTool = ai.defineTool(
  {
    name: 'getExchangeRate',
    description: 'ดูอัตราแลกเปลี่ยนระหว่างสองสกุลเงิน',
    inputSchema: z.object({
      fromCurrency: z.string().describe('สกุลเงินต้นทาง (e.g., USD)'),
      toCurrency: z.string().describe('สกุลเงินปลายทาง (e.g., THB)'),
    }),
    outputSchema: z.number(),
  },
  async ({ fromCurrency, toCurrency }) => {
    return await fetchExchangeRateService(fromCurrency, toCurrency);
  }
);

export const getGoldPriceTool = ai.defineTool(
  {
    name: 'getGoldPrice',
    description: 'ดูราคาทองคำปัจจุบัน',
    inputSchema: z.object({}), // No input needed for gold price
    outputSchema: z.number(),
  },
  async () => {
    return await fetchGoldPriceService();
  }
);
