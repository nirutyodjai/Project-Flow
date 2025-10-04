import { describe, it, expect, vi } from '@jest/globals';
import { parseFileToText } from '@/ai/flows/summarize-document-flow';

vi.mock('pdf-parse', () => ({ default: vi.fn(async () => ({ text: 'PDF TEXT' })) }));
vi.mock('mammoth', () => ({ extractRawText: vi.fn(async () => ({ value: 'DOCX TEXT' })) }));
vi.mock('tesseract.js', () => ({ recognize: vi.fn(async () => ({ data: { text: 'OCR TEXT' } })) }));

describe('parseFileToText', () => {
    it('parses plain text via utf-8', async () => {
        const base64 = Buffer.from('hello world', 'utf-8').toString('base64');
        const text = await parseFileToText('text/plain', base64);
        expect(text).toBe('hello world');
    });

    it('parses PDF when dependency available', async () => {
        const base64 = Buffer.from('%PDF-1.4', 'utf-8').toString('base64');
        const text = await parseFileToText('application/pdf', base64);
        expect(text).toBe('PDF TEXT');
    });

    it('parses DOCX when dependency available', async () => {
        const base64 = Buffer.from('PK\u0003\u0004', 'utf-8').toString('base64');
        const text = await parseFileToText('application/vnd.openxmlformats-officedocument.wordprocessingml.document', base64);
        expect(text).toBe('DOCX TEXT');
    });

    it('parses image OCR when dependency available', async () => {
        const base64 = Buffer.from('fakepng', 'utf-8').toString('base64');
        const text = await parseFileToText('image/png', base64);
        expect(text).toBe('OCR TEXT');
    });
});