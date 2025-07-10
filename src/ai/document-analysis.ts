/**
 * โมดูลสำหรับการวิเคราะห์เอกสาร TOR (Terms of Reference) และ BOQ (Bill of Quantities)
 * เพื่อช่วยในการประเมินโครงการประมูลและการเสนอราคา
 */
import { procurementAI } from './genkit';

/**
 * ประเภทของเอกสารที่วิเคราะห์
 */
export type DocumentType = 'tor' | 'boq' | 'drawing' | 'specification' | 'contract';

/**
 * ระดับความเสี่ยงของโครงการ
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * ผลการวิเคราะห์เอกสาร TOR
 */
export interface TORAnalysisResult {
  projectName: string;
  projectType: string;
  agency: string;
  budget: number;
  startDate?: string;
  endDate?: string;
  duration?: number;
  mainRequirements: string[];
  keyDeliverables: string[];
  paymentConditions: string[];
  qualificationRequirements: string[];
  evaluationCriteria: string[];
  riskFactors: {
    description: string;
    level: RiskLevel;
    impact: string;
    mitigation?: string;
  }[];
  opportunityScore: number; // 0-100
  competitiveAdvantage: string[];
  recommendations: string[];
  summary: string;
}

/**
 * รายการใน BOQ
 */
export interface BOQItem {
  itemNumber: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  costEstimation?: {
    materials: number;
    labor: number;
    equipment: number;
    overhead: number;
    profit: number;
  };
  riskAssessment?: {
    level: RiskLevel;
    reason: string;
  };
}

/**
 * ผลการวิเคราะห์ BOQ
 */
export interface BOQAnalysisResult {
  projectName: string;
  totalItems: number;
  totalEstimatedCost: number;
  majorCategories: {
    name: string;
    items: number;
    totalCost: number;
    percentageOfTotal: number;
  }[];
  highValueItems: BOQItem[];
  highRiskItems: BOQItem[];
  missingInformation: string[];
  potentialPriceAdjustments: {
    itemNumber: string;
    description: string;
    suggestedAdjustment: number;
    reason: string;
  }[];
  profitMarginEstimate: number;
  overallRiskAssessment: {
    level: RiskLevel;
    factors: string[];
  };
  recommendations: string[];
  summary: string;
}

/**
 * วิเคราะห์เอกสาร TOR เพื่อประเมินโอกาส ความเสี่ยง และข้อกำหนดสำคัญ
 * 
 * @param torContent เนื้อหาของเอกสาร TOR
 * @param additionalContext ข้อมูลเพิ่มเติมเกี่ยวกับโครงการ (ถ้ามี)
 * @returns ผลการวิเคราะห์ TOR
 */
export async function analyzeTOR(
  torContent: string,
  additionalContext?: string
): Promise<TORAnalysisResult> {
  try {
    // สร้าง prompt เพื่อวิเคราะห์ TOR
    let prompt = `วิเคราะห์เอกสาร TOR (Terms of Reference) ต่อไปนี้:

${torContent}

โปรดวิเคราะห์โดยละเอียดตามประเด็นต่อไปนี้:
1. ชื่อโครงการ
2. ประเภทโครงการ
3. หน่วยงานเจ้าของโครงการ
4. งบประมาณ (บาท)
5. วันที่เริ่มต้นโครงการ (ถ้ามีระบุ)
6. วันที่สิ้นสุดโครงการ (ถ้ามีระบุ)
7. ระยะเวลาดำเนินการ (วัน หรือ เดือน)
8. ข้อกำหนดหลักของโครงการ (5-10 ข้อ)
9. ผลงานที่ต้องส่งมอบ (Deliverables)
10. เงื่อนไขการชำระเงิน
11. คุณสมบัติผู้เข้าร่วมประมูล
12. เกณฑ์การประเมิน
13. ปัจจัยความเสี่ยงของโครงการ (พร้อมระดับความเสี่ยง: ต่ำ/กลาง/สูง/วิกฤต และผลกระทบ)
14. คะแนนโอกาสความเป็นไปได้ (0-100)
15. ข้อได้เปรียบในการแข่งขันที่บริษัทอาจมี
16. คำแนะนำในการเข้าร่วมประมูล
17. สรุปภาพรวมของ TOR

โปรดตอบในรูปแบบ JSON ตามโครงสร้างต่อไปนี้:
{
  "projectName": "ชื่อโครงการ",
  "projectType": "ประเภทโครงการ",
  "agency": "หน่วยงานเจ้าของโครงการ",
  "budget": งบประมาณ (ตัวเลข),
  "startDate": "วันที่เริ่มต้น (YYYY-MM-DD) หรือ null",
  "endDate": "วันที่สิ้นสุด (YYYY-MM-DD) หรือ null",
  "duration": ระยะเวลาดำเนินการ (ตัวเลข) หรือ null,
  "mainRequirements": ["ข้อกำหนดหลักที่ 1", "ข้อกำหนดหลักที่ 2", ...],
  "keyDeliverables": ["ผลงานที่ต้องส่งมอบ 1", "ผลงานที่ต้องส่งมอบ 2", ...],
  "paymentConditions": ["เงื่อนไขการชำระเงิน 1", "เงื่อนไขการชำระเงิน 2", ...],
  "qualificationRequirements": ["คุณสมบัติ 1", "คุณสมบัติ 2", ...],
  "evaluationCriteria": ["เกณฑ์การประเมิน 1", "เกณฑ์การประเมิน 2", ...],
  "riskFactors": [
    {
      "description": "คำอธิบายความเสี่ยง",
      "level": "low/medium/high/critical",
      "impact": "ผลกระทบ",
      "mitigation": "วิธีลดความเสี่ยง (ถ้ามี)"
    },
    ...
  ],
  "opportunityScore": คะแนนโอกาส (0-100),
  "competitiveAdvantage": ["ข้อได้เปรียบ 1", "ข้อได้เปรียบ 2", ...],
  "recommendations": ["คำแนะนำ 1", "คำแนะนำ 2", ...],
  "summary": "สรุปภาพรวมของ TOR"
}`;

    // เพิ่มข้อมูลเพิ่มเติมถ้ามี
    if (additionalContext) {
      prompt += `\n\nข้อมูลเพิ่มเติมเกี่ยวกับโครงการ:
${additionalContext}`;
    }

    // ใช้ procurementAI จาก genkit.ts เพื่อวิเคราะห์
    const response = await procurementAI.generate({
      prompt: prompt,
      max_tokens: 3500,
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

    const result = JSON.parse(responseText) as TORAnalysisResult;
    return result;
  } catch (error) {
    console.error('Error analyzing TOR:', error);
    throw new Error(`Failed to analyze TOR: ${error.message}`);
  }
}

/**
 * วิเคราะห์เอกสาร BOQ เพื่อประเมินต้นทุน ความเสี่ยง และโอกาสในการปรับราคา
 * 
 * @param boqContent เนื้อหาของเอกสาร BOQ
 * @param torAnalysis ผลการวิเคราะห์ TOR (ถ้ามี) เพื่อใช้เป็นบริบทเพิ่มเติม
 * @returns ผลการวิเคราะห์ BOQ
 */
export async function analyzeBOQ(
  boqContent: string,
  torAnalysis?: TORAnalysisResult
): Promise<BOQAnalysisResult> {
  try {
    // สร้าง prompt เพื่อวิเคราะห์ BOQ
    let prompt = `วิเคราะห์เอกสาร BOQ (Bill of Quantities) ต่อไปนี้:

${boqContent}

โปรดวิเคราะห์โดยละเอียดตามประเด็นต่อไปนี้:
1. ชื่อโครงการ
2. จำนวนรายการทั้งหมด
3. ประมาณการต้นทุนรวมทั้งหมด
4. หมวดหมู่หลักของรายการ (พร้อมจำนวนรายการ, ต้นทุนรวม, เปอร์เซ็นต์ของต้นทุนทั้งหมด)
5. รายการที่มีมูลค่าสูง (high-value items)
6. รายการที่มีความเสี่ยงสูง พร้อมเหตุผล
7. ข้อมูลที่ขาดหายไป หรือไม่ชัดเจน
8. รายการที่อาจมีโอกาสปรับราคาได้ พร้อมเหตุผล
9. ประมาณการอัตรากำไร (%)
10. การประเมินความเสี่ยงโดยรวม
11. คำแนะนำในการเสนอราคา
12. สรุปภาพรวมของ BOQ

โปรดตอบในรูปแบบ JSON ตามโครงสร้างต่อไปนี้:
{
  "projectName": "ชื่อโครงการ",
  "totalItems": จำนวนรายการทั้งหมด (ตัวเลข),
  "totalEstimatedCost": ประมาณการต้นทุนรวม (ตัวเลข),
  "majorCategories": [
    {
      "name": "ชื่อหมวดหมู่",
      "items": จำนวนรายการ (ตัวเลข),
      "totalCost": ต้นทุนรวม (ตัวเลข),
      "percentageOfTotal": เปอร์เซ็นต์ของต้นทุนทั้งหมด (ตัวเลข)
    },
    ...
  ],
  "highValueItems": [
    {
      "itemNumber": "รหัสรายการ",
      "description": "รายละเอียด",
      "unit": "หน่วย",
      "quantity": จำนวน (ตัวเลข),
      "unitPrice": ราคาต่อหน่วย (ตัวเลข),
      "totalPrice": ราคารวม (ตัวเลข),
      "notes": "หมายเหตุ (ถ้ามี)"
    },
    ...
  ],
  "highRiskItems": [
    {
      "itemNumber": "รหัสรายการ",
      "description": "รายละเอียด",
      "riskAssessment": {
        "level": "low/medium/high/critical",
        "reason": "เหตุผล"
      }
    },
    ...
  ],
  "missingInformation": ["ข้อมูลที่ขาดหาย 1", "ข้อมูลที่ขาดหาย 2", ...],
  "potentialPriceAdjustments": [
    {
      "itemNumber": "รหัสรายการ",
      "description": "รายละเอียด",
      "suggestedAdjustment": เปอร์เซ็นต์การปรับ (ตัวเลข),
      "reason": "เหตุผล"
    },
    ...
  ],
  "profitMarginEstimate": ประมาณการอัตรากำไร (ตัวเลข),
  "overallRiskAssessment": {
    "level": "low/medium/high/critical",
    "factors": ["ปัจจัยความเสี่ยง 1", "ปัจจัยความเสี่ยง 2", ...]
  },
  "recommendations": ["คำแนะนำ 1", "คำแนะนำ 2", ...],
  "summary": "สรุปภาพรวมของ BOQ"
}`;

    // เพิ่มข้อมูลจาก TOR ถ้ามี
    if (torAnalysis) {
      prompt += `\n\nข้อมูลจากการวิเคราะห์ TOR:
ชื่อโครงการ: ${torAnalysis.projectName}
ประเภทโครงการ: ${torAnalysis.projectType}
หน่วยงาน: ${torAnalysis.agency}
งบประมาณ: ${torAnalysis.budget}
ระยะเวลาดำเนินการ: ${torAnalysis.duration || 'ไม่ระบุ'}
ข้อกำหนดหลัก: ${torAnalysis.mainRequirements.join(', ')}
สรุป TOR: ${torAnalysis.summary}`;
    }

    // ใช้ procurementAI จาก genkit.ts เพื่อวิเคราะห์
    const response = await procurementAI.generate({
      prompt: prompt,
      max_tokens: 3500,
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

    const result = JSON.parse(responseText) as BOQAnalysisResult;
    return result;
  } catch (error) {
    console.error('Error analyzing BOQ:', error);
    throw new Error(`Failed to analyze BOQ: ${error.message}`);
  }
}

/**
 * วิเคราะห์ความสอดคล้องระหว่าง TOR และ BOQ เพื่อตรวจหาความไม่สอดคล้องหรือข้อผิดพลาด
 * 
 * @param torAnalysis ผลการวิเคราะห์ TOR
 * @param boqAnalysis ผลการวิเคราะห์ BOQ
 * @returns ผลการวิเคราะห์ความสอดคล้อง
 */
export async function analyzeTORBOQConsistency(
  torAnalysis: TORAnalysisResult,
  boqAnalysis: BOQAnalysisResult
): Promise<{
  consistencyScore: number;
  inconsistencies: string[];
  recommendations: string[];
  summary: string;
}> {
  try {
    // สร้าง prompt เพื่อวิเคราะห์ความสอดคล้อง
    const prompt = `วิเคราะห์ความสอดคล้องระหว่างเอกสาร TOR และ BOQ ต่อไปนี้:

ข้อมูลจากการวิเคราะห์ TOR:
ชื่อโครงการ: ${torAnalysis.projectName}
ประเภทโครงการ: ${torAnalysis.projectType}
หน่วยงาน: ${torAnalysis.agency}
งบประมาณ: ${torAnalysis.budget}
ระยะเวลาดำเนินการ: ${torAnalysis.duration || 'ไม่ระบุ'}
ข้อกำหนดหลัก: ${torAnalysis.mainRequirements.join(', ')}
ผลงานที่ต้องส่งมอบ: ${torAnalysis.keyDeliverables.join(', ')}
คะแนนโอกาส: ${torAnalysis.opportunityScore}
สรุป TOR: ${torAnalysis.summary}

ข้อมูลจากการวิเคราะห์ BOQ:
ชื่อโครงการ: ${boqAnalysis.projectName}
จำนวนรายการทั้งหมด: ${boqAnalysis.totalItems}
ประมาณการต้นทุนรวม: ${boqAnalysis.totalEstimatedCost}
หมวดหมู่หลัก: ${boqAnalysis.majorCategories.map(cat => cat.name).join(', ')}
ประมาณการอัตรากำไร: ${boqAnalysis.profitMarginEstimate}%
ระดับความเสี่ยงโดยรวม: ${boqAnalysis.overallRiskAssessment.level}
สรุป BOQ: ${boqAnalysis.summary}

โปรดวิเคราะห์ความสอดคล้องระหว่างเอกสาร TOR และ BOQ ตามประเด็นต่อไปนี้:
1. คะแนนความสอดคล้องโดยรวม (0-100)
2. รายการความไม่สอดคล้องหรือข้อขัดแย้งที่พบ
3. คำแนะนำในการแก้ไขความไม่สอดคล้อง
4. สรุปภาพรวมของความสอดคล้อง

โปรดตอบในรูปแบบ JSON ตามโครงสร้างต่อไปนี้:
{
  "consistencyScore": คะแนนความสอดคล้อง (0-100),
  "inconsistencies": ["ความไม่สอดคล้อง 1", "ความไม่สอดคล้อง 2", ...],
  "recommendations": ["คำแนะนำ 1", "คำแนะนำ 2", ...],
  "summary": "สรุปภาพรวมของความสอดคล้อง"
}`;

    // ใช้ procurementAI จาก genkit.ts เพื่อวิเคราะห์
    const response = await procurementAI.generate({
      prompt: prompt,
      max_tokens: 2500,
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

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error analyzing TOR-BOQ consistency:', error);
    throw new Error(`Failed to analyze TOR-BOQ consistency: ${error.message}`);
  }
}

/**
 * วิเคราะห์แผนที่หรือแบบแปลนโครงการ
 * 
 * @param drawingContent เนื้อหาของแบบแปลน (คำอธิบายเป็นข้อความ หรือ URL ไปยังไฟล์ภาพ)
 * @param torAnalysis ผลการวิเคราะห์ TOR (ถ้ามี) เพื่อใช้เป็นบริบทเพิ่มเติม
 * @returns ผลการวิเคราะห์แบบแปลน
 */
export async function analyzeDrawing(
  drawingContent: string,
  torAnalysis?: TORAnalysisResult
): Promise<{
  keyComponents: string[];
  technicalChallenges: string[];
  resourceRequirements: string[];
  timelineEstimate: string;
  riskFactors: {
    description: string;
    level: RiskLevel;
  }[];
  recommendations: string[];
  summary: string;
}> {
  try {
    // สร้าง prompt เพื่อวิเคราะห์แบบแปลน
    let prompt = `วิเคราะห์แบบแปลนหรือแผนที่โครงการต่อไปนี้:

${drawingContent}

โปรดวิเคราะห์โดยละเอียดตามประเด็นต่อไปนี้:
1. องค์ประกอบสำคัญของแบบแปลน
2. ความท้าทายทางเทคนิคที่อาจเกิดขึ้น
3. ทรัพยากรที่จำเป็นต้องใช้ (เครื่องมือ, บุคลากร, วัสดุ)
4. ประมาณการระยะเวลาในการดำเนินการ
5. ปัจจัยความเสี่ยง พร้อมระดับความเสี่ยง
6. คำแนะนำในการดำเนินการ
7. สรุปภาพรวมของแบบแปลน

โปรดตอบในรูปแบบ JSON ตามโครงสร้างต่อไปนี้:
{
  "keyComponents": ["องค์ประกอบที่ 1", "องค์ประกอบที่ 2", ...],
  "technicalChallenges": ["ความท้าทายที่ 1", "ความท้าทายที่ 2", ...],
  "resourceRequirements": ["ทรัพยากรที่ 1", "ทรัพยากรที่ 2", ...],
  "timelineEstimate": "ประมาณการระยะเวลา",
  "riskFactors": [
    {
      "description": "คำอธิบายความเสี่ยง",
      "level": "low/medium/high/critical"
    },
    ...
  ],
  "recommendations": ["คำแนะนำที่ 1", "คำแนะนำที่ 2", ...],
  "summary": "สรุปภาพรวมของแบบแปลน"
}`;

    // เพิ่มข้อมูลจาก TOR ถ้ามี
    if (torAnalysis) {
      prompt += `\n\nข้อมูลจากการวิเคราะห์ TOR:
ชื่อโครงการ: ${torAnalysis.projectName}
ประเภทโครงการ: ${torAnalysis.projectType}
หน่วยงาน: ${torAnalysis.agency}
งบประมาณ: ${torAnalysis.budget}
ข้อกำหนดหลัก: ${torAnalysis.mainRequirements.join(', ')}
สรุป TOR: ${torAnalysis.summary}`;
    }

    // ใช้ procurementAI จาก genkit.ts เพื่อวิเคราะห์
    const response = await procurementAI.generate({
      prompt: prompt,
      max_tokens: 2500,
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

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error analyzing drawing:', error);
    throw new Error(`Failed to analyze drawing: ${error.message}`);
  }
}

/**
 * สร้างรายงานสรุปการวิเคราะห์โครงการจากผลการวิเคราะห์ TOR, BOQ และเอกสารอื่นๆ
 * 
 * @param projectName ชื่อโครงการ
 * @param torAnalysis ผลการวิเคราะห์ TOR
 * @param boqAnalysis ผลการวิเคราะห์ BOQ (ถ้ามี)
 * @param consistencyAnalysis ผลการวิเคราะห์ความสอดคล้อง (ถ้ามี)
 * @param drawingAnalysis ผลการวิเคราะห์แบบแปลน (ถ้ามี)
 * @returns รายงานสรุปการวิเคราะห์โครงการ
 */
export async function generateProjectAnalysisSummary(
  projectName: string,
  torAnalysis: TORAnalysisResult,
  boqAnalysis?: BOQAnalysisResult,
  consistencyAnalysis?: {
    consistencyScore: number;
    inconsistencies: string[];
    recommendations: string[];
    summary: string;
  },
  drawingAnalysis?: {
    keyComponents: string[];
    technicalChallenges: string[];
    resourceRequirements: string[];
    timelineEstimate: string;
    riskFactors: {
      description: string;
      level: RiskLevel;
    }[];
    recommendations: string[];
    summary: string;
  }
): Promise<string> {
  try {
    // สร้าง prompt เพื่อสร้างรายงานสรุป
    let prompt = `สร้างรายงานสรุปการวิเคราะห์โครงการ "${projectName}" จากข้อมูลต่อไปนี้:

ข้อมูลจากการวิเคราะห์ TOR:
ชื่อโครงการ: ${torAnalysis.projectName}
ประเภทโครงการ: ${torAnalysis.projectType}
หน่วยงาน: ${torAnalysis.agency}
งบประมาณ: ${torAnalysis.budget}
ระยะเวลาดำเนินการ: ${torAnalysis.duration || 'ไม่ระบุ'}
ข้อกำหนดหลัก: ${torAnalysis.mainRequirements.join(', ')}
ผลงานที่ต้องส่งมอบ: ${torAnalysis.keyDeliverables.join(', ')}
คะแนนโอกาส: ${torAnalysis.opportunityScore}
ปัจจัยความเสี่ยง: ${torAnalysis.riskFactors.map(risk => `${risk.description} (${risk.level})`).join(', ')}
คำแนะนำ: ${torAnalysis.recommendations.join(', ')}
สรุป TOR: ${torAnalysis.summary}`;

    // เพิ่มข้อมูลจาก BOQ ถ้ามี
    if (boqAnalysis) {
      prompt += `\n\nข้อมูลจากการวิเคราะห์ BOQ:
จำนวนรายการทั้งหมด: ${boqAnalysis.totalItems}
ประมาณการต้นทุนรวม: ${boqAnalysis.totalEstimatedCost}
หมวดหมู่หลัก: ${boqAnalysis.majorCategories.map(cat => `${cat.name} (${cat.percentageOfTotal}%)`).join(', ')}
ประมาณการอัตรากำไร: ${boqAnalysis.profitMarginEstimate}%
ระดับความเสี่ยงโดยรวม: ${boqAnalysis.overallRiskAssessment.level}
ปัจจัยความเสี่ยง: ${boqAnalysis.overallRiskAssessment.factors.join(', ')}
คำแนะนำ: ${boqAnalysis.recommendations.join(', ')}
สรุป BOQ: ${boqAnalysis.summary}`;
    }

    // เพิ่มข้อมูลจากการวิเคราะห์ความสอดคล้อง ถ้ามี
    if (consistencyAnalysis) {
      prompt += `\n\nข้อมูลจากการวิเคราะห์ความสอดคล้องระหว่าง TOR และ BOQ:
คะแนนความสอดคล้อง: ${consistencyAnalysis.consistencyScore}
ความไม่สอดคล้อง: ${consistencyAnalysis.inconsistencies.join(', ')}
คำแนะนำ: ${consistencyAnalysis.recommendations.join(', ')}
สรุปความสอดคล้อง: ${consistencyAnalysis.summary}`;
    }

    // เพิ่มข้อมูลจากการวิเคราะห์แบบแปลน ถ้ามี
    if (drawingAnalysis) {
      prompt += `\n\nข้อมูลจากการวิเคราะห์แบบแปลน:
องค์ประกอบสำคัญ: ${drawingAnalysis.keyComponents.join(', ')}
ความท้าทายทางเทคนิค: ${drawingAnalysis.technicalChallenges.join(', ')}
ทรัพยากรที่จำเป็น: ${drawingAnalysis.resourceRequirements.join(', ')}
ประมาณการระยะเวลา: ${drawingAnalysis.timelineEstimate}
ปัจจัยความเสี่ยง: ${drawingAnalysis.riskFactors.map(risk => `${risk.description} (${risk.level})`).join(', ')}
คำแนะนำ: ${drawingAnalysis.recommendations.join(', ')}
สรุปแบบแปลน: ${drawingAnalysis.summary}`;
    }

    prompt += `\n\nโปรดสร้างรายงานสรุปการวิเคราะห์โครงการโดยครอบคลุมประเด็นต่อไปนี้:
1. สรุปภาพรวมของโครงการ
2. โอกาสและความคุ้มค่าในการเข้าร่วมประมูล
3. ความเสี่ยงสำคัญและแนวทางการบริหารความเสี่ยง
4. ข้อแนะนำในการเตรียมเอกสารและการเสนอราคา
5. ทรัพยากรที่จำเป็นต้องใช้
6. ประมาณการต้นทุนและกำไร
7. บทสรุปและข้อเสนอแนะ

โปรดเขียนรายงานในรูปแบบที่เป็นทางการ มีหัวข้อชัดเจน และมีการวิเคราะห์เชิงลึก`;

    // ใช้ procurementAI จาก genkit.ts เพื่อวิเคราะห์
    const response = await procurementAI.generate({
      prompt: prompt,
      max_tokens: 4000,
    });

    return response.text();
  } catch (error) {
    console.error('Error generating project analysis summary:', error);
    throw new Error(`Failed to generate project analysis summary: ${error.message}`);
  }
}
