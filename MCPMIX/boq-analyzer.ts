/**
 * BOQ Analyzer - วิเคราะห์ BOQ และถอดรายการอุปกรณ์/วัสดุ
 */

export interface BOQItem {
  id: string;
  no: string;                    // ลำดับที่
  description: string;           // รายการ
  unit: string;                  // หน่วย
  quantity: number;              // จำนวน
  
  // ราคาต่อหน่วย
  materialUnitPrice: number;     // ราคาวัสดุต่อหน่วย
  laborUnitPrice: number;        // ค่าแรงต่อหน่วย
  equipmentUnitPrice: number;    // ค่าเครื่องมือต่อหน่วย
  
  // ราคารวม
  materialTotal: number;
  laborTotal: number;
  equipmentTotal: number;
  totalPrice: number;
  
  // รายละเอียดเพิ่มเติม
  category: string;              // หมวดงาน
  subCategory?: string;          // หมวดย่อย
  specification?: string;        // ข้อกำหนด
  remark?: string;              // หมายเหตุ
  
  // การถอดรายการ
  materials: MaterialItem[];     // วัสดุที่ใช้
  labor: LaborItem[];           // แรงงานที่ใช้
  equipment: EquipmentItem[];   // เครื่องมือที่ใช้
}

export interface MaterialItem {
  id: string;
  name: string;                 // ชื่อวัสดุ
  specification: string;        // ข้อกำหนด
  unit: string;                 // หน่วย
  quantityPerUnit: number;      // จำนวนต่อหน่วยงาน
  totalQuantity: number;        // จำนวนรวม
  unitPrice: number;            // ราคาต่อหน่วย
  totalPrice: number;           // ราคารวม
  supplier?: string;            // ผู้จัดจำหน่าย
  leadTime?: number;            // ระยะเวลานำเข้า (วัน)
}

export interface LaborItem {
  id: string;
  type: string;                 // ประเภทแรงงาน (ช่างไฟฟ้า, ช่างปูน, etc.)
  skill: 'helper' | 'skilled' | 'foreman'; // ระดับฝีมือ
  quantityPerUnit: number;      // จำนวนคนต่อหน่วยงาน
  totalQuantity: number;        // จำนวนรวม
  manDays: number;              // จำนวนวันคน
  dailyRate: number;            // ค่าจ้างต่อวัน
  totalCost: number;            // ค่าใช้จ่ายรวม
}

export interface EquipmentItem {
  id: string;
  name: string;                 // ชื่อเครื่องมือ
  type: 'owned' | 'rented';     // เป็นของเราหรือเช่า
  quantityPerUnit: number;      // จำนวนต่อหน่วยงาน
  totalQuantity: number;        // จำนวนรวม
  usageDays: number;            // จำนวนวันที่ใช้
  dailyRate?: number;           // ค่าเช่าต่อวัน (ถ้าเช่า)
  totalCost: number;            // ค่าใช้จ่ายรวม
}

export interface BOQAnalysis {
  projectName: string;
  totalBudget: number;
  
  // รายการ BOQ
  items: BOQItem[];
  
  // สรุปรวม
  summary: {
    totalItems: number;
    totalMaterialCost: number;
    totalLaborCost: number;
    totalEquipmentCost: number;
    totalDirectCost: number;
    
    // ต้นทุนทางอ้อม
    overheadCost: number;        // 10%
    managementCost: number;      // 7%
    contingencyCost: number;     // 5%
    taxCost: number;             // 7% VAT
    
    totalCost: number;
    profit: number;
    profitPercent: number;
  };
  
  // รายการวัสดุรวม
  materialSummary: MaterialSummary[];
  
  // รายการแรงงานรวม
  laborSummary: LaborSummary[];
  
  // รายการเครื่องมือรวม
  equipmentSummary: EquipmentSummary[];
  
  // Timeline
  timeline: {
    totalDuration: number;       // วันทำงานรวม
    criticalPath: string[];      // งานสำคัญ
  };
}

export interface MaterialSummary {
  name: string;
  specification: string;
  unit: string;
  totalQuantity: number;
  unitPrice: number;
  totalPrice: number;
  usedInItems: string[];         // ใช้ในรายการไหนบ้าง
}

export interface LaborSummary {
  type: string;
  skill: string;
  totalManDays: number;
  dailyRate: number;
  totalCost: number;
  usedInItems: string[];
}

export interface EquipmentSummary {
  name: string;
  type: string;
  totalUsageDays: number;
  dailyRate: number;
  totalCost: number;
  usedInItems: string[];
}

/**
 * วิเคราะห์ BOQ และถอดรายการ
 */
export function analyzeBOQ(
  projectName: string,
  totalBudget: number,
  items: Partial<BOQItem>[]
): BOQAnalysis {
  // ถอดรายการแต่ละรายการ
  const analyzedItems = items.map((item, index) => 
    analyzeBOQItem(item, index)
  );
  
  // สรุปรวม
  const summary = calculateSummary(totalBudget, analyzedItems);
  
  // รวมวัสดุ
  const materialSummary = summarizeMaterials(analyzedItems);
  
  // รวมแรงงาน
  const laborSummary = summarizeLabor(analyzedItems);
  
  // รวมเครื่องมือ
  const equipmentSummary = summarizeEquipment(analyzedItems);
  
  // คำนวณ Timeline
  const timeline = calculateTimeline(analyzedItems);
  
  return {
    projectName,
    totalBudget,
    items: analyzedItems,
    summary,
    materialSummary,
    laborSummary,
    equipmentSummary,
    timeline,
  };
}

/**
 * ถอดรายการ BOQ แต่ละรายการ
 */
function analyzeBOQItem(
  item: Partial<BOQItem>,
  index: number
): BOQItem {
  const quantity = item.quantity || 1;
  const description = item.description || `รายการที่ ${index + 1}`;
  
  // ถอดวัสดุ
  const materials = extractMaterials(description, quantity, item);
  
  // ถอดแรงงาน
  const labor = extractLabor(description, quantity, item);
  
  // ถอดเครื่องมือ
  const equipment = extractEquipment(description, quantity, item);
  
  // คำนวณราคา
  const materialTotal = materials.reduce((sum, m) => sum + m.totalPrice, 0);
  const laborTotal = labor.reduce((sum, l) => sum + l.totalCost, 0);
  const equipmentTotal = equipment.reduce((sum, e) => sum + e.totalCost, 0);
  const totalPrice = materialTotal + laborTotal + equipmentTotal;
  
  return {
    id: item.id || `boq-${index + 1}`,
    no: item.no || `${index + 1}`,
    description,
    unit: item.unit || 'งาน',
    quantity,
    materialUnitPrice: materialTotal / quantity,
    laborUnitPrice: laborTotal / quantity,
    equipmentUnitPrice: equipmentTotal / quantity,
    materialTotal,
    laborTotal,
    equipmentTotal,
    totalPrice,
    category: item.category || categorizeItem(description),
    subCategory: item.subCategory,
    specification: item.specification,
    remark: item.remark,
    materials,
    labor,
    equipment,
  };
}

/**
 * ถอดรายการวัสดุ
 */
function extractMaterials(
  description: string,
  quantity: number,
  item: Partial<BOQItem>
): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const desc = description.toLowerCase();
  
  // ตัวอย่างการถอดวัสดุ (ควรใช้ Database จริง)
  
  // งานคอนกรีต
  if (desc.includes('คอนกรีต') || desc.includes('เทพื้น')) {
    materials.push({
      id: 'mat-concrete',
      name: 'คอนกรีตผสมเสร็จ',
      specification: 'fc = 240 kg/cm²',
      unit: 'ลบ.ม.',
      quantityPerUnit: 1.05, // 1.05 ลบ.ม. ต่อ 1 ลบ.ม. งาน (+ waste)
      totalQuantity: quantity * 1.05,
      unitPrice: 2800,
      totalPrice: quantity * 1.05 * 2800,
    });
    
    materials.push({
      id: 'mat-steel',
      name: 'เหล็กเส้น',
      specification: 'SD40, DB12',
      unit: 'กก.',
      quantityPerUnit: 120, // 120 กก. ต่อ 1 ลบ.ม.
      totalQuantity: quantity * 120,
      unitPrice: 25,
      totalPrice: quantity * 120 * 25,
    });
  }
  
  // งานก่ออิฐ
  if (desc.includes('ก่ออิฐ') || desc.includes('ผนัง')) {
    materials.push({
      id: 'mat-brick',
      name: 'อิฐมอญ',
      specification: '3 รู',
      unit: 'ก้อน',
      quantityPerUnit: 75, // 75 ก้อนต่อ 1 ตร.ม.
      totalQuantity: quantity * 75,
      unitPrice: 3.5,
      totalPrice: quantity * 75 * 3.5,
    });
    
    materials.push({
      id: 'mat-cement',
      name: 'ปูนซีเมนต์',
      specification: 'ตราเสือ',
      unit: 'ถุง',
      quantityPerUnit: 1.2, // 1.2 ถุงต่อ 1 ตร.ม.
      totalQuantity: quantity * 1.2,
      unitPrice: 150,
      totalPrice: quantity * 1.2 * 150,
    });
    
    materials.push({
      id: 'mat-sand',
      name: 'ทรายหยาบ',
      specification: '',
      unit: 'ลบ.ม.',
      quantityPerUnit: 0.03, // 0.03 ลบ.ม. ต่อ 1 ตร.ม.
      totalQuantity: quantity * 0.03,
      unitPrice: 400,
      totalPrice: quantity * 0.03 * 400,
    });
  }
  
  // งานไฟฟ้า
  if (desc.includes('ไฟฟ้า') || desc.includes('สายไฟ')) {
    materials.push({
      id: 'mat-wire',
      name: 'สายไฟ',
      specification: 'THW 2x2.5 sq.mm',
      unit: 'เมตร',
      quantityPerUnit: 15, // 15 เมตรต่อจุด
      totalQuantity: quantity * 15,
      unitPrice: 12,
      totalPrice: quantity * 15 * 12,
    });
    
    materials.push({
      id: 'mat-outlet',
      name: 'เต้ารับ',
      specification: '3 รู มีกราวด์',
      unit: 'ชุด',
      quantityPerUnit: 1,
      totalQuantity: quantity,
      unitPrice: 85,
      totalPrice: quantity * 85,
    });
  }
  
  // งานทาสี
  if (desc.includes('ทาสี') || desc.includes('สี')) {
    materials.push({
      id: 'mat-paint',
      name: 'สีน้ำอะครีลิค',
      specification: 'TOA',
      unit: 'แกลลอน',
      quantityPerUnit: 0.15, // 0.15 แกลลอนต่อ 1 ตร.ม.
      totalQuantity: quantity * 0.15,
      unitPrice: 850,
      totalPrice: quantity * 0.15 * 850,
    });
    
    materials.push({
      id: 'mat-primer',
      name: 'สีรองพื้น',
      specification: 'TOA',
      unit: 'แกลลอน',
      quantityPerUnit: 0.1,
      totalQuantity: quantity * 0.1,
      unitPrice: 650,
      totalPrice: quantity * 0.1 * 650,
    });
  }
  
  return materials;
}

/**
 * ถอดรายการแรงงาน
 */
function extractLabor(
  description: string,
  quantity: number,
  item: Partial<BOQItem>
): LaborItem[] {
  const labor: LaborItem[] = [];
  const desc = description.toLowerCase();
  
  // งานคอนกรีต
  if (desc.includes('คอนกรีต')) {
    labor.push({
      id: 'labor-concrete-foreman',
      type: 'หัวหน้างาน',
      skill: 'foreman',
      quantityPerUnit: 0.1,
      totalQuantity: quantity * 0.1,
      manDays: quantity * 0.1,
      dailyRate: 800,
      totalCost: quantity * 0.1 * 800,
    });
    
    labor.push({
      id: 'labor-concrete-skilled',
      type: 'ช่างเทคอนกรีต',
      skill: 'skilled',
      quantityPerUnit: 0.3,
      totalQuantity: quantity * 0.3,
      manDays: quantity * 0.3,
      dailyRate: 600,
      totalCost: quantity * 0.3 * 600,
    });
    
    labor.push({
      id: 'labor-concrete-helper',
      type: 'ผู้ช่วย',
      skill: 'helper',
      quantityPerUnit: 0.5,
      totalQuantity: quantity * 0.5,
      manDays: quantity * 0.5,
      dailyRate: 400,
      totalCost: quantity * 0.5 * 400,
    });
  }
  
  // งานก่ออิฐ
  if (desc.includes('ก่ออิฐ')) {
    labor.push({
      id: 'labor-mason-skilled',
      type: 'ช่างก่อ',
      skill: 'skilled',
      quantityPerUnit: 0.4,
      totalQuantity: quantity * 0.4,
      manDays: quantity * 0.4,
      dailyRate: 600,
      totalCost: quantity * 0.4 * 600,
    });
    
    labor.push({
      id: 'labor-mason-helper',
      type: 'ผู้ช่วย',
      skill: 'helper',
      quantityPerUnit: 0.4,
      totalQuantity: quantity * 0.4,
      manDays: quantity * 0.4,
      dailyRate: 400,
      totalCost: quantity * 0.4 * 400,
    });
  }
  
  // งานไฟฟ้า
  if (desc.includes('ไฟฟ้า')) {
    labor.push({
      id: 'labor-electrician',
      type: 'ช่างไฟฟ้า',
      skill: 'skilled',
      quantityPerUnit: 0.2,
      totalQuantity: quantity * 0.2,
      manDays: quantity * 0.2,
      dailyRate: 700,
      totalCost: quantity * 0.2 * 700,
    });
  }
  
  // งานทาสี
  if (desc.includes('ทาสี')) {
    labor.push({
      id: 'labor-painter',
      type: 'ช่างทาสี',
      skill: 'skilled',
      quantityPerUnit: 0.15,
      totalQuantity: quantity * 0.15,
      manDays: quantity * 0.15,
      dailyRate: 550,
      totalCost: quantity * 0.15 * 550,
    });
  }
  
  return labor;
}

/**
 * ถอดรายการเครื่องมือ
 */
function extractEquipment(
  description: string,
  quantity: number,
  item: Partial<BOQItem>
): EquipmentItem[] {
  const equipment: EquipmentItem[] = [];
  const desc = description.toLowerCase();
  
  // งานคอนกรีต
  if (desc.includes('คอนกรีต')) {
    equipment.push({
      id: 'eq-concrete-mixer',
      name: 'เครื่องผสมคอนกรีต',
      type: 'rented',
      quantityPerUnit: 0.5,
      totalQuantity: quantity * 0.5,
      usageDays: quantity * 0.5,
      dailyRate: 500,
      totalCost: quantity * 0.5 * 500,
    });
    
    equipment.push({
      id: 'eq-vibrator',
      name: 'เครื่องสั่นคอนกรีต',
      type: 'owned',
      quantityPerUnit: 0.3,
      totalQuantity: quantity * 0.3,
      usageDays: quantity * 0.3,
      totalCost: quantity * 0.3 * 100, // ค่าเสื่อม
    });
  }
  
  // งานไฟฟ้า
  if (desc.includes('ไฟฟ้า')) {
    equipment.push({
      id: 'eq-drill',
      name: 'สว่านไฟฟ้า',
      type: 'owned',
      quantityPerUnit: 0.1,
      totalQuantity: quantity * 0.1,
      usageDays: quantity * 0.1,
      totalCost: quantity * 0.1 * 50,
    });
  }
  
  return equipment;
}

/**
 * จัดหมวดหมู่รายการ
 */
function categorizeItem(description: string): string {
  const desc = description.toLowerCase();
  
  if (desc.includes('คอนกรีต') || desc.includes('โครงสร้าง')) return 'งานโครงสร้าง';
  if (desc.includes('ก่ออิฐ') || desc.includes('ผนัง')) return 'งานสถาปัตยกรรม';
  if (desc.includes('ไฟฟ้า')) return 'งานระบบไฟฟ้า';
  if (desc.includes('ประปา') || desc.includes('สุขภัณฑ์')) return 'งานระบบประปา';
  if (desc.includes('ทาสี')) return 'งานตกแต่ง';
  if (desc.includes('ปรับอากาศ')) return 'งานระบบปรับอากาศ';
  
  return 'งานอื่นๆ';
}

/**
 * คำนวณสรุปรวม
 */
function calculateSummary(
  totalBudget: number,
  items: BOQItem[]
): BOQAnalysis['summary'] {
  const totalMaterialCost = items.reduce((sum, item) => sum + item.materialTotal, 0);
  const totalLaborCost = items.reduce((sum, item) => sum + item.laborTotal, 0);
  const totalEquipmentCost = items.reduce((sum, item) => sum + item.equipmentTotal, 0);
  const totalDirectCost = totalMaterialCost + totalLaborCost + totalEquipmentCost;
  
  const overheadCost = totalDirectCost * 0.10;
  const managementCost = totalDirectCost * 0.07;
  const contingencyCost = totalDirectCost * 0.05;
  const taxCost = (totalDirectCost + managementCost) * 0.07;
  
  const totalCost = totalDirectCost + overheadCost + managementCost + contingencyCost + taxCost;
  const profit = totalBudget - totalCost;
  const profitPercent = (profit / totalBudget) * 100;
  
  return {
    totalItems: items.length,
    totalMaterialCost,
    totalLaborCost,
    totalEquipmentCost,
    totalDirectCost,
    overheadCost,
    managementCost,
    contingencyCost,
    taxCost,
    totalCost,
    profit,
    profitPercent,
  };
}

/**
 * สรุปวัสดุรวม
 */
function summarizeMaterials(items: BOQItem[]): MaterialSummary[] {
  const materialMap = new Map<string, MaterialSummary>();
  
  items.forEach(item => {
    item.materials.forEach(material => {
      const key = `${material.name}-${material.specification}`;
      
      if (materialMap.has(key)) {
        const existing = materialMap.get(key)!;
        existing.totalQuantity += material.totalQuantity;
        existing.totalPrice += material.totalPrice;
        existing.usedInItems.push(item.no);
      } else {
        materialMap.set(key, {
          name: material.name,
          specification: material.specification,
          unit: material.unit,
          totalQuantity: material.totalQuantity,
          unitPrice: material.unitPrice,
          totalPrice: material.totalPrice,
          usedInItems: [item.no],
        });
      }
    });
  });
  
  return Array.from(materialMap.values());
}

/**
 * สรุปแรงงานรวม
 */
function summarizeLabor(items: BOQItem[]): LaborSummary[] {
  const laborMap = new Map<string, LaborSummary>();
  
  items.forEach(item => {
    item.labor.forEach(labor => {
      const key = `${labor.type}-${labor.skill}`;
      
      if (laborMap.has(key)) {
        const existing = laborMap.get(key)!;
        existing.totalManDays += labor.manDays;
        existing.totalCost += labor.totalCost;
        existing.usedInItems.push(item.no);
      } else {
        laborMap.set(key, {
          type: labor.type,
          skill: labor.skill,
          totalManDays: labor.manDays,
          dailyRate: labor.dailyRate,
          totalCost: labor.totalCost,
          usedInItems: [item.no],
        });
      }
    });
  });
  
  return Array.from(laborMap.values());
}

/**
 * สรุปเครื่องมือรวม
 */
function summarizeEquipment(items: BOQItem[]): EquipmentSummary[] {
  const equipmentMap = new Map<string, EquipmentSummary>();
  
  items.forEach(item => {
    item.equipment.forEach(equipment => {
      const key = equipment.name;
      
      if (equipmentMap.has(key)) {
        const existing = equipmentMap.get(key)!;
        existing.totalUsageDays += equipment.usageDays;
        existing.totalCost += equipment.totalCost;
        existing.usedInItems.push(item.no);
      } else {
        equipmentMap.set(key, {
          name: equipment.name,
          type: equipment.type,
          totalUsageDays: equipment.usageDays,
          dailyRate: equipment.dailyRate || 0,
          totalCost: equipment.totalCost,
          usedInItems: [item.no],
        });
      }
    });
  });
  
  return Array.from(equipmentMap.values());
}

/**
 * คำนวณ Timeline
 */
function calculateTimeline(items: BOQItem[]): BOQAnalysis['timeline'] {
  // คำนวณระยะเวลารวม (แบบง่าย)
  const totalManDays = items.reduce((sum, item) => {
    const itemManDays = item.labor.reduce((s, l) => s + l.manDays, 0);
    return sum + itemManDays;
  }, 0);
  
  // สมมติว่ามีคนทำงาน 10 คนต่อวัน
  const totalDuration = Math.ceil(totalManDays / 10);
  
  // งานสำคัญ (งานที่ใช้เวลานานที่สุด)
  const criticalPath = items
    .sort((a, b) => {
      const aManDays = a.labor.reduce((s, l) => s + l.manDays, 0);
      const bManDays = b.labor.reduce((s, l) => s + l.manDays, 0);
      return bManDays - aManDays;
    })
    .slice(0, 5)
    .map(item => item.description);
  
  return {
    totalDuration,
    criticalPath,
  };
}
