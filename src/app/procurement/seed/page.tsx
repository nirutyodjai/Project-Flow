'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { getDb } from '@/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// ข้อมูลตัวอย่างสำหรับใช้ในการ seed ข้อมูลลงฐานข้อมูล
const sampleProjects = [
  { 
    name: "โครงการก่อสร้างอาคารสำนักงาน A", 
    organization: "บริษัท พัฒนาที่ดินไทย จำกัด", 
    type: "เอกชน", 
    budget: "12,500,000", 
    address: "123 ถนนสาทร, กรุงเทพฯ", 
    contactPerson: "คุณสมศักดิ์", 
    phone: "081-234-5678", 
    documentUrl: "https://example.com/docs/project-a.pdf" 
  },
  { 
    name: "โครงการปรับปรุงระบบไฟฟ้า B", 
    organization: "การไฟฟ้านครหลวง", 
    type: "ภาครัฐ", 
    budget: "8,750,000", 
    address: "456 ถนนเพลินจิต, กรุงเทพฯ", 
    contactPerson: "คุณวิเชียร", 
    phone: "082-345-6789", 
    documentUrl: "https://example.com/docs/project-b.pdf" 
  },
  { 
    name: "โครงการติดตั้งระบบปรับอากาศ C", 
    organization: "โรงแรมแกรนด์ไฮแอท", 
    type: "เอกชน", 
    budget: "6,200,000", 
    address: "789 ถนนสุขุมวิท, กรุงเทพฯ", 
    contactPerson: "คุณมาลี", 
    phone: "083-456-7890", 
    documentUrl: "https://example.com/docs/project-c.pdf" 
  },
  { 
    name: "โครงการก่อสร้างถนนเชื่อมโยง", 
    organization: "กรมทางหลวง", 
    type: "ภาครัฐ", 
    budget: "45,000,000", 
    address: "หนองคาย-อุดรธานี", 
    contactPerson: "คุณประเสริฐ", 
    phone: "084-567-8901", 
    documentUrl: "https://example.com/docs/project-road.pdf" 
  },
  { 
    name: "โครงการระบบน้ำประปา", 
    organization: "การประปาส่วนภูมิภาค", 
    type: "ภาครัฐ", 
    budget: "15,800,000", 
    address: "เชียงใหม่", 
    contactPerson: "คุณประภา", 
    phone: "085-678-9012", 
    documentUrl: "https://example.com/docs/project-water.pdf" 
  },
  { 
    name: "โครงการศูนย์การค้าชุมชน", 
    organization: "กลุ่มนักลงทุนท้องถิ่น", 
    type: "เอกชน", 
    budget: "25,000,000", 
    address: "ขอนแก่น", 
    contactPerson: "คุณสมพงษ์", 
    phone: "086-789-0123", 
    documentUrl: "https://example.com/docs/project-mall.pdf" 
  },
  { 
    name: "โครงการปรับปรุงอาคารเรียน", 
    organization: "มหาวิทยาลัยแห่งชาติ", 
    type: "ภาครัฐ", 
    budget: "12,000,000", 
    address: "กรุงเทพฯ", 
    contactPerson: "ดร.วิชัย", 
    phone: "087-890-1234", 
    documentUrl: "https://example.com/docs/project-school.pdf" 
  },
  { 
    name: "โครงการอพาร์ทเม้นท์ริมแม่น้ำ", 
    organization: "บริษัท ริเวอร์วิว จำกัด", 
    type: "เอกชน", 
    budget: "80,000,000", 
    address: "ริมแม่น้ำเจ้าพระยา กรุงเทพฯ", 
    contactPerson: "คุณปรีชา", 
    phone: "088-901-2345", 
    documentUrl: "https://example.com/docs/project-apartment.pdf" 
  },
  { 
    name: "โครงการขยายเขตไฟฟ้า", 
    organization: "การไฟฟ้าส่วนภูมิภาค", 
    type: "ภาครัฐ", 
    budget: "5,500,000", 
    address: "นครราชสีมา", 
    contactPerson: "คุณพิชัย", 
    phone: "089-012-3456", 
    documentUrl: "https://example.com/docs/project-electric.pdf" 
  },
  { 
    name: "โครงการโรงแรมบูติค", 
    organization: "บริษัท ทราเวล จำกัด", 
    type: "เอกชน", 
    budget: "35,000,000", 
    address: "พัทยา ชลบุรี", 
    contactPerson: "คุณนภา", 
    phone: "090-123-4567", 
    documentUrl: "https://example.com/docs/project-hotel.pdf" 
  }
];

export default function SeedProcurementPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const db = getDb();
      if (!db) {
        throw new Error('Firestore not initialized');
      }
      
      const projectsCol = collection(db, 'projects');
      let successCount = 0;
      
      for (const project of sampleProjects) {
        await addDoc(projectsCol, {
          ...project,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        successCount++;
      }
      
      const resultMessage = `เพิ่มข้อมูลสำเร็จ ${successCount} รายการ`;
      setResult(resultMessage);
      toast({
        title: 'เพิ่มข้อมูลสำเร็จ',
        description: resultMessage,
      });
    } catch (error) {
      console.error('Error seeding data:', error);
      setResult(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเพิ่มข้อมูลได้ โปรดลองอีกครั้ง',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="เพิ่มข้อมูลตัวอย่างงานประมูล"
        description="เครื่องมือสำหรับเพิ่มข้อมูลตัวอย่างลงในฐานข้อมูล"
      />
      
      <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มข้อมูลตัวอย่างงานประมูล</CardTitle>
            <CardDescription>
              กดปุ่มด้านล่างเพื่อเพิ่มข้อมูลตัวอย่าง {sampleProjects.length} รายการลงในฐานข้อมูล
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Button 
                onClick={handleSeedData} 
                disabled={loading}
                size="lg"
              >
                {loading ? 'กำลังเพิ่มข้อมูล...' : 'เพิ่มข้อมูลตัวอย่าง'}
              </Button>
            </div>
            
            {result && (
              <div className={`p-4 rounded-md ${result.includes('ผิดพลาด') ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                {result}
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium">ข้อมูลที่จะถูกเพิ่ม:</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {sampleProjects.map((project, idx) => (
                  <li key={idx}>
                    {project.name} - {project.organization} ({project.type}) - {project.budget} บาท
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
