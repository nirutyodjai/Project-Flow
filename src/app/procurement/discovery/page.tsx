'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bot, Search, Plus, Database, RefreshCw, ExternalLink, Eye, Clock, Globe } from 'lucide-react';
import { CountdownTimer } from '@/components/countdown-timer';

export default function WebsiteDiscoveryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [maxWebsites, setMaxWebsites] = useState(6);
  const [customSearchTerms, setCustomSearchTerms] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = [
    'ก่อสร้าง',
    'IT',
    'การแพทย์',
    'พลังงาน',
    'การศึกษา',
    'คมนาคม',
    'สิ่งแวดล้อม',
    'เกษตร'
  ];

  const handleGoBack = () => {
    router.push('/procurement');
  };

  const handleDiscoverWebsites = async () => {
    setLoading(true);
    setResult(null);

    try {
      const searchTerms = customSearchTerms 
        ? customSearchTerms.split('\n').filter(term => term.trim()) 
        : undefined;

      const response = await fetch('/api/ai/website-discovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxWebsites,
          searchTerms,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถค้นหาเว็บไซต์ได้');
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "สำเร็จ!",
        description: `AI พบเว็บไซต์ประมูลใหม่ ${data.newWebsites} เว็บไซต์ และโครงการใหม่ ${data.totalProjects} โครงการ`,
      });

    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถค้นหาเว็บไซต์ได้ กรุณาลองใหม่อีกครั้ง",
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
              <Globe className="h-8 w-8 text-green-600" />
              <span>AI ค้นหาเว็บไซต์ประมูล</span>
            </h1>
            <p className="text-gray-600 mt-1">
              ให้ AI ค้นหาเว็บไซต์ประมูลใหม่และดึงข้อมูลโครงการอัตโนมัติ
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* การตั้งค่าการค้นหา */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>การตั้งค่าการค้นหา</span>
            </CardTitle>
            <CardDescription>
              กำหนดเงื่อนไขสำหรับ AI ในการค้นหาเว็บไซต์ประมูลใหม่
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* จำนวนเว็บไซต์ */}
            <div>
              <label className="block text-sm font-medium mb-2">
                จำนวนเว็บไซต์ที่ต้องการค้นหา
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={maxWebsites}
                onChange={(e) => setMaxWebsites(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                แนะนำ 3-6 เว็บไซต์ต่อครั้ง
              </p>
            </div>

            {/* คำค้นหาเพิ่มเติม */}
            <div>
              <label className="block text-sm font-medium mb-2">
                คำค้นหาเพิ่มเติม (แยกบรรทัด)
              </label>
              <Textarea
                value={customSearchTerms}
                onChange={(e) => setCustomSearchTerms(e.target.value)}
                placeholder="ระบบประมูล โรงพยาบาล&#10;จัดซื้อ มหาวิทยาลัย&#10;tender government"
                rows={4}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                หากไม่ระบุ AI จะใช้คำค้นหาเริ่มต้น
              </p>
            </div>

            {/* หมวดหมู่ */}
            <div>
              <label className="block text-sm font-medium mb-2">
                หมวดหมู่ที่สนใจ (เลือกได้หลายหมวด)
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
            </div>

            {/* ปุ่มเริ่มการทำงาน */}
            <Button 
              onClick={handleDiscoverWebsites} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI กำลังค้นหาเว็บไซต์...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  เริ่มค้นหาเว็บไซต์ประมูล
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ผลลัพธ์ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>เว็บไซต์ที่ค้นพบ</span>
            </CardTitle>
            <CardDescription>
              เว็บไซต์ประมูลใหม่ที่ AI ค้นพบและโครงการที่สแกนได้
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <div className="text-center py-8 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>กดปุ่ม "เริ่มค้นหาเว็บไซต์ประมูล" เพื่อเริ่มต้น</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-green-600" />
                <p className="text-gray-600">AI กำลังค้นหาเว็บไซต์ประมูลใหม่...</p>
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
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white rounded p-3">
                      <div className="text-2xl font-bold text-green-600">{result.newWebsites}</div>
                      <div className="text-xs text-gray-600">เว็บไซต์ใหม่</div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-2xl font-bold text-blue-600">{result.totalProjects}</div>
                      <div className="text-xs text-gray-600">โครงการใหม่</div>
                    </div>
                  </div>
                </div>

                {/* รายการเว็บไซต์ใหม่ */}
                {result.discoveredWebsites && result.discoveredWebsites.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">เว็บไซต์ประมูลใหม่ ({result.discoveredWebsites.length})</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {result.discoveredWebsites.map((website: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded p-3">
                          <div className="font-medium text-sm flex items-center justify-between">
                            <span>{website.name}</span>
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {website.description}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-xs">
                              {website.type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {website.projectCount} โครงการ
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {website.category.slice(0, 3).map((cat: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                            {website.category.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{website.category.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* รายการโครงการใหม่ */}
                {result.scannedProjects && result.scannedProjects.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">โครงการที่สแกนได้ ({result.scannedProjects.length})</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {result.scannedProjects.slice(0, 5).map((project: any, index: number) => (
                        <div key={index} className="bg-blue-50 rounded p-3 space-y-2">
                          <div className="font-medium text-sm">{project.title}</div>
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
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              จาก: {project.sourceWebsite}
                            </div>
                            {project.bidSubmissionDeadline && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="mr-1 h-3 w-3" />
                                มีกำหนดส่ง
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {result.scannedProjects.length > 5 && (
                        <div className="text-center text-sm text-gray-500">
                          และอีก {result.scannedProjects.length - 5} โครงการ...
                        </div>
                      )}
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
                    onClick={() => router.push('/procurement/auto')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    AI อัตโนมัติ
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
          <CardTitle className="text-lg">วิธีการทำงานของ AI ค้นหาเว็บไซต์</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🔍 ขั้นตอนการค้นหา</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>AI ค้นหาเว็บไซต์ประมูลใหม่</li>
                <li>ตรวจสอบความน่าเชื่อถือ</li>
                <li>สแกนโครงการจากเว็บไซต์</li>
                <li>บันทึกข้อมูลลงระบบ</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎯 ประเภทเว็บไซต์ที่ค้นหา</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>หน่วยงานราชการและรัฐวิสาหกิจ</li>
                <li>มหาวิทยาลัยและสถาบันการศึกษา</li>
                <li>โรงพยาบาลและหน่วยงานสาธารณสุข</li>
                <li>บริษัทเอกชนและ Supplier Portal</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
