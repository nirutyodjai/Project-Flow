/**
 * Win Rate Dashboard Component
 * แสดงสถิติ Win Rate และการวิเคราะห์ต่างๆ
 */

'use client';

import { useState, useEffect } from 'react';
import { AnalyticsService } from '@/services/analytics-service';
import type { WinRateAnalysis } from '@/types/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WinRateOverview } from './WinRateOverview';
import { CategoryAnalysis } from './CategoryAnalysis';
import { MonthlyTrends } from './MonthlyTrends';
import { ImprovementSuggestions } from './ImprovementSuggestions';
import { Loader2 } from 'lucide-react';

interface WinRateDashboardProps {
  userId: string;
}

export function WinRateDashboard({ userId }: WinRateDashboardProps) {
  const [analysis, setAnalysis] = useState<WinRateAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [userId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const data = await AnalyticsService.analyzeWinRate(userId);
      setAnalysis(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">กำลังวิเคราะห์ข้อมูล...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">เกิดข้อผิดพลาด: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">ไม่มีข้อมูล</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Win Rate Analytics</h2>
        <p className="text-muted-foreground">
          วิเคราะห์อัตราการชนะงานและประสิทธิภาพการทำงาน
        </p>
      </div>

      {/* Overview Cards */}
      <WinRateOverview stats={analysis.overall} />

      {/* Detailed Analysis */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">ตามหมวดหมู่</TabsTrigger>
          <TabsTrigger value="trends">แนวโน้มรายเดือน</TabsTrigger>
          <TabsTrigger value="improvements">คำแนะนำ</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <CategoryAnalysis 
            categories={analysis.byCategory}
            topCategories={analysis.topWinningCategories}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <MonthlyTrends monthlyStats={analysis.byMonth} />
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          <ImprovementSuggestions improvements={analysis.improvementAreas} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
