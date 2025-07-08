'use server';
/**
 * @fileOverview An AI-powered flow to predict stock market trends.
 *
 * - predictStockTrend - A function that predicts the trend for a given stock ticker.
 * - PredictStockTrendInput - The input type for the predictStockTrend function.
 * - PredictStockTrendOutput - The return type for the predictStockTrend function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getStockPrice, getMarketNews } from '@/ai/tools';

// Define the schema for a single past prediction
const PredictionHistoryItemSchema = z.object({
    ticker: z.string().describe('สัญลักษณ์ Ticker ของหุ้น'),
    prediction: z.enum(['up', 'down']).describe('การคาดการณ์แนวโน้ม: "up" หรือ "down"'),
    confidence: z.number().describe('ระดับความมั่นใจของการคาดการณ์ (0-100)'),
    reasoning: z.string().describe('เหตุผลประกอบการคาดการณ์'),
    price: z.number().describe('ราคาหุ้น ณ เวลาที่คาดการณ์'),
    winner: z.enum(['ai', 'user']).describe('ผู้ชนะในการคาดการณ์ครั้งนั้น ("ai" หรือ "user")'),
});

const PredictStockTrendInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol to analyze.'),
  predictionHistory: z.array(PredictionHistoryItemSchema).optional().describe('An array of past predictions to learn from.'),
});
export type PredictStockTrendInput = z.infer<typeof PredictStockTrendInputSchema>;

const PredictStockTrendOutputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol analyzed.'),
  prediction: z.enum(['up', 'down']).describe('The predicted trend for the next day: "up" or "down".'),
  confidence: z.number().min(0).max(100).describe('The confidence level of the prediction, from 0 to 100.'),
  reasoning: z.string().describe('A detailed reasoning for the prediction based on the gathered data.'),
  price: z.number().describe('The current price of the stock.'),
});
export type PredictStockTrendOutput = z.infer<typeof PredictStockTrendOutputSchema>;

export async function predictStockTrend(
  input: PredictStockTrendInput
): Promise<PredictStockTrendOutput> {
  return predictStockTrendFlow(input);
}

const prompt = ai.definePrompt({
    name: 'predictStockTrendPrompt',
    input: { schema: PredictStockTrendInputSchema },
    output: { schema: PredictStockTrendOutputSchema },
    tools: [getStockPrice, getMarketNews],
    system: `คุณเป็น AI วิเคราะห์หุ้นระดับโลก เป้าหมายของคุณคือการคาดการณ์แนวโน้มหุ้นในวันถัดไปสำหรับ Ticker ที่กำหนด

    คุณสามารถเข้าถึงเครื่องมือต่อไปนี้เพื่อรวบรวมข้อมูล:
    - \`getStockPrice\`: เพื่อรับราคาหุ้นปัจจุบัน
    - \`getMarketNews\`: เพื่อรับข่าวสารล่าสุดที่เกี่ยวข้อง

    โปรดใช้เครื่องมือเหล่านี้ตามความจำเป็นเพื่อทำการวิเคราะห์ที่ครอบคลุมที่สุด.

    {{#if predictionHistory}}
    พิจารณาประวัติการคาดการณ์ที่ผ่านมาเพื่อเรียนรู้และปรับปรุงความแม่นยำ:
    {{#each predictionHistory}}
    - Ticker: {{this.ticker}}, คาดการณ์: {{this.prediction}}, ความมั่นใจ: {{this.confidence}}%, ผลลัพธ์: {{this.winner}} ชนะ
    (เรียนรู้จากผลลัพธ์: ถ้า AI ชนะ หมายความว่าการคาดการณ์ที่ความมั่นใจสูงนั้นถูกต้อง ถ้า user ชนะ หมายความว่าการคาดการณ์ที่ความมั่นใจต่ำอาจไม่ถูกต้อง)
    {{/each}}
    {{else}}
    นี่เป็นการวิเคราะห์ครั้งแรกสำหรับเซสชันนี้
    {{/if}}

    วิเคราะห์ข้อมูลทั้งหมดที่มี (ราคาปัจจุบัน, ข่าว, ประวัติ) เพื่อคาดการณ์, ให้เหตุผลอย่างละเอียด, และประเมินความมั่นใจของคุณ (0-100)
    ตอบกลับเป็นภาษาไทยในรูปแบบอ็อบเจ็กต์ JSON ที่สอดคล้องกับ Schema ที่กำหนด.
    `,
    prompt: `วิเคราะห์หุ้น Ticker {{{ticker}}}`,
});

const predictStockTrendFlow = ai.defineFlow(
    {
        name: 'predictStockTrendFlow',
        inputSchema: PredictStockTrendInputSchema,
        outputSchema: PredictStockTrendOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
