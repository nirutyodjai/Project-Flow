
import { z } from 'genkit';

// This is the most specific schema for a project that has been fully analyzed by the AI.
export const BiddableProjectSchema = z.object({
  // Data from the original source
  id: z.string().describe('The unique identifier for the project'), // <<<< ADDED THIS LINE
  name: z.string().describe('ชื่อโครงการ'),
  organization: z.string().nullable().describe('หน่วยงานเจ้าของโครงการ'),
  type: z.string().nullable().describe('ประเภทของโครงการ (ภาครัฐ หรือ เอกชน)'),
  budget: z.string().nullable().describe('งบประมาณของโครงการ'),
  address: z.string().nullable().describe('ที่ตั้งของโครงการ'),
  contactPerson: z.string().nullable().describe('บุคคลที่สามารถติดต่อได้'),
  phone: z.string().nullable().describe('เบอร์โทรศัพท์ติดต่อ'),
  documentUrl: z.string().nullable().describe('URL สำหรับดาวน์โหลดเอกสารโครงการ'),
  bidSubmissionDeadline: z.string().nullable().describe('วันที่และเวลาสิ้นสุดการยื่นซองประมูล (ISO 8601 format)'),

  // AI-generated analysis
  analysis: z.string().describe('บทวิเคราะห์สั้นๆ ว่าทำไมโครงการนี้จึงน่าสนใจสำหรับบริษัท'),
  winProbability: z.number().min(0).max(100).describe('เปอร์เซ็นต์โอกาสชนะการประมูล (0-100)'),
  estimatedProfit: z.number().min(0).max(100).describe('เปอร์เซ็นต์กำไรที่คาดการณ์ (0-100)'),
  historicalAnalysis: z.object({
      successCount: z.number().describe('จำนวนครั้งที่เคยชนะการประมูลจากหน่วยงานนี้'),
      failureCount: z.number().describe('จำนวนครั้งที่เคยแพ้การประมูลจากหน่วยงานนี้'),
      pastWinners: z.array(z.object({
          contractorName: z.string().describe('ชื่อบริษัทที่เคยชนะ'),
          reasonForWinning: z.string().describe('เหตุผลที่ชนะ (โดยสรุป)')
      })).describe('รายชื่อผู้ชนะในอดีต (ถ้ามี)')
  }).describe('การวิเคราะห์ข้อมูลการประมูลในอดีตกับหน่วยงานนี้'),
  reasonForWinning: z.string().describe('สรุปเหตุผลหลักที่คาดว่าจะทำให้ชนะการประมูลนี้'),
  recommendedBidPrice: z.string().describe('ราคาที่ AI แนะนำให้ยื่นประมูล'),
});


export const FindBiddableProjectsInputSchema = z.object({
  query: z.string().describe('The user query for the types of projects to find.'),
});
export type FindBiddableProjectsInput = z.infer<typeof FindBiddableProjectsInputSchema>;

export const FindBiddableProjectsOutputSchema = z.object({
  dataSource: z.enum(['DATABASE', 'AI_GENERATED']).describe('Indicates whether the data came from the database or was generated by AI.'),
  projects: z.array(BiddableProjectSchema).describe('A list of biddable projects.'),
});
export type FindBiddableProjectsOutput = z.infer<typeof FindBiddableProjectsOutputSchema>;
