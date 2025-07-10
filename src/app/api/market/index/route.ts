'use server';

/**
 * @fileOverview API routes สำหรับการวิเคราะห์ตลาดโดยรวม
 */
import { NextRequest, NextResponse } from 'next/server';
import { analyzeMarket } from '@/ai/market-analysis';
import { getAnalysisData } from '@/services/analysis-data';

/**
 * POST /api/market/index
 * API สำหรับวิเคราะห์ตลาดโดยรวม
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { market, includeEconomicData, includeSectorAnalysis } = body;
    
    if (!market) {
      return NextResponse.json(
        { error: 'Market is required' },
        { status: 400 }
      );
    }

    const result = await analyzeMarket({
      market,
      includeEconomicData: includeEconomicData || false,
      includeSectorAnalysis: includeSectorAnalysis || true
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing market:', error);
    return NextResponse.json(
      { error: 'Failed to analyze market' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/market/index
 * API สำหรับดึงประวัติการวิเคราะห์ตลาด
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const market = searchParams.get('market');
    const limit = parseInt(searchParams.get('limit') || '5');
    
    if (!market) {
      return NextResponse.json(
        { error: 'Market is required' },
        { status: 400 }
      );
    }

    const history = await getAnalysisData('market', { market }, limit);
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching market analysis history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market analysis history' },
      { status: 500 }
    );
  }
}
