'''
'use server';
/**
 * @fileOverview An AI flow for analyzing blueprint images (or PDF pages).
 * This uses multi-modal capabilities to extract structured data from visual plans.
 */
import { z } from 'zod';
import { ai, procurementAI } from '@/ai/genkit';
import { generate } from 'genkit/ai';

// == SCHEMAS ==

export const BlueprintAnalysisInputSchema = z.object({
  blueprintImage: z.string().describe('A base64 encoded string of the blueprint image (PNG, JPEG, or a single PDF page).'),
  mimeType: z.string().describe('The MIME type of the image, e.g., 'image/png' or 'application/pdf'.'),
});

const MaterialTakeoffSchema = z.object({
  itemName: z.string().describe('ชื่อของวัสดุหรืออุปกรณ์'),
  quantity: z.string().describe('ปริมาณหรือจำนวนที่นับได้จากแบบ (อาจเป็นค่าประมาณ)'),
  unit: z.string().describe('หน่วยนับ เช่น เมตร, จุด, ชุด'),
  location: z.string().optional().describe('ตำแหน่งที่พบวัสดุนี้ในแบบ'),
});

const VisualScopeSchema = z.object({
  area: z.string().describe('พื้นที่หรือโซนของงาน เช่น 'ชั้น 1 โซน A', 'ห้องไฟฟ้า'.'),
  description: z.string().describe('คำอธิบายขอบเขตงานที่ระบุในพื้นที่นั้น'),
});

const BlueprintRiskSchema = z.object({
  riskDescription: z.string().describe('คำอธิบายความเสี่ยงหรือจุดที่ต้องตรวจสอบ'),
  location: z.string().describe('ตำแหน่งในแบบที่พบความเสี่ยง'),
  severity: z.enum(['High', 'Medium', 'Low']).describe('ระดับความรุนแรงของความเสี่ยง'),
});

export const BlueprintAnalysisOutputSchema = z.object({
  materialTakeoff: z.array(MaterialTakeoffSchema).describe('รายการปริมาณวัสดุเบื้องต้นที่ถอดจากแบบ'),
  visualScope: z.array(VisualScopeSchema).describe('ขอบเขตงานหลักที่ระบุได้จากแผนผัง'),
  risksAndAmbiguities: z.array(BlueprintRiskSchema).describe('รายการความเสี่ยงหรือจุดที่ไม่ชัดเจนในแบบ'),
  overallImpression: z.string().describe('สรุปภาพรวมและความเห็นจากวิศวกรผู้ตรวจสอบแบบ'),
});

// == PROMPT ==

const blueprintAnalysisPrompt = ai.definePrompt(
  {
    name: 'blueprintAnalysisPrompt',
    input: { schema: BlueprintAnalysisInputSchema },
    output: { schema: BlueprintAnalysisOutputSchema },
    prompt: `
      คุณคือ "วิศวกรอาวุโสฝ่ายประเมินราคา" ที่มีความเชี่ยวชาญในการอ่านและถอดแบบโครงการก่อสร้างทุกประเภท
      หน้าที่ของคุณคือตรวจสอบ "รูปภาพแบบแปลน" ที่ได้รับมาอย่างละเอียด และสกัดข้อมูลเชิงลึกเพื่อใช้ในการวางแผนและประเมินราคางานประมูล

      **จากรูปภาพแบบแปลนที่แนบมานี้ โปรดดำเนินการวิเคราะห์ในหัวข้อต่อไปนี้:**

      1.  **ถอดปริมาณวัสดุเบื้องต้น (Initial Material Takeoff):**
          - สแกนหาวัสดุและอุปกรณ์หลักที่มองเห็นในแบบ
          - ลิสต์รายการวัสดุ, ประเมินจำนวนหรือปริมาณ, และระบุหน่วยให้ชัดเจน (เช่น ท่อ, สายไฟ, ดวงโคม, สุขภัณฑ์)
          - หากเป็นไปได้ ให้ระบุตำแหน่งที่พบวัสดุนั้นๆ

      2.  **ระบุขอบเขตงานหลักจากแบบ (Visual Scope Identification):**
          - มองภาพรวมของแผนผังเพื่อระบุโซนหรืองานหลักๆ
          - อธิบายขอบเขตงานในแต่ละพื้นที่ที่ระบุได้ (เช่น งานระบบไฟฟ้าชั้น 1, งานโครงสร้างหลังคา, งานติดตั้งสุขภัณฑ์ห้องน้ำ)

      3.  **ตรวจจับความเสี่ยงและจุดที่ไม่ชัดเจน (Risk & Ambiguity Detection):**
          - ตรวจสอบแบบอย่างละเอียดเพื่อหาจุดที่อาจเป็นปัญหาในการก่อสร้างจริง
          - ระบุความเสี่ยง, จุดที่ข้อมูลขัดแย้งกัน, สัญลักษณ์ที่ไม่ชัดเจน, หรือข้อมูลที่ขาดหายไป
          - ประเมินระดับความรุนแรงของแต่ละความเสี่ยง (High, Medium, Low)

      4.  **สรุปภาพรวม (Overall Impression):**
          - ในฐานะวิศวกรอาวุโส ให้ความเห็นโดยสรุปเกี่ยวกับแบบแปลนฉบับนี้ มีความซับซ้อนเพียงใด? มีจุดไหนที่ต้องให้ความสำคัญเป็นพิเศษในการประมูล?

      **ข้อสำคัญ:** โปรดตอบกลับเป็นภาษาไทย และจัดรูปแบบผลลัพธ์เป็นอ็อบเจ็กต์ JSON ที่ถูกต้องตาม Schema ที่กำหนดเท่านั้น ห้ามมีข้อความอื่นนอกเหนือจาก JSON
    `,
  }
);

// == FLOW ==

export const analyzeBlueprintFlow = ai.defineFlow(
  {
    name: 'analyzeBlueprintFlow',
    inputSchema: BlueprintAnalysisInputSchema,
    outputSchema: BlueprintAnalysisOutputSchema,
  },
  async (input) => {
    console.log(`[Blueprint Flow] Starting analysis for image with MIME type: ${input.mimeType}`);

    const llmResponse = await generate({
      model: procurementAI, // Using the specialized AI for high accuracy
      prompt: blueprintAnalysisPrompt,
      input: { blueprintImage: input.blueprintImage, mimeType: input.mimeType },
      output: {
        format: 'json',
        schema: BlueprintAnalysisOutputSchema,
      },
    });

    const output = llmResponse.output();

    if (!output) {
      throw new Error('AI failed to generate a valid analysis for the blueprint.');
    }

    console.log('[Blueprint Flow] Analysis completed successfully.');
    return output;
  }
);
'''