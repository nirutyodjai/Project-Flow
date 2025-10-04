
'use server';
/**
 * @fileOverview A multi-step flow to analyze and summarize documents from various sources.
 * This flow is designed to be more intelligent by breaking down the analysis process.
 */
import { z } from 'zod';
import { ai, procurementAI } from '@/ai/genkit';
// ลบ web_fetch ที่ไม่มีใน genkit package
import { saveTorMaterialSpecifications } from '@/services/analysis-data'; // Import the new save function

// Optional runtime dependencies for file parsing (install to enable):
// - pdf-parse (PDF)
// - mammoth (DOCX)
// - tesseract.js (image OCR)

// == SCHEMAS ==

export const DocumentSourceSchema = z.object({
  sourceType: z.enum(['url', 'text', 'file']).describe('ประเภทของแหล่งข้อมูล'),
  content: z.string().describe('เนื้อหาข้อมูล (URL, ข้อความ, หรือ base64 encoded file)'),
  mimeType: z.string().optional().describe('MIME type ของไฟล์ สำหรับ source file'),
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

export const FinalAnalysisOutputSchema = DocumentSummarySchema.merge(DetailedAnalysisSchema).extend({
  torAnalysisId: z.string().optional().describe('รหัสการวิเคราะห์ TOR เพื่อเชื่อมโยงข้อมูลในภายหลัง'),
});

// == HELPERS ==

/**
 * Attempt to parse various file types (PDF, DOCX, images via OCR, plain text) from base64 to text.
 * Uses optional dynamic imports; returns a clear error message if parser is unavailable.
 */
export async function parseFileToText(mimeType: string, base64: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64');

  // Plain text and common textual formats
  if (mimeType.startsWith('text/') || ['application/json', 'application/xml', 'application/x-ndjson'].includes(mimeType)) {
    return buffer.toString('utf-8');
  }

  // PDF parsing via pdf-parse (preferred) or fallback
  if (mimeType === 'application/pdf') {
    try {
      const pdfParse = (await import('pdf-parse')).default as (data: Buffer) => Promise<{ text: string }>;
      const result = await pdfParse(buffer);
      return result.text || '';
    } catch (e) {
      // Fallback: indicate need to install dependency
      throw new Error('PDF parsing requires pdf-parse. Please install it to enable PDF text extraction.');
    }
  }

  // DOCX parsing via mammoth
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const mammoth = await import('mammoth');
      const result = await (mammoth as any).extractRawText({ buffer });
      return (result?.value as string) ?? '';
    } catch (e) {
      throw new Error('DOCX parsing requires mammoth. Please install it to enable DOCX text extraction.');
    }
  }

  // Basic image OCR via tesseract.js for common image types
  if ([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/bmp',
    'image/tiff',
  ].includes(mimeType)) {
    try {
      const Tesseract = await import('tesseract.js');
      const { data } = await (Tesseract as any).recognize(buffer, 'eng');
      return data?.text ?? '';
    } catch (e) {
      throw new Error('Image OCR requires tesseract.js. Please install it to enable OCR.');
    }
  }

  // Unknown binary types
  return '';
}

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
      try {
        const response = await web_fetch({ url: input.content });
        if (!response?.content || typeof response.content !== 'string') {
          throw new Error('No content received from URL');
        }
        return { extractedText: response.content };
      } catch (error: any) {
        throw new Error(`Failed to fetch content from URL: ${error?.message ?? String(error)}`);
      }
    }
    if (input.sourceType === 'text') {
      return { extractedText: input.content };
    }
    if (input.sourceType === 'file') {
      if (!input.mimeType) {
        throw new Error('mimeType is required for file source');
      }
      try {
        // Use smart parser for file types; provides clear error if parser not installed
        const textContent = await parseFileToText(input.mimeType, input.content);
        if (!textContent) {
          throw new Error(`Unsupported or empty content for mimeType: ${input.mimeType}`);
        }
        return { extractedText: textContent };
      } catch (error: any) {
        throw new Error(`Failed to parse file input: ${error?.message ?? String(error)}`);
      }
    }
    throw new Error('Unsupported source type.');
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
    } as z.infer<typeof FinalAnalysisOutputSchema>;

    // Persist extracted material specifications (if any) and annotate torAnalysisId for downstream usage
    if (finalResult.extractedMaterialSpecifications && finalResult.extractedMaterialSpecifications.length > 0) {
      const torAnalysisId = `tor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await saveTorMaterialSpecifications(
        torAnalysisId,
        finalResult.extractedMaterialSpecifications,
        // In future we can pass more context (agencyName, projectId, documentId)
        undefined
      );
      finalResult.torAnalysisId = torAnalysisId;
    }

    return finalResult;
  }
);
