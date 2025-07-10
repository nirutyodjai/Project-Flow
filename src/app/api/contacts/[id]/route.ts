import { deleteContact, getContact, updateContact } from '@/services/firestore';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/contacts/[id]
 * ดึงข้อมูลติดต่อตาม ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing contact ID' }, { status: 400 });
    }

    const contact = await getContact(id);
    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: contact
    });
  } catch (error: any) {
    console.error('Error getting contact:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get contact' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/contacts/[id]
 * อัปเดตข้อมูลติดต่อ
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing contact ID' }, { status: 400 });
    }

    const body = await request.json();
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Contact name is required' }, { status: 400 });
    }

    const updatedContact = await updateContact(id, {
      name: body.name,
      type: body.type,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      contactPerson: body.contactPerson || null,
      taxId: body.taxId || null
    });

    return NextResponse.json({ 
      success: true, 
      message: 'อัปเดตข้อมูลติดต่อเรียบร้อยแล้ว',
      data: updatedContact
    });
  } catch (error: any) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update contact' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contacts/[id]
 * ลบข้อมูลติดต่อ
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing contact ID' }, { status: 400 });
    }
    
    await deleteContact(id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'ลบข้อมูลติดต่อเรียบร้อยแล้ว'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete contact' }, { status: 500 });
  }
}
