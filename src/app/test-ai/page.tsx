'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { findBiddableProjects } from '@/ai/flows/find-biddable-projects';
import { PageHeader } from '@/components/page-header';

export default function TestAIPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('โปรดระบุคำค้นหา');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      console.time('AI Search');
      const res = await findBiddableProjects({ query });
      console.timeEnd('AI Search');
      console.log('Search results:', res);
      setResults(res);
    } catch (e) {
      console.error('Error during search:', e);
      setError('เกิดข้อผิดพลาดในการค้นหา: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="ทดสอบ AI ค้นหาโครงการ"
        description="ทดสอบการค้นหาโครงการด้วย AI ที่ปรับปรุงใหม่"
      />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ทดสอบการค้นหา</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="พิมพ์คำค้นหา เช่น 'ก่อสร้าง', 'ระบบไฟฟ้า', 'ภาครัฐ'"
              className="flex-grow"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
            </Button>
          </div>
          
          {error && <div className="text-red-500">{error}</div>}
          
          <div className="border p-4 rounded-md bg-slate-50 min-h-[200px] overflow-auto">
            {loading ? (
              <div className="animate-pulse">กำลังค้นหาโครงการ...</div>
            ) : results ? (
              <div>
                <div className="mb-4">
                  <p><strong>แหล่งข้อมูล:</strong> {results.dataSource}</p>
                  <p><strong>จำนวนโครงการที่พบ:</strong> {results.projects.length}</p>
                </div>
                
                {results.projects.length > 0 ? (
                  <div className="space-y-4">
                    {results.projects.map((project: any, index: number) => (
                      <div key={index} className="border p-3 rounded-md bg-white">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <p className="text-sm text-gray-500">{project.organization} ({project.type})</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <strong>งบประมาณ:</strong> {project.budget}
                          </div>
                          <div>
                            <strong>โอกาสชนะ:</strong> {project.winProbability}%
                          </div>
                          <div>
                            <strong>กำไรที่คาดการณ์:</strong> {project.estimatedProfit}%
                          </div>
                          <div>
                            <strong>ราคาที่แนะนำ:</strong> {project.recommendedBidPrice}
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <strong>บทวิเคราะห์:</strong> {project.analysis}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center">ไม่พบโครงการที่ตรงกับเงื่อนไข</p>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-400">พิมพ์คำค้นหาและกด "ค้นหา" เพื่อเริ่มต้น</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
