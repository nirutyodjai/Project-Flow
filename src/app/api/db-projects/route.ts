import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/db-projects
 * ดึงโครงการทั้งหมดจาก PostgreSQL
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    const projects = await prisma.project.findMany({
      where: keyword
        ? {
            OR: [
              { projectName: { contains: keyword, mode: 'insensitive' } },
              { organization: { contains: keyword, mode: 'insensitive' } },
              { description: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : undefined,
      take: limit,
      orderBy: { closingDate: 'asc' },
      include: {
        estimates: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      total: projects.length,
      projects,
      source: 'PostgreSQL Database',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        message: 'Database might not be connected. Please check POSTGRES_URL in .env',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/db-projects
 * เพิ่มโครงการใหม่
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectName,
      organization,
      budget,
      announcementDate,
      closingDate,
      projectType,
      method,
      description,
      documentUrl,
      sourceUrl,
      contactPerson,
      phone,
      address,
    } = body;

    const project = await prisma.project.create({
      data: {
        projectName,
        organization,
        budget,
        announcementDate,
        closingDate,
        projectType,
        method,
        description,
        documentUrl,
        sourceUrl,
        contactPerson,
        phone,
        address,
      },
    });

    return NextResponse.json({
      success: true,
      project,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create project',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/db-projects
 * ลบโครงการทั้งหมด (ระวัง!)
 */
export async function DELETE() {
  try {
    const result = await prisma.project.deleteMany({});

    return NextResponse.json({
      success: true,
      deleted: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error deleting projects:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete projects',
      },
      { status: 500 }
    );
  }
}
