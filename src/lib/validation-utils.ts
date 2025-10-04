/**
 * Validation Utilities
 * ฟังก์ชันช่วยในการตรวจสอบข้อมูล
 */

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Thai phone number
 */
export function isValidThaiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // 02-xxx-xxxx (9 digits) or 08x-xxx-xxxx (10 digits)
  return (cleaned.startsWith('02') && cleaned.length === 9) ||
         (cleaned.startsWith('0') && cleaned.length === 10);
}

/**
 * Validate Thai Tax ID
 */
export function isValidThaiTaxId(taxId: string): boolean {
  const cleaned = taxId.replace(/\D/g, '');
  return cleaned.length === 13;
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

/**
 * Validate percentage (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100 && !isNaN(value);
}

/**
 * Validate date is in future
 */
export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() > Date.now();
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate min length
 */
export function minLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

/**
 * Validate max length
 */
export function maxLength(value: string, max: number): boolean {
  return value.trim().length <= max;
}

/**
 * Validate number range
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Sanitize string (remove special chars)
 */
export function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, '');
}

/**
 * Validate quotation items
 */
export function validateQuotationItems(items: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!items || items.length === 0) {
    errors.push('ต้องมีรายการอย่างน้อย 1 รายการ');
    return { valid: false, errors };
  }

  items.forEach((item, index) => {
    if (!item.description || item.description.trim() === '') {
      errors.push(`รายการที่ ${index + 1}: กรุณากรอกรายละเอียด`);
    }
    if (!isPositiveNumber(item.quantity)) {
      errors.push(`รายการที่ ${index + 1}: จำนวนต้องมากกว่า 0`);
    }
    if (!isPositiveNumber(item.unitPrice)) {
      errors.push(`รายการที่ ${index + 1}: ราคาต่อหน่วยต้องมากกว่า 0`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate customer info
 */
export function validateCustomer(customer: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isRequired(customer.name)) {
    errors.push('กรุณากรอกชื่อลูกค้า');
  }

  if (customer.email && !isValidEmail(customer.email)) {
    errors.push('รูปแบบอีเมลไม่ถูกต้อง');
  }

  if (customer.phone && !isValidThaiPhone(customer.phone)) {
    errors.push('รูปแบบเบอร์โทรไม่ถูกต้อง');
  }

  if (customer.taxId && !isValidThaiTaxId(customer.taxId)) {
    errors.push('รูปแบบเลขประจำตัวผู้เสียภาษีไม่ถูกต้อง');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
