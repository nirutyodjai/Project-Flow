// src/app/api/analyze-document/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { summarizeDocumentFlow, DocumentSourceSchema } from '@/ai/flows/summarize-document-flow';
import { z } from 'zod';

// Helper to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sourceType = formData.get('sourceType') as 'url' | 'text' | 'file';
    const content = formData.get('content');
    const file = formData.get('file') as File | null;

    let input: z.infer<typeof DocumentSourceSchema>;

    switch (sourceType) {
      case 'url':
      case 'text':
        if (typeof content !== 'string' || !content) {
          return NextResponse.json({ error: 'Content is required for URL or Text source.' }, { status: 400 });
        }
        input = { sourceType, content };
        break;

      case 'file':
        if (!file) {
          return NextResponse.json({ error: 'File is required for File source.' }, { status: 400 });
        }
        const base64Content = await fileToBase64(file);
        input = { sourceType, content: base64Content, mimeType: file.type };
        break;

      default:
        return NextResponse.json({ error: 'Invalid source type.' }, { status: 400 });
    }

    console.log(`[API] Received analysis request for sourceType: ${input.sourceType}`);

    // Execute the AI flow
    const analysisResult = await summarizeDocumentFlow(input);

    // Prepare the response
    const responsePayload = {
      analysis: analysisResult,
      // Pass back the original source info for the client to use
      source: {
        sourceType: input.sourceType,
        // For files, we send back the name, not the content
        content: input.sourceType === 'file' && file ? file.name : (content as string),
      },
    };

    return NextResponse.json(responsePayload);

  } catch (error) {
    console.error('[API Analyze Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: `Failed to analyze document: ${errorMessage}` }, { status: 500 });
  }
}
