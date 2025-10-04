// src/app/api/bidding-advisor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { strategicBiddingAdvisorFlow, BiddingStrategyInputSchema } from '@/ai/flows/strategic-bidding-advisor';
import { z } from 'zod';

// Helper to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // --- Extract and parse all form data ---
    const projectName = formData.get('projectName') as string;
    const companyCapabilities = JSON.parse(formData.get('companyCapabilities') as string);
    const competitors = JSON.parse(formData.get('competitors') as string);

    const documentSourceType = formData.get('documentSourceType') as 'url' | 'text' | 'file';
    const documentContent = formData.get('documentContent') as string;
    const documentFile = formData.get('documentFile') as File | null;

    const blueprintFile = formData.get('blueprintFile') as File | null;

    // --- Construct the input for the main flow ---
    let documentSource;
    if (documentSourceType === 'file' && documentFile) {
        documentSource = {
            sourceType: 'file',
            content: await fileToBase64(documentFile),
            mimeType: documentFile.type,
        };
    } else {
        documentSource = { sourceType: documentSourceType, content: documentContent };
    }

    let blueprintSource;
    if (blueprintFile) {
        blueprintSource = {
            sourceType: 'file',
            content: await fileToBase64(blueprintFile),
            mimeType: blueprintFile.type,
        };
    }

    const flowInput = {
        projectName,
        documentSource,
        blueprintSource,
        companyCapabilities,
        competitors,
    };

    // --- Validate input against the master Zod schema ---
    const validation = BiddingStrategyInputSchema.safeParse(flowInput);
    if (!validation.success) {
      console.error('API Validation Error:', validation.error.format());
      return NextResponse.json({ error: 'Invalid input data', details: validation.error.format() }, { status: 400 });
    }

    console.log(`[API Bidding Advisor] Received request for project: "${projectName}"`);

    // --- Execute the strategic flow ---
    const result = await strategicBiddingAdvisorFlow(validation.data);

    return NextResponse.json(result);

  } catch (error) {
    console.error('[API Bidding Advisor Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: `Failed to get strategic advice: ${errorMessage}` }, { status: 500 });
  }
}
