
'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  TriangleAlert,
  Clock,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  FileDown,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { listProjects, Project } from '@/services/mock-data';


// Mock Data is now being fetched from the service
const recentTransactions = [
    { type: 'income', title: 'รับเงินงวดที่ 2 - โครงการ A', details: 'รับเงินงวดที่ 2 จากลูกค้า บริษัท พัฒนาที่ดินไทย จำกัด', amount: '+ ฿ 2,500,000', date: '15 มิ.ย. 2023' },
    { type: 'expense', title: 'จ่ายค่าวัสดุก่อสร้าง - โครงการ A', details: 'จ่ายค่าวัสดุก่อสร้างให้ บริษัท วัสดุก่อสร้างไทย จำกัด', amount: '- ฿ 1,800,000', date: '5 มิ.ย. 2023' },
    { type: 'expense', title: 'จ่ายค่าอุปกรณ์ไฟฟ้า - โครงการ B', details: 'จ่ายค่าอุปกรณ์ไฟฟ้าให้ บริษัท อุปกรณ์ไฟฟ้าไทย จำกัด', amount: '- ฿ 1,200,000', date: '10 มิ.ย. 2023' },
    { type: 'expense', title: 'จ่ายค่าอุปกรณ์ปรับอากาศ - โครงการ C', details: 'จ่ายค่าอุปกรณ์ปรับอากาศให้ บริษัท แอร์ไทย จำกัด', amount: '- ฿ 950,000', date: '12 มิ.ย. 2023' },
    { type: 'income', title: 'รับเงินงวดที่ 2 - โครงการ B', details: 'รับเงินงวดที่ 2 จากลูกค้า บริษัท ก่อสร้างไทย จำกัด', amount: '+ ฿ 1,750,000', date: '22 มิ.ย. 2023' },
    { type: 'income', title: 'รับเงินงวดที่ 1 - โครงการ C', details: 'รับเงินงวดที่ 1 จากลูกค้า บริษัท ระบบไฟฟ้าไทย จำกัด', amount: '+ ฿ 1,240,000', date: '30 มิ.ย. 2023' },
];

const incomeData = [
    { date: '15 มิ.ย. 2023', project: 'โครงการ A', description: 'รับเงินงวดที่ 2', amount: '2,500,000' },
    { date: '22 มิ.ย. 2023', project: 'โครงการ B', description: 'รับเงินงวดที่ 2', amount: '1,750,000' },
    { date: '30 มิ.ย. 2023', project: 'โครงการ C', description: 'รับเงินงวดที่ 1', amount: '1,240,000' },
];

const expenseData = [
    { date: '5 มิ.ย. 2023', project: 'โครงการ A', category: 'วัสดุก่อสร้าง', amount: '1,800,000' },
    { date: '10 มิ.ย. 2023', project: 'โครงการ B', category: 'อุปกรณ์ไฟฟ้า', amount: '1,200,000' },
    { date: '12 มิ.ย. 2023', project: 'โครงการ C', category: 'อุปกรณ์ปรับอากาศ', amount: '950,000' },
];

const cashFlowChartData = [
    { day: '1 พ.ค.', y: 30, type: 'income', amount: 500000, label: 'รับเงินงวด 1' },
    { day: '8 พ.ค.', y: 40, type: 'expense', amount: 200000, label: 'จ่ายค่าวัสดุ' },
    { day: '15 พ.ค.', y: 35, type: 'expense', amount: 150000, label: 'จ่ายค่าแรงงาน' },
    { day: '22 พ.ค.', y: 20, type: 'income', amount: 800000, label: 'รับเงินงวด 2' },
    { day: '29 พ.ค.', y: 35, type: 'expense', amount: 350000, label: 'จ่ายค่าอุปกรณ์' },
];

export default function FinancePage() {
    const [projects, setProjects] = useState<Project[] | null>(null);

    useEffect(() => {
        listProjects({}).then(data => setProjects(data));
    }, []);

    const allProjectsData = projects ? [
        ...projects.map(p => ({
            id: p.id,
            name: p.name,
            status: "กำลังดำเนินการ", // This should probably come from the data
            value: p.budget || '0',
            paid: '0', // This should probably come from the data
            remaining: p.budget || '0', // This should probably come from the data
            profitPercent: 20, // This should probably come from the data
        })),
        { id: 'proj-d', name: 'โครงการก่อสร้างคอนโด D', status: "กำลังดำเนินการ", value: '45,000,000', paid: '30,000,000', remaining: '15,000,000', profitPercent: 20 },
        { id: 'proj-e', name: 'โครงการวางระบบท่อ E', status: "เสร็จสิ้น", value: '5,500,000', paid: '5,500,000', remaining: '0', profitPercent: 20 },
    ] : [];

    return (
        <div className="h-full flex flex-col">
            <PageHeader
                title="บริหารการเงินโครงการ"
                description="ติดตามกระแสเงินสด วางแผนการใช้เงิน และจัดลำดับความสำคัญของโครงการ"
            >
                 <div className="flex flex-wrap gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-5 w-5 mr-1" />
                                บันทึกรายการเงิน
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>บันทึกรายการเงิน</DialogTitle>
                            </DialogHeader>
                            {/* Form content goes here */}
                        </DialogContent>
                    </Dialog>
                    <Button variant="secondary">
                        <ChartNoAxesColumnIncreasing className="h-5 w-5 mr-1" />
                        รายงาน
                    </Button>
                </div>
            </PageHeader>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 sm:px-6 lg:px-8 border-b border-border">
                    <TabsList className="bg-transparent p-0">
                        <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                        <TabsTrigger value="cashflow">กระแสเงินสด</TabsTrigger>
                        <TabsTrigger value="projects">โครงการ</TabsTrigger>
                        <TabsTrigger value="income">รายรับ</TabsTrigger>
                        <TabsTrigger value="expenses">รายจ่าย</TabsTrigger>
                        <TabsTrigger value="reports">รายงาน</TabsTrigger>
                    </TabsList>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <TabsContent value="overview" className="p-4 sm:p-6 lg:p-8 mt-0">
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="project-card">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">เงินสดคงเหลือ</CardTitle>
                                    <Wallet className="h-6 w-6 text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">฿ 3,245,890</div>
                                    <p className="text-xs text-green-400 flex items-center mt-2">
                                        <TrendingUp className="h-4 w-4 mr-1" />
                                        +8.5% จากเดือนที่แล้ว
                                    </p>
                                </CardContent>
                            </Card>
                             <Card className="project-card">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">รายรับเดือนนี้</CardTitle>
                                    <TrendingUp className="h-6 w-6 text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">฿ 1,850,000</div>
                                    <p className="text-xs text-green-400 flex items-center mt-2">
                                        <TrendingUp className="h-4 w-4 mr-1" />
                                        +12.3% จากเดือนที่แล้ว
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="project-card">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">รายจ่ายเดือนนี้</CardTitle>
                                    <TrendingDown className="h-6 w-6 text-red-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">฿ 1,250,000</div>
                                    <p className="text-xs text-red-400 flex items-center mt-2">
                                        <TrendingUp className="h-4 w-4 mr-1" />
                                        +5.7% จากเดือนที่แล้ว
                                    </p>
                                </CardContent>
                            </Card>
                             <Card className="project-card">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">รายจ่ายที่กำลังมาถึง</CardTitle>
                                    <TriangleAlert className="h-6 w-6 text-yellow-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">฿ 750,000</div>
                                    <p className="text-xs text-yellow-400 flex items-center mt-2 badge-pulse">
                                        <Clock className="h-4 w-4 mr-1" />
                                        ภายใน 7 วัน
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-medium">โครงการที่มีมูลค่าสูง</h2>
                                <Button variant="link" className="text-primary hover:text-primary/80">ดูทั้งหมด</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 staggered-fade-in">
                                {projects?.map((project) => (
                                    <Card key={project.id} className="project-card">
                                        <CardHeader>
                                            <CardTitle className="flex justify-between items-center text-base">
                                                {project.name} <span className="px-2 py-1 text-xs rounded-full status-approved">กำลังดำเนินการ</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-muted-foreground">มูลค่าโครงการ</span> <span>฿ {project.budget}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                         <div className="p-4 border-t border-border bg-card flex justify-between items-center">
                                            <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80"><ChevronRight className="h-5 w-5" /></Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                    </TabsContent>
                    <TabsContent value="cashflow" className="p-4 sm:p-6 lg:p-8 mt-0 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>ภาพรวมกระแสเงินสด</CardTitle>
                            </CardHeader>
                             <CardContent className="p-6">
                                <div className="cash-flow-chart">
                                    <div className="cash-flow-line"></div>
                                    {cashFlowChartData.map((point, index) => (
                                        <React.Fragment key={index}>
                                            <div className={`cash-flow-point ${point.type}`} style={{ left: `${5 + (index * 20)}%`, top: `${point.y}%` }} title={`${point.label}: ฿${point.amount.toLocaleString()}`}></div>
                                            {index < cashFlowChartData.length - 1 && (
                                                <div className="cash-flow-connector" style={{
                                                    left: `${5 + (index * 20)}%`,
                                                    top: `${point.y}%`,
                                                    width: '20%',
                                                    transform: `rotate(${Math.atan((cashFlowChartData[index+1].y - point.y) / 20) * 180 / Math.PI}deg)`
                                                }}></div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-400">
                                        {cashFlowChartData.map((point) => <div key={point.day}>{point.day}</div>)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle>รายการเงินที่กำลังมาถึง</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="timeline p-6">
                                    {recentTransactions.map((item, index) => (
                                        <div key={index} className={`timeline-item ${item.type}`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium">{item.title}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">{item.details}</p>

                                                </div>
                                                <div className="text-right">
                                                    <p className={`${item.type === 'income' ? 'text-green-400' : 'text-red-400'} font-medium`}>{item.amount}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="projects" className="p-4 sm:p-6 lg:p-8 mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>สถานะทางการเงินทุกโครงการ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>โครงการ</TableHead>
                                            <TableHead>สถานะ</TableHead>
                                            <TableHead className="text-right">มูลค่ารวม</TableHead>
                                            <TableHead className="text-right">รับแล้ว</TableHead>
                                            <TableHead className="text-right">คงเหลือ</TableHead>
                                            <TableHead className="text-right">กำไร (%)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allProjectsData.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">{p.name}</TableCell>
                                                <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                                                <TableCell className="text-right">฿{p.value}</TableCell>
                                                <TableCell className="text-right text-green-400">฿{p.paid}</TableCell>
                                                <TableCell className="text-right">฿{p.remaining}</TableCell>
                                                <TableCell className="text-right">{p.profitPercent}%</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="income" className="p-4 sm:p-6 lg:p-8 mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>รายการรับเงิน</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>วันที่</TableHead>
                                            <TableHead>โครงการ</TableHead>
                                            <TableHead>รายละเอียด</TableHead>
                                            <TableHead className="text-right">จำนวนเงิน</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {incomeData.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.date}</TableCell>
                                                <TableCell>{item.project}</TableCell>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell className="text-right text-green-400">+ ฿{item.amount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="expenses" className="p-4 sm:p-6 lg:p-8 mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>รายการจ่ายเงิน</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>วันที่</TableHead>
                                            <TableHead>โครงการ</TableHead>
                                            <TableHead>หมวดหมู่</TableHead>
                                            <TableHead className="text-right">จำนวนเงิน</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {expenseData.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.date}</TableCell>
                                                <TableCell>{item.project}</TableCell>
                                                <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                                                <TableCell className="text-right text-red-400">- ฿{item.amount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="reports" className="p-4 sm:p-6 lg:p-8 mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>รายงานทางการเงิน</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> รายงานกระแสเงินสด</Button>
                               <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> งบกำไรขาดทุน</Button>
                               <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> สรุปต้นทุนโครงการ</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
