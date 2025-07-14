'''
'use server';
/**
 * @fileOverview A new, intelligent flow that automates project discovery and in-depth analysis.
 * This flow orchestrates finding biddable projects and then summarizing their documents.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import {
  findBiddableProjects,
  FindBiddableProjectsInputSchema,
  BiddableProjectSchema,
} from './find-biddable-projects-shared';
import {
  summarizeDocumentFlow,
  DocumentSourceSchema,
  FinalAnalysisOutputSchema,
} from './summarize-document-flow';

// == SCHEMAS ==

// Combine the original project data with the new, detailed analysis
const AutomatedAnalysisResultSchema = BiddableProjectSchema.extend({
  detailedAnalysis: FinalAnalysisOutputSchema.optional().describe('ผลการวิเคราะห์เอกสารเชิงลึก (ถ้ามี)'),
  analysisError: z.string().optional().describe('ข้อผิดพลาดที่เกิดขึ้นระหว่างการวิเคราะห์เอกสาร'),
});

export const AutomatedProjectDiscoveryOutputSchema = z.object({
  projects: z.array(AutomatedAnalysisResultSchema),
});

// == FLOW ==

export const automatedProjectDiscoveryFlow = ai.defineFlow(
  {
    name: 'automatedProjectDiscoveryFlow',
    inputSchema: FindBiddableProjectsInputSchema, // Takes the same input as the original find flow
    outputSchema: AutomatedProjectDiscoveryOutputSchema,
  },
  async (input) => {
    console.log(`[Automated Flow] Starting discovery with query: "${input.query}"`);

    // Step 1: Find biddable projects using the existing flow
    const findResults = await findBiddableProjects(input);

    if (!findResults.projects || findResults.projects.length === 0) {
      console.log('[Automated Flow] No projects found. Ending flow.');
      return { projects: [] };
    }

    console.log(`[Automated Flow] Found ${findResults.projects.length} projects. Starting analysis loop.`);

    // Step 2: Analyze each project's document in parallel
    const analysisPromises = findResults.projects.map(async (project) => {
      // If there's no document URL, we can't analyze further.
      if (!project.documentUrl) {
        return {
          ...project,
          detailedAnalysis: undefined,
          analysisError: 'No document URL provided.',
        };
      }

      try {
        console.log(`[Automated Flow] Analyzing document for project: ${project.name}`);
        const documentSource: z.infer<typeof DocumentSourceSchema> = {
          sourceType: 'url',
          content: project.documentUrl,
        };

        // Run the summarization flow for the document
        const detailedAnalysis = await summarizeDocumentFlow(documentSource);

        return {
          ...project,
          detailedAnalysis: detailedAnalysis,
          analysisError: undefined,
        };
      } catch (error) {
        console.error(`[Automated Flow] Error analyzing document for project ${project.id}:`, error);
        return {
          ...project,
          detailedAnalysis: undefined,
          analysisError: error instanceof Error ? error.message : 'Unknown analysis error',
        };
      }
    });

    // Wait for all analyses to complete
    const analyzedProjects = await Promise.all(analysisPromises);

    console.log('[Automated Flow] Analysis loop completed.');

    // Step 3: Return the combined results
    return { projects: analyzedProjects };
  }
);
'''