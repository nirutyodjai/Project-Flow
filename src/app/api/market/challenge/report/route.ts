import { NextRequest, NextResponse } from 'next/server';
import { getFullAnalysisReport } from '@/ai/challenge-report';

/**
 * GET /api/market/challenge/report
 * ดึงรายงานสรุปและการวิเคราะห์ผลการแข่งขันวิเคราะห์หุ้น
 * - ?days=30: ดึงข้อมูลย้อนหลังกี่วัน (ค่าเริ่มต้น: 30 วัน)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    
    const reportData = await getFullAnalysisReport(days);
    
    return NextResponse.json(reportData);
  } catch (error: any) {
    console.error('Error generating challenge report:', error);
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาด: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
