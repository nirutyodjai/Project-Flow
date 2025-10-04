/**
 * Category Analysis Component
 * วิเคราะห์ตามหมวดหมู่
 */

'use client';

import type { CategoryStats } from '@/types/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Building2, Zap, Droplet, Paintbrush, Trees, Wrench, Settings } from 'lucide-react';

interface CategoryAnalysisProps {
  categories: CategoryStats[];
  topCategories: CategoryStats[];
}

const categoryIcons = {
  construction: Building2,
  electrical: Zap,
  plumbing: Droplet,
  interior: Paintbrush,
  landscape: Trees,
  renovation: Wrench,
  maintenance: Settings,
  other: Settings,
};

const categoryLabels = {
  construction: 'ก่อสร้าง',
  electrical: 'ไฟฟ้า',
  plumbing: 'ประปา',
  interior: 'ตกแต่งภายใน',
  landscape: 'จัดสวน',
  renovation: 'ปรับปรุง',
  maintenance: 'บำรุงรักษา',
  other: 'อื่นๆ',
};

export function CategoryAnalysis({ categories, topCategories }: CategoryAnalysisProps) {
  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return 'text-green-600';
    if (winRate >= 50) return 'text-blue-600';
    if (winRate >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  const getWinRateBadge = (winRate: number) => {
    if (winRate >= 70) return 'default';
    if (winRate >= 50) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* All Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Win Rate ตามหมวดหมู่</CardTitle>
          <CardDescription>อัตราการชนะงานในแต่ละประเภท</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category.category];
            const label = categoryLabels[category.category];

            return (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${getWinRateColor(category.winRate)}`}>
                      {category.winRate.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({category.wonProjects}/{category.totalProjects})
                    </span>
                  </div>
                </div>
                <Progress value={category.winRate} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>มูลค่า: {(category.totalAmount / 1000000).toFixed(1)}M</span>
                  <span>กำไรเฉลี่ย: {category.profitMargin.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>หมวดหมู่ที่ชนะบ่อย</CardTitle>
          <CardDescription>Top 5 หมวดหมู่ที่มี Win Rate สูงสุด</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              ยังไม่มีข้อมูลเพียงพอ
            </p>
          ) : (
            topCategories.map((category, index) => {
              const Icon = categoryIcons[category.category];
              const label = categoryLabels[category.category];

              return (
                <div
                  key={category.category}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.totalProjects} โครงการ • {(category.totalAmount / 1000000).toFixed(1)}M บาท
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getWinRateBadge(category.winRate)}>
                      {category.winRate.toFixed(1)}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      กำไร {category.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
