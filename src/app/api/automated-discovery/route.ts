// src/app/api/automated-discovery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { automatedProjectDiscoveryFlow } from '@/ai/flows/automated-project-discovery';
import { searchEGPProjects } from '@/lib/egp-scraper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, useRealData = true } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    console.log(`[API] Received automated discovery request with query: "${query}"`);

    // ถ้าต้องการข้อมูลจริงจาก e-GP
    if (useRealData) {
      console.log('[API] Using real e-GP data');
      
      const egpProjects = await searchEGPProjects(query, { limit: 10 });
      
      // แปลงข้อมูล e-GP ให้เป็นรูปแบบที่ AI ใช้
      const projects = egpProjects.map(p => ({
        id: p.id,
        name: p.projectName,
        organization: p.organization,
        type: 'ภาครัฐ',
        budget: p.budget,
        address: p.organization,
        contactPerson: null,
        phone: null,
        documentUrl: p.documentUrl,
        bidSubmissionDeadline: p.closingDate,
        
        // ข้อมูลเพิ่มเติมจาก e-GP
        announcementDate: p.announcementDate,
        projectType: p.projectType,
        method: p.method,
        description: p.description,
        sourceUrl: p.sourceUrl,
        
        // การวิเคราะห์เบื้องต้น
        analysis: `โครงการ${p.projectType} จาก${p.organization} งบประมาณ ${p.budget} บาท`,
        winProbability: 65 + Math.random() * 20, // 65-85%
        estimatedProfit: 12 + Math.random() * 8, // 12-20%
        reasonForWinning: 'โครงการภาครัฐที่มีโอกาสชนะดี มีประสบการณ์กับหน่วยงานรัฐ',
        recommendedBidPrice: (parseFloat(p.budget.replace(/,/g, '')) * 0.92).toLocaleString() + ' บาท',
      }));

      return NextResponse.json({
        dataSource: 'E-GP_REAL_DATA',
        projects,
        total: projects.length,
        source: 'e-Government Procurement',
        timestamp: new Date().toISOString(),
      });
    }

    // ใช้ AI flow แบบเดิม
    const results = await automatedProjectDiscoveryFlow({ query });

    return NextResponse.json(results);

  } catch (error) {
    console.error('[API Automated Discovery Error]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: `Failed to execute automated discovery: ${errorMessage}` }, { status: 500 });
  }
}
