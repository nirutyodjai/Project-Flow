import { NextRequest, NextResponse } from 'next/server';
import { 
  startDailyChallenge, 
  verifyYesterdayChallenge, 
  getAiScore, 
  getChallengeHistory,
  getLatestChallenge,
  generateRandomStockSet
} from '@/ai/stock-challenge';

/**
 * POST /api/market/challenge/start
 * เริ่มการแข่งขันวิเคราะห์หุ้นประจำวัน
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tickers } = body;
    
    // ถ้าไม่มีการระบุ tickers ให้สุ่มเลือก
    const stockSet = tickers || generateRandomStockSet();
    
    const challenge = await startDailyChallenge(stockSet);
    
    if (!challenge) {
      return NextResponse.json(
        { error: 'ไม่สามารถเริ่มการแข่งขันได้' },
        { status: 500 }
      );
    }

    return NextResponse.json(challenge);
  } catch (error: any) {
    console.error('Error starting challenge:', error);
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาด: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/market/challenge
 * ดึงข้อมูลการแข่งขันวิเคราะห์หุ้น
 * - ?latest=true: ดึงเฉพาะการแข่งขันล่าสุด
 * - ?limit=10: กำหนดจำนวนรายการที่ดึง
 * - ?score=true: รวมคะแนนการชนะของ AI
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const getLatest = searchParams.get('latest') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeScore = searchParams.get('score') === 'true';
    
    let result: any = {};
    
    // ดึงข้อมูลตามที่ร้องขอ
    if (getLatest) {
      result.latestChallenge = await getLatestChallenge();
    } else {
      result.history = await getChallengeHistory(limit);
    }
    
    // รวมคะแนนถ้าร้องขอ
    if (includeScore) {
      result.aiScore = await getAiScore();
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error getting challenge data:', error);
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาด: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/market/challenge/verify
 * ตรวจสอบผลการแข่งขันเมื่อวาน
 */
export async function PUT(request: NextRequest) {
  try {
    const result = await verifyYesterdayChallenge();
    
    if (!result) {
      return NextResponse.json(
        { error: 'ไม่พบการแข่งขันที่รอการตรวจสอบหรือเกิดข้อผิดพลาดในการตรวจสอบ' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error verifying challenge:', error);
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาด: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
