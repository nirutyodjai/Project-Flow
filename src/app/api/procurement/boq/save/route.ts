/**
 * API endpoint สำหรับบันทึกข้อมูล BOQ ที่สร้างจาก TOR และไพรีสลิสต์
 */
import { NextResponse } from 'next/server';
import { 
  saveBOQFromTOR, 
  updateBOQWithPriceListItems 
} from '@/services/document-analysis-data';

/**
 * บันทึกข้อมูล BOQ ที่สร้างจาก TOR และไพรีสลิสต์
 * POST /api/procurement/boq/save
 */
export async function POST(request: Request) {
  try {
    const { 
      boqItems, 
      torForBOQId, 
      projectName, 
      projectId
    } = await request.json();
    
    if (!boqItems || !torForBOQId) {
      return NextResponse.json({ 
        error: 'boqItems และ torForBOQId เป็นข้อมูลที่จำเป็น' 
      }, { status: 400 });
    }
    
    // บันทึกข้อมูล BOQ
    const result = await saveBOQFromTOR({
      torForBOQId,
      projectName: projectName || 'โครงการไม่มีชื่อ',
      projectId: projectId || null,
      items: boqItems,
      createdAt: new Date().toISOString(),
      status: 'completed'
    });
    
    if (!result || !result.id) {
      throw new Error('การบันทึกข้อมูล BOQ ล้มเหลว');
    }
    
    // อัปเดตข้อมูล BOQ ด้วยข้อมูลไพรีสลิสต์
    if (result.id) {
      await updateBOQWithPriceListItems(result.id, boqItems);
    }
    
    return NextResponse.json({
      success: true,
      boqId: result.id,
      message: 'บันทึกข้อมูล BOQ เรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error saving BOQ:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล BOQ' 
    }, { status: 500 });
  }
}
