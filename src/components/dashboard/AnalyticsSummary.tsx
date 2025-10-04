/**
 * Analytics Summary Component
 * สรุปสถิติและ Analytics แบบย่อ
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  DollarSign,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export function AnalyticsSummary() {
  const stats = {
    winRate: 68.5,
    winRateTrend: 5.2,
    totalProjects: 42,
    wonProjects: 29,
    lostProjects: 13,
    avgProfit: 14.8,
    profitTrend: 3.1,
    topCategory: 'ก่อสร้าง',
    topCategoryWinRate: 75.0,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Win Rate Analytics
            </CardTitle>
            <CardDescription>
              สรุปอัตราการชนะงานและผลประกอบการ
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/analytics">
              ดูทั้งหมด
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Win Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Win Rate</span>
              <Badge variant="default" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats.winRateTrend}%
              </Badge>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {stats.winRate}%
            </span>
          </div>
          <Progress value={stats.winRate} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {stats.wonProjects} ชนะ / {stats.totalProjects} โครงการทั้งหมด
          </p>
        </div>

        {/* Profit Margin */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Profit Margin</span>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats.profitTrend}%
              </Badge>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {stats.avgProfit}%
            </span>
          </div>
          <Progress value={stats.avgProfit * 5} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            กำไรเฉลี่ยต่อโครงการ
          </p>
        </div>

        {/* Top Category */}
        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">หมวดหมู่ที่ชนะบ่อยที่สุด</p>
              <p className="font-bold text-lg">{stats.topCategory}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {stats.topCategoryWinRate}%
              </p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <Trophy className="h-4 w-4" />
              <span className="text-xl font-bold">{stats.wonProjects}</span>
            </div>
            <p className="text-xs text-muted-foreground">ชนะ</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xl font-bold">{stats.lostProjects}</span>
            </div>
            <p className="text-xs text-muted-foreground">แพ้</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xl font-bold">{stats.avgProfit}%</span>
            </div>
            <p className="text-xs text-muted-foreground">กำไร</p>
          </div>
        </div>

        {/* AI Insight */}
        <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-purple-900">AI Insight</p>
            <p className="text-xs text-purple-700 mt-1">
              Win Rate ของคุณสูงกว่าค่าเฉลี่ย 15% และมีแนวโน้มเพิ่มขึ้นต่อเนื่อง 
              แนะนำให้เพิ่มการเสนอราคาในหมวด "{stats.topCategory}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
