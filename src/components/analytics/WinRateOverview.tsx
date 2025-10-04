/**
 * Win Rate Overview Component
 * แสดงภาพรวม Win Rate
 */

'use client';

import type { WinRateStats } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, TrendingDown, Minus, DollarSign, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WinRateOverviewProps {
  stats: WinRateStats;
}

export function WinRateOverview({ stats }: WinRateOverviewProps) {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Win Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {getTrendIcon(stats.winRateTrend)}
            <span className={getTrendColor(stats.winRateTrend)}>
              {stats.winRateTrend === 'up' ? 'เพิ่มขึ้น' : stats.winRateTrend === 'down' ? 'ลดลง' : 'คงที่'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.wonProjects} / {stats.totalProjects} โครงการ
          </p>
        </CardContent>
      </Card>

      {/* Total Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">โครงการทั้งหมด</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProjects}</div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
            <div>
              <p className="text-green-600 font-medium">{stats.wonProjects}</p>
              <p className="text-muted-foreground">ชนะ</p>
            </div>
            <div>
              <p className="text-red-600 font-medium">{stats.lostProjects}</p>
              <p className="text-muted-foreground">แพ้</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">{stats.pendingProjects}</p>
              <p className="text-muted-foreground">รอผล</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Profit */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">กำไรรวม</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats.totalProfit / 1000000).toFixed(1)}M
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {getTrendIcon(stats.profitTrend)}
            <span className={getTrendColor(stats.profitTrend)}>
              {stats.profitTrend === 'up' ? 'เพิ่มขึ้น' : stats.profitTrend === 'down' ? 'ลดลง' : 'คงที่'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Margin เฉลี่ย: {stats.averageProfitMargin.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* Average Days */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">เวลาเฉลี่ย</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageDaysToComplete.toFixed(0)} วัน
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            เวลาทำงานเสร็จ
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            รอผล: {stats.averageDaysToWin.toFixed(0)} วัน
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
