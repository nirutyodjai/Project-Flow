import { NextRequest, NextResponse } from 'next/server';
import { analyzeBOQ } from '@/lib/boq-analyzer';

/**
 * POST /api/analyze-boq
 * วิเคราะห์ BOQ และถอดรายการอุปกรณ์/วัสดุ
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, totalBudget, items } = body;

    if (!projectName || !totalBudget || !items) {
      return NextResponse.json(
        { error: 'Missing required fields: projectName, totalBudget, items' },
        { status: 400 }
      );
    }

    // วิเคราะห์ BOQ
    const analysis = analyzeBOQ(projectName, parseFloat(totalBudget), items);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error analyzing BOQ:', error);
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
 * GET /api/analyze-boq
 * ตัวอย่างการใช้งาน
 */
export async function GET() {
  return NextResponse.json({
    name: 'BOQ Analyzer API',
    description: 'วิเคราะห์ BOQ และถอดรายการอุปกรณ์/วัสดุอัตโนมัติ',
    features: [
      'ถอดรายการวัสดุพร้อมจำนวนและราคา',
      'ถอดรายการแรงงานตามประเภทและฝีมือ',
      'ถอดรายการเครื่องมือและอุปกรณ์',
      'คำนวณต้นทุนรวมทั้งหมด',
      'คำนวณกำไรสุทธิ',
      'สรุปวัสดุรวมทั้งโครงการ',
      'สรุปแรงงานรวม (Man-days)',
      'คำนวณ Timeline',
    ],
    example: {
      request: {
        projectName: 'โครงการก่อสร้างอาคาร',
        totalBudget: 10000000,
        items: [
          {
            no: '1',
            description: 'งานเทคอนกรีตพื้น',
            unit: 'ตร.ม.',
            quantity: 100,
          },
          {
            no: '2',
            description: 'งานก่ออิฐผนัง',
            unit: 'ตร.ม.',
            quantity: 200,
          },
          {
            no: '3',
            description: 'งานติดตั้งไฟฟ้า',
            unit: 'จุด',
            quantity: 50,
          },
          {
            no: '4',
            description: 'งานทาสีภายใน',
            unit: 'ตร.ม.',
            quantity: 300,
          },
        ],
      },
      response: {
        success: true,
        analysis: {
          projectName: 'โครงการก่อสร้างอาคาร',
          totalBudget: 10000000,
          items: [
            {
              no: '1',
              description: 'งานเทคอนกรีตพื้น',
              quantity: 100,
              materials: [
                {
                  name: 'คอนกรีตผสมเสร็จ',
                  specification: 'fc = 240 kg/cm²',
                  unit: 'ลบ.ม.',
                  totalQuantity: 105,
                  unitPrice: 2800,
                  totalPrice: 294000,
                },
                {
                  name: 'เหล็กเส้น',
                  specification: 'SD40, DB12',
                  unit: 'กก.',
                  totalQuantity: 12000,
                  unitPrice: 25,
                  totalPrice: 300000,
                },
              ],
              labor: [
                {
                  type: 'หัวหน้างาน',
                  skill: 'foreman',
                  manDays: 10,
                  dailyRate: 800,
                  totalCost: 8000,
                },
                {
                  type: 'ช่างเทคอนกรีต',
                  skill: 'skilled',
                  manDays: 30,
                  dailyRate: 600,
                  totalCost: 18000,
                },
              ],
            },
          ],
          summary: {
            totalItems: 4,
            totalMaterialCost: 1500000,
            totalLaborCost: 500000,
            totalEquipmentCost: 100000,
            totalDirectCost: 2100000,
            totalCost: 2500000,
            profit: 7500000,
            profitPercent: 75,
          },
          materialSummary: [
            {
              name: 'คอนกรีตผสมเสร็จ',
              totalQuantity: 105,
              unitPrice: 2800,
              totalPrice: 294000,
              usedInItems: ['1'],
            },
          ],
          laborSummary: [
            {
              type: 'ช่างเทคอนกรีต',
              skill: 'skilled',
              totalManDays: 30,
              dailyRate: 600,
              totalCost: 18000,
              usedInItems: ['1'],
            },
          ],
          timeline: {
            totalDuration: 45,
            criticalPath: ['งานเทคอนกรีตพื้น'],
          },
        },
      },
    },
  });
}
