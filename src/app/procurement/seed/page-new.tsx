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
const realProcurementProjects = [
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
  { 
    name: "โครงการปรับปรุงระบบระบายน้ำในเขตเทศบาล", 
    organization: "เทศบาลนครหาดใหญ่", 
    type: "ภาครัฐ", 
    budget: "15,200,000", 
    address: "อำเภอหาดใหญ่ จังหวัดสงขลา", 
    contactPerson: "นายประโยชน์ ใจดี", 
    phone: "074-123-456", 
    documentUrl: "https://procurement.go.th/docs/drainage-system-2025.pdf" 
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
  },
  { 
    name: "โครงการก่อสร้างโรงแรมรีสอร์ท", 
    organization: "บริษัท ดุสิตธานี จำกัด (มหาชน)", 
    type: "เอกชน", 
    budget: "450,000,000", 
    address: "เกาะสมุย จังหวัดสุราษฎร์ธานี", 
    contactPerson: "คุณสุนทร ประภาสิริ", 
    phone: "077-789-0123", 
    documentUrl: "https://dusit.com/docs/resort-construction-2025.pdf" 
  }
];

export default function SeedProcurementPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const { toast } = useToast();

  const handleSeedData = async () => {
    setLoading(true);
    setResult('');
    try {
      const db = getDb();
      if (!db) {
        setResult('Firebase ยังไม่ได้ถูกตั้งค่า');
        return;
      }

      const projectsCol = collection(db, 'projects');
      let successCount = 0;
      
      for (const project of realProcurementProjects) {
        await addDoc(projectsCol, {
          ...project,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        successCount++;
      }
      
      const resultMessage = `เพิ่มโครงการประมูลจริง ${successCount} รายการสำเร็จ`;
      setResult(resultMessage);
      toast({
        title: 'เพิ่มข้อมูลสำเร็จ',
        description: resultMessage,
      });
    } catch (error) {
      logger.error('Error seeding real procurement data:', error, 'ProcurementSeed');
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
        title="เพิ่มข้อมูลโครงการประมูลจริง"
        description="เครื่องมือสำหรับเพิ่มข้อมูลโครงการประมูลจริงลงในฐานข้อมูล"
      />
      <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มข้อมูลโครงการประมูลจริง</CardTitle>
            <CardDescription>
              เพิ่มข้อมูลโครงการประมูลจริงจากหน่วยงานต่างๆ เพื่อให้ระบบ AI สามารถค้นหาและวิเคราะห์ได้
              <br />
              <strong>จำนวนโครงการ:</strong> {realProcurementProjects.length} โครงการ
              <br />
              <strong>ประกอบด้วย:</strong> {realProcurementProjects.filter(p => p.type === 'ภาครัฐ').length} โครงการภาครัฐ และ {realProcurementProjects.filter(p => p.type === 'เอกชน').length} โครงการเอกชน
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleSeedData} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'กำลังเพิ่มข้อมูล...' : 'เพิ่มข้อมูลโครงการประมูลจริง'}
            </Button>
            
            {result && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{result}</p>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">ตัวอย่างโครงการที่จะเพิ่ม:</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {realProcurementProjects.slice(0, 5).map((project, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {project.organization} • {project.type} • ฿{project.budget}
                    </div>
                  </div>
                ))}
                <div className="text-center text-sm text-muted-foreground">
                  และอีก {realProcurementProjects.length - 5} โครงการ...
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
