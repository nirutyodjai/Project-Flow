/**
 * API endpoint สำหรับค้นหารายการในไพรีสลิสต์และเพิ่มเข้าไปใน BOQ
 */
import { NextResponse } from 'next/server';
import * as PriceListService from '@/services/price-list-service';

/**
 * ค้นหารายการในไพรีสลิสต์ที่เหมาะสมสำหรับรายการ BOQ
 * 
 * GET /api/procurement/boq/price-suggestions?description=xxx
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const description = url.searchParams.get('description');
    const category = url.searchParams.get('category');
    
    if (!description && !category) {
      return NextResponse.json({ 
        error: 'ต้องระบุ description หรือ category อย่างน้อยหนึ่งอย่าง' 
      }, { status: 400 });
    }
    
    // ค้นหาในไพรีสลิสต์
    const items = await PriceListService.searchPriceListItems({
      description: description || undefined,
      category: category || undefined,
      onlyActive: true
    });
    
    // แปลงผลลัพธ์ให้เหมาะสมสำหรับใช้ใน BOQ
    const suggestions = items.map(item => ({
      id: item.id,
      materialCode: item.materialCode,
      description: item.description,
      unit: item.unit,
      priceList: item.priceList,
      netPrice: item.netPrice || PriceListService.calculateNetPrice(item),
      submitPrice: item.submitPrice || PriceListService.calculateSubmitPrice(item),
      supplier: item.supplier,
      maker: item.maker,
      category: item.category
    }));
    
    return NextResponse.json({ 
      success: true, 
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching price suggestions for BOQ:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการค้นหารายการในไพรีสลิสต์' 
    }, { status: 500 });
  }
}
