import { flow } from 'genkit';
import { z } from 'genkit';
import { marketAI } from '@/ai/genkit';
import {
  getStockPrice,
  getMarketNews,
  getExchangeRateTool,
  getGoldPriceTool,
} from '@/ai/tools';
import { recordTrade, AgentId, AssetType } from '@/services/trading-game-service';

const agentPersonalities = {
  Aggressive: {
    name: 'Blaze',
    description: `You are an aggressive financial analyst. You look for high-risk, high-reward opportunities and are not afraid of volatility. You make quick decisions to capitalize on short-term market movements.`,
  },
  Conservative: {
    name: 'Guardian',
    description: `You are a conservative financial analyst. You prioritize capital preservation and long-term, stable growth. You prefer well-established companies with strong fundamentals and avoid speculative assets.`,
  },
  Contrarian: {
    name: 'Maverick',
    description: `You are a contrarian financial analyst. You believe that the market often overreacts to news. You look for opportunities to go against the prevailing sentiment, buying when others are fearful and selling when others are greedy.`, 
  },
};

export const tradingGameFlow = flow(
  {
    name: 'tradingGameFlow',
    inputSchema: z.object({
      assetType: z.nativeEnum(AssetType),
      assetIdentifier: z.string(), // Ticker for Stock/Currency, or "Gold" for Gold
      agentId: z.nativeEnum(agentPersonalities),
    }),
    outputSchema: z.object({
      price: z.number(),
      news: z.array(z.string()),
      decision: z.string(),
      reasoning: z.string(),
      agentName: z.string(),
      assetType: z.nativeEnum(AssetType),
      assetIdentifier: z.string(),
    }),
    tools: [getStockPrice, getMarketNews, getExchangeRateTool, getGoldPriceTool], // All possible tools
  },
  async ({ assetType, assetIdentifier, agentId }) => {
    let price: number;
    let news: string[] = [];
    let tickerForNews: string = assetIdentifier;

    switch (assetType) {
      case 'Stock':
        price = await getStockPrice.run({ ticker: assetIdentifier });
        news = await getMarketNews.run({ ticker: assetIdentifier });
        break;
      case 'Currency':
        // Assuming assetIdentifier is like "USDTHB"
        const fromCurrency = assetIdentifier.substring(0, 3);
        const toCurrency = assetIdentifier.substring(3, 6);
        price = await getExchangeRateTool.run({ fromCurrency, toCurrency });
        // News for currency pairs might not be directly available via getMarketNews with a simple ticker
        // For now, we'll skip news for currency or use a generic search if possible.
        // Let's try to fetch news for the base currency for now.
        tickerForNews = fromCurrency;
        news = await getMarketNews.run({ ticker: tickerForNews });
        break;
      case 'Gold':
        price = await getGoldPriceTool.run({});
        tickerForNews = 'GC=F'; // Use a standard ticker for gold news
        news = await getMarketNews.run({ ticker: tickerForNews });
        break;
      default:
        throw new Error(`Unsupported asset type: ${assetType}`);
    }

    const agentInfo = agentPersonalities[agentId];
    const personalityPrompt = agentInfo.description;

    const prompt = `
      Hello, I am ${agentInfo.name}, the ${agentId} financial analyst.
      ${personalityPrompt}

      Your task is to decide whether to BUY or SELL the following ${assetType} based on its current price and recent news.
      
      Asset Type: ${assetType}
      Asset Identifier: ${assetIdentifier}
      Current Price: $${price.toFixed(2)}
      Recent News:
      ${news.map(n => `- ${n}`).join('\n')}

      Based on this information and my personality, should you BUY or SELL? Provide your reasoning in one sentence.
    `;

    const llmResponse = await marketAI.generate({ prompt });
    const responseText = llmResponse.text();

    const decision = responseText.includes('BUY') ? 'Buy' : 'Sell';
    const reasoning = responseText.split('\n').slice(1).join('\n').trim();

    await recordTrade({
      agentId,
      assetType,
      ticker: assetIdentifier,
      decision: decision as 'Buy' | 'Sell',
      price,
      reasoning,
      timestamp: new Date(),
    });

    return {
      price,
      news,
      decision,
      reasoning,
      agentName: agentInfo.name,
      assetType,
      assetIdentifier,
    };
  }
);