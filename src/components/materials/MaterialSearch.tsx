/**
 * Material Search Component
 * ค้นหาและเปรียบเทียบราคาวัสดุ
 */

'use client';

import { useState } from 'react';
import { MaterialPriceService } from '@/services/material-price-service';
import type { Material, MaterialSearchFilters } from '@/types/material';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Loader2 } from 'lucide-react';
import { MaterialCard } from './MaterialCard';

export function MaterialSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<MaterialSearchFilters>({
    sortBy: 'price',
    sortOrder: 'asc',
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const results = await MaterialPriceService.searchMaterials(searchTerm, filters);
      setMaterials(results);
    } catch (error) {
      console.error('Error searching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาวัสดุ</CardTitle>
          <CardDescription>ค้นหาและเปรียบเทียบราคาวัสดุจากหลายร้าน</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาวัสดุ เช่น สายไฟ, ท่อ, ปูนซีเมนต์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังค้นหา...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  ค้นหา
                </>
              )}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value as any })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="หมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="electrical">ไฟฟ้า</SelectItem>
                <SelectItem value="plumbing">ประปา</SelectItem>
                <SelectItem value="construction">ก่อสร้าง</SelectItem>
                <SelectItem value="paint">สี</SelectItem>
                <SelectItem value="hardware">ฮาร์ดแวร์</SelectItem>
                <SelectItem value="wood">ไม้</SelectItem>
                <SelectItem value="steel">เหล็ก</SelectItem>
                <SelectItem value="cement">ปูนซีเมนต์</SelectItem>
                <SelectItem value="tile">กระเบื้อง</SelectItem>
                <SelectItem value="sanitary">สุขภัณฑ์</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters({ ...filters, sortBy: value as any })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="เรียงตาม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">ราคา</SelectItem>
                <SelectItem value="name">ชื่อ</SelectItem>
                <SelectItem value="rating">คะแนน</SelectItem>
                <SelectItem value="delivery">การจัดส่ง</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {materials.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            ผลการค้นหา ({materials.length} รายการ)
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && materials.length === 0 && searchTerm && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">ไม่พบวัสดุที่ค้นหา</p>
            <p className="text-sm text-muted-foreground mt-2">
              ลองค้นหาด้วยคำอื่นหรือเปลี่ยนตัวกรอง
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
