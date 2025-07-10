import { NextRequest, NextResponse } from 'next/server';
import * as PriceListService from '@/services/price-list-service';

/**
 * API endpoint สำหรับดึงข้อมูลประเภทสินค้าทั้งหมด
 * 
 * GET /api/procurement/price-list/categories
 */
export async function GET(request: NextRequest) {
  try {
    // ดึงข้อมูลประเภทสินค้า
    const categories = await PriceListService.getDistinctCategories();
    
    return NextResponse.json({ 
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูลประเภทสินค้า' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint สำหรับอัปเดตราคาตามประเภทสินค้า
 * 
 * POST /api/procurement/price-list/categories
 */
export async function POST(request: NextRequest) {
  try {
    const { category, updateParams, updateInfo } = await request.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!category || !updateParams) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ครบถ้วน กรุณาระบุ category และ updateParams' },
        { status: 400 }
      );
    }
    
    // อัปเดตราคา
    const updatedCount = await PriceListService.updatePricesByCategory(category, updateParams);
    
    // บันทึกประวัติการอัปเดต
    if (updatedCount > 0 && updateInfo) {
      await PriceListService.savePriceListUpdate({
        updateDate: new Date().toISOString(),
        updateId: `update_${Date.now()}`,
        fixRate1: updateInfo.fixRate1,
        fixRate2: updateInfo.fixRate2,
        description: updateInfo.description || `อัปเดตราคาสินค้าประเภท ${category}`,
        updatedBy: updateInfo.updatedBy
      });
    }
    
    return NextResponse.json({
      success: true,
      count: updatedCount,
      message: `อัปเดตราคาสำเร็จ ${updatedCount} รายการ`
    });
  } catch (error) {
    console.error('Error updating prices by category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัปเดตราคา' },
      { status: 500 }
    );
  }
}
