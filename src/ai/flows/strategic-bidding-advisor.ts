
'use server';
/**
 * @fileOverview The ultimate bidding strategy synthesis flow.
 * This is the "God of Bidding 2.0: The All-Knowing Auditor" orchestrator,
 * combining all analysis into a single, decisive strategic recommendation.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { generate } from 'genkit/ai';

// Import schemas and flows from our existing tools
import {
  summarizeDocumentFlow,
} from './summarize-document-flow';
import {
  analyzeBlueprintFlow,
} from './analyze-blueprint-flow';
import {
  forensicDocumentCheckFlow, // The new forensic auditor
  ForensicCheckOutputSchema,
} from './forensic-document-check';
import {
  analyzeProjectFit,
  analyzeCompetitors,
} from '@/ai/procurement/tools';
import { getHistoricalTorMaterialSpecs } from '@/services/analysis-data'; // Import historical data function

// == INPUT SCHEMA (Upgraded) ==

export const BiddingStrategyInputSchema = z.object({
  projectName: z.string().describe('ชื่อของโครงการประมูล'),
  
  documentSource: z.object({
    sourceType: z.enum(['url', 'text', 'file']),
    content: z.string(),
    mimeType: z.string().optional(),
  }).describe('แหล่งข้อมูลเอกสาร TOR หรือข้อกำหนด'),

  blueprintSource: z.object({
    sourceType: z.enum(['file']), 
    content: z.string().describe('Base64 encoded blueprint image/pdf'),
    mimeType: z.string().describe('e.g., image/png, application/pdf'),
  }).optional().describe('แหล่งข้อมูลแบบแปลน (ถ้ามี)'),

  // NEW: BOQ source
  boqSource: z.object({
      sourceType: z.enum(['file']), 
      content: z.string().describe('Base64 encoded BOQ file (e.g., text from a .txt or .csv)'),
      mimeType: z.string().describe('e.g., text/plain, text/csv'),
  }).optional().describe('แหล่งข้อมูล BOQ (ถ้ามี)'),

  companyCapabilities: z.object({
    expertise: z.array(z.string()),
    pastProjects: z.array(z.string()),
    resources: z.array(z.string()),
  }).describe('ข้อมูลความสามารถของบริษัทเรา'),

  competitors: z.array(z.object({
    name: z.string(),
    strengths: z.array(z.string()),
    pastWins: z.number(),
    pricing: z.enum(['aggressive', 'standard', 'premium']),
  })).optional().describe('ข้อมูลคู่แข่งที่คาดว่าจะเข้าร่วม (ถ้ามี)'),
});

// == OUTPUT SCHEMA (Upgraded) ==

export const BiddingStrategyOutputSchema = z.object({
  goNoGoRecommendation: z.enum(['GO', 'NO-GO']).describe('คำแนะนำสุดท้าย: ควรเข้าประมูลหรือไม่'),
  confidenceScore: z.number().min(0).max(100).describe('คะแนนความมั่นใจในการชนะ (0-100%)'),
  winningRationale: z.array(z.string()).describe('เหตุผลหลัก 3-5 ข้อว่าทำไมเราถึงจะชนะ'),
  optimalBidPrice: z.string().describe('ราคาประมูลที่เหมาะสมที่สุดที่ AI แนะนำ (เป็นช่วงราคาหรือตัวเลข)'),
  keyProposalThemes: z.array(z.string()).describe('ธีมหลักที่ควรเน้นในเอกสารเสนอราคา'),
  strategicSwotAnalysis: z.object({
    strengths: z.array(z.string()).describe('จุดแข็งเชิงกลยุทธ์ที่เชื่อมโยงข้อมูลทุกส่วน'),
    weaknesses: z.array(z.string()).describe('จุดอ่อนเชิงกลยุทธ์ที่ต้องระวัง'),
    opportunities: z.array(z.string()).describe('โอกาสที่ค้นพบจากการวิเคราะห์ข้อมูลทั้งหมด'),
    threats: z.array(z.string()).describe('อุปสรรคและความเสี่ยงที่สำคัญที่สุด'),
  }).describe('SWOT Analysis เชิงกลยุทธ์'),
  // NEW: Forensic report in the final output
  forensicCheckReport: ForensicCheckOutputSchema.optional().describe('รายงานผลการตรวจสอบความขัดแย้งของเอกสาร'),
});

// == ORCHESTRATION FLOW (Upgraded) ==

export const strategicBiddingAdvisorFlow = ai.defineFlow(
  {
    name: 'strategicBiddingAdvisorFlow',
    inputSchema: BiddingStrategyInputSchema,
    outputSchema: BiddingStrategyOutputSchema,
  },
  async (input) => {
    console.log(`[Bidding Advisor 2.0] Starting strategic synthesis for project: ${input.projectName}`);

    // --- PHASE 1: OMNISCIENCE (Gather all data in parallel) ---
    console.log('[Bidding Advisor 2.0] Phase 1: Omniscience - Gathering all data sources.');

    const [documentAnalysis, blueprintAnalysis, projectFit, competitorAnalysis] = await Promise.all([
      summarizeDocumentFlow(input.documentSource),
      input.blueprintSource 
        ? analyzeBlueprintFlow({ blueprintImage: input.blueprintSource.content, mimeType: input.blueprintSource.mimeType })
        : Promise.resolve(null),
      analyzeProjectFit({ 
        projectDetails: { name: input.projectName, type: 'Unknown', budget: 'Unknown', requirements: [] },
        companyCapabilities: input.companyCapabilities 
      }),
      input.competitors && input.competitors.length > 0
        ? analyzeCompetitors({ projectType: 'Unknown', competitors: input.competitors, yourCompanyStrengths: input.companyCapabilities.expertise })
        : Promise.resolve(null),
    ]);

    console.log('[Bidding Advisor 2.0] Phase 1 completed. Base data gathered.');

    // --- NEW PHASE: FORENSIC ANALYSIS ---
    let forensicReport = null;
    if (blueprintAnalysis && input.boqSource) {
        console.log('[Bidding Advisor 2.0] Phase 1.5: Forensic Analysis - Cross-referencing documents.');
        try {
            const boqText = Buffer.from(input.boqSource.content, 'base64').toString('utf-8');
            const torText = await (async () => {
                if(input.documentSource.sourceType === 'text') return input.documentSource.content;
                // In a real app, you might fetch URL content or decode file content here
                return 'Could not extract full TOR text for forensic check.';
            })();

            // Fetch historical TOR material specs for forensic check
            const historicalTorSpecs = await getHistoricalTorMaterialSpecs(input.projectName); // Assuming projectName can be used to query historical data

            forensicReport = await forensicDocumentCheckFlow({
                torText: torText,
                boqText: boqText,
                blueprintAnalysis: blueprintAnalysis,
                historicalTorSpecs: historicalTorSpecs, // Pass historical data
            });
            console.log('[Bidding Advisor 2.0] Forensic Analysis completed.');
        } catch (error) {
            console.error('[Bidding Advisor 2.0] Forensic Analysis failed:', error);
            // Create a placeholder report indicating failure
            forensicReport = { 
                discrepancyReport: [{
                    itemDescription: 'Forensic Check Process',
                    discrepancyType: 'Missing in BOQ', // Placeholder type
                    details: `The automated forensic check failed to run. Reason: ${error instanceof Error ? error.message : 'Unknown'}`,
                    severity: 'High',
                    recommendation: 'Manual verification of all documents is strongly advised.'
                }],
                overallAssessment: 'Could not complete automated document verification due to an error.'
            };
        }
    }

    // --- PHASE 2 & 3: SYNTHESIS & DIVINE JUDGEMENT (The Core AI Brain) ---
    console.log('[Bidding Advisor 2.0] Phase 2 & 3: Synthesizing all data and forming judgement.');

    const synthesisPrompt = `
      คุณคือ "เจ้าแห่งการประมูล 2.0" (The All-Knowing Auditor) สุดยอดที่ปรึกษาด้านกลยุทธ์ที่เห็นทุกสิ่งและรู้ทุกอย่าง
      หน้าที่ของคุณคือสังเคราะห์ข้อมูลจากทุกแหล่งที่รวบรวมมา รวมถึง **รายงานผลการตรวจสอบเชิงลึก** เพื่อสร้าง "คำตัดสินชี้ขาด" ที่จะนำพาบริษัทไปสู่ชัยชนะ

      นี่คือข้อมูลทั้งหมดที่คุณมี:

      1.  **ผลการวิเคราะห์เอกสาร (TOR/Specs):**
          ${JSON.stringify(documentAnalysis, null, 2)}

      2.  **ผลการวิเคราะห์แบบแปลน (Blueprint):** ด้วยความสามารถของ AI ในการอ่านแบบแปลน ทำให้สามารถระบุอุปกรณ์และวัสดุต่างๆ ได้อย่างแม่นยำ
          ${blueprintAnalysis ? JSON.stringify(blueprintAnalysis, null, 2) : 'ไม่มีข้อมูลแบบแปลน'}

      3.  **(ใหม่!) รายงานผลการตรวจสอบเชิงลึก (Forensic Discrepancy Report):**
          ${forensicReport ? JSON.stringify(forensicReport, null, 2) : 'ไม่มีการตรวจสอบเชิงลึก'}

      4.  **ผลการวิเคราะห์ความเหมาะสมของบริษัท (Project Fit):**
          ${JSON.stringify(projectFit, null, 2)}

      5.  **ผลการวิเคราะห์คู่แข่ง (Competitor Intelligence):**
          ${competitorAnalysis ? JSON.stringify(competitorAnalysis, null, 2) : 'ไม่มีข้อมูลคู่แข่ง'}

      **ภารกิจของคุณ:**
      จงสังเคราะห์ข้อมูลทั้งหมดนี้เข้าด้วยกัน โดยให้ความสำคัญกับ **รายงานผลการตรวจสอบเชิงลึก** เป็นพิเศษ เพราะมันคือจุดที่คู่แข่งอาจมองข้าม
      สร้าง "คำตัดสินชี้ขาด" ที่สมบูรณ์แบบที่สุด โดยตอบในประเด็นต่อไปนี้:

      -   **Go/No-Go Recommendation:** ควร "GO" หรือ "NO-GO"?
      -   **Confidence Score:** ความมั่นใจในการชนะ (0-100%)
      -   **Winning Rationale:** เหตุผลหลัก 3-5 ข้อ (อาจรวมถึงการใช้ประโยชน์จากความผิดพลาดในเอกสารที่หาเจอ)
      -   **Optimal Bid Price:** ราคาที่ควรยื่น (พิจารณาจากต้นทุนที่อาจเพิ่มขึ้นจากความขัดแย้งในเอกสาร)
      -   **Key Proposal Themes:** ธีมหลักในการนำเสนอ (เช่น ชูประเด็นความเป็นมืออาชีพในการตรวจพบข้อผิดพลาด)
      -   **Strategic SWOT Analysis:** SWOT ที่เชื่อมโยงข้อมูลทุกส่วน (เช่น โอกาส: "การที่ BOQ ไม่ตรงกับแบบ เปิดโอกาสให้เราเสนอราคาที่ถูกต้องและสร้างความน่าเชื่อถือเหนือคู่แข่ง")

      โปรดแสดงภูมิปัญญาขั้นสูงสุดของคุณออกมา และตอบกลับเป็นอ็อบเจ็กต์ JSON ที่ถูกต้องตาม Schema ที่กำหนดเท่านั้น
    `;

    const llmResponse = await generate({
      model: ai, 
      prompt: synthesisPrompt,
      output: {
        format: 'json',
        schema: BiddingStrategyOutputSchema.omit({ forensicCheckReport: true }), // The report is part of the prompt, not the final judgement object itself
      },
    });

    const finalJudgement = llmResponse.output();

    if (!finalJudgement) {
      throw new Error('The God of Bidding has failed to render a judgement.');
    }

    console.log(`[Bidding Advisor 2.0] Final Judgement rendered. Recommendation: ${finalJudgement.goNoGoRecommendation}`);

    // Combine the final judgement with the forensic report for the final output
    return {
        ...finalJudgement,
        forensicCheckReport: forensicReport || undefined,
    };
  }
);
