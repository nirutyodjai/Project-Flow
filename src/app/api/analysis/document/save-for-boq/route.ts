/**
 * API endpoint สำหรับบันทึกข้อมูลการวิเคราะห์ TOR เพื่อนำไปใช้ต่อใน BOQ
 */
import { NextResponse } from 'next/server';
import { saveTORForBOQ, getTORForBOQ } from '@/services/document-analysis-data';

/**
 * บันทึกข้อมูลการวิเคราะห์ TOR เพื่อนำไปใช้ต่อในการจัดทำ BOQ
 * POST /api/analysis/document/save-for-boq
 * 
 * @param request Request object ที่มี analysisId, documentId, projectId (optional), projectName และ analysisData
 */
export async function POST(request: Request) {
  try {
    const { analysisId, documentId, projectId, projectName, analysisData } = await request.json();
    
    if (!analysisId || !documentId || !analysisData) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน กรุณาระบุ analysisId, documentId และ analysisData' }, { status: 400 });
    }
    
    // บันทึกข้อมูลสำหรับนำไปใช้ต่อใน BOQ
    const savedId = await saveTORForBOQ({
      analysisId,
      documentId,
      projectId,
      projectName,
      mainRequirements: analysisData.mainRequirements || [],
      keyDeliverables: analysisData.keyDeliverables || [],
      budget: analysisData.budget || 0,
      savedAt: new Date().toISOString(),
    });
    
    if (!savedId) {
      return NextResponse.json({ error: 'การบันทึกข้อมูลล้มเหลว' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      savedId,
      message: 'บันทึกข้อมูลสำเร็จ'
    });
  } catch (error) {
    console.error('Error saving TOR for BOQ:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }, { status: 500 });
  }
}

/**
 * ดึงข้อมูลการวิเคราะห์ TOR ที่บันทึกไว้สำหรับใช้ในการจัดทำ BOQ
 * GET /api/analysis/document/save-for-boq?documentId=xxx
 */
export async function GET(request: Request) {
  try {
    // ดึง documentId จาก query parameters
    const url = new URL(request.url);
    const documentId = url.searchParams.get('documentId');
    const projectId = url.searchParams.get('projectId');
    
    if (!documentId && !projectId) {
      return NextResponse.json({ error: 'กรุณาระบุ documentId หรือ projectId' }, { status: 400 });
    }
    
    // ดึงข้อมูลที่บันทึกไว้
    const savedData = await getTORForBOQ(documentId || undefined, projectId || undefined);
    
    if (!savedData) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลที่บันทึกไว้' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: savedData });
  } catch (error) {
    console.error('Error getting saved TOR for BOQ:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
  }
}
