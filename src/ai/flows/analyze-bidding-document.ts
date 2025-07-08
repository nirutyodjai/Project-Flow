
'use server';
/**
 * @fileOverview A flow to analyze a bidding document (image) and extract key information.
 */
import { ai } from '@/ai/genkit';
import {
  AnalyzeBiddingDocumentInput,
  AnalyzeBiddingDocumentInputSchema,
  AnalyzedBiddingDocumentOutput,
  AnalyzedBiddingDocumentOutputSchema,
} from './analyze-bidding-document-shared';

export async function analyzeBiddingDocument(input: AnalyzeBiddingDocumentInput): Promise<AnalyzedBiddingDocumentOutput> {
  return analyzeBiddingDocumentFlow(input);
}

const analyzeDocumentPrompt = ai.definePrompt({
  name: 'analyzeDocumentPrompt',
  input: { schema: AnalyzeBiddingDocumentInputSchema },
  output: { schema: AnalyzedBiddingDocumentOutputSchema },
  prompt: `คุณคือผู้เชี่ยวชาญด้านการวิเคราะห์เอกสารประกวดราคา (TOR) ของบริษัทรับเหมาก่อสร้าง
  หน้าที่ของคุณคืออ่านและสรุปข้อมูลสำคัญจากรูปภาพเอกสารที่ได้รับมาอย่างละเอียดและถูกต้อง

  จากรูปภาพเอกสารนี้ ให้คุณวิเคราะห์และดึงข้อมูลต่อไปนี้:
  - summary: สรุปภาพรวมของโครงการนี้ว่าเกี่ยวกับอะไร
  - scopeOfWork: ลิสต์ขอบเขตของงานที่ต้องทำมาเป็นข้อๆ
  - keyRequirements: ลิสต์คุณสมบัติสำคัญที่ผู้ยื่นข้อเสนอต้องมี
  - risks: ประเมินและลิสต์ความเสี่ยงหรือข้อที่ควรระวังในโครงการนี้
  - deadlines: ลิสต์กำหนดการที่สำคัญทั้งหมด เช่น วันปิดรับซอง, วันชี้แจงแบบ

  โปรดตอบกลับเป็นภาษาไทยและจัดรูปแบบผลลัพธ์เป็นอ็อบเจ็กต์ JSON ที่ถูกต้องตาม Schema ที่กำหนด
  `,
});

const analyzeBiddingDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeBiddingDocumentFlow',
    inputSchema: AnalyzeBiddingDocumentInputSchema,
    outputSchema: AnalyzedBiddingDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeDocumentPrompt({
      imageDataUri: input.imageDataUri,
    });
    return output!;
  }
);
