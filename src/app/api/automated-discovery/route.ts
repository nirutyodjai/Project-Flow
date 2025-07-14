'''// src/app/api/automated-discovery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { automatedProjectDiscoveryFlow } from '@/ai/flows/automated-project-discovery';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    console.log(`[API] Received automated discovery request with query: "${query}"`);

    // Execute the new automated flow
    const results = await automatedProjectDiscoveryFlow({ query });

    return NextResponse.json(results);

  } catch (error) {
    console.error('[API Automated Discovery Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: `Failed to execute automated discovery: ${errorMessage}` }, { status: 500 });
  }
}
'''