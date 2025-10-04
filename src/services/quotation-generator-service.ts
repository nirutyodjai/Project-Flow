/**
 * Quotation Generator Service
 * สร้างใบเสนอราคาอัตโนมัติ
 */

import { 
  collection, 
  addDoc, 
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Quotation,
  QuotationItem,
  QuotationSettings,
  QuotationTemplate,
  QuotationSummary,
  CompanyInfo,
  CustomerInfo
} from '@/types/quotation';

const QUOTATIONS_COLLECTION = 'quotations';
const TEMPLATES_COLLECTION = 'quotationTemplates';
const SETTINGS_COLLECTION = 'quotationSettings';

export class QuotationGeneratorService {
  /**
   * สร้างใบเสนอราคาใหม่
   */
  static async createQuotation(
    userId: string,
    customer: CustomerInfo,
    items: QuotationItem[],
    options?: {
      projectId?: string;
      projectName?: string;
      discount?: number;
      discountPercent?: number;
      notes?: string;
    }
  ): Promise<Quotation> {
    try {
      // ดึงการตั้งค่า
      const settings = await this.getSettings(userId);
      
      // สร้างเลขที่ใบเสนอราคา
      const quotationNumber = await this.generateQuotationNumber(userId, settings);
      
      // คำนวณราคา
      const pricing = this.calculatePricing(
        items,
        options?.discount,
        options?.discountPercent,
        settings.defaultVatPercent
      );
      
      const now = new Date();
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + settings.defaultValidDays);
      
      const quotation: Omit<Quotation, 'id'> = {
        quotationNumber,
        date: now,
        validUntil,
        company: settings.company,
        customer,
        items,
        ...pricing,
        paymentTerms: settings.defaultPaymentTerms,
        deliveryTerms: settings.defaultDeliveryTerms,
        warrantyTerms: settings.defaultWarrantyTerms,
        notes: options?.notes,
        status: 'draft',
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
        projectId: options?.projectId,
        projectName: options?.projectName,
      };
      
      const docRef = await addDoc(collection(db, QUOTATIONS_COLLECTION), {
        ...quotation,
        date: Timestamp.fromDate(quotation.date),
        validUntil: Timestamp.fromDate(quotation.validUntil),
        createdAt: Timestamp.fromDate(quotation.createdAt),
        updatedAt: Timestamp.fromDate(quotation.updatedAt),
      });
      
      return {
        ...quotation,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  }

  /**
   * สร้างจาก Template
   */
  static async createFromTemplate(
    userId: string,
    templateId: string,
    customer: CustomerInfo,
    options?: {
      projectId?: string;
      projectName?: string;
    }
  ): Promise<Quotation> {
    try {
      // ดึง template
      const template = await this.getTemplate(templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      // สร้าง items จาก template
      const items: QuotationItem[] = template.items.map((item, index) => ({
        ...item,
        id: `item-${index + 1}`,
      }));
      
      return this.createQuotation(userId, customer, items, options);
    } catch (error) {
      console.error('Error creating from template:', error);
      throw error;
    }
  }

  /**
   * คำนวณราคา
   */
  private static calculatePricing(
    items: QuotationItem[],
    discount?: number,
    discountPercent?: number,
    vatPercent: number = 7
  ) {
    // คำนวณยอดรวม
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    
    // คำนวณส่วนลด
    let discountAmount = discount || 0;
    if (discountPercent) {
      discountAmount = (subtotal * discountPercent) / 100;
    }
    
    // หลังหักส่วนลด
    const afterDiscount = subtotal - discountAmount;
    
    // คำนวณ VAT
    const vat = (afterDiscount * vatPercent) / 100;
    
    // รวมทั้งสิ้น
    const total = afterDiscount + vat;
    
    return {
      subtotal,
      discount: discountAmount,
      discountPercent,
      vat,
      vatPercent,
      total,
    };
  }

  /**
   * สร้างเลขที่ใบเสนอราคา
   */
  private static async generateQuotationNumber(
    userId: string,
    settings: QuotationSettings
  ): Promise<string> {
    // ดึงใบเสนอราคาล่าสุด
    const q = query(
      collection(db, QUOTATIONS_COLLECTION),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    let nextNumber = settings.quotationStartNumber;
    
    if (!snapshot.empty) {
      const lastQuotation = snapshot.docs[0].data();
      const lastNumber = lastQuotation.quotationNumber;
      
      // Extract number from last quotation
      const match = lastNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }
    
    // Format: QT-YYYYMM-0001
    const date = new Date();
    const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const numberPart = String(nextNumber).padStart(4, '0');
    
    return `${settings.quotationPrefix}-${yearMonth}-${numberPart}`;
  }

  /**
   * อัปเดตใบเสนอราคา
   */
  static async updateQuotation(
    quotationId: string,
    updates: Partial<Quotation>
  ): Promise<void> {
    try {
      const quotationRef = doc(db, QUOTATIONS_COLLECTION, quotationId);
      await updateDoc(quotationRef, {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating quotation:', error);
      throw error;
    }
  }

  /**
   * ส่งใบเสนอราคา
   */
  static async sendQuotation(quotationId: string): Promise<void> {
    try {
      await this.updateQuotation(quotationId, {
        status: 'sent',
        sentAt: new Date(),
      });
      
      // TODO: Send email
    } catch (error) {
      console.error('Error sending quotation:', error);
      throw error;
    }
  }

  /**
   * ดึงใบเสนอราคาทั้งหมด
   */
  static async getQuotations(userId: string): Promise<Quotation[]> {
    try {
      const q = query(
        collection(db, QUOTATIONS_COLLECTION),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          validUntil: data.validUntil?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          sentAt: data.sentAt?.toDate(),
        } as Quotation;
      });
    } catch (error) {
      console.error('Error getting quotations:', error);
      throw error;
    }
  }

  /**
   * ดึงสถิติ
   */
  static async getQuotationSummary(userId: string): Promise<QuotationSummary> {
    try {
      const quotations = await this.getQuotations(userId);
      
      const totalQuotations = quotations.length;
      const draftQuotations = quotations.filter(q => q.status === 'draft').length;
      const sentQuotations = quotations.filter(q => q.status === 'sent').length;
      const acceptedQuotations = quotations.filter(q => q.status === 'accepted').length;
      const rejectedQuotations = quotations.filter(q => q.status === 'rejected').length;
      
      const totalValue = quotations.reduce((sum, q) => sum + q.total, 0);
      const acceptedValue = quotations
        .filter(q => q.status === 'accepted')
        .reduce((sum, q) => sum + q.total, 0);
      
      const acceptanceRate = sentQuotations > 0
        ? (acceptedQuotations / sentQuotations) * 100
        : 0;
      
      return {
        totalQuotations,
        draftQuotations,
        sentQuotations,
        acceptedQuotations,
        rejectedQuotations,
        totalValue,
        acceptedValue,
        acceptanceRate,
      };
    } catch (error) {
      console.error('Error getting quotation summary:', error);
      throw error;
    }
  }

  /**
   * ดึงการตั้งค่า
   */
  static async getSettings(userId: string): Promise<QuotationSettings> {
    try {
      const q = query(
        collection(db, SETTINGS_COLLECTION),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Return default settings
        return this.getDefaultSettings(userId);
      }
      
      return snapshot.docs[0].data() as QuotationSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  }

  /**
   * การตั้งค่าเริ่มต้น
   */
  private static getDefaultSettings(userId: string): QuotationSettings {
    return {
      userId,
      company: {
        name: 'บริษัท ของคุณ จำกัด',
        address: '123 ถนน... เขต... กรุงเทพฯ 10000',
        phone: '02-xxx-xxxx',
        email: 'info@company.com',
      },
      defaultValidDays: 30,
      defaultVatPercent: 7,
      defaultPaymentTerms: 'ชำระเงินภายใน 30 วัน หลังจากได้รับสินค้า',
      defaultDeliveryTerms: 'จัดส่งภายใน 7-14 วันทำการ',
      defaultWarrantyTerms: 'รับประกันสินค้า 1 ปี',
      quotationPrefix: 'QT',
      quotationStartNumber: 1,
    };
  }

  /**
   * บันทึกการตั้งค่า
   */
  static async saveSettings(settings: QuotationSettings): Promise<void> {
    try {
      const q = query(
        collection(db, SETTINGS_COLLECTION),
        where('userId', '==', settings.userId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(collection(db, SETTINGS_COLLECTION), settings);
      } else {
        const docRef = doc(db, SETTINGS_COLLECTION, snapshot.docs[0].id);
        await updateDoc(docRef, settings);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  /**
   * ดึง Template
   */
  static async getTemplate(templateId: string): Promise<QuotationTemplate | null> {
    try {
      const q = query(
        collection(db, TEMPLATES_COLLECTION),
        where('__name__', '==', templateId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      } as QuotationTemplate;
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  }

  /**
   * ดึง Templates ทั้งหมด
   */
  static async getTemplates(userId?: string): Promise<QuotationTemplate[]> {
    try {
      const q = query(collection(db, TEMPLATES_COLLECTION));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as QuotationTemplate));
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  }
}
