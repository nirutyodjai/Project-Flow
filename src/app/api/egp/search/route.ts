import { NextRequest, NextResponse } from 'next/server';
import { searchEGPProjects, getClosingSoonProjects } from '@/lib/egp-scraper';

/**
 * GET /api/egp/search
 * ค้นหางานประมูลจาก e-GP
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const budgetMin = searchParams.get('budgetMin') 
      ? parseFloat(searchParams.get('budgetMin')!) 
      : undefined;
    const budgetMax = searchParams.get('budgetMax')
      ? parseFloat(searchParams.get('budgetMax')!)
      : undefined;
    const projectType = searchParams.get('projectType') || undefined;
    const closingSoon = searchParams.get('closingSoon') === 'true';

    let projects;

    if (closingSoon) {
      // ดึงโครงการที่ใกล้ปิดรับสมัคร
      const days = parseInt(searchParams.get('days') || '7');
      projects = await getClosingSoonProjects(days);
    } else {
      // ค้นหาตามเงื่อนไข
      projects = await searchEGPProjects(keyword, {
        limit,
        budgetMin,
        budgetMax,
        projectType,
      });
    }

    return NextResponse.json({
      success: true,
      total: projects.length,
      projects,
      source: 'e-GP (Government Procurement)',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error searching e-GP:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/egp/search
 * ค้นหาแบบละเอียด
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      keyword = '',
      limit = 20,
      budgetMin,
      budgetMax,
      projectType,
      filters = {},
    } = body;

    const projects = await searchEGPProjects(keyword, {
      limit,
      budgetMin,
      budgetMax,
      projectType,
      ...filters,
    });

    return NextResponse.json({
      success: true,
      total: projects.length,
      projects,
      filters: {
        keyword,
        budgetMin,
        budgetMax,
        projectType,
      },
      source: 'e-GP (Government Procurement)',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      },
      { status: 500 }
    );
  }
}
