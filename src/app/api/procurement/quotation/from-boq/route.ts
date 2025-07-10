import { NextRequest, NextResponse } from 'next/server';
import * as QuotationService from '@/services/quotation-service';

/**
 * POST /api/procurement/quotation/from-boq
 * สร้างใบเสนอราคาจาก BOQ
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.boqId || !data.customerName) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุรหัส BOQ และชื่อลูกค้า' },
        { status: 400 }
      );
    }
    
    // สร้างใบเสนอราคาจาก BOQ
    const newQuotation = await QuotationService.createQuotationFromBOQ(data.boqId, data);
    
    return NextResponse.json({ success: true, data: newQuotation }, { status: 201 });
  } catch (error: any) {
    console.error('Error in create quotation from BOQ API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการสร้างใบเสนอราคาจาก BOQ' },
      { status: 500 }
    );
  }
}
