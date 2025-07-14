'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, RefreshCw, Database, TrendingUp, Users, FileText, CheckSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { 
  listProjects, 
  listContacts, 
  listAdminProjects, 
  listTasks,
  Project,
  Contact,
  AdminProject,
  Task 
} from '@/services/firestore';

interface DataSummary {
  projects: {
    total: number;
    byType: Record<string, number>;
    byStatus?: Record<string, number>;
  };
  contacts: {
    total: number;
    byType: Record<string, number>;
  };
  adminProjects: {
    total: number;
    byStatus: Record<string, number>;
    avgProgress: number;
  };
  tasks: {
    total: number;
    completed: number;
    byPriority: Record<string, number>;
  };
}

export default function FirebaseDataViewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDataSummary = async () => {
    try {
      setIsLoading(true);
      logger.info('Loading Firebase data summary...', undefined, 'DataView');

      // Load all data in parallel
      const [projects, contacts, adminProjects, tasks] = await Promise.all([
        listProjects({}),
        listContacts(),
        listAdminProjects(),
        listTasks()
      ]);

      // Analyze projects
      const projectsByType: Record<string, number> = {};
      (projects ?? []).forEach(project => {
        projectsByType[project.type ?? 'Unknown'] = (projectsByType[project.type ?? 'Unknown'] || 0) + 1;
      });

      // Analyze contacts
      const contactsByType: Record<string, number> = {};
      (contacts ?? []).forEach(contact => {
        contactsByType[contact.type ?? 'Unknown'] = (contactsByType[contact.type ?? 'Unknown'] || 0) + 1;
      });

      // Analyze admin projects
      const adminProjectsByStatus: Record<string, number> = {};
      let totalProgress = 0;
      (adminProjects ?? []).forEach(project => {
        adminProjectsByStatus[project.status] = (adminProjectsByStatus[project.status] || 0) + 1;
        totalProgress += project.progress;
      });
      const avgProgress = (adminProjects ?? []).length > 0 ? totalProgress / (adminProjects ?? []).length : 0;

      // Analyze tasks
      const tasksByPriority: Record<string, number> = {};
      let completedTasks = 0;
      (tasks ?? []).forEach(task => {
        tasksByPriority[task.priority] = (tasksByPriority[task.priority] || 0) + 1;
        if (task.checked) completedTasks++;
      });

      const summary: DataSummary = {
        projects: {
          total: (projects ?? []).length,
          byType: projectsByType,
        },
        contacts: {
          total: (contacts ?? []).length,
          byType: contactsByType,
        },
        adminProjects: {
          total: (adminProjects ?? []).length,
          byStatus: adminProjectsByStatus,
          avgProgress,
        },
        tasks: {
          total: (tasks ?? []).length,
          completed: completedTasks,
          byPriority: tasksByPriority,
        },
      };

      setDataSummary(summary);
      setLastUpdated(new Date());

      logger.info('Data summary loaded successfully', summary, 'DataView');
      
      toast({
        title: "โหลดข้อมูลสำเร็จ",
        description: `อัพเดทข้อมูลล่าสุด: ${new Date().toLocaleTimeString('th-TH')}`,
        variant: "default",
      });

    } catch (error) {
      logger.error('Error loading data summary:', error, 'DataView');
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDataSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">กำลังโหลดข้อมูล Firebase...</span>
        </div>
      </div>
    );
  }

  if (!dataSummary) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center py-20">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">ไม่พบข้อมูล</p>
            <Button onClick={loadDataSummary} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              โหลดข้อมูลใหม่
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            ข้อมูล Firebase
          </h1>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              อัพเดทล่าสุด: {lastUpdated.toLocaleString('th-TH')}
            </p>
          )}
        </div>
        <Button onClick={loadDataSummary} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          รีเฟรช
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              โครงการ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{dataSummary.projects.total}</div>
            <div className="text-sm text-muted-foreground">รายการทั้งหมด</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              ผู้ติดต่อ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{dataSummary.contacts.total}</div>
            <div className="text-sm text-muted-foreground">รายการทั้งหมด</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              โครงการ Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{dataSummary.adminProjects.total}</div>
            <div className="text-sm text-muted-foreground">
              ความคืบหน้าเฉลี่ย {Math.round(dataSummary.adminProjects.avgProgress)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-orange-600" />
              งาน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{dataSummary.tasks.total}</div>
            <div className="text-sm text-muted-foreground">
              เสร็จแล้ว {dataSummary.tasks.completed} งาน
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Projects Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>วิเคราะห์โครงการ</CardTitle>
            <CardDescription>แยกตามประเภทโครงการ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(dataSummary.projects.byType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm">{type}</span>
                <Badge variant="outline">{count} โครงการ</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contacts Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>วิเคราะห์ผู้ติดต่อ</CardTitle>
            <CardDescription>แยกตามประเภทผู้ติดต่อ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(dataSummary.contacts.byType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm">{type}</span>
                <Badge variant="outline">{count} รายการ</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Admin Projects Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>สถานะโครงการ Admin</CardTitle>
            <CardDescription>แยกตามสถานะ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(dataSummary.adminProjects.byStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm">{status}</span>
                <Badge 
                  variant={status === 'เสร็จแล้ว' ? 'default' : 'secondary'}
                >
                  {count} โครงการ
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tasks Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>ความสำคัญของงาน</CardTitle>
            <CardDescription>แยกตามระดับความสำคัญ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(dataSummary.tasks.byPriority ?? {}).map(([priority, count]) => (
              <div key={priority} className="flex justify-between items-center">
                <span className="text-sm">{priority}</span>
                <Badge 
                  variant={priority === 'สูง' ? 'destructive' : priority === 'ปานกลาง' ? 'default' : 'secondary'}
                >
                  {count} งาน
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>การดำเนินการ</CardTitle>
          <CardDescription>ตัวเลือกการจัดการข้อมูล</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <Button 
            onClick={() => window.location.href = '/admin'}
            variant="outline"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            ไปที่ Admin Dashboard
          </Button>
          <Button 
            onClick={() => window.location.href = '/admin/data-management'}
            variant="outline"
          >
            <Database className="h-4 w-4 mr-2" />
            จัดการข้อมูล
          </Button>
          <Button 
            onClick={() => window.location.href = '/contacts'}
            variant="outline"
          >
            <Users className="h-4 w-4 mr-2" />
            ดูรายการผู้ติดต่อ
          </Button>
          <Button 
            onClick={() => window.location.href = '/project-analysis'}
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-2" />
            วิเคราะห์โครงการ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
