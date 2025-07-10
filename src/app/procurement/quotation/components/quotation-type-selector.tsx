// components/quotation-type-selector.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileSpreadsheet, Package, Hammer, Building, Layers } from 'lucide-react';
import { QuotationType } from '@/services/quotation-service';

export default function QuotationTypeSelector() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelect = (type: string) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      router.push(`/procurement/quotation/new/${selectedType}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${selectedType === QuotationType.MATERIAL_ONLY ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
          onClick={() => handleSelect(QuotationType.MATERIAL_ONLY)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <Package className="h-8 w-8 text-primary" />
              {selectedType === QuotationType.MATERIAL_ONLY && (
                <div className="w-4 h-4 rounded-full bg-primary"></div>
              )}
            </div>
            <CardTitle className="text-lg mt-4">เสนอราคาอย่างเดียว</CardTitle>
            <CardDescription>
              สร้างใบเสนอราคาเฉพาะสินค้าและวัสดุ ไม่รวมค่าแรง
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              เหมาะสำหรับการขายสินค้าหรือวัสดุเพียงอย่างเดียว โดยไม่มีการติดตั้งหรือค่าแรงรวมอยู่ด้วย
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedType === QuotationType.MATERIAL_LABOR ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
          onClick={() => handleSelect(QuotationType.MATERIAL_LABOR)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <Layers className="h-8 w-8 text-primary" />
              {selectedType === QuotationType.MATERIAL_LABOR && (
                <div className="w-4 h-4 rounded-full bg-primary"></div>
              )}
            </div>
            <CardTitle className="text-lg mt-4">เสนอราคาพร้อมค่าแรง</CardTitle>
            <CardDescription>
              สร้างใบเสนอราคาที่แยกสินค้าและค่าแรงอย่างชัดเจน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              เหมาะสำหรับงานที่มีทั้งการจำหน่ายสินค้าและมีค่าแรงในการติดตั้ง โดยแยกแสดงรายการอย่างชัดเจน
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedType === QuotationType.LABOR_ONLY ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
          onClick={() => handleSelect(QuotationType.LABOR_ONLY)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <Hammer className="h-8 w-8 text-primary" />
              {selectedType === QuotationType.LABOR_ONLY && (
                <div className="w-4 h-4 rounded-full bg-primary"></div>
              )}
            </div>
            <CardTitle className="text-lg mt-4">เสนอค่าแรงอย่างเดียว</CardTitle>
            <CardDescription>
              สร้างใบเสนอราคาเฉพาะค่าแรงและบริการ ไม่รวมสินค้า
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              เหมาะสำหรับงานที่เน้นการให้บริการ การติดตั้ง การซ่อมแซม หรืองานที่ลูกค้าเป็นผู้จัดหาวัสดุเอง
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${selectedType === QuotationType.BOQ_BASED ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
          onClick={() => handleSelect(QuotationType.BOQ_BASED)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <Building className="h-8 w-8 text-primary" />
              {selectedType === QuotationType.BOQ_BASED && (
                <div className="w-4 h-4 rounded-full bg-primary"></div>
              )}
            </div>
            <CardTitle className="text-lg mt-4">เสนอราคาตาม BOQ</CardTitle>
            <CardDescription>
              สร้างใบเสนอราคาโดยอ้างอิงจากข้อมูล BOQ ที่มีอยู่
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              เหมาะสำหรับงานโครงการที่มีการวิเคราะห์ TOR และสร้าง BOQ ไว้แล้ว สามารถดึงข้อมูลมาใช้ได้ทันที
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button disabled={!selectedType} onClick={handleContinue}>
          <PlusCircle className="mr-2 h-4 w-4" />
          ดำเนินการต่อ
        </Button>
      </div>
    </div>
  );
}
