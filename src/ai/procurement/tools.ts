/**
 * @fileOverview เครื่องมือ AI เฉพาะทางสำหรับการวิเคราะห์โครงการประมูล
 * ไฟล์นี้รวมเครื่องมือต่างๆ ที่ช่วยในการวิเคราะห์โครงการประมูลอย่างลึกซึ้ง
 * เพื่อให้ AI สามารถให้คำแนะนำที่มีประสิทธิภาพมากขึ้น
 */

import { z } from 'genkit';
import { procurementAI } from '@/ai/genkit';

/**
 * วิเคราะห์ความเหมาะสมของโครงการกับความสามารถของบริษัท
 * เครื่องมือนี้วิเคราะห์รายละเอียดโครงการและประเมินว่าเหมาะสมกับทักษะและ
 * ประสบการณ์ของบริษัทหรือไม่
 */
export const analyzeProjectFit = procurementAI.defineTool(
  {
    name: 'analyzeProjectFit',
    description: 'วิเคราะห์ความเหมาะสมของโครงการกับความสามารถของบริษัท',
    inputSchema: z.object({
      projectDetails: z.object({
        name: z.string().describe('ชื่อโครงการ'),
        type: z.string().describe('ประเภทโครงการ (เช่น ก่อสร้าง, IT, บริการ)'),
        budget: z.string().describe('งบประมาณโครงการ'),
        requirements: z.array(z.string()).describe('ข้อกำหนดหลักของโครงการ'),
      }).describe('รายละเอียดของโครงการที่ต้องการวิเคราะห์'),
      companyCapabilities: z.object({
        expertise: z.array(z.string()).describe('ความเชี่ยวชาญของบริษัท'),
        pastProjects: z.array(z.string()).describe('โครงการที่เคยทำในอดีต'),
        resources: z.array(z.string()).describe('ทรัพยากรที่บริษัทมี'),
      }).describe('ความสามารถของบริษัท'),
    }),
    outputSchema: z.object({
      fitScore: z.number().min(0).max(100).describe('คะแนนความเหมาะสม (0-100)'),
      strengthPoints: z.array(z.string()).describe('จุดแข็งของบริษัทที่เหมาะกับโครงการนี้'),
      weaknessPoints: z.array(z.string()).describe('จุดอ่อนที่อาจเป็นอุปสรรค'),
      recommendation: z.string().describe('คำแนะนำโดยรวม'),
    }),
  },
  async ({ projectDetails, companyCapabilities }) => {
    // คำนวณคะแนนความเหมาะสม
    let fitScore = 0;
    const strengthPoints: string[] = [];
    const weaknessPoints: string[] = [];
    
    // ตรวจสอบความเชี่ยวชาญที่ตรงกับโครงการ
    const expertiseMatch = companyCapabilities.expertise.filter(exp => 
      projectDetails.requirements.some(req => 
        req.toLowerCase().includes(exp.toLowerCase())
      )
    );
    
    if (expertiseMatch.length > 0) {
      fitScore += 40 * (expertiseMatch.length / projectDetails.requirements.length);
      strengthPoints.push(`บริษัทมีความเชี่ยวชาญตรงกับความต้องการของโครงการ: ${expertiseMatch.join(', ')}`);
    } else {
      weaknessPoints.push('ไม่พบความเชี่ยวชาญที่ตรงกับความต้องการของโครงการ');
    }
    
    // ตรวจสอบประสบการณ์โครงการที่คล้ายกัน
    const relevantProjects = companyCapabilities.pastProjects.filter(project => 
      project.toLowerCase().includes(projectDetails.type.toLowerCase())
    );
    
    if (relevantProjects.length > 0) {
      fitScore += 30 * Math.min(relevantProjects.length / 3, 1);
      strengthPoints.push(`บริษัทมีประสบการณ์ในโครงการประเภท ${projectDetails.type} จำนวน ${relevantProjects.length} โครงการ`);
    } else {
      weaknessPoints.push(`บริษัทไม่มีประสบการณ์ในโครงการประเภท ${projectDetails.type}`);
    }
    
    // ตรวจสอบทรัพยากร
    const resourcesNeeded = projectDetails.requirements.length;
    const resourceScore = Math.min(companyCapabilities.resources.length / resourcesNeeded, 1) * 30;
    fitScore += resourceScore;
    
    if (resourceScore > 15) {
      strengthPoints.push('บริษัทมีทรัพยากรเพียงพอสำหรับโครงการนี้');
    } else {
      weaknessPoints.push('บริษัทอาจมีทรัพยากรไม่เพียงพอสำหรับโครงการนี้');
    }
    
    // สร้างคำแนะนำ
    let recommendation = '';
    if (fitScore >= 80) {
      recommendation = 'โครงการนี้เหมาะสมอย่างยิ่งกับบริษัท ควรเข้าร่วมประมูลอย่างเต็มที่';
    } else if (fitScore >= 60) {
      recommendation = 'โครงการนี้มีความเหมาะสมกับบริษัท แต่อาจต้องเตรียมการในบางด้าน';
    } else if (fitScore >= 40) {
      recommendation = 'โครงการนี้มีความเหมาะสมปานกลาง ควรพิจารณาอย่างรอบคอบ';
    } else {
      recommendation = 'โครงการนี้อาจไม่เหมาะสมกับความสามารถของบริษัทในปัจจุบัน';
    }
    
    return {
      fitScore: Math.round(fitScore),
      strengthPoints,
      weaknessPoints,
      recommendation,
    };
  }
);

/**
 * วิเคราะห์คู่แข่งในการประมูลโครงการ
 * เครื่องมือนี้ประเมินข้อมูลคู่แข่งที่คาดว่าจะเข้าร่วมประมูลและวิเคราะห์จุดแข็ง/จุดอ่อน
 */
export const analyzeCompetitors = procurementAI.defineTool(
  {
    name: 'analyzeCompetitors',
    description: 'วิเคราะห์คู่แข่งในการประมูลโครงการ',
    inputSchema: z.object({
      projectType: z.string().describe('ประเภทของโครงการ'),
      competitors: z.array(z.object({
        name: z.string().describe('ชื่อบริษัทคู่แข่ง'),
        strengths: z.array(z.string()).describe('จุดแข็งของคู่แข่ง'),
        pastWins: z.number().describe('จำนวนโครงการที่เคยชนะในอดีต'),
        pricing: z.enum(['aggressive', 'standard', 'premium']).describe('กลยุทธ์ด้านราคา'),
      })).describe('รายชื่อคู่แข่งและข้อมูล'),
      yourCompanyStrengths: z.array(z.string()).describe('จุดแข็งของบริษัทเรา'),
    }),
    outputSchema: z.object({
      competitorAnalysis: z.array(z.object({
        competitor: z.string().describe('ชื่อบริษัทคู่แข่ง'),
        threatLevel: z.number().min(1).max(10).describe('ระดับการคุกคาม 1-10'),
        winningStrategy: z.string().describe('กลยุทธ์การแข่งขันที่แนะนำ'),
      })).describe('การวิเคราะห์คู่แข่งแต่ละราย'),
      overallThreat: z.number().min(1).max(10).describe('ระดับการคุกคามโดยรวม 1-10'),
      recommendedStrategy: z.string().describe('กลยุทธ์ที่แนะนำในการเอาชนะคู่แข่ง'),
    }),
  },
  async ({ projectType, competitors, yourCompanyStrengths }) => {
    // วิเคราะห์คู่แข่งแต่ละราย
    const competitorAnalysis = competitors.map(competitor => {
      // คำนวณระดับการคุกคาม
      let threatLevel = Math.min(competitor.pastWins, 10) * 0.5;
      
      // เพิ่มคะแนนตามกลยุทธ์ด้านราคา
      if (competitor.pricing === 'aggressive') threatLevel += 3;
      else if (competitor.pricing === 'premium') threatLevel += 1;
      else threatLevel += 2;
      
      // เพิ่มคะแนนตามจุดแข็ง
      threatLevel += Math.min(competitor.strengths.length, 5);
      
      // ปรับคะแนนให้อยู่ในช่วง 1-10
      threatLevel = Math.min(Math.max(Math.round(threatLevel), 1), 10);
      
      // กำหนดกลยุทธ์การแข่งขัน
      let winningStrategy = '';
      if (competitor.pricing === 'aggressive') {
        winningStrategy = 'เน้นจุดแข็งด้านคุณภาพและประสบการณ์ มากกว่าการแข่งขันด้านราคา';
      } else if (competitor.pricing === 'premium') {
        winningStrategy = 'เสนอราคาที่แข่งขันได้พร้อมเน้นคุณภาพที่เทียบเท่า';
      } else {
        winningStrategy = 'นำเสนอนวัตกรรมและจุดเด่นที่แตกต่าง พร้อมราคาที่สมเหตุสมผล';
      }
      
      return {
        competitor: competitor.name,
        threatLevel,
        winningStrategy,
      };
    });
    
    // คำนวณระดับการคุกคามโดยรวม
    const overallThreat = Math.min(
      Math.round(
        competitorAnalysis.reduce((sum, comp) => sum + comp.threatLevel, 0) / 
        competitorAnalysis.length
      ), 
      10
    );
    
    // กำหนดกลยุทธ์โดยรวม
    let recommendedStrategy = '';
    if (overallThreat >= 8) {
      recommendedStrategy = 'การแข่งขันสูงมาก ควรพิจารณาการร่วมทุนหรือการเป็นพันธมิตรกับบางบริษัท หรือเลือกโครงการอื่นที่มีการแข่งขันน้อยกว่า';
    } else if (overallThreat >= 6) {
      recommendedStrategy = 'เน้นจุดแข็งเฉพาะทางของบริษัทที่คู่แข่งไม่มี และนำเสนอราคาที่แข่งขันได้';
    } else if (overallThreat >= 4) {
      recommendedStrategy = 'นำเสนอแผนการดำเนินงานที่มีประสิทธิภาพและคุ้มค่า พร้อมเน้นย้ำประสบการณ์ในโครงการที่คล้ายกัน';
    } else {
      recommendedStrategy = 'มีโอกาสชนะสูง ควรนำเสนอราคาที่สมเหตุสมผลพร้อมคุณภาพและการดูแลหลังการขายที่ดี';
    }
    
    return {
      competitorAnalysis,
      overallThreat,
      recommendedStrategy,
    };
  }
);

/**
 * ค้นหาโครงการที่เหมาะสมแบบขั้นสูง
 * เครื่องมือนี้ช่วยค้นหาและจัดลำดับโครงการที่เหมาะสมกับความสามารถของบริษัท
 * และมีโอกาสชนะสูง
 */
export const searchAdvancedProjects = procurementAI.defineTool(
  {
    name: 'searchAdvancedProjects',
    description: 'ค้นหาโครงการที่เหมาะสมแบบขั้นสูง',
    inputSchema: z.object({
      query: z.string().describe('คำค้นหาโครงการ'),
      companyExpertise: z.array(z.string()).describe('ความเชี่ยวชาญของบริษัท'),
      preferredBudgetRange: z.object({
        min: z.number().optional().describe('งบประมาณขั้นต่ำที่สนใจ (บาท)'),
        max: z.number().optional().describe('งบประมาณสูงสุดที่สนใจ (บาท)'),
      }).describe('ช่วงงบประมาณที่สนใจ'),
      preferredProjectTypes: z.array(z.string()).optional().describe('ประเภทโครงการที่สนใจ'),
      geographicPreference: z.array(z.string()).optional().describe('พื้นที่ทางภูมิศาสตร์ที่สนใจ'),
    }),
    outputSchema: z.object({
      enhancedQuery: z.string().describe('คำค้นหาที่ปรับปรุงแล้ว'),
      searchParams: z.object({
        keywords: z.array(z.string()).describe('คำสำคัญที่สกัดได้'),
        filters: z.array(z.object({
          field: z.string().describe('ชื่อฟิลด์'),
          value: z.string().describe('ค่าที่ใช้กรอง'),
        })).describe('ตัวกรองที่แนะนำ'),
      }).describe('พารามิเตอร์การค้นหาที่ปรับปรุงแล้ว'),
    }),
  },
  async ({ query, companyExpertise, preferredBudgetRange, preferredProjectTypes, geographicPreference }) => {
    // สกัดคำสำคัญจากคำค้นหา
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    
    // เพิ่มคำความเชี่ยวชาญเข้าไปในคำสำคัญ
    const expertiseKeywords = companyExpertise.flatMap(exp => 
      exp.toLowerCase().split(' ').filter(word => word.length > 2)
    );
    
    // สร้างคำค้นหาที่ปรับปรุงแล้ว
    let enhancedQuery = query;
    
    // เพิ่มความเชี่ยวชาญที่เกี่ยวข้องเข้าไปในคำค้นหา
    const relevantExpertise = companyExpertise.filter(exp => 
      keywords.some(keyword => exp.toLowerCase().includes(keyword))
    );
    
    if (relevantExpertise.length > 0) {
      enhancedQuery += ` เกี่ยวกับ ${relevantExpertise.join(' ')}`;
    }
    
    // เพิ่มช่วงงบประมาณ
    if (preferredBudgetRange.min && preferredBudgetRange.max) {
      enhancedQuery += ` งบประมาณระหว่าง ${preferredBudgetRange.min.toLocaleString()} ถึง ${preferredBudgetRange.max.toLocaleString()} บาท`;
    } else if (preferredBudgetRange.min) {
      enhancedQuery += ` งบประมาณมากกว่า ${preferredBudgetRange.min.toLocaleString()} บาท`;
    } else if (preferredBudgetRange.max) {
      enhancedQuery += ` งบประมาณไม่เกิน ${preferredBudgetRange.max.toLocaleString()} บาท`;
    }
    
    // เพิ่มประเภทโครงการ
    if (preferredProjectTypes && preferredProjectTypes.length > 0) {
      enhancedQuery += ` ประเภท ${preferredProjectTypes.join(' หรือ ')}`;
    }
    
    // เพิ่มพื้นที่ทางภูมิศาสตร์
    if (geographicPreference && geographicPreference.length > 0) {
      enhancedQuery += ` ใน${geographicPreference.join(' หรือ ')}`;
    }
    
    // สร้างตัวกรอง
    const filters = [];
    
    if (preferredProjectTypes && preferredProjectTypes.length > 0) {
      filters.push({
        field: 'type',
        value: preferredProjectTypes.join(','),
      });
    }
    
    if (geographicPreference && geographicPreference.length > 0) {
      filters.push({
        field: 'address',
        value: geographicPreference.join(','),
      });
    }
    
    // รวมคำสำคัญทั้งหมด
    const allKeywords = [...new Set([...keywords, ...expertiseKeywords])];
    
    return {
      enhancedQuery,
      searchParams: {
        keywords: allKeywords,
        filters,
      },
    };
  }
);
