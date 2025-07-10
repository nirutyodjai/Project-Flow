import React from 'react';
import PageHeader from '@/components/page-header';
import TORImageAnalysis from '../../components/tor-image-analysis';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTORAnalysisPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="วิเคราะห์เอกสาร TOR ใหม่"
        description="อัปโหลดภาพเอกสาร TOR เพื่อให้ AI วิเคราะห์และสกัดข้อมูลสำคัญ"
        actions={
          <Link href="/analysis/tor">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปยังรายการ
            </Button>
          </Link>
        }
      />
      
      <TORImageAnalysis />
    </div>
  );
}
