'use client';

import React, { useEffect } from 'react';
import {
  ArrowUp,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  ListTodo,
  Plus,
  TrendingDown,
  Users,
  Bell,
  FileText,
  Search,
  BarChart3,
  Zap,
  Calculator,
  Sparkles,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { FileUploader } from '@/components/file-uploader';
import { AIAssistantWidget } from '@/components/ai-assistant-widget';
import { QuickStatsWidget } from '@/components/quick-stats-widget';
import { RecentActivityFeed } from '@/components/recent-activity-feed';
import { QuickActions, FeatureShowcase } from '@/components/dashboard';
import { initializeSampleData } from '@/lib/data-manager';


const projectStatusData = [
    { name: 'เสร็จสิ้น', value: 18, fill: 'hsl(var(--chart-2))' },
    { name: 'กำลังดำเนินการ', value: 12, fill: 'hsl(var(--chart-1))' },
    { name: 'รอดำเนินการ', value: 8, fill: 'hsl(var(--chart-3))' },
    { name: 'มีปัญหา', value: 2, fill: 'hsl(var(--destructive))' },
];

const revenueData = [
  { month: 'ม.ค.', revenue: 2500000 },
  { month: 'ก.พ.', revenue: 2800000 },
  { month: 'มี.ค.', revenue: 2100000 },
  { month: 'เม.ย.', revenue: 2900000 },
  { month: 'พ.ค.', revenue: 3200000 },
  { month: 'มิ.ย.', revenue: 3500000 },
  { month: 'ก.ค.', revenue: 3100000 },
  { month: 'ส.ค.', revenue: 3400000 },
  { month: 'ก.ย.', revenue: 3897500 },
  { month: 'ต.ค.', revenue: 0 },
  { month: 'พ.ย.', revenue: 0 },
  { month: 'ธ.ค.', revenue: 0 },
];

const recentActivities = [
    { icon: Plus, text: "โปรเจค <strong>ระบบจัดการคลังสินค้า</strong> ถูกสร้างขึ้น", time: "2 ชั่วโมงที่แล้ว", bgColor: "bg-blue-500" },
    { icon: CheckCircle, text: "โปรเจค <strong>เว็บไซต์บริษัท ABC</strong> เสร็จสมบูรณ์", time: "เมื่อวาน 15:30", bgColor: "bg-green-500" },
    { icon: Bell, text: "มีการแจ้งเตือนใหม่จากโปรเจค <strong>แอปพลิเคชันมือถือ</strong>", time: "2 วันที่แล้ว", bgColor: "bg-red-500" },
    { icon: Clock, text: "กำหนดส่งงานโปรเจค <strong>ระบบ CRM</strong> ถูกเลื่อนออกไป", time: "3 วันที่แล้ว", bgColor: "bg-yellow-500" },
    { icon: ListTodo, text: "พบปัญหาในโปรเจค <strong>ระบบจัดการโรงแรม</strong>", time: "1 สัปดาห์ที่แล้ว", bgColor: "bg-red-500" },
];

const todoListData = [
    { id: 'task1', title: "ประชุมทีมพัฒนาโปรเจค ABC", priority: 'สูง', priorityColor: 'bg-red-900/30 text-red-200', time: "วันนี้ 14:00", checked: false, user: 'T', userBg: 'from-blue-500 to-blue-700' },
    { id: 'task2', title: "ส่งรายงานความคืบหน้าประจำเดือน", priority: 'ปานกลาง', priorityColor: 'bg-yellow-900/30 text-yellow-200', time: "พรุ่งนี้ 17:00", checked: false, user: 'T', userBg: 'from-blue-500 to-blue-700' },
    { id: 'task3', title: "ตรวจสอบข้อผิดพลาดในระบบ C", priority: 'เสร็จสิ้น', priorityColor: 'bg-green-900/30 text-green-200', time: "เสร็จเมื่อ 2 ชั่วโมงที่แล้ว", checked: true, user: 'S', userBg: 'from-green-500 to-green-700' },
    { id: 'task4', title: "เตรียมเอกสารสำหรับการประมูลโครงการใหม่", priority: 'ต่ำ', priorityColor: 'bg-blue-900/30 text-blue-200', time: "30 ต.ค. 2023", checked: false, user: 'N', userBg: 'from-purple-500 to-purple-700' },
]

const quickActions = [
    { 
        title: 'วิเคราะห์เอกสาร', 
        description: 'วิเคราะห์เอกสาร TOR ด้วย AI', 
        icon: FileText, 
        href: '/document-analyzer',
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-500/10',
        iconColor: 'text-blue-500'
    },
    { 
        title: 'ค้นหาโครงการ', 
        description: 'ค้นหาโครงการประมูลที่เหมาะสม', 
        icon: Search, 
        href: '/automated-discovery',
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-500/10',
        iconColor: 'text-purple-500'
    },
    { 
        title: 'ที่ปรึกษาการประมูล', 
        description: 'รับคำแนะนำการประมูลจาก AI', 
        icon: Zap, 
        href: '/bidding-advisor',
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-500/10',
        iconColor: 'text-yellow-500'
    },
    { 
        title: 'รายงานขั้นสูง', 
        description: 'ดูรายงานและวิเคราะห์ข้อมูล', 
        icon: BarChart3, 
        href: '/reports/advanced',
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-500/10',
        iconColor: 'text-green-500'
    },
    { 
        title: 'คำนวณราคา', 
        description: 'เปรียบเทียบราคาวัสดุก่อสร้าง', 
        icon: Calculator, 
        href: '/procurement/price-comparison',
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-500/10',
        iconColor: 'text-orange-500'
    },
]


const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
}) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-slate-700/80 backdrop-blur-sm border border-slate-600 rounded-lg shadow-lg">
                <p className="label text-sm text-white">{`${label} : ${payload[0].value.toLocaleString()} บาท`}</p>
            </div>
        );
    }
    return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
}) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};


export default function DashboardPage() {
    const [todos, setTodos] = React.useState(todoListData);

    // Initialize data on mount
    useEffect(() => {
        initializeSampleData();
    }, []);

    const handleTodoChange = (id: string) => {
        setTodos(todos.map(todo => todo.id === id ? { ...todo, checked: !todo.checked } : todo));
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
                <div className="pb-5 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-headline font-bold leading-7 flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                            สวัสดี, ธนพล
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            ระบบพร้อมใช้งาน 🚀 ไม่ต้องใช้ Firebase! ข้อมูลปลอดภัยใน Local Storage
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-3">
                        <Button variant="secondary">ส่งออกรายงาน</Button>
                        <Button>
                            <Plus className="-ml-1 mr-2 h-5 w-5" />
                            สร้างโปรเจคใหม่
                        </Button>
                    </div>
                </div>
                {/* Quick Stats Widget */}
                <div className="mt-6">
                    <QuickStatsWidget />
                </div>

                {/* Original Stats - Hidden, using new widget instead */}
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 hidden">
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
                            <DollarSign className="h-6 w-6 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">฿3,897,500</div>
                            <p className="text-xs text-green-400 flex items-center mt-2">
                                <ArrowUp className="h-4 w-4 mr-1" />
                                12.5% จากเดือนที่แล้ว
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">ลูกค้าใหม่</CardTitle>
                            <Users className="h-6 w-6 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                             <p className="text-xs text-green-400 flex items-center mt-2">
                                <ArrowUp className="h-4 w-4 mr-1" />
                                8.2% จากสัปดาห์ที่แล้ว
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">โปรเจคที่เสร็จสิ้น</CardTitle>
                            <CheckCircle className="h-6 w-6 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">18</div>
                            <p className="text-xs text-red-400 flex items-center mt-2">
                                <TrendingDown className="h-4 w-4 mr-1" />
                                3.1% จากเดือนที่แล้ว
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">โครงการที่น่าสนใจ</CardTitle>
                            <Briefcase className="h-6 w-6 text-pink-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">5</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                <Link href="/procurement" className="hover:underline">
                                    ค้นหางานประมูล
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle>รายได้ย้อนหลัง 12 เดือน</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000000}M`} />
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                     <Card className="bg-card">
                        <CardHeader>
                            <CardTitle>สถานะโปรเจค</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={projectStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomizedLabel}
                                        outerRadius={100}
                                        innerRadius={70}
                                        dataKey="value"
                                    >
                                        {projectStatusData.map((entry, entryIndex) => (
                                            <Cell key={`cell-${entryIndex}`} fill={entry.fill} stroke={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                {/* Feature Showcase */}
                <div className="mt-8">
                    <FeatureShowcase />
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <QuickActions />
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {/* Recent Activity Feed - New Widget */}
                    <RecentActivityFeed />
                    <Card className="bg-card rounded-lg shadow-lg border-border overflow-hidden">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>งานที่ต้องทำ</CardTitle>
                                <Button variant="ghost" size="sm">
                                    <Plus className="h-4 w-4 mr-1" />
                                    เพิ่มงาน
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-3">
                                {todos.map(todo => (
                                    <div key={todo.id} className="flex items-center space-x-3 rounded-lg bg-secondary p-3">
                                        <Checkbox id={`task-${todo.id}`} checked={todo.checked} onCheckedChange={() => handleTodoChange(todo.id)} />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <label htmlFor={`task-${todo.id}`} className={cn("font-medium cursor-pointer", todo.checked && "text-muted-foreground line-through")}>
                                                    {todo.title}
                                                </label>
                                                <Badge variant="outline" className={cn("text-xs", todo.priorityColor)}>
                                                    {todo.priority}
                                                </Badge>
                                            </div>
                                            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{todo.time}</span>
                                                <Avatar className="h-5 w-5">
                                                     <div className={cn("flex h-full w-full items-center justify-center rounded-full text-white text-xs", todo.userBg)}>
                                                        {todo.user}
                                                     </div>
                                                </Avatar>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="mt-8">
                    <Card className="bg-card rounded-lg shadow-lg border-border">
                        <CardHeader>
                            <CardTitle>Quick Actions - เข้าถึงฟีเจอร์ได้อย่างรวดเร็ว</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {quickActions.map((action, index) => (
                                    <Link key={index} href={action.href}>
                                        <Card className={cn(
                                            "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50",
                                            action.bgColor
                                        )}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className={cn(
                                                        "p-3 rounded-lg transition-transform group-hover:scale-110",
                                                        action.bgColor
                                                    )}>
                                                        <action.icon className={cn("h-6 w-6", action.iconColor)} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                                                        <p className="text-xs text-muted-foreground">{action.description}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <Card className="bg-card rounded-lg shadow-lg border-border p-6">
                        <CardTitle className="mb-4">อัพโหลดไฟล์</CardTitle>
                        <FileUploader />
                    </Card>
                </div>

                {/* AI Assistant Widget */}
                <AIAssistantWidget />
            </main>
        </div>
    );
}