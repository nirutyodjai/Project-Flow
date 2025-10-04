/**
 * Project Timeline Component
 * แสดง Timeline โครงการที่กำลังดำเนินการ
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

interface TimelineProject {
  id: string;
  name: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'delayed';
  date: Date;
  daysLeft?: number;
  progress?: number;
}

export function ProjectTimeline() {
  const projects: TimelineProject[] = [
    {
      id: '1',
      name: 'โครงการก่อสร้างอาคารสำนักงาน A',
      status: 'in-progress',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      daysLeft: 7,
      progress: 65,
    },
    {
      id: '2',
      name: 'โครงการจัดซื้อวัสดุไฟฟ้า',
      status: 'upcoming',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      daysLeft: 14,
      progress: 0,
    },
    {
      id: '3',
      name: 'โครงการปรับปรุงระบบประปา',
      status: 'delayed',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      daysLeft: -2,
      progress: 45,
    },
    {
      id: '4',
      name: 'โครงการติดตั้งระบบรักษาความปลอดภัย',
      status: 'completed',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      progress: 100,
    },
  ];

  const getStatusConfig = (status: TimelineProject['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          badge: 'เสร็จสิ้น',
          badgeVariant: 'default' as const,
        };
      case 'in-progress':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          badge: 'กำลังดำเนินการ',
          badgeVariant: 'default' as const,
        };
      case 'delayed':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          badge: 'เลยกำหนด',
          badgeVariant: 'destructive' as const,
        };
      case 'upcoming':
        return {
          icon: Calendar,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          badge: 'กำลังจะถึง',
          badgeVariant: 'secondary' as const,
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Timeline โครงการ
            </CardTitle>
            <CardDescription>
              โครงการที่กำลังดำเนินการและกำลังจะถึง
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects">
              ดูทั้งหมด
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project, index) => {
            const config = getStatusConfig(project.status);
            const Icon = config.icon;

            return (
              <div key={project.id} className="relative">
                {/* Timeline Line */}
                {index < projects.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                )}

                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center z-10`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{project.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {project.date.toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Badge variant={config.badgeVariant}>
                        {config.badge}
                      </Badge>
                    </div>

                    {/* Progress */}
                    {project.progress !== undefined && project.status !== 'completed' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">ความคืบหน้า</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1.5" />
                      </div>
                    )}

                    {/* Days Left */}
                    {project.daysLeft !== undefined && project.status !== 'completed' && (
                      <div className="mt-2">
                        <span className={`text-xs font-medium ${
                          project.daysLeft < 0 
                            ? 'text-red-600' 
                            : project.daysLeft <= 3 
                            ? 'text-orange-600' 
                            : 'text-muted-foreground'
                        }`}>
                          {project.daysLeft < 0 
                            ? `เลยกำหนด ${Math.abs(project.daysLeft)} วัน`
                            : `เหลืออีก ${project.daysLeft} วัน`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xl font-bold text-green-600">
                {stats.winRate}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-xl font-bold text-blue-600">
                {stats.wonProjects}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">ชนะ</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="text-xl font-bold text-purple-600">
                {stats.avgProfit}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">กำไร</p>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-purple-900">AI แนะนำ</p>
              <p className="text-xs text-purple-700 mt-1">
                หมวด "{stats.topCategory}" มี Win Rate สูงถึง {stats.topCategoryWinRate}% 
                แนะนำให้เพิ่มการเสนอราคาในหมวดนี้
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
