import { NextRequest, NextResponse } from 'next/server';
import * as PriceListService from '@/services/price-list-service';

/**
 * API endpoint สำหรับดึงข้อมูลรายการสินค้าตามเงื่อนไขการค้นหา
 * 
 * GET /api/procurement/price-list?materialCode=xxx&category=yyy&...
 */
export async function GET(request: NextRequest) {
  try {
    // ดึง query parameters
    const searchParams = request.nextUrl.searchParams;
    const materialCode = searchParams.get('materialCode') || undefined;
    const budgetCode = searchParams.get('budgetCode') || undefined;
    const description = searchParams.get('description') || undefined;
    const category = searchParams.get('category') || undefined;
    const subcategory = searchParams.get('subcategory') || undefined;
    const supplier = searchParams.get('supplier') || undefined;
    const maker = searchParams.get('maker') || undefined;
    const onlyActive = searchParams.get('onlyActive') !== 'false'; // default is true
    
    // ค้นหาข้อมูล
    const items = await PriceListService.searchPriceListItems({
      materialCode,
      budgetCode,
      description,
      category,
      subcategory,
      supplier,
      maker,
      onlyActive
    });
    
    return NextResponse.json({ 
      success: true, 
      count: items.length,
      data: items 
    });
  } catch (error) {
    console.error('Error fetching price list:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint สำหรับเพิ่มรายการสินค้าใหม่
 * 
 * POST /api/procurement/price-list
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!data.materialCode || !data.description || !data.unit || !data.priceList) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ครบถ้วน กรุณาระบุ materialCode, description, unit และ priceList' },
        { status: 400 }
      );
    }
    
    // บันทึกข้อมูล
    const id = await PriceListService.addPriceListItem(data);
    
    return NextResponse.json({
      success: true,
      id,
      message: 'บันทึกข้อมูลสำเร็จ'
    });
  } catch (error) {
    console.error('Error adding price list item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint สำหรับนำเข้าข้อมูลไพรีสลิสต์หลายรายการ
 * 
 * PUT /api/procurement/price-list/import
 */
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง กรุณาระบุรายการสินค้าในรูปแบบอาร์เรย์' },
        { status: 400 }
      );
    }
    
    // นำเข้าข้อมูล
    const importCount = await PriceListService.importPriceListItems(data.items);
    
    return NextResponse.json({
      success: true,
      count: importCount,
      message: `นำเข้าข้อมูลสำเร็จ ${importCount} รายการ`
    });
  } catch (error) {
    console.error('Error importing price list items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล' },
      { status: 500 }
    );
  }
}
