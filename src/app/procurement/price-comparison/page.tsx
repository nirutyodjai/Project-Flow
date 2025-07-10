'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Filter, 
  Search,
  ArrowUpDown,
  FileSpreadsheet,
  BarChart3,
  LineChart,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';

export default function PriceComparisonPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState('description');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [priceChanges, setPriceChanges] = useState<{
    increased: number;
    decreased: number;
    unchanged: number;
    averageChange: number;
    significantChanges: any[];
  }>({
    increased: 0,
    decreased: 0,
    unchanged: 0,
    averageChange: 0,
    significantChanges: []
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/procurement/price-list/categories');
      
      if (!response.ok) {
        throw new Error(`การดึงข้อมูลหมวดหมู่ล้มเหลว: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'การดึงข้อมูลหมวดหมู่ล้มเหลว');
      }
      
      setCategories(data.data);
      
      // เลือกหมวดหมู่แรกเป็นค่าเริ่มต้น
      if (data.data.length > 0 && !selectedCategory) {
        setSelectedCategory(data.data[0]);
        loadItemsByCategory(data.data[0]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setError(error instanceof Error ? error.message : 'การดึงข้อมูลหมวดหมู่ล้มเหลว');
    }
  };

  const loadItemsByCategory = async (category: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/procurement/price-list?category=${encodeURIComponent(category)}`);
      
      if (!response.ok) {
        throw new Error(`การดึงข้อมูลล้มเหลว: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'การดึงข้อมูลล้มเหลว');
      }
      
      setItems(data.data);
      analyzePriceChanges(data.data);
    } catch (error) {
      console.error('Error loading items:', error);
      setError(error instanceof Error ? error.message : 'การดึงข้อมูลล้มเหลว');
    } finally {
      setIsLoading(false);
    }
  };

  const searchItems = async () => {
    if (!searchText.trim()) {
      toast({
        title: "กรุณาระบุคำค้นหา",
        description: "โปรดระบุคำอธิบายหรือรหัสสินค้าที่ต้องการค้นหา",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams();
      
      // ตรวจสอบว่าเป็นการค้นหาตามรหัสหรือคำอธิบาย
      if (searchText.match(/^[A-Za-z0-9\-]+$/)) {
        searchParams.append('materialCode', searchText);
      } else {
        searchParams.append('description', searchText);
      }
      
      const response = await fetch(`/api/procurement/price-list?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`การค้นหาล้มเหลว: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'การค้นหาล้มเหลว');
      }
      
      setItems(data.data);
      setSelectedCategory('');
      
      if (data.data.length === 0) {
        toast({
          title: "ไม่พบข้อมูล",
          description: "ไม่พบรายการที่ตรงกับคำค้นหา",
          variant: "default"
        });
      } else {
        analyzePriceChanges(data.data);
      }
    } catch (error) {
      console.error('Error searching items:', error);
      setError(error instanceof Error ? error.message : 'การค้นหาล้มเหลว');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePriceChanges = (data: any[]) => {
    // จำนวนรายการที่ราคาเพิ่มขึ้น ลดลง ไม่เปลี่ยนแปลง
    let increased = 0;
    let decreased = 0;
    let unchanged = 0;
    let totalChangePercent = 0;
    let significantChanges: any[] = [];
    
    data.forEach(item => {
      // คำนวณเปอร์เซ็นต์การเปลี่ยนแปลงถ้ามีข้อมูล standardPrice
      if (item.standardPrice && item.priceList) {
        const changeAmount = item.priceList - item.standardPrice;
        const changePercent = (changeAmount / item.standardPrice) * 100;
        
        if (changePercent > 0) {
          increased++;
          totalChangePercent += changePercent;
        } else if (changePercent < 0) {
          decreased++;
          totalChangePercent += changePercent;
        } else {
          unchanged++;
        }
        
        // บันทึกรายการที่มีการเปลี่ยนแปลงอย่างมีนัยสำคัญ (มากกว่า 10%)
        if (Math.abs(changePercent) >= 10) {
          significantChanges.push({
            ...item,
            changePercent,
            changeAmount
          });
        }
      } else {
        unchanged++;
      }
    });
    
    // คำนวณการเปลี่ยนแปลงราคาเฉลี่ย
    const averageChange = data.length > 0 ? totalChangePercent / data.length : 0;
    
    // เรียงลำดับตามการเปลี่ยนแปลงมากที่สุด
    significantChanges.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    
    // จำกัดให้เหลือแค่ 5 รายการที่มีการเปลี่ยนแปลงมากที่สุด
    significantChanges = significantChanges.slice(0, 5);
    
    setPriceChanges({
      increased,
      decreased,
      unchanged,
      averageChange,
      significantChanges
    });
  };

  const handleSort = (field: string) => {
    // ถ้าคลิกที่ field เดิม ให้สลับ order
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // ถ้าเปลี่ยน field ใหม่ ให้เริ่มจาก asc
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // เรียงข้อมูลตาม sortField และ sortOrder
  const sortedItems = [...items].sort((a, b) => {
    if (sortField === 'description') {
      return sortOrder === 'asc' 
        ? a.description.localeCompare(b.description) 
        : b.description.localeCompare(a.description);
    } else if (sortField === 'materialCode') {
      return sortOrder === 'asc' 
        ? a.materialCode.localeCompare(b.materialCode) 
        : b.materialCode.localeCompare(a.materialCode);
    } else if (sortField === 'priceList') {
      return sortOrder === 'asc' 
        ? a.priceList - b.priceList 
        : b.priceList - a.priceList;
    } else if (sortField === 'standardPrice') {
      const aPrice = a.standardPrice || 0;
      const bPrice = b.standardPrice || 0;
      return sortOrder === 'asc' ? aPrice - bPrice : bPrice - aPrice;
    } else if (sortField === 'priceChange') {
      const aChange = a.standardPrice ? ((a.priceList - a.standardPrice) / a.standardPrice) * 100 : 0;
      const bChange = b.standardPrice ? ((b.priceList - b.standardPrice) / b.standardPrice) * 100 : 0;
      return sortOrder === 'asc' ? aChange - bChange : bChange - aChange;
    }
    
    return 0;
  });

  return (
    <div className="container mx-auto py-8">
      <PageHeader 
        heading="เปรียบเทียบราคาสินค้า" 
        text="ติดตามและวิเคราะห์การเปลี่ยนแปลงราคาในไพรีสลิสต์" 
      />
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>ค้นหาสินค้า</CardTitle>
            <CardDescription>ค้นหาตามรหัสหรือคำอธิบาย</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="ระบุรหัสสินค้าหรือคำอธิบาย" 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={searchItems}
                  disabled={isLoading || !searchText.trim()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  ค้นหา
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">หรือเลือกตามหมวดหมู่:</label>
                <Select value={selectedCategory} onValueChange={(value) => {
                  setSelectedCategory(value);
                  loadItemsByCategory(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle>ภาพรวมการเปลี่ยนแปลงราคา</CardTitle>
            <CardDescription>วิเคราะห์การเปลี่ยนแปลงราคาเทียบกับราคามาตรฐาน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">ราคาเพิ่มขึ้น</p>
                  <p className="text-2xl font-bold text-green-700">{priceChanges.increased}</p>
                  <p className="text-xs text-green-600">รายการ</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">ราคาลดลง</p>
                  <p className="text-2xl font-bold text-red-700">{priceChanges.decreased}</p>
                  <p className="text-xs text-red-600">รายการ</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">การเปลี่ยนแปลงเฉลี่ย</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {priceChanges.averageChange > 0 ? '+' : ''}
                    {priceChanges.averageChange.toFixed(2)}%
                  </p>
                  <p className="text-xs text-blue-600">จากราคามาตรฐาน</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            {priceChanges.significantChanges.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  รายการที่มีการเปลี่ยนแปลงราคามากที่สุด
                </h3>
                <ul className="space-y-1">
                  {priceChanges.significantChanges.map((item, index) => (
                    <li key={index} className="text-sm flex justify-between">
                      <span className="truncate max-w-[70%]">{item.description}</span>
                      <span className={item.changePercent > 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.changePercent > 0 ? '+' : ''}
                        {item.changePercent.toFixed(2)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* แสดงตารางรายการสินค้า */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      ) : items.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>รายการสินค้า ({items.length} รายการ)</CardTitle>
            <CardDescription>
              {selectedCategory ? `หมวดหมู่: ${selectedCategory}` : 'ผลการค้นหา'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('materialCode')}>
                      <div className="flex items-center space-x-1">
                        <span>รหัสสินค้า</span>
                        {sortField === 'materialCode' && (
                          <ArrowUpDown size={14} className={sortOrder === 'desc' ? 'rotate-180' : ''} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('description')}>
                      <div className="flex items-center space-x-1">
                        <span>รายละเอียด</span>
                        {sortField === 'description' && (
                          <ArrowUpDown size={14} className={sortOrder === 'desc' ? 'rotate-180' : ''} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>หน่วย</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('standardPrice')}>
                      <div className="flex items-center space-x-1">
                        <span>ราคามาตรฐาน</span>
                        {sortField === 'standardPrice' && (
                          <ArrowUpDown size={14} className={sortOrder === 'desc' ? 'rotate-180' : ''} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('priceList')}>
                      <div className="flex items-center space-x-1">
                        <span>ราคาปัจจุบัน</span>
                        {sortField === 'priceList' && (
                          <ArrowUpDown size={14} className={sortOrder === 'desc' ? 'rotate-180' : ''} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('priceChange')}>
                      <div className="flex items-center space-x-1">
                        <span>% เปลี่ยนแปลง</span>
                        {sortField === 'priceChange' && (
                          <ArrowUpDown size={14} className={sortOrder === 'desc' ? 'rotate-180' : ''} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>ผู้ผลิต/ผู้จัดจำหน่าย</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item) => {
                    // คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง
                    const hasStandardPrice = item.standardPrice > 0;
                    const priceChange = hasStandardPrice 
                      ? ((item.priceList - item.standardPrice) / item.standardPrice) * 100 
                      : null;
                      
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.materialCode}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          {item.standardPrice 
                            ? item.standardPrice.toLocaleString('th-TH', {minimumFractionDigits: 2}) 
                            : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.priceList.toLocaleString('th-TH', {minimumFractionDigits: 2})}
                        </TableCell>
                        <TableCell>
                          {priceChange !== null ? (
                            <span className={
                              priceChange > 0 
                                ? 'text-green-600' 
                                : priceChange < 0 
                                ? 'text-red-600' 
                                : ''
                            }>
                              {priceChange > 0 ? '+' : ''}
                              {priceChange.toFixed(2)}%
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {item.maker && <div>ผู้ผลิต: {item.maker}</div>}
                            {item.supplier && <div>ผู้จำหน่าย: {item.supplier}</div>}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8">
          <p className="text-lg">ไม่พบรายการสินค้า</p>
        </div>
      )}
    </div>
  );
}
