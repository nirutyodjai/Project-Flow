
'use server';
/**
 * @fileOverview An AI-powered flow to summarize text or image documents.
 *
 * - summarizeDocument - A function that handles the document summarization process.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentInputSchema = z.object({
  text: z.string().optional().describe('The text content to summarize.'),
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "An image of a document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the provided document content.'),
});
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

export async function summarizeDocument(
  input: SummarizeDocumentInput
): Promise<SummarizeDocumentOutput> {
  if (!input.text && !input.imageDataUri) {
    throw new Error('Either text or an image data URI must be provided.');
  }
  return summarizeDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: {schema: SummarizeDocumentInputSchema},
  output: {schema: SummarizeDocumentOutputSchema},
  prompt: `คุณเป็นผู้เชี่ยวชาญด้านการสรุปเอกสารที่มีประสิทธิภาพ.

  โปรดสรุปเนื้อหาจากข้อมูลที่ให้มาด้านล่างนี้ (อาจเป็นข้อความหรือรูปภาพ) ให้กระชับและได้ใจความสำคัญ.

  {{#if text}}
  Text Content:
  {{{text}}}
  {{/if}}

  {{#if imageDataUri}}
  Image Content: {{media url=imageDataUri}}
  {{/if}}
  `,
});

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
