
// forecast-budget-overruns.ts
'use server';
/**
 * @fileOverview AI-powered financial forecasting flow to predict potential budget overruns or cash flow issues.
 *
 * - forecastBudgetOverruns - A function that handles the financial forecasting process.
 * - ForecastBudgetOverrunsInput - The input type for the forecastBudgetOverruns function.
 * - ForecastBudgetOverrunsOutput - The return type for the forecastBudgetOverruns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastBudgetOverrunsInputSchema = z.object({
  projectedIncome: z
    .number()
    .describe('รายรับที่คาดการณ์สำหรับโครงการ'),
  projectedExpenses: z
    .number()
    .describe('รายจ่ายที่คาดการณ์สำหรับโครงการ'),
  currentIncome: z
    .number()
    .describe('รายรับปัจจุบันของโครงการ'),
  currentExpenses: z
    .number()
    .describe('รายจ่ายปัจจุบันของโครงการ'),
  pastFinancialData: z
    .string()
    .describe(
      'บันทึกข้อมูลทางการเงินในอดีตโดยละเอียดของโครงการ รวมถึงรายรับ รายจ่าย และเหตุการณ์ทางการเงินที่เกี่ยวข้อง'
    ),
  marketTrends: z
    .string()
    .describe(
      'ภาพรวมของแนวโน้มตลาดปัจจุบันที่อาจส่งผลกระทบต่อโครงการ รวมถึงการเปลี่ยนแปลงของราคาวัสดุ, ค่าแรง, หรือความต้องการของลูกค้า'
    ),
});
export type ForecastBudgetOverrunsInput = z.infer<
  typeof ForecastBudgetOverrunsInputSchema
>;

const ForecastBudgetOverrunsOutputSchema = z.object({
  forecast: z
    .string()
    .describe('พยากรณ์โดยละเอียดเกี่ยวกับงบประมาณที่อาจเกินหรือปัญหากระแสเงินสด รวมถึงส่วนที่น่ากังวลและผลกระทบที่อาจเกิดขึ้น'),
  recommendations: z
    .string()
    .describe('คำแนะนำเฉพาะเพื่อลดปัญหางบประมาณที่อาจเกินหรือปัญหากระแสเงินสดตามการพยากรณ์'),
  confidenceLevel: z
    .string()
    .describe('ระดับความมั่นใจในการพยากรณ์ (ต่ำ, ปานกลาง, หรือสูง)'),
});
export type ForecastBudgetOverrunsOutput = z.infer<
  typeof ForecastBudgetOverrunsOutputSchema
>;

export async function forecastBudgetOverruns(
  input: ForecastBudgetOverrunsInput
): Promise<ForecastBudgetOverrunsOutput> {
  return forecastBudgetOverrunsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastBudgetOverrunsPrompt',
  input: {schema: ForecastBudgetOverrunsInputSchema},
  output: {schema: ForecastBudgetOverrunsOutputSchema},
  prompt: `คุณเป็นนักวิเคราะห์ทางการเงินที่เชี่ยวชาญในการจัดการงบประมาณโครงการ

คุณจะใช้ข้อมูลทางการเงินของโครงการและแนวโน้มตลาดที่ให้มาเพื่อพยากรณ์งบประมาณที่อาจเกินหรือปัญหากระแสเงินสด โปรดให้การพยากรณ์โดยละเอียด คำแนะนำเฉพาะ และระดับความมั่นใจในการพยากรณ์ของคุณ ตอบกลับเป็นภาษาไทยเท่านั้น

รายรับที่คาดการณ์: {{{projectedIncome}}}
รายจ่ายที่คาดการณ์: {{{projectedExpenses}}}
รายรับปัจจุบัน: {{{currentIncome}}}
รายจ่ายปัจจุบัน: {{{currentExpenses}}}
ข้อมูลทางการเงินในอดีต: {{{pastFinancialData}}}
แนวโน้มตลาด: {{{marketTrends}}}`,
});

const forecastBudgetOverrunsFlow = ai.defineFlow(
  {
    name: 'forecastBudgetOverrunsFlow',
    inputSchema: ForecastBudgetOverrunsInputSchema,
    outputSchema: ForecastBudgetOverrunsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
