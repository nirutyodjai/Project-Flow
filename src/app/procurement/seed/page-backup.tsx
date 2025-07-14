'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { getDb } from '@/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

// ข้อมูลโครงการประมูลจริงสำหรับใช้ในการ seed ข้อมูลลงฐานข้อมูล
const sampleProjects = [
  // โครงการภาครัฐ
  { 
    name: "โครงการก่อสร้างอาคารเรียน 3 ชั้น โรงเรียนบ้านหนองไผ่", 
    organization: "สำนักงานเขตพื้นที่การศึกษาประถมศึกษานครราชสีมา เขต 4", 
    type: "ภาครัฐ", 
    budget: "18,500,000", 
    address: "ตำบลหนองไผ่ อำเภอด่านขุนทด จังหวัดนครราชสีมา", 
    contactPerson: "นายสมชาย จันทร์เจริญ", 
    phone: "044-123-456", 
    documentUrl: "https://procurement.go.th/docs/school-building-2025.pdf" 
  },
  { 
    name: "โครงการจ้างเหมาบริการทำความสะอาดอาคารศาลากลางจังหวัด", 
    organization: "จังหวัดขอนแก่น", 
    type: "ภาครัฐ", 
    budget: "2,400,000", 
    address: "ศาลากลางจังหวัดขอนแก่น อำเภอเมือง จังหวัดขอนแก่น", 
    contactPerson: "นางสาวปิยะดา สมบูรณ์", 
    phone: "043-234-567", 
    documentUrl: "https://procurement.go.th/docs/cleaning-service-2025.pdf" 
  },
  { 
    name: "โครงการก่อสร้างถนนคอนกรีตเสริมเหล็ก สาย บ้านโนนสูง-บ้านหนองแวง", 
    organization: "เทศบาลตำบลโนนสูง", 
    type: "ภาครัฐ", 
    budget: "12,800,000", 
    address: "ตำบลโนนสูง อำเภอพิมาย จังหวัดนครราชสีมา", 
    contactPerson: "นายวิชัย ประทุมมาศ", 
    phone: "044-345-678", 
    documentUrl: "https://procurement.go.th/docs/road-construction-2025.pdf" 
  },
  { 
    name: "โครงการจัดซื้อครุภัณฑ์คอมพิวเตอร์สำหรับโรงเรียน", 
    organization: "โรงเรียนเทคโนโลยีพัฒนาอุตสาหกรรม", 
    type: "ภาครัฐ", 
    budget: "3,600,000", 
    address: "บางกะปิ กรุงเทพมหานคร", 
    contactPerson: "อาจารย์สุรีย์ วงษ์เทพ", 
    phone: "02-789-1234", 
    documentUrl: "https://procurement.go.th/docs/computer-equipment-2025.pdf" 
  },
  { 
    name: "โครงการติดตั้งระบบโซลาร์เซลล์บนหลังคาอาคารราชการ", 
    organization: "กรมพัฒนาพลังงานทดแทนและอนุรักษ์พลังงาน", 
    type: "ภาครัฐ", 
    budget: "8,900,000", 
    address: "กระทรวงพลังงาน ราชเทวี กรุงเทพมหานคร", 
    contactPerson: "วิศวกรหญิงพรทิพย์ ศรีสุวรรณ", 
    phone: "02-456-7890", 
    documentUrl: "https://procurement.go.th/docs/solar-installation-2025.pdf" 
  },
  
  // โครงการเอกชน
  { 
    name: "โครงการก่อสร้างอาคารสำนักงาน The PARQ Tower", 
    organization: "บริษัท สิงห์ เอสเตท จำกัด (มหาชน)", 
    type: "เอกชน", 
    budget: "180,000,000", 
    address: "ถนนรัชดาภิเษก เขตดินแดง กรุงเทพมหานคร", 
    contactPerson: "คุณณัฐพล เจริญสุข", 
    phone: "02-123-4567", 
    documentUrl: "https://singhaestate.co.th/docs/parq-tower-2025.pdf" 
  },
  { 
    name: "โครงการปรับปรุงระบบปรับอากาศโรงแรม", 
    organization: "โรงแรมแกรนด์ไฮแอท เอราวัณ", 
    type: "เอกชน", 
    budget: "25,500,000", 
    address: "ราชประสงค์ กรุงเทพมหานคร", 
    contactPerson: "คุณศิริชัย วรรณโชติ", 
    phone: "02-234-5678", 
    documentUrl: "https://grandhyatt.com/docs/hvac-upgrade-2025.pdf" 
  },
  { 
    name: "โครงการก่อสร้างโรงงานผลิตชิ้นส่วนยานยนต์", 
    organization: "บริษัท ไทยซัมมิท กรุ๊ป จำกัด (มหาชน)", 
    type: "เอกชน", 
    budget: "320,000,000", 
    address: "นิคมอุตสาหกรรมอีสเทิร์นซีบอร์ด ชลบุรี", 
    contactPerson: "วิศวกรสมศักดิ์ รัตนโชติ", 
    phone: "038-345-6789", 
    documentUrl: "https://thaisummit.co.th/docs/auto-parts-factory-2025.pdf" 
  },
  { 
    name: "โครงการติดตั้งระบบรักษาความปลอดภัยโรงพยาบาล", 
    organization: "โรงพยาบาลบำรุงราด", 
    type: "เอกชน", 
    budget: "12,300,000", 
    address: "สีลม กรุงเทพมหานคร", 
    contactPerson: "คุณนิภา สุขสันต์", 
    phone: "02-456-7891", 
    documentUrl: "https://bumrungrad.com/docs/security-system-2025.pdf" 
  },
  { 
    name: "โครงการก่อสร้างศูนย์การค้าชุมชน", 
    organization: "บริษัท เซ็นทรัล รีเทล คอร์ปอเรชั่น จำกัด (มหาชน)", 
    type: "เอกชน", 
    budget: "95,000,000", 
    address: "อำเภอเมือง จังหวัดอุบลราชธานี", 
    contactPerson: "คุณอรุณ มั่นใจ", 
    phone: "045-567-8912", 
    documentUrl: "https://centralretail.com/docs/community-mall-2025.pdf" 
  }
]; 
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
      logger.error('Error seeding data:', error, 'ProcurementSeed');
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
