'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import QuotationTypeSelector from '../components/quotation-type-selector';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewQuotationPage() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader 
        title="สร้างใบเสนอราคา" 
        description="เลือกประเภทใบเสนอราคาที่ต้องการสร้าง"
        extra={
          <Button variant="outline" asChild>
            <Link href="/procurement/quotation">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปยังรายการใบเสนอราคา
            </Link>
          </Button>
        }
      />
      
      <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
        <QuotationTypeSelector />
      </div>
    </div>
  );
}
