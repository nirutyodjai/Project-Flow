import { NextRequest, NextResponse } from 'next/server';

// Ensure this route runs on the Node.js runtime and is not cached
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/scrape-egp
 * ค้นหางานประมูลจาก e-GP (ใช้ Mock Data ชั่วคราว)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword = '', limit = 20 } = body;

    console.log(`Searching e-GP for: "${keyword}"`);

    // Mock data สำหรับทดสอบ
    const mockProjects = [
      {
        id: '1',
        projectName: `โครงการก่อสร้างอาคาร ${keyword}`,
        organization: 'กรมโยธาธิการและผังเมือง',
        budget: 50000000,
        method: 'e-bidding',
        projectType: 'ก่อสร้าง',
        announcementDate: new Date().toISOString(),
        closingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        openingDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        projectNumber: 'EGP-2025-001',
        status: 'เปิดรับ',
        url: 'https://process3.gprocurement.go.th',
      },
      {
        id: '2',
        projectName: `โครงการจัดซื้อวัสดุ ${keyword}`,
        organization: 'กรมทางหลวง',
        budget: 30000000,
        method: 'e-bidding',
        projectType: 'จัดซื้อ',
        announcementDate: new Date().toISOString(),
        closingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        openingDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        projectNumber: 'EGP-2025-002',
        status: 'เปิดรับ',
        url: 'https://process3.gprocurement.go.th',
      },
      {
        id: '3',
        projectName: `โครงการปรับปรุง ${keyword}`,
        organization: 'องค์การบริหารส่วนจังหวัด',
        budget: 15000000,
        method: 'e-bidding',
        projectType: 'ปรับปรุง',
        announcementDate: new Date().toISOString(),
        closingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        openingDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        projectNumber: 'EGP-2025-003',
        status: 'เปิดรับ',
        url: 'https://process3.gprocurement.go.th',
      },
    ];

    // Filter by keyword
    const filteredProjects = keyword 
      ? mockProjects.filter(p => 
          p.projectName.toLowerCase().includes(keyword.toLowerCase()) ||
          p.organization.toLowerCase().includes(keyword.toLowerCase())
        )
      : mockProjects;

    const limitedProjects = filteredProjects.slice(0, limit);

    return NextResponse.json({
      success: true,
      total: limitedProjects.length,
      projects: limitedProjects,
      source: 'e-GP (Mock Data)',
      timestamp: new Date().toISOString(),
      note: 'ใช้ข้อมูลทดสอบชั่วคราว - สามารถเชื่อมต่อกับ e-GP จริงได้ในภายหลัง',
    });
  } catch (error) {
    console.error('Error in scrape-egp:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : typeof error === 'string'
            ? error
            : 'Search failed',
        message: 'ไม่สามารถค้นหาข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scrape-egp
 * ทดสอบการเชื่อมต่อ e-GP
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'ready',
    info: {
      name: 'e-GP Search API',
      description: 'ค้นหางานประมูลจาก e-GP',
      features: [
        'ค้นหาโครงการด้วย keyword',
        'ดึงข้อมูลโครงการล่าสุด',
        'รองรับการกรองและจำกัดจำนวน',
      ],
      usage: {
        endpoint: 'POST /api/scrape-egp',
        body: {
          keyword: 'ก่อสร้าง',
          limit: 20,
        },
      },
    },
  });
}
