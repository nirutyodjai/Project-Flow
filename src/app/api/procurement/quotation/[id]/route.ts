import { NextRequest, NextResponse } from 'next/server';
import * as QuotationService from '@/services/quotation-service';

/**
 * GET /api/procurement/quotation/[id]
 * ดึงข้อมูลใบเสนอราคาตาม ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const quotation = await QuotationService.getQuotationById(id);
    
    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบใบเสนอราคา' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: quotation });
  } catch (error: any) {
    console.error(`Error in get quotation API (${params.id}):`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลใบเสนอราคา' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/procurement/quotation/[id]
 * อัปเดตข้อมูลใบเสนอราคา
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    const updatedQuotation = await QuotationService.updateQuotation(id, data);
    
    return NextResponse.json({ success: true, data: updatedQuotation });
  } catch (error: any) {
    console.error(`Error in update quotation API (${params.id}):`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการอัปเดตใบเสนอราคา' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/procurement/quotation/[id]
 * ลบใบเสนอราคา
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await QuotationService.deleteQuotation(id);
    
    return NextResponse.json({ success: true, message: 'ลบใบเสนอราคาเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error(`Error in delete quotation API (${params.id}):`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการลบใบเสนอราคา' },
      { status: 500 }
    );
  }
}
