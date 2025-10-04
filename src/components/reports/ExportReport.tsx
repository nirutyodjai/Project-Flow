/**
 * Export Report Component
 * ส่งออกรายงานในรูปแบบต่างๆ
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Calendar,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ExportReport() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState('projects');
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState('30days');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // TODO: Generate report
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'ส่งออกสำเร็จ',
        description: `รายงาน${reportType} (${format.toUpperCase()}) พร้อมดาวน์โหลดแล้ว`,
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถส่งออกรายงานได้',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const reportTypes = [
    { value: 'projects', label: 'รายงานโครงการ', icon: FileText },
    { value: 'quotations', label: 'รายงานใบเสนอราคา', icon: FileSpreadsheet },
    { value: 'analytics', label: 'รายงาน Win Rate', icon: FileText },
    { value: 'materials', label: 'รายงานวัสดุและราคา', icon: FileSpreadsheet },
    { value: 'financial', label: 'รายงานการเงิน', icon: FileText },
  ];

  const formats = [
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet },
    { value: 'json', label: 'JSON', icon: FileJson },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          ส่งออกรายงาน
        </CardTitle>
        <CardDescription>
          ส่งออกรายงานในรูปแบบต่างๆ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type */}
        <div className="space-y-3">
          <Label>ประเภทรายงาน</Label>
          <RadioGroup value={reportType} onValueChange={setReportType}>
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <Label
                    htmlFor={type.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                    {type.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Format */}
        <div className="space-y-2">
          <Label>รูปแบบไฟล์</Label>
          <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
            {formats.map((fmt) => {
              const Icon = fmt.icon;
              return (
                <div key={fmt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={fmt.value} id={fmt.value} />
                  <Label
                    htmlFor={fmt.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                    {fmt.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label htmlFor="dateRange">ช่วงเวลา</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger id="dateRange">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 วันล่าสุด</SelectItem>
              <SelectItem value="30days">30 วันล่าสุด</SelectItem>
              <SelectItem value="90days">90 วันล่าสุด</SelectItem>
              <SelectItem value="thismonth">เดือนนี้</SelectItem>
              <SelectItem value="lastmonth">เดือนที่แล้ว</SelectItem>
              <SelectItem value="thisyear">ปีนี้</SelectItem>
              <SelectItem value="all">ทั้งหมด</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preview */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">ตัวอย่าง:</p>
          <p className="text-xs text-muted-foreground">
            {reportTypes.find(t => t.value === reportType)?.label} - {dateRange} - {format.toUpperCase()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ไฟล์: report_{reportType}_{dateRange}.{format}
          </p>
        </div>

        {/* Export Button */}
        <Button onClick={handleExport} disabled={exporting} className="w-full">
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              กำลังสร้างรายงาน...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              ส่งออกรายงาน
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
