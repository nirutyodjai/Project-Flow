/**
 * API endpoint สำหรับสร้าง BOQ จากผลการวิเคราะห์ TOR
 */
import { NextResponse } from 'next/server';
import { generateBOQFromTOR } from '@/services/document-analysis-data';

/**
 * สร้าง BOQ จาก TOR Analysis
 * POST /api/procurement/boq/generate
 * 
 * @param request Request object ที่มี torForBOQId และ materialKeywords (optional)
 */
export async function POST(request: Request) {
  try {
    const { torForBOQId, materialKeywords } = await request.json();
    
    if (!torForBOQId) {
      return NextResponse.json({ error: 'torForBOQId is required' }, { status: 400 });
    }
    
    // สร้าง BOQ จาก TOR โดยใช้ข้อมูลจากไพรีสลิสต์
    const result = await generateBOQFromTOR(torForBOQId, materialKeywords);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `สร้าง BOQ จาก TOR สำเร็จ (${result.boqItems.length} รายการ)`
    });
  } catch (error) {
    console.error('Error generating BOQ from TOR:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้าง BOQ' 
    }, { status: 500 });
  }
}
