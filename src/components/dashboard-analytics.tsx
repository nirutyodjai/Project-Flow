'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line,
  BarChart,
  Bar,
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { Loader2, Download, FileSpreadsheet } from 'lucide-react';

// Sample project metrics data
const projectData = [
  { month: 'ม.ค.', projects: 5, completed: 3, revenue: 2500000 },
  { month: 'ก.พ.', projects: 7, completed: 4, revenue: 2800000 },
  { month: 'มี.ค.', projects: 4, completed: 2, revenue: 2100000 },
  { month: 'เม.ย.', projects: 6, completed: 4, revenue: 2900000 },
  { month: 'พ.ค.', projects: 8, completed: 5, revenue: 3200000 },
  { month: 'มิ.ย.', projects: 9, completed: 6, revenue: 3500000 },
];

const projectStatusData = [
  { name: 'เสร็จสิ้น', value: 18, fill: 'hsl(var(--chart-2))' },
  { name: 'กำลังดำเนินการ', value: 12, fill: 'hsl(var(--chart-1))' },
  { name: 'รอดำเนินการ', value: 8, fill: 'hsl(var(--chart-3))' },
  { name: 'มีปัญหา', value: 2, fill: 'hsl(var(--destructive))' },
];

const teamPerformanceData = [
  { name: 'พัฒนา', tasks: 125, completed: 112, progress: 89.6 },
  { name: 'ออกแบบ', tasks: 83, completed: 75, progress: 90.4 },
  { name: 'การตลาด', tasks: 67, completed: 52, progress: 77.6 },
  { name: 'ขาย', tasks: 91, completed: 84, progress: 92.3 },
  { name: 'บัญชี', tasks: 43, completed: 38, progress: 88.4 },
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-card border shadow-md rounded-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className={`text-${entry.color}`}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardAnalytics() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">รายงานภาพรวม</h2>
          <p className="text-muted-foreground">ข้อมูลสรุปสำหรับโครงการและงานทั้งหมด</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <span>นำเข้าข้อมูล</span>
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            <span>ดาวน์โหลดรายงาน</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="projects">โครงการ</TabsTrigger>
          <TabsTrigger value="teams">ทีมงาน</TabsTrigger>
          <TabsTrigger value="finances">การเงิน</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>สถานะโครงการ</CardTitle>
                <CardDescription>แสดงสัดส่วนสถานะของโครงการทั้งหมด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        innerRadius={70}
                        dataKey="value"
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>โครงการรายเดือน</CardTitle>
                <CardDescription>จำนวนโครงการที่ดำเนินการและเสร็จสิ้น</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="projects" name="โครงการทั้งหมด" fill="hsl(var(--primary))" />
                      <Bar dataKey="completed" name="เสร็จสิ้น" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ประสิทธิภาพของทีมงาน</CardTitle>
              <CardDescription>อัตราการทำงานเสร็จตามกำหนดของแต่ละทีม</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={teamPerformanceData} 
                    layout="vertical"
                    margin={{ top: 20, right: 20, bottom: 20, left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis 
                      type="category" 
                      dataKey="name"
                      tick={{ fontSize: 14 }} 
                      width={80} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="progress" name="ประสิทธิภาพ (%)" fill="hsl(var(--chart-4))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>รายได้โครงการ</CardTitle>
              <CardDescription>รายได้รวมจากโครงการรายเดือน</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000)}M`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      name="รายได้ (บาท)"
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2} 
                      dot={{ strokeWidth: 3 }} 
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
