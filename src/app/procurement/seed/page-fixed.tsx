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
    contactPerson: "ดร.อนุพงษ์ วิทยาภิรมย์", 
    phone: "02-123-4567", 
    documentUrl: "https://procurement.go.th/docs/computer-equipment-2025.pdf" 
  },

  // โครงการเอกชน
  { 
    name: "โครงการพัฒนาศูนย์การค้าชุมชน Central Community Mall", 
    organization: "Central Retail Corporation", 
    type: "เอกชน", 
    budget: "450,000,000", 
    address: "ลาดพร้าว กรุงเทพมหานคร", 
    contactPerson: "คุณศิริพร อำนวยสุข", 
    phone: "02-456-7890", 
    documentUrl: "https://centralretail.com/docs/community-mall-2025.pdf" 
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
    name: "โครงการก่อสร้างห้างสรรพสินค้า", 
    organization: "กลุ่มนักลงทุนท้องถิ่น", 
    type: "เอกชน", 
    budget: "25,000,000", 
    address: "ขอนแก่น", 
    contactPerson: "คุณสมพงษ์", 
    phone: "086-789-0123", 
    documentUrl: "https://example.com/docs/project-mall.pdf" 
  },
  { 
    name: "โครงการอาคารเรียนใหม่", 
    organization: "มหาวิทยาลัยแห่งชาติ", 
    type: "ภาครัฐ", 
    budget: "12,000,000", 
    address: "กรุงเทพฯ", 
    contactPerson: "ดร.วิชัย", 
    phone: "087-890-1234", 
    documentUrl: "https://example.com/docs/project-school.pdf" 
  },
  { 
    name: "โครงการอพาร์ตเมนต์หรู", 
    organization: "บริษัท ริเวอร์วิว จำกัด", 
    type: "เอกชน", 
    budget: "80,000,000", 
    address: "ริมแม่น้ำเจ้าพระยา กรุงเทพฯ", 
    contactPerson: "คุณปรีชา", 
    phone: "088-901-2345", 
    documentUrl: "https://example.com/docs/project-apartment.pdf" 
  },
  { 
    name: "โครงการระบบไฟฟ้า", 
    organization: "การไฟฟ้าส่วนภูมิภาค", 
    type: "ภาครัฐ", 
    budget: "5,500,000", 
    address: "นครราชสีมา", 
    contactPerson: "คุณพิชัย", 
    phone: "089-012-3456", 
    documentUrl: "https://example.com/docs/project-electric.pdf" 
  },
  { 
    name: "โครงการโรงแรม", 
    organization: "บริษัท ทราเวล จำกัด", 
    type: "เอกชน", 
    budget: "35,000,000", 
    address: "พัทยา ชลบุรี", 
    contactPerson: "คุณนภา", 
    phone: "090-123-4567", 
    documentUrl: "https://example.com/docs/project-hotel.pdf" 
  }
];

export default function SeedDataPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [seedCount, setSeedCount] = useState(0);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsLoading(true);
    setSeedCount(0);

    try {
      const db = getDb();
      const projectsCollection = collection(db, 'projects');

      let successCount = 0;
      let errorCount = 0;

      for (const project of sampleProjects) {
        try {
          const projectData = {
            ...project,
            status: 'เปิดรับสมัคร',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // random deadline within 30 days
            description: `รายละเอียดโครงการ ${project.name} จาก ${project.organization}`,
            requirements: ['ใบอนุญาต', 'ประสบการณ์ขั้นต่ำ 2 ปี', 'ทุนจดทะเบียนขั้นต่ำ 1 ล้านบาท'],
          };

          await addDoc(projectsCollection, projectData);
          successCount++;
          setSeedCount(successCount);
          logger.info('Seeded project', { projectName: project.name });
        } catch (error) {
          errorCount++;
          logger.error('Failed to seed project', { projectName: project.name, error });
        }
      }

      toast({
        title: 'Seed Data Complete!',
        description: `Successfully seeded ${successCount} projects. ${errorCount > 0 ? `${errorCount} errors occurred.` : ''}`,
        variant: successCount > 0 ? 'default' : 'destructive'
      });

    } catch (error) {
      logger.error('Seed data operation failed', { error });
      toast({
        title: 'Seed Failed',
        description: 'Failed to seed data. Please check the console for details.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    // Implementation would require querying all documents and deleting them
    // This is intentionally left simple for safety
    toast({
      title: 'Clear Data',
      description: 'Clear data functionality would be implemented here',
      variant: 'default'
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader 
        title="Seed Database" 
        description="เติมข้อมูลตัวอย่างโครงการประมูลลงในฐานข้อมูล Firebase" 
      />

      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลตัวอย่าง</CardTitle>
            <CardDescription>
              มีโครงการตัวอย่าง {sampleProjects.length} โครงการ ประกอบด้วยโครงการภาครัฐและเอกชน
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleSeedData} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? `Seeding... (${seedCount}/${sampleProjects.length})` : 'Seed Database'}
              </Button>
              
              <Button 
                onClick={handleClearData} 
                variant="outline"
                disabled={isLoading}
                className="w-full"
              >
                Clear Database
              </Button>
            </div>

            {isLoading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(seedCount / sampleProjects.length) * 100}%` }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายการโครงการตัวอย่าง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {sampleProjects.map((project, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-muted-foreground">{project.organization}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{project.budget} บาท</div>
                    <div className="text-muted-foreground">{project.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
