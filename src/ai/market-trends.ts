import { marketAI } from './genkit';
import { saveMarketTrendAnalysis, getLatestMarketTrendAnalysis, searchMarketTrendAnalysis } from '../services/analysis-data';

/**
 * ระยะเวลาที่ต้องการวิเคราะห์แนวโน้มตลาด
 */
export type TrendPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';

/**
 * ประเภทของแนวโน้มตลาด
 */
export type TrendType = 'general' | 'sector' | 'global' | 'local';

/**
 * ข้อมูลการวิเคราะห์แนวโน้มตลาด
 */
export interface MarketTrendAnalysis {
  id?: string;
  period: TrendPeriod;
  type: TrendType;
  date: string;
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  riskFactors: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidenceScore: number; // 0-100
  createdAt: string;
}

/**
 * วิเคราะห์แนวโน้มตลาดหุ้นตามระยะเวลาและประเภทที่กำหนด
 * 
 * @param period ระยะเวลาที่ต้องการวิเคราะห์ (รายวัน, รายสัปดาห์, รายเดือน, รายไตรมาส)
 * @param type ประเภทของการวิเคราะห์ (ทั่วไป, รายอุตสาหกรรม, ระดับโลก, ระดับท้องถิ่น)
 * @param marketData ข้อมูลตลาดเพิ่มเติม (optional)
 * @returns ผลการวิเคราะห์แนวโน้มตลาด
 */
export async function analyzeMarketTrend(
  period: TrendPeriod,
  type: TrendType,
  marketData?: string
): Promise<MarketTrendAnalysis> {
  try {
    // ดึงข้อมูลการวิเคราะห์ล่าสุดเพื่อใช้ประกอบการวิเคราะห์
    const previousAnalysis = await getLatestMarketTrendAnalysis(period, type);
    
    // สร้าง prompt สำหรับ AI โดยใช้ข้อมูลจากการวิเคราะห์ครั้งก่อน (ถ้ามี)
    let prompt = `วิเคราะห์แนวโน้มตลาดหุ้น${period === 'daily' ? 'รายวัน' : 
      period === 'weekly' ? 'รายสัปดาห์' : 
      period === 'monthly' ? 'รายเดือน' : 'รายไตรมาส'} 
    สำหรับ${type === 'general' ? 'ภาพรวมตลาด' : 
      type === 'sector' ? 'รายอุตสาหกรรม' : 
      type === 'global' ? 'ตลาดโลก' : 'ตลาดในประเทศ'}
    
    วันที่วิเคราะห์: ${new Date().toISOString().split('T')[0]}
    
    โปรดวิเคราะห์ให้ครอบคลุมประเด็นดังนี้:
    1. สรุปภาพรวมแนวโน้มตลาด
    2. ประเด็นสำคัญที่ส่งผลต่อตลาด (อย่างน้อย 3-5 ข้อ)
    3. คำแนะนำสำหรับนักลงทุน (อย่างน้อย 2-3 ข้อ)
    4. ปัจจัยเสี่ยงที่ควรระวัง (อย่างน้อย 2-3 ข้อ)
    5. ความรู้สึกของตลาดโดยรวม (bullish, bearish, neutral)
    6. คะแนนความเชื่อมั่นในการวิเคราะห์ (0-100)
    
    โปรดตอบในรูปแบบ JSON ตามโครงสร้างนี้:
    {
      "summary": "สรุปภาพรวม",
      "keyPoints": ["ประเด็นที่ 1", "ประเด็นที่ 2", ...],
      "recommendations": ["คำแนะนำที่ 1", "คำแนะนำที่ 2", ...],
      "riskFactors": ["ความเสี่ยงที่ 1", "ความเสี่ยงที่ 2", ...],
      "sentiment": "bullish/bearish/neutral",
      "confidenceScore": 0-100
    }`;

    // เพิ่มข้อมูลจากการวิเคราะห์ครั้งก่อนเพื่อให้ AI มีบริบท
    if (previousAnalysis) {
      prompt += `\n\nข้อมูลจากการวิเคราะห์ครั้งล่าสุด (${previousAnalysis.date}):
      สรุป: ${previousAnalysis.summary}
      ความรู้สึกตลาด: ${previousAnalysis.sentiment}
      โปรดวิเคราะห์การเปลี่ยนแปลงของแนวโน้มเทียบกับการวิเคราะห์ครั้งล่าสุดด้วย`;
    }

    // เพิ่มข้อมูลตลาดเพิ่มเติม (ถ้ามี)
    if (marketData) {
      prompt += `\n\nข้อมูลตลาดเพิ่มเติม:
      ${marketData}`;
    }

    // ใช้ marketAI จาก genkit.ts เพื่อวิเคราะห์
    const response = await marketAI.generate({
      prompt: prompt,
      max_tokens: 2048,
    });

    // แปลงผลลัพธ์เป็น JSON
    let responseText = response.text();
    
    // แก้ไขกรณีที่ AI คืนค่าเป็นข้อความทั่วไป (ไม่ใช่ JSON)
    if (!responseText.trim().startsWith('{')) {
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd >= 0) {
        responseText = responseText.substring(jsonStart, jsonEnd + 1);
      } else {
        throw new Error('AI response is not in valid JSON format');
      }
    }

    const result = JSON.parse(responseText);
    
    // สร้างผลลัพธ์
    const analysis: MarketTrendAnalysis = {
      period,
      type,
      date: new Date().toISOString().split('T')[0],
      summary: result.summary,
      keyPoints: result.keyPoints,
      recommendations: result.recommendations,
      riskFactors: result.riskFactors,
      sentiment: result.sentiment,
      confidenceScore: result.confidenceScore,
      createdAt: new Date().toISOString(),
    };

    // บันทึกผลการวิเคราะห์ลงฐานข้อมูล
    await saveMarketTrendAnalysis(analysis);

    return analysis;
  } catch (error) {
    console.error('Error analyzing market trend:', error);
    throw new Error(`Failed to analyze market trend: ${error.message}`);
  }
}

/**
 * ดึงข้อมูลการวิเคราะห์แนวโน้มตลาดล่าสุดตามระยะเวลาและประเภท
 * 
 * @param period ระยะเวลาที่ต้องการดูข้อมูล
 * @param type ประเภทของการวิเคราะห์
 * @returns ผลการวิเคราะห์แนวโน้มตลาดล่าสุด
 */
export async function getLatestTrendAnalysis(
  period: TrendPeriod,
  type: TrendType
): Promise<MarketTrendAnalysis | null> {
  return await getLatestMarketTrendAnalysis(period, type);
}

/**
 * สร้างรายงานสรุปแนวโน้มตลาดจากการวิเคราะห์หลายชุด
 * 
 * @param analyses ชุดข้อมูลการวิเคราะห์แนวโน้มตลาด
 * @returns รายงานสรุปแนวโน้มตลาด
 */
export async function generateTrendSummaryReport(
  analyses: MarketTrendAnalysis[]
): Promise<string> {
  if (!analyses || analyses.length === 0) {
    return 'ไม่มีข้อมูลการวิเคราะห์';
  }

  try {
    // สร้าง prompt สำหรับ AI
    let prompt = `สร้างรายงานสรุปแนวโน้มตลาดจากการวิเคราะห์ ${analyses.length} ชุดข้อมูล ดังนี้:\n\n`;

    // เพิ่มข้อมูลการวิเคราะห์แต่ละชุด
    analyses.forEach((analysis, index) => {
      prompt += `วิเคราะห์ที่ ${index + 1} (${analysis.date}):\n`;
      prompt += `ประเภท: ${analysis.type === 'general' ? 'ภาพรวมตลาด' : 
        analysis.type === 'sector' ? 'รายอุตสาหกรรม' : 
        analysis.type === 'global' ? 'ตลาดโลก' : 'ตลาดในประเทศ'}\n`;
      prompt += `ระยะเวลา: ${analysis.period === 'daily' ? 'รายวัน' : 
        analysis.period === 'weekly' ? 'รายสัปดาห์' : 
        analysis.period === 'monthly' ? 'รายเดือน' : 'รายไตรมาส'}\n`;
      prompt += `สรุป: ${analysis.summary}\n`;
      prompt += `ความรู้สึกตลาด: ${analysis.sentiment}\n\n`;
    });

    prompt += `โปรดสร้างรายงานสรุปแนวโน้มตลาดโดยรวม วิเคราะห์การเปลี่ยนแปลงของแนวโน้ม และให้คำแนะนำสำหรับนักลงทุน`;

    // ใช้ marketAI จาก genkit.ts เพื่อสร้างรายงาน
    const response = await marketAI.generate({
      prompt: prompt,
      max_tokens: 2048,
    });

    return response.text();
  } catch (error) {
    console.error('Error generating trend summary report:', error);
    throw new Error(`Failed to generate trend summary report: ${error.message}`);
  }
}
