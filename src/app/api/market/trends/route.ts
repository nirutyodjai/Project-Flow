/**
 * API endpoints สำหรับการวิเคราะห์แนวโน้มตลาด
 */
import { NextResponse } from 'next/server';
import { analyzeMarketTrend, getLatestTrendAnalysis, TrendPeriod, TrendType, generateTrendSummaryReport } from '@/ai/market-trends';
import { searchMarketTrendAnalysis } from '@/services/analysis-data';

/**
 * ดึงข้อมูลการวิเคราะห์แนวโน้มตลาดล่าสุด
 * GET /api/market/trends?period=daily&type=general
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as TrendPeriod || 'daily';
    const type = searchParams.get('type') as TrendType || 'general';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const action = searchParams.get('action') || 'latest';
    
    // ดึงข้อมูลการวิเคราะห์ล่าสุด
    if (action === 'latest') {
      const analysis = await getLatestTrendAnalysis(period, type);
      
      if (!analysis) {
        return NextResponse.json(
          { error: 'No trend analysis found for the specified parameters' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ analysis });
    }
    
    // ค้นหาข้อมูลการวิเคราะห์
    if (action === 'search') {
      const analyses = await searchMarketTrendAnalysis(
        period ? period : undefined,
        type ? type : undefined,
        startDate,
        endDate
      );
      
      return NextResponse.json({ analyses });
    }
    
    // สร้างรายงานสรุป
    if (action === 'summary') {
      const analyses = await searchMarketTrendAnalysis(
        period ? period : undefined,
        type ? type : undefined,
        startDate,
        endDate
      );
      
      if (analyses.length === 0) {
        return NextResponse.json(
          { error: 'No trend analyses found for generating summary' },
          { status: 404 }
        );
      }
      
      const summaryReport = await generateTrendSummaryReport(analyses);
      return NextResponse.json({ summaryReport, analysesCount: analyses.length });
    }
    
    return NextResponse.json(
      { error: 'Invalid action specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching market trend analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market trend analysis' },
      { status: 500 }
    );
  }
}

/**
 * สร้างการวิเคราะห์แนวโน้มตลาดใหม่
 * POST /api/market/trends
 * body: { period, type, marketData? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { period, type, marketData } = body;
    
    if (!period || !type) {
      return NextResponse.json(
        { error: 'Period and type are required' },
        { status: 400 }
      );
    }
    
    const analysis = await analyzeMarketTrend(period, type, marketData);
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing market trend:', error);
    return NextResponse.json(
      { error: 'Failed to analyze market trend' },
      { status: 500 }
    );
  }
}
