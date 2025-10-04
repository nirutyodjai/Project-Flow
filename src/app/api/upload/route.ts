import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock File Upload API
 * ใช้สำหรับทดสอบการอัพโหลดไฟล์โดยไม่ต้องใช้ Firebase
 * ในการใช้งานจริง ควรใช้ Firebase Storage หรือ Cloud Storage อื่นๆ
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // สร้าง mock URL สำหรับไฟล์
    const mockUrl = `/uploads/${Date.now()}_${file.name}`;
    
    // ในการใช้งานจริง ควรบันทึกข้อมูลไฟล์ลง database
    console.log('File uploaded (mock):', {
      name: file.name,
      size: file.size,
      type: file.type,
      url: mockUrl,
    });

    return NextResponse.json({ 
      success: true, 
      url: mockUrl,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'File upload failed.' }, { status: 500 });
  }
}

/**
 * GET endpoint สำหรับดึงรายการไฟล์ที่อัพโหลด
 */
export async function GET() {
  try {
    // ในการใช้งานจริง ควรดึงจาก database
    const mockFiles = [
      {
        id: '1',
        name: 'document1.pdf',
        url: '/uploads/1234567890_document1.pdf',
        size: 1024000,
        type: 'application/pdf',
        uploadedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'image1.jpg',
        url: '/uploads/1234567891_image1.jpg',
        size: 512000,
        type: 'image/jpeg',
        uploadedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ success: true, files: mockFiles });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Failed to fetch files.' }, { status: 500 });
  }
}
