
'use server';

/**
 * @fileOverview Analyzes bidding projects using AI to identify potential risks,
 * opportunities, and resource requirements.
 *
 * - analyzeBiddingProject - A function that analyzes a project specification.
 * - AnalyzeBiddingProjectInput - The input type for the analyzeBiddingProject function.
 * - AnalyzeBiddingProjectOutput - The return type for the analyzeBiddingProject function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getStockPrice } from '@/ai/tools';

const AnalyzeBiddingProjectInputSchema = z.object({
  projectSpecification: z
    .string()
    .describe('รายละเอียดข้อมูลจำเพาะของโครงการประมูล'),
});
export type AnalyzeBiddingProjectInput = z.infer<
  typeof AnalyzeBiddingProjectInputSchema
>;

const AnalyzeBiddingProjectOutputSchema = z.object({
  risks: z.array(z.string()).describe('ความเสี่ยงที่อาจเกิดขึ้นกับโครงการ'),
  opportunities: z
    .array(z.string())
    .describe('โอกาสที่เป็นไปได้ของโครงการ'),
  resourceRequirements: z
    .string()
    .describe('ทรัพยากรที่ต้องใช้โดยประมาณสำหรับโครงการ'),
  financialAnalysis: z.string().optional().describe('การวิเคราะห์ทางการเงินเพิ่มเติม รวมถึงราคาหุ้นของบริษัทที่เกี่ยวข้อง (ถ้ามี)'),
  overallAssessment: z
    .string()
    .describe('การประเมินภาพรวมของความเป็นไปได้และความสามารถในการทำกำไรของโครงการ'),
});
export type AnalyzeBiddingProjectOutput = z.infer<
  typeof AnalyzeBiddingProjectOutputSchema
>;

export async function analyzeBiddingProject(
  input: AnalyzeBiddingProjectInput
): Promise<AnalyzeBiddingProjectOutput> {
  return analyzeBiddingProjectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBiddingProjectPrompt',
  input: {schema: AnalyzeBiddingProjectInputSchema},
  output: {schema: AnalyzeBiddingProjectOutputSchema},
  tools: [getStockPrice],
  prompt: `คุณเป็นผู้จัดการโครงการผู้มีประสบการณ์ เชี่ยวชาญในการวิเคราะห์โครงการประมูล

  วิเคราะห์รายละเอียดโครงการที่ให้มาเพื่อระบุความเสี่ยง โอกาส ทรัพยากรที่ต้องการ และการประเมินโดยรวมของโครงการ ตอบกลับเป็นภาษาไทยเท่านั้น

  หากโครงการเกี่ยวข้องกับบริษัทมหาชน ให้ใช้เครื่องมือ \`getStockPrice\` เพื่อค้นหาราคาหุ้นปัจจุบัน และนำข้อมูลนั้นมาประกอบในส่วน \`financialAnalysis\`

  รายละเอียดโครงการ: {{{projectSpecification}}}

  จัดรูปแบบการตอบกลับของคุณเป็นอ็อบเจ็กต์ JSON ที่มีคีย์ต่อไปนี้:

  - risks: รายการความเสี่ยงที่อาจเกิดขึ้นกับโครงการ
  - opportunities: รายการโอกาสที่เป็นไปได้ของโครงการ
  - resourceRequirements: ทรัพยากรที่ต้องใช้โดยประมาณสำหรับโครงการ
  - financialAnalysis: (ถ้ามี) การวิเคราะห์ทางการเงินโดยใช้ข้อมูลราคาหุ้น
  - overallAssessment: การประเมินภาพรวมของความเป็นไปได้และความสามารถในการทำกำไรของโครงการ
  `,
});

const analyzeBiddingProjectFlow = ai.defineFlow(
  {
    name: 'analyzeBiddingProjectFlow',
    inputSchema: AnalyzeBiddingProjectInputSchema,
    outputSchema: AnalyzeBiddingProjectOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
