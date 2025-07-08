
import { z } from 'genkit';

export const AnalyzeBiddingDocumentInputSchema = z.object({
  imageDataUri: z.string().describe('The base64 encoded image data URI of the document.'),
});
export type AnalyzeBiddingDocumentInput = z.infer<typeof AnalyzeBiddingDocumentInputSchema>;


export const AnalyzedBiddingDocumentOutputSchema = z.object({
  summary: z.string().describe('สรุปภาพรวมของเอกสาร'),
  scopeOfWork: z.array(z.string()).describe('รายการขอบเขตงานหลัก'),
  keyRequirements: z.array(z.string()).describe('คุณสมบัติหรือข้อกำหนดที่สำคัญของผู้ยื่นซอง'),
  risks: z.array(z.string()).describe('ประเด็นที่น่ากังวลหรือความเสี่ยงที่อาจเกิดขึ้น'),
  deadlines: z.array(z.object({
    date: z.string().describe('วันที่ของกำหนดการ'),
    description: z.string().describe('คำอธิบายของกำหนดการ'),
  })).describe('รายการกำหนดการสำคัญ'),
});
export type AnalyzedBiddingDocumentOutput = z.infer<typeof AnalyzedBiddingDocumentOutputSchema>;
