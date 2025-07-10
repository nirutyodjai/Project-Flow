import { NextRequest, NextResponse } from 'next/server';
import * as PriceListService from '@/services/price-list-service';

/**
 * API endpoint สำหรับดึงข้อมูลรายการสินค้าตาม ID
 * 
 * GET /api/procurement/price-list/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // ดึงข้อมูลตาม ID
    const item = await PriceListService.getPriceListItemById(id);
    
    if (!item) {
      return NextResponse.json(
        { error: 'ไม่พบรายการสินค้า' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      data: item
    });
  } catch (error) {
    console.error(`Error fetching price list item ${params.id}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint สำหรับอัปเดตข้อมูลรายการสินค้า
 * 
 * PATCH /api/procurement/price-list/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // อัปเดตข้อมูล
    await PriceListService.updatePriceListItem(id, data);
    
    return NextResponse.json({
      success: true,
      message: 'อัปเดตข้อมูลสำเร็จ'
    });
  } catch (error) {
    console.error(`Error updating price list item ${params.id}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint สำหรับลบรายการสินค้า (soft delete)
 * 
 * DELETE /api/procurement/price-list/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // ลบข้อมูล (soft delete)
    await PriceListService.deletePriceListItem(id);
    
    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลสำเร็จ'
    });
  } catch (error) {
    console.error(`Error deleting price list item ${params.id}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบข้อมูล' },
      { status: 500 }
    );
  }
}
