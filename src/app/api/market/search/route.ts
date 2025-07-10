'use server';

/**
 * @fileOverview API route สำหรับค้นหาการวิเคราะห์ตลาดทั้งหมด
 */
import { NextRequest, NextResponse } from 'next/server';
import { findMarketAnalysesByKeywords } from '@/services/analysis-data';

/**
 * GET /api/market/search
 * API สำหรับค้นหาการวิเคราะห์ตลาดทั้งหมด (หุ้น, ตลาด, ข่าว) โดยใช้คีย์เวิร์ด
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const type = searchParams.get('type') as 'stock' | 'market' | 'news' | undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // แยกคำค้นหาเป็นคีย์เวิร์ด
    const keywords = query.split(/\s+/).filter(word => word.length > 2);
    
    // ค้นหาการวิเคราะห์ที่เกี่ยวข้อง
    const results = await findMarketAnalysesByKeywords(keywords, type, limit);
    
    return NextResponse.json({
      query,
      type: type || 'all',
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching market analyses:', error);
    return NextResponse.json(
      { error: 'Failed to search market analyses' },
      { status: 500 }
    );
  }
}
