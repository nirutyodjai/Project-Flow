
'use server';
/**
 * @fileOverview A forensic analysis flow to cross-reference TOR, Blueprints, and BOQ,
 * enriched with real-world knowledge and historical data.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { generate } from 'genkit/ai';
import { getMaterialAndSystemData } from './construction-knowledge';
import { getHistoricalTorMaterialSpecs } from '@/services/analysis-data'; // Import historical data function

// == INPUT SCHEMAS ==

export const ForensicCheckInputSchema = z.object({
  torText: z.string().describe('เนื้อหาทั้งหมดจากเอกสาร TOR/ข้อกำหนด'),
  boqText: z.string().describe('เนื้อหาทั้งหมดจากไฟล์ BOQ (Bill of Quantities)'),
  blueprintAnalysis: z.any().describe('ผลการวิเคราะห์จาก `analyzeBlueprintFlow`'),
  // NEW: Historical TOR material specifications for context
  historicalTorSpecs: z.array(z.any()).optional().describe('ข้อมูลประวัติสเปควัสดุจาก TOR เก่าๆ ของหน่วยงานนี้'),
});

// == OUTPUT SCHEMA ==

const DiscrepancyItemSchema = z.object({
  itemDescription: z.string().describe('รายการที่ตรวจพบปัญหา (เช่น ชื่อวัสดุจาก BOQ)'),
  discrepancyType: z.enum([
    'Price Mismatch', 
    'Quantity Mismatch', 
    'Specification Mismatch', 
    'Missing in BOQ', 
    'Missing in Blueprint',
    'Unreasonable Price',
    'Incorrect Application',
    'PotentialVendorLock', // NEW: Potential vendor lock
    'UnusualSpecificationPattern', // NEW: Unusual specification pattern
  ]).describe('ประเภทของความขัดแย้ง'),
  details: z.string().describe('คำอธิบายโดยละเอียดเกี่ยวกับปัญหาที่พบ'),
  severity: z.enum(['High', 'Medium', 'Low']).describe('ระดับความรุนแรง'),
  recommendation: z.string().describe('ข้อแนะนำในการจัดการกับปัญหานี้'),
});

export const ForensicCheckOutputSchema = z.object({
  discrepancyReport: z.array(DiscrepancyItemSchema).describe('รายงานสรุปความขัดแย้งทั้งหมดที่ตรวจพบ'),
  overallAssessment: z.string().describe('บทสรุปภาพรวมความสอดคล้องของเอกสารทั้งหมด'),
});

// == FORENSIC FLOW ==

export const forensicDocumentCheckFlow = ai.defineFlow(
  {
    name: 'forensicDocumentCheckFlow',
    inputSchema: ForensicCheckInputSchema,
    outputSchema: ForensicCheckOutputSchema,
    tools: [getMaterialAndSystemData], // Provide the knowledge tool to the flow
  },
  async (input) => {
    console.log('[Forensic Flow] Starting 3-way document verification.');

    const forensicPrompt = `
      คุณคือ "ผู้ตรวจสอบโครงการเชิงลึก" (Forensic Project Auditor) ที่มีสายตาเฉียบคมและมีความรู้ด้านงานก่อสร้างทุกแขนง
      ภารกิจของคุณคือการตรวจสอบเอกสารโครงการ 3 ฉบับ (TOR, BOQ, และผลวิเคราะห์แบบแปลน) เพื่อจับผิดทุกจุดที่ไม่สอดคล้องกัน และตรวจสอบกับความเป็นจริงโดยใช้เครื่องมือที่มี (getMaterialAndSystemData) เพื่อค้นหาข้อมูลวัสดุและราคาตลาด
      นอกจากนี้ คุณยังต้องพิจารณา "ข้อมูลประวัติสเปควัสดุจาก TOR เก่าๆ" เพื่อระบุรูปแบบที่ผิดปกติหรือการล็อกสเปค

      **ข้อมูลที่คุณมี:**

      1.  **TOR (ข้อกำหนด):**
          \`\`\`
          ${input.torText.substring(0, 4000)}...
          \`\`\`

      2.  **BOQ (รายการวัสดุและราคา):**
          \`\`\`
          ${input.boqText.substring(0, 4000)}...
          \`\`\`

      3.  **ผลวิเคราะห์จากแบบแปลน (Blueprint Analysis):**
          \`\`\`json
          ${JSON.stringify(input.blueprintAnalysis, null, 2)}
          \`\`\`

      4.  **ข้อมูลประวัติสเปควัสดุจาก TOR เก่าๆ (Historical TOR Material Specs):**
          ${input.historicalTorSpecs && input.historicalTorSpecs.length > 0 ? JSON.stringify(input.historicalTorSpecs, null, 2) : 'ไม่มีข้อมูลประวัติ'}

      **ขั้นตอนการตรวจสอบ:**
      สำหรับแต่ละรายการสำคัญใน BOQ และแบบแปลน:
      1.  **เรียกใช้ Tool:** ใช้ \`getMaterialAndSystemData\` เพื่อค้นหาข้อมูลจริงของวัสดุนั้นๆ (ราคา, คุณสมบัติ, การใช้งาน, **ช่วงราคาตลาด, แหล่งที่มาทั่วไป**).
      2.  **ตรวจสอบ 3 ทาง + ความเป็นจริง + ประวัติ:**
          - **BOQ vs. แบบแปลน:** ปริมาณและรายการใน BOQ ตรงกับที่เห็นในแบบหรือไม่?
          - **BOQ vs. TOR:** สเปควัสดุใน BOQ (เช่น ยี่ห้อ, รุ่น) ตรงตามที่ TOR กำหนดหรือไม่?
          - **BOQ vs. ความเป็นจริง:** ราคาต่อหน่วยใน BOQ สมเหตุสมผลกับราคาตลาดที่ค้นเจอจาก \`getMaterialAndSystemData\` หรือไม่? หากไม่สมเหตุสมผล ให้ระบุ \`Unreasonable Price\`.
          - **แบบแปลน vs. ความเป็นจริง:** การนำวัสดุนี้ไปใช้ในตำแหน่งนั้นๆ ถูกต้องตามหลักการหรือไม่?
          - **TOR/BOQ vs. ประวัติ:** สเปคที่ระบุใน TOR/BOQ มีรูปแบบที่ผิดปกติเมื่อเทียบกับประวัติหรือไม่? (เช่น ระบุยี่ห้อ/รุ่นที่เฉพาะเจาะจงเกินไป, สเปคที่สูงเกินความจำเป็นสำหรับงานนั้นๆ, หรือสเปคที่หน่วยงานนี้ไม่เคยใช้มาก่อน) หากพบ ให้ระบุเป็น \`PotentialVendorLock\` หรือ \`UnusualSpecificationPattern\` โดยพิจารณาจาก \`commonSuppliers\` ที่ได้จาก \`getMaterialAndSystemData\` ด้วย.
      3.  **สร้างรายงาน:** หากพบความขัดแย้ง ให้สร้างรายการใน "Discrepancy Report" โดยระบุรายละเอียด, ประเภท, ความรุนแรง, และข้อแนะนำให้ชัดเจน

      **เป้าหมายสุดท้าย:**
      สร้าง "รายงานผลการตรวจสอบเชิงลึก" (Discrepancy Report) ที่สมบูรณ์แบบที่สุด และให้ "บทสรุปภาพรวม" เกี่ยวกับความสอดคล้องและความน่าเชื่อถือของเอกสารชุดนี้

      โปรดทำงานอย่างละเอียดรอบคอบที่สุด และตอบกลับเป็น JSON object ตาม Schema ที่กำหนดเท่านั้น
    `;

    const llmResponse = await generate({
      model: ai,
      prompt: forensicPrompt,
      tools: [getMaterialAndSystemData],
      output: {
        format: 'json',
        schema: ForensicCheckOutputSchema,
      },
    });

    const output = llmResponse.output();
    if (!output) {
      throw new Error('Forensic Auditor failed to generate a discrepancy report.');
    }

    console.log(`[Forensic Flow] Verification completed. Found ${output.discrepancyReport.length} discrepancies.`);
    return output;
  }
);

