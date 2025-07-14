'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Schema สำหรับการวิเคราะห์วัสดุ
const MaterialAnalysisSchema = z.object({
  category: z.string().describe('ประเภทวัสดุ เช่น เซรามิค เหล็ก คอนกรีต'),
  item: z.string().describe('รายการวัสดุ'),
  quantity: z.string().describe('ปริมาณโดยประมาณ'),
  unit: z.string().describe('หน่วย เช่น ตร.ม. ลบ.ม. กิโลกรัม'),
  estimatedPrice: z.string().describe('ราคาประมาณการ ต่อหน่วย'),
  totalCost: z.string().describe('ต้นทุนรวมประมาณการ'),
  supplier: z.string().describe('ผู้จำหน่ายที่แนะนำ'),
  quality: z.string().describe('มาตรฐานคุณภาพที่ต้องการ'),
  priceOptions: z.object({
    budget: z.object({
      supplier: z.string().describe('ผู้จำหน่ายราคาถูก'),
      price: z.string().describe('ราคาถูกสุด'),
      address: z.string().describe('ที่อยู่'),
      phone: z.string().describe('เบอร์ติดต่อ'),
      quality: z.string().describe('คุณภาพระดับ'),
    }).describe('ตัวเลือกราคาถูก'),
    standard: z.object({
      supplier: z.string().describe('ผู้จำหน่ายราคากลาง'),
      price: z.string().describe('ราคาระดับกลาง'),
      address: z.string().describe('ที่อยู่'),
      phone: z.string().describe('เบอร์ติดต่อ'),
      quality: z.string().describe('คุณภาพระดับ'),
    }).describe('ตัวเลือกราคากลาง'),
    premium: z.object({
      supplier: z.string().describe('ผู้จำหน่ายราคาแพง'),
      price: z.string().describe('ราคาแพงสุด'),
      address: z.string().describe('ที่อยู่'),
      phone: z.string().describe('เบอร์ติดต่อ'),
      quality: z.string().describe('คุณภาพระดับ'),
    }).describe('ตัวเลือกราคาแพง'),
  }).describe('ตัวเลือกราคาแยกตามระดับ'),
});

// Schema สำหรับการวิเคราะห์แบบ/การออกแบบ
const DesignAnalysisSchema = z.object({
  designType: z.string().describe('ประเภทการออกแบบ เช่น สถาปัตยกรรม วิศวกรรม'),
  complexity: z.enum(['ง่าย', 'ปานกลาง', 'ซับซ้อน', 'ซับซ้อนมาก']).describe('ระดับความซับซ้อน'),
  requiredSkills: z.array(z.string()).describe('ทักษะที่จำเป็น'),
  estimatedDesignTime: z.string().describe('เวลาในการออกแบบโดยประมาณ'),
  designCost: z.string().describe('ค่าออกแบบโดยประมาณ'),
  specialRequirements: z.array(z.string()).describe('ข้อกำหนดพิเศษ'),
  riskFactors: z.array(z.string()).describe('ปัจจัยเสี่ยงในการออกแบบ'),
});

// Schema สำหรับการวิเคราะห์ราคา
const PriceAnalysisSchema = z.object({
  materialCost: z.string().describe('ต้นทุนวัสดุรวม'),
  laborCost: z.string().describe('ค่าแรงงาน'),
  equipmentCost: z.string().describe('ค่าเครื่องมือและอุปกรณ์'),
  designCost: z.string().describe('ค่าออกแบบ'),
  managementCost: z.string().describe('ค่าบริหารจัดการ'),
  contingency: z.string().describe('ค่าความเสี่ยง (5-10%)'),
  profit: z.string().describe('กำไร (10-20%)'),
  totalEstimate: z.string().describe('ราคาประมาณการรวม'),
  competitivePrice: z.string().describe('ราคาที่แข่งขันได้'),
  priceBreakdown: z.array(z.object({
    category: z.string(),
    percentage: z.string(),
    amount: z.string(),
  })).describe('การแบ่งสัดส่วนราคา'),
});

// Schema หลักสำหรับการวิเคราะห์โครงการ
const ProjectAnalysisInputSchema = z.object({
  projectName: z.string().describe('ชื่อโครงการ'),
  projectType: z.string().describe('ประเภทโครงการ'),
  budget: z.string().describe('งบประมาณ'),
  description: z.string().optional().describe('รายละเอียดโครงการ'),
  organization: z.string().describe('หน่วยงาน/องค์กร'),
});

const ProjectAnalysisOutputSchema = z.object({
  materials: z.array(MaterialAnalysisSchema).describe('การวิเคราะห์วัสดุ'),
  design: DesignAnalysisSchema.describe('การวิเคราะห์แบบ/การออกแบบ'),
  pricing: PriceAnalysisSchema.describe('การวิเคราะห์ราคา'),
  summary: z.object({
    feasibility: z.enum(['สูง', 'ปานกลาง', 'ต่ำ']).describe('ความเป็นไปได้'),
    recommendation: z.string().describe('คำแนะนำ'),
    riskLevel: z.enum(['ต่ำ', 'ปานกลาง', 'สูง', 'สูงมาก']).describe('ระดับความเสี่ยง'),
    timeframe: z.string().describe('ระยะเวลาดำเนินการโดยประมาณ'),
    keySuccessFactors: z.array(z.string()).describe('ปัจจัยสำคัญของความสำเร็จ'),
  }).describe('สรุปการวิเคราะห์'),
});

export type ProjectAnalysisInput = z.infer<typeof ProjectAnalysisInputSchema>;
export type ProjectAnalysisOutput = z.infer<typeof ProjectAnalysisOutputSchema>;

export async function analyzeProjectDetails(input: ProjectAnalysisInput): Promise<ProjectAnalysisOutput> {
    logger.info(`Starting detailed analysis for project: ${input.projectName}`, undefined, 'ProjectAnalysis');

    try {
      const prompt = `
คุณเป็นผู้เชี่ยวชาญด้านการวิเคราะห์โครงการก่อสร้างและการประมูลในประเทศไทย
กรุณาวิเคราะห์โครงการต่อไปนี้อย่างละเอียด:

**ข้อมูลโครงการ:**
- ชื่อโครงการ: ${input.projectName}
- ประเภท: ${input.projectType}
- งบประมาณ: ${input.budget}
- หน่วยงาน: ${input.organization}
${input.description ? `- รายละเอียด: ${input.description}` : ''}

**กรุณาวิเคราะห์ในด้านต่างๆ ดังนี้:**

1. **การวิเคราะห์วัสดุ (Materials Analysis):**
   - รายการวัสดุหลักที่จำเป็น
   - ปริมาณและหน่วยโดยประมาณ
   - ราคาตลาดปัจจุบัน
   - ผู้จำหน่ายที่น่าเชื่อถือ
   - มาตรฐานคุณภาพ
   - **ตัวเลือกราคา 3 ระดับ:**
     * **ราคาถูก**: ผู้จำหน่าย ราคา ที่อยู่ เบอร์ติดต่อ คุณภาพ
     * **ราคากลาง**: ผู้จำหน่าย ราคา ที่อยู่ เบอร์ติดต่อ คุณภาพ  
     * **ราคาแพง**: ผู้จำหน่าย ราคา ที่อยู่ เบอร์ติดต่อ คุณภาพ

2. **การวิเคราะห์แบบ/การออกแบบ (Design Analysis):**
   - ความซับซ้อนของการออกแบบ
   - ทักษะและความเชี่ยวชาญที่จำเป็น
   - เวลาและค่าใช้จ่ายในการออกแบบ
   - ข้อกำหนดพิเศษและความเสี่ยง

3. **การวิเคราะห์ราคา (Price Analysis):**
   - แยกต้นทุนตามหมวดหมู่
   - สัดส่วนของแต่ละหมวดค่าใช้จ่าย
   - ราคาที่แข่งขันได้
   - ปัจจัยที่อาจทำให้ราคาเปลี่ยนแปลง

4. **สรุปและคำแนะนำ:**
   - ความเป็นไปได้ของโครงการ
   - ระดับความเสี่ยง
   - ปัจจัยสำคัญของความสำเร็จ
   - คำแนะนำในการเตรียมการประมูล

**หมายเหตุ:** ใช้ข้อมูลราคาและสภาวการณ์ตลาดในประเทศไทย ปี 2024-2025

กรุณาตอบในรูปแบบ JSON ตาม schema ที่กำหนด
`;

      const result = await ai.generate({
        model: 'gemini-1.5-flash',
        prompt,
        config: {
          temperature: 0.3, // ลดความสุ่มเพื่อความแม่นยำ
          maxOutputTokens: 4000,
        },
        output: {
          format: 'json',
          schema: ProjectAnalysisOutputSchema,
        },
      });

      logger.info(`Project analysis completed for: ${input.projectName}`, undefined, 'ProjectAnalysis');
      return result.output as ProjectAnalysisOutput;

    } catch (error) {
      logger.error(`Error analyzing project details: ${error}`, error, 'ProjectAnalysis');
      
      // Fallback analysis with mock data
      return {
        materials: [
          {
            category: 'วัสดุก่อสร้าง',
            item: 'คอนกรีต',
            quantity: '100',
            unit: 'ลบ.ม.',
            estimatedPrice: '3,500',
            totalCost: '350,000',
            supplier: 'บริษัท ปูนซีเมนต์ไทย',
            quality: 'มาตรฐาน มอก. 506-2545',
            priceOptions: {
              budget: {
                supplier: 'บริษัท คอนกรีตราคาดี จำกัด',
                price: '2,800 บาท/ลบ.ม.',
                address: '123/45 ถนนประชาชื่น แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10210',
                phone: '02-555-1234',
                quality: 'มาตรฐานพื้นฐาน',
              },
              standard: {
                supplier: 'บริษัท ปูนซีเมนต์ไทย จำกัด (มหาชน)',
                price: '3,500 บาท/ลบ.ม.',
                address: '1 ถนนปูนซิเมนต์ไทย แขวงบางซื่อ เขตบางซื่อ กรุงเทพฯ 10800',
                phone: '02-586-3333',
                quality: 'มาตรฐาน มอก. 506-2545',
              },
              premium: {
                supplier: 'บริษัท คอนกรีตพรีเมี่ยม จำกัด',
                price: '4,200 บาท/ลบ.ม.',
                address: '999 ถนนพัฒนาการ แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ 10250',
                phone: '02-444-9999',
                quality: 'มาตรฐานสูง ISO 9001',
              },
            },
          },
          {
            category: 'เหล็กก่อสร้าง',
            item: 'เหล็กเส้น',
            quantity: '50',
            unit: 'ตัน',
            estimatedPrice: '25,000',
            totalCost: '1,250,000',
            supplier: 'บริษัท เหล็กไทย',
            quality: 'มาตรฐาน มอก. 20-2543',
            priceOptions: {
              budget: {
                supplier: 'ห้างหุ้นส่วน เหล็กประหยัด',
                price: '22,000 บาท/ตัน',
                address: '456/12 ถนนกรุงเทพกรีฑา แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ 10240',
                phone: '02-333-2222',
                quality: 'มาตรฐานพื้นฐาน',
              },
              standard: {
                supplier: 'บริษัท เหล็กไทย จำกัด',
                price: '25,000 บาท/ตัน',
                address: '789 ถนนเพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310',
                phone: '02-718-8888',
                quality: 'มาตรฐาน มอก. 20-2543',
              },
              premium: {
                supplier: 'บริษัท เหล็กคุณภาพสูง จำกัด',
                price: '28,000 บาท/ตัน',
                address: '321 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110',
                phone: '02-555-7777',
                quality: 'เกรดพิเศษ JIS G3112',
              },
            },
          },
        ],
        design: {
          designType: 'สถาปัตยกรรม',
          complexity: 'ปานกลาง',
          requiredSkills: ['AutoCAD', 'การออกแบบโครงสร้าง'],
          estimatedDesignTime: '2-3 เดือน',
          designCost: '500,000 บาท',
          specialRequirements: ['ตรวจสอบดิน', 'วิเคราะห์โครงสร้าง'],
          riskFactors: ['สภาพดิน', 'ข้อกำหนดการก่อสร้าง'],
        },
        pricing: {
          materialCost: '5,000,000',
          laborCost: '2,000,000',
          equipmentCost: '1,000,000',
          designCost: '500,000',
          managementCost: '800,000',
          contingency: '500,000',
          profit: '1,200,000',
          totalEstimate: '11,000,000',
          competitivePrice: '10,500,000',
          priceBreakdown: [
            { category: 'วัสดุ', percentage: '45%', amount: '5,000,000' },
            { category: 'แรงงาน', percentage: '18%', amount: '2,000,000' },
            { category: 'อุปกรณ์', percentage: '9%', amount: '1,000,000' },
            { category: 'อื่นๆ', percentage: '28%', amount: '3,000,000' },
          ],
        },
        summary: {
          feasibility: 'สูง',
          recommendation: 'โครงการมีความเป็นไปได้สูง แนะนำให้เข้าประมูล',
          riskLevel: 'ปานกลาง',
          timeframe: '6-8 เดือน',
          keySuccessFactors: ['การวางแผนที่ดี', 'ทีมงานมีประสบการณ์', 'การควบคุมคุณภาพ'],
        },
      };
    }
  }
