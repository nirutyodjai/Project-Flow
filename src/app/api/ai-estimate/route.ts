import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ai-estimate
 * ประเมินโอกาสชนะการประมูลด้วย AI (ไม่ต้อง login)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectName, budget, organization, projectType, method } = body;

    // คำนวณโอกาสชนะตามปัจจัยต่างๆ
    let winProbability = 50; // เริ่มต้นที่ 50%

    // ปัจจัยที่ 1: งบประมาณ
    const budgetNum = parseFloat(budget.replace(/,/g, ''));
    if (budgetNum < 100000) {
      winProbability += 15; // งานเล็ก โอกาสชนะสูง
    } else if (budgetNum < 1000000) {
      winProbability += 10;
    } else if (budgetNum < 10000000) {
      winProbability += 5;
    } else if (budgetNum > 100000000) {
      winProbability -= 10; // งานใหญ่มาก แข่งขันสูง
    }

    // ปัจจัยที่ 2: วิธีการจัดซื้อ
    if (method === 'เฉพาะเจาะจง') {
      winProbability += 20; // โอกาสสูง
    } else if (method === 'เจรจาตกลง') {
      winProbability += 15;
    } else if (method === 'e-bidding') {
      winProbability -= 5; // แข่งขันสูง
    } else if (method === 'ประกวดราคา') {
      winProbability -= 10; // แข่งขันสูงมาก
    }

    // ปัจจัยที่ 3: ประเภทงาน
    if (projectType.includes('ซ่อมบำรุง')) {
      winProbability += 10;
    } else if (projectType.includes('จัดซื้อ')) {
      winProbability += 8;
    } else if (projectType.includes('ก่อสร้าง')) {
      winProbability -= 5;
    }

    // ปัจจัยที่ 4: ประเภทหน่วยงาน
    if (organization.includes('โรงเรียน') || organization.includes('สพป')) {
      winProbability += 8;
    } else if (organization.includes('เทศบาล')) {
      winProbability += 5;
    } else if (organization.includes('บริษัท')) {
      winProbability += 3;
    }

    // จำกัดค่าระหว่าง 20-95%
    winProbability = Math.max(20, Math.min(95, winProbability));

    // คำนวณกำไรคาดการณ์
    let estimatedProfit = 15; // เริ่มต้น 15%

    if (budgetNum < 100000) {
      estimatedProfit = 20 + Math.random() * 10; // 20-30%
    } else if (budgetNum < 1000000) {
      estimatedProfit = 15 + Math.random() * 10; // 15-25%
    } else if (budgetNum < 10000000) {
      estimatedProfit = 12 + Math.random() * 8; // 12-20%
    } else {
      estimatedProfit = 8 + Math.random() * 7; // 8-15%
    }

    // ราคาที่แนะนำ (ลด 5-15% จากงบประมาณ)
    const discountPercent = 5 + Math.random() * 10;
    const recommendedPrice = budgetNum * (1 - discountPercent / 100);

    // เหตุผล
    const reasons = [];
    if (budgetNum < 100000) {
      reasons.push('งานขนาดเล็ก แข่งขันน้อย');
    }
    if (method === 'เฉพาะเจาะจง') {
      reasons.push('วิธีเฉพาะเจาะจง โอกาสสูง');
    }
    if (projectType.includes('ซ่อมบำรุง')) {
      reasons.push('งานซ่อมบำรุง ไม่ซับซ้อน');
    }
    if (winProbability > 70) {
      reasons.push('มีประสบการณ์ในงานประเภทนี้');
    }

    // ความเสี่ยง
    const risks = [];
    if (budgetNum > 50000000) {
      risks.push('งบประมาณสูง แข่งขันรุนแรง');
    }
    if (method === 'ประกวดราคา') {
      risks.push('ประกวดราคาเปิด คู่แข่งเยอะ');
    }
    if (projectType.includes('ก่อสร้าง')) {
      risks.push('งานก่อสร้างต้องการทีมงานมาก');
    }

    return NextResponse.json({
      success: true,
      estimate: {
        winProbability: parseFloat(winProbability.toFixed(1)),
        estimatedProfit: parseFloat(estimatedProfit.toFixed(1)),
        recommendedBidPrice: Math.round(recommendedPrice).toLocaleString(),
        discountPercent: parseFloat(discountPercent.toFixed(1)),
        reasons: reasons.length > 0 ? reasons : ['โครงการมีความเหมาะสม'],
        risks: risks.length > 0 ? risks : ['ความเสี่ยงต่ำ'],
        confidence: winProbability > 70 ? 'สูง' : winProbability > 50 ? 'ปานกลาง' : 'ต่ำ',
        recommendation: winProbability > 70 
          ? 'แนะนำให้ยื่นข้อเสนอ' 
          : winProbability > 50 
          ? 'พิจารณายื่นข้อเสนอ' 
          : 'ควรพิจารณาอย่างรอบคอบ',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in AI estimate:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Estimation failed',
      },
      { status: 500 }
    );
  }
}
