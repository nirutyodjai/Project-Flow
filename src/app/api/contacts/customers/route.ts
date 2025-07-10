import { NextRequest, NextResponse } from 'next/server';
import { getContactsByType } from '@/services/firestore';

/**
 * GET /api/contacts/customers
 * ดึงข้อมูลรายการลูกค้า
 */
export async function GET(request: NextRequest) {
  try {
    // รับพารามิเตอร์การค้นหาจาก URL
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get('search') || '';
    const limitParam = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    
    // เรียกใช้ service เพื่อดึงข้อมูลลูกค้า
    const contacts = await getContactsByType('ลูกค้า', searchTerm, limitParam);
    
    // แปลงข้อมูลให้ตรงกับรูปแบบที่ component ต้องการ
    const customers = contacts?.map(contact => ({
      id: contact.id,
      name: contact.name,
      address: contact.address || '',
      taxId: contact.taxId || '',
      contactInfo: contact.contactPerson || '',
      email: contact.email || '',
      phone: contact.phone || ''
    })) || [];
    
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า' },
      { status: 500 }
    );
  }
}
