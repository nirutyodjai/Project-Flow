'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bot, Search, Plus, Database, RefreshCw, Clock } from 'lucide-react';
import { CountdownTimer } from '@/components/countdown-timer';

export default function AutoProcurementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [maxProjects, setMaxProjects] = useState(5);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = [
    'เทคโนโลยีสารสนเทศ',
    'ก่อสร้าง',
    'การแพทย์',
    'การศึกษา',
    'พลังงาน',
    'คมนาคม',
    'เกษตร',
    'สิ่งแวดล้อม'
  ];

  const handleGoBack = () => {
    router.push('/procurement');
  };

  const handleAutoGenerate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/auto-procurement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxProjects,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลได้');
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "สำเร็จ!",
        description: `AI ได้ดึงข้อมูลโครงการใหม่ ${data.newProjects} โครงการแล้ว`,
      });

    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลโครงการได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleGoBack}>
            ← กลับ
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span>AI ดึงข้อมูลอัตโนมัติ</span>
            </h1>
            <p className="text-gray-600 mt-1">
              ให้ AI ค้นหาและเพิ่มข้อมูลโครงการประมูลใหม่อัตโนมัติ
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* การตั้งค่า */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>การตั้งค่าการดึงข้อมูล</span>
            </CardTitle>
            <CardDescription>
              กำหนดเงื่อนไขสำหรับ AI ในการค้นหาข้อมูลโครงการ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* จำนวนโครงการ */}
            <div>
              <label className="block text-sm font-medium mb-2">
                จำนวนโครงการที่ต้องการ
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={maxProjects}
                onChange={(e) => setMaxProjects(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                แนะนำ 5-10 โครงการต่อครั้ง
              </p>
            </div>

            {/* หมวดหมู่ */}
            <div>
              <label className="block text-sm font-medium mb-2">
                หมวดหมู่โครงการ (เลือกได้หลายหมวด)
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                หากไม่เลือก AI จะสร้างโครงการหลากหลายหมวดหมู่
              </p>
            </div>

            {/* ปุ่มเริ่มการทำงาน */}
            <Button 
              onClick={handleAutoGenerate} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI กำลังดึงข้อมูล...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  เริ่ม AI ดึงข้อมูลอัตโนมัติ
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ผลลัพธ์ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>ผลลัพธ์การดึงข้อมูล</span>
            </CardTitle>
            <CardDescription>
              ผลลัพธ์จากการที่ AI ค้นหาและเพิ่มข้อมูลโครงการ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>กดปุ่ม "เริ่ม AI ดึงข้อมูลอัตโนมัติ" เพื่อเริ่มต้น</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-gray-600">AI กำลังค้นหาและวิเคราะห์ข้อมูลโครงการ...</p>
                <p className="text-sm text-gray-500 mt-2">
                  กระบวนการนี้อาจใช้เวลาสักครู่
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* สรุปผลลัพธ์ */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">สรุปผลลัพธ์</h4>
                  <p className="text-green-700 text-sm mb-3">{result.summary}</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded p-3">
                      <div className="text-2xl font-bold text-blue-600">{result.totalProjects}</div>
                      <div className="text-xs text-gray-600">โครงการทั้งหมด</div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-2xl font-bold text-green-600">{result.newProjects}</div>
                      <div className="text-xs text-gray-600">โครงการใหม่</div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-2xl font-bold text-orange-600">{result.duplicateProjects}</div>
                      <div className="text-xs text-gray-600">โครงการซ้ำ</div>
                    </div>
                  </div>
                </div>

                {/* รายการโครงการใหม่ */}
                {result.projects && result.projects.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">โครงการใหม่ที่เพิ่ม ({result.projects.length})</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {result.projects.map((project: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded p-3 space-y-2">
                          <div className="font-medium text-sm">{project.name}</div>
                          <div className="text-xs text-gray-600">
                            {project.organization} • {project.budget} บาท
                          </div>
                          
                          {/* Countdown Timer สำหรับวันที่ยื่นซอง */}
                          {project.bidSubmissionDeadline && (
                            <div className="mt-2">
                              <CountdownTimer 
                                deadline={project.bidSubmissionDeadline}
                                label="ยื่นซองประมูล"
                                className="text-xs"
                              />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-xs">
                              {project.category}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              {project.bidSubmissionDeadline && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="mr-1 h-3 w-3" />
                                  มีกำหนดส่ง
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {project.procurementSite}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ปุ่มดำเนินการเพิ่มเติม */}
                <div className="flex space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/procurement')}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    ดูโครงการทั้งหมด
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/procurement/seed')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    จัดการข้อมูล
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* คำแนะนำ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">วิธีการทำงานของ AI อัตโนมัติ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🔍 ขั้นตอนการทำงาน</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>AI วิเคราะห์เงื่อนไขที่กำหนด</li>
                <li>สร้างโครงการประมูลที่สมจริง</li>
                <li>ตรวจสอบข้อมูลซ้ำกับฐานข้อมูล</li>
                <li>บันทึกโครงการใหม่อัตโนมัติ</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎯 ข้อมูลที่ AI จะสร้าง</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>ชื่อโครงการและรายละเอียด</li>
                <li>หน่วยงานและข้อมูลติดต่อ</li>
                <li>งบประมาณที่สมเหตุสมผล</li>
                <li>กำหนดเวลาและเงื่อนไข</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
