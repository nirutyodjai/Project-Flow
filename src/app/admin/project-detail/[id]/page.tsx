'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProject } from '@/services/firestore';
import { getAdminProject } from '@/services/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, CalendarClock, Edit2, LucideCheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projectData = await getAdminProject(params.id);
        setProject(projectData);
      } catch (error) {
        console.error('Failed to fetch project:', error);
        setError('ไม่สามารถโหลดข้อมูลโครงการได้');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [params.id]);
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'เสร็จสิ้น': 
        return 'bg-green-900/30 text-green-200';
      case 'มีปัญหา':
        return 'bg-red-900/30 text-red-200';
      case 'กำลังดำเนินการ':
        return 'bg-blue-900/30 text-blue-200';
      default:
        return 'bg-yellow-900/30 text-yellow-200';
    }
  };
  
  const getProgressBarClass = (status: string) => {
    switch(status) {
      case 'เสร็จสิ้น': 
        return 'bg-green-500';
      case 'มีปัญหา':
        return 'bg-red-500';
      default:
        return 'bg-primary';
    }
  };
  
  if (loading) {
    return (
      <div className="container p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <Skeleton className="h-8 w-2/3 mb-2" />
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>สถานะ</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-2/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>วันที่</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !project) {
    return (
      <div className="container p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-destructive mb-2">เกิดข้อผิดพลาด</div>
            <p>{error || 'ไม่พบข้อมูลโครงการ'}</p>
            <Button className="mt-4" onClick={() => router.push('/admin')}>
              กลับไปยังหน้าแผงควบคุม
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
          <h1 className="text-2xl font-bold">รายละเอียดโครงการ</h1>
        </div>
        <Button onClick={() => router.push(`/admin/project-edit/${params.id}`)}>
          <Edit2 className="mr-2 h-4 w-4" />
          แก้ไขโครงการ
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <div>
                <CardTitle className="text-2xl">{project.name}</CardTitle>
                <p className="text-muted-foreground mt-1">รหัสโครงการ: {params.id}</p>
              </div>
              <Badge variant="outline" className={getStatusBadgeClass(project.status)}>
                {project.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">รายละเอียด</h3>
              <p className="text-muted-foreground whitespace-pre-line">{project.desc}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">ความคืบหน้า</h3>
              <div className="flex items-center space-x-4">
                <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${getProgressBarClass(project.status)} progress-bar-width-${Math.min(Math.max(Math.round(project.progress / 5) * 5, 0), 100)}`}
                  />
                </div>
                <span className="font-semibold">{project.progress}%</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-medium mb-2">สถานะขั้นตอนโครงการ</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <LucideCheckCircle2 className={`h-5 w-5 ${project.progress >= 25 ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={project.progress >= 25 ? 'font-medium' : 'text-muted-foreground'}>เริ่มโครงการ</span>
                </div>
                <div className="flex items-center gap-2">
                  <LucideCheckCircle2 className={`h-5 w-5 ${project.progress >= 50 ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={project.progress >= 50 ? 'font-medium' : 'text-muted-foreground'}>ดำเนินการ</span>
                </div>
                <div className="flex items-center gap-2">
                  <LucideCheckCircle2 className={`h-5 w-5 ${project.progress >= 75 ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={project.progress >= 75 ? 'font-medium' : 'text-muted-foreground'}>ตรวจสอบคุณภาพ</span>
                </div>
                <div className="flex items-center gap-2">
                  <LucideCheckCircle2 className={`h-5 w-5 ${project.progress === 100 ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={project.progress === 100 ? 'font-medium' : 'text-muted-foreground'}>เสร็จสิ้น</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>สถานะ</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${getStatusBadgeClass(project.status)} mb-4`}>{project.status}</Badge>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">ความคืบหน้า</p>
                <p className="text-xl font-bold">{project.progress}%</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>วันที่</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">กำหนดส่ง</p>
                  <p className="font-medium">{project.dueDate || 'ไม่ระบุ'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">อัพเดทล่าสุด</p>
                  <p className="font-medium">
                    {project.updatedAt ? format(new Date(project.updatedAt), 'dd MMM yyyy, HH:mm') : 'ไม่ระบุ'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
