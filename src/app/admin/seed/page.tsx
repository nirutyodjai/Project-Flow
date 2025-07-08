'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getDb } from '@/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    setLoading(true);
    try {
      const db = getDb();
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      // Seed initial projects
      const projectsData = [
        {
          name: "เว็บไซต์บริษัท ABC",
          desc: "เว็บไซต์องค์กร",
          status: "เสร็จสิ้น",
          progress: 100,
          dueDate: "15 ก.ย. 2023",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: "แอปพลิเคชันมือถือ",
          desc: "แอปสำหรับลูกค้า",
          status: "กำลังดำเนินการ",
          progress: 75,
          dueDate: "30 ก.ย. 2023",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: "ระบบ CRM",
          desc: "ระบบจัดการลูกค้า",
          status: "รอดำเนินการ",
          progress: 30,
          dueDate: "15 ต.ค. 2023",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: "ระบบจัดการโรงแรม",
          desc: "ระบบจองห้องพัก",
          status: "มีปัญหา",
          progress: 60,
          dueDate: "5 ต.ค. 2023",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          name: "ระบบจัดการคลังสินค้า",
          desc: "ระบบติดตามสินค้า",
          status: "กำลังดำเนินการ",
          progress: 10,
          dueDate: "30 พ.ย. 2023",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      // Seed initial tasks
      const tasksData = [
        {
          title: "ประชุมทีมพัฒนาโปรเจค ABC",
          priority: "สูง",
          priorityColor: "bg-red-900/30 text-red-200",
          time: "วันนี้ 14:00",
          checked: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          title: "ส่งรายงานความคืบหน้าประจำเดือน",
          priority: "ปานกลาง",
          priorityColor: "bg-yellow-900/30 text-yellow-200",
          time: "พรุ่งนี้ 17:00",
          checked: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          title: "ตรวจสอบข้อผิดพลาดในระบบ C",
          priority: "เสร็จสิ้น",
          priorityColor: "bg-green-900/30 text-green-200",
          time: "เสร็จเมื่อ 2 ชั่วโมงที่แล้ว",
          checked: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          title: "เตรียมเอกสารสำหรับการประมูลโครงการใหม่",
          priority: "ต่ำ",
          priorityColor: "bg-blue-900/30 text-blue-200",
          time: "30 ต.ค. 2023",
          checked: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      // Add projects to Firestore
      const projectPromises = projectsData.map(project => 
        addDoc(collection(db, 'adminProjects'), project)
      );
      await Promise.all(projectPromises);

      // Add tasks to Firestore
      const taskPromises = tasksData.map(task => 
        addDoc(collection(db, 'tasks'), task)
      );
      await Promise.all(taskPromises);

      toast({
        title: 'Success',
        description: 'Database seeded with initial data successfully!',
      });
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        title: 'Error',
        description: 'Failed to seed database. See console for details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Initialize Firestore Database</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This utility will seed your Firestore database with initial data for testing the admin page.</p>
          <p className="mt-2 text-orange-500">Note: Use this only for development and testing purposes.</p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSeedDatabase} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Seeding Database...
              </>
            ) : (
              'Seed Database'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
