import { NextRequest, NextResponse } from 'next/server';
import * as QuotationService from '@/services/quotation-service';
import { QuotationType, QuotationStatus } from '@/services/quotation-service';

/**
 * GET /api/procurement/quotation
 * ค้นหาใบเสนอราคาตามเงื่อนไข
 */
export async function GET(request: NextRequest) {
  try {
    // รับพารามิเตอร์การค้นหาจาก URL
    const searchParams = request.nextUrl.searchParams;
    const params = {
      quotationNumber: searchParams.get('quotationNumber') || undefined,
      customerName: searchParams.get('customerName') || undefined,
      projectName: searchParams.get('projectName') || undefined,
      type: searchParams.has('type') 
        ? searchParams.get('type') as QuotationType 
        : undefined,
      status: searchParams.has('status')
        ? searchParams.get('status') as QuotationStatus
        : undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
      limit: searchParams.has('limit') 
        ? parseInt(searchParams.get('limit')!)
        : undefined
    };

    // ค้นหาใบเสนอราคา
    const quotations = await QuotationService.searchQuotations(params);
    
    return NextResponse.json({ success: true, data: quotations });
  } catch (error: any) {
    console.error('Error in quotation search API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการค้นหาใบเสนอราคา' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/procurement/quotation
 * สร้างใบเสนอราคาใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.customerName || !data.projectName || !data.type || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ข้อมูลไม่ครบถ้วน กรุณาระบุชื่อลูกค้า, ชื่อโครงการ, ประเภทใบเสนอราคา และรายการสินค้า' },
        { status: 400 }
      );
    }
    
    // สร้างใบเสนอราคาใหม่
    const newQuotation = await QuotationService.createQuotation(data);
    
    return NextResponse.json({ success: true, data: newQuotation }, { status: 201 });
  } catch (error: any) {
    console.error('Error in create quotation API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการสร้างใบเสนอราคา' },
      { status: 500 }
    );
  }
}
