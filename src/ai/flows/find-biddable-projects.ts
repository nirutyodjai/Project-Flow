
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

import { ai } from '@/ai/genkit';
import {
  FindBiddableProjectsInput,
  FindBiddableProjectsOutput,
  BiddableProjectSchema,
  FindBiddableProjectsInputSchema,
} from './find-biddable-projects-shared';
import { listProjects } from '@/services/firestore';
import { z } from 'zod';

export async function findBiddableProjects(
  input: FindBiddableProjectsInput
): Promise<FindBiddableProjectsOutput> {
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
    console.log(`[FIRESTORE MODE] Searching Firestore directly for: "${input.query}"`);
    
    // Step 1: Directly call the Firestore service with the user's query.
    const matchedProjects = await listProjects({ query: input.query });

    if (!matchedProjects || matchedProjects.length === 0) {
      console.log('[FIRESTORE MODE] No projects found in Firestore.');
      return { projects: [], dataSource: 'DATABASE' as const };
    }

    console.log(`[FIRESTORE MODE] Found ${matchedProjects.length} projects in Firestore.`);

    // Step 2: Map the direct results to the final output schema.
    const results: FindBiddableProjectsOutput = {
      projects: matchedProjects.map(p => ({
        // Spread the original project data from Firestore
        id: p.id, 
        name: p.name,
        organization: p.organization,
        type: p.type,
        budget: p.budget,
        address: p.address,
        contactPerson: p.contactPerson,
        phone: p.phone,
        documentUrl: p.documentUrl,
        
        // Generate realistic analysis data (in a real implementation this would be AI-generated)
        analysis: p.type === 'ภาครัฐ' 
          ? `โครงการจากภาครัฐที่มีโอกาสสูงสำหรับการเข้าประมูล บริษัทมีประสบการณ์ที่ดีกับงานลักษณะนี้` 
          : `โครงการภาคเอกชนที่น่าสนใจ มีขอบเขตงานที่ชัดเจนและงบประมาณที่เหมาะสม`,
        winProbability: Math.floor(Math.random() * 40) + 40, // 40-80%
        estimatedProfit: Math.floor(Math.random() * 20) + 10, // 10-30%
        historicalAnalysis: {
            successCount: Math.floor(Math.random() * 5),
            failureCount: Math.floor(Math.random() * 3),
            pastWinners: [],
        },
        reasonForWinning: p.type === 'ภาครัฐ' 
          ? "มีประสบการณ์ดำเนินโครงการกับหน่วยงานรัฐมาก่อน และสามารถเสนอราคาที่แข่งขันได้" 
          : "มีความเชี่ยวชาญเฉพาะทาง และเคยร่วมงานกับองค์กรที่คล้ายกัน",
        recommendedBidPrice: p.budget 
          ? (parseFloat(p.budget.replace(/,/g, '')) * 0.9).toLocaleString('th-TH') + ' บาท' 
          : "N/A",
      })),
      dataSource: 'DATABASE' as const,
    };

    return results;
  }
);
