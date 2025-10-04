'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Briefcase, Users, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DataManager } from '@/lib/data-manager';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down';
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    change: number;
  };
  contacts: {
    total: number;
    customers: number;
    suppliers: number;
  };
  timeline: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

/**
 * 📊 Analytics Dashboard
 * แสดงการวิเคราะห์ข้อมูลแบบละเอียด
 */
export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenue: { total: 0, change: 0, trend: 'up' },
    projects: { total: 0, active: 0, completed: 0, change: 0 },
    contacts: { total: 0, customers: 0, suppliers: 0 },
    timeline: { thisMonth: 0, lastMonth: 0, growth: 0 },
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const stats = DataManager.getStatistics();
    const projects = DataManager.getProjects();
    const contacts = DataManager.getContacts();

    // Calculate revenue
    const totalRevenue = projects.reduce((sum, p) => {
      const budget = Number(p.budget.replace(/,/g, ''));
      return sum + (p.status === 'completed' ? budget : 0);
    }, 0);

    // Calculate month comparison
    const now = new Date();
    const thisMonth = projects.filter(p => {
      const created = new Date(p.createdAt);
      return created.getMonth() === now.getMonth();
    }).length;

    const lastMonth = projects.filter(p => {
      const created = new Date(p.createdAt);
      return created.getMonth() === now.getMonth() - 1;
    }).length;

    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    setAnalytics({
      revenue: {
        total: totalRevenue,
        change: 12.5,
        trend: 'up',
      },
      projects: {
        total: stats.totalProjects,
        active: stats.activeProjects,
        completed: stats.completedProjects,
        change: 8.2,
      },
      contacts: {
        total: stats.totalContacts,
        customers: contacts.filter(c => c.type === 'ลูกค้า').length,
        suppliers: contacts.filter(c => c.type === 'ซัพพลายเออร์').length,
      },
      timeline: {
        thisMonth,
        lastMonth,
        growth,
      },
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">รายได้รวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.revenue.total)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {analytics.revenue.trend === 'up' ? (
                <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={cn(
                analytics.revenue.trend === 'up' ? 'text-green-500' : 'text-red-500'
              )}>
                {analytics.revenue.change}%
              </span>
              <span className="ml-1">จากเดือนที่แล้ว</span>
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">โครงการ</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.projects.total}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="text-green-500">{analytics.projects.active} กำลังดำเนินการ</span>
              <span className="mx-1">•</span>
              <span>{analytics.projects.completed} เสร็จสิ้น</span>
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">คู่ค้า</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.contacts.total}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>{analytics.contacts.customers} ลูกค้า</span>
              <span className="mx-1">•</span>
              <span>{analytics.contacts.suppliers} ซัพพลายเออร์</span>
            </div>
          </CardContent>
        </Card>

        {/* Growth */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">การเติบโต</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.timeline.growth > 0 ? '+' : ''}{analytics.timeline.growth.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>เทียบกับเดือนก่อน</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle>สถานะโครงการ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">กำลังดำเนินการ</span>
                <span className="text-sm font-semibold">
                  {analytics.projects.active} / {analytics.projects.total}
                </span>
              </div>
              <Progress 
                value={(analytics.projects.active / analytics.projects.total) * 100} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">เสร็จสิ้น</span>
                <span className="text-sm font-semibold">
                  {analytics.projects.completed} / {analytics.projects.total}
                </span>
              </div>
              <Progress 
                value={(analytics.projects.completed / analytics.projects.total) * 100} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">อัตราความสำเร็จ</span>
                <span className="text-sm font-semibold">
                  {((analytics.projects.completed / analytics.projects.total) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={(analytics.projects.completed / analytics.projects.total) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              เปรียบเทียบรายเดือน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">เดือนนี้</span>
                <span className="text-2xl font-bold">{analytics.timeline.thisMonth}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">เดือนที่แล้ว</span>
                <span className="text-2xl font-bold">{analytics.timeline.lastMonth}</span>
              </div>
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                analytics.timeline.growth >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
              )}>
                <span className="text-sm font-medium">การเติบโต</span>
                <div className="flex items-center gap-2">
                  {analytics.timeline.growth >= 0 ? (
                    <ArrowUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDown className="h-5 w-5 text-red-500" />
                  )}
                  <span className={cn(
                    "text-2xl font-bold",
                    analytics.timeline.growth >= 0 ? 'text-green-500' : 'text-red-500'
                  )}>
                    {analytics.timeline.growth > 0 ? '+' : ''}{analytics.timeline.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
