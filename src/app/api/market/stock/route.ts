'use server';

/**
 * @fileOverview API routes สำหรับการวิเคราะห์ตลาดหุ้น
 */
import { NextRequest, NextResponse } from 'next/server';
import { analyzeStock, analyzeMarket, analyzeFinancialNews } from '@/ai/market-analysis';
import { getAnalysisData, findMarketAnalysesByKeywords } from '@/services/analysis-data';

/**
 * POST /api/market/stock
 * API สำหรับวิเคราะห์หุ้นรายตัว
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, includeNews, includeTechnical, timeframe } = body;
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const result = await analyzeStock({
      symbol,
      includeNews: includeNews || false,
      includeTechnical: includeTechnical || true,
      timeframe: timeframe || 'medium'
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing stock:', error);
    return NextResponse.json(
      { error: 'Failed to analyze stock' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/market/stock/history
 * API สำหรับดึงประวัติการวิเคราะห์หุ้น
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '5');
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const history = await getAnalysisData('stock', { symbol }, limit);
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching stock analysis history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock analysis history' },
      { status: 500 }
    );
  }
}
