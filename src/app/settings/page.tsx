
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Github, Bell, User, Database, Download } from 'lucide-react';
import Image from 'next/image';
import { DataExportImport } from '@/components/data-export-import';
import { PerformanceWidget } from '@/components/performance-widget';

export default function SettingsPage() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="ตั้งค่า"
        description="จัดการข้อมูลส่วนตัว การแจ้งเตือน และการเชื่อมต่อต่างๆ ของคุณ"
      />
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User /> โปรไฟล์</CardTitle>
            <CardDescription>
              ข้อมูลนี้จะแสดงในโปรไฟล์ของคุณและส่วนอื่นๆ ของแอปพลิเคชัน
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <Image src="https://placehold.co/100x100.png" alt="User" width={80} height={80} data-ai-hint="person face" />
                <AvatarFallback>T</AvatarFallback>
              </Avatar>
              <Button variant="outline">เปลี่ยนรูปภาพ</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">ชื่อที่แสดง</Label>
                <Input id="displayName" defaultValue="ธนพล" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input id="email" type="email" defaultValue="thanapon@example.com" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">บริษัท</Label>
                <Input id="company" defaultValue="ProjectFlow AI Co., Ltd." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <Input id="phone" defaultValue="081-234-5678" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button>บันทึกการเปลี่ยนแปลง</Button>
          </CardFooter>
        </Card>

        {/* GitHub Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Github /> การเชื่อมต่อ</CardTitle>
            <CardDescription>
              เชื่อมต่อกับบริการอื่นๆ เพื่อเพิ่มประสิทธิภาพการทำงาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                    <Github className="h-8 w-8 text-foreground" />
                    <div>
                        <h4 className="font-semibold">GitHub</h4>
                        <p className="text-sm text-muted-foreground">ยังไม่ได้เชื่อมต่อ</p>
                    </div>
                </div>
                <Button>เชื่อมต่อ</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell /> การแจ้งเตือน</CardTitle>
            <CardDescription>
              เลือกวิธีการรับการแจ้งเตือนจากเรา
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">การแจ้งเตือนทางอีเมล</h4>
                <p className="text-sm text-muted-foreground">รับข่าวสารอัปเดตและสรุปกิจกรรมต่างๆ</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">แจ้งเตือนในแอป</h4>
                <p className="text-sm text-muted-foreground">แสดงการแจ้งเตือนสำหรับกิจกรรมที่สำคัญ</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <DataExportImport />

        {/* Performance */}
        <PerformanceWidget />
      </main>
    </div>
  );
}
