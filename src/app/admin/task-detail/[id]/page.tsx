'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/services/firestore';
import { getTask, updateTask } from '@/services/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, CalendarClock, Edit2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const taskData = await getTask(params.id);
        setTask(taskData);
      } catch (error) {
        console.error('Failed to fetch task:', error);
        setError('ไม่สามารถโหลดข้อมูลงานได้');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [params.id]);
  
  const handleToggleTaskComplete = async () => {
    if (!task) return;
    
    try {
      setIsUpdating(true);
      
      const updatedTask = { ...task, checked: !task.checked };
      
      // If task is now checked, change priority to "เสร็จสิ้น"
      if (updatedTask.checked) {
        updatedTask.priority = "เสร็จสิ้น";
        updatedTask.priorityColor = "bg-green-900/30 text-green-200";
      }
      
      await updateTask(task.id, {
        checked: updatedTask.checked,
        priority: updatedTask.priority,
        priorityColor: updatedTask.priorityColor
      });
      
      setTask(updatedTask);
      
      toast({
        title: 'สถานะงานอัพเดทแล้ว',
        description: updatedTask.checked ? 'ทำเครื่องหมายงานเป็นเสร็จสิ้นแล้ว' : 'ทำเครื่องหมายงานเป็นยังไม่เสร็จสิ้นแล้ว'
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
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
                <Skeleton className="h-10 w-full" />
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
  
  if (error || !task) {
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
            <p>{error || 'ไม่พบข้อมูลงาน'}</p>
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
          <h1 className="text-2xl font-bold">รายละเอียดงาน</h1>
        </div>
        <Button onClick={() => router.push(`/admin/task-edit/${params.id}`)}>
          <Edit2 className="mr-2 h-4 w-4" />
          แก้ไขงาน
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <div>
                <CardTitle className={`text-2xl ${task.checked ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </CardTitle>
                <p className="text-muted-foreground mt-1">รหัสงาน: {params.id}</p>
              </div>
              <Badge variant="outline" className={task.priorityColor}>
                {task.priority}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-medium mb-4">สถานะ</h3>
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="task-status" 
                  checked={task.checked} 
                  onCheckedChange={handleToggleTaskComplete} 
                  disabled={isUpdating}
                />
                <label 
                  htmlFor="task-status" 
                  className={`text-lg cursor-pointer ${task.checked ? 'line-through text-muted-foreground' : ''}`}
                >
                  {task.checked ? 'งานเสร็จสิ้นแล้ว' : 'ยังไม่เสร็จ'}
                </label>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-medium mb-2">ข้อมูลเพิ่มเติม</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-24">กำหนดส่ง:</span>
                  <span className="font-medium">{task.time || 'ไม่ระบุ'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-24">ความสำคัญ:</span>
                  <Badge variant="outline" className={task.priorityColor}>
                    {task.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-24">สร้างเมื่อ:</span>
                  <span>
                    {task.createdAt ? format(new Date(task.createdAt), 'dd MMM yyyy, HH:mm') : 'ไม่ระบุ'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-24">อัพเดทล่าสุด:</span>
                  <span>
                    {task.updatedAt ? format(new Date(task.updatedAt), 'dd MMM yyyy, HH:mm') : 'ไม่ระบุ'}
                  </span>
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
              <Badge variant="outline" className={task.priorityColor}>
                {task.priority}
              </Badge>
              
              <div className="mt-6">
                <Button
                  className="w-full"
                  variant={task.checked ? "outline" : "default"}
                  onClick={handleToggleTaskComplete}
                  disabled={isUpdating}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {isUpdating ? 'กำลังอัพเดท...' : (task.checked ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จสิ้น')}
                </Button>
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
                  <p className="font-medium">{task.time || 'ไม่ระบุ'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">อัพเดทล่าสุด</p>
                  <p className="font-medium">
                    {task.updatedAt ? format(new Date(task.updatedAt), 'dd MMM yyyy, HH:mm') : 'ไม่ระบุ'}
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
