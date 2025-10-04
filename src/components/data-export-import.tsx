'use client';

import React, { useState } from 'react';
import { Download, Upload, FileJson, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataManager } from '@/lib/data-manager';
import { useToast } from '@/hooks/use-toast';

/**
 * 💾 Data Export/Import Component
 * ส่งออกและนำเข้าข้อมูลแบบ JSON
 */
export function DataExportImport() {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    try {
      const data = DataManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projectflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'ส่งออกข้อมูลสำเร็จ!',
        description: 'ไฟล์ถูกดาวน์โหลดแล้ว',
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถส่งออกข้อมูลได้',
        variant: 'destructive',
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = DataManager.importData(content);
        
        if (success) {
          toast({
            title: 'นำเข้าข้อมูลสำเร็จ!',
            description: 'ข้อมูลถูกโหลดแล้ว กำลังรีเฟรชหน้า...',
          });
          
          // Refresh page after 1 second
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          throw new Error('Import failed');
        }
      } catch (error) {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไฟล์ไม่ถูกต้องหรือเสียหาย',
          variant: 'destructive',
        });
      } finally {
        setImporting(false);
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="h-5 w-5" />
          สำรองและกู้คืนข้อมูล
        </CardTitle>
        <CardDescription>
          ส่งออกข้อมูลเพื่อสำรอง หรือนำเข้าข้อมูลจากไฟล์สำรอง
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-6 text-center" onClick={handleExport}>
              <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">ส่งออกข้อมูล</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ดาวน์โหลดข้อมูลทั้งหมดเป็นไฟล์ JSON
              </p>
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                ส่งออกเลย
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed hover:border-primary transition-colors">
            <CardContent className="p-6 text-center">
              <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">นำเข้าข้อมูล</h3>
              <p className="text-sm text-muted-foreground mb-4">
                กู้คืนข้อมูลจากไฟล์สำรอง
              </p>
              <label htmlFor="import-file">
                <Button className="w-full" disabled={importing} asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {importing ? 'กำลังนำเข้า...' : 'เลือกไฟล์'}
                  </span>
                </Button>
              </label>
              <input
                id="import-file"
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImport}
                disabled={importing}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">คำแนะนำ:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>สำรองข้อมูลเป็นประจำเพื่อความปลอดภัย</li>
                <li>เก็บไฟล์สำรองไว้ในที่ปลอดภัย</li>
                <li>การนำเข้าจะแทนที่ข้อมูลปัจจุบันทั้งหมด</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
