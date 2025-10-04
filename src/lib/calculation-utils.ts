/**
 * Calculation Utilities
 * ฟังก์ชันช่วยในการคำนวณ
 */

/**
 * คำนวณ VAT
 */
export function calculateVAT(amount: number, vatPercent: number = 7): number {
  return (amount * vatPercent) / 100;
}

/**
 * คำนวณส่วนลด
 */
export function calculateDiscount(
  amount: number,
  discount?: number,
  discountPercent?: number
): number {
  if (discount) return discount;
  if (discountPercent) return (amount * discountPercent) / 100;
  return 0;
}

/**
 * คำนวณยอดรวมใบเสนอราคา
 */
export function calculateQuotationTotal(
  subtotal: number,
  discount?: number,
  discountPercent?: number,
  vatPercent: number = 7
): {
  subtotal: number;
  discount: number;
  afterDiscount: number;
  vat: number;
  total: number;
} {
  const discountAmount = calculateDiscount(subtotal, discount, discountPercent);
  const afterDiscount = subtotal - discountAmount;
  const vat = calculateVAT(afterDiscount, vatPercent);
  const total = afterDiscount + vat;

  return {
    subtotal,
    discount: discountAmount,
    afterDiscount,
    vat,
    total,
  };
}

/**
 * คำนวณกำไร
 */
export function calculateProfit(revenue: number, cost: number): {
  profit: number;
  profitMargin: number;
} {
  const profit = revenue - cost;
  const profitMargin = (profit / revenue) * 100;

  return {
    profit,
    profitMargin,
  };
}

/**
 * คำนวณ Win Rate
 */
export function calculateWinRate(won: number, total: number): number {
  if (total === 0) return 0;
  return (won / total) * 100;
}

/**
 * คำนวณค่าเฉลี่ย
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

/**
 * คำนวณ Median
 */
export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * คำนวณ Percentage Change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * คำนวณ ROI (Return on Investment)
 */
export function calculateROI(gain: number, cost: number): number {
  if (cost === 0) return 0;
  return ((gain - cost) / cost) * 100;
}

/**
 * คำนวณราคาต่อหน่วย
 */
export function calculateUnitPrice(totalPrice: number, quantity: number): number {
  if (quantity === 0) return 0;
  return totalPrice / quantity;
}

/**
 * คำนวณจำนวนเงินรวม
 */
export function calculateAmount(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

/**
 * คำนวณราคาหลังส่วนลด
 */
export function calculatePriceAfterDiscount(
  price: number,
  discount?: number,
  discountPercent?: number
): number {
  const discountAmount = calculateDiscount(price, discount, discountPercent);
  return price - discountAmount;
}

/**
 * คำนวณการประหยัด
 */
export function calculateSavings(
  originalPrice: number,
  newPrice: number,
  quantity: number = 1
): {
  savings: number;
  savingsPercent: number;
  totalSavings: number;
} {
  const savings = originalPrice - newPrice;
  const savingsPercent = (savings / originalPrice) * 100;
  const totalSavings = savings * quantity;

  return {
    savings,
    savingsPercent,
    totalSavings,
  };
}

/**
 * Round to decimals
 */
export function roundTo(value: number, decimals: number = 2): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
