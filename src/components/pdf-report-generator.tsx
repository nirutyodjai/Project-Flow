'use client';

import React, { useState } from 'react';
import { FileText, Download, Printer, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/lib/data-manager';
import { useToast } from '@/hooks/use-toast';

interface PDFReportGeneratorProps {
  project: Project;
}

/**
 * 📄 PDF Report Generator
 * สร้างรายงานโครงการเป็น PDF
 */
export function PDFReportGenerator({ project }: PDFReportGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setGenerating(true);

    try {
      // สร้าง HTML สำหรับ PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>รายงานโครงการ - ${project.name}</title>
          <style>
            body {
              font-family: 'Sarabun', sans-serif;
              padding: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #2563eb;
            }
            h1 {
              color: #1e40af;
              margin: 20px 0;
            }
            .section {
              margin: 30px 0;
            }
            .section-title {
              background: #2563eb;
              color: white;
              padding: 10px 15px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            .info-row {
              display: flex;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              width: 200px;
              font-weight: bold;
              color: #6b7280;
            }
            .info-value {
              flex: 1;
            }
            .footer {
              margin-top: 60px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">⚡ ProjectFlow AI</div>
            <h1>รายงานโครงการ</h1>
            <p>${new Date().toLocaleDateString('th-TH', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>

          <div class="section">
            <div class="section-title">ข้อมูลโครงการ</div>
            <div class="info-row">
              <div class="info-label">ชื่อโครงการ:</div>
              <div class="info-value">${project.name}</div>
            </div>
            <div class="info-row">
              <div class="info-label">หน่วยงาน:</div>
              <div class="info-value">${project.organization}</div>
            </div>
            <div class="info-row">
              <div class="info-label">ประเภท:</div>
              <div class="info-value">${project.type}</div>
            </div>
            <div class="info-row">
              <div class="info-label">งบประมาณ:</div>
              <div class="info-value">฿${Number(project.budget.replace(/,/g, '')).toLocaleString()} บาท</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">ข้อมูลติดต่อ</div>
            <div class="info-row">
              <div class="info-label">ผู้ติดต่อ:</div>
              <div class="info-value">${project.contactPerson}</div>
            </div>
            <div class="info-row">
              <div class="info-label">เบอร์โทร:</div>
              <div class="info-value">${project.phone}</div>
            </div>
            <div class="info-row">
              <div class="info-label">ที่อยู่:</div>
              <div class="info-value">${project.address}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">กำหนดเวลา</div>
            <div class="info-row">
              <div class="info-label">กำหนดส่งเอกสาร:</div>
              <div class="info-value">${new Date(project.bidSubmissionDeadline).toLocaleDateString('th-TH')}</div>
            </div>
            <div class="info-row">
              <div class="info-label">สถานะ:</div>
              <div class="info-value">${project.status || 'ไม่ระบุ'}</div>
            </div>
          </div>

          <div class="footer">
            <p>สร้างโดย ProjectFlow AI - ระบบบริหารจัดการโครงการอัจฉริยะ</p>
            <p>www.projectflow.app</p>
          </div>
        </body>
        </html>
      `;

      // สร้าง Blob และดาวน์โหลด
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${project.id}-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'สร้างรายงานสำเร็จ!',
        description: 'ไฟล์ถูกดาวน์โหลดแล้ว (เปิดด้วยเบราว์เซอร์แล้วพิมพ์เป็น PDF)',
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างรายงานได้',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          สร้างรายงาน PDF
        </CardTitle>
        <CardDescription>
          สร้างรายงานโครงการเป็นไฟล์ PDF สวยงาม
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={generatePDF}
            disabled={generating}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {generating ? 'กำลังสร้าง...' : 'ดาวน์โหลด PDF'}
          </Button>
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            ดูตัวอย่าง
          </Button>
        </div>

        <div className="p-3 bg-muted rounded-lg text-sm">
          <p className="font-semibold mb-2">รายงานจะรวม:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>ข้อมูลโครงการครบถ้วน</li>
            <li>ข้อมูลติดต่อ</li>
            <li>กำหนดเวลา</li>
            <li>โลโก้บริษัท</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
