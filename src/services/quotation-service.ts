/**
 * @fileOverview บริการจัดการใบเสนอราคา (Quotation) ทั้ง 4 รูปแบบ
 * 1. เสนอราคาอย่างเดียว (Material Only)
 * 2. เสนอราคาพร้อมค่าแรง (Material + Labor)
 * 3. เสนอค่าแรงอย่างเดียว (Labor Only)
 * 4. เสนอราคาตาม BOQ (BOQ-based)
 */
'use server';

import { getDb } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import * as PriceListService from './price-list-service';
import * as StockService from './stock-service';

// ชื่อคอลเลกชันใน Firestore
const QUOTATION_COLLECTION = 'quotations';

/**
 * ประเภทของใบเสนอราคา
 */
export enum QuotationType {
  MATERIAL_ONLY = 'material_only',      // เสนอราคาอย่างเดียว
  MATERIAL_LABOR = 'material_labor',     // เสนอราคาพร้อมค่าแรง
  LABOR_ONLY = 'labor_only',           // เสนอค่าแรงอย่างเดียว
  BOQ_BASED = 'boq_based',             // เสนอราคาตาม BOQ
}

/**
 * สถานะของใบเสนอราคา
 */
export enum QuotationStatus {
  DRAFT = 'draft',              // ร่าง
  PENDING = 'pending',          // รอการอนุมัติ
  APPROVED = 'approved',        // อนุมัติแล้ว
  REJECTED = 'rejected',        // ปฏิเสธแล้ว
  EXPIRED = 'expired',          // หมดอายุ
  CONVERTED = 'converted',      // แปลงเป็นใบสั่งซื้อแล้ว
}

/**
 * รายการในใบเสนอราคา
 */
export interface QuotationItem {
  id?: string;
  materialCode?: string;        // รหัสวัสดุ (ถ้ามี)
  description: string;          // คำอธิบาย
  quantity: number;             // จำนวน
  unit: string;                 // หน่วย
  unitPrice: number;            // ราคาต่อหน่วย
  totalPrice: number;           // ราคารวม
  discountPercent?: number;     // เปอร์เซ็นต์ส่วนลด
  discountAmount?: number;      // จำนวนเงินส่วนลด
  netPrice: number;             // ราคาสุทธิ
  laborCost?: number;           // ค่าแรงต่อหน่วย
  totalLaborCost?: number;      // ค่าแรงรวม
  fromStock?: boolean;          // ดึงจากสต๊อกหรือไม่
  stockQuantity?: number;       // จำนวนในสต๊อก (ถ้ามี)
  priceSource?: 'price_list' | 'manual'; // แหล่งที่มาของราคา
  costData?: {                  // ข้อมูลต้นทุน (สำหรับการคำนวณภายใน)
    materialCost: number;       // ต้นทุนวัสดุ
    laborCost?: number;         // ต้นทุนค่าแรง
    overheadCost?: number;      // ค่าโสหุ้ย
    profit?: number;            // กำไร
    profitPercent?: number;     // เปอร์เซ็นต์กำไร
  };
}

/**
 * ข้อมูลใบเสนอราคา
 */
export interface Quotation {
  id?: string;
  quotationNumber: string;      // เลขที่ใบเสนอราคา
  type: QuotationType;          // ประเภทใบเสนอราคา
  status: QuotationStatus;      // สถานะ
  customerId?: string;          // รหัสลูกค้า
  customerName: string;         // ชื่อลูกค้า
  customerAddress?: string;     // ที่อยู่ลูกค้า
  customerTaxId?: string;       // เลขประจำตัวผู้เสียภาษี
  customerContact?: string;     // ข้อมูลติดต่อ
  projectName: string;          // ชื่อโครงการ
  projectId?: string;           // รหัสโครงการ (ถ้ามี)
  boqId?: string;               // รหัส BOQ (ถ้าเป็นการเสนอราคาตาม BOQ)
  items: QuotationItem[];       // รายการในใบเสนอราคา
  subtotal: number;             // ยอดรวมก่อนภาษี
  discount?: number;            // ส่วนลด
  afterDiscount?: number;       // ยอดหลังหักส่วนลด
  vat?: number;                 // ภาษีมูลค่าเพิ่ม
  total: number;                // ยอดรวมทั้งสิ้น
  remark?: string;              // หมายเหตุ
  validityPeriod: number;       // ระยะเวลาที่ใบเสนอราคามีผล (วัน)
  paymentTerms?: string;        // เงื่อนไขการชำระเงิน
  deliveryTerms?: string;       // เงื่อนไขการจัดส่ง
  createdAt: string;            // วันที่สร้าง
  updatedAt: string;            // วันที่อัปเดตล่าสุด
  createdBy?: string;           // ผู้สร้าง
  approvedBy?: string;          // ผู้อนุมัติ
  approvedAt?: string;          // วันที่อนุมัติ
  issuedDate: string;           // วันที่ออกใบเสนอราคา
  expiredDate: string;          // วันที่หมดอายุ
  profitSummary?: {             // สรุปข้อมูลกำไร
    totalCost: number;          // ต้นทุนรวม
    totalProfit: number;        // กำไรรวม
    profitPercent: number;      // เปอร์เซ็นต์กำไรรวม
  };
}

/**
 * ค้นหาใบเสนอราคาตามเงื่อนไข
 */
export async function searchQuotations(params: {
  quotationNumber?: string;
  customerName?: string;
  projectName?: string;
  type?: QuotationType;
  status?: QuotationStatus;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}): Promise<Quotation[]> {
  try {
    const db = getDb();
    const quotationsRef = collection(db, QUOTATION_COLLECTION);
    
    // สร้าง query ตามเงื่อนไข
    let conditions: any[] = [];
    
    if (params.quotationNumber) {
      conditions.push(where('quotationNumber', '>=', params.quotationNumber));
      conditions.push(where('quotationNumber', '<=', params.quotationNumber + '\uf8ff'));
    }
    
    if (params.customerName) {
      conditions.push(where('customerName', '>=', params.customerName));
      conditions.push(where('customerName', '<=', params.customerName + '\uf8ff'));
    }
    
    if (params.projectName) {
      conditions.push(where('projectName', '>=', params.projectName));
      conditions.push(where('projectName', '<=', params.projectName + '\uf8ff'));
    }
    
    if (params.type) {
      conditions.push(where('type', '==', params.type));
    }
    
    if (params.status) {
      conditions.push(where('status', '==', params.status));
    }
    
    if (params.fromDate && params.toDate) {
      conditions.push(where('issuedDate', '>=', params.fromDate));
      conditions.push(where('issuedDate', '<=', params.toDate));
    }
    
    // เพิ่มการเรียงลำดับและจำกัดจำนวน
    const queryLimit = params.limit || 100;
    const q = conditions.length > 0
      ? query(quotationsRef, ...conditions, orderBy('issuedDate', 'desc'), limit(queryLimit))
      : query(quotationsRef, orderBy('issuedDate', 'desc'), limit(queryLimit));
    
    const querySnapshot = await getDocs(q);
    const quotations: Quotation[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Quotation;
      quotations.push({
        ...data,
        id: doc.id
      });
    });
    
    return quotations;
  } catch (error) {
    console.error('Error searching quotations:', error);
    throw error;
  }
}

/**
 * ดึงข้อมูลใบเสนอราคาตาม ID
 */
export async function getQuotationById(id: string): Promise<Quotation | null> {
  try {
    const db = getDb();
    const docRef = doc(db, QUOTATION_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        ...docSnap.data() as Quotation,
        id: docSnap.id
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting quotation ${id}:`, error);
    throw error;
  }
}

/**
 * สร้างเลขที่ใบเสนอราคาใหม่
 */
async function generateQuotationNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  
  const prefix = `QT${year}${month}`;
  
  try {
    const db = getDb();
    const quotationsRef = collection(db, QUOTATION_COLLECTION);
    const q = query(
      quotationsRef,
      where('quotationNumber', '>=', prefix),
      where('quotationNumber', '<', `${prefix}\uf8ff`),
      orderBy('quotationNumber', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return `${prefix}0001`;
    }
    
    const lastQuotationNumber = querySnapshot.docs[0].data().quotationNumber;
    const lastNumber = parseInt(lastQuotationNumber.substring(8));
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    
    return `${prefix}${newNumber}`;
  } catch (error) {
    console.error('Error generating quotation number:', error);
    throw error;
  }
}

/**
 * คำนวณมูลค่าและกำไรของใบเสนอราคา
 */
export function calculateQuotationValues(quotation: Quotation): Quotation {
  // คำนวณยอดรวมของแต่ละรายการ
  let subtotal = 0;
  let totalCost = 0;
  let totalProfit = 0;
  
  // คำนวณค่าแต่ละรายการ
  const updatedItems = quotation.items.map(item => {
    // คำนวณราคารวมของรายการ
    const totalPrice = item.quantity * item.unitPrice;
    
    // คำนวณส่วนลดถ้ามี
    let discountAmount = 0;
    if (item.discountPercent && item.discountPercent > 0) {
      discountAmount = totalPrice * (item.discountPercent / 100);
    } else if (item.discountAmount) {
      discountAmount = item.discountAmount;
    }
    
    // คำนวณราคาสุทธิ
    const netPrice = totalPrice - discountAmount;
    
    // คำนวณค่าแรงรวมถ้ามี
    let totalLaborCost = 0;
    if (item.laborCost && item.laborCost > 0) {
      totalLaborCost = item.quantity * item.laborCost;
    }
    
    // คำนวณข้อมูลต้นทุนและกำไรถ้ามี
    let costData = item.costData || {
      materialCost: item.unitPrice * 0.7, // ประมาณต้นทุนวัสดุ 70% ของราคาขาย
      laborCost: item.laborCost ? item.laborCost * 0.8 : 0, // ต้นทุนค่าแรง 80% ของค่าแรงที่เรียกเก็บ
      overheadCost: 0,
      profit: 0,
      profitPercent: 0
    };
    
    // คำนวณต้นทุนรวม
    const itemTotalCost = (costData.materialCost * item.quantity) + 
                        ((costData.laborCost || 0) * item.quantity) +
                        (costData.overheadCost || 0);
    
    // คำนวณกำไร
    const itemProfit = netPrice + (totalLaborCost || 0) - itemTotalCost;
    const itemProfitPercent = itemTotalCost > 0 ? (itemProfit / itemTotalCost) * 100 : 0;
    
    // อัปเดตข้อมูลต้นทุน
    costData = {
      ...costData,
      profit: itemProfit,
      profitPercent: itemProfitPercent
    };
    
    // เพิ่มยอดรวม
    subtotal += netPrice + (totalLaborCost || 0);
    totalCost += itemTotalCost;
    totalProfit += itemProfit;
    
    // อัปเดตข้อมูลรายการ
    return {
      ...item,
      totalPrice,
      discountAmount: discountAmount || undefined,
      netPrice,
      totalLaborCost: totalLaborCost || undefined,
      costData
    };
  });
  
  // คำนวณส่วนลดรวม
  const discount = quotation.discount || 0;
  const afterDiscount = subtotal - discount;
  
  // คำนวณภาษีมูลค่าเพิ่ม
  const vat = quotation.vat !== undefined ? afterDiscount * (quotation.vat / 100) : 0;
  
  // คำนวณยอดรวมทั้งสิ้น
  const total = afterDiscount + vat;
  
  // คำนวณเปอร์เซ็นต์กำไรรวม
  const profitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  
  return {
    ...quotation,
    items: updatedItems,
    subtotal,
    afterDiscount: discount > 0 ? afterDiscount : undefined,
    total,
    profitSummary: {
      totalCost,
      totalProfit,
      profitPercent
    }
  };
}

/**
 * สร้างใบเสนอราคาใหม่
 */
export async function createQuotation(quotationData: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt' | 'updatedAt'>): Promise<Quotation> {
  try {
    const db = getDb();
    
    // สร้างเลขที่ใบเสนอราคาใหม่
    const quotationNumber = await generateQuotationNumber();
    
    // กำหนดวันที่สร้างและอัปเดต
    const now = new Date().toISOString();
    
    // คำนวณวันหมดอายุ
    const validityPeriod = quotationData.validityPeriod || 30; // ค่าเริ่มต้น 30 วัน
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() + validityPeriod);
    
    // สร้างข้อมูลใบเสนอราคา
    const newQuotation: Omit<Quotation, 'id'> = {
      ...quotationData,
      quotationNumber,
      createdAt: now,
      updatedAt: now,
      issuedDate: quotationData.issuedDate || now,
      expiredDate: quotationData.expiredDate || expiredDate.toISOString(),
      status: quotationData.status || QuotationStatus.DRAFT
    };
    
    // คำนวณมูลค่าต่างๆ
    const calculatedQuotation = calculateQuotationValues(newQuotation as Quotation);
    
    // บันทึกลงฐานข้อมูล
    const docRef = await addDoc(collection(db, QUOTATION_COLLECTION), calculatedQuotation);
    
    // อัปเดตสต๊อก (ถ้าจำเป็น)
    if (calculatedQuotation.status === QuotationStatus.APPROVED) {
      await updateStockForQuotation(calculatedQuotation.items);
    }
    
    return {
      ...calculatedQuotation,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error creating quotation:', error);
    throw error;
  }
}

/**
 * อัปเดตใบเสนอราคา
 */
export async function updateQuotation(id: string, quotationData: Partial<Quotation>): Promise<Quotation> {
  try {
    const db = getDb();
    const docRef = doc(db, QUOTATION_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`Quotation with ID ${id} not found`);
    }
    
    const existingQuotation = docSnap.data() as Quotation;
    const oldStatus = existingQuotation.status;
    
    // อัปเดตข้อมูลใบเสนอราคา
    const updatedQuotation: Quotation = {
      ...existingQuotation,
      ...quotationData,
      id,
      updatedAt: new Date().toISOString()
    };
    
    // คำนวณมูลค่าต่างๆ
    const calculatedQuotation = calculateQuotationValues(updatedQuotation);
    
    // บันทึกลงฐานข้อมูล
    await updateDoc(docRef, {
      ...calculatedQuotation,
      id: undefined // ไม่ต้องบันทึก id ลงในเอกสาร
    });
    
    // ตรวจสอบว่ามีการเปลี่ยนสถานะเป็น APPROVED หรือไม่
    if (oldStatus !== QuotationStatus.APPROVED && calculatedQuotation.status === QuotationStatus.APPROVED) {
      await updateStockForQuotation(calculatedQuotation.items);
    }
    
    return calculatedQuotation;
  } catch (error) {
    console.error(`Error updating quotation ${id}:`, error);
    throw error;
  }
}

/**
 * ลบใบเสนอราคา
 */
export async function deleteQuotation(id: string): Promise<void> {
  try {
    const db = getDb();
    const docRef = doc(db, QUOTATION_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`Quotation with ID ${id} not found`);
    }
    
    const quotation = docSnap.data() as Quotation;
    
    // ตรวจสอบว่าใบเสนอราคาสามารถลบได้หรือไม่
    if (quotation.status === QuotationStatus.APPROVED || quotation.status === QuotationStatus.CONVERTED) {
      throw new Error('Cannot delete approved or converted quotation');
    }
    
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting quotation ${id}:`, error);
    throw error;
  }
}

/**
 * เปลี่ยนสถานะใบเสนอราคา
 */
export async function updateQuotationStatus(
  id: string, 
  status: QuotationStatus, 
  statusData?: { 
    approvedBy?: string; 
    rejectionReason?: string;
  }
): Promise<Quotation> {
  try {
    const db = getDb();
    const docRef = doc(db, QUOTATION_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`Quotation with ID ${id} not found`);
    }
    
    const quotation = docSnap.data() as Quotation;
    const oldStatus = quotation.status;
    
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };
    
    // เพิ่มข้อมูลเพิ่มเติมตามสถานะ
    if (status === QuotationStatus.APPROVED && statusData?.approvedBy) {
      updateData.approvedBy = statusData.approvedBy;
      updateData.approvedAt = new Date().toISOString();
    } else if (status === QuotationStatus.REJECTED && statusData?.rejectionReason) {
      updateData.rejectionReason = statusData.rejectionReason;
    }
    
    await updateDoc(docRef, updateData);
    
    // ตรวจสอบว่ามีการเปลี่ยนสถานะเป็น APPROVED หรือไม่
    if (oldStatus !== QuotationStatus.APPROVED && status === QuotationStatus.APPROVED) {
      await updateStockForQuotation(quotation.items);
    }
    
    return {
      ...quotation,
      ...updateData,
      id
    };
  } catch (error) {
    console.error(`Error updating quotation status ${id}:`, error);
    throw error;
  }
}

/**
 * สร้างใบเสนอราคาจาก BOQ
 */
export async function createQuotationFromBOQ(
  boqId: string,
  quotationData: Omit<Quotation, 'id' | 'quotationNumber' | 'items' | 'createdAt' | 'updatedAt' | 'subtotal' | 'total'>
): Promise<Quotation> {
  try {
    // โหลดข้อมูล BOQ
    const db = getDb();
    const boqDocRef = doc(db, 'projectBOQData', boqId);
    const boqDocSnap = await getDoc(boqDocRef);
    
    if (!boqDocSnap.exists()) {
      throw new Error(`BOQ with ID ${boqId} not found`);
    }
    
    const boqData = boqDocSnap.data();
    
    // แปลงรายการ BOQ เป็นรายการในใบเสนอราคา
    const quotationItems: QuotationItem[] = boqData.items.map((item: any) => {
      return {
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        netPrice: item.totalPrice,
        materialCode: item.materialCode,
        priceSource: 'price_list',
        laborCost: item.laborRate || 0,
        totalLaborCost: (item.laborRate || 0) * item.quantity,
        fromStock: false,
        costData: {
          materialCost: item.costBreakdown?.material || (item.unitPrice * 0.7),
          laborCost: item.costBreakdown?.labor || ((item.laborRate || 0) * 0.8),
          overheadCost: item.costBreakdown?.overhead || 0,
          profit: item.costBreakdown?.profit || 0,
          profitPercent: item.costBreakdown?.profitPercent || 0
        }
      };
    });
    
    // สร้างใบเสนอราคาใหม่
    const newQuotation = await createQuotation({
      ...quotationData,
      type: QuotationType.BOQ_BASED,
      items: quotationItems,
      boqId,
      projectName: quotationData.projectName || boqData.projectName || 'โครงการไม่มีชื่อ',
      projectId: quotationData.projectId || boqData.projectId || undefined,
      validityPeriod: quotationData.validityPeriod || 30,
    });
    
    return newQuotation;
  } catch (error) {
    console.error('Error creating quotation from BOQ:', error);
    throw error;
  }
}

/**
 * ดึงข้อมูลสินค้าจากไพรีสลิสต์
 */
export async function fetchItemsFromPriceList(
  searchParams: {
    materialCode?: string;
    description?: string;
    category?: string;
  },
  includeStockInfo: boolean = true
): Promise<QuotationItem[]> {
  try {
    // ค้นหาสินค้าในไพรีสลิสต์
    const priceListItems = await PriceListService.searchPriceListItems({
      materialCode: searchParams.materialCode,
      description: searchParams.description,
      category: searchParams.category,
      onlyActive: true
    });
    
    // แปลงรายการไพรีสลิสต์เป็นรายการในใบเสนอราคา
    const quotationItems: QuotationItem[] = await Promise.all(
      priceListItems.map(async (item) => {
        // คำนวณต้นทุนและกำไร
        const costProfitBreakdown = PriceListService.calculateCostProfitBreakdown(item);
        
        // ดึงข้อมูลสต๊อกถ้าต้องการ
        let stockQuantity = 0;
        let fromStock = false;
        
        if (includeStockInfo && item.materialCode) {
          try {
            const stockInfo = await StockService.getStockByMaterialCode(item.materialCode);
            if (stockInfo) {
              stockQuantity = stockInfo.quantity;
              fromStock = stockQuantity > 0;
            }
          } catch (e) {
            console.warn(`Could not fetch stock info for ${item.materialCode}:`, e);
          }
        }
        
        return {
          materialCode: item.materialCode,
          description: item.description,
          quantity: 1, // ค่าเริ่มต้น
          unit: item.unit,
          unitPrice: item.submitPrice || item.priceList,
          totalPrice: item.submitPrice || item.priceList,
          netPrice: item.submitPrice || item.priceList,
          laborCost: item.labour || 0,
          totalLaborCost: item.labour || 0,
          fromStock,
          stockQuantity,
          priceSource: 'price_list',
          costData: {
            materialCost: costProfitBreakdown.materialCost,
            laborCost: costProfitBreakdown.labourCost,
            overheadCost: costProfitBreakdown.overheadCost,
            profit: costProfitBreakdown.profit,
            profitPercent: costProfitBreakdown.profitPercent
          }
        };
      })
    );
    
    return quotationItems;
  } catch (error) {
    console.error('Error fetching items from price list:', error);
    throw error;
  }
}

/**
 * อัปเดตสต๊อกตามรายการในใบเสนอราคา
 */
async function updateStockForQuotation(items: QuotationItem[]): Promise<void> {
  try {
    // รวบรวมรายการที่ต้องการดึงจากสต๊อก
    const itemsFromStock = items.filter(item => item.fromStock && item.materialCode);
    
    if (itemsFromStock.length === 0) {
      return; // ไม่มีรายการที่ต้องอัปเดตสต๊อก
    }
    
    // อัปเดตสต๊อกสำหรับแต่ละรายการ
    await Promise.all(
      itemsFromStock.map(async (item) => {
        if (!item.materialCode) return;
        
        try {
          await StockService.decreaseStock(item.materialCode, item.quantity, 'quotation', {
            description: `ใช้ในใบเสนอราคา - ${item.description}`,
            quantity: item.quantity,
          });
        } catch (e) {
          console.error(`Error updating stock for ${item.materialCode}:`, e);
          // ไม่ต้องโยนข้อผิดพลาดเพื่อให้การอัปเดตรายการอื่นๆ ดำเนินต่อไปได้
        }
      })
    );
  } catch (error) {
    console.error('Error updating stock for quotation:', error);
    throw error;
  }
}
