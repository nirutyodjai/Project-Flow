'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { Calendar, Clock, Download, FileSpreadsheet, Filter, Loader2, Share2, TrendingUp } from 'lucide-react';
import { AdminProject, Task } from '@/services/firestore';
import { listAdminProjects, listTasks } from '@/services/firestore';
import { format, subDays, isBefore, isAfter, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ReportsPage() {
  const router = useRouter();
  
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Load projects and tasks in parallel
        const [projectList, taskList] = await Promise.all([
          listAdminProjects(),
          listTasks(),
        ]);
        
        setProjects(projectList);
        setTasks(taskList);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on selected timeframe
  const filteredData = useMemo(() => {
    if (timeframe === 'all') {
      return { projects, tasks };
    }

    const dateThreshold = subDays(new Date(), 
      timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    );

    const filteredProjects = projects.filter(project => {
      if (!project.createdAt) return false;
      return isAfter(project.createdAt.toDate(), dateThreshold);
    });

    const filteredTasks = tasks.filter(task => {
      if (!task.createdAt) return false;
      return isAfter(task.createdAt.toDate(), dateThreshold);
    });

    return { projects: filteredProjects, tasks: filteredTasks };
  }, [projects, tasks, timeframe]);

  // Calculate statistics
  const stats = useMemo(() => {
    const { projects, tasks } = filteredData;
    
    // Project statistics
    const completedProjects = projects.filter(p => p.status === 'เสร็จสิ้น').length;
    const inProgressProjects = projects.filter(p => p.status === 'กำลังดำเนินการ').length;
    const pendingProjects = projects.filter(p => p.status === 'รอดำเนินการ').length;
    const issueProjects = projects.filter(p => p.status === 'มีปัญหา').length;
    
    const totalProjects = projects.length;
    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
    const averageProgress = totalProjects > 0 
      ? projects.reduce((sum, project) => sum + project.progress, 0) / totalProjects
      : 0;

    // Task statistics
    const completedTasks = tasks.filter(t => t.checked).length;
    const pendingTasks = tasks.filter(t => !t.checked).length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'สูง' && !t.checked).length;
    const mediumPriorityTasks = tasks.filter(t => t.priority === 'ปานกลาง' && !t.checked).length;
    const lowPriorityTasks = tasks.filter(t => t.priority === 'ต่ำ' && !t.checked).length;
    
    const totalTasks = tasks.length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalProjects,
      completedProjects,
      inProgressProjects,
      pendingProjects,
      issueProjects,
      completionRate,
      averageProgress,
      
      totalTasks,
      completedTasks,
      pendingTasks,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      taskCompletionRate,
    };
  }, [filteredData]);

  // Prepare chart data
  const projectStatusData = useMemo(() => [
    { name: 'เสร็จสิ้น', value: stats.completedProjects },
    { name: 'กำลังดำเนินการ', value: stats.inProgressProjects },
    { name: 'รอดำเนินการ', value: stats.pendingProjects },
    { name: 'มีปัญหา', value: stats.issueProjects },
  ], [stats]);

  const taskPriorityData = useMemo(() => [
    { name: 'ความสำคัญสูง', value: stats.highPriorityTasks },
    { name: 'ความสำคัญกลาง', value: stats.mediumPriorityTasks },
    { name: 'ความสำคัญต่ำ', value: stats.lowPriorityTasks },
    { name: 'เสร็จสิ้น', value: stats.completedTasks },
  ], [stats]);

  // Generate monthly progress data
  const monthlyProgressData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subDays(new Date(), i * 30);
      return format(date, 'MMM yy', { locale: th });
    }).reverse();

    return last6Months.map(month => {
      // Simulate some progress data
      // In a real app, you'd calculate this from actual project data
      const completedValue = Math.floor(Math.random() * 40) + 10;
      const inProgressValue = Math.floor(Math.random() * 30) + 15;
      const pendingValue = Math.floor(Math.random() * 20) + 5;
      
      return {
        name: month,
        เสร็จสิ้น: completedValue,
        'กำลังดำเนินการ': inProgressValue,
        'รอดำเนินการ': pendingValue,
      };
    });
  }, []);

  // Top performing projects
  const topProjects = useMemo(() => {
    return [...projects]
      .filter(p => p.progress > 0)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  }, [projects]);
  
  // Recent tasks
  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        if (!a.updatedAt || !b.updatedAt) return 0;
        return b.updatedAt.seconds - a.updatedAt.seconds;
      })
      .slice(0, 5);
  }, [tasks]);

  // Calculate performance indicators for insights
  const performanceInsights = useMemo(() => {
    const insight1 = stats.completionRate > 70 ? 'ดีเยี่ยม' : stats.completionRate > 50 ? 'ดี' : 'ต้องปรับปรุง';
    const insight2 = stats.highPriorityTasks > 5 ? 'สูง' : 'ต่ำ';
    const insight3 = stats.averageProgress > 75 ? 'สูง' : stats.averageProgress > 50 ? 'ปานกลาง' : 'ต่ำ';

    return {
      completionInsight: insight1,
      riskInsight: insight2,
      progressInsight: insight3
    };
  }, [stats]);

  // Function to export report as CSV
  const handleExportReport = () => {
    // Create CSV content
    const headers = "รายงานสรุปโครงการ, วันที่: " + format(new Date(), 'dd MMM yyyy') + "\n\n";
    const projectStats = `โครงการทั้งหมด, ${stats.totalProjects}\nโครงการเสร็จสิ้น, ${stats.completedProjects}\nโครงการกำลังดำเนินการ, ${stats.inProgressProjects}\nโครงการรอดำเนินการ, ${stats.pendingProjects}\nโครงการมีปัญหา, ${stats.issueProjects}\nอัตราความสำเร็จ, ${stats.completionRate.toFixed(2)}%\nความคืบหน้าเฉลี่ย, ${stats.averageProgress.toFixed(2)}%\n\n`;
    const taskStats = `งานทั้งหมด, ${stats.totalTasks}\nงานเสร็จสิ้น, ${stats.completedTasks}\nงานยังไม่เสร็จสิ้น, ${stats.pendingTasks}\nงานความสำคัญสูง, ${stats.highPriorityTasks}\nงานความสำคัญกลาง, ${stats.mediumPriorityTasks}\nงานความสำคัญต่ำ, ${stats.lowPriorityTasks}\nอัตราความสำเร็จของงาน, ${stats.taskCompletionRate.toFixed(2)}%\n\n`;
    
    const projectsHeader = "รหัสโครงการ, ชื่อโครงการ, สถานะ, ความคืบหน้า, กำหนดส่ง\n";
    const projectsData = projects.map(project => 
      `${project.id},"${project.name}","${project.status}",${project.progress},"${project.dueDate}"`
    ).join('\n');
    
    const csvContent = headers + projectStats + taskStats + projectsHeader + projectsData;
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `project-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">รายงานและการวิเคราะห์</h1>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            ส่งออกรายงาน
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            แชร์
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="projects">โครงการ</TabsTrigger>
            <TabsTrigger value="tasks">งาน</TabsTrigger>
            <TabsTrigger value="insights">การวิเคราะห์</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex ml-4">
          <select 
            className="bg-card border border-border rounded-md p-1 text-sm"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
          >
            <option value="7d">7 วัน</option>
            <option value="30d">30 วัน</option>
            <option value="90d">90 วัน</option>
            <option value="all">ทั้งหมด</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">โครงการทั้งหมด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalProjects}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium text-green-400">{stats.completedProjects}</span> เสร็จสิ้น,{' '}
                    <span className="font-medium text-red-400">{stats.issueProjects}</span> มีปัญหา
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">งานทั้งหมด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalTasks}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium text-green-400">{stats.completedTasks}</span> เสร็จสิ้น,{' '}
                    <span className="font-medium text-red-400">{stats.highPriorityTasks}</span> ความสำคัญสูง
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">อัตราความสำเร็จ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.completionRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">ความคืบหน้าเฉลี่ย {stats.averageProgress.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">งานเร่งด่วน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.highPriorityTasks}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">ต้องการการจัดการ</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>สถานะโครงการ</CardTitle>
                  <CardDescription>การกระจายตัวของโครงการตามสถานะ</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart width={400} height={300}>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>ความคืบหน้าตามเวลา</CardTitle>
                  <CardDescription>การเปลี่ยนแปลงสถานะโครงการในช่วง 6 เดือนที่ผ่านมา</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      width={500}
                      height={300}
                      data={monthlyProgressData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="เสร็จสิ้น" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                      <Area type="monotone" dataKey="กำลังดำเนินการ" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="รอดำเนินการ" stackId="1" stroke="#ffc658" fill="#ffc658" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>โครงการที่มีความคืบหน้าสูงสุด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProjects.map((project, index) => (
                      <div key={project.id} className="flex items-center justify-between">
                        <div className="flex items-start gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-sm text-muted-foreground">{project.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-medium">{project.progress}%</p>
                            <p className="text-xs text-muted-foreground">{project.dueDate}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {topProjects.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">ไม่มีข้อมูลโครงการ</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>งานล่าสุด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between">
                        <div className="flex items-start gap-2">
                          <div className={`rounded-full h-3 w-3 mt-1.5 ${
                            task.checked ? 'bg-green-500' : 
                            task.priority === 'สูง' ? 'bg-red-500' : 
                            task.priority === 'ปานกลาง' ? 'bg-yellow-500' : 
                            'bg-blue-500'
                          }`} />
                          <div>
                            <p className={`font-medium ${task.checked ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                              <Badge variant="outline" className={task.priorityColor}>
                                {task.priority}
                              </Badge>
                              <span>{task.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {recentTasks.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">ไม่มีข้อมูลงาน</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>การกระจายตัวของสถานะโครงการ</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={projectStatusData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8">
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>สถิติโครงการ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">โครงการทั้งหมด</p>
                        <p className="text-2xl font-bold">{stats.totalProjects}</p>
                      </div>
                      <div className="bg-card border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">เสร็จสิ้น</p>
                        <p className="text-2xl font-bold text-green-500">{stats.completedProjects}</p>
                      </div>
                      <div className="bg-card border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">กำลังดำเนินการ</p>
                        <p className="text-2xl font-bold text-blue-500">{stats.inProgressProjects}</p>
                      </div>
                      <div className="bg-card border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">มีปัญหา</p>
                        <p className="text-2xl font-bold text-red-500">{stats.issueProjects}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">ความคืบหน้าเฉลี่ย</h4>
                      <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${stats.averageProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-right mt-1">{stats.averageProgress.toFixed(1)}%</p>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">อัตราความสำเร็จ</h4>
                      <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${stats.completionRate}%` }}
                        />
                      </div>
                      <p className="text-sm text-right mt-1">{stats.completionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>รายการโครงการ</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ชื่อโครงการ</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>ความคืบหน้า</TableHead>
                      <TableHead>กำหนดส่ง</TableHead>
                      <TableHead>อัพเดทล่าสุด</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.projects.slice(0, 10).map((project) => (
                      <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/admin/project-detail/${project.id}`)}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            project.status === 'เสร็จสิ้น' ? 'bg-green-900/30 text-green-200' : 
                            project.status === 'มีปัญหา' ? 'bg-red-900/30 text-red-200' : 
                            project.status === 'กำลังดำเนินการ' ? 'bg-blue-900/30 text-blue-200' :
                            'bg-yellow-900/30 text-yellow-200'
                          }>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  project.status === 'เสร็จสิ้น' ? 'bg-green-500' : 
                                  project.status === 'มีปัญหา' ? 'bg-red-500' : 
                                  'bg-primary'
                                }`} 
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-xs">{project.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{project.dueDate}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {project.updatedAt ? format(project.updatedAt.toDate(), 'dd/MM/yyyy') : 'ไม่ระบุ'}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredData.projects.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          ไม่มีข้อมูลโครงการในช่วงเวลาที่เลือก
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                {filteredData.projects.length > 10 && (
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={() => router.push('/admin')}>
                      ดูทั้งหมด {filteredData.projects.length} โครงการ
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>การกระจายตัวของงานตามความสำคัญ</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={300}
                      data={taskPriorityData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8">
                        {taskPriorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>สถิติงาน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">งานทั้งหมด</p>
                        <p className="text-2xl font-bold">{stats.totalTasks}</p>
                      </div>
                      <div className="bg-card border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">เสร็จสิ้น</p>
                        <p className="text-2xl font-bold text-green-500">{stats.completedTasks}</p>
                      </div>
                      <div className="bg-card border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">ความสำคัญสูง</p>
                        <p className="text-2xl font-bold text-red-500">{stats.highPriorityTasks}</p>
                      </div>
                      <div className="bg-card border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">ความสำคัญกลาง</p>
                        <p className="text-2xl font-bold text-yellow-500">{stats.mediumPriorityTasks}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">อัตราความสำเร็จของงาน</h4>
                      <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${stats.taskCompletionRate}%` }}
                        />
                      </div>
                      <p className="text-sm text-right mt-1">{stats.taskCompletionRate.toFixed(1)}%</p>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">งานเร่งด่วน</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>งานความสำคัญสูง</span>
                        </div>
                        <span className="font-medium">{stats.highPriorityTasks}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>รายการงาน</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">สถานะ</TableHead>
                      <TableHead>ชื่องาน</TableHead>
                      <TableHead>ความสำคัญ</TableHead>
                      <TableHead>กำหนดส่ง</TableHead>
                      <TableHead>อัพเดทล่าสุด</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.tasks.slice(0, 10).map((task) => (
                      <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/admin/task-detail/${task.id}`)}>
                        <TableCell>
                          <div className={`w-4 h-4 rounded-full ${task.checked ? 'bg-green-500' : 'border-2 border-primary'}`}></div>
                        </TableCell>
                        <TableCell className={`font-medium ${task.checked ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={task.priorityColor}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{task.time}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {task.updatedAt ? format(task.updatedAt.toDate(), 'dd/MM/yyyy') : 'ไม่ระบุ'}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredData.tasks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          ไม่มีข้อมูลงานในช่วงเวลาที่เลือก
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                {filteredData.tasks.length > 10 && (
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={() => router.push('/admin')}>
                      ดูทั้งหมด {filteredData.tasks.length} งาน
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Insights Tab */}
          <TabsContent value="insights" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    ประสิทธิภาพการทำงาน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">
                    {performanceInsights.completionInsight}
                  </div>
                  <p className="text-muted-foreground">
                    อัตราความสำเร็จของโครงการอยู่ที่ {stats.completionRate.toFixed(1)}% ซึ่งถือว่า{performanceInsights.completionInsight === 'ดีเยี่ยม' ? 'สูงกว่าค่าเฉลี่ยอย่างมาก' : performanceInsights.completionInsight === 'ดี' ? 'อยู่ในเกณฑ์ดี' : 'ต่ำกว่าเกณฑ์และควรปรับปรุง'}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" className="w-full" onClick={() => setActiveTab('projects')}>
                    ดูรายละเอียด
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border-amber-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    ความเสี่ยงในโครงการ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">
                    {performanceInsights.riskInsight}
                  </div>
                  <p className="text-muted-foreground">
                    มีงานความสำคัญสูงที่ยังไม่เสร็จ {stats.highPriorityTasks} งาน และโครงการที่มีปัญหา {stats.issueProjects} โครงการ ระดับความเสี่ยงอยู่ในระดับ{performanceInsights.riskInsight}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" className="w-full" onClick={() => setActiveTab('tasks')}>
                    ดูรายละเอียด
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    ความคืบหน้า
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">
                    {performanceInsights.progressInsight}
                  </div>
                  <p className="text-muted-foreground">
                    ความคืบหน้าเฉลี่ยของโครงการอยู่ที่ {stats.averageProgress.toFixed(1)}% ซึ่งถือว่า{performanceInsights.progressInsight === 'สูง' ? 'ดีมาก' : performanceInsights.progressInsight === 'ปานกลาง' ? 'อยู่ในเกณฑ์ปกติ' : 'ต่ำกว่าเป้าหมาย'}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" className="w-full" onClick={() => setActiveTab('overview')}>
                    ดูรายละเอียด
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>คำแนะนำจากระบบ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.highPriorityTasks > 0 && (
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                      <div className="bg-red-500/20 p-2 rounded-full text-red-500">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">จัดการงานความสำคัญสูง</h4>
                        <p className="text-muted-foreground mt-1">
                          คุณมี {stats.highPriorityTasks} งานความสำคัญสูงที่ยังไม่เสร็จสิ้น ควรจัดลำดับความสำคัญให้กับงานเหล่านี้ก่อน
                        </p>
                        <Button className="mt-3" variant="outline" size="sm" onClick={() => router.push('/admin')}>
                          จัดการงาน
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {stats.issueProjects > 0 && (
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                      <div className="bg-amber-500/20 p-2 rounded-full text-amber-500">
                        <Filter className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">แก้ไขโครงการที่มีปัญหา</h4>
                        <p className="text-muted-foreground mt-1">
                          มี {stats.issueProjects} โครงการที่มีปัญหา ควรตรวจสอบและแก้ไขปัญหาโดยเร็วเพื่อให้โครงการดำเนินต่อไปได้
                        </p>
                        <Button className="mt-3" variant="outline" size="sm" onClick={() => router.push('/admin')}>
                          ดูโครงการที่มีปัญหา
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {stats.completionRate < 50 && (
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                      <div className="bg-blue-500/20 p-2 rounded-full text-blue-500">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">เพิ่มอัตราความสำเร็จ</h4>
                        <p className="text-muted-foreground mt-1">
                          อัตราความสำเร็จของโครงการอยู่ที่ {stats.completionRate.toFixed(1)}% ซึ่งต่ำกว่าเป้าหมาย ควรติดตามโครงการอย่างใกล้ชิดและจัดสรรทรัพยากรเพิ่มเติม
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {stats.highPriorityTasks === 0 && stats.issueProjects === 0 && stats.completionRate >= 50 && (
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                      <div className="bg-green-500/20 p-2 rounded-full text-green-500">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">ผลงานดีเยี่ยม</h4>
                        <p className="text-muted-foreground mt-1">
                          ขณะนี้ไม่มีปัญหาเร่งด่วนที่ต้องจัดการ และอัตราความสำเร็จของโครงการอยู่ในระดับที่ดี ให้รักษาประสิทธิภาพการทำงานนี้ต่อไป
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>ข้อควรปรับปรุง</CardTitle>
              </CardHeader>
              <CardContent>
                {(stats.issueProjects > 0 || stats.highPriorityTasks > 0 || stats.completionRate < 50) ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ประเด็น</TableHead>
                        <TableHead>คำอธิบาย</TableHead>
                        <TableHead>ความเร่งด่วน</TableHead>
                        <TableHead>คำแนะนำ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.issueProjects > 0 && (
                        <TableRow>
                          <TableCell className="font-medium">โครงการที่มีปัญหา</TableCell>
                          <TableCell>มี {stats.issueProjects} โครงการที่มีปัญหา</TableCell>
                          <TableCell>
                            <Badge variant="destructive">สูง</Badge>
                          </TableCell>
                          <TableCell>ตรวจสอบและระบุปัญหาที่พบ จัดสรรทรัพยากรเพิ่มเติมหรือปรับแผนการดำเนินงาน</TableCell>
                        </TableRow>
                      )}
                      {stats.highPriorityTasks > 0 && (
                        <TableRow>
                          <TableCell className="font-medium">งานความสำคัญสูง</TableCell>
                          <TableCell>มี {stats.highPriorityTasks} งานความสำคัญสูงที่ยังไม่เสร็จ</TableCell>
                          <TableCell>
                            <Badge variant="destructive">สูง</Badge>
                          </TableCell>
                          <TableCell>จัดลำดับความสำคัญและมอบหมายงานเร่งด่วนให้ทีมจัดการโดยเร็ว</TableCell>
                        </TableRow>
                      )}
                      {stats.completionRate < 50 && (
                        <TableRow>
                          <TableCell className="font-medium">อัตราความสำเร็จต่ำ</TableCell>
                          <TableCell>อัตราความสำเร็จอยู่ที่ {stats.completionRate.toFixed(1)}% ซึ่งต่ำกว่าเป้าหมาย</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-amber-900/30 text-amber-200">ปานกลาง</Badge>
                          </TableCell>
                          <TableCell>วิเคราะห์สาเหตุที่ทำให้ความสำเร็จต่ำ และปรับปรุงกระบวนการทำงาน</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="bg-green-500/20 p-4 rounded-full text-green-500 mb-4">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                    <p className="text-xl font-medium">ยินดีด้วย!</p>
                    <p className="text-center text-muted-foreground max-w-md mt-2">
                      ขณะนี้ไม่พบประเด็นที่ต้องปรับปรุงเร่งด่วน ทีมของคุณทำงานได้ดีมาก ให้รักษาประสิทธิภาพการทำงานนี้ต่อไป
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </>
      )}
    </div>
  );
}
