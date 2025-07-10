'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, Pie } from 'lucide-react';
import { findRelatedAnalyses, getProjectStatistics } from '@/services/analysis-data';

interface AnalysisHistoryProps {
  projectType?: string | null;
  keywords?: string[];
}

export default function AnalysisHistory({ projectType, keywords = [] }: AnalysisHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [relatedAnalyses, setRelatedAnalyses] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<{
    avgWinProbability: number;
    avgEstimatedProfit: number;
    sampleSize: number;
  }>({ avgWinProbability: 0, avgEstimatedProfit: 0, sampleSize: 0 });

  // โหลดข้อมูลการวิเคราะห์ที่เกี่ยวข้อง
  useEffect(() => {
    const loadData = async () => {
      if (keywords.length === 0) return;
      
      setIsLoading(true);
      try {
        const analyses = await findRelatedAnalyses(keywords, 5);
        setRelatedAnalyses(analyses);
        
        const stats = await getProjectStatistics(projectType || null, null);
        setStatistics(stats);
      } catch (error) {
        console.error('Error loading analysis history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [keywords, projectType]);

  if (keywords.length === 0 || relatedAnalyses.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">การวิเคราะห์ที่เกี่ยวข้อง</CardTitle>
          <Badge variant="outline" className="text-xs">
            {relatedAnalyses.length} รายการ
          </Badge>
        </div>
        <CardDescription>
          ข้อมูลจากการวิเคราะห์โครงการในอดีตที่เกี่ยวข้องกับการค้นหานี้
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="insights">
          <TabsList className="mb-4">
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              ภาพรวม
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <LineChart className="h-4 w-4" />
              ประวัติการวิเคราะห์
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1">
              <Pie className="h-4 w-4" />
              สถิติ
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card/60 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">โอกาสชนะเฉลี่ย</div>
                    <div className="text-2xl font-bold">{statistics.avgWinProbability.toFixed(1)}%</div>
                  </div>
                  <div className="bg-card/60 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">กำไรเฉลี่ย</div>
                    <div className="text-2xl font-bold text-green-500">{statistics.avgEstimatedProfit.toFixed(1)}%</div>
                  </div>
                </div>
                
                <div className="bg-card/60 p-4 rounded-lg">
                  <div className="text-sm font-medium mb-2">ปัจจัยความสำเร็จที่พบบ่อย</div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                      ประสบการณ์ในโครงการที่คล้ายกัน
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                      การเสนอราคาที่แข่งขันได้
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                      ความเชี่ยวชาญเฉพาะทาง
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="space-y-3">
                {relatedAnalyses.map((analysis, index) => (
                  <div key={index} className="bg-card/60 p-3 rounded-lg text-sm">
                    <div className="flex items-start justify-between">
                      <div className="font-medium">{analysis.projectName}</div>
                      <Badge variant="outline" className="text-xs">
                        {analysis.organizationType}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {analysis.analysisText.length > 100
                        ? analysis.analysisText.slice(0, 100) + '...'
                        : analysis.analysisText}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span>โอกาสชนะ: <span className="font-medium">{analysis.winProbability}%</span></span>
                        <span className="text-muted-foreground">|</span>
                        <span>กำไร: <span className="font-medium text-green-500">{analysis.estimatedProfit}%</span></span>
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(analysis.analysisTimestamp).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stats">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">กำลังโหลดข้อมูล...</div>
            ) : (
              <div className="space-y-4">
                <div className="bg-card/60 p-4 rounded-lg">
                  <div className="text-sm font-medium mb-2">ขนาดของข้อมูล</div>
                  <div className="text-2xl font-bold">{statistics.sampleSize} โครงการ</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    จำนวนโครงการที่ใช้ในการคำนวณสถิติ
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card/60 p-4 rounded-lg">
                    <div className="text-sm font-medium mb-2">ช่วงโอกาสชนะ</div>
                    <div className="text-lg font-bold">
                      {Math.max(statistics.avgWinProbability - 10, 30).toFixed(0)}% - {Math.min(statistics.avgWinProbability + 10, 90).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-card/60 p-4 rounded-lg">
                    <div className="text-sm font-medium mb-2">ช่วงกำไรที่คาดการณ์</div>
                    <div className="text-lg font-bold text-green-500">
                      {Math.max(statistics.avgEstimatedProfit - 3, 8).toFixed(0)}% - {Math.min(statistics.avgEstimatedProfit + 3, 25).toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground text-center">
                  ข้อมูลนี้ถูกปรับปรุงเมื่อ {new Date().toLocaleTimeString('th-TH')}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
