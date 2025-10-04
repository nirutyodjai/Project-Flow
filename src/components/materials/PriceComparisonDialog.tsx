/**
 * Price Comparison Dialog Component
 * แสดงการเปรียบเทียบราคาจากหลายร้าน
 */

'use client';

import { useState, useEffect } from 'react';
import { MaterialPriceService } from '@/services/material-price-service';
import type { Material, PriceComparison } from '@/types/material';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingDown, 
  TrendingUp, 
  Store, 
  Truck, 
  Package,
  Award,
  Zap,
  DollarSign,
  Loader2
} from 'lucide-react';

interface PriceComparisonDialogProps {
  material: Material;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PriceComparisonDialog({ 
  material, 
  open, 
  onOpenChange 
}: PriceComparisonDialogProps) {
  const [comparison, setComparison] = useState<PriceComparison | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && material.id) {
      loadComparison();
    }
  }, [open, material.id]);

  const loadComparison = async () => {
    setLoading(true);
    try {
      const data = await MaterialPriceService.comparePrices(material.id);
      setComparison(data);
    } catch (error) {
      console.error('Error loading price comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{material.name}</DialogTitle>
          <DialogDescription>
            เปรียบเทียบราคาจาก {comparison?.prices.length || 0} ร้านค้า
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">กำลังโหลดข้อมูล...</span>
          </div>
        ) : comparison ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span>ราคาต่ำสุด</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {comparison.lowestPrice.price.toLocaleString()} ฿
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {comparison.lowestPrice.supplierName}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span>ราคาเฉลี่ย</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {comparison.averagePrice.toLocaleString()} ฿
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    จาก {comparison.prices.length} ร้าน
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span>ประหยัดได้สูงสุด</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {comparison.priceRange.difference.toLocaleString()} ฿
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {comparison.priceRange.percentDifference.toFixed(1)}% ต่างกัน
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h3 className="font-semibold">แนะนำ</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <Card className="border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">คุ้มค่าที่สุด</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {comparison.recommendations.bestValue.price.toLocaleString()} ฿
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {comparison.recommendations.bestValue.supplierName}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">ส่งเร็วที่สุด</span>
                    </div>
                    <p className="text-lg font-bold text-blue-600">
                      {comparison.recommendations.fastest.deliveryTime || 'N/A'} วัน
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {comparison.recommendations.fastest.supplierName}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-sm">คุณภาพดี</span>
                    </div>
                    <p className="text-lg font-bold text-purple-600">
                      {comparison.recommendations.bestQuality.price.toLocaleString()} ฿
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {comparison.recommendations.bestQuality.supplierName}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Price List */}
            <div className="space-y-3">
              <h3 className="font-semibold">รายการราคาทั้งหมด</h3>
              <div className="space-y-2">
                {comparison.prices.map((price, index) => (
                  <Card 
                    key={price.id}
                    className={index === 0 ? 'border-green-200 bg-green-50/30' : ''}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{price.supplierName}</span>
                            {index === 0 && (
                              <Badge variant="default" className="ml-2">
                                ถูกที่สุด
                              </Badge>
                            )}
                            {!price.inStock && (
                              <Badge variant="destructive">สินค้าหมด</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">ราคา</p>
                              <p className="font-bold text-lg">
                                {price.price.toLocaleString()} ฿
                              </p>
                            </div>

                            {price.deliveryTime && (
                              <div>
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <Truck className="h-3 w-3" />
                                  จัดส่ง
                                </p>
                                <p className="font-medium">{price.deliveryTime} วัน</p>
                              </div>
                            )}

                            {price.deliveryFee !== undefined && (
                              <div>
                                <p className="text-muted-foreground">ค่าส่ง</p>
                                <p className="font-medium">
                                  {price.deliveryFee === 0 ? 'ฟรี' : `${price.deliveryFee} ฿`}
                                </p>
                              </div>
                            )}

                            {price.stockQuantity && (
                              <div>
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  สต็อก
                                </p>
                                <p className="font-medium">{price.stockQuantity}</p>
                              </div>
                            )}
                          </div>

                          {price.discount && (
                            <div className="mt-2">
                              <Badge variant="secondary">
                                ส่วนลด {price.discount}%
                              </Badge>
                              {price.discountCondition && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  {price.discountCondition}
                                </span>
                              )}
                            </div>
                          )}

                          {price.notes && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {price.notes}
                            </p>
                          )}
                        </div>

                        <Button variant="outline" size="sm">
                          เลือก
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            ไม่พบข้อมูลราคา
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
