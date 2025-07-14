'''/**
 * @fileOverview เครื่องมือ AI เฉพาะทางสำหรับการวิเคราะห์โครงการประมูล
 * ไฟล์นี้รวมเครื่องมือต่างๆ ที่ช่วยในการวิเคราะห์โครงการประมูลอย่างลึกซึ้ง
 * เพื่อให้ AI สามารถให้คำแนะนำที่มีประสิทธิภาพมากขึ้น
 */

import { z } from 'genkit';
import { generate } from 'genkit/ai';
import { procurementAI } from '@/ai/genkit';

/**
 * วิเคราะห์ความเหมาะสมของโครงการกับความสามารถของบริษัท (ปรับปรุงใหม่)
 * ใช้ LLM ในการวิเคราะห์เชิงลึกแบบ SWOT Analysis เพื่อให้คำแนะนำที่ละเอียดและมีคุณภาพสูง
 */
export const analyzeProjectFit = procurementAI.defineTool(
  {
    name: 'analyzeProjectFit',
    description: 'วิเคราะห์ความเหมาะสมของโครงการกับความสามารถของบริษัท (ปรับปรุงใหม่)',
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
      swotAnalysis: z.object({
        strengths: z.array(z.string()).describe('จุดแข็ง (Strengths) ของบริษัทที่สอดคล้องกับโครงการ'),
        weaknesses: z.array(z.string()).describe('จุดอ่อน (Weaknesses) ที่อาจเป็นอุปสรรค'),
        opportunities: z.array(z.string()).describe('โอกาส (Opportunities) จากการทำโครงการนี้'),
        threats: z.array(z.string()).describe('อุปสรรค (Threats) หรือความเสี่ยงที่อาจเกิดขึ้น'),
      }).describe('การวิเคราะห์ SWOT'),
      recommendation: z.string().describe('คำแนะนำโดยรวมและกลยุทธ์ในการเข้าร่วมประมูล'),
    }),
  },
  async ({ projectDetails, companyCapabilities }) => {
    const prompt = `
      ในฐานะที่ปรึกษาโครงการผู้เชี่ยวชาญ, โปรดวิเคราะห์ความเหมาะสมของโครงการต่อไปนี้กับความสามารถของบริษัทที่ให้มา

      **รายละเอียดโครงการ:**
      - **ชื่อ:** ${projectDetails.name}
      - **ประเภท:** ${projectDetails.type}
      - **งบประมาณ:** ${projectDetails.budget}
      - **ข้อกำหนดหลัก:**
        - ${projectDetails.requirements.join('
        - ')}

      **ความสามารถของบริษัท:**
      - **ความเชี่ยวชาญ:** ${companyCapabilities.expertise.join(', ')}
      - **โครงการในอดีต:** ${companyCapabilities.pastProjects.join(', ')}
      - **ทรัพยากร:** ${companyCapabilities.resources.join(', ')}

      **ดำเนินการวิเคราะห์ดังนี้:**
      1.  **ให้คะแนนความเหมาะสม (Fit Score):** ประเมินจาก 0-100 ว่าโครงการนี้เหมาะสมกับบริษัทเพียงใด
      2.  **วิเคราะห์ SWOT:**
          - **Strengths:** จุดแข็งของบริษัทที่ทำให้ได้เปรียบในโครงการนี้คืออะไร?
          - **Weaknesses:** จุดอ่อนหรือข้อเสียเปรียบของบริษัทมีอะไรบ้าง?
          - **Opportunities:** โครงการนี้สร้างโอกาสอะไรให้บริษัทได้บ้าง (เช่น ต่อยอดธุรกิจ, สร้างชื่อเสียง)?
          - **Threats:** มีความเสี่ยงหรืออุปสรรคอะไรที่ต้องระวังบ้าง?
      3.  **ให้คำแนะนำ (Recommendation):** สรุปว่าบริษัทควรเข้าร่วมประมูลหรือไม่ และถ้าควรเข้าร่วม ควรใช้กลยุทธ์อะไร?

      โปรดตอบกลับในรูปแบบ JSON ที่ตรงกับ outputSchema เท่านั้น
    `;

    const llmResponse = await generate({
      model: procurementAI,
      prompt: prompt,
      output: {
        format: 'json',
        schema: z.object({
          fitScore: z.number().min(0).max(100),
          swotAnalysis: z.object({
            strengths: z.array(z.string()),
            weaknesses: z.array(z.string()),
            opportunities: z.array(z.string()),
            threats: z.array(z.string()),
          }),
          recommendation: z.string(),
        }),
      },
    });

    return llmResponse.output() || {
      fitScore: 0,
      swotAnalysis: {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      },
      recommendation: 'ไม่สามารถวิเคราะห์ข้อมูลได้',
    };
  }
);

/**
 * วิเคราะห์คู่แข่งในการประมูลโครงการ (ปรับปรุงใหม่)
 * ใช้ LLM ในการประเมินคู่แข่งและสร้างกลยุทธ์การแข่งขันที่ซับซ้อนและมีประสิทธิภาพ
 */
export const analyzeCompetitors = procurementAI.defineTool(
  {
    name: 'analyzeCompetitors',
    description: 'วิเคราะห์คู่แข่งในการประมูลโครงการ (ปรับปรุงใหม่)',
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
        threatLevel: z.number().min(1).max(10).describe('ระดับการคุกคาม (1-10)'),
        counterStrategy: z.string().describe('กลยุทธ์การแข่งขันที่แนะนำเพื่อเอาชนะคู่แข่งรายนี้'),
      })).describe('การวิเคราะห์คู่แข่งแต่ละราย'),
      overallThreat: z.number().min(1).max(10).describe('ระดับการคุกคามโดยรวม (1-10)'),
      recommendedStrategy: z.string().describe('กลยุทธ์ภาพรวมที่แนะนำในการเอาชนะคู่แข่งทั้งหมด'),
    }),
  },
  async ({ projectType, competitors, yourCompanyStrengths }) => {
    const prompt = `
      ในฐานะนักวิเคราะห์กลยุทธ์การแข่งขัน, โปรดวิเคราะห์คู่แข่งในการประมูลโครงการประเภท "${projectType}"

      **จุดแข็งของบริษัทเรา:** ${yourCompanyStrengths.join(', ')}

      **ข้อมูลคู่แข่ง:**
      ${competitors.map(c => `
      - **บริษัท:** ${c.name}
        - **จุดแข็ง:** ${c.strengths.join(', ')}
        - **ชนะในอดีต:** ${c.pastWins} โครงการ
        - **กลยุทธ์ราคา:** ${c.pricing}
      `).join('')}

      **ดำเนินการวิเคราะห์ดังนี้:**
      1.  **วิเคราะห์คู่แข่งแต่ละราย:**
          - **ประเมินระดับการคุกคาม (Threat Level):** ให้คะแนน 1-10
          - **สร้างกลยุทธ์ตอบโต้ (Counter Strategy):** แนะนำกลยุทธ์ที่เฉพาะเจาะจงเพื่อเอาชนะคู่แข่งรายนี้ โดยพิจารณาจากจุดแข็งของเราและจุดอ่อนของคู่แข่ง
      2.  **ประเมินระดับการคุกคามโดยรวม (Overall Threat):** ให้คะแนน 1-10
      3.  **สร้างกลยุทธ์ภาพรวม (Recommended Strategy):** แนะนำกลยุทธ์ที่ดีที่สุดในการแข่งขันกับคู่แข่งทั้งหมดในโครงการนี้

      โปรดตอบกลับในรูปแบบ JSON ที่ตรงกับ outputSchema เท่านั้น
    `;

    const llmResponse = await generate({
      model: procurementAI,
      prompt: prompt,
      output: {
        format: 'json',
        schema: z.object({
          competitorAnalysis: z.array(z.object({
            competitor: z.string(),
            threatLevel: z.number().min(1).max(10),
            counterStrategy: z.string(),
          })),
          overallThreat: z.number().min(1).max(10),
          recommendedStrategy: z.string(),
        }),
      },
    });

    return llmResponse.output() || {
      competitorAnalysis: [],
      overallThreat: 0,
      recommendedStrategy: 'ไม่สามารถวิเคราะห์ข้อมูลได้',
    };
  }
);

/**
 * ค้นหาโครงการที่เหมาะสมแบบขั้นสูง (ปรับปรุงใหม่)
 * ใช้ LLM ในการขยายความและแนะนำคำค้นหาเพิ่มเติมเพื่อเพิ่มโอกาสในการเจอโครงการที่ตรงความต้องการ
 */
export const searchAdvancedProjects = procurementAI.defineTool(
  {
    name: 'searchAdvancedProjects',
    description: 'ค้นหาโครงการที่เหมาะสมแบบขั้นสูง (ปรับปรุงใหม่)',
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
      enhancedQuery: z.string().describe('คำค้นหาที่ปรับปรุงแล้วสำหรับใช้แสดงผล'),
      searchParams: z.object({
        keywords: z.array(z.string()).describe('คำสำคัญหลักที่สกัดได้'),
        suggestedKeywords: z.array(z.string()).describe('คำสำคัญเพิ่มเติมที่ AI แนะนำ'),
        filters: z.array(z.object({
          field: z.string().describe('ชื่อฟิลด์'),
          value: z.string().describe('ค่าที่ใช้กรอง'),
        })).describe('ตัวกรองที่แนะนำ'),
      }).describe('พารามิเตอร์การค้นหาที่ปรับปรุงแล้ว'),
    }),
  },
  async ({ query, companyExpertise, preferredBudgetRange, preferredProjectTypes, geographicPreference }) => {
    const prompt = `
      ในฐานะผู้เชี่ยวชาญด้านการค้นหาข้อมูล, โปรดปรับปรุงและขยายความคำค้นหาโครงการเพื่อให้ได้ผลลัพธ์ที่ดีที่สุด

      **ข้อมูลจากผู้ใช้:**
      - **คำค้นหา:** "${query}"
      - **ความเชี่ยวชาญบริษัท:** ${companyExpertise.join(', ')}
      - **งบประมาณ:** ${preferredBudgetRange.min ? `ตั้งแต่ ${preferredBudgetRange.min.toLocaleString()} บาท` : ''} ${preferredBudgetRange.max ? `ถึง ${preferredBudgetRange.max.toLocaleString()} บาท` : ''}
      - **ประเภทโครงการ:** ${preferredProjectTypes?.join(', ') || 'ไม่ระบุ'}
      - **พื้นที่:** ${geographicPreference?.join(', ') || 'ไม่ระบุ'}

      **ดำเนินการดังนี้:**
      1.  **สกัดคำสำคัญหลัก (Keywords):** จากคำค้นหาและความเชี่ยวชาญ
      2.  **แนะนำคำสำคัญเพิ่มเติม (Suggested Keywords):** แนะนำคำค้นหาที่เกี่ยวข้องหรือคำที่มีความหมายใกล้เคียงกับความเชี่ยวชาญ เพื่อขยายขอบเขตการค้นหา
      3.  **สร้างคำค้นหาที่ปรับปรุงแล้ว (Enhanced Query):** สร้างประโยคคำค้นหาที่สมบูรณ์สำหรับแสดงผล
      4.  **สร้างตัวกรอง (Filters):** สำหรับใช้กับระบบค้นหา

      โปรดตอบกลับในรูปแบบ JSON ที่ตรงกับ outputSchema เท่านั้น
    `;

    const llmResponse = await generate({
      model: procurementAI,
      prompt: prompt,
      output: {
        format: 'json',
        schema: z.object({
          enhancedQuery: z.string(),
          searchParams: z.object({
            keywords: z.array(z.string()),
            suggestedKeywords: z.array(z.string()),
            filters: z.array(z.object({
              field: z.string(),
              value: z.string(),
            })),
          }),
        }),
      },
    });

    // Fallback ในกรณีที่ LLM ไม่สามารถสร้างผลลัพธ์ได้
    if (!llmResponse.output()) {
      const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2);
      const expertiseKeywords = companyExpertise.flatMap(exp => exp.toLowerCase().split(' '));
      const allKeywords = [...new Set([...keywords, ...expertiseKeywords])];
      const filters = [];
      if (preferredProjectTypes && preferredProjectTypes.length > 0) {
        filters.push({ field: 'type', value: preferredProjectTypes.join(',') });
      }
      if (geographicPreference && geographicPreference.length > 0) {
        filters.push({ field: 'address', value: geographicPreference.join(',') });
      }
      return {
        enhancedQuery: query,
        searchParams: {
          keywords: allKeywords,
          suggestedKeywords: [],
          filters,
        },
      };
    }

    return llmResponse.output();
  }
);
''
