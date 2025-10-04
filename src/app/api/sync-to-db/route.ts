import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { searchEGPProjects } from '@/lib/egp-scraper';

/**
 * POST /api/sync-to-db
 * ซิงค์โครงการจาก Mock Data ไปยัง PostgreSQL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { limit = 50 } = body;

    // ดึงโครงการจาก Mock Data
    const mockProjects = await searchEGPProjects('', { limit });

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const project of mockProjects) {
      try {
        // ตรวจสอบว่ามีอยู่แล้วหรือไม่
        const existing = await prisma.project.findFirst({
          where: {
            projectName: project.projectName,
            organization: project.organization,
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // สร้างโครงการใหม่
        await prisma.project.create({
          data: {
            projectName: project.projectName,
            organization: project.organization,
            budget: project.budget,
            announcementDate: project.announcementDate,
            closingDate: project.closingDate,
            projectType: project.projectType,
            method: project.method,
            description: project.description,
            documentUrl: project.documentUrl || null,
            sourceUrl: project.sourceUrl || null,
            contactPerson: null,
            phone: null,
            address: null,
          },
        });

        created++;
      } catch (error) {
        errors.push(`Failed to create ${project.projectName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: mockProjects.length,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error syncing to database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        message: 'Database might not be connected. Please check POSTGRES_URL in .env',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync-to-db
 * ตรวจสอบสถานะ
 */
export async function GET() {
  try {
    const count = await prisma.project.count();

    return NextResponse.json({
      status: 'ready',
      projectsInDatabase: count,
      message: 'Database is connected and ready',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Database might not be connected. Please check POSTGRES_URL in .env',
      },
      { status: 500 }
    );
  }
}
