/**
 * Material Card Component
 * แสดงข้อมูลวัสดุแต่ละรายการ
 */

'use client';

import { useState } from 'react';
import type { Material } from '@/types/material';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, ShoppingCart } from 'lucide-react';
import { PriceComparisonDialog } from './PriceComparisonDialog';

interface MaterialCardProps {
  material: Material;
}

const categoryLabels = {
  electrical: 'ไฟฟ้า',
  plumbing: 'ประปา',
  construction: 'ก่อสร้าง',
  paint: 'สี',
  hardware: 'ฮาร์ดแวร์',
  wood: 'ไม้',
  steel: 'เหล็ก',
  cement: 'ปูนซีเมนต์',
  tile: 'กระเบื้อง',
  sanitary: 'สุขภัณฑ์',
  other: 'อื่นๆ',
};

const unitLabels = {
  piece: 'ชิ้น',
  meter: 'เมตร',
  sqm: 'ตร.ม.',
  kg: 'กก.',
  bag: 'ถุง',
  box: 'กล่อง',
  roll: 'ม้วน',
  set: 'ชุด',
  liter: 'ลิตร',
  gallon: 'แกลลอน',
};

export function MaterialCard({ material }: MaterialCardProps) {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{material.name}</CardTitle>
              <CardDescription className="mt-1">
                {material.brand && <span className="font-medium">{material.brand}</span>}
                {material.model && <span className="text-muted-foreground"> • {material.model}</span>}
              </CardDescription>
            </div>
            {material.imageUrl && (
              <div className="w-16 h-16 rounded-md overflow-hidden bg-accent flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category & Unit */}
          <div className="flex gap-2">
            <Badge variant="secondary">
              {categoryLabels[material.category]}
            </Badge>
            <Badge variant="outline">
              {unitLabels[material.unit]}
            </Badge>
          </div>

          {/* Description */}
          {material.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {material.description}
            </p>
          )}

          {/* Specification */}
          {material.specification && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">สเปค:</span> {material.specification}
            </div>
          )}

          {/* Tags */}
          {material.tags && material.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {material.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setShowComparison(true)}
              className="flex-1"
              variant="default"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              เปรียบเทียบราคา
            </Button>
            <Button variant="outline" size="icon">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Price Comparison Dialog */}
      <PriceComparisonDialog
        material={material}
        open={showComparison}
        onOpenChange={setShowComparison}
      />
    </>
  );
}
