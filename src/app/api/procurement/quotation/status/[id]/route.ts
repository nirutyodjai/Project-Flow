import { NextRequest, NextResponse } from 'next/server';
import * as QuotationService from '@/services/quotation-service';

/**
 * POST /api/procurement/quotation/status/[id]
 * อัปเดตสถานะใบเสนอราคา
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    if (!data.status) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุสถานะใหม่' },
        { status: 400 }
      );
    }
    
    const updatedQuotation = await QuotationService.updateQuotationStatus(
      id, 
      data.status, 
      {
        approvedBy: data.approvedBy,
        rejectionReason: data.rejectionReason
      }
    );
    
    return NextResponse.json({ success: true, data: updatedQuotation });
  } catch (error: any) {
    console.error(`Error in update quotation status API (${params.id}):`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะใบเสนอราคา' },
      { status: 500 }
    );
  }
}
