
// src/ai/flows/categorize-financial-transactions.ts
'use server';
/**
 * @fileOverview AI-powered financial transaction categorization.
 *
 * - categorizeTransaction - A function to categorize a financial transaction.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTransactionInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('คำอธิบายของรายการทางการเงิน'),
  amount: z.number().describe('จำนวนเงินของรายการ'),
});
export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'หมวดหมู่ที่คาดการณ์สำหรับรายการ (เช่น "ของชำ", "เงินเดือน", "ค่าเช่า", "ค่าสาธารณูปโภค")'
    ),
  subcategory: z
    .string()
    .optional()
    .describe('หมวดหมู่ย่อยที่เป็นทางเลือกสำหรับรายการ (เช่น "ร้านอาหาร", "ค่าไฟฟ้า")'),
  isIncome: z.boolean().describe('ระบุว่าเป็นรายการรับหรือรายจ่าย'),
  confidence: z.number().describe('ระดับความมั่นใจ (0 ถึง 1) สำหรับหมวดหมู่ที่กำหนด'),
});
export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

export async function categorizeTransaction(input: CategorizeTransactionInput): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const categorizeTransactionPrompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  prompt: `คุณเป็นนักบัญชีผู้เชี่ยวชาญในการจัดหมวดหมู่รายการทางการเงิน

  จากคำอธิบายและจำนวนเงินของรายการต่อไปนี้ โปรดระบุหมวดหมู่ที่เหมาะสมที่สุด, หมวดหมู่ย่อย (ถ้ามี), ระบุว่าเป็นรายรับหรือรายจ่าย, และระดับความมั่นใจในการจัดหมวดหมู่ของคุณ ตอบกลับเป็นภาษาไทยเท่านั้น

  คำอธิบายรายการ: {{{transactionDescription}}}
  จำนวนเงิน: {{{amount}}}

  ตรวจสอบให้แน่ใจว่าหมวดหมู่เป็นหมวดหมู่ทั่วไป (เช่น "ของชำ", "เงินเดือน", "ค่าเช่า", "ค่าสาธารณูปโภค")
  หากมี, หมวดหมู่ย่อยจะเป็นหมวดหมู่ที่เฉพาะเจาะจงมากขึ้น (เช่น "ร้านอาหาร", "ค่าไฟฟ้า")

  ส่งคืนผลลัพธ์เป็นอ็อบเจ็กต์ JSON
  `,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await categorizeTransactionPrompt(input);
    return output!;
  }
);
