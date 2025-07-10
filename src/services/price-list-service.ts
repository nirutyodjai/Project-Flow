'use server';
/**
 * @fileOverview บริการจัดการข้อมูลสินค้าและราคา สำหรับการคำนวณต้นทุน กำไร-ขาดทุน ในการจัดทำ BOQ
 */

import { getDb } from './firebase';
import { collection, addDoc, updateDoc, getDoc, doc, serverTimestamp, 
         query, orderBy, limit, getDocs, where, deleteDoc } from 'firebase/firestore';

/**
 * ประเภทข้อมูลสำหรับรายการในไพรีสลิสต์
 */
export interface PriceListItem {
  id?: string;
  materialCode: string;
  budgetCode?: string;
  description: string;
  detail?: string;
  unit: string;
  priceList: number;
  discount?: number;
  netPrice?: number;
  upPrice?: number;
  submitPrice?: number;
  manPower?: number;
  labour?: number;
  standardPrice?: number; // ราคากลาง
  miscellaneous?: number;
  miscPercent?: number;
  fitting?: number;
  fittingPercent?: number;
  support?: number;
  supportPercent?: number;
  other?: number;
  otherPercent?: number;
  remark?: string;
  maker?: string;
  supplier?: string;
  category?: string;
  subcategory?: string;
  updatedAt?: string;
  lastUpdated?: string;
  createdAt?: string;
  isActive?: boolean;
}

/**
 * ข้อมูลการอัปเดตราคา
 */
export interface PriceListUpdate {
  updateDate: string;
  updateId: string;
  fixRate1?: number;
  fixRate2?: number;
  description?: string;
  updatedBy?: string;
}

/**
 * ข้อมูลการคำนวณต้นทุนและกำไร
 */
export interface CostProfitBreakdown {
  materialCost: number;     // ต้นทุนวัสดุ
  labourCost: number;       // ต้นทุนแรงงาน
  overheadCost: number;     // ค่าโสหุ้ย
  profit: number;           // กำไร
  profitPercent: number;    // เปอร์เซ็นต์กำไร
  totalCost: number;        // ต้นทุนรวม
  submitPrice: number;      // ราคาเสนอ
}

/**
 * คำนวณราคาสุทธิจากส่วนลด
 * @param price ราคาเต็ม
 * @param discount เปอร์เซ็นต์ส่วนลด
 * @returns ราคาสุทธิ
 */
export function calculateNetPrice(price: number, discount: number): number {
  return price * (1 - discount / 100);
}

/**
 * คำนวณราคาเพิ่มขึ้น
 * @param netPrice ราคาสุทธิ
 * @param upPercent เปอร์เซ็นต์ที่เพิ่มขึ้น
 * @returns ราคาที่เพิ่มขึ้น
 */
export function calculateUpPrice(netPrice: number, upPercent: number): number {
  return netPrice * (1 + upPercent / 100);
}

/**
 * เพิ่มรายการสินค้าใหม่ในไพรีสลิสต์
 * @param item ข้อมูลรายการสินค้า
 * @returns ID ของรายการที่เพิ่ม
 */
export async function addPriceListItem(item: PriceListItem): Promise<string> {
  try {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');

    // คำนวณค่าต่างๆ อัตโนมัติถ้าไม่ได้ระบุ
    if (!item.netPrice && item.priceList && item.discount) {
      item.netPrice = calculateNetPrice(item.priceList, item.discount);
    }
    
    if (!item.submitPrice && item.netPrice && item.upPrice) {
      item.submitPrice = calculateUpPrice(item.netPrice, item.upPrice);
    }

    const priceListCollection = collection(db, 'priceList');
    const now = new Date().toISOString();
    
    const docRef = await addDoc(priceListCollection, {
      ...item,
      createdAt: now,
      updatedAt: now,
      lastUpdated: now,
      isActive: true
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding price list item:', error);
    throw new Error('Failed to add price list item');
  }
}

/**
 * อัปเดตรายการสินค้าในไพรีสลิสต์
 * @param id ID ของรายการ
 * @param updates ข้อมูลที่ต้องการอัปเดต
 */
export async function updatePriceListItem(id: string, updates: Partial<PriceListItem>): Promise<void> {
  try {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    
    const docRef = doc(db, 'priceList', id);
    const now = new Date().toISOString();
    
    // คำนวณค่าต่างๆ อัตโนมัติถ้ามีการอัปเดต
    if (updates.priceList !== undefined && updates.discount !== undefined) {
      updates.netPrice = calculateNetPrice(updates.priceList, updates.discount);
    }
    
    if (updates.netPrice !== undefined && updates.upPrice !== undefined) {
      updates.submitPrice = calculateUpPrice(updates.netPrice, updates.upPrice);
    }
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
      lastUpdated: now
    });
  } catch (error) {
    console.error(`Error updating price list item ${id}:`, error);
    throw new Error(`Failed to update price list item ${id}`);
  }
}

/**
 * ลบรายการสินค้าในไพรีสลิสต์ (ทำการลบแบบ soft delete โดยการตั้งค่า isActive เป็น false)
 * @param id ID ของรายการ
 */
export async function deletePriceListItem(id: string): Promise<void> {
  try {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    
    const docRef = doc(db, 'priceList', id);
    const now = new Date().toISOString();
    
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: now,
      lastUpdated: now
    });
  } catch (error) {
    console.error(`Error deleting price list item ${id}:`, error);
    throw new Error(`Failed to delete price list item ${id}`);
  }
}

/**
 * ดึงรายการสินค้าในไพรีสลิสต์ตาม ID
 * @param id ID ของรายการ
 * @returns ข้อมูลรายการสินค้า
 */
export async function getPriceListItemById(id: string): Promise<PriceListItem | null> {
  try {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    
    const docRef = doc(db, 'priceList', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return { id: docSnap.id, ...docSnap.data() } as PriceListItem;
  } catch (error) {
    console.error(`Error getting price list item ${id}:`, error);
    throw new Error(`Failed to get price list item ${id}`);
  }
}

/**
 * ค้นหารายการสินค้าในไพรีสลิสต์
 * @param searchParams พารามิเตอร์สำหรับการค้นหา
 * @returns รายการสินค้าที่ค้นพบ
 */
export async function searchPriceListItems(searchParams: {
  materialCode?: string;
  budgetCode?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  supplier?: string;
  maker?: string;
  onlyActive?: boolean;
}): Promise<PriceListItem[]> {
  try {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    
    // สร้างคำสั่ง query พื้นฐาน
    let priceListQuery = query(collection(db, 'priceList'));
    
    // เพิ่มเงื่อนไขการค้นหา
    if (searchParams.onlyActive !== false) { // ค่าเริ่มต้นคือ true
      priceListQuery = query(priceListQuery, where('isActive', '==', true));
    }
    
    // ดึงข้อมูลทั้งหมดมาก่อนเพื่อกรองในแอปพลิเคชัน
    // (เนื่องจาก Firestore มีข้อจำกัดในการค้นหาข้อความบางส่วน)
    const querySnapshot = await getDocs(priceListQuery);
    let results = querySnapshot.docs.map(doc => ({ 
      id: doc.id, ...doc.data() 
    } as PriceListItem));
    
    // กรองผลลัพธ์เพิ่มเติมตามเงื่อนไข
    if (searchParams.materialCode) {
      results = results.filter(item => 
        item.materialCode && item.materialCode.toLowerCase().includes(searchParams.materialCode!.toLowerCase())
      );
    }
    
    if (searchParams.budgetCode) {
      results = results.filter(item => 
        item.budgetCode && item.budgetCode.toLowerCase().includes(searchParams.budgetCode!.toLowerCase())
      );
    }
    
    if (searchParams.description) {
      results = results.filter(item => 
        item.description && item.description.toLowerCase().includes(searchParams.description!.toLowerCase())
      );
    }
    
    if (searchParams.category) {
      results = results.filter(item => 
        item.category && item.category.toLowerCase() === searchParams.category!.toLowerCase()
      );
    }
    
    if (searchParams.subcategory) {
      results = results.filter(item => 
        item.subcategory && item.subcategory.toLowerCase() === searchParams.subcategory!.toLowerCase()
      );
    }
    
    if (searchParams.supplier) {
      results = results.filter(item => 
        item.supplier && item.supplier.toLowerCase().includes(searchParams.supplier!.toLowerCase())
      );
    }
    
    if (searchParams.maker) {
      results = results.filter(item => 
        item.maker && item.maker.toLowerCase().includes(searchParams.maker!.toLowerCase())
      );
    }
    
    return results;
  } catch (error) {
    console.error('Error searching price list items:', error);
    throw new Error('Failed to search price list items');
  }
}

/**
 * ดึงข้อมูลประเภทสินค้าทั้งหมดในไพรีสลิสต์
 * @returns รายการประเภทสินค้าที่ไม่ซ้ำกัน
 */
export async function getDistinctCategories(): Promise<string[]> {
  try {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    
    const querySnapshot = await getDocs(collection(db, 'priceList'));
    const categories = new Set<string>();
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });
    
    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error getting distinct categories:', error);
    throw new Error('Failed to get distinct categories');
  }
}

/**
 * บันทึกการอัปเดตราคา
 * @param updateData ข้อมูลการอัปเดต
 * @returns ID ของการอัปเดต
 */
export async function savePriceListUpdate(updateData: PriceListUpdate): Promise<string> {
  try {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    
    const updateCollection = collection(db, 'priceListUpdates');
    const now = new Date().toISOString();
    
    const docRef = await addDoc(updateCollection, {
      ...updateData,
      createdAt: now
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving price list update:', error);
    throw new Error('Failed to save price list update');
  }
}

/**
 * ดึงประวัติการอัปเดตราคา
 * @param limit จำนวนรายการที่ต้องการ
 * @returns ประวัติการอัปเดตราคา
 */
export async function getPriceListUpdates(limitCount: number = 10): Promise<PriceListUpdate[]> {
  try {
    const db = getDb();
    if (!db) throw new Error('Firestore not initialized');
    
    const updatesQuery = query(
      collection(db, 'priceListUpdates'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(updatesQuery);
    return querySnapshot.docs.map(doc => ({ 
      ...doc.data(),
      updateId: doc.id 
    } as PriceListUpdate));
  } catch (error) {
    console.error('Error getting price list updates:', error);
    throw new Error('Failed to get price list updates');
  }
}

/**
 * นำเข้าข้อมูลไพรีสลิสต์หลายรายการ
 * @param items รายการสินค้าหลายรายการ
 * @returns จำนวนรายการที่นำเข้าสำเร็จ
 */
export async function importPriceListItems(items: PriceListItem[]): Promise<number> {
  try {
    let successCount = 0;
    const now = new Date().toISOString();
    
    for (const item of items) {
      try {
        await addPriceListItem({
          ...item,
          createdAt: now,
          updatedAt: now,
          lastUpdated: now
        });
        successCount++;
      } catch (itemError) {
        console.error(`Error importing item ${item.materialCode}:`, itemError);
        // ข้ามรายการที่มีปัญหาและทำต่อไป
      }
    }
    
    return successCount;
  } catch (error) {
    console.error('Error importing price list items:', error);
    throw new Error('Failed to import price list items');
  }
}

/**
 * อัปเดตราคาสินค้าตามประเภทสินค้า
 * @param category ประเภทสินค้า
 * @param updateParams พารามิเตอร์สำหรับการอัปเดต
 * @returns จำนวนรายการที่อัปเดตสำเร็จ
 */
export async function updatePricesByCategory(
  category: string, 
  updateParams: {
    priceIncreasePercent?: number;
    newDiscount?: number;
    newUpPrice?: number;
  }
): Promise<number> {
  try {
    const items = await searchPriceListItems({ category });
    let updatedCount = 0;
    
    for (const item of items) {
      try {
        const updates: Partial<PriceListItem> = {};
        
        if (updateParams.priceIncreasePercent !== undefined) {
          updates.priceList = item.priceList * (1 + updateParams.priceIncreasePercent / 100);
        }
        
        if (updateParams.newDiscount !== undefined) {
          updates.discount = updateParams.newDiscount;
        }
        
        if (updateParams.newUpPrice !== undefined) {
          updates.upPrice = updateParams.newUpPrice;
        }
        
        // คำนวณ netPrice และ submitPrice ใหม่
        if (updates.priceList !== undefined || updates.discount !== undefined) {
          const discount = updates.discount !== undefined ? updates.discount : (item.discount || 0);
          const priceList = updates.priceList !== undefined ? updates.priceList : item.priceList;
          updates.netPrice = calculateNetPrice(priceList, discount);
        }
        
        if (updates.netPrice !== undefined || updates.upPrice !== undefined) {
          const upPrice = updates.upPrice !== undefined ? updates.upPrice : (item.upPrice || 0);
          const netPrice = updates.netPrice !== undefined ? updates.netPrice : (item.netPrice || item.priceList);
          updates.submitPrice = calculateUpPrice(netPrice, upPrice);
        }
        
        if (item.id) {
          await updatePriceListItem(item.id, updates);
          updatedCount++;
        }
      } catch (itemError) {
        console.error(`Error updating item ${item.materialCode}:`, itemError);
        // ข้ามรายการที่มีปัญหาและทำต่อไป
      }
    }
    
    return updatedCount;
  } catch (error) {
    console.error(`Error updating prices for category ${category}:`, error);
    throw new Error(`Failed to update prices for category ${category}`);
  }
}

/**
 * สร้างข้อมูลตัวอย่างสำหรับสายไฟ (LV. POWER) จากตัวอย่างที่ให้มา
 * @returns รายการข้อมูลตัวอย่าง
 */
export function createSampleWireData(): PriceListItem[] {
  return [
    {
      materialCode: "101001",
      description: "Wire IEC01 (THW) 750V",
      detail: "1.5 sq.mm.",
      unit: "m.",
      priceList: 11,
      discount: 40,
      netPrice: 7,
      upPrice: 15,
      submitPrice: 9,
      manPower: 0.006,
      labour: 6,
      standardPrice: 5,
      miscellaneous: 5.0,
      remark: "",
      maker: "Thai Yazaki",
      supplier: "SCC",
      category: "LV. POWER (THW, IEC10, IEC53, NYY, VCT)",
      subcategory: "750V Wire IEC01 (THW) TIS 11-2553_Part 3",
      lastUpdated: "2024-05-01"
    },
    {
      materialCode: "101001",
      description: "Wire IEC01 (THW) 750V",
      detail: "2.5 sq.mm.",
      unit: "m.",
      priceList: 18,
      discount: 40,
      netPrice: 11,
      upPrice: 15,
      submitPrice: 13,
      manPower: 0.007,
      labour: 7,
      standardPrice: 7,
      miscellaneous: 5.0,
      remark: "",
      maker: "Thai Yazaki",
      supplier: "SCC",
      category: "LV. POWER (THW, IEC10, IEC53, NYY, VCT)",
      subcategory: "750V Wire IEC01 (THW) TIS 11-2553_Part 3",
      lastUpdated: "2024-05-01"
    },
    {
      materialCode: "101001",
      description: "Wire IEC01 (THW) 750V",
      detail: "4 sq.mm.",
      unit: "m.",
      priceList: 28,
      discount: 40,
      netPrice: 17,
      upPrice: 15,
      submitPrice: 20,
      manPower: 0.008,
      labour: 8,
      standardPrice: 10,
      miscellaneous: 5.0,
      remark: "",
      maker: "Thai Yazaki",
      supplier: "SCC",
      category: "LV. POWER (THW, IEC10, IEC53, NYY, VCT)",
      subcategory: "750V Wire IEC01 (THW) TIS 11-2553_Part 3",
      lastUpdated: "2024-05-01"
    },
    {
      materialCode: "101001",
      description: "Wire IEC01 (THW) 750V",
      detail: "6 sq.mm.",
      unit: "m.",
      priceList: 42,
      discount: 40,
      netPrice: 25,
      upPrice: 15,
      submitPrice: 30,
      manPower: 0.009,
      labour: 9,
      standardPrice: 12,
      miscellaneous: 5.0,
      remark: "",
      maker: "Thai Yazaki",
      supplier: "SCC",
      category: "LV. POWER (THW, IEC10, IEC53, NYY, VCT)",
      subcategory: "750V Wire IEC01 (THW) TIS 11-2553_Part 3",
      lastUpdated: "2024-05-01"
    },
    {
      materialCode: "101001",
      description: "Wire IEC01 (THW) 750V",
      detail: "10 sq.mm.",
      unit: "m.",
      priceList: 69,
      discount: 40,
      netPrice: 41,
      upPrice: 15,
      submitPrice: 49,
      manPower: 0.010,
      labour: 10,
      standardPrice: 16,
      miscellaneous: 5.0,
      remark: "",
      maker: "Thai Yazaki",
      supplier: "SCC",
      category: "LV. POWER (THW, IEC10, IEC53, NYY, VCT)",
      subcategory: "750V Wire IEC01 (THW) TIS 11-2553_Part 3",
      lastUpdated: "2024-05-01"
    }
  ];
}

/**
 * คำนวณโครงสร้างต้นทุนและกำไรของรายการในไพรีสลิสต์
 * 
 * @param item รายการไพรีสลิสต์
 * @param overrideParams พารามิเตอร์สำหรับปรับค่า (optional)
 * @returns ข้อมูลการคำนวณต้นทุนและกำไร
 */
export function calculateCostProfitBreakdown(
  item: PriceListItem,
  overrideParams?: {
    profitTarget?: number;        // เป้าหมายเปอร์เซ็นต์กำไร (%)
    overheadPercent?: number;     // เปอร์เซ็นต์ค่าโสหุ้ย (%)
    labourCostPercent?: number;   // เปอร์เซ็นต์ค่าแรงต่อต้นทุนวัสดุ (%)
  }
): CostProfitBreakdown {
  // กำหนดค่าเริ่มต้นสำหรับการคำนวณ
  const profitTarget = overrideParams?.profitTarget || 10; // เป้าหมายกำไร 10%
  const overheadPercent = overrideParams?.overheadPercent || 8; // ค่าโสหุ้ย 8%
  const labourCostPercent = overrideParams?.labourCostPercent || 15; // ค่าแรงงาน 15% ของต้นทุนวัสดุ
  
  // คำนวณต้นทุนวัสดุ (ใช้ net price ถ้ามี หรือคำนวณจาก priceList และ discount)
  const materialCost = item.netPrice || calculateNetPrice(item);
  
  // คำนวณค่าแรงงาน (ใช้ค่าที่ระบุไว้ถ้ามี หรือคำนวณเป็นเปอร์เซ็นต์จากต้นทุนวัสดุ)
  const labourCost = item.labour || (materialCost * (labourCostPercent / 100));
  
  // คำนวณค่าโสหุ้ย (จากต้นทุนวัสดุและแรงงานรวมกัน)
  const baseCost = materialCost + labourCost;
  const overheadCost = baseCost * (overheadPercent / 100);
  
  // คำนวณต้นทุนรวม
  const totalCost = materialCost + labourCost + overheadCost;
  
  // คำนวณกำไร (ใช้ submitPrice ถ้ามีการกำหนดไว้แล้ว หรือคำนวณตามเป้าหมายกำไร)
  let submitPrice = 0;
  let profit = 0;
  let profitPercent = 0;
  
  if (item.submitPrice) {
    // ถ้ามีการกำหนด submitPrice ไว้แล้ว
    submitPrice = item.submitPrice;
    profit = submitPrice - totalCost;
    profitPercent = (profit / totalCost) * 100;
  } else {
    // ถ้ายังไม่มีการกำหนด submitPrice
    profitPercent = profitTarget;
    profit = totalCost * (profitPercent / 100);
    submitPrice = totalCost + profit;
  }
  
  return {
    materialCost,
    labourCost,
    overheadCost,
    profit,
    profitPercent,
    totalCost,
    submitPrice
  };
}

/**
 * คำนวณโครงสร้างต้นทุนและกำไรสำหรับหลายรายการพร้อมกัน
 * 
 * @param items รายการไพรีสลิสต์
 * @param quantities ปริมาณของแต่ละรายการ
 * @param overrideParams พารามิเตอร์สำหรับปรับค่า (optional)
 * @returns ข้อมูลสรุปการคำนวณต้นทุนและกำไรรวม
 */
export function calculateBatchCostProfitBreakdown(
  items: PriceListItem[],
  quantities: number[],
  overrideParams?: {
    profitTarget?: number;
    overheadPercent?: number;
    labourCostPercent?: number;
  }
): {
  individualBreakdowns: (CostProfitBreakdown & { quantity: number; totalPrice: number })[];
  summary: {
    totalMaterialCost: number;
    totalLabourCost: number;
    totalOverheadCost: number;
    totalProfit: number;
    averageProfitPercent: number;
    totalCost: number;
    grandTotal: number;
  }
} {
  // ตรวจสอบความถูกต้องของข้อมูลนำเข้า
  if (items.length !== quantities.length) {
    throw new Error('จำนวนรายการและปริมาณไม่ตรงกัน');
  }
  
  const individualBreakdowns: (CostProfitBreakdown & { quantity: number; totalPrice: number })[] = [];
  let totalMaterialCost = 0;
  let totalLabourCost = 0;
  let totalOverheadCost = 0;
  let totalProfit = 0;
  let totalCost = 0;
  let grandTotal = 0;
  
  // คำนวณข้อมูลแต่ละรายการ
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const quantity = quantities[i];
    
    const breakdown = calculateCostProfitBreakdown(item, overrideParams);
    
    const itemTotalPrice = breakdown.submitPrice * quantity;
    const itemMaterialCost = breakdown.materialCost * quantity;
    const itemLabourCost = breakdown.labourCost * quantity;
    const itemOverheadCost = breakdown.overheadCost * quantity;
    const itemTotalCost = breakdown.totalCost * quantity;
    const itemProfit = breakdown.profit * quantity;
    
    // เพิ่มข้อมูลเข้าไปในผลลัพธ์
    individualBreakdowns.push({
      ...breakdown,
      quantity,
      totalPrice: itemTotalPrice
    });
    
    // สะสมผลรวม
    totalMaterialCost += itemMaterialCost;
    totalLabourCost += itemLabourCost;
    totalOverheadCost += itemOverheadCost;
    totalProfit += itemProfit;
    totalCost += itemTotalCost;
    grandTotal += itemTotalPrice;
  }
  
  // คำนวณค่าเฉลี่ยเปอร์เซ็นต์กำไร
  const averageProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  
  return {
    individualBreakdowns,
    summary: {
      totalMaterialCost,
      totalLabourCost,
      totalOverheadCost,
      totalProfit,
      averageProfitPercent,
      totalCost,
      grandTotal
    }
  };
}
