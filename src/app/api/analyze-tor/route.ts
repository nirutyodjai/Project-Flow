import { NextRequest, NextResponse } from 'next/server';
import { analyzeTOR } from '@/lib/tor-analyzer';

/**
 * POST /api/analyze-tor
 * วิเคราะห์ TOR และคำนวณกำไร
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, budget, workItems } = body;

    if (!projectName || !budget || !workItems) {
      return NextResponse.json(
        { error: 'Missing required fields: projectName, budget, workItems' },
        { status: 400 }
      );
    }

    // วิเคราะห์ TOR
    const analysis = analyzeTOR(projectName, parseFloat(budget), workItems);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error analyzing TOR:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze-tor
 * ตัวอย่างการใช้งาน
 */
export async function GET() {
  return NextResponse.json({
    name: 'TOR Analyzer API',
    description: 'วิเคราะห์เอกสาร TOR และคำนวณต้นทุน-กำไร',
    example: {
      projectName: 'โครงการก่อสร้างอาคาร 5 ชั้น',
      budget: 50000000,
      workItems: [
        {
          name: 'งานโครงสร้าง',
          description: 'ก่อสร้างโครงสร้างอาคาร',
          quantity: 1,
          unit: 'งาน',
          materialCost: 20000000,
          laborCost: 7000000,
          equipmentCost: 2000000,
        },
        {
          name: 'งานสถาปัตยกรรม',
          description: 'งานตกแต่งภายใน-ภายนอก',
          quantity: 1,
          unit: 'งาน',
          materialCost: 10000000,
          laborCost: 3500000,
          equipmentCost: 1000000,
        },
        {
          name: 'งานระบบไฟฟ้า',
          description: 'ติดตั้งระบบไฟฟ้าทั้งหมด',
          quantity: 1,
          unit: 'งาน',
          materialCost: 3000000,
          laborCost: 1000000,
          equipmentCost: 500000,
        },
      ],
    },
    response: {
      success: true,
      analysis: {
        projectName: '...',
        budget: 50000000,
        workItems: [...],
        totalEstimatedCost: 48000000,
        profitAnalysis: {
          totalBudget: 50000000,
          totalDirectCost: 48000000,
          netProfit: 2000000,
          netProfitPercent: 4,
          recommendedBidPrice: 47500000,
        },
        risks: [...],
        recommendations: [...],
      },
    },
  });
}
