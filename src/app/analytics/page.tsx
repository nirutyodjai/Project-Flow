'use client';

import { useState } from 'react';
import { 
  TrendingUp, DollarSign, Users, FileText, Calendar,
  BarChart3, PieChart, LineChart, Activity, Award,
  ArrowUpRight, ArrowDownRight, Filter, Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30days');
  const [compareMode, setCompareMode] = useState(false);

  const kpiData = {
    revenue: {
      current: 3897500,
      previous: 3472000,
      change: 12.3,
      trend: 'up',
    },
    projects: {
      current: 42,
      previous: 38,
      change: 10.5,
      trend: 'up',
    },
    winRate: {
      current: 65,
      previous: 58,
      change: 12.1,
      trend: 'up',
    },
    avgProfit: {
      current: 14.5,
      previous: 12.8,
      change: 13.3,
      trend: 'up',
    },
  };

  const categoryPerformance = [
    { name: 'ก่อสร้าง', revenue: 1500000, projects: 15, winRate: 75, avgProfit: 15.5 },
    { name: 'ไฟฟ้า', revenue: 1200000, projects: 12, winRate: 68, avgProfit: 14.2 },
    { name: 'ตกแต่ง', revenue: 800000, projects: 8, winRate: 55, avgProfit: 12.8 },
    { name: 'ประปา', revenue: 397500, projects: 7, winRate: 60, avgProfit: 13.5 },
  ];

  const monthlyTrend = [
    { month: 'ม.ค.', revenue: 2500000, projects: 6, winRate: 60 },
    { month: 'ก.พ.', revenue: 2800000, projects: 7, winRate: 62 },
    { month: 'มี.ค.', revenue: 2100000, projects: 5, winRate: 58 },
    { month: 'เม.ย.', revenue: 2900000, projects: 8, winRate: 65 },
    { month: 'พ.ค.', revenue: 3200000, projects: 8, winRate: 68 },
    { month: 'มิ.ย.', revenue: 3500000, projects: 9, winRate: 70 },
  ];

  const topCustomers = [
    { name: 'บริษัท ABC จำกัด', revenue: 850000, projects: 5 },
    { name: 'บริษัท XYZ จำกัด', revenue: 720000, projects: 4 },
    { name: 'องค์การ DEF', revenue: 650000, projects: 3 },
    { name: 'บริษัท GHI จำกัด', revenue: 480000, projects: 3 },
    { name: 'บริษัท JKL จำกัด', revenue: 390000, projects: 2 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">วิเคราะห์ข้อมูลเชิงลึกและติดตามผลการดำเนินงาน</p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="เลือกช่วงเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 วันที่แล้ว</SelectItem>
                <SelectItem value="30days">30 วันที่แล้ว</SelectItem>
                <SelectItem value="90days">90 วันที่แล้ว</SelectItem>
                <SelectItem value="1year">1 ปีที่แล้ว</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              ตัวกรอง
            </Button>
            
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  รายได้รวม
                </CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {formatCurrency(kpiData.revenue.current)}
              </div>
              <div className={`flex items-center text-sm ${kpiData.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {kpiData.revenue.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {formatPercent(kpiData.revenue.change)}
                <span className="text-muted-foreground ml-2">จากเดือนที่แล้ว</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  โครงการ
                </CardTitle>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{kpiData.projects.current}</div>
              <div className={`flex items-center text-sm ${kpiData.projects.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {kpiData.projects.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {formatPercent(kpiData.projects.change)}
                <span className="text-muted-foreground ml-2">จากเดือนที่แล้ว</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Win Rate
                </CardTitle>
                <Award className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{kpiData.winRate.current}%</div>
              <div className={`flex items-center text-sm ${kpiData.winRate.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {kpiData.winRate.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {formatPercent(kpiData.winRate.change)}
                <span className="text-muted-foreground ml-2">จากเดือนที่แล้ว</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  กำไรเฉลี่ย
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{kpiData.avgProfit.current}%</div>
              <div className={`flex items-center text-sm ${kpiData.avgProfit.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {kpiData.avgProfit.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {formatPercent(kpiData.avgProfit.change)}
                <span className="text-muted-foreground ml-2">จากเดือนที่แล้ว</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="categories">รายหมวดหมู่</TabsTrigger>
            <TabsTrigger value="customers">ลูกค้า</TabsTrigger>
            <TabsTrigger value="trends">แนวโน้ม</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    แนวโน้มรายได้
                  </CardTitle>
                  <CardDescription>รายได้ย้อนหลัง 6 เดือน</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyTrend.map((month, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{month.month}</span>
                          <span className="text-sm font-bold">{formatCurrency(month.revenue)}</span>
                        </div>
                        <Progress value={(month.revenue / 3500000) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    กระจายรายได้ตามประเภท
                  </CardTitle>
                  <CardDescription>แยกตามประเภทงาน</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryPerformance.map((category, index) => {
                      const total = categoryPerformance.reduce((sum, cat) => sum + cat.revenue, 0);
                      const percentage = (category.revenue / total) * 100;
                      
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                index === 0 ? 'bg-blue-600' :
                                index === 1 ? 'bg-green-600' :
                                index === 2 ? 'bg-purple-600' : 'bg-orange-600'
                              }`} />
                              <span className="text-sm font-medium">{category.name}</span>
                            </div>
                            <span className="text-sm font-bold">{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ผลการดำเนินงานแยกตามประเภท</CardTitle>
                <CardDescription>เปรียบเทียบประสิทธิภาพแต่ละประเภทงาน</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categoryPerformance.map((category, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <Badge variant="outline">{category.projects} โครงการ</Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">รายได้</p>
                          <p className="text-xl font-bold text-blue-600">{formatCurrency(category.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                          <p className="text-xl font-bold text-green-600">{category.winRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">กำไรเฉลี่ย</p>
                          <p className="text-xl font-bold text-purple-600">{category.avgProfit}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  ลูกค้าอันดับต้น
                </CardTitle>
                <CardDescription>5 ลูกค้าที่สร้างรายได้สูงสุด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.projects} โครงการ</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(customer.revenue)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((customer.revenue / kpiData.revenue.current) * 100).toFixed(1)}% ของยอดรวม
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  แนวโน้มตามเดือน
                </CardTitle>
                <CardDescription>วิเคราะห์แนวโน้มย้อนหลัง 6 เดือน</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">เดือน</th>
                        <th className="text-right py-3 px-4">รายได้</th>
                        <th className="text-right py-3 px-4">โครงการ</th>
                        <th className="text-right py-3 px-4">Win Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyTrend.map((month, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{month.month}</td>
                          <td className="py-3 px-4 text-right">{formatCurrency(month.revenue)}</td>
                          <td className="py-3 px-4 text-right">{month.projects}</td>
                          <td className="py-3 px-4 text-right">
                            <Badge variant={month.winRate >= 65 ? 'default' : 'secondary'}>
                              {month.winRate}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                ผลการดำเนินงานที่ดี
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>รายได้เพิ่มขึ้น 12.3% จากเดือนที่แล้ว</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Win Rate อยู่ที่ 65% สูงกว่าค่าเฉลี่ยอุตสาหกรรม</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>งานก่อสร้างมี Win Rate สูงถึง 75%</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                จุดที่ควรปรับปรุง
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">!</span>
                  <span>งานตกแต่งมี Win Rate ต่ำที่สุด (55%)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">!</span>
                  <span>ควรเพิ่มลูกค้าใหม่เพื่อกระจายความเสี่ยง</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">!</span>
                  <span>ควรปรับกลยุทธ์การตั้งราคาในงานประเภทประปา</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
