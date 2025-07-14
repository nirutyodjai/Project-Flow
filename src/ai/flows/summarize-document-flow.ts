'''
'use server';
/**
 * @fileOverview A multi-step flow to analyze and summarize documents from various sources.
 * This flow is designed to be more intelligent by breaking down the analysis process.
 */
import { z } from 'zod';
import { ai, procurementAI } from '@/ai/genkit';
import { web_fetch } from 'genkit/tools';
import { saveTorMaterialSpecifications } from '@/services/analysis-data'; // Import the new save function

// == SCHEMAS ==

export const DocumentSourceSchema = z.object({
  sourceType: z.enum(['url', 'text', 'file']).describe('ประเภทของแหล่งข้อมูล'),
  content: z.string().describe('เนื้อหาข้อมูล (URL, ข้อความ, หรือ base64 encoded file)'),
  mimeType: z.string().optional().describe('MIME type ของไฟล์ (จำเป็นสำหรับ source 'file')'),
});

export const DocumentSummarySchema = z.object({
  projectName: z.string().describe('ชื่อโครงการโดยสรุป'),
  projectType: z.string().describe('ประเภทของโครงการ'),
  budget: z.string().optional().describe('งบประมาณ (ถ้ามี)'),
  overallSummary: z.string().describe('สรุปภาพรวมของเอกสาร'),
});

// NEW: Schema for extracted material specifications
export const MaterialSpecificationSchema = z.object({
  itemName: z.string().describe('ชื่อวัสดุหรืออุปกรณ์'),
  brandModel: z.string().optional().describe('ยี่ห้อ/รุ่น (ถ้ามี)'),
  quantity: z.string().optional().describe('ปริมาณ/จำนวน (ถ้ามี)'),
  unit: z.string().optional().describe('หน่วยนับ (ถ้ามี)'),
  torPage: z.string().optional().describe('หน้าที่พบใน TOR (ถ้ามี)'),
  specDetails: z.string().optional().describe('รายละเอียดสเปคเพิ่มเติม'),
});

export const DetailedAnalysisSchema = z.object({
  scopeOfWork: z.array(z.string()).describe('ขอบเขตงานโดยละเอียด'),
  keyRequirements: z.array(z.string()).describe('คุณสมบัติสำคัญที่ผู้ยื่นข้อเสนอต้องมี'),
  risksAndOpportunities: z.array(z.string()).describe('การประเมินความเสี่ยงและโอกาส'),
  deadlines: z.array(z.string()).describe('กำหนดการที่สำคัญทั้งหมด'),
  // NEW: Extracted material specifications
  extractedMaterialSpecifications: z.array(MaterialSpecificationSchema).optional().describe('รายการวัสดุและอุปกรณ์ที่สกัดจาก TOR พร้อมสเปค'),
});

export const FinalAnalysisOutputSchema = DocumentSummarySchema.merge(DetailedAnalysisSchema);

// == TOOLS ==

const extractTextFromSource = ai.defineTool(
  {
    name: 'extractTextFromSource',
    description: 'ดึงข้อความจากแหล่งข้อมูลต่างๆ (URL, Text, File) เพื่อนำไปวิเคราะห์ต่อ',
    inputSchema: DocumentSourceSchema,
    outputSchema: z.object({ extractedText: z.string() }),
  },
  async (input) => {
    if (input.sourceType === 'url') {
      console.log(`Fetching content from URL: ${input.content}`);
      const response = await web_fetch({ url: input.content });
      return { extractedText: response.content };
    }
    if (input.sourceType === 'text') {
      return { extractedText: input.content };
    }
    if (input.sourceType === 'file' && input.mimeType) {
      // In a real scenario, you would process the base64 content.
      // For now, we'll assume it's text-based for simplicity.
      const textContent = Buffer.from(input.content, 'base64').toString('utf-8');
      return { extractedText: textContent };
    }
    throw new Error('Unsupported source type or missing mimeType for file.');
  }
);

// == PROMPTS ==

const summarizePrompt = procurementAI.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: { schema: z.object({ documentText: z.string() }) },
  output: { schema: DocumentSummarySchema },
  prompt: `คุณคือผู้ช่วยวิเคราะห์ข้อมูล สรุปภาพรวมเบื้องต้นจากข้อความที่ให้มานี้:

    --- DOCUMENT TEXT ---
    ${(input) => input.documentText}
    --- END DOCUMENT TEXT ---

    โปรดสรุปข้อมูลสำคัญเบื้องต้นตาม Schema ที่กำหนดให้`,
});

const deepAnalysisPrompt = procurementAI.definePrompt({
  name: 'deepAnalysisPrompt',
  input: { schema: z.object({ documentText: z.string(), initialSummary: DocumentSummarySchema }) },
  output: { schema: DetailedAnalysisSchema },
  prompt: `คุณคือผู้เชี่ยวชาญด้านการวิเคราะห์เอกสารประกวดราคา (TOR)
    จากข้อมูลสรุปเบื้องต้นและเนื้อหาเอกสารทั้งหมด, โปรดวิเคราะห์ในประเด็นต่อไปนี้อย่างละเอียด:

    **สรุปเบื้องต้น:**
    - ชื่อโครงการ: ${(input) => input.initialSummary.projectName}
    - ประเภท: ${(input) => input.initialSummary.projectType}
    - สรุป: ${(input) => input.initialSummary.overallSummary}

    **เนื้อหาเอกสารทั้งหมด:**
    ${(input) => input.documentText}

    **ประเด็นที่ต้องวิเคราะห์เชิงลึก:**
    1.  **Scope of Work:** ขอบเขตงานทั้งหมดมีอะไรบ้าง? ลิสต์ออกมาเป็นข้อๆ
    2.  **Key Requirements:** คุณสมบัติที่จำเป็นของผู้ยื่นข้อเสนอคืออะไร?
    3.  **Risks and Opportunities:** มีความเสี่ยงหรือโอกาสอะไรในโครงการนี้บ้าง?
    4.  **Deadlines:** กำหนดการสำคัญมีอะไรบ้าง?
    5.  **Extracted Material Specifications:** สกัดรายการวัสดุและอุปกรณ์ทั้งหมดที่ระบุใน TOR พร้อมรายละเอียดสเปค, ยี่ห้อ/รุ่น, ปริมาณ (ถ้ามี) และหน้าที่พบ

    โปรดตอบกลับเป็นภาษาไทยและจัดรูปแบบผลลัพธ์เป็น JSON ที่ถูกต้องตาม Schema ที่กำหนด`,
});

// == FLOW ==

export const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: DocumentSourceSchema,
    outputSchema: FinalAnalysisOutputSchema,
  },
  async (input) => {
    // Step 1: Extract text from the source
    const { extractedText } = await extractTextFromSource(input);

    // Step 2: Generate initial summary
    const summaryResponse = await summarizePrompt({ documentText: extractedText });
    const initialSummary = summaryResponse.output()!;

    // Step 3: Perform deep dive analysis using the initial summary as context
    const analysisResponse = await deepAnalysisPrompt({
      documentText: extractedText,
      initialSummary: initialSummary,
    });
    const detailedAnalysis = analysisResponse.output()!;

    // Step 4: Combine and return the final result
    const finalResult = {
      ...initialSummary,
      ...detailedAnalysis,
    };

    // NEW: Save extracted material specifications to historical data
    if (finalResult.extractedMaterialSpecifications && finalResult.extractedMaterialSpecifications.length > 0) {
      // Generate a unique ID for this TOR analysis to link historical specs
      const torAnalysisId = `tor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await saveTorMaterialSpecifications(torAnalysisId, finalResult.extractedMaterialSpecifications);
    }

    return finalResult;
  }
);
'''