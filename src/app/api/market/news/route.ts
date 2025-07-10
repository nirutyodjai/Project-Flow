'use server';

/**
 * @fileOverview API routes สำหรับการวิเคราะห์ข่าวการเงินและเศรษฐกิจ
 */
import { NextRequest, NextResponse } from 'next/server';
import { analyzeFinancialNews } from '@/ai/market-analysis';
import { getAnalysisData, findMarketAnalysesByKeywords } from '@/services/analysis-data';

/**
 * POST /api/market/news
 * API สำหรับวิเคราะห์ข่าวการเงินและเศรษฐกิจ
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { news, symbol, markets, includeRelatedStocks } = body;
    
    if (!news || news.length < 10) {
      return NextResponse.json(
        { error: 'News content is required and must be at least 10 characters' },
        { status: 400 }
      );
    }

    const result = await analyzeFinancialNews({
      news,
      symbol,
      markets,
      includeRelatedStocks: includeRelatedStocks || false
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing financial news:', error);
    return NextResponse.json(
      { error: 'Failed to analyze financial news' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/market/news/search
 * API สำหรับค้นหาการวิเคราะห์ข่าวโดยใช้คีย์เวิร์ด
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '5');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // แยกคำค้นหาเป็นคีย์เวิร์ด
    const keywords = query.split(/\s+/).filter(word => word.length > 2);
    
    // ค้นหาการวิเคราะห์ข่าวที่เกี่ยวข้อง
    const results = await findMarketAnalysesByKeywords(keywords, 'news', limit);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching news analyses:', error);
    return NextResponse.json(
      { error: 'Failed to search news analyses' },
      { status: 500 }
    );
  }
}
