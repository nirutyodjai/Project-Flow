'''// src/app/api/save-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { saveDocumentAnalysis, DocumentAnalysisDBSchema } from '@/services/analysis-data';
import { z } from 'zod';

// We need a schema for the request body that the client will send.
const SaveRequestSchema = z.object({
  analysisResult: DocumentAnalysisDBSchema.omit({ 
    id: true, 
    createdAt: true, 
    downloadUrl: true, // downloadUrl will be handled server-side if needed
  }),
  source: z.object({
    sourceType: z.enum(['url', 'text', 'file']),
    content: z.string(), // URL or original file name
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the incoming request body
    const validation = SaveRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request payload', details: validation.error.format() }, { status: 400 });
    }

    const { analysisResult, source } = validation.data;

    console.log(`[API] Received save request for project: ${analysisResult.projectName}`);

    // In a real application, if the source was a file, you would first
    // upload it to a persistent storage (like Firebase Storage) and get a public downloadUrl.
    // For this example, we'll assume downloadUrl is either provided or not needed.
    const sourceToSave = {
      ...source,
      // downloadUrl: await handleFileUploadIfNeeded(source) // Placeholder for real implementation
    };

    const savedId = await saveDocumentAnalysis(analysisResult, sourceToSave);

    if (savedId) {
      return NextResponse.json({ success: true, savedId: savedId });
    } else {
      return NextResponse.json({ error: 'Failed to save analysis to the database.' }, { status: 500 });
    }

  } catch (error) {
    console.error('[API Save Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: `Failed to save analysis: ${errorMessage}` }, { status: 500 });
  }
}
'''