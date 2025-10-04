/**
 * Material Price Service
 * จัดการระบบเปรียบเทียบราคาวัสดุ
 */

import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Material,
  MaterialPrice,
  Supplier,
  PriceComparison,
  MaterialQuote,
  BulkPriceComparison,
  PriceTrend,
  PriceHistory,
  MaterialSearchFilters
} from '@/types/material';

const MATERIALS_COLLECTION = 'materials';
const PRICES_COLLECTION = 'materialPrices';
const SUPPLIERS_COLLECTION = 'suppliers';
const PRICE_HISTORY_COLLECTION = 'priceHistory';

export class MaterialPriceService {
  /**
   * ค้นหาวัสดุ
   */
  static async searchMaterials(
    searchTerm: string,
    filters?: MaterialSearchFilters
  ): Promise<Material[]> {
    try {
      let q = query(collection(db, MATERIALS_COLLECTION));

      // Apply filters
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters?.brand) {
        q = query(q, where('brand', '==', filters.brand));
      }

      const snapshot = await getDocs(q);
      let materials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Material));

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        materials = materials.filter(m => 
          m.name.toLowerCase().includes(term) ||
          m.brand?.toLowerCase().includes(term) ||
          m.description?.toLowerCase().includes(term)
        );
      }

      return materials;
    } catch (error) {
      console.error('Error searching materials:', error);
      throw error;
    }
  }

  /**
   * ดึงราคาวัสดุจากทุกร้าน
   */
  static async getMaterialPrices(materialId: string): Promise<MaterialPrice[]> {
    try {
      const q = query(
        collection(db, PRICES_COLLECTION),
        where('materialId', '==', materialId),
        orderBy('price', 'asc')
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
          validUntil: data.validUntil?.toDate(),
        } as MaterialPrice;
      });
    } catch (error) {
      console.error('Error getting material prices:', error);
      throw error;
    }
  }

  /**
   * เปรียบเทียบราคาวัสดุ
   */
  static async comparePrices(materialId: string): Promise<PriceComparison> {
    try {
      // ดึงข้อมูลวัสดุ
      const materialDoc = await getDocs(
        query(collection(db, MATERIALS_COLLECTION), where('__name__', '==', materialId))
      );
      
      if (materialDoc.empty) {
        throw new Error('Material not found');
      }

      const material = {
        id: materialDoc.docs[0].id,
        ...materialDoc.docs[0].data(),
      } as Material;

      // ดึงราคาทั้งหมด
      const prices = await this.getMaterialPrices(materialId);

      if (prices.length === 0) {
        throw new Error('No prices found for this material');
      }

      // หาราคาต่ำสุดและสูงสุด
      const lowestPrice = prices[0];
      const highestPrice = prices[prices.length - 1];

      // คำนวณราคาเฉลี่ย
      const averagePrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;

      // คำนวณช่วงราคา
      const priceRange = {
        min: lowestPrice.price,
        max: highestPrice.price,
        difference: highestPrice.price - lowestPrice.price,
        percentDifference: ((highestPrice.price - lowestPrice.price) / lowestPrice.price) * 100,
      };

      // สร้างคำแนะนำ
      const recommendations = this.generateRecommendations(prices);

      return {
        material,
        prices,
        lowestPrice,
        highestPrice,
        averagePrice,
        priceRange,
        recommendations,
      };
    } catch (error) {
      console.error('Error comparing prices:', error);
      throw error;
    }
  }

  /**
   * สร้างคำแนะนำ
   */
  private static generateRecommendations(prices: MaterialPrice[]) {
    // Best value: ราคาดี + มีของในสต็อก + ส่งเร็ว
    const inStockPrices = prices.filter(p => p.inStock);
    const bestValue = inStockPrices.length > 0 ? inStockPrices[0] : prices[0];

    // Best quality: ร้านที่มี rating สูงสุด (ต้องดึงข้อมูล supplier)
    const bestQuality = prices[0]; // Simplified

    // Fastest: ส่งเร็วที่สุด
    const fastest = [...prices].sort((a, b) => 
      (a.deliveryTime || 999) - (b.deliveryTime || 999)
    )[0];

    return {
      bestValue,
      bestQuality,
      fastest,
    };
  }

  /**
   * เปรียบเทียบราคาแบบหลายรายการ
   */
  static async compareBulkPrices(quotes: MaterialQuote[]): Promise<BulkPriceComparison> {
    try {
      // คำนวณราคารวม
      const totalCost = quotes.reduce((sum, q) => sum + q.totalPrice, 0);

      // จัดกลุ่มตาม supplier
      const supplierGroups = new Map<string, MaterialQuote[]>();
      quotes.forEach(quote => {
        const supplierId = quote.selectedPrice.supplierId;
        const existing = supplierGroups.get(supplierId) || [];
        supplierGroups.set(supplierId, [...existing, quote]);
      });

      // สร้างข้อมูล supplier
      const suppliers = Array.from(supplierGroups.entries()).map(([supplierId, items]) => {
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const deliveryFee = items[0].selectedPrice.deliveryFee || 0;
        
        return {
          supplierId,
          supplierName: items[0].selectedPrice.supplierName,
          itemCount: items.length,
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
        };
      });

      // หาร้านที่ถูกที่สุด
      const cheapest = suppliers.sort((a, b) => a.total - b.total)[0];

      // คำนวณการประหยัด
      const totalSavings = 0; // TODO: Calculate based on alternative prices
      const savingsPercentage = (totalSavings / totalCost) * 100;

      return {
        materials: quotes,
        totalCost,
        totalSavings,
        savingsPercentage,
        suppliers,
        recommendations: {
          cheapest: cheapest.supplierId,
          bestValue: cheapest.supplierId,
        },
      };
    } catch (error) {
      console.error('Error comparing bulk prices:', error);
      throw error;
    }
  }

  /**
   * ดึงประวัติราคา
   */
  static async getPriceHistory(
    materialId: string,
    days: number = 90
  ): Promise<PriceHistory[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const q = query(
        collection(db, PRICE_HISTORY_COLLECTION),
        where('materialId', '==', materialId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          date: data.date?.toDate() || new Date(),
        } as PriceHistory;
      });
    } catch (error) {
      console.error('Error getting price history:', error);
      throw error;
    }
  }

  /**
   * วิเคราะห์แนวโน้มราคา
   */
  static async analyzePriceTrend(materialId: string): Promise<PriceTrend> {
    try {
      const history = await this.getPriceHistory(materialId, 90);
      
      if (history.length < 2) {
        throw new Error('Not enough price history');
      }

      const currentPrice = history[history.length - 1].price;
      const previousPrice = history[history.length - 2].price;
      const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100;

      let trend: 'up' | 'down' | 'stable';
      if (changePercent > 5) trend = 'up';
      else if (changePercent < -5) trend = 'down';
      else trend = 'stable';

      // Get material name
      const materialDoc = await getDocs(
        query(collection(db, MATERIALS_COLLECTION), where('__name__', '==', materialId))
      );
      const materialName = materialDoc.docs[0]?.data().name || 'Unknown';

      return {
        materialId,
        materialName,
        currentPrice,
        trend,
        changePercent,
        history,
      };
    } catch (error) {
      console.error('Error analyzing price trend:', error);
      throw error;
    }
  }

  /**
   * เพิ่มวัสดุใหม่
   */
  static async addMaterial(material: Omit<Material, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, MATERIALS_COLLECTION), material);
      return docRef.id;
    } catch (error) {
      console.error('Error adding material:', error);
      throw error;
    }
  }

  /**
   * เพิ่มราคาวัสดุ
   */
  static async addMaterialPrice(price: Omit<MaterialPrice, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, PRICES_COLLECTION), {
        ...price,
        lastUpdated: Timestamp.fromDate(new Date()),
        validUntil: price.validUntil ? Timestamp.fromDate(price.validUntil) : null,
      });

      // บันทึกประวัติราคา
      await addDoc(collection(db, PRICE_HISTORY_COLLECTION), {
        materialId: price.materialId,
        supplierId: price.supplierId,
        price: price.price,
        date: Timestamp.fromDate(new Date()),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding material price:', error);
      throw error;
    }
  }

  /**
   * อัปเดตราคาวัสดุ
   */
  static async updateMaterialPrice(
    priceId: string,
    updates: Partial<MaterialPrice>
  ): Promise<void> {
    try {
      const priceRef = doc(db, PRICES_COLLECTION, priceId);
      await updateDoc(priceRef, {
        ...updates,
        lastUpdated: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      console.error('Error updating material price:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูล Supplier
   */
  static async getSuppliers(): Promise<Supplier[]> {
    try {
      const snapshot = await getDocs(
        query(collection(db, SUPPLIERS_COLLECTION), orderBy('rating', 'desc'))
      );
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Supplier));
    } catch (error) {
      console.error('Error getting suppliers:', error);
      throw error;
    }
  }

  /**
   * คำนวณการประหยัด
   */
  static calculateSavings(
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
}
