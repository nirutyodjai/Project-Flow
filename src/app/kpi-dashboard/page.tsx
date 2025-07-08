'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import {
  AlertCircle,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  HelpCircle,
  InfoIcon,
  Loader2,
  Share2,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { listAdminProjects, listTasks } from '@/services/firestore';
import { AdminProject, Task } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, differenceInDays } from 'date-fns';
import { th } from 'date-fns/locale';
import './kpi-dashboard.css';

// ฟังก์ชั่นสำหรับแปลงฟอร์แมตวันที่
function formatDate(dateString: string) {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: th });
  } catch (e) {
    return dateString;
  }
}

// ฟังก์ชั่นสำหรับหาจำนวนวันที่เหลือก่อนถึงวันที่กำหนด
function getDaysRemaining(dueDate: string): number {
  if (!dueDate) return 0;
  try {
    const today = new Date();
    const due = new Date(dueDate);
    return differenceInDays(due, today);
  } catch (e) {
    return 0;
  }
}

export default function KPIDashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // โหลดข้อมูลโปรเจคและงานจาก Firestore
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const projectData = await listAdminProjects();
        const taskData = await listTasks();
        
        if (projectData) {
          setProjects(projectData);
        }
        
        if (taskData) {
          setTasks(taskData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // คำนวณข้อมูลสำหรับแสดงบน Dashboard
  const dashboardStats = useMemo(() => {
    // จำนวนโปรเจคตามสถานะ
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // จำนวนงานตามความสำคัญ
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // โปรเจคที่ใกล้ถึงกำหนด (5 วันหรือน้อยกว่า)
    const upcomingDeadlines = projects
      .filter(p => getDaysRemaining(p.dueDate) >= 0 && getDaysRemaining(p.dueDate) <= 5)
      .sort((a, b) => getDaysRemaining(a.dueDate) - getDaysRemaining(b.dueDate));

    // จำนวนงานที่เสร็จสมบูรณ์
    const completedTasks = tasks.filter(t => t.checked).length;
    const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    // ค่าเฉลี่ยความคืบหน้าของโปรเจค
    const avgProgress = projects.length > 0
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
      : 0;

    return {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedTasks,
      completionRate,
      avgProgress,
      statusCounts,
      priorityCounts,
      upcomingDeadlines
    };
  }, [projects, tasks]);

  // สร้างข้อมูลกราฟ
  const projectStatusData = useMemo(() => [
    { name: 'เสร็จสิ้น', value: dashboardStats.statusCounts['เสร็จสิ้น'] || 0, fill: '#10b981' },
    { name: 'กำลังดำเนินการ', value: dashboardStats.statusCounts['กำลังดำเนินการ'] || 0, fill: '#3b82f6' },
    { name: 'รอดำเนินการ', value: dashboardStats.statusCounts['รอดำเนินการ'] || 0, fill: '#f59e0b' },
    { name: 'มีปัญหา', value: dashboardStats.statusCounts['มีปัญหา'] || 0, fill: '#ef4444' },
  ], [dashboardStats.statusCounts]);

  const taskPriorityData = useMemo(() => [
    { name: 'สูง', value: dashboardStats.priorityCounts['สูง'] || 0, fill: '#ef4444' },
    { name: 'ปานกลาง', value: dashboardStats.priorityCounts['ปานกลาง'] || 0, fill: '#f59e0b' },
    { name: 'ต่ำ', value: dashboardStats.priorityCounts['ต่ำ'] || 0, fill: '#3b82f6' },
  ], [dashboardStats.priorityCounts]);

  // สร้างข้อมูลกราฟแนวโน้มตามเวลา (ตัวอย่าง - ข้อมูลสมมติ)
  const weeklyProgressData = [
    { week: 'สัปดาห์ 1', progress: 15 },
    { week: 'สัปดาห์ 2', progress: 28 },
    { week: 'สัปดาห์ 3', progress: 42 },
    { week: 'สัปดาห์ 4', progress: 60 },
    { week: 'สัปดาห์ 5', progress: 78 },
    { week: 'สัปดาห์ 6', progress: 95 },
  ];

  const monthlyCompletionData = [
    { month: 'ม.ค.', completed: 12, target: 15 },
    { month: 'ก.พ.', completed: 14, target: 15 },
    { month: 'มี.ค.', completed: 16, target: 15 },
    { month: 'เม.ย.', completed: 14, target: 15 },
    { month: 'พ.ค.', completed: 18, target: 15 },
    { month: 'มิ.ย.', completed: 17, target: 15 },
    { month: 'ก.ค.', completed: 19, target: 15 },
    { month: 'ส.ค.', completed: 21, target: 20 },
    { month: 'ก.ย.', completed: 22, target: 20 },
  ];

  // ฟังก์ชันสำหรับสร้าง CSV และดาวน์โหลด
  const exportToCSV = () => {
    // สร้างข้อมูล CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // ส่วนหัวของไฟล์ CSV
    csvContent += "ชื่อโปรเจค,คำอธิบาย,สถานะ,ความคืบหน้า(%),วันที่กำหนด\n";
    
    // เพิ่มข้อมูลของแต่ละโปรเจค
    projects.forEach(project => {
      csvContent += `"${project.name}","${project.desc}","${project.status}",${project.progress},"${project.dueDate}"\n`;
    });
    
    // สร้าง URI encoded สำหรับดาวน์โหลด
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kpi-dashboard-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // แชร์ Dashboard
  const shareDashboard = () => {
    if (navigator.share) {
      navigator.share({
        title: 'KPI Dashboard - ProjectFlow',
        text: `รายงานสถานะโครงการ ณ วันที่ ${format(new Date(), 'dd/MM/yyyy')}`,
        url: window.location.href
      })
      .then(() => console.log('Shared successfully'))
      .catch(error => console.log('Error sharing:', error));
    } else {
      // Fallback สำหรับเบราว์เซอร์ที่ไม่รองรับ Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "คัดลอกลิงก์แล้ว",
        description: "ลิงก์ได้ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-xl">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <PageHeader 
        title="KPI Dashboard" 
        description="ดูภาพรวมและตัวชี้วัดประสิทธิภาพการทำงานทั้งหมด"
        className="kpi-header" 
      />
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          <span>ส่งออก CSV</span>
        </Button>
        <Button variant="outline" size="sm" onClick={shareDashboard}>
          <Share2 className="w-4 h-4 mr-2" />
          <span>แชร์</span>
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="kpi-tabs">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="projects">โปรเจค</TabsTrigger>
          <TabsTrigger value="tasks">งานทั้งหมด</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* ตัวชี้วัดหลัก */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">โปรเจคทั้งหมด</CardTitle>
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  +4 โปรเจคใหม่ในเดือนนี้
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ความคืบหน้าเฉลี่ย</CardTitle>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.avgProgress.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  เพิ่มขึ้น 5% จากเดือนที่แล้ว
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">อัตราเสร็จสมบูรณ์</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.completionRate.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-500 inline-flex items-center">
                    <ArrowUpIcon className="w-3 h-3 mr-1" />7%
                  </span>{" "}
                  จากไตรมาสที่แล้ว
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">งานที่ต้องทำ</CardTitle>
                <Clock className="w-4 h-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalTasks - dashboardStats.completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.completedTasks} งานเสร็จสมบูรณ์แล้ว
                </p>
              </CardContent>
            </Card>
          </div>

          {/* กราฟและวิชวลไลเซชั่นหลัก */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* กราฟสถานะโปรเจค */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>สถานะโปรเจค</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* กราฟความคืบหน้าตามสัปดาห์ */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>ความคืบหน้าเฉลี่ยตามสัปดาห์</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyProgressData}>
                      <defs>
                        <linearGradient id="progressColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="week" />
                      <YAxis unit="%" />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area type="monotone" dataKey="progress" stroke="#3b82f6" fillOpacity={1} fill="url(#progressColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* โปรเจคที่ใกล้ถึงกำหนด */}
          <Card>
            <CardHeader>
              <CardTitle>โปรเจคที่ใกล้ถึงกำหนด</CardTitle>
              <CardDescription>โปรเจคที่ต้องเร่งดำเนินการให้เสร็จสมบูรณ์</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats.upcomingDeadlines.length > 0 ? (
                  dashboardStats.upcomingDeadlines.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex-1">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          กำหนดส่ง: {formatDate(project.dueDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getDaysRemaining(project.dueDate) <= 2 ? 'text-red-500' : 'text-amber-500'}`}>
                          {getDaysRemaining(project.dueDate)} วัน
                        </p>
                        <p className="text-sm">{project.progress}% เสร็จสิ้น</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
                    <Calendar className="w-10 h-10 mb-2" />
                    <p>ไม่มีโปรเจคที่ใกล้ถึงกำหนด</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4 mt-4">
          {/* กราฟเปรียบเทียบผลงานรายเดือน */}
          <Card>
            <CardHeader>
              <CardTitle>การเสร็จสิ้นโปรเจครายเดือน เทียบกับเป้าหมาย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="โปรเจคที่เสร็จสิ้น" dataKey="completed" fill="#3b82f6" />
                    <Bar name="เป้าหมาย" dataKey="target" fill="#94a3b8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* ตารางโปรเจคล่าสุด */}
          <Card>
            <CardHeader>
              <CardTitle>โปรเจคทั้งหมด</CardTitle>
              <CardDescription>แสดงสถานะและความคืบหน้าล่าสุดของโปรเจคทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                  <HelpCircle className="w-10 h-10 mb-2" />
                  <p>ไม่พบข้อมูลโปรเจค</p>
                  <p className="text-sm">ข้อมูลอาจยังไม่ถูกเพิ่มเข้าระบบ</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">ชื่อโปรเจค</th>
                        <th className="py-2 text-left font-medium">สถานะ</th>
                        <th className="py-2 text-left font-medium">ความคืบหน้า</th>
                        <th className="py-2 text-left font-medium">วันที่กำหนด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(project => (
                        <tr key={project.id} className="border-b hover:bg-muted/50">
                          <td className="py-3">{project.name}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              project.status === 'เสร็จสิ้น' ? 'bg-emerald-100 text-emerald-800' :
                              project.status === 'กำลังดำเนินการ' ? 'bg-blue-100 text-blue-800' :
                              project.status === 'รอดำเนินการ' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center">
                              <div className="w-full bg-muted rounded-full h-2 mr-2 max-w-24">                                <div
                                  className={`h-2 rounded-full ${
                                    project.progress >= 66 ? 'bg-emerald-500' :
                                    project.progress >= 33 ? 'bg-amber-500' : 'bg-red-500'
                                  } kpi-progress-value`}
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="text-sm">{project.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3">{formatDate(project.dueDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4 mt-4">
          {/* กราฟความสำคัญของงาน */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>การกระจายตัวของงานตามความสำคัญ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskPriorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {taskPriorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>สถิติงานทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">ความคืบหน้าของงานทั้งหมด</p>
                      <p className="font-medium">{dashboardStats.completionRate.toFixed(0)}%</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">                        <div
                        className="bg-primary h-2 rounded-full kpi-progress-value"
                        style={{ width: `${dashboardStats.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-3">
                  <h4 className="text-sm font-medium mb-2">สรุปงาน</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-2 border rounded-md bg-muted/50">
                      <p className="text-2xl font-bold">{dashboardStats.totalTasks}</p>
                      <p className="text-xs">งานทั้งหมด</p>
                    </div>
                    <div className="flex flex-col items-center p-2 border rounded-md bg-muted/50">
                      <p className="text-2xl font-bold">{dashboardStats.completedTasks}</p>
                      <p className="text-xs">งานที่เสร็จสมบูรณ์</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* รายการงานทั้งหมด */}
          <Card>
            <CardHeader>
              <CardTitle>รายการงานทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                  <HelpCircle className="w-10 h-10 mb-2" />
                  <p>ไม่พบข้อมูลงาน</p>
                  <p className="text-sm">ข้อมูลอาจยังไม่ถูกเพิ่มเข้าระบบ</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-start p-3 border rounded-md">
                      <div className="flex-shrink-0 pt-0.5">
                        <input
                          type="checkbox"
                          checked={task.checked}
                          className="rounded border-muted task-checkbox"
                          disabled
                          aria-label={`Task: ${task.title}`}
                          title={`Task: ${task.title}`}
                        />
                      </div>
                      <div className="flex-grow ml-3">
                        <p className={`font-medium ${task.checked ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${task.priorityColor}`}>
                            {task.priority}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {task.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* ข้อความแจ้งเตือนเกี่ยวกับข้อมูล */}
      <div className="flex items-center p-4 border rounded-md bg-muted/30">
        <InfoIcon className="w-5 h-5 mr-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          ข้อมูลบางส่วนที่แสดงเป็นข้อมูลตัวอย่าง ข้อมูลจริงจะได้มาจากระบบฐานข้อมูลหลักเมื่อมีการใช้งานจริง
        </p>
      </div>
      
      <Button
        onClick={() => router.push('/admin')}
        className="mt-8"
        variant="outline"
      >
        <ArrowRightIcon className="w-4 h-4 mr-2" />
        ไปยังหน้าจัดการโปรเจค
      </Button>
    </div>
  );
}
