/**
 * Quotation Types & Interfaces
 * สำหรับระบบสร้างใบเสนอราคาอัตโนมัติ
 */

export interface QuotationItem {
  id: string;
  no: number;                    // ลำดับ
  description: string;           // รายการ
  quantity: number;              // จำนวน
  unit: string;                  // หน่วย
  unitPrice: number;             // ราคาต่อหน่วย
  amount: number;                // จำนวนเงิน
  notes?: string;                // หมายเหตุ
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  items: Omit<QuotationItem, 'id'>[];
  terms?: string[];              // เงื่อนไข
  notes?: string;
  isDefault?: boolean;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email?: string;
  taxId?: string;
  website?: string;
  logo?: string;
  bankAccount?: {
    bank: string;
    accountName: string;
    accountNumber: string;
  };
}

export interface CustomerInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  contactPerson?: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;       // เลขที่ใบเสนอราคา
  date: Date;
  validUntil: Date;              // ใช้ได้ถึง
  
  // Company & Customer
  company: CompanyInfo;
  customer: CustomerInfo;
  
  // Items
  items: QuotationItem[];
  
  // Pricing
  subtotal: number;              // รวมเงิน
  discount?: number;             // ส่วนลด
  discountPercent?: number;      // ส่วนลด %
  vat?: number;                  // VAT 7%
  vatPercent?: number;           // VAT %
  total: number;                 // รวมทั้งสิ้น
  
  // Terms & Conditions
  paymentTerms?: string;         // เงื่อนไขการชำระเงิน
  deliveryTerms?: string;        // เงื่อนไขการส่งมอบ
  warrantyTerms?: string;        // เงื่อนไขการรับประกัน
  additionalTerms?: string[];   // เงื่อนไขเพิ่มเติม
  
  // Notes
  notes?: string;
  internalNotes?: string;        // หมายเหตุภายใน
  
  // Status
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  
  // Project reference
  projectId?: string;
  projectName?: string;
}

export interface QuotationSettings {
  userId: string;
  company: CompanyInfo;
  
  // Default values
  defaultValidDays: number;      // จำนวนวันที่ใช้ได้
  defaultVatPercent: number;     // VAT %
  defaultPaymentTerms: string;
  defaultDeliveryTerms: string;
  defaultWarrantyTerms: string;
  
  // Numbering
  quotationPrefix: string;       // คำนำหน้าเลขที่
  quotationStartNumber: number;  // เลขเริ่มต้น
  
  // Templates
  defaultTemplate?: string;      // Template ID
  
  // Email settings
  emailSubject?: string;
  emailBody?: string;
  autoSendEmail?: boolean;
}

export interface QuotationPDF {
  quotationId: string;
  pdfUrl: string;
  generatedAt: Date;
}

export interface QuotationEmail {
  to: string;
  cc?: string[];
  subject: string;
  body: string;
  attachments?: {
    filename: string;
    url: string;
  }[];
}

export interface QuotationSummary {
  totalQuotations: number;
  draftQuotations: number;
  sentQuotations: number;
  acceptedQuotations: number;
  rejectedQuotations: number;
  totalValue: number;
  acceptedValue: number;
  acceptanceRate: number;        // %
}
