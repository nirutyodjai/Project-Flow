'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, ExternalLink, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function WebsiteMonitorPage() {
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // จำลองข้อมูลเว็บไซต์ที่มีการติดตาม
  const mockWebsites = [
    {
      id: 1,
      name: "ระบบประมูลกรมทรัพยากรน้ำ",
      url: "https://www.dwr.go.th/procurement/",
      type: "ภาครัฐ",
      lastChecked: "2025-07-14T10:30:00Z",
      status: "active",
      newProjects: 3,
      totalProjects: 12,
      categories: ["ชลประทาน", "การจัดการน้ำ"],
      isNew: true
    },
    {
      id: 2,
      name: "ระบบประมูลโรงพยาบาลจุฬาลงกรณ์",
      url: "https://www.chulahospital.go.th/procurement/",
      type: "โรงพยาบาล",
      lastChecked: "2025-07-14T09:15:00Z",
      status: "active",
      newProjects: 2,
      totalProjects: 8,
      categories: ["อุปกรณ์การแพทย์", "เวชภัณฑ์"],
      isNew: true
    },
    {
      id: 3,
      name: "ซีพี ออลล์ ซัพพลายเออร์ พอร์ทัล",
      url: "https://supplier.cpall.co.th/",
      type: "เอกชน",
      lastChecked: "2025-07-14T08:45:00Z",
      status: "active",
      newProjects: 5,
      totalProjects: 25,
      categories: ["สินค้าอุปโภคบริโภค", "โลจิสติกส์"],
      isNew: false
    },
    {
      id: 4,
      name: "ระบบประมูลการไฟฟ้าฝ่ายผลิต",
      url: "https://www.egat.co.th/procurement/",
      type: "ภาครัฐ",
      lastChecked: "2025-07-14T07:20:00Z",
      status: "active",
      newProjects: 4,
      totalProjects: 18,
      categories: ["พลังงาน", "โรงไฟฟ้า"],
      isNew: true
    }
  ];

  useEffect(() => {
    // จำลองการโหลดข้อมูล
    setTimeout(() => {
      setWebsites(mockWebsites);
      setLoading(false);
    }, 1000);
  }, []);

  const formatLastChecked = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} นาทีที่แล้ว`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} ชั่วโมงที่แล้ว`;
    } else {
      return `${Math.floor(diffMinutes / 1440)} วันที่แล้ว`;
    }
  };

  const newWebsitesCount = websites.filter(w => w.isNew).length;
  const totalNewProjects = websites.reduce((sum, w) => sum + w.newProjects, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <span>ติดตามเว็บไซต์ประมูล</span>
          </h1>
          <p className="text-gray-600 mt-1">
            ติดตามเว็บไซต์ประมูลที่ AI ค้นพบและโครงการใหม่
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/procurement/discovery">
              <Globe className="mr-2 h-4 w-4" />
              ค้นหาเว็บไซต์ใหม่
            </Link>
          </Button>
        </div>
      </div>

      {/* สถิติรวม */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{websites.length}</div>
                <div className="text-sm text-gray-600">เว็บไซต์ทั้งหมด</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{newWebsitesCount}</div>
                <div className="text-sm text-gray-600">เว็บไซต์ใหม่</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{totalNewProjects}</div>
                <div className="text-sm text-gray-600">โครงการใหม่</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {websites.reduce((sum, w) => sum + w.totalProjects, 0)}
                </div>
                <div className="text-sm text-gray-600">โครงการทั้งหมด</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* รายการเว็บไซต์ */}
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">รายการเว็บไซต์ที่ติดตาม</h2>
          <Badge variant="outline">
            {websites.length} เว็บไซต์
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {websites.map((website) => (
            <Card key={website.id} className={website.isNew ? "border-green-200 bg-green-50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center space-x-2">
                      <span>{website.name}</span>
                      {website.isNew && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          ใหม่
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {website.url}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{website.type}</Badge>
                  <span className="text-sm text-gray-500">
                    ตรวจสอบ: {formatLastChecked(website.lastChecked)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white rounded p-2">
                    <div className="text-lg font-bold text-orange-600">{website.newProjects}</div>
                    <div className="text-xs text-gray-600">โครงการใหม่</div>
                  </div>
                  <div className="bg-white rounded p-2">
                    <div className="text-lg font-bold text-blue-600">{website.totalProjects}</div>
                    <div className="text-xs text-gray-600">รวมทั้งหมด</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">หมวดหมู่:</div>
                  <div className="flex flex-wrap gap-1">
                    {website.categories.map((category: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    ดูโครงการ
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    รายละเอียด
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* คำแนะนำ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">การติดตามเว็บไซต์อัตโนมัติ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🔄 การอัพเดตอัตโนมัติ</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>ตรวจสอบเว็บไซต์ทุก 6 ชั่วโมง</li>
                <li>แจ้งเตือนเมื่อมีโครงการใหม่</li>
                <li>สแกนเนื้อหาและจัดหมวดหมู่</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📊 การวิเคราะห์</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>วิเคราะห์แนวโน้มโครงการ</li>
                <li>จัดอันดับความน่าสนใจ</li>
                <li>เปรียบเทียบกับเงื่อนไขของคุณ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">⚡ การดำเนินการ</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>บันทึกโครงการที่สนใจ</li>
                <li>ส่งอีเมลแจ้งเตือน</li>
                <li>ลิงก์ไปยังเอกสารประกวดราคา</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
