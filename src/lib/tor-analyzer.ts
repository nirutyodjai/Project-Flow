/**
 * TOR Analyzer - วิเคราะห์เอกสาร TOR และคำนวณต้นทุน
 */

export interface TORAnalysis {
  projectName: string;
  budget: number;
  
  // การวิเคราะห์งาน
  workItems: WorkItem[];
  totalEstimatedCost: number;
  
  // การคำนวณกำไร
  profitAnalysis: ProfitAnalysis;
  
  // ความเสี่ยง
  risks: Risk[];
  
  // คำแนะนำ
  recommendations: string[];
}

export interface WorkItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  
  // ต้นทุน
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overheadCost: number;
  totalCost: number;
  
  // เวลา
  estimatedDays: number;
  
  // ความเสี่ยง
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ProfitAnalysis {
  // งบประมาณ
  totalBudget: number;
  
  // ต้นทุนรวม
  totalMaterialCost: number;
  totalLaborCost: number;
  totalEquipmentCost: number;
  totalOverheadCost: number;
  totalDirectCost: number;
  
  // ต้นทุนทางอ้อม
  managementCost: number;      // 5-10% ของต้นทุนตรง
  contingencyCost: number;     // 5-10% สำรองความเสี่ยง
  taxCost: number;             // 7% VAT
  
  // ต้นทุนรวมทั้งหมด
  totalCost: number;
  
  // กำไร
  grossProfit: number;
  grossProfitPercent: number;
  netProfit: number;
  netProfitPercent: number;
  
  // ราคาที่แนะนำ
  recommendedBidPrice: number;
  recommendedDiscount: number;
  
  // Break-even
  breakEvenPrice: number;
  safetyMargin: number;
}

export interface Risk {
  category: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
  mitigation: string;
  estimatedCost: number;
}

/**
 * วิเคราะห์ TOR และคำนวณต้นทุน
 */
export function analyzeTOR(
  projectName: string,
  budget: number,
  workItems: Partial<WorkItem>[]
): TORAnalysis {
  // คำนวณต้นทุนแต่ละรายการ
  const analyzedWorkItems = workItems.map((item, index) => 
    analyzeWorkItem(item, index)
  );
  
  // คำนวณต้นทุนรวม
  const totalEstimatedCost = analyzedWorkItems.reduce(
    (sum, item) => sum + item.totalCost, 
    0
  );
  
  // วิเคราะห์กำไร
  const profitAnalysis = analyzeProfitability(
    budget,
    analyzedWorkItems
  );
  
  // ประเมินความเสี่ยง
  const risks = assessRisks(analyzedWorkItems, profitAnalysis);
  
  // สร้างคำแนะนำ
  const recommendations = generateRecommendations(
    profitAnalysis,
    risks
  );
  
  return {
    projectName,
    budget,
    workItems: analyzedWorkItems,
    totalEstimatedCost,
    profitAnalysis,
    risks,
    recommendations,
  };
}

/**
 * วิเคราะห์รายการงานแต่ละรายการ
 */
function analyzeWorkItem(
  item: Partial<WorkItem>,
  index: number
): WorkItem {
  const quantity = item.quantity || 1;
  
  // ประมาณการต้นทุนวัสดุ (ถ้าไม่มีให้)
  const materialCost = item.materialCost || estimateMaterialCost(item);
  
  // ประมาณการค่าแรง (ถ้าไม่มีให้)
  const laborCost = item.laborCost || estimateLaborCost(item);
  
  // ประมาณการค่าเครื่องมือ
  const equipmentCost = item.equipmentCost || estimateEquipmentCost(item);
  
  // ค่าใช้จ่ายทั่วไป (10% ของต้นทุนตรง)
  const directCost = materialCost + laborCost + equipmentCost;
  const overheadCost = item.overheadCost || directCost * 0.1;
  
  // ต้นทุนรวม
  const totalCost = materialCost + laborCost + equipmentCost + overheadCost;
  
  // ประมาณการระยะเวลา
  const estimatedDays = item.estimatedDays || estimateDuration(item);
  
  // ประเมินความเสี่ยง
  const riskLevel = assessItemRisk(item, totalCost);
  
  return {
    id: item.id || `item-${index + 1}`,
    name: item.name || `รายการที่ ${index + 1}`,
    description: item.description || '',
    quantity,
    unit: item.unit || 'งาน',
    materialCost,
    laborCost,
    equipmentCost,
    overheadCost,
    totalCost,
    estimatedDays,
    riskLevel,
  };
}

/**
 * ประมาณการต้นทุนวัสดุ
 */
function estimateMaterialCost(item: Partial<WorkItem>): number {
  const name = item.name?.toLowerCase() || '';
  const quantity = item.quantity || 1;
  
  // ตัวอย่างการประมาณการ (ควรใช้ข้อมูลจริง)
  if (name.includes('ก่อสร้าง') || name.includes('อาคาร')) {
    return quantity * 500000; // 500k ต่อหน่วย
  }
  if (name.includes('ไฟฟ้า')) {
    return quantity * 200000;
  }
  if (name.includes('ปรับอากาศ')) {
    return quantity * 300000;
  }
  if (name.includes('ซ่อม')) {
    return quantity * 50000;
  }
  
  return quantity * 100000; // ค่าเริ่มต้น
}

/**
 * ประมาณการค่าแรง
 */
function estimateLaborCost(item: Partial<WorkItem>): number {
  const materialCost = item.materialCost || estimateMaterialCost(item);
  
  // ค่าแรงโดยทั่วไป 30-40% ของต้นทุนวัสดุ
  return materialCost * 0.35;
}

/**
 * ประมาณการค่าเครื่องมือ
 */
function estimateEquipmentCost(item: Partial<WorkItem>): number {
  const materialCost = item.materialCost || estimateMaterialCost(item);
  
  // ค่าเครื่องมือ 10-15% ของต้นทุนวัสดุ
  return materialCost * 0.12;
}

/**
 * ประมาณการระยะเวลา
 */
function estimateDuration(item: Partial<WorkItem>): number {
  const name = item.name?.toLowerCase() || '';
  const quantity = item.quantity || 1;
  
  if (name.includes('ก่อสร้าง') || name.includes('อาคาร')) {
    return quantity * 60; // 60 วันต่อหน่วย
  }
  if (name.includes('ติดตั้ง')) {
    return quantity * 15;
  }
  if (name.includes('ซ่อม')) {
    return quantity * 7;
  }
  
  return quantity * 30; // ค่าเริ่มต้น
}

/**
 * ประเมินความเสี่ยงของรายการ
 */
function assessItemRisk(
  item: Partial<WorkItem>,
  totalCost: number
): 'low' | 'medium' | 'high' {
  const name = item.name?.toLowerCase() || '';
  
  // งานที่มีความเสี่ยงสูง
  if (name.includes('ก่อสร้าง') || name.includes('โครงสร้าง')) {
    return 'high';
  }
  
  // งานที่มีความเสี่ยงปานกลาง
  if (name.includes('ระบบ') || name.includes('ติดตั้ง')) {
    return 'medium';
  }
  
  // งานที่มีความเสี่ยงต่ำ
  return 'low';
}

/**
 * วิเคราะห์ความสามารถในการทำกำไร
 */
function analyzeProfitability(
  budget: number,
  workItems: WorkItem[]
): ProfitAnalysis {
  // ต้นทุนตรง
  const totalMaterialCost = workItems.reduce((sum, item) => sum + item.materialCost, 0);
  const totalLaborCost = workItems.reduce((sum, item) => sum + item.laborCost, 0);
  const totalEquipmentCost = workItems.reduce((sum, item) => sum + item.equipmentCost, 0);
  const totalOverheadCost = workItems.reduce((sum, item) => sum + item.overheadCost, 0);
  const totalDirectCost = totalMaterialCost + totalLaborCost + totalEquipmentCost + totalOverheadCost;
  
  // ต้นทุนทางอ้อม
  const managementCost = totalDirectCost * 0.07; // 7% ค่าบริหารจัดการ
  const contingencyCost = totalDirectCost * 0.05; // 5% สำรองความเสี่ยง
  const taxCost = (totalDirectCost + managementCost) * 0.07; // 7% VAT
  
  // ต้นทุนรวมทั้งหมด
  const totalCost = totalDirectCost + managementCost + contingencyCost + taxCost;
  
  // กำไรขั้นต้น
  const grossProfit = budget - totalDirectCost;
  const grossProfitPercent = (grossProfit / budget) * 100;
  
  // กำไรสุทธิ
  const netProfit = budget - totalCost;
  const netProfitPercent = (netProfit / budget) * 100;
  
  // ราคาที่แนะนำ (ลด 5-10% จากงบประมาณ)
  const recommendedDiscount = netProfitPercent > 20 ? 0.08 : 0.05;
  const recommendedBidPrice = budget * (1 - recommendedDiscount);
  
  // Break-even price
  const breakEvenPrice = totalCost;
  const safetyMargin = ((budget - breakEvenPrice) / budget) * 100;
  
  return {
    totalBudget: budget,
    totalMaterialCost,
    totalLaborCost,
    totalEquipmentCost,
    totalOverheadCost,
    totalDirectCost,
    managementCost,
    contingencyCost,
    taxCost,
    totalCost,
    grossProfit,
    grossProfitPercent,
    netProfit,
    netProfitPercent,
    recommendedBidPrice,
    recommendedDiscount: recommendedDiscount * 100,
    breakEvenPrice,
    safetyMargin,
  };
}

/**
 * ประเมินความเสี่ยง
 */
function assessRisks(
  workItems: WorkItem[],
  profitAnalysis: ProfitAnalysis
): Risk[] {
  const risks: Risk[] = [];
  
  // ความเสี่ยงจากกำไรต่ำ
  if (profitAnalysis.netProfitPercent < 10) {
    risks.push({
      category: 'กำไร',
      description: 'กำไรสุทธิต่ำกว่า 10% มีความเสี่ยงสูง',
      impact: 'high',
      probability: 'high',
      mitigation: 'พิจารณาลดต้นทุนหรือเพิ่มราคาเสนอ',
      estimatedCost: profitAnalysis.totalBudget * 0.05,
    });
  }
  
  // ความเสี่ยงจากงานที่มีความซับซ้อนสูง
  const highRiskItems = workItems.filter(item => item.riskLevel === 'high');
  if (highRiskItems.length > 0) {
    risks.push({
      category: 'งานซับซ้อน',
      description: `มีงานที่มีความเสี่ยงสูง ${highRiskItems.length} รายการ`,
      impact: 'high',
      probability: 'medium',
      mitigation: 'จัดทีมงานที่มีประสบการณ์และเพิ่มเวลาสำรอง',
      estimatedCost: highRiskItems.reduce((sum, item) => sum + item.totalCost * 0.1, 0),
    });
  }
  
  // ความเสี่ยงจากระยะเวลา
  const totalDays = workItems.reduce((sum, item) => sum + item.estimatedDays, 0);
  if (totalDays > 180) {
    risks.push({
      category: 'ระยะเวลา',
      description: 'โครงการใช้เวลานานเกิน 6 เดือน',
      impact: 'medium',
      probability: 'medium',
      mitigation: 'วางแผนการทำงานแบบ Parallel และมี Buffer Time',
      estimatedCost: profitAnalysis.totalBudget * 0.03,
    });
  }
  
  return risks;
}

/**
 * สร้างคำแนะนำ
 */
function generateRecommendations(
  profitAnalysis: ProfitAnalysis,
  risks: Risk[]
): string[] {
  const recommendations: string[] = [];
  
  // คำแนะนำเรื่องกำไร
  if (profitAnalysis.netProfitPercent > 20) {
    recommendations.push('✅ กำไรสุทธิสูงกว่า 20% แนะนำให้ยื่นข้อเสนอ');
  } else if (profitAnalysis.netProfitPercent > 10) {
    recommendations.push('⚠️ กำไรสุทธิ 10-20% พิจารณายื่นข้อเสนอ');
  } else {
    recommendations.push('❌ กำไรสุทธิต่ำกว่า 10% ควรพิจารณาอย่างรอบคอบ');
  }
  
  // คำแนะนำเรื่องราคา
  recommendations.push(
    `💰 ราคาที่แนะนำ: ${profitAnalysis.recommendedBidPrice.toLocaleString()} บาท ` +
    `(ลด ${profitAnalysis.recommendedDiscount.toFixed(1)}%)`
  );
  
  // คำแนะนำเรื่องความเสี่ยง
  const highRisks = risks.filter(r => r.impact === 'high');
  if (highRisks.length > 0) {
    recommendations.push(`⚠️ พบความเสี่ยงสูง ${highRisks.length} รายการ ควรมีแผนรองรับ`);
  }
  
  // คำแนะนำเรื่อง Safety Margin
  if (profitAnalysis.safetyMargin < 15) {
    recommendations.push('⚠️ Safety Margin ต่ำ ควรเพิ่มราคาเสนอหรือลดต้นทุน');
  }
  
  return recommendations;
}
