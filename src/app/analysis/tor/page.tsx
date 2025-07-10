import React from 'react';
import TORAnalysisList from '../components/tor-analysis-list';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, FileUp } from 'lucide-react';
import Link from 'next/link';

export default function TORAnalysisPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="การวิเคราะห์เอกสาร TOR"
        description="วิเคราะห์เอกสารประกาศเชิญชวน (TOR) ด้วย AI เพื่อสกัดข้อมูลสำคัญ"
        actions={
          <Link href="/analysis/tor/new">
            <Button>
              <FileUp className="mr-2 h-4 w-4" />
              วิเคราะห์เอกสาร TOR ใหม่
            </Button>
          </Link>
        }
      />
      
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">
            <FileText className="mr-2 h-4 w-4" />
            รายการวิเคราะห์
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <TORAnalysisList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
