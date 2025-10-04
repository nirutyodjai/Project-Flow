
import { flow } from 'genkit';
import { z } from 'genkit';
import { marketAI } from '@/ai/genkit';
import { getExchangeRateTool } from '@/ai/tools';

export const currencyConverterFlow = flow(
  {
    name: 'currencyConverterFlow',
    inputSchema: z.object({
      amount: z.number(),
      from: z.string(),
      to: z.string(),
    }),
    outputSchema: z.object({
      convertedAmount: z.number(),
      rate: z.number(),
    }),
    tools: [getExchangeRateTool],
  },
  async (input) => {
    const prompt = `Convert ${input.amount} ${input.from} to ${input.to}.`;

    const llmResponse = await marketAI.generate({ 
        prompt,
        tools: [getExchangeRateTool],
    });

    const toolResponse = llmResponse.toolRequest();
    if (!toolResponse) {
        throw new Error("AI did not request the tool.");
    }

    const rate = await getExchangeRateTool.run(toolResponse.input);
    const convertedAmount = input.amount * rate;

    return {
      convertedAmount,
      rate,
    };
  }
);
