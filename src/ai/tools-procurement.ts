/**
 * @fileOverview กำหนดเครื่องมือ AI เฉพาะสำหรับการค้นหาและวิเคราะห์โครงการประมูล
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { listProjects } from '@/services/mock-data';

/**
 * เครื่องมือสำหรับวิเคราะห์โครงการว่ามีความเหมาะสมกับบริษัทหรือไม่
 * วิเคราะห์โดยใช้ข้อมูลโครงการและประสบการณ์ของบริษัท
 */
export const analyzeProjectFit = ai.defineTool(
  {
    name: 'analyzeProjectFit',
    description: 'วิเคราะห์ความเหมาะสมของโครงการกับความสามารถของบริษัท',
    inputSchema: z.object({
      projectName: z.string().describe('ชื่อโครงการ'),
      projectType: z.string().describe('ประเภทของโครงการ เช่น ก่อสร้าง, ติดตั้งระบบ, ปรับปรุง'),
      projectOwner: z.string().describe('เจ้าของโครงการ หน่วยงานรัฐหรือเอกชน'),
      budget: z.string().describe('งบประมาณโครงการ'),
      companyExpertise: z.array(z.string()).describe('ความเชี่ยวชาญของบริษัท'),
    }),
    outputSchema: z.object({
      fitScore: z.number().min(0).max(100).describe('คะแนนความเหมาะสม (0-100)'),
      strengths: z.array(z.string()).describe('จุดแข็งของบริษัทที่เหมาะกับโครงการนี้'),
      weaknesses: z.array(z.string()).describe('จุดอ่อนที่อาจส่งผลต่อโครงการนี้'),
      recommendation: z.string().describe('คำแนะนำในการเข้าร่วมประมูล'),
    }),
  },
  async ({ projectName, projectType, projectOwner, budget, companyExpertise }) => {
    // วิเคราะห์ข้อมูล (ในตัวอย่างนี้เราใช้ตรรกะอย่างง่าย)
    // ในสภาพแวดล้อมจริง ฟังก์ชันนี้อาจจะซับซ้อนกว่านี้มาก โดยใช้ AI และข้อมูลอื่นๆ
    
    const isGovernment = projectOwner.toLowerCase().includes('รัฐ') || 
                          projectOwner.toLowerCase().includes('กรม') ||
                          projectOwner.toLowerCase().includes('เทศบาล');
                          
    // คำนวณคะแนนความเหมาะสมเบื้องต้น
    let fitScore = 50; // คะแนนเริ่มต้น
    
    // ตรวจสอบความเชี่ยวชาญที่ตรงกับโครงการ
    const relevantExpertise = companyExpertise.filter(exp => 
      projectName.toLowerCase().includes(exp.toLowerCase()) || 
      projectType.toLowerCase().includes(exp.toLowerCase())
    );
    
    // เพิ่มคะแนนตามความเชี่ยวชาญที่เกี่ยวข้อง
    fitScore += relevantExpertise.length * 10;
    
    // ปรับคะแนนตามประเภทโครงการ (รัฐบาลหรือเอกชน)
    if (isGovernment) {
      fitScore += 5; // รัฐบาลมักมีขั้นตอนชัดเจน
    } else {
      fitScore += 10; // เอกชนมักมีความยืดหยุ่นมากกว่า
    }
    
    // ปรับให้คะแนนอยู่ในช่วง 0-100
    fitScore = Math.max(0, Math.min(100, fitScore));
    
    // วิเคราะห์จุดแข็งและจุดอ่อน
    const strengths = relevantExpertise.map(exp => `มีความเชี่ยวชาญด้าน${exp}`);
    if (isGovernment) {
      strengths.push('มีประสบการณ์ทำงานกับหน่วยงานรัฐ');
    }
    
    const weaknesses = [];
    if (relevantExpertise.length === 0) {
      weaknesses.push('ไม่มีความเชี่ยวชาญตรงกับโครงการนี้');
    }
    if (budget && parseInt(budget.replace(/[^0-9]/g, '')) > 10000000) {
      weaknesses.push('โครงการมีขนาดใหญ่ อาจต้องการทรัพยากรมาก');
    }
    
    // สร้างคำแนะนำ
    let recommendation = '';
    if (fitScore >= 70) {
      recommendation = 'ควรเข้าร่วมประมูลโครงการนี้ เนื่องจากมีความเหมาะสมสูง';
    } else if (fitScore >= 50) {
      recommendation = 'สามารถเข้าร่วมประมูลได้ แต่ควรประเมินความเสี่ยงเพิ่มเติม';
    } else {
      recommendation = 'ไม่แนะนำให้เข้าร่วมประมูล เนื่องจากไม่สอดคล้องกับความเชี่ยวชาญ';
    }
    
    return {
      fitScore,
      strengths: strengths.length > 0 ? strengths : ['ไม่พบจุดแข็งที่โดดเด่น'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['ไม่พบจุดอ่อนที่ชัดเจน'],
      recommendation,
    };
  }
);

/**
 * เครื่องมือสำหรับประเมินคู่แข่งในการประมูลโครงการ
 */
export const analyzeCompetitors = ai.defineTool(
  {
    name: 'analyzeCompetitors',
    description: 'วิเคราะห์คู่แข่งที่อาจเข้าร่วมประมูลโครงการนี้',
    inputSchema: z.object({
      projectType: z.string().describe('ประเภทของโครงการ'),
      projectOwner: z.string().describe('เจ้าของโครงการ'),
      budget: z.string().describe('งบประมาณโครงการ'),
      location: z.string().optional().describe('สถานที่ตั้งโครงการ'),
    }),
    outputSchema: z.object({
      potentialCompetitors: z.array(z.object({
        name: z.string().describe('ชื่อบริษัทคู่แข่ง'),
        strengths: z.string().describe('จุดแข็งของคู่แข่ง'),
        weaknesses: z.string().describe('จุดอ่อนของคู่แข่ง'),
        winProbability: z.number().min(0).max(100).describe('โอกาสที่คู่แข่งจะชนะการประมูล (0-100)'),
      })),
      competitionLevel: z.enum(['สูง', 'ปานกลาง', 'ต่ำ']).describe('ระดับการแข่งขันโดยรวม'),
      strategicAdvice: z.string().describe('คำแนะนำเชิงกลยุทธ์ในการแข่งขัน'),
    }),
  },
  async ({ projectType, projectOwner, budget, location }) => {
    // ในสภาพแวดล้อมจริง คุณจะต้องมีฐานข้อมูลคู่แข่ง
    // และอาจใช้ AI เพื่อวิเคราะห์ข้อมูลอย่างละเอียด
    
    const isGovernment = projectOwner.toLowerCase().includes('รัฐ') || 
                        projectOwner.toLowerCase().includes('กรม') ||
                        projectOwner.toLowerCase().includes('เทศบาล');
    
    const budgetValue = budget ? parseInt(budget.replace(/[^0-9]/g, '')) : 0;
    const isLargeProject = budgetValue > 10000000;
    
    // ตัวอย่างคู่แข่งสมมติ ในระบบจริงควรมาจากฐานข้อมูล
    const competitors = [
      {
        name: 'บริษัท เอบีซี คอนสตรัคชัน จำกัด',
        governmentExperience: true,
        privateExperience: true,
        minProjectSize: 5000000,
        maxProjectSize: 100000000,
        specialties: ['ก่อสร้างอาคาร', 'ก่อสร้างโรงพยาบาล', 'ปรับปรุงอาคาร'],
        preferredLocations: ['กรุงเทพ', 'ปริมณฑล'],
      },
      {
        name: 'บริษัท ไทยเอ็นจิเนียริ่ง จำกัด',
        governmentExperience: true,
        privateExperience: false,
        minProjectSize: 20000000,
        maxProjectSize: 500000000,
        specialties: ['ก่อสร้างถนน', 'ก่อสร้างสะพาน', 'โครงสร้างพื้นฐาน'],
        preferredLocations: ['ทั่วประเทศ'],
      },
      {
        name: 'บริษัท โมเดิร์น เทคโนโลยี จำกัด',
        governmentExperience: false,
        privateExperience: true,
        minProjectSize: 1000000,
        maxProjectSize: 50000000,
        specialties: ['ติดตั้งระบบไอที', 'ติดตั้งระบบรักษาความปลอดภัย', 'ระบบอัจฉริยะ'],
        preferredLocations: ['กรุงเทพ', 'เชียงใหม่', 'ภูเก็ต'],
      },
    ];
    
    // กรองคู่แข่งที่น่าจะสนใจโครงการนี้
    const relevantCompetitors = competitors.filter(competitor => {
      // ตรวจสอบประสบการณ์การทำงานกับภาครัฐ/เอกชน
      if (isGovernment && !competitor.governmentExperience) return false;
      if (!isGovernment && !competitor.privateExperience) return false;
      
      // ตรวจสอบขนาดโครงการ
      if (budgetValue < competitor.minProjectSize || budgetValue > competitor.maxProjectSize) return false;
      
      // ตรวจสอบความเชี่ยวชาญ
      const hasRelevantSpecialty = competitor.specialties.some(specialty =>
        projectType.toLowerCase().includes(specialty.toLowerCase())
      );
      if (!hasRelevantSpecialty) return false;
      
      // ตรวจสอบพื้นที่ทำงาน (ถ้าระบุ)
      if (location && competitor.preferredLocations.indexOf('ทั่วประเทศ') === -1) {
        const worksInLocation = competitor.preferredLocations.some(loc =>
          location.toLowerCase().includes(loc.toLowerCase())
        );
        if (!worksInLocation) return false;
      }
      
      return true;
    });
    
    // แปลงข้อมูลเป็นรูปแบบที่ต้องการส่งคืน
    const potentialCompetitors = relevantCompetitors.map(competitor => {
      // วิเคราะห์จุดแข็ง จุดอ่อน และโอกาสชนะ
      let strengths = '';
      let weaknesses = '';
      let winProbability = 50;
      
      if (isGovernment && competitor.governmentExperience) {
        strengths += 'มีประสบการณ์การทำงานกับภาครัฐ ';
        winProbability += 15;
      }
      
      if (!isGovernment && competitor.privateExperience) {
        strengths += 'มีประสบการณ์การทำงานกับเอกชน ';
        winProbability += 15;
      }
      
      const relevantSpecialties = competitor.specialties.filter(specialty =>
        projectType.toLowerCase().includes(specialty.toLowerCase())
      );
      
      if (relevantSpecialties.length > 0) {
        strengths += `เชี่ยวชาญด้าน${relevantSpecialties.join(', ')} `;
        winProbability += relevantSpecialties.length * 5;
      }
      
      if (budgetValue > competitor.maxProjectSize * 0.8) {
        weaknesses += 'โครงการมีขนาดใหญ่เกือบเกินกำลัง ';
        winProbability -= 10;
      }
      
      if (budgetValue < competitor.minProjectSize * 1.2) {
        weaknesses += 'โครงการมีขนาดเล็กเกินไป อาจไม่คุ้มค่า ';
        winProbability -= 10;
      }
      
      if (!weaknesses) {
        weaknesses = 'ไม่พบจุดอ่อนที่ชัดเจน';
      }
      
      // ปรับให้โอกาสชนะอยู่ในช่วง 0-100
      winProbability = Math.max(0, Math.min(100, winProbability));
      
      return {
        name: competitor.name,
        strengths: strengths || 'ไม่พบจุดแข็งที่โดดเด่น',
        weaknesses,
        winProbability,
      };
    });
    
    // กำหนดระดับการแข่งขัน
    let competitionLevel = 'ต่ำ';
    if (relevantCompetitors.length >= 3) {
      competitionLevel = 'สูง';
    } else if (relevantCompetitors.length >= 1) {
      competitionLevel = 'ปานกลาง';
    }
    
    // สร้างคำแนะนำเชิงกลยุทธ์
    let strategicAdvice = '';
    if (competitionLevel === 'สูง') {
      strategicAdvice = 'มีการแข่งขันสูง ควรเน้นจุดแข็งเฉพาะและพิจารณาการเสนอราคาที่แข่งขันได้';
    } else if (competitionLevel === 'ปานกลาง') {
      strategicAdvice = 'มีคู่แข่งที่น่ากังวล ควรวิเคราะห์จุดอ่อนของคู่แข่งและนำเสนอจุดแข็งของตนเองอย่างชัดเจน';
    } else {
      strategicAdvice = 'มีคู่แข่งน้อย เป็นโอกาสดีในการเสนอราคาที่เหมาะสมและนำเสนอคุณภาพงานที่เหนือกว่า';
    }
    
    return {
      potentialCompetitors: potentialCompetitors.length > 0 ? potentialCompetitors : [],
      competitionLevel,
      strategicAdvice,
    };
  }
);

/**
 * เครื่องมือสำหรับค้นหาโครงการประมูลที่ตรงตามความต้องการ
 * ทำการค้นหาโดยละเอียดและกรองตามหลายเงื่อนไข
 */
export const searchAdvancedProjects = ai.defineTool(
  {
    name: 'searchAdvancedProjects',
    description: 'ค้นหาและกรองโครงการประมูลด้วยเงื่อนไขขั้นสูง',
    inputSchema: z.object({
      keywords: z.array(z.string()).describe('คำสำคัญในการค้นหา'),
      projectType: z.string().optional().describe('ประเภทของโครงการ'),
      minBudget: z.number().optional().describe('งบประมาณขั้นต่ำ'),
      maxBudget: z.number().optional().describe('งบประมาณสูงสุด'),
      location: z.string().optional().describe('พื้นที่โครงการ'),
      ownerType: z.enum(['รัฐบาล', 'เอกชน', 'ทั้งหมด']).optional().describe('ประเภทของเจ้าของโครงการ'),
    }),
    outputSchema: z.array(z.object({
      id: z.string(),
      name: z.string(),
      organization: z.string().nullable(),
      type: z.string().nullable(),
      budget: z.string().nullable(),
      address: z.string().nullable(),
      relevanceScore: z.number().describe('คะแนนความเกี่ยวข้อง (0-100)'),
    })),
  },
  async ({ keywords, projectType, minBudget, maxBudget, location, ownerType }) => {
    try {
      // เตรียมคำค้นหารวม
      const combinedQuery = keywords.join(' ');
      
      // ดึงโครงการทั้งหมด
      const allProjects = await listProjects({ query: combinedQuery });
      
      if (!allProjects || allProjects.length === 0) {
        return [];
      }
      
      // กรองและให้คะแนนโครงการ
      const scoredProjects = allProjects.map(project => {
        let relevanceScore = 0;
        
        // ตรวจสอบคำสำคัญ
        keywords.forEach(keyword => {
          if (project.name.toLowerCase().includes(keyword.toLowerCase())) {
            relevanceScore += 20;
          }
          if (project.organization && project.organization.toLowerCase().includes(keyword.toLowerCase())) {
            relevanceScore += 15;
          }
        });
        
        // ตรวจสอบประเภทโครงการ
        if (projectType && project.type && project.type.toLowerCase().includes(projectType.toLowerCase())) {
          relevanceScore += 25;
        }
        
        // ตรวจสอบงบประมาณ
        if (project.budget) {
          const budgetValue = parseInt(project.budget.replace(/[^0-9]/g, ''));
          if (minBudget && budgetValue >= minBudget) {
            relevanceScore += 15;
          }
          if (maxBudget && budgetValue <= maxBudget) {
            relevanceScore += 15;
          }
        }
        
        // ตรวจสอบสถานที่
        if (location && project.address && project.address.toLowerCase().includes(location.toLowerCase())) {
          relevanceScore += 20;
        }
        
        // ตรวจสอบประเภทเจ้าของโครงการ
        if (ownerType && ownerType !== 'ทั้งหมด') {
          const isGovernment = project.organization && 
                              (project.organization.toLowerCase().includes('กรม') ||
                               project.organization.toLowerCase().includes('รัฐ') ||
                               project.organization.toLowerCase().includes('เทศบาล') ||
                               project.organization.toLowerCase().includes('มหาวิทยาลัย'));
          
          if ((ownerType === 'รัฐบาล' && isGovernment) || 
              (ownerType === 'เอกชน' && !isGovernment)) {
            relevanceScore += 25;
          } else {
            relevanceScore -= 25; // ลดคะแนนถ้าไม่ตรงกับประเภทที่ต้องการ
          }
        }
        
        // ปรับคะแนนให้อยู่ในช่วง 0-100
        relevanceScore = Math.max(0, Math.min(100, relevanceScore));
        
        return {
          ...project,
          relevanceScore
        };
      });
      
      // กรองโครงการที่มีความเกี่ยวข้องน้อยเกินไป
      const filteredProjects = scoredProjects.filter(project => project.relevanceScore >= 30);
      
      // เรียงลำดับตามคะแนนความเกี่ยวข้อง
      return filteredProjects.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการค้นหาโครงการ:', error);
      return [];
    }
  }
);
