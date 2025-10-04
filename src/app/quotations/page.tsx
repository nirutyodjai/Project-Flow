/**
 * Quotations Page
 * หน้าจัดการใบเสนอราคา
 */

'use client';

import { useState } from 'react';
import { QuotationGenerator, QuotationList } from '@/components/quotation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function QuotationsPage() {
  // Mock user ID
  const userId = 'user-123';

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">รายการใบเสนอราคา</TabsTrigger>
          <TabsTrigger value="create">สร้างใหม่</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <QuotationList userId={userId} />
        </TabsContent>

        <TabsContent value="create">
          <QuotationGenerator userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
