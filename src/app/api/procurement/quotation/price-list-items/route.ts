import { NextRequest, NextResponse } from 'next/server';
import * as QuotationService from '@/services/quotation-service';

/**
 * GET /api/procurement/quotation/price-list-items
 * ดึงข้อมูลสินค้าจากไพรีสลิสต์สำหรับสร้างใบเสนอราคา
 */
export async function GET(request: NextRequest) {
  try {
    // รับพารามิเตอร์การค้นหาจาก URL
    const searchParams = request.nextUrl.searchParams;
    const params = {
      materialCode: searchParams.get('materialCode') || undefined,
      description: searchParams.get('description') || undefined,
      category: searchParams.get('category') || undefined
    };
    
    const includeStockInfo = searchParams.get('includeStock') !== 'false'; // default true
    
    // ดึงข้อมูลสินค้า
    const items = await QuotationService.fetchItemsFromPriceList(params, includeStockInfo);
    
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    console.error('Error in fetch price list items API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าจากไพรีสลิสต์' },
      { status: 500 }
    );
  }
}
