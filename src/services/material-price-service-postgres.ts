/**
 * Material Price Service (PostgreSQL)
 * ใช้ Prisma แทน Firebase
 */

import { prisma } from '@/lib/prisma';
import type {
  Material,
  MaterialPrice,
  PriceComparison,
  MaterialSearchFilters
} from '@/types/material';

export class MaterialPriceServicePostgres {
  /**
   * ค้นหาวัสดุ
   */
  static async searchMaterials(
    searchTerm: string,
    filters?: MaterialSearchFilters
  ): Promise<Material[]> {
    const materials = await prisma.material.findMany({
      where: {
        AND: [
          searchTerm ? {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { brand: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
            ],
          } : {},
          filters?.category ? { category: filters.category } : {},
          filters?.brand ? { brand: filters.brand } : {},
        ],
      },
      include: {
        prices: true,
      },
    });

    return materials.map(m => ({
      id: m.id,
      name: m.name,
      category: m.category as any,
      brand: m.brand || undefined,
      model: m.model || undefined,
      specification: m.specification || undefined,
      unit: m.unit as any,
      description: m.description || undefined,
      imageUrl: m.imageUrl || undefined,
      tags: m.tags,
    }));
  }

  /**
   * ดึงราคาวัสดุจากทุกร้าน
   */
  static async getMaterialPrices(materialId: string): Promise<MaterialPrice[]> {
    const prices = await prisma.materialPrice.findMany({
      where: { materialId },
      orderBy: { price: 'asc' },
    });

    return prices.map(p => ({
      id: p.id,
      materialId: p.materialId,
      supplierId: p.supplierId,
      supplierName: p.supplierName,
      price: p.price,
      unit: p.unit as any,
      minOrder: p.minOrder || undefined,
      maxOrder: p.maxOrder || undefined,
      discount: p.discount || undefined,
      discountCondition: p.discountCondition || undefined,
      deliveryFee: p.deliveryFee || undefined,
      deliveryTime: p.deliveryTime || undefined,
      inStock: p.inStock,
      stockQuantity: p.stockQuantity || undefined,
      lastUpdated: p.updatedAt,
      validUntil: p.validUntil || undefined,
      notes: p.notes || undefined,
    }));
  }

  /**
   * เปรียบเทียบราคาวัสดุ
   */
  static async comparePrices(materialId: string): Promise<PriceComparison> {
    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      throw new Error('Material not found');
    }

    const prices = await this.getMaterialPrices(materialId);

    if (prices.length === 0) {
      throw new Error('No prices found for this material');
    }

    const lowestPrice = prices[0];
    const highestPrice = prices[prices.length - 1];
    const averagePrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;

    const priceRange = {
      min: lowestPrice.price,
      max: highestPrice.price,
      difference: highestPrice.price - lowestPrice.price,
      percentDifference: ((highestPrice.price - lowestPrice.price) / lowestPrice.price) * 100,
    };

    const inStockPrices = prices.filter(p => p.inStock);
    const bestValue = inStockPrices.length > 0 ? inStockPrices[0] : prices[0];
    const fastest = [...prices].sort((a, b) => 
      (a.deliveryTime || 999) - (b.deliveryTime || 999)
    )[0];

    return {
      material: {
        id: material.id,
        name: material.name,
        category: material.category as any,
        brand: material.brand || undefined,
        model: material.model || undefined,
        specification: material.specification || undefined,
        unit: material.unit as any,
        description: material.description || undefined,
        imageUrl: material.imageUrl || undefined,
        tags: material.tags,
      },
      prices,
      lowestPrice,
      highestPrice,
      averagePrice,
      priceRange,
      recommendations: {
        bestValue,
        bestQuality: prices[0],
        fastest,
      },
    };
  }

  /**
   * เพิ่มวัสดุใหม่
   */
  static async addMaterial(material: Omit<Material, 'id'>): Promise<string> {
    const created = await prisma.material.create({
      data: {
        name: material.name,
        category: material.category,
        brand: material.brand,
        model: material.model,
        specification: material.specification,
        unit: material.unit,
        description: material.description,
        imageUrl: material.imageUrl,
        tags: material.tags || [],
      },
    });

    return created.id;
  }

  /**
   * เพิ่มราคาวัสดุ
   */
  static async addMaterialPrice(price: Omit<MaterialPrice, 'id' | 'lastUpdated'>): Promise<string> {
    const created = await prisma.materialPrice.create({
      data: {
        materialId: price.materialId,
        supplierId: price.supplierId,
        supplierName: price.supplierName,
        price: price.price,
        unit: price.unit,
        minOrder: price.minOrder,
        maxOrder: price.maxOrder,
        discount: price.discount,
        discountCondition: price.discountCondition,
        deliveryFee: price.deliveryFee,
        deliveryTime: price.deliveryTime,
        inStock: price.inStock,
        stockQuantity: price.stockQuantity,
        notes: price.notes,
        validUntil: price.validUntil,
      },
    });

    return created.id;
  }

  /**
   * อัปเดตราคาวัสดุ
   */
  static async updateMaterialPrice(
    priceId: string,
    updates: Partial<MaterialPrice>
  ): Promise<void> {
    await prisma.materialPrice.update({
      where: { id: priceId },
      data: updates as any,
    });
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
