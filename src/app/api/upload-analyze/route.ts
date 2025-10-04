import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * POST /api/upload-analyze
 * อัพโหลดไฟล์และวิเคราะห์อัตโนมัติ
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `ไม่รองรับไฟล์ประเภท ${file.type}` },
        { status: 400 }
      );
    }

    // สร้างโฟลเดอร์ uploads ถ้ายังไม่มี
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // บันทึกไฟล์
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    // วิเคราะห์ไฟล์
    const analysis = await analyzeUploadedFile(file, buffer);

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        originalName: file.name,
        savedName: fileName,
        size: file.size,
        type: file.type,
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
      },
      analysis,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}

/**
 * วิเคราะห์ไฟล์ที่อัพโหลด
 */
async function analyzeUploadedFile(
  file: File,
  buffer: Buffer
): Promise<any> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const fileName = file.name.toLowerCase();

  // วิเคราะห์ประเภทเอกสาร
  let documentType: 'tor' | 'boq' | 'quotation' | 'contract' | 'drawing' | 'other' = 'other';
  let confidence = 0.5;

  if (fileName.includes('tor') || fileName.includes('ขอบเขตงาน')) {
    documentType = 'tor';
    confidence = 0.9;
  } else if (fileName.includes('boq') || fileName.includes('ปริมาณงาน')) {
    documentType = 'boq';
    confidence = 0.9;
  } else if (fileName.includes('quotation') || fileName.includes('ใบเสนอราคา')) {
    documentType = 'quotation';
    confidence = 0.9;
  } else if (fileName.includes('contract') || fileName.includes('สัญญา')) {
    documentType = 'contract';
    confidence = 0.9;
  } else if (fileName.includes('drawing') || fileName.includes('แบบ')) {
    documentType = 'drawing';
    confidence = 0.8;
  }

  // แนะนำการดำเนินการต่อ
  const suggestions = getSuggestions(documentType, extension);

  return {
    documentType,
    confidence,
    fileExtension: extension,
    suggestions,
    canAutoProcess: ['xlsx', 'xls', 'txt'].includes(extension || ''),
    requiresManualReview: ['pdf', 'docx', 'doc'].includes(extension || ''),
  };
}

/**
 * แนะนำการดำเนินการ
 */
function getSuggestions(
  documentType: string,
  extension?: string
): string[] {
  const suggestions: string[] = [];

  if (documentType === 'tor') {
    suggestions.push('📄 เอกสารนี้เป็น TOR (Terms of Reference)');
    suggestions.push('💡 แนะนำ: ใช้ TOR Analyzer เพื่อวิเคราะห์ขอบเขตงาน');
    suggestions.push('🔍 สามารถแยกรายการงานและประมาณการต้นทุนได้');
  } else if (documentType === 'boq') {
    suggestions.push('📊 เอกสารนี้เป็น BOQ (Bill of Quantities)');
    suggestions.push('💡 แนะนำ: ใช้ BOQ Analyzer เพื่อถอดรายการวัสดุ');
    suggestions.push('📦 สามารถคำนวณต้นทุนวัสดุ-แรงงาน-เครื่องมือได้');
  } else if (documentType === 'quotation') {
    suggestions.push('💰 เอกสารนี้เป็นใบเสนอราคา');
    suggestions.push('💡 แนะนำ: เปรียบเทียบกับต้นทุนที่คำนวณได้');
  } else if (documentType === 'contract') {
    suggestions.push('📋 เอกสารนี้เป็นสัญญา');
    suggestions.push('💡 แนะนำ: ตรวจสอบเงื่อนไขและข้อกำหนดต่างๆ');
  } else if (documentType === 'drawing') {
    suggestions.push('📐 เอกสารนี้เป็นแบบก่อสร้าง');
    suggestions.push('💡 แนะนำ: ใช้ประกอบการประมาณการปริมาณงาน');
  }

  if (extension === 'xlsx' || extension === 'xls') {
    suggestions.push('✅ ไฟล์ Excel สามารถนำเข้า BOQ Analyzer ได้โดยตรง');
  } else if (extension === 'pdf') {
    suggestions.push('⚠️ ไฟล์ PDF ต้องแปลงเป็น Excel หรือ Text ก่อน');
  }

  return suggestions;
}

/**
 * GET /api/upload-analyze
 * ดูตัวอย่างการใช้งาน
 */
export async function GET() {
  return NextResponse.json({
    name: 'Upload & Analyze API',
    description: 'อัพโหลดไฟล์และวิเคราะห์อัตโนมัติ',
    supportedTypes: {
      documents: ['PDF', 'Word (.docx, .doc)', 'Text (.txt)'],
      spreadsheets: ['Excel (.xlsx, .xls)'],
      images: ['JPEG', 'PNG', 'GIF'],
    },
    maxFileSize: '10 MB',
    features: [
      'อัพโหลดไฟล์หลายประเภท',
      'วิเคราะห์ประเภทเอกสารอัตโนมัติ',
      'แนะนำการดำเนินการต่อ',
      'รองรับ TOR, BOQ, ใบเสนอราคา, สัญญา',
    ],
  });
}
