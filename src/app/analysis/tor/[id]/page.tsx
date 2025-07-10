'use client'

import React, { useEffect, useState } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  FileText,
  Info,
  List,
  CircleCheck,
  ShieldAlert,
  Calendar,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getDocumentById } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';

interface AnalysisDetail {
  id: string;
  title: string;
  summary: string;
  scopeOfWork: string[];
  keyRequirements: string[];
  risks: string[];
  deadlines: { date: string, description: string }[];
  imageUrl: string;
  createdAt: string;
  status: string;
}

export default function TORAnalysisDetailPage({ params }: { params: { id: string } }) {
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const data = await getDocumentById('torAnalyses', params.id);
        if (data) {
          setAnalysis(data as AnalysisDetail);
        } else {
          toast({
            title: 'ไม่พบข้อมูล',
            description: 'ไม่พบผลการวิเคราะห์ที่ต้องการ',
            variant: 'destructive',
          });
          router.push('/analysis/tor');
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลผลการวิเคราะห์ได้',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [params.id, router, toast]);

  const handleCreateBOQ = () => {
    if (!analysis) return;
    
    // บันทึกข้อมูลการวิเคราะห์เข้า session storage เพื่อใช้ในหน้าสร้าง BOQ
    sessionStorage.setItem('torAnalysisResult', JSON.stringify({
      summary: analysis.summary,
      scopeOfWork: analysis.scopeOfWork,
      keyRequirements: analysis.keyRequirements,
      risks: analysis.risks,
      deadlines: analysis.deadlines,
    }));
    sessionStorage.setItem('torAnalysisId', analysis.id);
    
    // นำทางไปยังหน้าสร้าง BOQ
    router.push('/procurement/boq/new?from=tor&id=' + analysis.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title={analysis.title}
        description={`วิเคราะห์เมื่อ: ${formatDate(analysis.createdAt)}`}
        actions={
          <div className="flex gap-3">
            <Link href="/analysis/tor">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                กลับไปยังรายการ
              </Button>
            </Link>
            <Button onClick={handleCreateBOQ}>
              <FileText className="mr-2 h-4 w-4" />
              สร้าง BOQ จากผลการวิเคราะห์
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Image & Summary */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="aspect-video relative overflow-hidden rounded-md">
                {analysis.imageUrl && (
                  <Image
                    src={analysis.imageUrl}
                    alt="TOR Document"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain"
                    priority
                  />
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Info className="text-primary" /> สรุปภาพรวม
              </h3>
              <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <List className="text-primary" /> ขอบเขตงานหลัก
              </h3>
              <ul className="space-y-2 list-inside">
                {analysis.scopeOfWork.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CircleCheck className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <CircleCheck className="text-primary" /> คุณสมบัติสำคัญ
              </h3>
              <ul className="space-y-2 list-inside">
                {analysis.keyRequirements.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CircleCheck className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ShieldAlert className="text-primary" /> ความเสี่ยงและข้อกังวล
                </h3>
                <ul className="space-y-2 list-inside">
                  {analysis.risks.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <ShieldAlert className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="text-primary" /> กำหนดการสำคัญ
                </h3>
                <ul className="space-y-2 list-inside">
                  {analysis.deadlines.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span>
                        <strong>{item.date}:</strong> {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
