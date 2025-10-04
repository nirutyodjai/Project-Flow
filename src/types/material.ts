/**
 * Material Types & Interfaces
 * สำหรับระบบเปรียบเทียบราคาวัสดุ
 */

export type MaterialCategory = 
  | 'electrical'        // ไฟฟ้า
  | 'plumbing'          // ประปา
  | 'construction'      // ก่อสร้าง
  | 'paint'             // สี
  | 'hardware'          // ฮาร์ดแวร์
  | 'wood'              // ไม้
  | 'steel'             // เหล็ก
  | 'cement'            // ปูนซีเมนต์
  | 'tile'              // กระเบื้อง
  | 'sanitary'          // สุขภัณฑ์
  | 'other';            // อื่นๆ

export type MaterialUnit = 
  | 'piece'             // ชิ้น
  | 'meter'             // เมตร
  | 'sqm'               // ตารางเมตร
  | 'kg'                // กิโลกรัม
  | 'bag'               // ถุง
  | 'box'               // กล่อง
  | 'roll'              // ม้วน
  | 'set'               // ชุด
  | 'liter'             // ลิตร
  | 'gallon';           // แกลลอน

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  brand?: string;
  model?: string;
  specification?: string;
  unit: MaterialUnit;
  description?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface MaterialPrice {
  id: string;
  materialId: string;
  supplierId: string;
  supplierName: string;
  price: number;
  unit: MaterialUnit;
  minOrder?: number;
  maxOrder?: number;
  discount?: number;           // % discount
  discountCondition?: string;  // เงื่อนไขส่วนลด
  deliveryFee?: number;
  deliveryTime?: number;       // วัน
  inStock: boolean;
  stockQuantity?: number;
  lastUpdated: Date;
  validUntil?: Date;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;             // 0-5
  reviewCount?: number;
  deliveryAreas?: string[];
  paymentMethods?: string[];
  minimumOrder?: number;
  verified: boolean;
}

export interface PriceComparison {
  material: Material;
  prices: MaterialPrice[];
  lowestPrice: MaterialPrice;
  highestPrice: MaterialPrice;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
    difference: number;
    percentDifference: number;
  };
  recommendations: {
    bestValue: MaterialPrice;      // ราคาดีที่สุด
    bestQuality: MaterialPrice;    // คุณภาพดีที่สุด
    fastest: MaterialPrice;        // ส่งเร็วที่สุด
  };
}

export interface MaterialQuote {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: MaterialUnit;
  selectedPrice: MaterialPrice;
  totalPrice: number;
  notes?: string;
}

export interface BulkPriceComparison {
  materials: MaterialQuote[];
  totalCost: number;
  totalSavings: number;
  savingsPercentage: number;
  suppliers: {
    supplierId: string;
    supplierName: string;
    itemCount: number;
    subtotal: number;
    deliveryFee: number;
    total: number;
  }[];
  recommendations: {
    cheapest: string;              // Supplier ID
    bestValue: string;
    consolidation?: {              // รวมซื้อจากร้านเดียว
      supplierId: string;
      totalCost: number;
      savings: number;
    };
  };
}

export interface PriceHistory {
  materialId: string;
  date: Date;
  price: number;
  supplierId: string;
}

export interface PriceTrend {
  materialId: string;
  materialName: string;
  currentPrice: number;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  history: PriceHistory[];
  forecast?: {
    nextMonth: number;
    confidence: number;
  };
}

export interface MaterialSearchFilters {
  category?: MaterialCategory;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  suppliers?: string[];
  location?: string;
  sortBy?: 'price' | 'rating' | 'delivery' | 'name';
  sortOrder?: 'asc' | 'desc';
}
