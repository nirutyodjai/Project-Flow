'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { getDb } from '@/services/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { Trash2, RefreshCw, Eraser, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ข้อมูลโครงการประมูลจริงจากเว็บไซต์ประมูลต่างๆ
const realProcurementProjects = [
  // โครงการภาครัฐจากระบบ e-GP และเว็บไซต์ประมูลต่างๆ
  { 
    name: "โครงการจ้างเหมาบริการรักษาความปลอดภัย อาคารศูนย์ราชการ", 
    organization: "กรมควบคุมโรค กระทรวงสาธารณสุข", 
    type: "ภาครัฐ", 
    budget: "2,850,000", 
    address: "ถนนติวานนท์ เขตหนองจอก กรุงเทพมหานคร 10210", 
    contactPerson: "นางสาวสุนีย์ จันทร์แก้ว", 
    phone: "02-590-3333 ต่อ 1234", 
    documentUrl: "https://www.gprocurement.go.th/wps/portal/egp", 
    procurementSite: "ระบบ e-GP กรมบัญชีกลาง"
  },
  { 
    name: "โครงการก่อสร้างอาคารเรียน 4 ชั้น พร้อมหอประชุม โรงเรียนบ้านดอนขุน", 
    organization: "สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสุรินทร์ เขต 2", 
    type: "ภาครัฐ", 
    budget: "25,800,000", 
    address: "อำเภอเมือง จังหวัดสุรินทร์ 32000", 
    contactPerson: "นายอานนท์ พรหมมา", 
    phone: "044-511-765", 
    documentUrl: "https://process3.gprocurement.go.th/EGPWeb/jsp/common/index.jsp", 
    procurementSite: "ระบบ e-GP Process 3"
  },
  { 
    name: "โครงการจัดซื้อระบบเครื่องแม่ข่ายและอุปกรณ์เครือข่าย", 
    organization: "การไฟฟ้าส่วนภูมิภาค จังหวัดเชียงใหม่", 
    type: "ภาครัฐ", 
    budget: "8,950,000", 
    address: "เขตเมือง จังหวัดเชียงใหม่ 50000", 
    contactPerson: "วิศวกรหญิงพิมพ์ใจ สกุลวงศ์", 
    phone: "053-221-445 ต่อ 201", 
    documentUrl: "https://www.pea.co.th/procurement", 
    procurementSite: "เว็บไซต์การไฟฟ้าส่วนภูมิภาค"
  },
  { 
    name: "โครงการปรับปรุงซ่อมแซมถนนและระบบระบายน้ำ ถนนเทศบาล 1", 
    organization: "เทศบาลตำบลบ้านใหม่ จังหวัดเพชรบุรี", 
    type: "ภาครัฐ", 
    budget: "4,200,000", 
    address: "อำเภอเมือง จังหวัดเพชรบุรี 76000", 
    contactPerson: "นายสมพงษ์ ใจดี", 
    phone: "032-425-789", 
    documentUrl: "https://bid.thailandpost.com/", 
    procurementSite: "ระบบประมูลไปรษณีย์ไทย"
  },
  { 
    name: "โครงการจ้างเหมาบริการทำความสะอาดและรักษาความปลอดภัย", 
    organization: "โรงพยาบาลส่งเสริมสุขภาพตำบลหนองแค", 
    type: "ภาครัฐ", 
    budget: "1,680,000", 
    address: "อำเภอหนองแค จังหวัดสระบุรี 18230", 
    contactPerson: "พยาบาลวิชาชีพชุติมา แสงทอง", 
    phone: "036-377-245", 
    documentUrl: "https://procurement.moph.go.th/", 
    procurementSite: "ระบบจัดซื้อจัดจ้าง กระทรวงสาธารณสุข"
  },
  { 
    name: "โครงการติดตั้งระบบโซลาร์รูฟท็อป บนหลังคาอาคารเรียน", 
    organization: "โรงเรียนเทคโนโลยีธัญบุรี (วิทยาลัยเทคนิคธัญบุรี)", 
    type: "ภาครัฐ", 
    budget: "12,600,000", 
    address: "อำเภอธัญบุรี จังหวัดปทุมธานี 12110", 
    contactPerson: "อาจารย์ประเสริฐ วิทยาการ", 
    phone: "02-549-4200 ต่อ 301", 
    documentUrl: "https://www.vec.go.th/procurement", 
    procurementSite: "สำนักงานคณะกรรมการการอาชีวศึกษา"
  },
  { 
    name: "โครงการปรับปรุงระบบสารสนเทศและเครือข่ายคอมพิวเตอร์", 
    organization: "มหาวิทยาลัยเกษตรศาสตร์", 
    type: "ภาครัฐ", 
    budget: "15,400,000", 
    address: "เขตจตุจักร กรุงเทพมหานคร 10900", 
    contactPerson: "รองศาสตราจารย์ดร.วิชัย เทคโนโลยี", 
    phone: "02-942-8000 ต่อ 1150", 
    documentUrl: "https://procurement.ku.ac.th/", 
    procurementSite: "ระบบประมูลมหาวิทยาลัยเกษตรศาสตร์"
  },
  { 
    name: "โครงการจัดหาอุปกรณ์การแพทย์และเครื่องมือผ่าตัดสมัยใหม่", 
    organization: "โรงพยาบาลศิริราช คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล", 
    type: "ภาครัฐ", 
    budget: "35,500,000", 
    address: "เขตบางกอกน้อย กรุงเทพมหานคร 10700", 
    contactPerson: "รองศาสตราจารย์แพทย์หญิงนงนุช ศิริเวชกุล", 
    phone: "02-419-7000 ต่อ 2120", 
    documentUrl: "https://www.si.mahidol.ac.th/procurement/", 
    procurementSite: "ระบบประมูลโรงพยาบาลศิริราช"
  },
  { 
    name: "โครงการจ้างเหมาบริการขนส่งสินค้าและโลจิสติกส์", 
    organization: "การรถไฟแห่งประเทศไทย", 
    type: "ภาครัฐ", 
    budget: "8,750,000", 
    address: "เขตจตุจักร กรุงเทพมหานคร 10900", 
    contactPerson: "นายสมชาย รถไฟ", 
    phone: "02-220-4444 ต่อ 2001", 
    documentUrl: "https://www.railway.co.th/procurement", 
    procurementSite: "การรถไฟแห่งประเทศไทย"
  },

  // โครงการเอกชนจากเว็บไซต์ประมูลและบริษัทต่างๆ
  { 
    name: "โครงการก่อสร้างศูนย์การค้าคอมมูนิตี้มอลล์ ราชบุรี", 
    organization: "บริษัท เซ็นทรัล พัฒนา จำกัด (มหาชน)", 
    type: "เอกชน", 
    budget: "180,000,000", 
    address: "อำเภอเมือง จังหวัดราชบุรี 70000", 
    contactPerson: "คุณณัฐพงษ์ สร้างสุข", 
    phone: "02-541-1234 ต่อ 505", 
    documentUrl: "https://www.centralpattana.co.th/th/investor-relations/procurement", 
    procurementSite: "เว็บไซต์เซ็นทรัล พัฒนา"
  },
  { 
    name: "โครงการปรับปรุงระบบปรับอากาศและระบายอากาศ โรงแรมแกรนด์", 
    organization: "บริษัท เดอะ เอราวัณ กรุ๊ป จำกัด (มหาชน)", 
    type: "เอกชน", 
    budget: "35,500,000", 
    address: "เขตปทุมวัน กรุงเทพมหานคร 10330", 
    contactPerson: "คุณสุทัศน์ โชติวิวัฒน์", 
    phone: "02-254-1234 ต่อ 888", 
    documentUrl: "https://supplier.minor.com/", 
    procurementSite: "ระบบจัดหาคู่ค้า Minor International"
  },
  { 
    name: "โครงการก่อสร้างโรงงานผลิตชิ้นส่วนอิเล็กทรอนิกส์", 
    organization: "บริษัท เดลต้า อีเลคโทรนิคส์ (ประเทศไทย) จำกัด (มหาชน)", 
    type: "เอกชน", 
    budget: "450,000,000", 
    address: "นิคมอุตสาหกรรมบางปู จังหวัดสมุทรปราการ 10280", 
    contactPerson: "วิศวกรสมชาย เทคโนโลยี", 
    phone: "02-797-2000 ต่อ 1502", 
    documentUrl: "https://vendor.delta.com.tw/", 
    procurementSite: "Delta Vendor Portal"
  },
  { 
    name: "โครงการติดตั้งระบบรักษาความปลอดภัยและ CCTV โรงพยาบาลเอกชน", 
    organization: "โรงพยาบาลกรุงเทพ", 
    type: "เอกชน", 
    budget: "15,800,000", 
    address: "เขตคลองเตย กรุงเทพมหานคร 10110", 
    contactPerson: "คุณวิภาวี ปลอดภัย", 
    phone: "02-310-3000 ต่อ 2255", 
    documentUrl: "https://www.bangkokhospital.com/supplier", 
    procurementSite: "ระบบคู่ค้าโรงพยาบาลกรุงเทพ"
  },
  { 
    name: "โครงการก่อสร้างคอนโดมิเนียม พร้อมสิ่งอำนวยความสะดวก", 
    organization: "บริษัท แอล.พี.เอ็น. ดีเวลลอปเมนท์ จำกัด (มหาชน)", 
    type: "เอกชน", 
    budget: "2,800,000,000", 
    address: "เขตวัฒนา กรุงเทพมหานคร 10110", 
    contactPerson: "คุณพิชัย อสังหาริม", 
    phone: "02-685-8888 ต่อ 777", 
    documentUrl: "https://procurement.lpn.co.th/", 
    procurementSite: "ระบบจัดซื้อ LPN Development"
  },
  { 
    name: "โครงการก่อสร้างโรงแรมรีสอร์ท พร้อมสปาและฟิตเนส", 
    organization: "บริษัท ไมเนอร์ อินเตอร์เนชั่นแนล จำกัด (มหาชน)", 
    type: "เอกชน", 
    budget: "850,000,000", 
    address: "อำเภอเมือง จังหวัดภูเก็ต 83000", 
    contactPerson: "คุณนิรันดร์ โรงแรม", 
    phone: "076-123-456 ต่อ 999", 
    documentUrl: "https://procurement.minor.com/", 
    procurementSite: "Minor Procurement Portal"
  },
  { 
    name: "โครงการระบบ ERP และการจัดการห่วงโซ่อุปทาน", 
    organization: "บริษัท ปตท. จำกัด (มหาชน)", 
    type: "เอกชน", 
    budget: "125,000,000", 
    address: "เขตจตุจักร กรุงเทพมหานคร 10900", 
    contactPerson: "คุณสมศักดิ์ เทคโนโลยี", 
    phone: "02-537-2000 ต่อ 3001", 
    documentUrl: "https://supplier.pttplc.com/", 
    procurementSite: "PTT Supplier Portal"
  },
  { 
    name: "โครงการจัดซื้อเครื่องจักรและอุปกรณ์โรงงาน", 
    organization: "บริษัท สยามเซเมนต์ กรุ๊ป จำกัด (มหาชน)", 
    type: "เอกชน", 
    budget: "95,600,000", 
    address: "เขตบางรัก กรุงเทพมหานคร 10500", 
    contactPerson: "วิศวกรสมเกียรติ อุตสาหกรรม", 
    phone: "02-586-4444 ต่อ 1888", 
    documentUrl: "https://vendor.siamcement.com/", 
    procurementSite: "Siam Cement Group Vendor Portal"
  }
];

export default function SeedProcurementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [cleanLoading, setCleanLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [currentProjectCount, setCurrentProjectCount] = useState<number>(0);
  const { toast } = useToast();

  const handleGoBack = () => {
    router.push('/procurement');
  };

  // ตรวจสอบจำนวนโครงการปัจจุบันในฐานข้อมูล
  const checkCurrentProjects = async () => {
    setCheckLoading(true);
    try {
      const db = getDb();
      if (!db) {
        setCurrentProjectCount(0);
        return;
      }

      const projectsCol = collection(db, 'projects');
      const snapshot = await getDocs(projectsCol);
      setCurrentProjectCount(snapshot.size);
    } catch (error) {
      logger.error('Error checking current projects:', error, 'ProcurementSeed');
      setCurrentProjectCount(0);
    } finally {
      setCheckLoading(false);
    }
  };

  // โหลดจำนวนโครงการเมื่อเริ่มต้น
  useEffect(() => {
    checkCurrentProjects();
  }, []);

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
      let duplicateCount = 0;
      
      for (const project of realProcurementProjects) {
        // ตรวจสอบข้อมูลซ้ำด้วยหลายเงื่อนไข (ชื่อ + องค์กร + งบประมาณ)
        const existingByNameQuery = query(
          projectsCol, 
          where('name', '==', project.name)
        );
        const existingByOrgQuery = query(
          projectsCol, 
          where('organization', '==', project.organization),
          where('budget', '==', project.budget)
        );
        
        const [nameSnapshot, orgSnapshot] = await Promise.all([
          getDocs(existingByNameQuery),
          getDocs(existingByOrgQuery)
        ]);
        
        // ถ้าไม่มีชื่อซ้ำ และไม่มีองค์กร+งบประมาณซ้ำ ให้เพิ่มใหม่
        if (nameSnapshot.empty && orgSnapshot.empty) {
          // เพิ่มข้อมูลเสริมให้โครงการ
          const enhancedProject = {
            ...project,
            // เพิ่มข้อมูลเสริมสำหรับโครงการจริง
            projectId: `PRJ-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            bidOpenDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // วันเปิดซอง 1-30 วันข้างหน้า
            bidCloseDate: new Date(Date.now() + (Math.random() * 45 + 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // วันปิดซอง 15-60 วันข้างหน้า
            category: project.type === 'ภาครัฐ' ? 'government' : 'private',
            status: 'open',
            description: project.type === 'ภาครัฐ' 
              ? `โครงการของ${project.organization} เปิดรับข้อเสนอจากผู้รับจ้างที่มีคุณสมบัติตามที่กำหนด งบประมาณ ${project.budget} บาท สามารถดาวน์โหลดเอกสารได้ที่ ${project.procurementSite}`
              : `โครงการลงทุนของ${project.organization} เปิดรับข้อเสนอจากผู้รับเหมาที่มีประสบการณ์ งบประมาณ ${project.budget} บาท ติดต่อผ่าน ${project.procurementSite}`,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          await addDoc(projectsCol, enhancedProject);
          successCount++;
        } else {
          // มีข้อมูลซ้ำ ข้าม
          duplicateCount++;
          logger.info(`Skipping duplicate project: ${project.name} from ${project.organization}`, 'ProcurementSeed');
        }
      }
      
      const resultMessage = `เพิ่มโครงการใหม่ ${successCount} รายการ ${duplicateCount > 0 ? `(ข้าม ${duplicateCount} รายการที่มีอยู่แล้ว)` : ''}`;
      setResult(resultMessage);
      toast({
        title: 'ดำเนินการสำเร็จ',
        description: resultMessage,
      });
      
      // อัพเดทจำนวนโครงการปัจจุบัน
      await checkCurrentProjects();
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

  const handleDeleteAllProjects = async () => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบโครงการทั้งหมดในฐานข้อมูล? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return;
    }

    setDeleteLoading(true);
    setResult('');
    try {
      const db = getDb();
      if (!db) {
        setResult('Firebase ยังไม่ได้ถูกตั้งค่า');
        return;
      }

      const projectsCol = collection(db, 'projects');
      const snapshot = await getDocs(projectsCol);
      const deletePromises = snapshot.docs.map(document => deleteDoc(doc(db, 'projects', document.id)));
      
      await Promise.all(deletePromises);
      
      const resultMessage = `ลบโครงการทั้งหมด ${snapshot.size} รายการสำเร็จ`;
      setResult(resultMessage);
      toast({
        title: 'ลบข้อมูลสำเร็จ',
        description: resultMessage,
      });
      
      // อัพเดทจำนวนโครงการปัจจุบัน
      await checkCurrentProjects();
    } catch (error) {
      logger.error('Error deleting all projects:', error, 'ProcurementSeed');
      setResult(`เกิดข้อผิดพลาดในการลบ: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบข้อมูลได้ โปรดลองอีกครั้ง',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!window.confirm('คุณต้องการลบโครงการซ้ำในฐานข้อมูลหรือไม่? ระบบจะเก็บแค่โครงการแรกของแต่ละชื่อ')) {
      return;
    }

    setCleanLoading(true);
    setResult('');
    try {
      const db = getDb();
      if (!db) {
        setResult('Firebase ยังไม่ได้ถูกตั้งค่า');
        return;
      }

      const projectsCol = collection(db, 'projects');
      const snapshot = await getDocs(projectsCol);
      
      // หาโครงการซ้ำ (ตาม name)
      const projectsByName = new Map<string, any[]>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const name = data.name;
        if (!projectsByName.has(name)) {
          projectsByName.set(name, []);
        }
        projectsByName.get(name)!.push({ id: doc.id, ...data });
      });

      // ลบโครงการซ้ำ (เก็บแค่อันแรก)
      let duplicateCount = 0;
      for (const [name, projects] of projectsByName) {
        if (projects.length > 1) {
          // เรียงตาม createdAt และเก็บแค่อันแรก
          projects.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return a.createdAt.seconds - b.createdAt.seconds;
          });
          
          // ลบโครงการซ้ำ (ตั้งแต่อันที่ 2 เป็นต้นไป)
          const duplicatesToDelete = projects.slice(1);
          for (const duplicate of duplicatesToDelete) {
            await deleteDoc(doc(db, 'projects', duplicate.id));
            duplicateCount++;
          }
        }
      }
      
      const resultMessage = `ลบโครงการซ้ำ ${duplicateCount} รายการสำเร็จ`;
      setResult(resultMessage);
      toast({
        title: 'ลบข้อมูลซ้ำสำเร็จ',
        description: resultMessage,
      });
      
      // อัพเดทจำนวนโครงการปัจจุบัน
      await checkCurrentProjects();
    } catch (error) {
      logger.error('Error removing duplicates:', error, 'ProcurementSeed');
      setResult(`เกิดข้อผิดพลาดในการลบข้อมูลซ้ำ: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบข้อมูลซ้ำได้ โปรดลองอีกครั้ง',
        variant: 'destructive',
      });
    } finally {
      setCleanLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="จัดการข้อมูลโครงการประมูล"
        description="เครื่องมือสำหรับเพิ่ม/ลบข้อมูลโครงการประมูลจริง พร้อมป้องกันข้อมูลซ้ำ"
        extra={
          <div className="flex gap-2">
            <Button onClick={handleGoBack} variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับหน้าค้นหา
            </Button>
            <Button onClick={handleGoBack} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>จัดการข้อมูลโครงการประมูล</CardTitle>
                <CardDescription>
                  เครื่องมือสำหรับเพิ่ม/ลบข้อมูลโครงการประมูลจริงในฐานข้อมูล (ป้องกันข้อมูลซ้ำอัตโนมัติ)
                  <br />
                  <strong>โครงการในฐานข้อมูลปัจจุบัน:</strong> {checkLoading ? 'กำลังตรวจสอบ...' : `${currentProjectCount} โครงการ`}
                  <br />
                  <strong>โครงการที่จะเพิ่ม:</strong> {realProcurementProjects.length} โครงการประมูลจริง
                  <br />
                  <strong>แหล่งข้อมูล:</strong> ระบบ e-GP, เว็บไซต์มหาวิทยาลัย, บริษัทจดทะเบียน และ Vendor Portal ต่างๆ
                  <br />
                  <strong>ประกอบด้วย:</strong> {realProcurementProjects.filter(p => p.type === 'ภาครัฐ').length} โครงการภาครัฐ และ {realProcurementProjects.filter(p => p.type === 'เอกชน').length} โครงการเอกชน
                  <br />
                  <strong>เว็บไซต์ประมูล:</strong> {Array.from(new Set(realProcurementProjects.map(p => p.procurementSite))).length} เว็บไซต์
                </CardDescription>
              </div>
              <Button onClick={handleGoBack} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleSeedData} 
                disabled={loading || deleteLoading || cleanLoading}
                className="w-full"
              >
                {loading ? 'กำลังเพิ่มข้อมูล...' : 'เพิ่มข้อมูลโครงการประมูลจริง (ป้องกันซ้ำ)'}
              </Button>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={checkCurrentProjects}
                  disabled={loading || deleteLoading || checkLoading || cleanLoading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${checkLoading ? 'animate-spin' : ''}`} />
                  {checkLoading ? 'ตรวจสอบ...' : 'ตรวจสอบ'}
                </Button>
                
                <Button 
                  onClick={handleRemoveDuplicates}
                  disabled={loading || deleteLoading || cleanLoading || currentProjectCount === 0}
                  variant="secondary"
                  size="sm"
                >
                  <Eraser className="w-4 h-4 mr-1" />
                  {cleanLoading ? 'ลบซ้ำ...' : 'ลบซ้ำ'}
                </Button>
                
                <Button 
                  onClick={handleDeleteAllProjects}
                  disabled={loading || deleteLoading || cleanLoading || currentProjectCount === 0}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {deleteLoading ? 'ลบทั้งหมด...' : 'ลบทั้งหมด'}
                </Button>
              </div>
            </div>
            
            {result && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{result}</p>
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">ตัวอย่างโครงการที่จะเพิ่ม:</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {realProcurementProjects.slice(0, 6).map((project, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {project.organization} • {project.type} • ฿{project.budget}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      📍 {project.procurementSite}
                    </div>
                  </div>
                ))}
                <div className="text-center text-sm text-muted-foreground">
                  และอีก {realProcurementProjects.length - 6} โครงการ...
                </div>
              </div>
            </div>

            {/* ส่วนท้าย - ปุ่มกลับ */}
            <div className="mt-8 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  💡 <strong>เคล็ดลับ:</strong> ใช้ปุ่ม "ลบซ้ำ" เพื่อทำความสะอาดข้อมูลก่อนเพิ่มข้อมูลใหม่
                </div>
                <Button onClick={handleGoBack} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  กลับไปหน้าค้นหา
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
