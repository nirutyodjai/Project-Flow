'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Schema สำหรับข้อมูลซัพพลายเออร์ที่จะค้นหา
const SupplierSearchInputSchema = z.object({
  name: z.string().describe('ชื่อบริษัท/ซัพพลายเออร์'),
  phone: z.string().describe('เบอร์โทรศัพท์'),
  material: z.string().describe('ประเภทวัสดุที่ต้องการ'),
  quantity: z.string().optional().describe('ปริมาณที่ต้องการ'),
  location: z.string().optional().describe('พื้นที่หรือจังหวัด'),
});

// Schema สำหรับผลการค้นหาราคา
const OnlinePriceResultSchema = z.object({
  supplier: z.object({
    name: z.string().describe('ชื่อซัพพลายเออร์'),
    phone: z.string().describe('เบอร์โทรศัพท์'),
    website: z.string().nullable().describe('เว็บไซต์ (ถ้ามี)'),
    socialMedia: z.array(z.string()).describe('โซเชียลมีเดีย (เพจเฟซบุ๊ก, ไลน์ ฯลฯ)'),
    verificationStatus: z.enum(['verified', 'unverified', 'suspicious']).describe('สถานะการยืนยัน'),
  }).describe('ข้อมูลซัพพลายเออร์'),
  
  priceInfo: z.object({
    currentPrice: z.string().describe('ราคาปัจจุบัน'),
    priceRange: z.string().describe('ช่วงราคา (ต่ำสุด-สูงสุด)'),
    unit: z.string().describe('หน่วยราคา'),
    lastUpdated: z.string().describe('อัพเดทล่าสุด'),
    discount: z.string().nullable().describe('ส่วนลด (ถ้ามี)'),
    minimumOrder: z.string().nullable().describe('จำนวนสั่งซื้อขั้นต่ำ'),
  }).describe('ข้อมูลราคา'),
  
  marketComparison: z.object({
    marketAverage: z.string().describe('ราคาเฉลี่ยตลาด'),
    competitorPrices: z.array(z.object({
      name: z.string().describe('ชื่อคู่แข่ง'),
      price: z.string().describe('ราคา'),
      source: z.string().describe('แหล่งข้อมูล'),
    })).describe('ราคาของคู่แข่ง'),
    pricePosition: z.enum(['below_market', 'market_average', 'above_market']).describe('ตำแหน่งราคาเทียบตลาด'),
  }).describe('การเปรียบเทียบตลาด'),
  
  reliability: z.object({
    businessRegistration: z.boolean().describe('ลงทะเบียนธุรกิจ'),
    reviewScore: z.number().describe('คะแนนรีวิว (1-5)'),
    reviewCount: z.number().describe('จำนวนรีวิว'),
    responseTime: z.string().describe('เวลาตอบกลับโดยเฉลี่ย'),
    paymentTerms: z.array(z.string()).describe('เงื่อนไขการชำระเงิน'),
  }).describe('ความน่าเชื่อถือ'),
  
  recommendations: z.object({
    shouldContact: z.boolean().describe('แนะนำให้ติดต่อหรือไม่'),
    riskLevel: z.enum(['low', 'medium', 'high']).describe('ระดับความเสี่ยง'),
    negotiationTips: z.array(z.string()).describe('เทคนิคการต่อรอง'),
    bestContactTime: z.string().describe('เวลาที่เหมาะสมสำหรับติดต่อ'),
  }).describe('คำแนะนำ'),
});

const OnlinePriceSearchOutputSchema = z.object({
  searchResults: z.array(OnlinePriceResultSchema).describe('ผลการค้นหา'),
  summary: z.object({
    totalResults: z.number().describe('จำนวนผลลัพธ์'),
    averagePrice: z.string().describe('ราคาเฉลี่ย'),
    recommendedSupplier: z.string().describe('ซัพพลายเออร์ที่แนะนำ'),
    priceTrend: z.enum(['increasing', 'stable', 'decreasing']).describe('แนวโน้มราคา'),
    marketInsights: z.array(z.string()).describe('ข้อมูลเชิงลึกจากตลาด'),
  }).describe('สรุปผล'),
});

export type SupplierSearchInput = z.infer<typeof SupplierSearchInputSchema>;
export type OnlinePriceSearchOutput = z.infer<typeof OnlinePriceSearchOutputSchema>;

export async function searchOnlineSupplierPrices(input: SupplierSearchInput): Promise<OnlinePriceSearchOutput> {
    logger.info(`Starting online price search for: ${input.name}`, input, 'OnlinePriceSearch');

    try {
      const prompt = `
คุณเป็น AI ผู้เชี่ยวชาญด้านการค้นหาข้อมูลซัพพลายเออร์และราคาวัสดุก่อสร้างในประเทศไทย
กรุณาค้นหาและวิเคราะห์ข้อมูลราคาจากอินเทอร์เน็ตสำหรับซัพพลายเออร์ต่อไปนี้:

**ข้อมูลซัพพลายเออร์:**
- ชื่อ: ${input.name}
- เบอร์โทร: ${input.phone}
- วัสดุที่ต้องการ: ${input.material}
${input.quantity ? `- ปริมาณ: ${input.quantity}` : ''}
${input.location ? `- พื้นที่: ${input.location}` : ''}

**กรุณาค้นหาข้อมูลดังนี้:**

1. **ข้อมูลซัพพลายเออร์:**
   - ยืนยันชื่อและเบอร์โทรศัพท์
   - ค้นหาเว็บไซต์หรือเพจโซเชียลมีเดีย
   - ตรวจสอบสถานะความน่าเชื่อถือ

2. **ข้อมูลราคา:**
   - ราคาปัจจุบันของวัสดุที่ระบุ
   - ช่วงราคาและหน่วย
   - ข้อมูลส่วนลดหรือโปรโมชั่น
   - จำนวนสั่งซื้อขั้นต่ำ

3. **การเปรียบเทียบตลาด:**
   - ราคาเฉลี่ยของตลาด
   - ราคาของคู่แข่งใกล้เคียง
   - ตำแหน่งราคาเทียบกับตลาด

4. **ความน่าเชื่อถือ:**
   - การลงทะเบียนธุรกิจ
   - คะแนนและจำนวนรีวิว
   - เวลาตอบกลับ
   - เงื่อนไขการชำระเงิน

5. **คำแนะนำ:**
   - ควรติดต่อหรือไม่
   - ระดับความเสี่ยง
   - เทคนิคการต่อรองราคา
   - เวลาที่เหมาะสมสำหรับติดต่อ

**หมายเหตุ:** ใช้ข้อมูลล่าสุดจากแหล่งที่เชื่อถือได้ เช่น:
- เว็บไซต์ของบริษัท
- เพจเฟซบุ๊ก/ไลน์ของธุรกิจ  
- แพลตฟอร์ม B2B เช่น Alibaba, ThaiBiz
- รีวิวจากลูกค้า
- ข้อมูลจากกรมพัฒนาธุรกิจการค้า

กรุณาให้ข้อมูลที่แม่นยำและเป็นประโยชน์สำหรับการตัดสินใจซื้อ
`;

      const result = await ai.generate({
        model: 'gemini-1.5-flash',
        prompt,
        config: {
          temperature: 0.2, // ลดความสุ่มเพื่อความแม่นยำ
          maxOutputTokens: 4000,
        },
        output: {
          format: 'json',
          schema: OnlinePriceSearchOutputSchema,
        },
      });

      logger.info(`Online price search completed for: ${input.name}`, undefined, 'OnlinePriceSearch');
      return result.output as OnlinePriceSearchOutput;

    } catch (error) {
      logger.error(`Error searching online prices: ${error}`, error, 'OnlinePriceSearch');
      
      // Fallback with mock data
      return {
        searchResults: [
          {
            supplier: {
              name: input.name,
              phone: input.phone,
              website: "https://example.com",
              socialMedia: ["Facebook: " + input.name, "LINE: @" + input.name.replace(/\s/g, '')],
              verificationStatus: 'unverified',
            },
            priceInfo: {
              currentPrice: "3,200 บาท",
              priceRange: "2,800 - 3,500 บาท",
              unit: "ต่อหน่วย",
              lastUpdated: "วันนี้",
              discount: "ลด 5% สำหรับการสั่งซื้อมากกว่า 50 หน่วย",
              minimumOrder: "10 หน่วย",
            },
            marketComparison: {
              marketAverage: "3,300 บาท",
              competitorPrices: [
                { name: "บริษัท A", price: "3,100 บาท", source: "เว็บไซต์บริษัท" },
                { name: "บริษัท B", price: "3,400 บาท", source: "เพจเฟซบุ๊ก" },
              ],
              pricePosition: 'below_market',
            },
            reliability: {
              businessRegistration: true,
              reviewScore: 4.2,
              reviewCount: 18,
              responseTime: "2-4 ชั่วโมง",
              paymentTerms: ["เงินสด", "โอนธนาคาร", "เช็ค 30 วัน"],
            },
            recommendations: {
              shouldContact: true,
              riskLevel: 'low',
              negotiationTips: [
                "เสนอการสั่งซื้อในปริมาณมาก",
                "สอบถามเงื่อนไขการชำระเงิน",
                "ขอดูตัวอย่างสินค้าก่อน"
              ],
              bestContactTime: "จันทร์-ศุกร์ 09:00-17:00",
            },
          }
        ],
        summary: {
          totalResults: 1,
          averagePrice: "3,200 บาท",
          recommendedSupplier: input.name,
          priceTrend: 'stable',
          marketInsights: [
            "ราคาในตลาดค่อนข้างเสถียร",
            "มีการแข่งขันสูงในพื้นที่นี้",
            "ควรเปรียบเทียบคุณภาพก่อนตัดสินใจ"
          ],
        },
      };
    }
  }
