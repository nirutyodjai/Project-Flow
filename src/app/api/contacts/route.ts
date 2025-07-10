import { NextRequest, NextResponse } from 'next/server';
import { addContact } from '@/services/firestore';

/**
 * POST /api/contacts
 * สร้างรายชื่อติดต่อใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // ตรวจสอบว่ามีข้อมูลที่จำเป็น
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'ต้องระบุชื่อ' }, { status: 400 });
    }
    
    if (!body.type) {
      // กำหนดให้เป็นลูกค้าเป็นค่าเริ่มต้น
      body.type = 'ลูกค้า';
    }
    
    const contactData = {
      name: body.name,
      type: body.type,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      contactPerson: body.contactPerson || null,
      taxId: body.taxId || null
    };
    
    const newContact = await addContact(contactData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'สร้างรายชื่อติดต่อเรียบร้อยแล้ว',
      data: newContact
    });
  } catch (error: any) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการสร้างรายชื่อติดต่อ' },
      { status: 500 }
    );
  }
}
