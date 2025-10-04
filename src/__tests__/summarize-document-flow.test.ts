import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import * as summarizeFlow from '@/ai/flows/summarize-document-flow';
import * as analysisData from '@/services/analysis-data';

// Mock dynamic imports for file parsing to avoid requiring native deps during tests
vi.mock('pdf-parse', () => ({ default: vi.fn(async () => ({ text: 'PDF TEXT' })) }));
vi.mock('mammoth', () => ({ extractRawText: vi.fn(async () => ({ value: 'DOCX TEXT' })) }));
vi.mock('tesseract.js', () => ({ recognize: vi.fn(async () => ({ data: { text: 'OCR TEXT' } })) }));

// Spy on saveTorMaterialSpecifications
vi.spyOn(analysisData, 'saveTorMaterialSpecifications').mockResolvedValue(true);

// Mock genkit prompts and tool execution by stubbing functions used inside
const fakeSummary = {
    projectName: 'โครงการทดสอบ',
    projectType: 'ก่อสร้าง',
    overallSummary: 'สรุปเบื้องต้น',
};
const fakeDetailed = {
    scopeOfWork: ['งาน A', 'งาน B'],
    keyRequirements: ['มี ท.ด.', 'มี ภ.ด.'],
    risksAndOpportunities: ['ความเสี่ยง 1'],
    deadlines: ['ภายใน 30 วัน'],
    extractedMaterialSpecifications: [
        { itemName: 'สายไฟ', brandModel: 'ABC', quantity: '100', unit: 'ม้วน', specDetails: 'มาตรฐาน มอก.' },
    ],
};

describe('summarizeDocumentFlow', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('combines summary and analysis, saves materials, returns torAnalysisId', async () => {
        // Patch internal prompt calls by monkey-patching the defined prompts
        const summarizeSpy = vi.spyOn<any, any>(summarizeFlow as any, 'summarizePrompt').mockReturnValue({
            output: () => fakeSummary,
        });
        const deepSpy = vi.spyOn<any, any>(summarizeFlow as any, 'deepAnalysisPrompt').mockReturnValue({
            output: () => fakeDetailed,
        });

        const { summarizeDocumentFlow } = await import('@/ai/flows/summarize-document-flow');

        const result = await summarizeDocumentFlow({ sourceType: 'text', content: 'hello world' } as any);

        expect(result.projectName).toBe(fakeSummary.projectName);
        expect(result.scopeOfWork.length).toBeGreaterThan(0);
        expect(analysisData.saveTorMaterialSpecifications).toHaveBeenCalledTimes(1);
        expect(result.torAnalysisId).toMatch(/^tor_/);

        summarizeSpy.mockRestore();
        deepSpy.mockRestore();
    });
});