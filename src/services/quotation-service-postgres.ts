/**
 * Quotation Service (PostgreSQL)
 * ใช้ Prisma แทน Firebase
 */

import { prisma } from '@/lib/prisma';
import type {
  Quotation,
  QuotationItem,
  QuotationSummary,
  CustomerInfo
} from '@/types/quotation';

export class QuotationServicePostgres {
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
    // สร้างเลขที่ใบเสนอราคา
    const quotationNumber = await this.generateQuotationNumber(userId);
    
    // คำนวณราคา
    const pricing = this.calculatePricing(
      items,
      options?.discount,
      options?.discountPercent,
      7 // VAT 7%
    );
    
    const now = new Date();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);
    
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        userId,
        date: now,
        validUntil,
        customerName: customer.name,
        customerAddress: customer.address,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerTaxId: customer.taxId,
        ...pricing,
        notes: options?.notes,
        status: 'draft',
        projectId: options?.projectId,
        projectName: options?.projectName,
        items: {
          create: items.map((item, index) => ({
            no: index + 1,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            amount: item.amount,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return this.mapToQuotation(quotation);
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
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    
    let discountAmount = discount || 0;
    if (discountPercent) {
      discountAmount = (subtotal * discountPercent) / 100;
    }
    
    const afterDiscount = subtotal - discountAmount;
    const vat = (afterDiscount * vatPercent) / 100;
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
  private static async generateQuotationNumber(userId: string): Promise<string> {
    const lastQuotation = await prisma.quotation.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    let nextNumber = 1;
    
    if (lastQuotation) {
      const match = lastQuotation.quotationNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }
    
    const date = new Date();
    const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const numberPart = String(nextNumber).padStart(4, '0');
    
    return `QT-${yearMonth}-${numberPart}`;
  }

  /**
   * อัปเดตใบเสนอราคา
   */
  static async updateQuotation(
    quotationId: string,
    updates: Partial<Quotation>
  ): Promise<void> {
    await prisma.quotation.update({
      where: { id: quotationId },
      data: updates as any,
    });
  }

  /**
   * ส่งใบเสนอราคา
   */
  static async sendQuotation(quotationId: string): Promise<void> {
    await prisma.quotation.update({
      where: { id: quotationId },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });
  }

  /**
   * ดึงใบเสนอราคาทั้งหมด
   */
  static async getQuotations(userId: string): Promise<Quotation[]> {
    const quotations = await prisma.quotation.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    
    return quotations.map(q => this.mapToQuotation(q));
  }

  /**
   * ดึงสถิติ
   */
  static async getQuotationSummary(userId: string): Promise<QuotationSummary> {
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
  }

  /**
   * Map Prisma model to Quotation type
   */
  private static mapToQuotation(data: any): Quotation {
    return {
      id: data.id,
      quotationNumber: data.quotationNumber,
      date: data.date,
      validUntil: data.validUntil,
      company: {
        name: 'บริษัท ของคุณ จำกัด',
        address: '123 ถนน... เขต... กรุงเทพฯ 10000',
        phone: '02-xxx-xxxx',
        email: 'info@company.com',
      },
      customer: {
        name: data.customerName,
        address: data.customerAddress || undefined,
        phone: data.customerPhone || undefined,
        email: data.customerEmail || undefined,
        taxId: data.customerTaxId || undefined,
      },
      items: data.items.map((item: any) => ({
        id: item.id,
        no: item.no,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        amount: item.amount,
        notes: item.notes || undefined,
      })),
      subtotal: data.subtotal,
      discount: data.discount || undefined,
      discountPercent: data.discountPercent || undefined,
      vat: data.vat || undefined,
      vatPercent: data.vatPercent || undefined,
      total: data.total,
      paymentTerms: data.paymentTerms || undefined,
      deliveryTerms: data.deliveryTerms || undefined,
      warrantyTerms: data.warrantyTerms || undefined,
      notes: data.notes || undefined,
      status: data.status as any,
      createdBy: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      sentAt: data.sentAt || undefined,
      projectId: data.projectId || undefined,
      projectName: data.projectName || undefined,
    };
  }
}
