import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock Projects API
 * ใช้ข้อมูล Mock แทน Firebase
 */

const mockProjects = [
  {
    id: '1',
    name: 'ก่อสร้างอาคารสำนักงาน 5 ชั้น',
    organization: 'กรมทางหลวง',
    type: 'ภาครัฐ',
    budget: '50,000,000',
    address: 'กรุงเทพมหานคร',
    contactPerson: 'นายสมชาย ใจดี',
    phone: '02-123-4567',
    documentUrl: null,
    bidSubmissionDeadline: '2025-11-30',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'ปรับปรุงระบบไฟฟ้าโรงพยาบาล',
    organization: 'โรงพยาบาลจุฬาลงกรณ์',
    type: 'โรงพยาบาล',
    budget: '15,000,000',
    address: 'กรุงเทพมหานคร',
    contactPerson: 'นางสาวสมหญิง ดีมาก',
    phone: '02-256-4000',
    documentUrl: null,
    bidSubmissionDeadline: '2025-11-15',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'ติดตั้งระบบปรับอากาศอาคารเรียน',
    organization: 'มหาวิทยาลัยธรรมศาสตร์',
    type: 'มหาวิทยาลัย',
    budget: '8,000,000',
    address: 'ปทุมธานี',
    contactPerson: 'ผศ.ดร.สมศักดิ์ วิชาการ',
    phone: '02-564-4000',
    documentUrl: null,
    bidSubmissionDeadline: '2025-12-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'ก่อสร้างถนนคอนกรีต',
    organization: 'เทศบาลนครนนทบุรี',
    type: 'ภาครัฐ',
    budget: '25,000,000',
    address: 'นนทบุรี',
    contactPerson: 'นายประสิทธิ์ ก่อสร้าง',
    phone: '02-589-1234',
    documentUrl: null,
    bidSubmissionDeadline: '2025-11-20',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'ปรับปรุงระบบประปา',
    organization: 'การประปานครหลวง',
    type: 'ภาครัฐ',
    budget: '12,000,000',
    address: 'กรุงเทพมหานคร',
    contactPerson: 'นายวิชัย น้ำดี',
    phone: '02-555-1234',
    documentUrl: null,
    bidSubmissionDeadline: '2025-12-10',
    createdAt: new Date().toISOString(),
  },
];

/**
 * GET /api/projects
 * ดึงรายการโครงการทั้งหมด
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    let filteredProjects = mockProjects;

    // กรองตามคำค้นหา
    if (query) {
      const queryLower = query.toLowerCase();
      filteredProjects = mockProjects.filter(project =>
        project.name.toLowerCase().includes(queryLower) ||
        (project.organization && project.organization.toLowerCase().includes(queryLower)) ||
        (project.type && project.type.toLowerCase().includes(queryLower))
      );
    }

    return NextResponse.json({
      success: true,
      projects: filteredProjects,
      total: filteredProjects.length,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * เพิ่มโครงการใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newProject = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    // ในการใช้งานจริง ควรบันทึกลง database
    console.log('New project created (mock):', newProject);

    return NextResponse.json({
      success: true,
      project: newProject,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project.' },
      { status: 500 }
    );
  }
}
