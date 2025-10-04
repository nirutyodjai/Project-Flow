'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileDown, 
  Calendar, 
  Filter, 
  Mail, 
  TrendingUp, 
  BarChart3, 
  PieChart,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function AdvancedReportsPage() {
  const [reportType, setReportType] = useState('project-summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [format, setFormat] = useState('json');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    includeCompleted: true,
    includeActive: true,
    includePending: true
  });
  const [emailRecipients, setEmailRecipients] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    {
      value: 'project-summary',
      label: 'สรุปภาพรวมโปรเจกต์',
      description: 'รายงานสถานะและความคืบหน้าของโปรเจกต์ทั้งหมด',
      icon: BarChart3
    },
    {
      value: 'financial',
      label: 'รายงานการเงิน',
      description: 'รายรับ รายจ่าย และกำไรขาดทุน',
      icon: TrendingUp
    },
    {
      value: 'performance',
      label: 'รายงานประสิทธิภาพ',
      description: 'วิเคราะห์ประสิทธิภาพการทำงานและ KPI',
      icon: PieChart
    }
  ];

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: FileText },
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet }
  ];

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const params = new URLSearchParams({
        format,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(filters.status && { status: filters.status })
      });

      const response = await fetch(`/api/reports/generate?${params}`);
      
      if (format === 'csv') {
        const csvData = await response.text();
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${Date.now()}.csv`;
        a.click();
      } else {
        const data = await response.json();
        console.log('Report generated:', data);
        // Handle JSON report display
      }
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCustomReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          filters: {
            ...filters,
            dateFrom,
            dateTo
          },
          emailRecipients: emailRecipients.split(',').map(email => email.trim()).filter(Boolean)
        })
      });

      const data = await response.json();
      console.log('Custom report generated:', data);
      
    } catch (error) {
      console.error('Error generating custom report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">รายงานข้อมูลขั้นสูง</h1>
          <p className="text-muted-foreground">
            สร้างและดาวน์โหลดรายงานข้อมูลในรูปแบบต่างๆ
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Advanced Analytics
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ประเภทรายงาน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        reportType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setReportType(type.value)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-5 w-5" />
                        <h3 className="font-medium">{type.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                ตัวกรองข้อมูล
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom">วันที่เริ่มต้น</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">วันที่สิ้นสุด</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>สถานะโปรเจกต์</Label>
                  <Select value={filters.status} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ทั้งหมด</SelectItem>
                      <SelectItem value="กำลังดำเนินการ">กำลังดำเนินการ</SelectItem>
                      <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
                      <SelectItem value="รอดำเนินการ">รอดำเนินการ</SelectItem>
                      <SelectItem value="มีปัญหา">มีปัญหา</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ความสำคัญ</Label>
                  <Select value={filters.priority} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกความสำคัญ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ทั้งหมด</SelectItem>
                      <SelectItem value="สูง">สูง</SelectItem>
                      <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                      <SelectItem value="ต่ำ">ต่ำ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>รวมข้อมูล</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCompleted"
                      checked={filters.includeCompleted}
                      onCheckedChange={(checked) =>
                        setFilters(prev => ({ ...prev, includeCompleted: !!checked }))
                      }
                    />
                    <Label htmlFor="includeCompleted">โปรเจกต์ที่เสร็จสิ้น</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeActive"
                      checked={filters.includeActive}
                      onCheckedChange={(checked) =>
                        setFilters(prev => ({ ...prev, includeActive: !!checked }))
                      }
                    />
                    <Label htmlFor="includeActive">โปรเจกต์ที่กำลังดำเนินการ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includePending"
                      checked={filters.includePending}
                      onCheckedChange={(checked) =>
                        setFilters(prev => ({ ...prev, includePending: !!checked }))
                      }
                    />
                    <Label htmlFor="includePending">โปรเจกต์ที่รอดำเนินการ</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                ส่งรายงานทางอีเมล (ไม่บังคับ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="emailRecipients">
                  ที่อยู่อีเมล (คั่นด้วยเครื่องหมายจุลภาค)
                </Label>
                <Input
                  id="emailRecipients"
                  placeholder="example1@email.com, example2@email.com"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          {/* Output Format */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5" />
                รูปแบบไฟล์
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.value}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      format === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormat(option.value)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{option.label}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Generate Actions */}
          <Card>
            <CardHeader>
              <CardTitle>สร้างรายงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={generateReport}
                disabled={isGenerating}
                className="w-full"
              >
                <FileDown className="h-4 w-4 mr-2" />
                {isGenerating ? 'กำลังสร้าง...' : 'ดาวน์โหลดรายงาน'}
              </Button>
              
              <Separator />
              
              <Button
                onClick={generateCustomReport}
                disabled={isGenerating}
                variant="outline"
                className="w-full"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {isGenerating ? 'กำลังสร้าง...' : 'สร้างรายงานขั้นสูง'}
              </Button>

              {emailRecipients && (
                <p className="text-xs text-muted-foreground text-center">
                  รายงานจะถูกส่งไปยัง {emailRecipients.split(',').length} ที่อยู่อีเมล
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>สถิติด่วน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">โปรเจกต์ทั้งหมด</span>
                <span className="font-medium">42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">กำลังดำเนินการ</span>
                <span className="font-medium">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">เสร็จสิ้นแล้ว</span>
                <span className="font-medium">24</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ความคืบหน้าเฉลี่ย</span>
                <span className="font-medium">73%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
