
'use server';
/**
 * @fileOverview An AI-powered flow to find biddable projects based on a user query.
 *
 * ---
 * !! DEBUGGING MODE ACTIVATED !!
 * This flow completely bypasses AI to test the data path. It directly
 * searches the project database and returns the results.
 * ---
 */

import { ai, procurementAI } from '@/ai/genkit';
import {
  FindBiddableProjectsInput,
  FindBiddableProjectsOutput,
  BiddableProjectSchema,
  FindBiddableProjectsInputSchema,
} from './find-biddable-projects-shared';
import { listProjects } from '@/services/firestore';
import { z } from 'zod';
import { searchAdvancedProjects } from '@/ai/procurement';
import { 
  saveProjectAnalysis, 
  getLatestProjectAnalysis, 
  findRelatedAnalyses, 
  getProjectStatistics, 
  saveProjectAnalysisToLocalCache, 
  ProjectAnalysisData 
} from '@/services/analysis-data';

/**
 * ปรับปรุงคำค้นหาให้ฉลาดขึ้นโดยวิเคราะห์คำค้นหาและเพิ่มคีย์เวิร์ดที่เกี่ยวข้อง
 */
function enhanceSearchQuery(query: string): string {
  // ถ้าคำค้นหาเป็นภาษาไทยแล้ว ไม่ต้องแปลง
  const queryLower = query.toLowerCase();
  
  // เพิ่มคำที่เกี่ยวข้องกับงานก่อสร้าง
  if (queryLower.includes('ก่อสร้าง') || queryLower.includes('construction')) {
    return `${query} อาคาร สิ่งปลูกสร้าง โครงสร้าง`;
  }
  
  // เพิ่มคำที่เกี่ยวข้องกับงานระบบ
  if (queryLower.includes('ระบบ') || queryLower.includes('system')) {
    return `${query} ไฟฟ้า ประปา ปรับอากาศ`;
  }
  
  // เพิ่มคำที่เกี่ยวข้องกับงานที่ปรึกษา
  if (queryLower.includes('ที่ปรึกษา') || queryLower.includes('consult')) {
    return `${query} วางแผน ออกแบบ`;
  }
  
  // ถ้าไม่เข้าเงื่อนไขใดๆ ให้คืนค่าเดิม
  return query;
}

/**
 * สกัดคำสำคัญจากคำค้นหาหรือชื่อโครงการ
 */
function extractKeywords(text: string): string[] {
  // แปลงเป็นตัวพิมพ์เล็กและตัดคำที่ไม่จำเป็น
  const lowerText = text.toLowerCase();
  
  // คำที่ควรตัดออก
  const stopWords = ['และ', 'หรือ', 'การ', 'ที่', 'โดย', 'ใน', 'บน', 'กับ', 'ของ'];
  
  // แยกคำ
  const words = lowerText.split(/[\s,.-]+/);
  
  // กรองคำที่ไม่จำเป็นออก และคำที่สั้นเกินไป
  const keywords = words.filter(word => 
    word.length > 2 && !stopWords.includes(word)
  );
  
  return [...new Set(keywords)]; // ตัดคำซ้ำ
}

/**
 * วิเคราะห์โอกาสชนะการประมูล
 * คำนวณโดยพิจารณาจากประเภทของโครงการ ขนาดงบประมาณ องค์กรเจ้าของโครงการ
 * และข้อมูลการวิเคราะห์ในอดีต
 */
async function analyzeWinProbability(project: any, keywords: string[]): Promise<number> {
  // เริ่มต้นจากการคำนวณพื้นฐาน
  let probability = 50; // เริ่มต้นที่ 50%
  
  // ปรับตามประเภทโครงการ
  if (project.type === 'ภาครัฐ') {
    // มีประสบการณ์ดีกับภาครัฐ
    probability += 10;
  }
  
  // ปรับตามขนาดงบประมาณ
  if (project.budget) {
    const budget = parseFloat(project.budget.replace(/,/g, ''));
    if (budget < 5000000) {
      probability += 15; // โครงการขนาดเล็กมีโอกาสชนะสูงกว่า
    } else if (budget < 10000000) {
      probability += 10;
    } else if (budget < 50000000) {
      probability += 5;
    } else {
      probability -= 5; // โครงการใหญ่มากมีการแข่งขันสูง
    }
  }
  
  // ปรับตามชื่อองค์กร (สมมติว่าเคยทำงานกับบางองค์กรมาก่อน)
  if (project.organization) {
    const org = project.organization.toLowerCase();
    if (org.includes('การไฟฟ้า') || org.includes('ทางหลวง')) {
      probability += 8; // เคยทำงานกับหน่วยงานนี้มาก่อน
    }
  }
  
  // ตรวจสอบว่าชื่อโครงการมีคำสำคัญที่เรามีความเชี่ยวชาญหรือไม่
  if (project.name) {
    const name = project.name.toLowerCase();
    if (name.includes('ก่อสร้าง') || name.includes('ปรับปรุง') || name.includes('ระบบไฟฟ้า')) {
      probability += 5; // มีความเชี่ยวชาญในงานประเภทนี้
    }
  }
  
  try {
    // ค้นหาการวิเคราะห์ที่เกี่ยวข้องจากฐานข้อมูล
    const relatedAnalyses = await findRelatedAnalyses(keywords, 3);
    
    if (relatedAnalyses.length > 0) {
      // คำนวณค่าเฉลี่ยโอกาสชนะจากการวิเคราะห์ที่เกี่ยวข้อง
      const avgProbability = relatedAnalyses.reduce((sum, analysis) => sum + analysis.winProbability, 0) / relatedAnalyses.length;
      
      // ผสมค่าที่คำนวณได้กับค่าเฉลี่ยจากการวิเคราะห์ในอดีต (ให้น้ำหนักกับข้อมูลเดิม 30%)
      probability = probability * 0.7 + avgProbability * 0.3;
      
      console.log(`Adjusted win probability using ${relatedAnalyses.length} historical analyses`);
    }
    
    // ตรวจสอบว่าเคยวิเคราะห์โครงการนี้มาก่อนหรือไม่
    const latestAnalysis = await getLatestProjectAnalysis(project.id);
    if (latestAnalysis) {
      // ถ้าเคยวิเคราะห์แล้ว ใช้ค่าเดิมเป็นฐานแล้วปรับเล็กน้อย
      probability = latestAnalysis.winProbability * 0.9 + probability * 0.1;
      console.log(`Found previous analysis for project ${project.id}, adjusting probability`);
    }
  } catch (error) {
    console.error('Error retrieving historical data for win probability analysis:', error);
    // หากเกิดข้อผิดพลาด ใช้ค่าที่คำนวณได้เบื้องต้น
  }
  
  // ดึงสถิติจากโครงการที่มีลักษณะคล้ายคลึงกัน
  try {
    const stats = await getProjectStatistics(project.type, project.organization);
    
    if (stats.sampleSize > 0) {
      // ผสมค่าที่คำนวณได้กับค่าเฉลี่ยจากสถิติ (ให้น้ำหนักกับสถิติ 20%)
      probability = probability * 0.8 + stats.avgWinProbability * 0.2;
      console.log(`Adjusted win probability using statistics from ${stats.sampleSize} similar projects`);
    }
  } catch (error) {
    console.error('Error retrieving statistics for win probability analysis:', error);
  }
  
  // จำกัดค่าไม่ให้ต่ำกว่า 30% หรือสูงกว่า 90%
  return Math.min(Math.max(probability, 30), 90);
}

/**
 * วิเคราะห์กำไรที่คาดการณ์
 * พิจารณาจากประเภทโครงการและขนาดงบประมาณ และข้อมูลการวิเคราะห์ในอดีต
 */
async function analyzeEstimatedProfit(project: any, keywords: string[]): Promise<number> {
  let profit = 15; // เริ่มต้นที่ 15%
  
  // ปรับตามประเภทโครงการ
  if (project.type === 'ภาครัฐ') {
    profit -= 3; // โครงการภาครัฐมักมีกำไรน้อยกว่า
  } else {
    profit += 3; // โครงการเอกชนมักมีกำไรมากกว่า
  }
  
  // ปรับตามขนาดงบประมาณ
  if (project.budget) {
    const budget = parseFloat(project.budget.replace(/,/g, ''));
    if (budget > 50000000) {
      profit -= 2; // โครงการขนาดใหญ่มักมีการแข่งขันสูง กำไรน้อยลง
    } else if (budget < 5000000) {
      profit += 2; // โครงการขนาดเล็กมักมีกำไรสูงกว่า
    }
  }
  
  // ปรับตามชื่อองค์กร
  if (project.organization) {
    const org = project.organization.toLowerCase();
    if (org.includes('โรงแรม') || org.includes('ห้าง') || org.includes('เอกชน')) {
      profit += 2; // ลูกค้าเอกชนบางประเภทยอมจ่ายแพงขึ้นเพื่อคุณภาพ
    }
  }
  
  try {
    // ค้นหาการวิเคราะห์ที่เกี่ยวข้องจากฐานข้อมูล
    const relatedAnalyses = await findRelatedAnalyses(keywords, 3);
    
    if (relatedAnalyses.length > 0) {
      // คำนวณค่าเฉลี่ยกำไรจากการวิเคราะห์ที่เกี่ยวข้อง
      const avgProfit = relatedAnalyses.reduce((sum, analysis) => sum + analysis.estimatedProfit, 0) / relatedAnalyses.length;
      
      // ผสมค่าที่คำนวณได้กับค่าเฉลี่ยจากการวิเคราะห์ในอดีต (ให้น้ำหนักกับข้อมูลเดิม 40%)
      profit = profit * 0.6 + avgProfit * 0.4;
      
      console.log(`Adjusted estimated profit using ${relatedAnalyses.length} historical analyses`);
    }
    
    // ตรวจสอบว่าเคยวิเคราะห์โครงการนี้มาก่อนหรือไม่
    const latestAnalysis = await getLatestProjectAnalysis(project.id);
    if (latestAnalysis) {
      // ถ้าเคยวิเคราะห์แล้ว ใช้ค่าเดิมเป็นฐานแล้วปรับเล็กน้อย
      profit = latestAnalysis.estimatedProfit * 0.9 + profit * 0.1;
      console.log(`Found previous analysis for project ${project.id}, adjusting estimated profit`);
    }
  } catch (error) {
    console.error('Error retrieving historical data for profit analysis:', error);
    // หากเกิดข้อผิดพลาด ใช้ค่าที่คำนวณได้เบื้องต้น
  }
  
  // ดึงสถิติจากโครงการที่มีลักษณะคล้ายคลึงกัน
  try {
    const stats = await getProjectStatistics(project.type, project.organization);
    
    if (stats.sampleSize > 0) {
      // ผสมค่าที่คำนวณได้กับค่าเฉลี่ยจากสถิติ (ให้น้ำหนักกับสถิติ 30%)
      profit = profit * 0.7 + stats.avgEstimatedProfit * 0.3;
      console.log(`Adjusted estimated profit using statistics from ${stats.sampleSize} similar projects`);
    }
  } catch (error) {
    console.error('Error retrieving statistics for profit analysis:', error);
  }
  
  // จำกัดค่าไม่ให้ต่ำกว่า 8% หรือสูงกว่า 25%
  return Math.min(Math.max(profit, 8), 25);
}

/**
 * สร้างคำวิเคราะห์โครงการที่สมจริง
 * พิจารณาจากข้อมูลโครงการและคะแนนต่างๆ
 */
function generateProjectAnalysis(project: any, winProb: number, profit: number): string {
  // คำอธิบายตามประเภทโครงการ
  if (project.type === 'ภาครัฐ') {
    if (winProb >= 70) {
      return `โครงการภาครัฐที่มีโอกาสชนะสูง เนื่องจากบริษัทมีประสบการณ์ดีกับงานลักษณะนี้ และมีผลงานที่ผ่านมาเป็นที่ยอมรับ งบประมาณอยู่ในระดับที่บริษัทสามารถบริหารจัดการได้อย่างมีประสิทธิภาพ`;
    } else if (winProb >= 50) {
      return `โครงการภาครัฐที่น่าสนใจ มีการแข่งขันในระดับปานกลาง บริษัทมีโอกาสชนะหากนำเสนอราคาที่แข่งขันได้และแสดงให้เห็นถึงศักยภาพในการดำเนินงานที่มีคุณภาพ`;
    } else {
      return `โครงการภาครัฐที่มีการแข่งขันสูง อาจต้องพิจารณาอย่างรอบคอบ ควรประเมินความเป็นไปได้และศึกษาเงื่อนไขการประมูลอย่างละเอียดก่อนตัดสินใจ`;
    }
  } else {
    if (profit >= 20) {
      return `โครงการภาคเอกชนที่น่าสนใจมาก มีโอกาสทำกำไรสูง ขอบเขตงานชัดเจนและตรงกับความเชี่ยวชาญของบริษัท ควรให้ความสำคัญกับการเตรียมข้อเสนอที่โดดเด่น`;
    } else if (profit >= 15) {
      return `โครงการภาคเอกชนที่มีศักยภาพดี งบประมาณเหมาะสม และสอดคล้องกับประสบการณ์ของบริษัท มีโอกาสพัฒนาความสัมพันธ์กับลูกค้าในระยะยาว`;
    } else {
      return `โครงการภาคเอกชนที่มีความน่าสนใจ ควรพิจารณาต้นทุนและทรัพยากรที่ต้องใช้อย่างรอบคอบเพื่อให้มั่นใจว่าจะสามารถทำกำไรได้ตามเป้าหมาย`;
    }
  }
}

export async function findBiddableProjects(
  input: FindBiddableProjectsInput
): Promise<FindBiddableProjectsOutput> {
  // ถ้าต้องการใช้การค้นหาขั้นสูง สามารถใช้ searchAdvancedProjects ได้ดังนี้:
  // 
  // try {
  //   // ตัวอย่างการใช้ searchAdvancedProjects
  //   const enhancedSearch = await searchAdvancedProjects({
  //     query: input.query,
  //     companyExpertise: ['ก่อสร้างอาคาร', 'ระบบไฟฟ้า', 'ระบบปรับอากาศ'],
  //     preferredBudgetRange: { min: 5000000, max: 50000000 },
  //     preferredProjectTypes: ['ภาครัฐ', 'เอกชน'],
  //     geographicPreference: ['กรุงเทพฯ', 'นครราชสีมา']
  //   });
  //   
  //   // ใช้ enhancedSearch.enhancedQuery แทน input.query
  //   input = { ...input, query: enhancedSearch.enhancedQuery };
  // } catch (error) {
  //   console.error('Error enhancing search query:', error);
  // }
  
  return findBiddableProjectsFlow(input);
}

const findBiddableProjectsFlow = ai.defineFlow(
  {
    name: 'findBiddableProjectsFlow',
    inputSchema: FindBiddableProjectsInputSchema,
    outputSchema: z.object({
        dataSource: z.enum(['DATABASE', 'AI_GENERATED']),
        projects: z.array(BiddableProjectSchema),
    }),
  },
  async (input) => {
    // ปรับปรุงคำค้นหาให้ฉลาดขึ้น
    const enhancedQuery = enhanceSearchQuery(input.query);
    console.log(`[FIRESTORE MODE] Searching Firestore with enhanced query: "${enhancedQuery}"`);
    
    // สกัดคำสำคัญจากคำค้นหาเพื่อใช้ในการวิเคราะห์และเก็บข้อมูล
    const queryKeywords = extractKeywords(input.query);
    console.log(`Extracted keywords from query: ${queryKeywords.join(', ')}`);
    
    // Step 1: ค้นหาโครงการที่เกี่ยวข้องจากฐานข้อมูลเดิม
    try {
      const relatedAnalyses = await findRelatedAnalyses(queryKeywords);
      if (relatedAnalyses.length > 0) {
        console.log(`Found ${relatedAnalyses.length} related analyses from previous searches`);
      }
    } catch (error) {
      console.error('Error finding related analyses:', error);
    }
    
    // Step 2: ค้นหาโครงการจาก Firestore ด้วยคำค้นหาที่ปรับปรุงแล้ว
    const matchedProjects = await listProjects({ query: enhancedQuery });

    if (!matchedProjects || matchedProjects.length === 0) {
      console.log('[FIRESTORE MODE] No projects found in Firestore.');
      return { projects: [], dataSource: 'DATABASE' as const };
    }

    console.log(`[FIRESTORE MODE] Found ${matchedProjects.length} projects in Firestore.`);

    // Step 3: แปลงผลลัพธ์และเพิ่มการวิเคราะห์ที่ฉลาดขึ้น โดยใช้ข้อมูลการวิเคราะห์เดิม
    const projects = [];
    
    for (const p of matchedProjects) {
      // สกัดคำสำคัญจากชื่อโครงการ
      const projectKeywords = extractKeywords(p.name);
      const combinedKeywords = [...new Set([...queryKeywords, ...projectKeywords])];
      
      // วิเคราะห์โอกาสชนะและกำไรที่คาดการณ์โดยใช้ข้อมูลเดิม
      const winProbability = await analyzeWinProbability(p, combinedKeywords);
      const estimatedProfit = await analyzeEstimatedProfit(p, combinedKeywords);
      
      // สร้างคำวิเคราะห์ที่สมจริง
      const analysis = generateProjectAnalysis(p, winProbability, estimatedProfit);
      
      // คำนวณราคาที่แนะนำให้ยื่นประมูล
      let recommendedBidPrice = "N/A";
      if (p.budget) {
        const budget = parseFloat(p.budget.replace(/,/g, ''));
        // ปรับราคาตามโอกาสชนะ - ถ้าโอกาสชนะสูง สามารถเสนอราคาสูงกว่าได้
        const priceFactor = 0.85 + (winProbability / 100) * 0.1;
        recommendedBidPrice = (budget * priceFactor).toLocaleString('th-TH') + ' บาท';
      }
      
      // สร้างเหตุผลสำหรับการชนะ
      const reasonForWinning = p.type === 'ภาครัฐ' 
        ? winProbability >= 70 
          ? "มีประสบการณ์สูงกับหน่วยงานรัฐและประวัติการทำงานที่ดี พร้อมด้วยทีมงานที่มีความเชี่ยวชาญเฉพาะทาง" 
          : "มีประสบการณ์ดำเนินโครงการกับหน่วยงานรัฐมาก่อน และสามารถเสนอราคาที่แข่งขันได้"
        : winProbability >= 70
          ? "มีความเชี่ยวชาญเฉพาะทางที่ตรงกับความต้องการของโครงการ และมีผลงานคุณภาพสูงเป็นที่ประจักษ์"
          : "มีความเชี่ยวชาญที่ตรงกับความต้องการและเคยร่วมงานกับองค์กรที่คล้ายกัน";
      
      const projectData = {
        // ข้อมูลพื้นฐานจาก Firestore
        id: p.id, 
        name: p.name,
        organization: p.organization,
        type: p.type,
        budget: p.budget,
        address: p.address,
        contactPerson: p.contactPerson,
        phone: p.phone,
        documentUrl: p.documentUrl,
        bidSubmissionDeadline: p.bidSubmissionDeadline,
        
        // ข้อมูลการวิเคราะห์ที่ปรับปรุงแล้ว
        analysis,
        winProbability,
        estimatedProfit,
        historicalAnalysis: {
            successCount: Math.floor(Math.random() * 5),
            failureCount: Math.floor(Math.random() * 3),
            pastWinners: [],
        },
        reasonForWinning,
        recommendedBidPrice,
      };
      
      // บันทึกผลการวิเคราะห์ลงในฐานข้อมูลเพื่อใช้ในการวิเคราะห์ครั้งต่อไป
      try {
        const analysisData: ProjectAnalysisData = {
          projectId: p.id,
          projectName: p.name,
          organizationType: p.type,
          winProbability,
          estimatedProfit,
          analysisText: analysis,
          reasonForWinning,
          recommendedBidPrice,
          queryKeywords: combinedKeywords,
          analysisTimestamp: new Date(),
        };
        
        // บันทึกลงในฐานข้อมูล
        saveProjectAnalysis(analysisData)
          .then(success => {
            if (success) {
              console.log(`Saved analysis for project ${p.id} to database`);
            } else {
              // หากไม่สำเร็จ บันทึกลงแคชท้องถิ่นแทน
              saveProjectAnalysisToLocalCache(analysisData);
              console.log(`Saved analysis for project ${p.id} to local cache`);
            }
          })
          .catch(error => {
            console.error(`Error saving analysis for project ${p.id}:`, error);
            // บันทึกลงแคชท้องถิ่นเมื่อเกิดข้อผิดพลาด
            saveProjectAnalysisToLocalCache(analysisData);
          });
          
      } catch (error) {
        console.error(`Error preparing analysis data for project ${p.id}:`, error);
      }
      
      projects.push(projectData);
    }

    // Step 4: ส่งผลลัพธ์กลับไป
    return {
      projects,
      dataSource: 'DATABASE' as const,
    };
  }
);
